"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import InterviewSetup from "@/components/interview/InterviewSetup";
import InterviewSession from "@/components/interview/InterviewSession";
import { InterviewFeedback } from "@/components/interview/InterviewFeedback"; // Change to named import
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createSessionId } from "@/lib/session-utils";
import { useToast } from "@/components/ui/use-toast";
import { saveSession, storeRecording } from "@/lib/db-service";
import { getDatabase, ref, get } from "firebase/database";
import app, { auth } from "@/firebase/config";
import { toast } from "react-toastify";
import { onAuthStateChanged } from "firebase/auth";

export type SessionType = {
  sessionId: string;
  role?: string;
  skillLevel?: string;
  jobDescription?: string;
  recordings?: string[];
  transcript?: { question: string; answer: string }[];
  feedback?: {
    strengths: string[];
    improvements: string[];
    overallScore?: number;
    transcript?: { question: string; answer: string }[];
    recordings?: string[];
  };
  isCompleted?: boolean;
};

let isThrottled = false;

const Interview = () => {
  const [activeTab, setActiveTab] = useState<string>("setup");
  const [session, setSession] = useState<SessionType | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [warningCount, setWarningCount] = useState<number>(0);
  const [showWarningBanner, setShowWarningBanner] = useState<boolean>(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [title, setTitle] = useState<string>("");
  const [actualTitle, setActualTitle] = useState<string>("");
  const [uid, setUid] = useState<string>("");
  const [jd, setJD] = useState<string>("");
  const [hrUid,setHruid] = useState<string>("");
  const router = useRouter();
  const db = getDatabase(app)

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log(user.uid, "uid", "hello");
        let hrUid = localStorage.getItem("hr_code") || "";
        console.log("hrUID",hrUid)
        setHruid(hrUid)
        setUid(user.uid); // Set UID when user is authenticated
      } else {
        toast({
          title: "Authentication Error",
          description: "No user is signed in. Please log in.",
          variant: "destructive",
        });
        // Optionally redirect to login page
        router.push("/sign-in");
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);
  // Initialize session
  useEffect(() => {
    let title = localStorage.getItem("title") || "";
    setActualTitle(title)
    title = title.replace(/\s/g, '');
    console.log("title",title)
    setTitle(title);
    if (!session) {
      setSession({
        sessionId: createSessionId(),
        transcript: [],
        recordings: [],
      });
    }
  }, []);

  // Get Job Description From Hr through JobTitle

useEffect(() => {
  let getJob = async function(hrUID:any){
    console.log("Fetching job for:", title, uid);
    console.log(hrUid,title)
    console.log(`hr/${hrUid}/jobProfiles/${title}`)
    let low_title=  title.toLowerCase();
    const jobProfileRef = ref(db, `hr/${hrUid}/jobProfiles/${low_title}`);
    let snapsort = await get(jobProfileRef);
    console.log(snapsort.val())
    if(snapsort.exists()){
      let jobDescription = snapsort.val().jdText; // Renamed variable to avoid confusion
      console.log("Fetched JD:", jobDescription);
      setJD(jobDescription); // This should set the state
      console.log("JD state should be updated");
    } else {
      console.log("No job profile found for:", title);
    }
  }
  
  // Only run if both title and uid are available
  if(hrUid){
    getJob(hrUid);
  }
    
  
}, [title, hrUid])

  // Start video stream when interview begins
  useEffect(() => {
    if (activeTab === "session" && !stream) {
      const startVideo = async () => {
        try {
          let mediaStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });
          // CHANGE: Log stream details
          console.log("Stream initialized:", mediaStream, mediaStream.getTracks());
          setStream(mediaStream);
        } catch (err) {
          console.warn("Failed to get video+audio stream:", err); // CHANGE: Log warning
          // CHANGE: Fallback to video-only
          try {
            const videoOnlyStream = await navigator.mediaDevices.getUserMedia({
              video: true,
            });
            console.log("Video-only stream initialized:", videoOnlyStream, videoOnlyStream.getTracks());
            setStream(videoOnlyStream);
            toast({
              title: "Audio Warning",
              description: "Could not access microphone. Continuing with video only.",
              variant: "warning",
            });
          } catch (videoErr) {
            console.error("Error accessing webcam:", videoErr.message, videoErr.stack); // CHANGE: Detailed error logging
            toast({
              title: "Webcam Error",
              description: "Could not access your webcam. Please ensure it is connected and permissions are granted.",
              variant: "destructive",
            });
          }
        }
      };
      startVideo();
    }
  }, [activeTab, toast]);

  // Clean up video stream
  useEffect(() => {
    return () => {
      if (stream) {
        // CHANGE: Log cleanup
        console.log("Cleaning up stream:", stream, stream.getTracks());
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
    };
  }, [stream]);

  // Handle focus loss
  useEffect(() => {
    if (activeTab === "session") {
      const handleFocusLoss = () => {
        if (isThrottled) return;
        isThrottled = true;
        setTimeout(() => {
          isThrottled = false;
        }, 1000);

        const newCount = warningCount + 1;
        setWarningCount(newCount);
        setShowWarningBanner(true);

        toast({
          title: "Focus Lost",
          description: `Please stay on the tab. Warning ${newCount}/3.`,
          variant: newCount < 3 ? "warning" : "destructive",
        });

        if (newCount >= 3 && session && !session.isCompleted) {
          completeInterview({
            strengths: [],
            improvements: ["Switched tabs multiple times"],
            overallScore: 0,
          });
        }
      };

      const handleVisibilityChange = () => {
        if (document.visibilityState === "hidden") {
          handleFocusLoss();
        }
      };

      const handleBlur = () => {
        handleFocusLoss();
      };

      document.addEventListener("visibilitychange", handleVisibilityChange);
      window.addEventListener("blur", handleBlur);

      return () => {
        document.removeEventListener("visibilitychange", handleVisibilityChange);
        window.removeEventListener("blur", handleBlur);
      };
    }
  }, [activeTab, session, warningCount, toast]);

  const startInterview = (
    role: string,
    skillLevel: string,
    jobDescription: string
  ) => {
    if (session) {
      setSession({
        ...session,
        role,
        skillLevel,
        jobDescription,
        isCompleted: false,
        recordings: [],
      });
      setActiveTab("session");

      // Prompt user for fullscreen mode
      if (confirm("Would you like to enter fullscreen mode for a distraction-free experience?")) {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
          elem.requestFullscreen();
        } else if ((elem as any).webkitRequestFullscreen) {
          (elem as any).webkitRequestFullscreen();
        } else if ((elem as any).msRequestFullscreen) {
          (elem as any).msRequestFullscreen();
        }
      }

      setWarningCount(0);

      toast({
        title: "Interview Started",
        description: `Starting ${skillLevel} level interview for ${role} role`,
      });

      saveSession({
        sessionId: session.sessionId,
        role,
        skillLevel,
        jobDescription,
        transcript: [],
        recordings: [],
        isCompleted: false,
      }).catch((err) => {
        console.error("Error saving initial session:", err.message, err.stack); // CHANGE: Detailed error logging
      });
    }
  };

  const completeInterview = async (feedback: SessionType["feedback"]) => {
    if (session) {
      setIsProcessing(true);

      try {
        if (document.fullscreenElement) {
          document.exitFullscreen().catch((err) => {
            console.warn("Failed to exit fullscreen:", err);
          });
        }

        // Stop video stream
        if (stream) {
          console.log("Stopping stream in completeInterview:", stream, stream.getTracks()); // CHANGE: Log stream stop
          stream.getTracks().forEach((track) => track.stop());
          setStream(null);
        }

        let storedRecordings: string[] = session.recordings || [];
        if (session.recordings && session.recordings.length > 0) {
          try {
            storedRecordings = await Promise.all(
              session.recordings.map(async (recordingUrl, index) => {
                const blob = await fetch(recordingUrl).then((res) => res.blob());
                const url = await storeRecording(`${session.sessionId}_${index}`, [blob]);
                return url;
              })
            );
          } catch (storageError) {
            console.error("Error storing recordings:", storageError.message, storageError.stack); // CHANGE: Detailed error logging
            toast({
              title: "Storage Note",
              description: "Your recordings are saved locally for this session.",
            });
          }
        }

        const updatedSession = {
          ...session,
          feedback,
          recordings: storedRecordings,
          isCompleted: true,
        };

        setSession(updatedSession);
        setShowWarningBanner(false);

        await saveSession({
          sessionId: updatedSession.sessionId,
          role: updatedSession.role,
          skillLevel: updatedSession.skillLevel,
          jobDescription: updatedSession.jobDescription,
          recordings: updatedSession.recordings,
          transcript: updatedSession.transcript,
          feedback: updatedSession.feedback,
          isCompleted: true,
        }).catch((saveError) => {
          console.error("Error saving completed session:", saveError.message, saveError.stack); // CHANGE: Detailed error logging
          toast({
            title: "Save Warning",
            description:
              "Your session couldn't be saved to the cloud. It remains available for this browser session.",
            variant: "destructive",
          });
        });

        setActiveTab("feedback");
        toast({
          title: "Interview Completed",
          description: "Your interview session has been analyzed and feedback is ready.",
        });
      } catch (error) {
        console.error("Error completing interview:", error.message, error.stack); // CHANGE: Detailed error logging
        toast({
          title: "Error",
          description: "There was a problem processing your interview data.",
          variant: "destructive",
        });

        if (feedback) {
          setSession({
            ...session,
            feedback,
            isCompleted: true,
          });
          setActiveTab("feedback");
        }
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-[#11011E] text-[#B6B6B6] font-inter overflow-x-hidden">
      {/* Decorative background blurs */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -left-24 h-[400px] w-[400px] rounded-full bg-[#7000FF] opacity-20 blur-3xl"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 right-0 h-[550px] w-[550px] rounded-full bg-[#FF00C7] opacity-20 blur-3xl"
      />

      {/* Header */}
      <header className="w-full py-4 px-4 sm:px-6 md:px-8 border-b border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)] backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => router.push("/interview")}
              className="bg-transparent text-[#0FAE96] font-raleway font-semibold text-base px-4 py-2 rounded-md transition duration-200 hover:bg-[#0FAE96]/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0FAE96]"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-xl sm:text-2xl font-bold font-raleway text-[#ECF1F0]">
              InterviewFlow
            </h1>
          </div>

          {activeTab === "session" && (
            <div className="flex items-center space-x-2">
              {isRecording ? (
                <div className="flex items-center">
                  <span className="h-3 w-3 bg-red-500 rounded-full animate-ping mr-2" />
                  <span className="text-sm text-red-400">Recording</span>
                </div>
              ) : (
                <span className="text-sm text-[#B6B6B6]">Not Recording</span>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 py-8 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto w-full">
        {showWarningBanner && activeTab === "session" && (
          <div className="mb-6 p-4 bg-yellow-200/10 text-yellow-300 border border-yellow-500/50 rounded-md text-center font-medium">
            Warning: You have switched tabs or lost focus. Please stay on this tab.
          </div>
        )}

        {isProcessing && (
          <div className="mb-6 p-4 border-l-4 border-[#0FAE96] bg-[#0fae9615] rounded-md text-center animate-pulse">
            <p className="text-[#0FAE96] font-medium">Processing your interview data...</p>
          </div>
        )}

        <Card className="border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)] shadow-xl rounded-2xl overflow-hidden">
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-3 bg-[rgba(255,255,255,0.02)] border-b border-[rgba(255,255,255,0.05)] p-2">
                {[
                  { label: "Setup", value: "setup", disabled: activeTab === "session" && isRecording },
                  {
                    label: "Interview",
                    value: "session",
                    disabled: !session?.role || (activeTab === "session" && isRecording),
                  },
                  { label: "Feedback", value: "feedback", disabled: !session?.isCompleted },
                ].map(({ label, value, disabled }) => (
                  <TabsTrigger
                    key={value}
                    value={value}
                    disabled={disabled}
                    className="relative px-4 py-2 font-raleway font-semibold text-[#ECF1F0] rounded-md transition-all duration-200 hover:bg-[#0FAE96]/10 data-[state=active]:bg-[#0FAE96]/20 data-[state=active]:text-[#ECF1F0] data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0FAE96] focus-visible:ring-offset-2 focus-visible:ring-offset-[#11011E]"
                  >
                    {label}
                    <span className="absolute left-1/2 bottom-0 h-0.5 w-0 bg-[#0FAE96] rounded transition-all duration-300 data-[state=active]:w-6 data-[state=active]:-translate-x-1/2" />
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="setup" className="p-6 sm:p-8">
                <InterviewSetup
                  onStart={startInterview}
                  session={session}
                  actualTitle={actualTitle}
                  jd={jd}
                />
              </TabsContent>

              <TabsContent value="session" className="p-0">
                <InterviewSession
                  session={session}
                  setSession={setSession}
                  isRecording={isRecording}
                  setIsRecording={setIsRecording}
                  onComplete={completeInterview}
                  stream={stream}
                />
              </TabsContent>

              <TabsContent value="feedback" className="p-6 sm:p-8">
                <InterviewFeedback session={session} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Interview;