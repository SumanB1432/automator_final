'use client'

import { Suspense, useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRouter } from 'next/navigation';
import { FiPlayCircle, FiMic, FiBarChart2 } from 'react-icons/fi';
import "./interview.css"
import { isFirebaseConfigured } from "@/firebase/config";
import { storage } from "@/firebase/config";
import SearchParamsHandler from './SearchParamsHandler.jsx';
import { getDatabase, ref, get } from 'firebase/database';
import app from '@/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebase/config';
import { toast } from 'react-toastify';

const Index = () => {
  const router = useRouter();
  const [uid, setUid] = useState("");
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [isdone, setIsDone] = useState(false);
  const [showMessage, setShowMessage] = useState(false); // New state for message visibility
  const db = getDatabase(app);
  console.log("⚠️ Using Firebase?", isFirebaseConfigured, "Storage:", !!storage);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUid(user.uid);
        let title = localStorage.getItem("title") || "";
        let code = localStorage.getItem("hr_code") || "";
        let actualTitle = title.replace(/\s/g, '');
        setTitle(actualTitle);
        setCode(code);
      } else {
        toast({
          title: "Authentication Error",
          description: "No user is signed in. Please log in.",
          variant: "destructive",
        });
        router.push("/sign-in");
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let checkUserData = async function(uid, title, code) {
      let key = code + title;
      let checkUserRef = ref(db, `user/${uid}/interViewRecords/${key}`);
      let snapshot = await get(checkUserRef);
      if (snapshot.exists()) {
        setIsDone(snapshot.val());
      } else {
        console.log("No Interview Records Found");
      }
    };
    if (uid && title && code) {
      checkUserData(uid, title, code);
    }
  }, [uid, title, code]);

  let checkSecurity = function() {
    if (isdone) {
      setShowMessage(true); // Show message if interview is already done
    } else {
      setShowMessage(false); // Hide message before redirecting
      router.push("/interview/interview_dashboard");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#11011E] relative overflow-hidden">
      {/* Blur Effects */}
      <div className="absolute top-0 left-0 w-[675px] h-[314px] bg-[#7000FF] opacity-50 blur-[200px]"></div>
      <div className="absolute bottom-0 right-0 w-[675px] h-[314px] bg-[#FF00C7] opacity-50 blur-[200px]"></div>

      {/* Suspense Boundary for SearchParamsHandler */}
      <Suspense fallback={<div>Loading...</div>}>
        <SearchParamsHandler />
      </Suspense>

      {/* Main Content */}
      <main className="flex-grow relative z-10">
        <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto">
          <div className="text-center mb-16 mt-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#ECF1F0] mb-6">
              Ace Your Next Interview with AI Coaching
            </h2>
            <p className="text-xl text-[#B6B6B6] max-w-3xl mx-auto">
              Practice interviews with our AI-powered coach. Get real-time feedback, improve your responses, and build confidence for the real thing.
            </p>
            <div className="mt-10">
              <Button
                className="bg-[#0FAE96] hover:bg-[#1a9c89] text-white font-raleway font-semibold text-base px-6 py-3 rounded-md shadow-md hover:shadow-lg transition-colors duration-300 ease-in-out active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#0FAE96]/50 focus:ring-offset-2"
                onClick={checkSecurity}
                size="lg"
              >
                Start Practice Interview
              </Button>
            </div>
            {/* Message Display */}
            {showMessage && (
              <div className="mt-6 p-4 bg-[rgba(255,75,75,0.1)] border border-[rgba(255,75,75,0.5)] rounded-md text-[#ECF1F0] max-w-md mx-auto">
                <h3 className="text-lg font-semibold">Interview Already Completed</h3>
                <p className="text-base">
                  You have already completed this interview. You are not allowed to attempt it again.
                </p>
              </div>
            )}
          </div>

          {/* Features Section */}
          <div id="features" className="grid md:grid-cols-3 gap-10 md:gap-12 mt-20">
            {[
              {
                icon: (
                  <svg
                    className="h-8 w-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    ></path>
                  </svg>
                ),
                title: "AI-Powered Questions",
                description: "Our system generates realistic interview questions tailored to your target role and experience level."
              },
              {
                icon: (
                  <svg
                    className="h-8 w-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    ></path>
                  </svg>
                ),
                title: "Video Recording & Analysis",
                description: "Record sessions to review your delivery, body language, and tone alongside AI analysis."
              },
              {
                icon: (
                  <svg
                    className="h-8 w-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    ></path>
                  </svg>
                ),
                title: "Instant, Actionable Feedback",
                description: "Receive comprehensive AI analysis on answer clarity, relevance, and impact, with actionable improvement tips."
              }
            ].map((feature, index) => (
              <Card
                key={index}
                className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] rounded-xl shadow-lg hover:shadow-xl hover:shadow-[#0FAE96]/20 hover:border-[#0FAE96]/50 transition-all duration-300 ease-in-out transform hover:-translate-y-1 text-center flex flex-col items-center p-6 md:p-8"
              >
                <div className="w-16 h-16 mb-6 rounded-full bg-gradient-to-br from-[#0FAE96] to-[#077b6a] text-white flex items-center justify-center shadow-md flex-shrink-0">
                  {feature.icon}
                </div>
                <h3 className="text-xl md:text-2xl font-semibold text-[#ECF1F0] mb-3">{feature.title}</h3>
                <p className="text-[#B6B6B6] text-base leading-relaxed">{feature.description}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 md:py-28 px-4 md:px-8 bg-gradient-to-b from-[rgba(255,255,255,0.02)] to-[rgba(255,255,255,0.04)] text-[#ECF1F0]">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-lg md:text-xl text-[#B6B6B6] max-w-3xl mx-auto mb-16 md:mb-20">
              Land your dream job faster. Our AI-powered interview practice is designed to be simple, insightful, and effective in just three steps.
            </p>
            <div className="grid md:grid-cols-3 gap-10 md:gap-12">
              {[
                {
                  icon: <FiPlayCircle size={40} />,
                  title: "Initiate Your Session",
                  description: "Select your target role and difficulty to start a tailored practice interview simulation."
                },
                {
                  icon: <FiMic size={40} />,
                  title: "Engage & Respond",
                  description: "Interact naturally. Answer the AI interviewer's questions verbally or via text, just like a real interview."
                },
                {
                  icon: <FiBarChart2 size={40} />,
                  title: "Receive Instant Feedback",
                  description: "Get comprehensive, AI-driven analysis of your answers, covering clarity, relevance, and delivery."
                }
              ].map((step, index) => (
                <div
                  key={index}
                  className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] rounded-xl p-8 shadow-lg hover:shadow-xl hover:shadow-[#0FAE96]/20 hover:border-[#0FAE96]/50 transition-all duration-300 ease-in-out transform hover:-translate-y-1 flex flex-col items-center"
                >
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#0FAE96] to-[#077b6a] text-white flex items-center justify-center mb-6 shadow-md">
                    {step.icon}
                  </div>
                  <h3 className="text-2xl font-semibold text-[#ECF1F0] mb-3">{step.title}</h3>
                  <p className="text-[#B6B6B6] text-base leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;