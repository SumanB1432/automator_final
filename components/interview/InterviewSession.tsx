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

  const videoRef = useRef<HTMLVideoElement>(null);
  const recorderRef = useRef<VideoRecorder>(new VideoRecorder());
  const speechRecognitionRef = useRef<SpeechRecognitionUtil>(
    new SpeechRecognitionUtil()
  );
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const responseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSpeechRef = useRef<string>("");
  const audioContextRef = useRef<AudioContext | null>(null);
  const destinationRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  const hasStartedInterview = useRef<boolean>(false);
  const continueListeningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // --- CHANGE START ---
  const accumulatedSpeechRef = useRef<string>(""); // To accumulate speech during the listening window
  // --- CHANGE END ---
  const { toast } = useToast();

  useEffect(() => {
    console.log("useEffect triggered, hasStartedInterview:", hasStartedInterview.current);
    const setupMedia = async () => {
      if (!window.MediaRecorder) {
        toast({
          title: "Browser Not Supported",
          description: "Your browser does not support video recording. Please use Chrome or Firefox.",
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
          console.log(`Track ${track.kind}: enabled=${track.enabled}, readyState=${track.readyState}`);
        });

        const assignStreamToVideo = async (attempts = 5, delay = 500) => {
          if (!videoRef.current) {
            if (attempts > 0) {
              console.warn(`Video ref not assigned, retrying... (${attempts} attempts left)`);
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

            try {
              audioContextRef.current = new AudioContext();
              destinationRef.current = audioContextRef.current.createMediaStreamDestination();
              const combinedStream = new MediaStream([
                ...stream.getVideoTracks(),
                ...stream.getAudioTracks(),
                ...destinationRef.current.stream.getAudioTracks(),
              ]);

              console.log("Combined stream created:", combinedStream, combinedStream.getTracks());
              combinedStream.getTracks().forEach((track) => {
                console.log(`Combined track ${track.kind}: enabled=${track.enabled}, readyState=${track.readyState}`);
              });

              try {
                recorderRef.current.initialize(combinedStream);
                recorderRef.current.start();
                setIsRecording(true);
                console.log("Recorder initialized and started");
                toast({
                  title: "Recording Started",
                  description: "Video recording has started for the interview.",
                  variant: "default",
                });
              } catch (recorderError) {
                console.error("Error initializing/starting recorder:", recorderError.message, recorderError.stack);
                toast({
                  title: "Recording Error",
                  description: "Failed to start video recording. Continuing without recording.",
                  variant: "destructive",
                });
              }
            } catch (audioError) {
              console.error("Error creating AudioContext or combined stream:", audioError.message, audioError.stack);
              toast({
                title: "Audio Context Error",
                description: "Failed to set up audio context. Recording may not work.",
                variant: "destructive",
              });
            }
          } catch (error) {
            console.error("Error playing video:", error.message, error.stack);
            toast({
              title: "Video Playback Error",
              description: "Failed to play video stream. Recording may not work.",
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
        console.error("Error setting up media:", error.name, error.message, error.stack);
        setHasMediaPermission(false);
        toast({
          title: "Media Setup Error",
          description: "Failed to access camera or microphone. Please check permissions.",
          variant: "destructive",
        });
      }
    };

    setupMedia();
    initializeSpeechSynthesis();
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
      if (speechSynthesisRef.current) {
        window.speechSynthesis.cancel();
      }
      if (responseTimeoutRef.current) {
        clearTimeout(responseTimeoutRef.current);
      }
      if (continueListeningTimeoutRef.current) {
        clearTimeout(continueListeningTimeoutRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (session?.recordings) {
        session.recordings.forEach((url) => URL.revokeObjectURL(url));
      }
    };
  }, []);

  const initializeSpeechSynthesis = () => {
    if ("speechSynthesis" in window) {
      speechSynthesisRef.current = new SpeechSynthesisUtterance();
      speechSynthesisRef.current.onend = () => {
        setIsProcessing(false);
        setWaitingForResponse(true);
        startResponseTimeout();
      };
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(
        (voice) =>
          voice.name.includes("Google") ||
          voice.name.includes("Female")
      );

      if (preferredVoice) {
        speechSynthesisRef.current.voice = preferredVoice;
      }

      speechSynthesisRef.current.rate = 1.1;
      speechSynthesisRef.current.pitch = 1.05;

      if (audioContextRef.current && destinationRef.current) {
        const audioElement = new Audio();
        audioElement.crossOrigin = "anonymous";
        const source =
          audioContextRef.current.createMediaElementSource(audioElement);
        source.connect(destinationRef.current);
        destinationRef.current.connect(audioContextRef.current.destination);

        speechSynthesisRef.current.onstart = () => {
          const utterance = speechSynthesisRef.current!.text;
          audioElement.src = `data:audio/wav;base64,${btoa(utterance)}`;
          audioElement.play();
        };
      }
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
      if (conversation.length === 0 || !conversation.some(msg => msg.content === initialQuestion)) {
        setCurrentQuestion(initialQuestion);
        setConversation([{ role: "assistant", content: initialQuestion }]);
        if (session) {
          setSession((prev) => ({
            ...prev!,
            transcript: [{ question: initialQuestion, answer: "" }],
          }));
          console.log("Initial transcript:", [{ question: initialQuestion, answer: "" }]);
        }
        const debouncedSpeak = debounce(() => speakText(initialQuestion), 100);
        debouncedSpeak();
      }
    } catch (error) {
      console.error("Error starting interview:", error);
      const fallbackQuestion = `Let's get started with your interview. Could you tell me about your background and experience?`;
      console.log("Fallback question:", fallbackQuestion);
      if (conversation.length === 0 || !conversation.some(msg => msg.content === fallbackQuestion)) {
        setCurrentQuestion(fallbackQuestion);
        setConversation([{ role: "assistant", content: fallbackQuestion }]);
        if (session) {
          setSession((prev) => ({
            ...prev!,
            transcript: [{ question: fallbackQuestion, answer: "" }],
          }));
          console.log("Initial transcript (fallback):", [{ question: fallbackQuestion, answer: "" }]);
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
    // --- CHANGE START ---
    // Accumulate the speech instead of immediately updating the state
    if (accumulatedSpeechRef.current) {
      accumulatedSpeechRef.current += " " + text;
    } else {
      accumulatedSpeechRef.current = text;
    }
    setUserResponse(accumulatedSpeechRef.current);

    // Stop the current speech recognition to prevent overlapping
    setIsListening(false);
    speechRecognitionRef.current.stop();

    if (responseTimeoutRef.current) {
      clearTimeout(responseTimeoutRef.current);
    }

    // Continue listening for additional user input during the pause
    speechRecognitionRef.current.start();
    setIsListening(true);

    // Wait for a few seconds to allow the user to continue speaking
    if (continueListeningTimeoutRef.current) {
      clearTimeout(continueListeningTimeoutRef.current);
    }
    continueListeningTimeoutRef.current = setTimeout(async () => {
      setIsListening(false);
      speechRecognitionRef.current.stop();

      // Use the accumulated speech as the final user response
      const finalResponse = accumulatedSpeechRef.current;
      accumulatedSpeechRef.current = ""; // Reset the accumulated speech

      // Update conversation with the final user response
      setConversation((prev) => {
        const updatedConversation = [...prev, { role: "user", content: finalResponse }];
        console.log("Updated conversation:", updatedConversation);
        return updatedConversation;
      });
      setWaitingForResponse(false);
      setIsProcessing(true);

      // Update transcript: set the answer for the last question
      if (session) {
        setSession((prev : any) => {
          const currentTranscript = prev?.transcript || [];
          const updatedTranscript = [...currentTranscript];
          if (updatedTranscript.length > 0) {
            updatedTranscript[updatedTranscript.length - 1].answer = finalResponse;
          }
          console.log("Updated transcript after user speech:", updatedTranscript);
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
          const updatedConversation = [...prev, { role: "assistant", content: aiResponseText }];
          console.log("Conversation after AI response:", updatedConversation);
          return updatedConversation;
        });
        setCurrentQuestion(aiResponseText);

        // Update transcript: append the new question
        if (session) {
          setSession((prev : any) => {
            const currentTranscript = prev?.transcript || [];
            const updatedTranscript = [...currentTranscript, { question: aiResponseText, answer: "" }];
            console.log("Updated transcript after AI response:", updatedTranscript);
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
          const updatedConversation = [...prev, { role: "assistant", content: fallbackResponse }];
          console.log("Conversation after fallback response:", updatedConversation);
          return updatedConversation;
        });
        setCurrentQuestion(fallbackResponse);

        // Update transcript: append the fallback question
        if (session) {
          setSession((prev : any) => {
            const currentTranscript = prev?.transcript || [];
            const updatedTranscript = [...currentTranscript, { question: fallbackResponse, answer: "" }];
            console.log("Updated transcript after fallback:", updatedTranscript);
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
    }, 6000); // Wait 3 seconds to allow user to continue speaking
    // --- CHANGE END ---
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
        const updatedConversation = [...prev, { role: "assistant", content: aiResponseText }];
        console.log("Conversation after no response:", updatedConversation);
        return updatedConversation;
      });
      setCurrentQuestion(aiResponseText);

      // Update transcript: mark the last question as "No response" and append the new question
      if (session) {
        setSession((prev) => {
          const currentTranscript = prev?.transcript || [];
          const updatedTranscript = [...currentTranscript];
          if (updatedTranscript.length > 0 && updatedTranscript[updatedTranscript.length - 1].answer === "") {
            updatedTranscript[updatedTranscript.length - 1].answer = "No response";
          }
          updatedTranscript.push({ question: aiResponseText, answer: "" });
          console.log("Updated transcript after no response:", updatedTranscript);
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
        const updatedConversation = [...prev, { role: "assistant", content: fallbackResponse }];
        console.log("Conversation after no response (fallback):", updatedConversation);
        return updatedConversation;
      });
      setCurrentQuestion(fallbackResponse);

      // Update transcript: mark the last question as "No response" and append the fallback question
      if (session) {
        setSession((prev) => {
          const currentTranscript = prev?.transcript || [];
          const updatedTranscript = [...currentTranscript];
          if (updatedTranscript.length > 0 && updatedTranscript[updatedTranscript.length - 1].answer === "") {
            updatedTranscript[updatedTranscript.length - 1].answer = "No response";
          }
          updatedTranscript.push({ question: fallbackResponse, answer: "" });
          console.log("Updated transcript after no response (fallback):", updatedTranscript);
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
      if (videoTracks.length === 0) {
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
    if (voiceEnabled) {
      window.speechSynthesis.cancel();
    }
  };

  const speakText = (text: string) => {
    if (voiceEnabled && speechSynthesisRef.current) {
      window.speechSynthesis.cancel();
      speechSynthesisRef.current.text = text;
      window.speechSynthesis.speak(speechSynthesisRef.current);
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

          const combinedStream = new MediaStream([
            ...newStream.getVideoTracks(),
            ...newStream.getAudioTracks(),
            ...(destinationRef.current?.stream.getAudioTracks() || []),
          ]);

          recorderRef.current.updateStream(combinedStream);

          if (!isRecording) {
            recorderRef.current.start();
            setIsRecording(true);
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

  const generateFeedback = (transcript: Array<{ question: string; answer: string }>) => {
    const strengths: string[] = [];
    const improvements: string[] = [];
    const responses = transcript.map((item) => item.answer).filter((answer) => answer && answer !== "No response");

    const hasDetailedResponses = responses.some((response) => response.length > 50);
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

    const hasVagueResponses = responses.some((response) =>
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
      improvements.push("Clarify answers by avoiding vague phrases like 'don't know'");
    }
    if (hasShortResponses) {
      improvements.push("Elaborate on answers to provide more depth");
    }
    if (missedResponses) {
      improvements.push("Ensure to respond to all questions, even with partial answers");
    }
    if (responses.length < transcript.length / 2) {
      improvements.push("Increase engagement by answering more questions");
    }
    if (improvements.length === 0) {
      improvements.push("Continue practicing to enhance response confidence");
    }

    return { strengths, improvements };
  };

const handleFinishInterview = async () => {
  console.log("Finishing interview initiated");
  speechRecognitionRef.current.stop();
  if (speechSynthesisRef.current) {
    window.speechSynthesis.cancel();
  }
  if (responseTimeoutRef.current) {
    clearTimeout(responseTimeoutRef.current);
  }
  if (continueListeningTimeoutRef.current) {
    clearTimeout(continueListeningTimeoutRef.current);
  }

  let recordingUrl: string | undefined = undefined;
  let recordedBlobs: Blob[] | null = null;
  if (isRecording) {
    try {
      console.log("Stopping recorder");
      const recordedBlob = await recorderRef.current.stop();
      if (recordedBlob) {
        recordedBlobs = [recordedBlob]; // Wrap in array for saveSessionWithRecording
        console.log("Recording blob obtained, size:", recordedBlob.size);
      } else {
        console.warn("No final recording data");
        toast({
          title: "No Recording",
          description:
            "No video data was recorded, but the interview metadata will be saved.",
          variant: "default",
        });
      }
    } catch (error: any) {
      console.error(
        "Error stopping recorder:",
        error.name,
        error.message,
        error.stack
      );
      toast({
        title: "Recording Error",
        description:
          "Failed to save the final recording, but the interview will still end.",
        variant: "destructive",
      }); // Fixed: Added closing brace before parenthesis
    }
    setIsRecording(false);
  }

  // Rest of the function remains unchanged
  if (mediaStream) {
    mediaStream.getTracks().forEach((track) => track.stop());
    setMediaStream(null);
    console.log("Media stream stopped");
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
    console.log("Final transcript after updating last answer:", finalTranscript);
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
        {
          ...updatedSession,
          recordings: undefined,
          feedback: {
            ...updatedSession.feedback,
            recording: undefined,
          },
        },
        recordedBlobs
      );
      console.log("Recording URL from Firebase:", recordingUrl);

      if (recordingUrl) {
        updatedSession.recordings = [recordingUrl];
        updatedSession.feedback.recording = [recordingUrl];
        toast({
          title: "Recording Saved",
          description: recordingUrl.startsWith("blob:")
            ? "Recording saved locally (Firebase unavailable)."
            : "Recording uploaded to Firebase Storage.",
          variant: "default",
        });
      } else {
        console.warn("No recording URL returned from saveSessionWithRecording");
        toast({
          title: "Recording Save Failed",
          description:
            "Failed to save recording to Firebase, but session metadata saved.",
          variant: "default",
        });
      }
    } catch (error: any) {
      console.error(
        "Error saving session with recording:",
        error.message,
        error.stack
      );
      toast({
        title: "Save Error",
        description: "Failed to save session and recording to Firebase. Data saved locally if possible.",
        variant: "destructive",
      });
    }
  } else if (session) {
    try {
      await saveSessionWithRecording(updatedSession, []);
      toast({
        title: "Session Saved",
        description: "Session metadata saved without recording.",
        variant: "default",
      });
    } catch (error: any) {
      console.error(
        "Error saving session without recording:",
        error.message,
        error.stack
      );
      toast({
        title: "Save Error",
        description: "Failed to save session metadata.",
        variant: "destructive",
      });
    }
  }

  console.log("Updated session:", updatedSession);
  setSession(updatedSession);
  onComplete(updatedSession.feedback!);

  toast({
    title: "Interview Completed",
    description:
      "Your interview session has ended. Check the feedback for details.",
    variant: "default",
  });
  console.log("Interview finished, feedback sent");
};

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
      <div className="md:col-span-2 bg-[#11011E] aspect-video relative overflow-hidden">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-[#7000FF] blur-[180px] opacity-25 rounded-full pointer-events-none"></div>
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-[#FF00C7] blur-[180px] opacity-25 rounded-full pointer-events-none"></div>
        
        {hasMediaPermission ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-auto"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[rgba(255,255,255,0.02)] text-[#ECF1F0] font-raleway border border-[rgba(255,255,255,0.05)]">
            <p>Camera access required</p>
          </div>
        )}

        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
          <Button
            variant="outline"
            size="icon"
            className={`rounded-full h-10 w-10 border-2 transition duration-200 ${
              micEnabled
                ? "bg-[#0FAE96] border-[#0FAE96] text-white hover:bg-[#0FAE96]/80 hover:scale-105"
                : "bg-[#FF00C7]/80 border-[#FF00C7] text-white hover:bg-[#FF00C7] hover:scale-105"
            } focus-outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0FAE96]`}
            onClick={toggleMic}
          >
            {micEnabled ? (
              <Mic className="h-4 w-4 ml-2.5" />
            ) : (
              <MicOff className="h-4 w-4 ml-2.5" />
            )}
            <span className="sr-only">{micEnabled ? "Disable microphone" : "Enable microphone"}</span>
          </Button>

          <Button
            variant="outline"
            size="icon"
            className={`rounded-full h-10 w-10 border-2 transition duration-200 ${
              videoEnabled
                ? "bg-[#0FAE96] border-[#0FAE96] text-white hover:bg-[#0FAE96]/80 hover:scale-105"
                : "bg-[#FF00C7]/80 border-[#FF00C7] text-white hover:bg-[#FF00C7] hover:scale-105"
            } focus-outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0FAE96]`}
            onClick={toggleVideo}
          >
            {videoEnabled ? (
              <Video className="h-4 w-4 ml-2.5" />
            ) : (
              <VideoOff className="h-4 w-4 ml-2.5" />
            )}
            <span className="sr-only">{videoEnabled ? "Disable video" : "Enable video"}</span>
          </Button>

          <Button
            variant="outline"
            size="icon"
            className={`rounded-full h-10 w-10 border-2 transition duration-200 ${
              voiceEnabled
                ? "bg-[#0FAE96] border-[#0FAE96] text-white hover:bg-[#0FAE96]/80 hover:scale-105"
                : "bg-[rgba(255,255,255,0.1)] border-[rgba(255,255,255,0.1)] text-[#ECF1F0] hover:bg-[rgba(255,255,255,0.2)] hover:scale-105"
            } focus-outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0FAE96]`}
            onClick={toggleVoice}
          >
            {voiceEnabled ? (
              <Volume2 className="h-4 w-4 ml-2.5" />
            ) : (
              <VolumeX className="h-4 w-4 ml-2.5" />
            )}
            <span className="sr-only">{voiceEnabled ? "Disable voice" : "Enable voice"}</span>
          </Button>
        </div>
      </div>

      <div className="p-6 bg-[#11011E] border-l border-[rgba(255,255,255,0.05)] flex flex-col h-[calc(64vh-64px)]">
        <div className="overflow-y-auto flex-1 hide-scrollbar">
          {conversation.map((message, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg ${
                message.role === "assistant"
                  ? "bg-[rgba(15,174,150,0.1)] border border-[rgba(15,174,150,0.2)]"
                  : "bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]"
              }`}
            >
              <p className="text-sm font-inter text-[#B6B6B6]">
                <span className={message.role === "assistant" ? "text-[#0FAE96] font-medium" : "text-[#ECF1F0] font-medium"}>
                  {message.role === "assistant" ? "AI: " : "You: "}
                </span>
                {message.content}
              </p>
            </div>
          ))}

          {isProcessing && (
            <div className="p-3 bg-[rgba(15,174,150,0.05)] rounded-lg border border-[rgba(15,174,150,0.1)]">
              <p className="text-sm font-inter text-[#0FAE96] animate-pulse">Thinking...</p>
            </div>
          )}
        </div>

        <div className="mt-4 space-y-3">
          <Button
            className="w-full bg-[#0FAE96] text-white font-raleway font-semibold text-base px-6 py-3 rounded-md transition duration-200 hover:scale-105 focus-outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0FAE96] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            onClick={startListening}
            disabled={isListening || isProcessing || !waitingForResponse}
          >
            {isListening ? "Listening..." : "Speak"}
          </Button>
          <Button
            className="w-full bg-[#FF00C7]/80 text-white font-raleway font-semibold text-base px-6 py-3 rounded-md transition duration-200 hover:scale-105 focus-outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#FF00C7] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            onClick={handleFinishInterview}
          >
            End Interview
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InterviewSession;