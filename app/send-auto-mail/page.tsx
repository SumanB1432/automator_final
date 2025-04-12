"use client";
import { useState, useEffect, useRef } from "react";
import { FaBriefcase } from 'react-icons/fa';
import CompanyCard from '@/components/companies/CompanyCard';
import { toast } from "react-toastify";
import {onAuthStateChanged } from "firebase/auth";
import app, { auth } from "@/firebase/config";
import { getDatabase, ref, get } from "firebase/database";
import { GoogleGenerativeAI } from "@google/generative-ai";

const Page = () => {
  const [isSending, setIsSending] = useState(true);
  const [isSent, setIsSent] = useState(false);
  const [emailArray, setEmailArray] = useState<string[]>([]);
  const [companies, setCompanies] = useState<unknown[]>([]);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [uid, setUid] = useState("");
  const [urd, setUrd] = useState("");
  const [jsonData, setJsonData] = useState<unknown[]>([]);
  const [jobTitle, setJobTitle] = useState<string[]>([]);
  const [exp, setExp] = useState<number>(0);
  const [location, setLocation] = useState<string[]>([]);
  const hasRun = useRef(false);
  const [dotCount, setDotCount] = useState(0);

  const db = getDatabase(app);
  if (typeof window !== "undefined"){
  const gemini_key = localStorage.getItem("api_key");
  }

  useEffect(() => {
    if (typeof window !== "undefined"){
    const email = localStorage.getItem("userEmail");
    const name = localStorage.getItem("userName");
    const verified = localStorage.getItem("emailVerified");
    if (verified !== "true") {
      window.location.href = "/email_auth";
    }
    setUserEmail(email);
    setUserName(name);
    }
 

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUid(user.uid);
      } else {
        toast.error("No user logged-in!");
        window.location.href = "./sign-in";
      }
    });

    return () => unsubscribe();
  }, []);
  // GET URD FROM DATABASE / LOCAL-STORAGE
  useEffect(() => {
    if (!uid) return;

    const getUserData = async () => {
      if (typeof window !== "undefined"){
      const URD = localStorage.getItem("URD");
      if (URD) {
        setUrd(URD);
      }
      }
   
      else {
        try {
          const userRef = ref(db, `user/${uid}/forms/keyvalues/URD`);
          const snapshot = await get(userRef);
          if (snapshot.exists()) {
            setUrd(snapshot.val());
            if (typeof window !== "undefined"){
            localStorage.setItem("URD", snapshot.val())
            }
          } else {
            toast.error("No URD data found");
          }
        } catch (err) {
          toast.error("Error fetching user data",err);
        }
      };
    }

    getUserData();
  }, [uid]);

  useEffect(() => {
    const checkVerifyEmail = async function (userEmail, userName) {
      if (userEmail && userName) {
        const response = await fetch("https://jobemailsending-hrjd6kih3q-uc.a.run.app/send-job-application", {
          method: "POST",
          body: JSON.stringify({
            sender_email: userEmail,
            company_email: "suman85bera@gmail.com",  // Dynamically use recruiter email
            resume_link: "https://firebasestorage.googleapis.com/v0/b/jobform-automator-website.appspot.com/o/Resume%2FResume_suman.pdf?alt=media&token=6384e8a7-bdfb-4522-a95d-e1f73099768c",
            sender_name: userName,
            text: "hello"
          }),
          headers: {
            "Content-Type": "application/json",
          },
        });
       
        if (response.status === 401) {
          // Redirect to EmailAuth component (or your authentication route)
          toast.info("For security reasons, please verify your email again.");
          if (typeof window !== "undefined"){
          localStorage.setItem("emailPermissionGranted", "false");
          }
          setTimeout(() => {
            window.location.href = "/email_auth"; // Adjust route as needed
          }, 2000); // Give the user a moment to see the toast
        }
      }
    }
    checkVerifyEmail(userEmail, userName)

  }, [userEmail])

  useEffect(() => {
    if (!urd) return;

    const fetchGeminiResponse = async () => {
      try {
        const exampleOutput = `[
          {"jobTitle": "Python Developer", "location": "remote", "experience": "2-5"},
          {"jobTitle": "Backend Developer", "location": "remote", "experience": "2-5"},
          {"jobTitle": "Full Stack Developer", "location": "remote", "experience": "2-5"},
          {"jobTitle": "MERN Stack Developer", "location": "remote", "experience": "2-5"},
          {"jobTitle": "Software Engineer", "location": "remote", "experience": "2-5"}
        ]`;

        const userPrompt = `Analyze the following resume and extract job titles, location, and experience range.
          Response format:
          \`\`\`json
          [
              {"jobTitle": "<Job Title>", "location": "<Preferred Location>", "experience": "<Experience Range>"}
          ]
          \`\`\`
          Resume: ${urd}
          Example Output:
          \`\`\`json
          ${exampleOutput}
          \`\`\``;

        const genAI = new GoogleGenerativeAI(gemini_key);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const response = await model.generateContent(userPrompt);
        const textResponse = await response.response.text();

        const jsonMatch = textResponse.match(/```json\n([\s\S]*?)\n```/);
        const jsonOutput = jsonMatch ? JSON.parse(jsonMatch[1]) : JSON.parse(textResponse);

        console.log("✅ Gemini Parsed Response:", jsonOutput);
        setJsonData(jsonOutput);
      } catch (error) {
        console.error("❌ Error in fetchGeminiResponse:", error);
      }
    };

    fetchGeminiResponse();
  }, [urd]);

  useEffect(() => {
    if (!jsonData || jsonData.length === 0) return;

    const processData = () => {
      const jobTitles = jsonData.map((job) => job.jobTitle);
      setJobTitle(jobTitles);

      const avgExperience =
        jsonData.reduce((sum, job) => {
          const [min, max] = job.experience.split("-").map(Number);
          return sum + (min + max) / 2;
        }, 0) / jsonData.length;
      setExp(avgExperience);

      const locations = [...new Set(jsonData.map((job) => job.location))];
      setLocation(locations);
    };

    processData();
  }, [jsonData]);

  
    useEffect(() => {
      if (!isSending) return;
  
      const interval = setInterval(() => {
        setDotCount((prev) => (prev + 1) % 4); // 0 → 1 → 2 → 3 → 0
      }, 500); // update every 0.5s
  
      return () => clearInterval(interval); // cleanup
    }, [isSending]);

  useEffect(() => {
    if (!userEmail) return;

    // const verified = localStorage.getItem("emailVerified");
    // if (verified !== "true") {
    //   window.location.href = "/email_auth";
    // }

    const DB_email = userEmail.replace(/\./g, ",");
    const userRef = ref(db, `users/${DB_email}`);

    get(userRef).then((snapshot) => {
      if (!snapshot.exists()) {
        window.location.href = "/email_auth";
      }
    }).catch((err) => {
      console.error("Database Error:", err.message);
    });
  }, [userEmail]);

  useEffect(() => {
    if (!jobTitle.length) return;

    const fetchCompany = async () => {
      try {
        console.log(jobTitle, location);
        const response = await fetch("https://api-hrjd6kih3q-uc.a.run.app/job_search", {
          method: "POST",
          body: JSON.stringify({
            jobTitle,
            location: location,
            experience: `${exp}` || "0-1",
            geminiKey: gemini_key
          }),
          headers: {
            "Content-Type": "application/json",
          },
        });

        const responseData = await response.json();
        const jobData = responseData.data;

        console.log("Job search successful!", responseData, jobData);
        setCompanies(jobData);

        if (jobData) {
          const emails = jobData.map((company: unknown) => company.recruiter_email);
          setEmailArray(emails);
          console.log("Recruiter Emails:", emails);
        }
      } catch (err) {
        console.error("Error fetching companies:", err.message);
      }
    };

    fetchCompany();
  }, [jobTitle]);


  

  useEffect(() => {
    if (emailArray.length === 0 || hasRun.current) return; // Prevent double execution

    hasRun.current = true; // Mark as executed

    const sendEmails = async () => {
      try {
        for (const email of emailArray) {
          const response = await fetch("https://jobemailsending-hrjd6kih3q-uc.a.run.app/send-job-application", {
            method: "POST",
            body: JSON.stringify({
              sender_email: userEmail,
              company_email: email,  // Dynamically use recruiter email
              resume_link: "https://firebasestorage.googleapis.com/v0/b/jobform-automator-website.appspot.com/o/Resume%2FResume_suman.pdf?alt=media&token=6384e8a7-bdfb-4522-a95d-e1f73099768c",
              sender_name: userName,
              text: "hello"
            }),
            headers: {
              "Content-Type": "application/json",
            },
          });

          console.log(`Email sent to ${email}`);

          // Wait for 5 seconds before sending the next email
          if (response.ok) {
           

          } else {
            const data = await response.json();
            console.error("Error from server:", data.error);

            if (response.status === 401) {
              // Redirect to EmailAuth component (or your authentication route)
              toast.info("For security reasons, please verify your email again.");
              if (typeof window !== "undefined"){
              localStorage.setItem("emailPermissionGranted", "false");
              }
              setTimeout(() => {
                window.location.href = "/email_auth"; // Adjust route as needed
              }, 2000); // Give the user a moment to see the toast
            } else {
              toast.error(`Error: ${data.error}`); // Display other errors
            }
            await new Promise((resolve) => setTimeout(resolve, 5000));
          }
        }
        setIsSending(false);
        setIsSent(true);
      } catch (err) {
        console.error("Error sending emails:", err.message);
      }
    };

    sendEmails();
  }, [emailArray]);


  return (
<div className="min-h-screen bg-gradient-to-b from-[#11011E] via-[#35013e] to-[#11011E] py-12 text-white">
  <div className="max-w-7xl mx-auto px-4 space-y-6">
    <h1 className="text-3xl font-bold flex items-center gap-3">
      <FaBriefcase className="text-white" />
      {isSending ? `Searching Jobs${".".repeat(dotCount)}` : "Applications Status"}
    </h1>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {companies.map((company, index) => (
        <CompanyCard
          key={index}
          {...company}
          isSending={isSending}
          isSent={isSent}
        />
      ))}
    </div>
  </div>
</div>

  );
};

export default Page;
