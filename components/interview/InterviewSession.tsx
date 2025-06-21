import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Video, VideoOff, Volume2, VolumeX } from "lucide-react";
import {
  requestUserMedia,
  VideoRecorder,
  SpeechRecognitionUtil,
} from "@/lib/webrtc-utils";
import { useToast } from "@/components/ui/use-toast";
import { generateInterviewQuestion } from "@/lib/gemini-utils";
import type { SessionType } from "@/pages/Interview";
import { debounce } from "lodash";
import { saveSessionWithRecording } from "@/lib/db-service";
import { onAuthStateChanged } from "firebase/auth";
import app, { auth } from "@/firebase/config";
import { getDatabase, ref, set } from "firebase/database";

export interface SessionTypes {
  jobDescription?: string;
  role?: string;
  skillLevel?: string;
  transcript?: Array<{ question: string; answer: string }>;
  recording?: string[] | null;
  feedback?: {
    strengths: string[];
    improvements: string[];
    overallScore?: number;
    transcript?: Array<{ question: string; answer: string }>;
    recording?: string[] | null;
  };
  isCompleted?: boolean;
}

interface InterviewSessionProps {
  session: SessionType | null;
  setSession: React.Dispatch<React.SetStateAction<SessionType | null>>;
  isRecording: boolean;
  setIsRecording: React.Dispatch<React.SetStateAction<boolean>>;
  onComplete: (feedback: SessionType["feedback"]) => void;
}

const InterviewSession: React.FC<InterviewSessionProps> = ({
  session,
  setSession,
  isRecording,
  setIsRecording,
  onComplete,
}) => {
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [hasMediaPermission, setHasMediaPermission] = useState<boolean>(false);
  const [currentQuestion, setCurrentQuestion] = useState<string>("");
  const [userResponse, setUserResponse] = useState<string>("");
  const [micEnabled, setMicEnabled] = useState<boolean>(true);
  const [videoEnabled, setVideoEnabled] = useState<boolean>(true);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [aiResponse, setAiResponse] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [waitingForResponse, setWaitingForResponse] = useState<boolean>(false);
  const [conversation, setConversation] = useState<
    Array<{ role: string; content: string }>
  >([]);
  const [title, setTitle] = useState<string>("");
  const [hrCode, setHrCode] = useState<string>("");
  const [uid, setUid] = useState<string>("");

  const videoRef = useRef<HTMLVideoElement>(null);
  const recorderRef = useRef<VideoRecorder>(new VideoRecorder());
  const speechRecognitionRef = useRef<SpeechRecognitionUtil>(
    new SpeechRecognitionUtil()
  );
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const destinationNodeRef = useRef<MediaStreamAudioDestinationNode | null>(
    null
  );
  const userAudioSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const responseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSpeechRef = useRef<string>("");
  const hasStartedInterview = useRef<boolean>(false);
  const continueListeningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isFinishing, setIsFinishing] = useState<boolean>(false);
  const accumulatedSpeechRef = useRef<string>("");
  const db = getDatabase(app);
  const { toast } = useToast();
  const micIconRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUid(user.uid);
      } else {
        toast({
          title: "Authentication Error",
          description: "No user is signed in. Please log in.",
          variant: "destructive",
        });
        window.location.href = "/sign-in";
      }
    });
    return () => unsubscribe();
  }, []);

  const updateUserData = async (uid: string, title: string, hrCode: string) => {
    const key = hrCode + title;
    const userInterviewRef = ref(db, `user/${uid}/interViewRecords/${key}`);
    try {
      await set(userInterviewRef, true);
      localStorage.removeItem("title");
      localStorage.removeItem("hr_code");
      console.log("Interview record updated successfully");
    } catch (error) {
      console.error("Error updating interview record:", error);
      throw error;
    }
  };

  useEffect(() => {
    const code = localStorage.getItem("hr_code") || "";
    const title = localStorage.getItem("title") || "";
    const actualTitle = title.replace(/\s/g, "");
    console.log(code, actualTitle);
    setHrCode(code);
    setTitle(actualTitle);
  }, []);

  useEffect(() => {
    console.log(
      "useEffect triggered, hasStartedInterview:",
      hasStartedInterview.current
    );
    const setupMedia = async () => {
      if (!window.MediaRecorder) {
        toast({
          title: "Browser Not Supported",
          description:
            "Your browser does not support video recording. Please use Chrome or Firefox.",
          variant: "destructive",
        });
        setHasMediaPermission(false);
        return;
      }

      try {
        const stream = await requestUserMedia();
        setMediaStream(stream);
        setHasMediaPermission(true);

        console.log("Media stream acquired:", stream, stream.getTracks());
        stream.getTracks().forEach((track) => {
          console.log(
            `Track ${track.kind}: enabled=${track.enabled}, readyState=${track.readyState}`
          );
        });

        audioContextRef.current = new AudioContext();
        destinationNodeRef.current =
          audioContextRef.current.createMediaStreamDestination();
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 512;
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const userAudioTracks = stream.getAudioTracks();
        if (userAudioTracks.length > 0) {
          userAudioSourceRef.current =
            audioContextRef.current.createMediaStreamSource(
              new MediaStream([userAudioTracks[0]])
            );
          if (userAudioSourceRef.current) {
            userAudioSourceRef.current.connect(analyserRef.current);
            userAudioSourceRef.current.connect(destinationNodeRef.current);
            console.log(
              "User audio source connected for analysis and recording"
            );
          } else {
            console.error("Failed to create audio source node");
            toast({
              title: "Audio Setup Error",
              description:
                "Failed to initialize audio source. Animation may not work.",
              variant: "destructive",
            });
          }
        } else {
          console.warn("No user audio tracks available to mix");
          toast({
            title: "Audio Setup Warning",
            description:
              "No microphone audio detected. Animation and recording may be affected.",
            variant: "default",
          });
        }

        const assignStreamToVideo = async (attempts = 5, delay = 500) => {
          if (!videoRef.current) {
            if (attempts > 0) {
              console.warn(
                `Video ref not assigned, retrying... (${attempts} attempts left)`
              );
              setTimeout(() => assignStreamToVideo(attempts - 1, delay), delay);
              return;
            }
            console.error("Video ref is not assigned after retries");
            toast({
              title: "Video Element Error",
              description: "Video element is not available. Please try again.",
              variant: "destructive",
            });
            return;
          }

          videoRef.current.srcObject = stream;
          const videoTracks = stream.getVideoTracks();
          if (videoTracks.length > 0 && !videoTracks[0].enabled) {
            videoTracks[0].enabled = true;
            console.log("Enabled video track");
          }

          try {
            await videoRef.current.play();
            console.log("Video playback started successfully");

            const combinedStream = new MediaStream([
              ...stream.getVideoTracks(),
              ...destinationNodeRef.current!.stream.getAudioTracks(),
            ]);

            console.log(
              "Combined stream created:",
              combinedStream,
              combinedStream.getTracks()
            );
            combinedStream.getTracks().forEach((track) => {
              console.log(
                `Combined track ${track.kind}: enabled=${track.enabled}, readyState=${track.readyState}`
              );
            });

            const activeTracks = combinedStream
              .getTracks()
              .filter((track) => track.readyState === "live");
            if (activeTracks.length === 0) {
              console.error(
                "No active tracks in combinedStream. Recording will fail."
              );
              toast({
                title: "Stream Error",
                description: "No active media tracks available for recording.",
                variant: "destructive",
              });
              return;
            }

            try {
              recorderRef.current.initialize(combinedStream, {
                mimeType: "video/webm;codecs=vp8,opus",
              });
              recorderRef.current.start();
              setIsRecording(true);
              console.log(
                "Recorder initialized and started with MIME type video/webm"
              );
              toast({
                title: "Recording Started",
                description: "Video recording has started for the interview.",
                variant: "default",
              });
            } catch (recorderError) {
              console.error(
                "Error initializing/starting recorder:",
                recorderError
              );
              toast({
                title: "Recording Error",
                description:
                  "Failed to start video recording. Continuing without recording.",
                variant: "destructive",
              });
              setIsRecording(false);
            }
          } catch (error) {
            console.error("Error playing video:", error);
            toast({
              title: "Video Playback Error",
              description:
                "Failed to play video stream. Recording may not work.",
              variant: "destructive",
            });
          }
        };

        await assignStreamToVideo();

        if (speechRecognitionRef.current.isSupported()) {
          speechRecognitionRef.current.onResult(debouncedHandleUserSpeech);
        } else {
          toast({
            title: "Speech Recognition Not Available",
            description: "Your browser doesn't support speech recognition.",
            variant: "destructive",
          });
        }
      } catch (error: any) {
        console.error("Error setting up media:", error.name, error.message);
        setHasMediaPermission(false);
        toast({
          title: "Media Setup Error",
          description:
            "Failed to access camera or microphone. Please check permissions.",
          variant: "destructive",
        });
      }
    };

    setupMedia();
    if (!hasStartedInterview.current) {
      hasStartedInterview.current = true;
      startInterview();
    }

    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
        setMediaStream(null);
      }
      speechRecognitionRef.current.stop();
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      if (destinationNodeRef.current) {
        destinationNodeRef.current.disconnect();
        destinationNodeRef.current = null;
      }
      if (userAudioSourceRef.current) {
        userAudioSourceRef.current.disconnect();
        userAudioSourceRef.current = null;
      }
      if (analyserRef.current) {
        analyserRef.current.disconnect();
        analyserRef.current = null;
      }
      if (responseTimeoutRef.current) {
        clearTimeout(responseTimeoutRef.current);
      }
      if (continueListeningTimeoutRef.current) {
        clearTimeout(continueListeningTimeoutRef.current);
      }
      if (session?.recordings) {
        session.recordings.forEach((url) => URL.revokeObjectURL(url));
      }
    };
  }, []);

  const speakText = async (text: string) => {
    if (!voiceEnabled) return;

    try {
      console.log(
        "Attempting to use backend for Google Cloud Text-to-Speech..."
      );
      setIsProcessing(true);

      const response = await fetch("https://interview-voice-pack.onrender.com/synthesize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Backend response:", response.status, errorText);
        if (response.status === 429) {
          toast({
            title: "Quota Exceeded",
            description:
              "Google Cloud TTS quota exceeded. Please check your Google Cloud Console.",
            variant: "destructive",
          });
        } else if (
          errorText.includes("INVALID_ARGUMENT") &&
          errorText.includes("voice")
        ) {
          toast({
            title: "Voice Not Available",
            description:
              "The requested voice is not available. Please check the voice name.",
            variant: "destructive",
          });
        }
        throw new Error(`Backend error: ${response.status} - ${errorText}`);
      }

      console.log("Backend call successful, generating audio...");
      const { audioContent } = await response.json();
      const audioUrl = `data:audio/mp3;base64,${audioContent}`;

      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current.src = "";
      }
      audioElementRef.current = new Audio();
      audioElementRef.current.src = audioUrl;

      if (audioContextRef.current && destinationNodeRef.current) {
        const aiAudioSource = audioContextRef.current.createMediaElementSource(
          audioElementRef.current
        );
        aiAudioSource.connect(destinationNodeRef.current);
        aiAudioSource.connect(audioContextRef.current.destination);
        console.log(
          "AI audio source connected to destination node for recording"
        );
      } else {
        console.warn(
          "Audio context or destination node not available. AI audio won't be recorded."
        );
        toast({
          title: "Audio Setup Error",
          description:
            "Failed to set up audio mixing. AI voice may not be recorded.",
          variant: "destructive",
        });
      }

      audioElementRef.current.play().catch((error) => {
        console.error("Error playing audio:", error);
        toast({
          title: "Audio Playback Error",
          description:
            "Failed to play AI voice. Please check your browser's audio settings.",
          variant: "destructive",
        });
      });
      audioElementRef.current.onended = () => {
        setIsProcessing(false);
        setWaitingForResponse(true);
        startResponseTimeout();
        URL.revokeObjectURL(audioUrl);
      };
    } catch (error) {
      console.error("Error with Google Cloud TTS:", error);
      toast({
        title: "Text-to-Speech Error",
        description:
          "Failed to generate AI voice. Please check the backend server and Google Cloud setup.",
        variant: "destructive",
      });
      setIsProcessing(false);
      setWaitingForResponse(true);
      startResponseTimeout();
    }
  };

  const startInterview = async () => {
    try {
      const initialQuestion = await generateInterviewQuestion(
        session?.jobDescription || "",
        [],
        [],
        {
          role: session?.role || "General",
          skillLevel: session?.skillLevel || "Intermediate",
        }
      );
      console.log("Initial question received:", initialQuestion);
      if (
        conversation.length === 0 ||
        !conversation.some((msg) => msg.content === initialQuestion)
      ) {
        setCurrentQuestion(initialQuestion);
        setConversation([{ role: "assistant", content: initialQuestion }]);
        if (session) {
          setSession((prev) => ({
            ...prev!,
            transcript: [{ question: initialQuestion, answer: "" }],
          }));
          console.log("Initial transcript:", [
            { question: initialQuestion, answer: "" },
          ]);
        }
        const debouncedSpeak = debounce(() => speakText(initialQuestion), 100);
        debouncedSpeak();
      }
    } catch (error) {
      console.error("Error starting interview:", error);
      const fallbackQuestion = `Let's get started with your interview. Could you tell me about your background and experience?`;
      console.log("Fallback question:", fallbackQuestion);
      if (
        conversation.length === 0 ||
        !conversation.some((msg) => msg.content === fallbackQuestion)
      ) {
        setCurrentQuestion(fallbackQuestion);
        setConversation([{ role: "assistant", content: fallbackQuestion }]);
        if (session) {
          setSession((prev) => ({
            ...prev!,
            transcript: [{ question: fallbackQuestion, answer: "" }],
          }));
          console.log("Initial transcript (fallback):", [
            { question: fallbackQuestion, answer: "" },
          ]);
        }
        const debouncedSpeak = debounce(() => speakText(fallbackQuestion), 100);
        debouncedSpeak();
      }
    }
  };

  const startResponseTimeout = () => {
    if (responseTimeoutRef.current) {
      clearTimeout(responseTimeoutRef.current);
    }
    responseTimeoutRef.current = setTimeout(() => {
      if (waitingForResponse && !isListening) {
        handleNoResponse();
      }
    }, 15000);
  };

  const debouncedHandleUserSpeech = debounce((text: string) => {
    if (text === lastSpeechRef.current) return;
    lastSpeechRef.current = text;
    handleUserSpeech(text);
  }, 500);

  const handleUserSpeech = async (text: string) => {
    if (accumulatedSpeechRef.current) {
      accumulatedSpeechRef.current += " " + text;
    } else {
      accumulatedSpeechRef.current = text;
    }
    setUserResponse(accumulatedSpeechRef.current);

    setIsListening(false);
    speechRecognitionRef.current.stop();

    if (responseTimeoutRef.current) {
      clearTimeout(responseTimeoutRef.current);
    }

    speechRecognitionRef.current.start();
    setIsListening(true);

    if (continueListeningTimeoutRef.current) {
      clearTimeout(continueListeningTimeoutRef.current);
    }
    continueListeningTimeoutRef.current = setTimeout(async () => {
      setIsListening(false);
      speechRecognitionRef.current.stop();

      const finalResponse = accumulatedSpeechRef.current;
      accumulatedSpeechRef.current = "";

      setConversation((prev) => {
        const updatedConversation = [
          ...prev,
          { role: "user", content: finalResponse },
        ];
        console.log("Updated conversation:", updatedConversation);
        return updatedConversation;
      });
      setWaitingForResponse(false);
      setIsProcessing(true);

      if (session) {
        setSession((prev: any) => {
          const currentTranscript = prev?.transcript || [];
          const updatedTranscript = [...currentTranscript];
          if (updatedTranscript.length > 0) {
            updatedTranscript[updatedTranscript.length - 1].answer =
              finalResponse;
          }
          console.log(
            "Updated transcript after user speech:",
            updatedTranscript
          );
          return {
            ...prev!,
            transcript: updatedTranscript,
          };
        });
      }

      try {
        const lowerText = finalResponse.toLowerCase().trim();
        let aiResponseText = "";
        if (
          lowerText.includes("what is software") ||
          lowerText.includes("what's software")
        ) {
          aiResponseText =
            "Software is a set of computer programs and associated data that provide instructions for computers to perform specific tasks. It includes everything from operating systems like Windows or macOS to applications like web browsers, games, and office tools. Unlike hardware, software is intangible and consists of code written by programmers. Want to dive deeper into any specific type of software?";
        } else if (
          lowerText.includes("what is hardware") ||
          lowerText.includes("what's hardware")
        ) {
          aiResponseText =
            "Hardware refers to the physical components of a computer system, like the monitor, keyboard, mouse, CPU, memory, and storage drives. Unlike software, which is just code, hardware is tangible equipment. Curious about any specific hardware components?";
        } else if (
          lowerText.includes("what is coding") ||
          lowerText.includes("what's coding")
        ) {
          aiResponseText =
            "Coding, or programming, is the process of creating instructions for computers using programming languages. It's like writing a detailed recipe that tells the computer what to do. Programmers use languages like Python, JavaScript, or C++ to create websites, apps, games, and more. Have you tried coding before?";
        } else {
          aiResponseText = await generateInterviewQuestion(
            session?.jobDescription || "",
            conversation.map((msg) => msg.content).slice(-4),
            [finalResponse],
            {
              role: session?.role || "General",
              skillLevel: session?.skillLevel || "Intermediate",
            }
          );
        }

        setAiResponse(aiResponseText);
        setConversation((prev) => {
          const updatedConversation = [
            ...prev,
            { role: "assistant", content: aiResponseText },
          ];
          console.log("Conversation after AI response:", updatedConversation);
          return updatedConversation;
        });
        setCurrentQuestion(aiResponseText);

        if (session) {
          setSession((prev: any) => {
            const currentTranscript = prev?.transcript || [];
            const updatedTranscript = [
              ...currentTranscript,
              { question: aiResponseText, answer: "" },
            ];
            console.log(
              "Updated transcript after AI response:",
              updatedTranscript
            );
            return {
              ...prev!,
              transcript: updatedTranscript,
            };
          });
        }

        setTimeout(() => {
          speakText(aiResponseText);
        }, 100);
      } catch (error) {
        console.error("Error generating AI response:", error);
        const lowerText = finalResponse.toLowerCase().trim();
        const isQuestion =
          lowerText.startsWith("what") ||
          lowerText.startsWith("how") ||
          lowerText.startsWith("why") ||
          lowerText.startsWith("when") ||
          lowerText.startsWith("where") ||
          lowerText.startsWith("can") ||
          lowerText.startsWith("could") ||
          lowerText.endsWith("?");

        let fallbackResponse;
        if (isQuestion) {
          fallbackResponse = `That's a great question! ${getInformationResponse(
            lowerText
          )} Want to explore this topic more or move to an interview question?`;
        } else if (
          lowerText.includes("bye") ||
          lowerText.includes("goodbye") ||
          lowerText.includes("done")
        ) {
          fallbackResponse =
            "Thanks for the chat! It was great talking with you. Ready to wrap up or continue with another question?";
        } else {
          fallbackResponse =
            "Got it! Let's keep going. Could you share an experience where you demonstrated relevant skills?";
        }

        setAiResponse(fallbackResponse);
        setConversation((prev) => {
          const updatedConversation = [
            ...prev,
            { role: "assistant", content: fallbackResponse },
          ];
          console.log(
            "Conversation after fallback response:",
            updatedConversation
          );
          return updatedConversation;
        });
        setCurrentQuestion(fallbackResponse);

        if (session) {
          setSession((prev: any) => {
            const currentTranscript = prev?.transcript || [];
            const updatedTranscript = [
              ...currentTranscript,
              { question: fallbackResponse, answer: "" },
            ];
            console.log(
              "Updated transcript after fallback:",
              updatedTranscript
            );
            return {
              ...prev!,
              transcript: updatedTranscript,
            };
          });
        }

        setTimeout(() => {
          speakText(fallbackResponse);
        }, 100);
      } finally {
        setIsProcessing(false);
      }
    }, 6000);
  };

  const getInformationResponse = (text: string): string => {
    if (text.includes("software")) {
      return "Software refers to programs and applications that run on computers and other devices. It's the instructions that tell hardware what to do.";
    } else if (text.includes("hardware")) {
      return "Hardware is the physical components of a computer system - things you can touch like screens, keyboards, and the electronic parts inside.";
    } else if (text.includes("coding") || text.includes("programming")) {
      return "Coding is writing instructions for computers using programming languages. It's how people create websites, apps, and other software.";
    } else if (text.includes("internet")) {
      return "The internet is a global network of connected computers that allows information sharing and communication worldwide.";
    } else if (
      text.includes("ai") ||
      text.includes("artificial intelligence")
    ) {
      return "Artificial Intelligence refers to computer systems designed to perform tasks that typically require human intelligence, like visual perception, speech recognition, and decision-making.";
    } else {
      return "I'm not sure about that specific topic, but I'd be happy to discuss it or move to an interview question.";
    }
  };

  const handleNoResponse = async () => {
    setWaitingForResponse(false);
    setIsProcessing(true);

    try {
      const role = session?.role || "General";
      const skillLevel = session?.skillLevel || "Intermediate";
      const aiResponseText = await generateInterviewQuestion(
        session?.jobDescription || "",
        conversation.map((msg) => msg.content).slice(-4),
        [],
        { role, skillLevel }
      );
      setAiResponse(aiResponseText);
      setConversation((prev) => {
        const updatedConversation = [
          ...prev,
          { role: "assistant", content: aiResponseText },
        ];
        console.log("Conversation after no response:", updatedConversation);
        return updatedConversation;
      });
      setCurrentQuestion(aiResponseText);

      if (session) {
        setSession((prev) => {
          const currentTranscript = prev?.transcript || [];
          const updatedTranscript = [...currentTranscript];
          if (
            updatedTranscript.length > 0 &&
            updatedTranscript[updatedTranscript.length - 1].answer === ""
          ) {
            updatedTranscript[updatedTranscript.length - 1].answer =
              "No response";
          }
          updatedTranscript.push({ question: aiResponseText, answer: "" });
          console.log(
            "Updated transcript after no response:",
            updatedTranscript
          );
          return {
            ...prev!,
            transcript: updatedTranscript,
          };
        });
      }

      setTimeout(() => {
        speakText(aiResponseText);
      }, 100);
    } catch (error) {
      console.error("Error generating follow-up:", error);
      const fallbackResponse = `Looks like you're thinking! Can you describe a challenge you faced in a past project and how you handled it?`;
      setAiResponse(fallbackResponse);
      setConversation((prev) => {
        const updatedConversation = [
          ...prev,
          { role: "assistant", content: fallbackResponse },
        ];
        console.log(
          "Conversation after no response (fallback):",
          updatedConversation
        );
        return updatedConversation;
      });
      setCurrentQuestion(fallbackResponse);

      if (session) {
        setSession((prev) => {
          const currentTranscript = prev?.transcript || [];
          const updatedTranscript = [...currentTranscript];
          if (
            updatedTranscript.length > 0 &&
            updatedTranscript[updatedTranscript.length - 1].answer === ""
          ) {
            updatedTranscript[updatedTranscript.length - 1].answer =
              "No response";
          }
          updatedTranscript.push({ question: fallbackResponse, image: "" });
          console.log(
            "Updated transcript after no response (fallback):",
            updatedTranscript
          );
          return {
            ...prev!,
            transcript: updatedTranscript,
          };
        });
      }

      setTimeout(() => {
        speakText(fallbackResponse);
      }, 100);
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleMic = () => {
    if (mediaStream) {
      const audioTracks = mediaStream.getAudioTracks();
      if (audioTracks.length === 0) {
        toast({
          title: "No Audio Track",
          description:
            "No audio track available. Please check your microphone.",
          variant: "destructive",
        });
        return;
      }
      audioTracks.forEach((track) => {
        track.enabled = !micEnabled;
      });
      setMicEnabled(!micEnabled);
      console.log(
        "Mic toggled, audio tracks:",
        audioTracks.map((t) => ({ enabled: t.enabled }))
      );
    }
  };

  const toggleVideo = () => {
    if (mediaStream) {
      const videoTracks = mediaStream.getVideoTracks();
      if (videoTracks.length == 0) {
        toast({
          title: "No Video Track",
          description: "No video track available. Please check your camera.",
          variant: "destructive",
        });
        return;
      }
      videoTracks.forEach((track) => {
        track.enabled = !videoEnabled;
      });
      setVideoEnabled(!videoEnabled);
      console.log(
        "Video toggled, video tracks:",
        videoTracks.map((t) => ({ enabled: t.enabled }))
      );
    }
  };

  const toggleVoice = () => {
    setVoiceEnabled(!voiceEnabled);
    if (voiceEnabled && audioElementRef.current) {
      audioElementRef.current.pause();
    }
  };

  const startListening = () => {
    if (isProcessing || !waitingForResponse) {
      toast({
        title: "Please Wait",
        description:
          "The AI is still processing or waiting for the right moment to listen.",
        variant: "default",
      });
      return;
    }

    if (speechRecognitionRef.current.isActive()) {
      toast({
        title: "Already Listening",
        description:
          "Speech recognition is already active. Please wait for the current session to complete.",
        variant: "default",
      });
      return;
    }

    if (
      !mediaStream ||
      !mediaStream
        .getTracks()
        .some((track) => track.enabled && track.readyState === "live")
    ) {
      toast({
        title: "Media Error",
        description:
          "No active media stream available. Attempting to reconnect...",
        variant: "destructive",
      });
      requestUserMedia()
        .then((newStream) => {
          setMediaStream(newStream);
          setHasMediaPermission(true);
          if (videoRef.current) {
            videoRef.current.srcObject = newStream;
          }
          const currentTracks =
            recorderRef.current.getStream()?.getTracks() || [];
          currentTracks.forEach((track) => track.stop());

          if (audioContextRef.current && destinationNodeRef.current) {
            if (userAudioSourceRef.current) {
              userAudioSourceRef.current.disconnect();
              userAudioSourceRef.current = null;
            }
            const userAudioTracks = newStream.getAudioTracks();
            if (userAudioTracks.length > 0) {
              userAudioSourceRef.current =
                audioContextRef.current.createMediaStreamSource(
                  new MediaStream([userAudioTracks[0]])
                );
              userAudioSourceRef.current.connect(destinationNodeRef.current);
              userAudioSourceRef.current.connect(analyserRef.current);
              console.log(
                "User audio source reconnected to destination node after stream reconnect"
              );
            }
          }

          const combinedStream = new MediaStream([
            ...newStream.getVideoTracks(),
            ...destinationNodeRef.current!.stream.getAudioTracks(),
          ]);

          recorderRef.current.updateStream(combinedStream);

          if (!isRecording) {
            try {
              recorderRef.current.start();
              setIsRecording(true);
              console.log("Recorder restarted after stream reconnect");
              toast({
                title: "Recording Restated",
                description:
                  "Recording has been restarted after reconnecting the media stream.",
                variant: "default",
              });
            } catch (error) {
              console.error("Error restarting recorder:", error);
              toast({
                title: "Recording Error",
                description:
                  "Failed to restart recording after reconnecting the stream.",
                variant: "destructive",
              });
            }
          }
        })
        .catch((error) => {
          console.error("Error re-requesting media:", error);
          toast({
            title: "Permission Denied",
            description: "Camera and microphone access are required to record.",
            variant: "destructive",
          });
        });
      return;
    }

    setIsListening(true);
    speechRecognitionRef.current.start();
  };

  const calculateScore = (responses: string[]): number => {
    let totalScore = 0;
    const maxScorePerResponse = 3;
    const minLength = 20;
    const keywords = [
      "react",
      "component",
      "state",
      "experience",
      "project",
      "skills",
      "team",
      "solution",
      "javascript",
      "development",
    ];

    responses.forEach((response) => {
      let responseScore = 0;
      if (response.length > minLength) {
        responseScore += 1;
      }
      const keywordMatches = keywords.filter((keyword) =>
        response.toLowerCase().includes(keyword)
      ).length;
      responseScore += keywordMatches * 0.2;
      totalScore += Math.min(responseScore, maxScorePerResponse);
    });

    const normalizedScore =
      (totalScore / (responses.length * maxScorePerResponse)) * 10;
    return Math.round(normalizedScore * 10) / 10;
  };

  const generateFeedback = (
    transcript: Array<{ question: string; answer: string }>
  ) => {
    const strengths: string[] = [];
    const improvements: string[] = [];
    const responses = transcript
      .map((item) => item.answer)
      .filter((answer) => answer && answer !== "No response");

    const hasDetailedResponses = responses.some(
      (response) => response.length > 50
    );
    const hasRelevantTerms = responses.some((response) =>
      ["react", "component", "state", "javascript"].some((term) =>
        response.toLowerCase().includes(term)
      )
    );
    const responseCount = responses.length;

    if (hasDetailedResponses) {
      strengths.push("Provided detailed responses to some questions");
    }
    if (hasRelevantTerms) {
      strengths.push("Demonstrated familiarity with relevant technical terms");
    }
    if (responseCount >= transcript.length - 1) {
      strengths.push("Answered most questions promptly");
    }
    if (strengths.length === 0) {
      strengths.push("Attempted to engage with the interview process");
    }

    const hasVagueResponses = responses.some(
      (response) =>
        response.toLowerCase().includes("don't know") ||
        response.toLowerCase().includes("not sure")
    );
    const hasShortResponses = responses.some(
      (response) => response.length < 20 && response !== "No response"
    );
    const missedResponses = transcript.some(
      (item) => item.answer === "No response"
    );

    if (hasVagueResponses) {
      improvements.push(
        "Clarify answers by avoiding vague phrases like 'don't know'"
      );
    }
    if (hasShortResponses) {
      improvements.push("Elaborate on answers to provide more depth");
    }
    if (missedResponses) {
      improvements.push(
        "Ensure to respond to all questions, even with partial answers"
      );
    }
    if (responses.length < transcript.length / 2) {
      improvements.push("Increase engagement by answering more questions");
    }
    if (improvements.length == 0) {
      improvements.push("Continue practicing to enhance response confidence");
    }

    return { strengths, improvements };
  };

  const handleFinishInterview = async () => {
    if (isFinishing) return;
    setIsFinishing(true);
    console.log("Finishing interview initiated");

    try {
      speechRecognitionRef.current.stop();
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current = null;
      }
      if (responseTimeoutRef.current) {
        clearTimeout(responseTimeoutRef.current);
      }
      if (continueListeningTimeoutRef.current) {
        clearTimeout(continueListeningTimeoutRef.current);
      }

      let recordingUrl: string | undefined = undefined;
      let recordedBlobs: Blob[] | null = null;

      if (isRecording && recorderRef.current) {
        console.log("Stopping recorder...");
        const recordedBlob = await recorderRef.current.stop();
        if (recordedBlob && recordedBlob.size > 0) {
          recordedBlobs = [recordedBlob];
          console.log("Recording blob obtained, size:", recordedBlob.size);
        } else {
          console.warn("No valid recording data obtained.");
          toast({
            title: "No Recording Data",
            description: "No video data was recorded. Saving metadata only.",
            variant: "default",
          });
        }
        setIsRecording(false);

        const recorderStream = recorderRef.current.getStream();
        if (recorderStream) {
          recorderStream.getTracks().forEach((track) => {
            track.stop();
            console.log(`Recorder track ${track.kind} stopped`);
          });
        }
        recorderRef.current.updateStream(null);
        console.log("Recorder stream cleared");
      }

      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => {
          track.stop();
          console.log(`Media stream track ${track.kind} stopped`);
        });
        setMediaStream(null);
      }

      if (videoRef.current) {
        videoRef.current.srcObject = null;
        console.log("Video element srcObject cleared");
      }

      let finalTranscript = session?.transcript || [];
      if (
        finalTranscript.length > 0 &&
        userResponse &&
        finalTranscript[finalTranscript.length - 1].answer === ""
      ) {
        finalTranscript = finalTranscript.map((entry, index) =>
          index === finalTranscript.length - 1
            ? { ...entry, answer: userResponse }
            : entry
        );
        console.log("Final transcript updated:", finalTranscript);
      }

      const userResponses = conversation
        .filter((msg) => msg.role === "user")
        .map((msg) => msg.content);
      const overallScore =
        userResponses.length > 0 ? calculateScore(userResponses) : 0;
      const { strengths, improvements } = generateFeedback(finalTranscript);

      const updatedSession = {
        ...session!,
        recordings: recordedBlobs ? [] : [],
        feedback: {
          strengths,
          improvements,
          overallScore,
          transcript: finalTranscript,
          recording: recordedBlobs ? [] : [],
        },
        isCompleted: true,
      };

      if (recordedBlobs && session) {
        try {
          recordingUrl = await saveSessionWithRecording(
            updatedSession,
            recordedBlobs
          );
          if (recordingUrl) {
            updatedSession.recordings = [recordingUrl];
            updatedSession.feedback.recording = [recordingUrl];
            console.log("Recording saved, URL:", recordingUrl);
          } else {
            console.warn("No recording URL returned, saving locally.");
            const blobUrl = URL.createObjectURL(recordedBlobs[0]);
            updatedSession.recordings = [blobUrl];
            updatedSession.feedback.recording = [blobUrl];
            console.log("Recording saved locally:", blobUrl);
            toast({
              title: "Recording Saved Locally",
              description: "Failed to upload to Firebase, saved locally.",
              variant: "default",
            });
          }
        } catch (error) {
          console.error("Error saving recording:", error);
          const blobUrl = URL.createObjectURL(recordedBlobs[0]);
          updatedSession.recordings = [blobUrl];
          updatedSession.feedback.recording = [blobUrl];
          console.log("Recording saved locally due to error:", blobUrl);
          toast({
            title: "Recording Save Error",
            description: "Saved recording locally due to Firebase error.",
            variant: "destructive",
          });
        }
      }

      try {
        await saveSessionWithRecording(updatedSession, []);
        console.log("Session metadata saved:", updatedSession);
      } catch (error) {
        console.error("Error saving session metadata:", error);
        toast({
          title: "Metadata Save Error",
          description: "Failed to save session metadata.",
          variant: "destructive",
        });
      }

      try {
        await updateUserData(uid, title, hrCode);
      } catch (error) {
        console.error("Error updating user data:", error);
        toast({
          title: "User Data Update Error",
          description: "Failed to update interview records.",
          variant: "destructive",
        });
      }

      setSession(updatedSession);
      onComplete(updatedSession.feedback!);
      toast({
        title: "Interview Completed",
        description: "Your interview has ended. View feedback for details.",
        variant: "default",
      });
      console.log("Interview finished, feedback sent");
    } catch (error) {
      console.error("Error finishing interview:", error);
      toast({
        title: "Error",
        description: "An error occurred while ending the interview.",
        variant: "destructive",
      });
    } finally {
      setIsFinishing(false);
    }
  };

useEffect(() => {
  let animationFrameId: number;
  let startTime: number | null = null;

  const animate = (timestamp: number) => {
    if (!startTime) startTime = timestamp;

    if (micIconRef.current) {
      // USER SPEAKING
      if (
        isListening &&
        analyserRef.current &&
        audioContextRef.current?.state === "running"
      ) {
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);

        const rawVolume = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
        const normalizedVolume = Math.min(rawVolume / 128, 1);

        if (!isNaN(normalizedVolume)) {
          const pulseScale = 1 + normalizedVolume * 0.4;
          const glowIntensity = normalizedVolume * 30;
          const opacity = 0.9 + normalizedVolume * 0.1;
          const rotation = Math.sin(timestamp / 100) * 2;
          const hueShift = timestamp / 10 % 360;

          micIconRef.current.style.transform = `scale(${pulseScale}) rotate(${rotation}deg)`;
          micIconRef.current.style.opacity = `${Math.min(opacity, 1)}`;
          micIconRef.current.style.setProperty(
            "--glow-color",
            `radial-gradient(circle, rgba(0,255,150,0.5), rgba(0,150,255,0.5))`
          );
          micIconRef.current.style.setProperty("--glow-intensity", `${glowIntensity}px`);
          micIconRef.current.style.setProperty("--overlay-opacity", `${0.4 + normalizedVolume * 0.4}`);
          micIconRef.current.style.filter = `hue-rotate(${hueShift}deg) brightness(1.2)`;
        }
      }

      // AI SPEAKING
      else if (isProcessing) {
        const elapsed = timestamp - startTime;
        const pulseScale = 1 + Math.sin(elapsed / 300) * 0.25;
        const glowIntensity = 10 + Math.sin(elapsed / 500) * 10;
        const waveAngle = Math.sin(elapsed / 250) * 5;
        const hueShift = timestamp / 5 % 360;

        micIconRef.current.style.transform = `scale(${pulseScale}) rotate(${waveAngle}deg)`;
        micIconRef.current.style.opacity = `0.95`;
        micIconRef.current.style.setProperty(
          "--glow-color",
          `radial-gradient(circle, rgba(255,0,200,0.5), rgba(255,0,100,0.5))`
        );
        micIconRef.current.style.setProperty("--glow-intensity", `${glowIntensity}px`);
        micIconRef.current.style.setProperty("--overlay-opacity", `${0.5 + Math.sin(elapsed / 400) * 0.3}`);
        micIconRef.current.style.filter = `hue-rotate(${hueShift}deg) brightness(1.2)`;
      }

      // IDLE
      else {
        micIconRef.current.style.transform = `scale(1) rotate(0deg)`;
        micIconRef.current.style.opacity = "0.8";
        micIconRef.current.style.setProperty("--glow-color", "transparent");
        micIconRef.current.style.setProperty("--glow-intensity", "0px");
        micIconRef.current.style.setProperty("--overlay-opacity", "0");
        micIconRef.current.style.filter = "";
      }
    }

    animationFrameId = requestAnimationFrame(animate);
  };

  if (isListening || isProcessing) {
    animationFrameId = requestAnimationFrame(animate);
  }

  return () => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
    if (micIconRef.current) {
      micIconRef.current.style.transform = `scale(1) rotate(0deg)`;
      micIconRef.current.style.opacity = "0.8";
      micIconRef.current.style.setProperty("--glow-color", "transparent");
      micIconRef.current.style.setProperty("--glow-intensity", "0px");
      micIconRef.current.style.setProperty("--overlay-opacity", "0");
      micIconRef.current.style.filter = "";
    }
    startTime = null;
  };
}, [isListening, isProcessing]);


return (
  <div className="grid grid-cols-1 md:grid-cols-3">
    {/* Left: Video & Controls */}
    <div className="md:col-span-2 relative bg-[#11011E] flex flex-col justify-between p-4 min-h-[450px] overflow-hidden">
      
      {/* Background Blurs */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-[#7000FF] blur-[180px] opacity-20 rounded-full z-0"></div>
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-[#FF00C7] blur-[180px] opacity-20 rounded-full z-0"></div>

      {/* Video or Placeholder */}
      {/* Video or Placeholder */}
<div className="flex-1 relative z-10 rounded-lg overflow-hidden border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)]">
  {hasMediaPermission ? (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      className="w-full h-full object-cover"
    />
  ) : (
    <div className="w-full h-full flex items-center justify-center">
      <p className="text-[#ECF1F0] font-raleway">Camera access required</p>
    </div>
  )}

  {/* 🔽 Controls inside video box */}
  <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 z-20">
    {/* Mic */}
    <Button
      variant="outline"
      size="icon"
      onClick={toggleMic}
      className={`rounded-full h-10 w-10 border-2 ${
        micEnabled
          ? "bg-[#0FAE96] border-[#0FAE96] text-white hover:bg-[#0FAE96]/80"
          : "bg-[#FF00C7]/80 border-[#FF00C7] text-white hover:bg-[#FF00C7]"
      }`}
    >
      {micEnabled ? <Mic className="h-4 w-4 ml-2.5" /> : <MicOff className="h-4 w-4 ml-2.5" />}
    </Button>

    {/* Video */}
    <Button
      variant="outline"
      size="icon"
      onClick={toggleVideo}
      className={`rounded-full h-10 w-10 border-2 ${
        videoEnabled
          ? "bg-[#0FAE96] border-[#0FAE96] text-white hover:bg-[#0FAE96]/80"
          : "bg-[#FF00C7]/80 border-[#FF00C7] text-white hover:bg-[#FF00C7]"
      }`}
    >
      {videoEnabled ? <Video className="h-4 w-4 ml-2.5" /> : <VideoOff className="h-4 w-4 ml-2.5" />}
    </Button>

    {/* Voice */}
    <Button
      variant="outline"
      size="icon"
      onClick={toggleVoice}
      className={`rounded-full h-10 w-10 border-2 ${
        voiceEnabled
          ? "bg-[#0FAE96] border-[#0FAE96] text-white hover:bg-[#0FAE96]/80"
          : "bg-[rgba(255,255,255,0.1)] border-[rgba(255,255,255,0.1)] text-white hover:bg-[rgba(255,255,255,0.2)]"
      }`}
    >
      {voiceEnabled ? <Volume2 className="h-4 w-4 ml-2.5" /> : <VolumeX className="h-4 w-4 ml-2.5" />}
    </Button>
  </div>
</div>


      {/* Mic Animation */}
      {(isListening || isProcessing) && (
        <div className="flex flex-col items-center justify-center mt-4 z-10">
          <div className="w-12 h-12 rounded-full relative overflow-hidden mic-animation" ref={micIconRef}>
            <img
              src="/images/interh.png"
              alt="Mic Animation"
              className="w-full h-full object-cover rounded-full"
              onError={(e) => {
                console.error("Mic image failed:", e);
                e.currentTarget.src = "/images/fallback-animation.gif";
              }}
            />
            <div
              className={`absolute inset-0 rounded-full opacity-40 mix-blend-multiply transition-all duration-300 ${
                isListening ? "bg-[#0FAE96]" : "bg-[#FF00C7]"
              }`}
            ></div>
          </div>
          {!isListening && (
            <p className="text-sm text-[#ECF1F0] mt-1 font-raleway">AI Thinking...</p>
          )}
        </div>
      )}
    </div>

    {/* Right: Chat Panel */}
    {/* Right Panel - Chat + Buttons */}
<div className="p-6 bg-[#11011E] border-l border-[rgba(255,255,255,0.05)] flex flex-col md:col-span-1">
  {/* Chat History with Scrollable Area (Fixed Height) */}
  <div className="max-h-[360px] overflow-y-auto flex-1 space-y-4 pr-1 hide-scrollbar">
    {conversation.map((msg, i) => (
      <div
        key={i}
        className={`p-3 rounded-lg border text-sm font-inter ${
          msg.role === "assistant"
            ? "bg-[rgba(15,174,150,0.1)] border-[rgba(15,174,150,0.2)] text-[#B6F2E5]"
            : "bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.05)] text-[#ECF1F0]"
        }`}
      >
        <span className="font-medium mr-1">
          {msg.role === "assistant" ? "AI:" : "You:"}
        </span>
        {msg.content}
      </div>
    ))}
  </div>

  {/* Speak + End Buttons */}
  <div className="mt-5 space-y-3">
    <Button
      className="w-full bg-[#0FAE96] text-white font-raleway font-semibold text-base px-6 py-3 rounded-md hover:scale-105 transition duration-200 disabled:opacity-50"
      onClick={startListening}
      disabled={isListening || isProcessing || !waitingForResponse}
    >
      {isListening ? "Listening..." : "Speak"}
    </Button>
    <Button
      className="w-full bg-[#FF00C7]/80 text-white font-raleway font-semibold text-base px-6 py-3 rounded-md hover:scale-105 transition duration-200 disabled:opacity-50"
      onClick={handleFinishInterview}
      disabled={isFinishing}
    >
      End Interview
    </Button>
  </div>
</div>
</div>
);

};
export default InterviewSession;
