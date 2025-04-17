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

const CreateResume: React.FC = () => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [uid, setUid] = useState<string | null>(null);
  const [resumeData, setResumeData] = useState<unknown>(null);
  const [apiKey, setApiKey] = useState("");
  const [job_description, setJD] = useState<string | null>(null);;
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
  const SelectedTemplateComponent = templateComponents[selectedTemplate.toLowerCase()] || Resume;


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
    const api_key = localStorage.getItem("api_key");
    const JD = localStorage.getItem("jobDescription");
    const RD = localStorage.getItem("resumeText")
    setJD(JD);
    setRD(RD);
    if (!api_key) {
      console.error("API Key is missing in localStorage!");
      return;
    }
    console.log(api_key);
    setApiKey(api_key);
  }, []);

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
    `



    try {
      const model = geminiClient.getGenerativeModel({ model: "gemini-2.0-flash" });
      const response = await model.generateContent(prompt);
      const textResponse = response?.response?.candidates[0]?.content?.parts[0]?.text;

      if (!textResponse) {
        return { message: "Empty response from Gemini API." };
      }
      console.log("response", textResponse)

      const regex = /```json([\s\S]*?)```/;
      const match = textResponse.match(regex);

      if (!match) {
        return { message: "No valid JSON output found in Gemini API response." };
      }
      console.log("match", match[1])
      const parsedJSON = JSON.parse(match[1]);
      setResumeData(parsedJSON)
      return parsedJSON;
    } catch (error) {
      console.error("Error processing Gemini API response:", error);
      return { message: "Failed to process Gemini API response.", error: error.message };
    }
  }

  useEffect(() => {
    // if (!uid) return;

    // const db = getDatabase(app);
    // const datapath = ref(db, `user/${uid}/resume_data/newData/`);

    // const fetchDataAsync = async () => {
    //   try {
    //     const snapshot = await get(datapath);
    //     if (snapshot.exists()) {
    //       console.log("Retrieved Data:", snapshot.val());
    //       setResumeData(snapshot.val()); // Store data in state
    //       fillResumeData(snapshot.val()); // Fill Zustand state
    //     } else {
    //       console.log("No data available");
    //     }
    //   } catch (error) {
    //     console.error("Error retrieving data:", error);
    //   }
    // };

    // fetchDataAsync();

   

    analyzeResumeForSkill()
    // setResumeData(sampleData);
    // fillResumeData(sampleData)
  }, [job_description, previous_resume_data, apiKey]);

  useEffect(() => {
    let isInitialized = false;
  
    const initializeData = async () => {
      if (isInitialized || !apiKey || !job_description || !previous_resume_data) return;
  
      console.log("Initializing resume data with:", { apiKey, job_description, previous_resume_data });
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
        size: 250mm 350mm; /* Custom page size */
        margin: 10; /* Remove margins to use full width */
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

  return (
    <>
      {resumeData ? (
    <div className="flex h-screen overflow-hidden">
      {/* Left Sidebar */}
      <div className="w-3/12 h-screen overflow-y-auto scrollbar-hidden print:hidden">
        <LeftSidebar />
      </div>

      {/* Main Resume Content */}
      <div
  ref={contentRef}
  className="w-[250mm] flex-1 p-4 bg-gray-200 overflow-y-auto scrollbar-hidden print:h-auto print:p-0 print:w-[250mm] mx-auto"
>
  <div className="resume-container w-full max-w-[250mm] bg-gray-200 mx-auto p-4 pt-4 pb-0 min-h-full print:p-0 print:w-full print:bg-white">
    <SelectedTemplateComponent
      key={selectedTemplate} // Force re-mount on template change
      className="mb-0 pb-0"
    />
  </div>
</div>

      {/* Right Sidebar with Print Button */}
      <div className="w-3/12 h-screen overflow-y-auto scrollbar-hidden print:hidden flex flex-col">
        <div className="p-4">
          <button
            className="w-70% inline-flex items-center justify-center px-6 py-3 mb-2 text-base font-semibold text-white bg-[#0FAE96] rounded-md hover:bg-[#0FAE96]/90 focus:outline-none focus:ring-2 focus:ring-[#0FAE96]/60"
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
          <p className="text-white text-lg font-medium">Analyzing and building your resume...</p>
        </div>
      </div>

    )}
  </>


  );
};

export default CreateResume;