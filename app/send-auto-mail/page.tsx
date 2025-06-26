"use client";
import { useState, useEffect, useRef } from "react";
import { FaBriefcase } from "react-icons/fa";
import CompanyCard from "@/components/companies/CompanyCard";
import { toast } from "react-toastify";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import app, { auth } from "@/firebase/config";
import { getDatabase, ref, set, get } from "firebase/database";
const { GoogleGenerativeAI } = require("@google/generative-ai");

const Page = () => {
  const [isSending, setIsSending] = useState(false); // Changed to false to prevent automatic sending
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
  const [gemini_key, setGeminiKey] = useState("");
  const [emailLimitReached, setEmailLimitReached] = useState(false);
  const [resume, setResume] = useState<string>("");
  const resumeFetched = useRef(false);
  const hasRun = useRef(false);

  const db = getDatabase(app);

  // Step 1: Fetch user data and resume
  useEffect(() => {
    const email = localStorage.getItem("userEmail") || "";
    const name = localStorage.getItem("userName") || "";
    const verified = localStorage.getItem("emailVerified");
    const gemini_key = localStorage.getItem("api_key") || "";
    setGeminiKey(gemini_key);
    if (verified !== "true") {
      window.location.href = "/email_auth";
      return;
    }
    setUserEmail(email);
    setUserName(name);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUid(user.uid);
        const DB_email = email.replace(/\./g, ",");
        const userRef = ref(db, `users/${DB_email}`);
        get(userRef)
          .then((snapshot) => {
            if (!snapshot.exists()) {
              toast.info("Please verify your email to continue.");
              localStorage.setItem("emailPermissionGranted", "false");
              setTimeout(() => {
                window.location.href = `/auth/google?email=${encodeURIComponent(email)}`;
              }, 2000);
            }
          })
          .catch((err) => {
            console.error("Database Error:", err.message);
            toast.error("Error verifying authentication. Please try again.");
          });

        const getUserData = async () => {
          if (emailLimitReached) return;
          try {
            let URD = localStorage.getItem("URD");
            const resumeRef = ref(db, `user/${user.uid}/forms/keyvalues/RD`);
            const resumeSnapshot = await get(resumeRef);
            if (resumeSnapshot.exists()) {
              setResume(resumeSnapshot.val());
              resumeFetched.current = true;
            } else {
              toast.error("No resume data found in database.");
              setTimeout(() => {
                window.location.href = "/resume2";
              }, 2000);
            }
            if (URD) {
              setUrd(URD);
            } else {
              const userRef = ref(db, `user/${user.uid}/forms/keyvalues/URD`);
              const snapshot = await get(userRef);
              if (snapshot.exists()) {
                setUrd(snapshot.val());
                localStorage.setItem("URD", snapshot.val());
              } else {
                toast.error("No URD data found.");
                setTimeout(() => {
                  window.location.href = "/resume2";
                }, 2000);
              }
            }
          } catch (err) {
            console.error("Error fetching user data:", err.message);
            toast.error("Error fetching user data.");
          }
        };

        getUserData();
      } else {
        toast.error("No user logged-in!");
        window.location.href = "/sign-in";
      }
    });

    return () => unsubscribe();
  }, []);

  // Step 2: Check authentication status
  useEffect(() => {
    if (!userEmail || emailLimitReached || !resumeFetched.current) return;

    const checkAuthStatus = async () => {
      try {
        const response = await fetch(
          `https://jobemailsending-hrjd6kih3q-uc.a.run.app/check-auth?email=${encodeURIComponent(userEmail)}`
        );
        const data = await response.json();
        if (!response.ok || !data.authenticated) {
          toast.info("For security reasons, please verify your email again.");
          localStorage.setItem("emailPermissionGranted", "false");
          setTimeout(() => {
            window.location.href = data.reauthUrl || "/email_auth";
          }, 3000);
        }
      } catch (err) {
        console.error("Error checking auth status:", err.message);
        toast.error("Failed to verify authentication. Please try again.");
      }
    };

    checkAuthStatus();
  }, [userEmail, resume]);

  // Step 3: Check email count limit
  useEffect(() => {
    if (!uid || emailLimitReached) return;

    const getEmailCount = async () => {
      try {
        const emailCountRef = ref(db, `user/${uid}/Payment/email_count`);
        const snapshot = await get(emailCountRef);
        const email_count = snapshot.val() || 0;
        console.log("Fetched email count from Firebase:", email_count);

        if (email_count >= 10000) {
          setEmailLimitReached(true);
          toast.warning(
            <div className="p-4 bg-gradient-to-r from-purple-800 via-pink-600 to-red-500 rounded-xl shadow-lg text-white">
              <h2 className="text-lg font-bold">💼 Email Limit Reached</h2>
              <p className="text-sm mt-1">
                You've hit the <span className="font-semibold">10000 email</span> limit on your free plan.
              </p>
              <p className="text-sm">
                Upgrade to <span className="underline font-semibold">Premium</span> to continue sending job applications automatically.
              </p>
            </div>,
            { autoClose: 8000 }
          );
        }
      } catch (error) {
        console.error("Error fetching email count:", error.message);
        toast.error("Failed to fetch email count.");
      }
    };

    getEmailCount();
  }, [uid]);

  // Step 4: Reusable email sending function with validation
  const sendEmail = async (companyEmail: string) => {
    if (!userEmail) {
      toast.error("Sender email is missing.");
      return false;
    }
    if (!companyEmail) {
      toast.error("Company email is missing.");
      return false;
    }
    if (!resume) {
      toast.error("Resume link is missing.");
      return false;
    }
    if (!userName) {
      toast.error("Sender name is missing.");
      return false;
    }

    try {
      const response = await fetch("https://jobemailsending-hrjd6kih3q-uc.a.run.app/send-job-application", {
        method: "POST",
        body: JSON.stringify({
          sender_email: userEmail,
          company_email: companyEmail,
          resume_link: resume,
          sender_name: userName,
          text: "hello",
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        console.log(`Email sent to ${companyEmail}`);
        return true;
      } else {
        const data = await response.json();
        console.error("Error from server:", data.error);
        if (response.status === 401 && data.reauthUrl) {
          toast.info("For security reasons, please verify your email again.");
          localStorage.setItem("emailPermissionGranted", "false");
          setTimeout(() => {
            window.location.href = data.reauthUrl || "/email_auth";
          }, 2000);
        } else {
          toast.error(`Error sending email to ${companyEmail}: ${data.error}`);
        }
        return false;
      }
    } catch (err) {
      console.error("Error sending email:", err.message);
      toast.error(`Failed to send email to ${companyEmail}.`);
      return false;
    }
  };

  // Step 5: Authentication email sending
  useEffect(() => {
    if (!userEmail || !userName || !resumeFetched.current || emailLimitReached) return;

    const checkVerifyEmail = async () => {
      const success = await sendEmail("suman85bera@gmail.com");
      if (!success) {
        console.error("Authentication email failed.");
      }
    };

    checkVerifyEmail();
  }, [userEmail, userName, resume]);

  // Step 6: Fetch Gemini response
  useEffect(() => {
    if (!urd || emailLimitReached) return;

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
        const validatedOutput = jsonOutput.filter(
          (job) => job.jobTitle && job.location && typeof job.experience === "string" && job.experience.includes("-")
        );
        console.log("✅ Validated Gemini Response:", validatedOutput);
        setJsonData(validatedOutput);
      } catch (error) {
        console.error("❌ Error in fetchGeminiResponse:", error);
        toast.error("Failed to process resume with Gemini API.");
      }
    };

    fetchGeminiResponse();
  }, [urd, gemini_key]);

  // Step 7: Process Gemini data
  useEffect(() => {
    if (!jsonData || jsonData.length === 0 || emailLimitReached) return;

    const processData = () => {
      try {
        const jobTitles = jsonData
          .filter((job) => job.jobTitle)
          .map((job) => job.jobTitle);
        setJobTitle(jobTitles);

        const validJobs = jsonData.filter(
          (job) => typeof job.experience === "string" && job.experience.includes("-")
        );
        const avgExperience =
          validJobs.length > 0
            ? validJobs.reduce((sum, job) => {
                const [min, max] = job.experience.split("-").map(Number);
                if (isNaN(min) || isNaN(max)) {
                  console.warn(`Invalid experience range for job: ${job.jobTitle}, experience: ${job.experience}`);
                  return sum;
                }
                return sum + (min + max) / 2;
              }, 0) / validJobs.length
            : 0;
        setExp(avgExperience);

        const locations = [...new Set(jsonData.filter((job) => job.location).map((job) => job.location))];
        setLocation(locations);
      } catch (error) {
        console.error("Error processing Gemini data:", error.message);
        toast.error("Failed to process job data.");
      }
    };

    processData();
  }, [jsonData]);

  // Step 8: Verify user email in database
  useEffect(() => {
    if (!userEmail || emailLimitReached) return;

    const DB_email = userEmail.replace(/\./g, ",");
    const userRef = ref(db, `users/${DB_email}`);

    get(userRef)
      .then((snapshot) => {
        if (!snapshot.exists()) {
          window.location.href = "/email_auth";
        }
      })
      .catch((err) => {
        console.error("Database Error:", err.message);
        toast.error("Error verifying user data.");
      });
  }, [userEmail]);

  // Step 9: Handle email data from extension and localStorage
  useEffect(() => {
    if (emailLimitReached) return;

    const storedCompanies = localStorage.getItem("companies");
    if (storedCompanies) {
      try {
        const parsedCompanies = JSON.parse(storedCompanies);
        setCompanies(parsedCompanies);
        const emails = parsedCompanies
          .map((company: any) => company.email)
          .filter((email: string) => email !== "Not found");
        setEmailArray(emails);
        console.log("Loaded companies from localStorage:", parsedCompanies);
      } catch (err) {
        console.error("Error parsing stored companies:", err.message);
      }
    }

    const handleEmailsData = (event: any) => {
      const jobs = event.detail;
      console.log("Received jobs from extension:", jobs);

      const filteredJobs = jobs.filter((job: any) => job.email !== "Not found");
      localStorage.setItem("companies", JSON.stringify(filteredJobs));
      setCompanies(filteredJobs);

      if (filteredJobs.length > 0) {
        const emails = filteredJobs
          .map((company: any) => company.email)
          .filter((email: string) => email !== "Not found");
        setEmailArray(emails);
        console.log("Recruiter Emails:", emails);
      }
    };

    document.addEventListener("emailsData", handleEmailsData);

    return () => {
      document.removeEventListener("emailsData", handleEmailsData);
    };
  }, [emailLimitReached]);

  // Step 10: Send emails to company array
  const sendEmails = async () => {
    if (emailArray.length === 0 || hasRun.current || emailLimitReached || !resumeFetched.current) {
      toast.error("Cannot send emails: No valid emails or limit reached.");
      return;
    }

    setIsSending(true);
    hasRun.current = true;

    try {
      let sentEmailCount = 0;
      const emailCountRef = ref(db, `user/${uid}/Payment/email_count`);

      for (const email of emailArray) {
        const snapshot = await get(emailCountRef);
        const currentCount = snapshot.exists() ? snapshot.val() : 0;
        console.log("Current email count before sending:", currentCount);

        if (currentCount + sentEmailCount >= 10000) {
          setEmailLimitReached(true);
          toast.warning(
            <div className="p-4 bg-gradient-to-r from-purple-800 via-pink-600 to-red-500 rounded-xl shadow-lg text-white">
              <h2 className="text-lg font-bold">💼 Email Limit Reached</h2>
              <p className="text-sm mt-1">
                You've hit the <span className="font-semibold">10000 email</span> limit on your free plan.
              </p>
              <p className="text-sm">
                Upgrade to <span className="underline font-semibold">Premium</span> to continue sending job applications automatically.
              </p>
            </div>,
            { autoClose: 8000 }
          );
          break;
        }

        const success = await sendEmail(email);
        if (success) {
          sentEmailCount += 1;
          await set(emailCountRef, currentCount + sentEmailCount);
          console.log(`Updated email count to ${currentCount + sentEmailCount}`);
        }

        await new Promise((resolve) => setTimeout(resolve, 5000));
      }

      if (sentEmailCount > 0) {
        toast.success(
          <div className="p-4 bg-gradient-to-r from-green-600 to-green-400 rounded-xl shadow-lg text-white">
            <h2 className="text-lg font-bold">🎉 Emails Sent Successfully</h2>
            <p className="text-sm mt-1">
              Successfully sent <span className="font-semibold">{sentEmailCount}</span> job application emails.
            </p>
          </div>,
          { autoClose: 5000 }
        );
        setIsSent(true);
        localStorage.removeItem("companies");
        console.log("Cleared companies from localStorage");
      } else {
        toast.info("No emails were sent.");
      }
    } catch (err) {
      console.error("Error sending emails:", err.message);
      toast.error("Failed to send emails.");
    } finally {
      setIsSending(false);
    }
  };

  const handleUpdatePlan = () => {
    window.location.href = "/payment";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#11011E] via-[#35013e] to-[#11011E] py-12 text-white">
      <div className="max-w-7xl w-full mx-auto px-4 flex flex-col gap-6">
        {emailLimitReached && (
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-[600px] p-10 rounded-[12px] bg-[#11011E] border border-[#0FAE96] shadow-[0_0_12px_2px_#DFDFDF]240 text-center flex flex-col gap-5 scale-[1.2]">
            <h2 className="text-[32px] font-bold text-[#FFFFFF]">Email Limit Reached</h2>
            <p className="text-[16px] leading-6 text-[#B6B6B6]">
              Hit the <span className="font-semibold text-[#FFFFFF]">10000-email</span> free plan limit.
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
        )}

        {!emailLimitReached && (
          <div>
            <h2 className="text-3xl font-bold flex items-center gap-3">
              <FaBriefcase className="text-white" />
              {isSending ? "Sending Emails..." : isSent ? "Applications Sent" : "Applications"}
            </h2>
            {companies.length > 0 && (
              <>
                <button
                  className={`bg-[#0FAE96] text-[#FFFFFF] font-semibold py-2 px-6 rounded-[10px] hover:bg-[#0C8C79] transition-opacity duration-150 w-full max-w-[300px] mx-auto mt-4 ${
                    isSending || isSent ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  onClick={sendEmails}
                  disabled={isSending || isSent}
                >
                  {isSending ? "Sending..." : isSent ? "Emails Sent" : "Send Emails to All Companies"}
                </button>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                  {companies.map((company, index) => (
                    <div
                      key={index}
                      className="bg-[#11011E] border border-[#0FAE96] rounded-[10px] p-6 shadow-[0_0_8px_2px_#DFDFDF] hover:opacity-90 transition-opacity duration-150 h-full flex flex-col"
                    >
                      <CompanyCard {...company} isSending={isSending} isSent={isSent} />
                    </div>
                  ))}
                </div>
              </>
            )}
            {companies.length === 0 && (
              <p className="text-center text-[#B6B6B6] mt-6">No companies loaded. Please wait for the extension to provide job data.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
