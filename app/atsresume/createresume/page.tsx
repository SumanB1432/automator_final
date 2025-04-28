"use client";
import React, { useRef, useEffect, useState } from "react";
import LeftSidebar from "@/components/left/LeftSidebar";
import Resume from "@/components/resume_templates/bonzor";
import Rightsidebar from "@/components/right/Rightsidebar";
import { useReactToPrint } from "react-to-print";
import { ref, getDatabase, get } from "firebase/database";
import { getAuth } from "firebase/auth";
import app from "@/firebase/config";
import fillResumeData from "../../../components/oneclick/page"; // Import the function
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useThemeStore } from "@/app/store";
import Luxary from "@/components/resume_templates/luxary";
import Unique from "@/components/resume_templates/Unique";
import Classic from "@/components/resume_templates/Classic";
import { HiMenu, HiX } from "react-icons/hi";
import { fetchUserDetails } from "@/components/fetch_user_details/page";
import { toast } from "react-toastify";

const CreateResume: React.FC = () => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [uid, setUid] = useState<string | null>(null);
  const [resumeData, setResumeData] = useState<unknown>(null);
  const [apiKey, setApiKey] = useState("");
  const [job_description, setJD] = useState<string | null>(null);
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
  const [previous_resume_data, setRD] = useState<string | null>(null);
  const { selectedTemplate } = useThemeStore(); // Get selected template from store

  const db = getDatabase(app);
  console.log(uid, "uid");
  const datapath = ref(db, "user/" + uid + "/" + "resume_data/" + "newData/");

  // In CreateResume.tsx
  const templateComponents: Record<string, React.FC> = {
    bonzor: Resume,
    luxary: Luxary,
    unique: Unique,
    classic: Classic,
  };

  // Fix the selected template logic
  const SelectedTemplateComponent =
    templateComponents[selectedTemplate.toLowerCase()] || Resume;

  useEffect(() => {
    const fetchDataAsync = async () => {
      try {
        const snapshot = await get(datapath);
        if (snapshot.exists()) {
          console.log("Retrieved Data:", snapshot.val());
        } else {
          console.log("No data available");
        }
      } catch (error) {
        console.error("Error retrieving data:", error);
      }
    };

    fetchDataAsync();
  });

  useEffect(() => {
    const auth = getAuth();
    setUid(auth.currentUser ? auth.currentUser.uid : null);
  }, [])

  useEffect(() => {
    const fetchData = async function () {
      let api_key = localStorage.getItem("api_key");
      const userData = await fetchUserDetails(uid);

      if (userData) {
        const { apiKey, urd, rd } = userData;

        if (apiKey === "API_KEY_NOT_FOUND") {
          toast.error("Please Upload Your Gemini Key!");
          setTimeout(() => {
            window.location.href = "/gemini";
          }, 2000);
          return; // important! stop further execution
        }

        if (rd === "RD_DATA_NOT_FOUND") {
          toast.error("Please Upload Your Resume!");
          setTimeout(() => {
            window.location.href = "/resume2";
          }, 2000);
          return; // important! stop further execution
        }

        api_key = apiKey;
        setApiKey(api_key);
        localStorage.setItem("api_key", apiKey);
      }

      const JD = localStorage.getItem("jobDescription");
      const RD = localStorage.getItem("resumeText");
      setJD(JD);
      setRD(RD);
      if (!api_key) {
        console.error("API Key is missing in localStorage!");
        return;
      }
      console.log(api_key);
      setApiKey(api_key);
    }
    fetchData()
  }, [uid]);

  const geminiClient = new GoogleGenerativeAI(apiKey);


  async function analyzeResumeForSkill() {
    // console.log("from analyzer",);

    const prompt = `You are an AI that generates structured resume data in JSON format. Below, I will provide previous resume data and a job description. Your task is to carefully analyze both, understand the job requirements, and update the resume while ensuring that all fields remain correctly structured.

### Instructions:
1. **Retain personal details exactly as they are** without any modifications.
2. **Modify the 'skills' section** to align with the job description while maintaining the structure. Ensure that all skills are grouped under relevant headings and formatted as in the example JSON.
3. **Update the 'experiences' section** by emphasizing responsibilities and achievements relevant to the job description. Retain the same structure and formatting.
4. **Preserve the JSON structure** exactly as shown in the example, ensuring that key names remain unchanged.
5. **Ensure uniformity in field values** (e.g., the format of dates, lists, objects) so that the modified resume is consistent with the example structure.

### Input Data:
**Previous Resume Data:**
${previous_resume_data}

**Job Description:**
${job_description}

### Output Format:
Return the updated resume in **JSON format** ensuring all key names, structures, and data formats are identical to the following example:

\ \ \json
      {
        "personalData": {
          "name": "John Doe",
            "headline": "Software Developer",
              "summary": "Experienced in web development",
                "profile": "profile-url",
                  "address": "123 Main St, City",
                    "phone": "1234567890",
                      "email": "john@example.com",
                        "skill": "React, Node.js",
                          "hobbie": "Reading, Coding",
                            "language": "English, French",
                              "twitter": "john_twitter",
                                "linkedin": "john_linkedin",
                                  "github": "john_github",
                                    "location": "City, Country",
                                      "website": "www.johndoe.com"
        },
        "projects": [
          {
            "name": "Portfolio Website",
            "description": "Personal website",
            "date": "2023",
            "website": "www.portfolio.com"
          }
        ],
          "educations": [
            {
              "institute": "XYZ University",
              "areaofstudy": "Computer Science",
              "typeofstudy": "Bachelors",
              "dateRange": "2015-2019",
              "score": "3.8 GPA"
            }
          ],
            "certificates": [
              {
                "title": "AWS Certified",
                "awarder": "Amazon",
                "date": "2022",
                "link": "www.aws.com"
              }
            ],
              "experiences": [
                {
                  "company": "Tech Corp",
                  "position": "Software Engineer",
                  "dateRange": "2020-2024",
                  "location": "Remote",
                  "description": "Developed web applications"
                }
              ],
                "skills": [
                  {
                    "heading": "Frontend",
                    "items": "React, JavaScript"
                  },
                  {
                    "heading": "Backend",
                    "items": "Node.js, JavaScript, Mongodb"
                  }
                ],
                  "achievements": [
                    {
                      "name": "Hackathon Winner",
                      "details": "Won XYZ Hackathon"
                    }
                  ],
                    "languages": [
                      {
                        "heading": "English",
                        "option": "Fluent"
                      }
                    ]
      }
                    \ \ \
      `;

    try {
      const model = geminiClient.getGenerativeModel({
        model: "gemini-2.0-flash",
      });
      const response = await model.generateContent(prompt);
      const textResponse =
        response?.response?.candidates[0]?.content?.parts[0]?.text;

      if (!textResponse) {
        return { message: "Empty response from Gemini API." };
      }
      console.log("response", textResponse);

      const regex = /```json([\s\S]*?)```/;
      const match = textResponse.match(regex);

      if (!match) {
        return {
          message: "No valid JSON output found in Gemini API response.",
        };
      }
      console.log("match", match[1]);
      const parsedJSON = JSON.parse(match[1]);
      setResumeData(parsedJSON);
      return parsedJSON;
    } catch (error) {
      console.error("Error processing Gemini API response:", error);
      return {
        message: "Failed to process Gemini API response.",
        error: error.message,
      };
    }
  }

  useEffect(() => {




    analyzeResumeForSkill();
    // setResumeData(sampleData);
    // fillResumeData(sampleData)
  }, [job_description, previous_resume_data, apiKey]);

  useEffect(() => {
    let isInitialized = false;

    const initializeData = async () => {
      if (isInitialized || !apiKey || !job_description || !previous_resume_data)
        return;

      console.log("Initializing resume data with:", {
        apiKey,
        job_description,
        previous_resume_data,
      });
      isInitialized = true;
      const result = await analyzeResumeForSkill();
      if (result && typeof result !== "string" && !("message" in result)) {
        setResumeData(result);
      } else {
        console.error("Failed to process resume data:", result);
      }
    };

    initializeData();
  }, [apiKey, job_description, previous_resume_data]);

  useEffect(() => {
    if (resumeData) {
      console.log("Final Resume Data set:", resumeData);
      fillResumeData(resumeData);
    }
  }, [resumeData]);

  const handlePrint = useReactToPrint({
    contentRef,
    pageStyle: `
        @page {
          size: 210mm 297mm; /* A4 size */
          margin: 10px;
        }
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        header, footer {
          display: none !important;
        }
      `,
  });

  const toggleSidebar = (sidebar: "left" | "right") => {
    if (sidebar === "left") {
      setIsLeftSidebarOpen(!isLeftSidebarOpen);
      setIsRightSidebarOpen(false); // Always close right when toggling left
    } else {
      setIsRightSidebarOpen(!isRightSidebarOpen);
      setIsLeftSidebarOpen(false); // Always close left when toggling right
    }
  };

  return (
    <>
      {resumeData ? (
        <div className="relative flex flex-col lg:flex-row h-screen sm:max-h-full overflow-hidden">
          {/* Hamburger Menu for Mobile */}
          <div className="lg:hidden flex justify-between p-4 bg-[#0F011E] border-b border-gray-700 fixed w-full top-0 z-50">
            <button
              onClick={() => toggleSidebar("left")}
              className="text-white text-2xl"
              aria-label={
                isLeftSidebarOpen ? "Close Left Sidebar" : "Open Left Sidebar"
              }
            >
              {isLeftSidebarOpen ? <HiX /> : <HiMenu />}
            </button>
            <button
              onClick={() => toggleSidebar("right")}
              className="text-white text-2xl"
              aria-label={
                isRightSidebarOpen
                  ? "Close Right Sidebar"
                  : "Open Right Sidebar"
              }
            >
              {isRightSidebarOpen ? <HiX /> : <HiMenu />}
            </button>
          </div>

          {/* Backdrop for Mobile Sidebars */}
          {(isLeftSidebarOpen || isRightSidebarOpen) && (
            <div
              className="lg:hidden fixed inset-0 bg-black/50 z-30"
              onClick={() => {
                setIsLeftSidebarOpen(false);
                setIsRightSidebarOpen(false);
              }}
            />
          )}

          {/* Left Sidebar */}
          <div
            className={`lg:w-3/12 w-3/4 h-screen scrollbar-hidden print:hidden transition-transform duration-300 ${isLeftSidebarOpen ? "translate-x-0" : "-translate-x-full"
              } lg:translate-x-0 fixed lg:static bg-[#0F011E] z-40 top-0 pt-16 lg:pt-0 overflow-x-hidden`}
          >
            <LeftSidebar />
          </div>

          {/* Main Resume Content */}
          <div
            ref={contentRef}
            className="w-full flex-1 bg-gray-200 overflow-y-auto scrollbar-hidden print:h-auto print:p-0 print:w-[210mm] mx-auto mt-16 lg:mt-0 relative z-10"
          >
            <div className="resume-container w-full max-w-[210mm] bg-gray-200 mx-auto min-h-screen print:min-h-0 print:bg-white">
              <SelectedTemplateComponent
                key={selectedTemplate}
                className="mb-0 pb-0 w-full"
              />
            </div>
          </div>

          {/* Right Sidebar with Print Button */}
          <div
            className={`lg:w-3/12 w-3/4 h-screen scrollbar-hidden print:hidden transition-transform duration-300 ${isRightSidebarOpen ? "translate-x-0" : "translate-x-full"
              } lg:translate-x-0 fixed lg:static bg-[#0F011E] z-40 top-0 pt-16 lg:pt-0 right-0 overflow-x-hidden`}
          >
            <div className="p-4">
              <button
                className="w-full inline-flex items-center justify-center px-6 py-3 mb-2 text-sm sm:text-base font-semibold text-white bg-[#0FAE96] rounded-md hover:bg-[#0FAE96]/90 focus:outline-none focus:ring-2 focus:ring-[#0FAE96]/60"
                onClick={() => handlePrint()}
              >
                🖨️ Print Resume
              </button>
            </div>
            <Rightsidebar />
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-screen w-full bg-[#11011E]">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-[#00FFD1] border-solid"></div>
            <p className="text-white text-base sm:text-lg font-medium">
              Analyzing and building your resume...
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateResume;