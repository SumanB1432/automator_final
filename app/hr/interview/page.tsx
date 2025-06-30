'use client'
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRouter } from 'next/navigation';
import { FiPlayCircle, FiMic, FiBarChart2, FiCopy, FiCheck } from 'react-icons/fi';
import "./interview.css"
import app, { isFirebaseConfigured } from "@/firebase/config";
import { storage } from "@/firebase/config"; // Import Realtime Database
import { ref, get, getDatabase } from 'firebase/database'; // Realtime Database methods
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase/config";
import { toast } from "react-toastify";
import CryptoJS from 'crypto-js';

const Index = () => {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState("");
  const [uid, setUid] = useState("");
  const [jobTitles, setJobTitles] = useState([]); // State for job titles
  const [selectedTitle, setSelectedTitle] = useState(""); // State for selected job title
  const secret = "a1d604f8305dd7882459029f21891b84";
  console.log("⚠️ Using Firebase?", isFirebaseConfigured, "Storage:", !!storage);
  const db = getDatabase(app);

  // Fetch job profiles from Realtime Database
  const fetchJobProfiles = async (userUid) => {
    try {
      const jobProfilesRef = ref(db, `hr/${userUid}/jobProfiles`);
      const snapshot = await get(jobProfilesRef);
      const data = snapshot.val(); // Get the data object
      const titles = [];

      // Check if data exists and is an object
      if (data && typeof data === 'object') {
        // Iterate over the object keys (e.g., backendnodejs, prductmanagger)
        Object.values(data).forEach((jobProfile) => {
          if (jobProfile.title) {
            titles.push(jobProfile.title);
          }
        });
      }
      console.log(titles)
      return titles;
    } catch (error) {
      console.error("Error fetching job profiles:", error);
      toast.error("Failed to load job profiles.");
      return [];
    }
  };

  // Fetch job profiles and set up auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userUid = user.uid;
        setUid(userUid);
        const titles = await fetchJobProfiles(userUid); // Fetch job profiles
        setJobTitles(titles);
        // Set default selected title if available
        if (titles.length > 0) {
          setSelectedTitle(tiles[0]);
        }
      }
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);

  // Update URL when UID or selectedTitle changes
  useEffect(() => {
    if (uid) {
      const encryptedUID = CryptoJS.AES.encrypt(uid, secret).toString();
      const encodedUID = encodeURIComponent(encryptedUID);

      if (selectedTitle) {
        const encodedTitle = encodeURIComponent(selectedTitle);
        setUrl(`${window.location.origin}/interview/?code=${encodedUID}&title=${encodedTitle}`);
      } else {
        setUrl("Please"); // Clear URL if title is not selected
      }
    }
  }, [uid, selectedTitle]);


  // Handle job title selection
  const handleTitleChange = (event) => {
    setSelectedTitle(event.target.value);
  };

  const copyToClipboard = () => {
    if (!url) return;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Check HR login status
  useEffect(() => {
    const isHRLoggedIn = localStorage.getItem("IsLoginAsHR");
    if (isHRLoggedIn !== "true") {
      toast.warning("Access denied. Please log in as an HR user.");
      setTimeout(() => {
        window.location.href = "/hr/login";
      }, 2000);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#11011E] relative overflow-hidden">
      {/* Blur Effects */}
      <div className="absolute top-0 left-0 w-[675px] h-[314px] bg-[#7000FF] opacity-50 blur-[200px]"></div>
      <div className="absolute bottom-0 right-0 w-[675px] h-[314px] bg-[#FF00C7] opacity-50 blur-[200px]"></div>

      {/* Main Content */}
      <main className="flex-grow relative z-10">
        <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto">
          <div className="text-center mb-16 mt-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#ECF1F0] mb-6">
              Share This AI Interview Link with Candidates
            </h2>
            <p className="text-xl text-[#B6B6B6] max-w-3xl mx-auto">
              Use AI to automate your first round of interviews — no need to manually screen every applicant.
            </p>
            <div className="mt-10">
              <Button
                className="bg-[#077b6a] hover:bg-[#1a9c89] text-white font-raleway font-semibold text-base px-6 py-3 rounded-md shadow-md hover:shadow-lg transition-colors duration-300 ease-in-out active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#0FAE96]/50 focus:ring-offset-2"
                onClick={() => router.push("/hr/interview/interviewList")}
                size="lg"
              >
                Visit Dashboard
              </Button>
            </div>
            {/* Job Title Dropdown */}
            {jobTitles.length > 0 ? (
              <div className="mt-6">
                <select
                  value={selectedTitle}
                  onChange={handleTitleChange}
                  className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] text-[#ECF1F0] rounded-md p-2 w-full max-w-md mx-auto focus:outline-none focus:ring-2 focus:ring-[#0FAE96]/50"
                >
                  <option value="" className="bg-[#1d0239]" disabled>Select a job title</option>
                  {jobTitles.map((title, index) => (
                    <option className="bg-[#1d0239] text-[#ECF1F0]" key={index} value={title}>
                      {title}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <p className="mt-6 text-[#B6B6B6]">No job profiles available.</p>
            )}
            {/* URL Link */}
            {selectedTitle ? (
              <div className="mt-6 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] rounded-lg p-4 flex items-center justify-between space-x-4 shadow-md">
                <span className="text-[#ECF1F0] break-all">
                  {url ? url : "Loading..."}
                </span>
                <button
                  onClick={copyToClipboard}
                  className={`text-[#0FAE96] hover:text-white transition-colors ${!url && "cursor-not-allowed opacity-50"}`}
                  disabled={!url}
                >
                  {copied ? <FiCheck className="w-5 h-5" /> : <FiCopy className="w-5 h-5" />}
                </button>
              </div>
            ) : (
              <p className="mt-6 text-red-500 text-xl">⚠️ Please select a role to generate the interview link.</p>
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
                title: "Automated first-round interview",
                description: "Save time by letting AI conduct structured interviews."
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
                title: "View performance & feedback",
                description: "Access responses, scores, and AI analysis directly in your dashboard."
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
                title: "You Stay in Control",
                description: "Review AI-generated feedback and make your own decisions."
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
          <div className="max-w-7xl mx-auto flex justify-center items-center mt-16">
            <Button
              className="bg-[#077b6a] hover:bg-[#1a9c89] text-white font-raleway font-semibold text-base px-6 py-3 rounded-md shadow-md hover:shadow-lg transition-colors duration-300 ease-in-out active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#0FAE96]/50 focus:ring-offset-2"
              onClick={() => router.push("/interview/")}
            >
              See It in Action
            </Button>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 md:py-28 px-4 md:px-8 bg-gradient-to-b from-[rgba(255,255,255,0.02)] to-[rgba(255,255,255,0.04)] text-[#ECF1F0]">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-lg md:text-xl text-[#B6B6B6] max-w-3xl mx-auto mb-16 md:mb-20">
              Use AI to pre-screen candidates so you don’t have to.
            </p>
            <div className="grid md:grid-cols-3 gap-10 md:gap-12">
              {[
                {
                  icon: <FiPlayCircle size={40} />,
                  title: "Share the Interview Link",
                  description: "Send the AI interview link to candidates—then login and setup account. They can start instantly."
                },
                {
                  icon: <FiMic size={40} />,
                  title: "Candidates Complete AI Interviews",
                  description: "Candidates answer real interview questions via voice. Each session is recorded and analyzed by AI."
                },
                {
                  icon: <FiBarChart2 size={40} />,
                  title: "Review Insights on Dashboard",
                  description: "Access every candidate’s performance, video recording, and AI-generated feedback under Talent Insights. No need to sit through every interview."
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