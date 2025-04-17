"use client";
import { useState, useEffect, useRef, use } from "react";
import { FaBriefcase } from 'react-icons/fa';
import CompanyCard from '@/components/companies/CompanyCard';
import { toast } from "react-toastify";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import app, { auth } from "@/firebase/config";

import { getDatabase, ref, set, get } from "firebase/database";
const { GoogleGenerativeAI } = require("@google/generative-ai");

const Page = () => {
  const [isSending, setIsSending] = useState(true);
  const [isSent, setIsSent] = useState(false);
  const [emailArray, setEmailArray] = useState<string[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [uid, setUid] = useState("");
  const [urd, setUrd] = useState("");
  const [jsonData, setJsonData] = useState<any[]>([]);
  const [jobTitle, setJobTitle] = useState<string[]>([]);
  const [exp, setExp] = useState<number>(0);
  const [location, setLocation] = useState<string[]>([]);
  const hasRun = useRef(false);
  const [gemini_key, setGeminiKey] = useState("");
  const [emailLimitReached, setEmailLimitReached] = useState(false);

  const db = getDatabase(app);


  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    const name = localStorage.getItem("userName");
    const verified = localStorage.getItem("emailVerified");
    const gemini_key = localStorage.getItem("api_key");
    setGeminiKey(gemini_key)
    if (verified !== "true") {
      window.location.href = "/email_auth";
    }
    setUserEmail(email);
    setUserName(name);

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
  useEffect(() => {
    const getEmailCount = async function () {
      try {
        const emailCountRef = ref(db, `user/${uid}/Payment/email_count`);
        const snapshot = await get(emailCountRef);
        const email_count = snapshot.val()


        if (email_count >= 100) {
          setEmailLimitReached(true);
          toast.warning(
            <div className="p-4 bg-gradient-to-r from-purple-800 via-pink-600 to-red-500 rounded-xl shadow-lg text-white">
              <h2 className="text-lg font-bold">💼 Email Limit Reached</h2>
              <p className="text-sm mt-1">
                You've hit the <span className="font-semibold">100 email</span> limit on your free plan.
              </p>
              <p className="text-sm">Upgrade to <span className="underline font-semibold">Premium</span> to continue sending job applications automatically.</p>
            </div>,
            {
              autoClose: 8000,
            }
          );
          return;
        }

      } catch (error) {
        console.error("Error updating email count in database:", error.message);
      }
    }
    getEmailCount()

  }, [uid])

  // GET URD FROM DATABASE / LOCAL-STORAGE
  useEffect(() => {
    if (!uid) return;

    const getUserData = async () => {
      if (emailLimitReached) return; // ⛔ prevent execution
      let URD = localStorage.getItem("URD");
      if (URD) {
        setUrd(URD);
      }
      else {
        try {
          const userRef = ref(db, `user/${uid}/forms/keyvalues/URD`);
          const snapshot = await get(userRef);
          if (snapshot.exists()) {
            setUrd(snapshot.val());
            localStorage.setItem("URD", snapshot.val())
          } else {
            toast.error("No URD data found");
          }
        } catch (err) {
          toast.error("Error fetching user data");
        }
      };
    }

    getUserData();
  }, [uid]);

  useEffect(() => {

    let checkVerifyEmail = async function (userEmail, userName) {
      if (emailLimitReached) return; // ⛔ prevent execution
      if (userEmail && userName) {
        let response = await fetch("https://jobemailsending-hrjd6kih3q-uc.a.run.app/send-job-application", {
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
        const data = await response.json();
        if (response.status === 401) {
          // Redirect to EmailAuth component (or your authentication route)
          toast.info("For security reasons, please verify your email again.");
          localStorage.setItem("emailPermissionGranted", "false");
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
      if (emailLimitReached) return; // ⛔ prevent execution
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
      if (emailLimitReached) return; // ⛔ prevent execution
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
    if (!userEmail) return;
    if (emailLimitReached) return; // ⛔ prevent execution

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
      if (emailLimitReached) return; // ⛔ prevent execution
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
          const emails = jobData.map((company: any) => company.recruiter_email);
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
      if (emailLimitReached) return; // ⛔ prevent execution
      try {
        let sentEmailCount = 0;
        for (const email of emailArray) {
          let response = await fetch("https://jobemailsending-hrjd6kih3q-uc.a.run.app/send-job-application", {
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
            sentEmailCount += 1;
            const data = await response.json();
            console.log(`Email sent to ${email}`);

          } else {
            const data = await response.json();
            console.error("Error from server:", data.error);

            if (response.status === 401) {
              // Redirect to EmailAuth component (or your authentication route)
              toast.info("For security reasons, please verify your email again.");
              localStorage.setItem("emailPermissionGranted", "false");
              setTimeout(() => {
                window.location.href = "/email_auth"; // Adjust route as needed
              }, 2000); // Give the user a moment to see the toast
            } else {
              toast.error(`Error: ${data.error}`); // Display other errors
            }
            await new Promise((resolve) => setTimeout(resolve, 5000));
          }
          // Update Firebase email count
          try {
            const emailCountRef = ref(db, `user/${uid}/Payment/email_count`);
            const snapshot = await get(emailCountRef);
            let existingCount = snapshot.exists() ? snapshot.val() : 0;
            const updatedCount = existingCount + sentEmailCount;

            await set(emailCountRef, updatedCount);

            if (updatedCount >= 100) {
              toast.warning(
                <div className="p-4 bg-gradient-to-r from-purple-800 via-pink-600 to-red-500 rounded-xl shadow-lg text-white">
                  <h2 className="text-lg font-bold">💼 Email Limit Reached</h2>
                  <p className="text-sm mt-1">
                    You've hit the <span className="font-semibold">100 email</span> limit on your free plan.
                  </p>
                  <p className="text-sm">Upgrade to <span className="underline font-semibold">Premium</span> to continue sending job applications automatically.</p>
                </div>,
                {
                  autoClose: 8000,
                }
              );
              return;
            }

          } catch (error) {
            console.error("Error updating email count in database:", error.message);
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


  const handleUpdatePlan = function () {
    window.location.href = "/payment"
  }


  return (


    <div className="min-h-screen bg-gradient-to-b from-[#11011E] via-[#35013e] to-[#11011E] py-12 text-white">
      <div className="max-w-7xl w-full flex flex-col gap-6">
        {/* Heading or Email Limit Message */}
        {emailLimitReached && (
          <>
         <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-[600px] p-10 rounded-[12px] bg-[#11011E] border border-[#0FAE96] shadow-[0_0_12px_2px_#DFDFDF] text-center flex flex-col gap-5 scale-[1.2]">

              <h2 className="text-[32px] font-bold text-[#FFFFFF]">Email Limit Reached</h2>
              <p className="text-[16px] leading-6 text-[#B6B6B6]">
                Hit the <span className="font-semibold text-[#FFFFFF]">100-email</span> free plan limit.
              </p>
              <p className="text-[16px] leading-6 text-[#B6B6B6]">
                Go <span className="underline font-semibold text-[#0FAE96]">Premium</span> to send more.
              </p>
              <button
                className="bg-[#0FAE96] text-[#FFFFFF] font-semibold py-2 px-6 rounded-[10px] hover:bg-[#0C8C79] transition-opacity duration-150 w-full max-w-[200px] mx-auto"
                onClick={handleUpdatePlan}
              >
                Upgrade
              </button>
            </div>
          </>
        )}

        {/* Company Cards */}
        {!emailLimitReached && (<div>
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <FaBriefcase className="text-white" />
            {isSending ? "Searching Jobs..." : "Applications"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((company, index) => (
              <div
                key={index}
                className="bg-[#11011E] border border-[#0FAE96] rounded-[10px] p-6 shadow-[0_0_8px_2px_#DFDFDF] hover:opacity-90 transition-opacity duration-150"
              >
                <CompanyCard
                  {...company}
                  isSending={isSending}
                  isSent={isSent}
                />
              </div>
            ))}
          </div>
        </div>
        )}
      </div>
    </div>

  );
};

export default Page;