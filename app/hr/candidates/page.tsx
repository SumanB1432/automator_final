"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useCandidateStore } from "@/store/useCandidateStore";
import { FaCheck, FaTimes } from "react-icons/fa";
import FilterModalForm from "@/components/FilterModalForm";
import { Candidate } from "@/types/candidate";
import { AnimatePresence, motion } from "framer-motion";
import { getDatabase, set, ref as databaseRefUtil, get } from 'firebase/database';
import app, { auth } from "@/firebase/config";
import debounce from 'lodash/debounce';
import { toast } from 'react-toastify';

export default function CandidatesPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [jobTitle, setJobTitle] = useState<string>("");
  const [jobDescription, setJobDescription] = useState<string>("");
  const [recruiterSuggestion, setRecruiterSuggestion] = useState<string>("");
  const [uid, setUid] = useState<string>("");
  const [isClient, setIsClient] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState<string>("");
  const [emailBody, setEmailBody] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [emailFooter, setEmailFooter] = useState<string>("");
  const [isSending, setIsSending] = useState(false);
  const [isEmailButtonLoading, setIsEmailButtonLoading] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [failedFiles, setFailedFiles] = useState<string[]>([]);
  const [premium,setPremium] = useState(false)
  const db = getDatabase(app);

  const filteredCandidates = useCandidateStore((state) => state.filteredCandidates);

  const visibleCandidates = filteredCandidates.filter((c: Candidate) => c.name !== 'Processing Error');
  const areAllSelected = visibleCandidates.length > 0 && selectedCandidates.length === visibleCandidates.length;

  const handleSelectAll = () => {
    if (areAllSelected) {
      setSelectedCandidates([]);
    } else {
      const allIds = visibleCandidates.map((c) => c.id);
      setSelectedCandidates(allIds);
    }
  };

  useEffect(() => {
    setIsClient(true);

    // Firebase auth state listener
    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log("Auth state changed:", user?.uid);
      setUid(user?.uid || "");
      setIsAuthLoading(false);
    });

    // localStorage access
    if (typeof window !== "undefined") {
      try {
        const storedJobTitle = localStorage.getItem("jobTitle") ?? "";
        const storedJobDescription = localStorage.getItem("jobDescription") ?? "";
        const storedRecruiterSuggestion = localStorage.getItem("recruiterSuggestion") ?? "";
        setJobTitle(storedJobTitle);
        setJobDescription(storedJobDescription);
        setRecruiterSuggestion(storedRecruiterSuggestion);
      } catch (error) {
        console.error("Error accessing localStorage:", error);
        setJobTitle("");
        setJobDescription("");
        setRecruiterSuggestion("");
      }
    }

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, []);



  //Get User Payment Status From Firebase
  useEffect(() => {
    const getPaymentStatus = async function(){

      let paymentRef = databaseRefUtil(db,`hr/${uid}/Payment/Status`)
      let snapsort = await get(paymentRef);
      if(snapsort.exists()){
        let val = snapsort.val();
        console.log(val,"payment status")
        if(val=="Premium"){
          setPremium(true)
        }
      }

    }
    if(uid){
      console.log(uid)
      getPaymentStatus()
    }

  }, [uid])

  useEffect(() => {
    const getEmail = async () => {
      if (!uid) return;

      try {
        const emailRef = databaseRefUtil(db, `hr/${uid}/email`);
        const snapshot = await get(emailRef);
        if (snapshot.exists()) {
          console.log("Email fetched:", snapshot.val());
          setEmail(snapshot.val());
        } else {
          console.log("No email found for this HR.");
          toast.error("No email found for this HR. Please set up your email.");
        }
      } catch (error) {
        console.error("Error fetching email:", error);
        toast.error("Failed to fetch HR email. Please try again.");
      }
    };

    if (uid) {
      getEmail();
    }
  }, [uid, db]);

//Get Failed Resume Parsing Name
useEffect(() => {
  const storedFailedFiles = localStorage.getItem('failedResumeFiles');
  if (storedFailedFiles) {
    try {
      const parsedFiles = JSON.parse(storedFailedFiles);
      if (Array.isArray(parsedFiles)) {
        setFailedFiles(parsedFiles);
        console.log(`Loaded failedResumeFiles from localStorage: ${parsedFiles}`);
      } else {
        console.warn('Invalid failedResumeFiles format in localStorage');
      }
    } catch (error) {
      console.error('Error parsing failedResumeFiles from localStorage:', error);
    }
  }
}, []);

  const selectedCandidate = filteredCandidates.find((c: Candidate) => c.id === selectedId);

  const updateApproval = (id: string) => {
    const candidate = filteredCandidates.find((c: Candidate) => c.id === id);
    if (candidate) {
      candidate.approved = !candidate.approved;
      useCandidateStore.getState().setCandidates([...filteredCandidates]);
    }
  };

  useEffect(() => {
    const debouncedSave = debounce(async () => {
      try {
        const db = getDatabase(app);
        const baseTitle = jobTitle
          .trim()
          .replace(/\s+/g, "")
          .replace(/[.#$[\]]/g, "")
          .toLowerCase();

        if (!baseTitle) {
          console.log("⏭ Skipping save: Invalid job title");
          return;
        }

        const candidateRef = databaseRefUtil(db, `hr/${uid}/jobProfiles/${baseTitle}`);

        await set(candidateRef, {
          title: jobTitle,
          jdText: jobDescription,
          hrGuideLines: recruiterSuggestion,
          calendlyLink: "",
          updatedAt: Date.now(),
        });

        console.log("✅ Job Profile saved at:", `hr/${uid}/jobProfiles/${baseTitle}`);
      } catch (error) {
        console.error("❌ Error saving candidate:", error);
      }
    }, 500);

    debouncedSave();

    return () => debouncedSave.cancel();
  }, [uid, jobTitle]);

  const handleDownload = () => {
    if (selectedCandidate?.resumeUrl) {
      window.open(selectedCandidate.resumeUrl, "_blank", "noopener,noreferrer");
    }
  };
const handleDownloadDetails = () => {
  const candidateLines = filteredCandidates.map((c) => {
    return `Name: ${c.name}, Email: ${c.email}, Phone: ${c.phone}, Score: ${c.score}`;
  });
  const failedLines = failedFiles.length > 0
    ? ['\nFailed PDF Resumes (Not Parsed by pdf-parse):', ...failedFiles.map((file) => `- ${file}`)]
    : [];
    console.log(premium,typeof(premium))
  const promoLines = !premium ? [
    '\n👉 Upgrade to Premium now and unlock 98% resume parsing accuracy.',
    '✅ Parse complex PDFs',
    '✅ Get full data extraction',
    '✅ Save time. Hire faster.',
  ] : [];
  const allLines = [...candidateLines, ...failedLines, ...promoLines];
  const blob = new Blob([allLines.join('\n')], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'candidate_details.txt';
  a.click();
  URL.revokeObjectURL(url);
  localStorage.removeItem('failedResumeFiles');
  setFailedFiles([]);
};

  const verifyEmailInHrToken = useCallback(async (userEmail: string): Promise<boolean> => {
    try {
      const hrTokenRef = databaseRefUtil(db, `hr_token`);
      const snapshot = await get(hrTokenRef);
      if (snapshot.exists()) {
        const hrTokenData = snapshot.val();
        console.log("hr_token data:", hrTokenData);
        const safeEmail = userEmail.replace(/\./g, ",");
        console.log("Checking for email:", safeEmail);
        return Object.keys(hrTokenData).includes(safeEmail);
      }
      console.log("No hr_token data found");
      return false;
    } catch (error) {
      console.error("Error verifying email in hr_token:", error);
      return false;
    }
  }, [db]);

const handleSendEmail = useCallback(async () => {
    if (isAuthLoading) {
      toast.error("Authentication is still loading. Please wait a moment.");
      return;
    }
    if (!uid) {
      toast.error("User not authenticated. Please log in again.");
      return;
    }
    if (!email) {
      toast.error("No HR email found. Please ensure your email is set up.");
      return;
    }
    if (isRedirecting) {
      console.log("Redirect already in progress, skipping...");
      return;
    }
    setIsEmailButtonLoading(true);
    try {
      const isEmailVerified = await verifyEmailInHrToken(email);
      if (!isEmailVerified) {
        toast.info("Email not verified. Redirecting to authentication...");
        setIsRedirecting(true);
        window.location.href = "https://email-sending-hr.onrender.com/auth/google?state=candidates";
        return;
      }
      let attempts = 3;
      let demoResponse;
      while (attempts > 0) {
        try {
          demoResponse = await fetch("https://email-sending-hr.onrender.com/send-job-application", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              recipient: {
                name: "Test User",
                email: "deadpool69cloud@gmail.com",
              },
              companyEmail: email,
              subject: "Demo Email: Candidate Management",
              body: "This is a demo email to verify email functionality.",
              footer: "Best regards, HR Team",
            }),
          });
          if (demoResponse.ok) {
            console.log("Demo email sent successfully");
            break;
          }
          const errorData = await demoResponse.json();
          console.error(`Demo email attempt ${4 - attempts} failed:`, errorData);
          if (errorData.error.includes("Authentication required")) {
            console.log("Demo email failed due to authentication. Checking token...");
            await verifyEmailInHrToken(email);
          }
        } catch (error) {
          console.error(`Demo email attempt ${4 - attempts} error:`, error);
        }
        attempts--;
        if (attempts > 0) {
          console.log(`Retrying demo email... (${attempts} attempts left)`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      if (!demoResponse?.ok) {
        console.error("Demo email failed after retries:", await demoResponse?.text());
        toast.error("Failed to verify email. Redirecting to authentication...");
        setIsRedirecting(true);
        window.location.href = "https://email-sending-hr.onrender.com/auth/google?state=candidates";
        return;
      }
      setIsEmailModalOpen(true);
      setEmailSubject("");
      setEmailBody("");
      setEmailFooter("");
      setEmailError("");
    } catch (error) {
      console.error("Error sending demo email:", error);
      toast.error("An error occurred while verifying email. Redirecting...");
      setIsRedirecting(true);
      window.location.href = "https://email-sending-hr.onrender.com/auth/google?state=candidates";
    } finally {
      setIsEmailButtonLoading(false);
    }
}, [email, uid, isAuthLoading, verifyEmailInHrToken, isRedirecting]);

const handleEmailSubmit = async () => {
    if (!emailSubject.trim() || !emailBody.trim() || !emailFooter.trim()) {
      setEmailError("Subject, body, and footer are all required.");
      return;
    }
    setIsSending(true);
    const companyEmail = email;
    const db = getDatabase(app);
    let redirectRequired = false;
    for (const candidate of filteredCandidates) {
      const recipient = {
        name: candidate.name,
        email: candidate.email,
      };
      try {
        const response = await fetch("https://email-sending-hr.onrender.com/send-job-application", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            recipient,
            companyEmail,
            subject: emailSubject,
            body: emailBody,
            footer: emailFooter,
          }),
        });
        if (!response.ok) {
          const errorData = await response.json();
          console.error(`Failed to send email to ${recipient.email}:`, errorData);
          if (errorData.error.includes("Authentication required")) {
            redirectRequired = true;
            continue;
          }
          toast.error(`Failed to send email to ${recipient.email}`);
        } else {
          toast.success(`Email sent successfully to ${candidate.email}`);
          const safeEmail = candidate.email.replace(/\./g, ",").toLowerCase();
          const baseTitle = jobTitle.trim().replace(/\s+/g, "").toLowerCase();
          const emailSentListRef = databaseRefUtil(db, `hr/${uid}/emailSent/${safeEmail}`);
          const emailData = {
            email: candidate.email,
            phone: candidate.phone,
            name: candidate.name,
            jobId: baseTitle,
            timestamp: Date.now(),
            subject: emailSubject,
            body: emailBody,
            footer: emailFooter,
          };
          await set(emailSentListRef, emailData);
        }
        await new Promise(resolve => setTimeout(resolve, 500)); // Rate limit delay
      } catch (error) {
        console.error(`Error sending email to ${recipient.email}:`, error);
        toast.error(`Error sending email to ${recipient.email}`);
      }
    }
    setIsSending(false);
    if (redirectRequired) {
      toast.error("Authentication required for some emails. Redirecting...");
      window.location.href = "https://email-sending-hr.onrender.com/auth/google?state=candidates";
    } else {
      toast.success("All emails have been processed!");
    }
    setIsEmailModalOpen(false);
};

  const handleSendMessageAll = async () => {
    const candidates = filteredCandidates
      .filter((c) => selectedCandidates.includes(c.id))
      .map((c) => ({
        name: c.name || "",
        phone: c.phone.replace(/\D/g, ""),
      }));

    if (candidates.length === 0) {
      alert("No candidates selected.");
      return;
    }

    try {
      const response = await fetch("/api/sendmessege", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ candidates }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Messages sent successfully!");
      } else {
        console.error("Send failed:", data);
        alert("Some messages failed to send. Check console for details.");
      }
    } catch (error) {
      console.error("Error sending messages:", error);
      alert("An error occurred while sending messages.");
    }
  };

  const handleCandidateSelect = (id: string) => {
    setSelectedCandidates((prev) =>
      prev.includes(id) ? prev.filter((candidateId) => candidateId !== id) : [...prev, id]
    );
  };

  const hasActiveFilters = isClient && Object.values(useCandidateStore.getState().filters).some((value) =>
    Array.isArray(value) ? value.length > 0 : value
  );

  return (
    <>
      {/* Main Content with Conditional Blur */}
      <motion.div
        className={`flex flex-col lg:flex-row h-screen w-full bg-[#11011E] font-inter text-[#B6B6B6] ${isSending ? "blur-sm" : ""
          }`}
        transition={{ duration: 0.3 }}
      >
        {/* Left Panel */}
       <div className="w-full lg:w-1/3 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] p-4 sm:p-6 space-y-6 shadow-xl h-full relative z-10 flex flex-col">
  {/* Header Section (Sticky) */}
  <div className="sticky top-0 bg-[rgba(255,255,255,0.02)] z-10 pb-4">
    <div className="flex items-center justify-between">
      <h2 className="text-3xl font-bold font-raleway text-[#ECF1F0]">Candidates</h2>
      <button
        onClick={() => setIsFilterModalOpen(!isFilterModalOpen)}
        className="bg-[#0FAE96] text-white font-raleway font-semibold text-base px-6 py-3 rounded-md transition duration-200 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0FAE96] flex items-center gap-2 shadow-md"
        aria-label={isFilterModalOpen ? "Close filter modal" : "Open filter modal"}
      >
        {isFilterModalOpen ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1m-17 4h14m-7 4h7m-14 4h14" />
          </svg>
        )}
        {isFilterModalOpen ? "Close" : "Filter"}
      </button>
    </div>
    <hr className="border-t border-[rgba(255,255,255,0.05)] mt-3" />
    {isClient && jobTitle && (
      <div
        style={{
          backgroundColor: 'rgba(15, 174, 150, 0.1)',
          padding: '10px',
          borderRadius: '8px',
          color: '#ECF1F0',
          fontWeight: '500',
        }}
      >
        Job Title: {jobTitle}
      </div>
    )}
    {isClient && (
      <div className="flex flex-wrap items-center gap-4 mt-4">
        {hasActiveFilters && (
          <span className="inline-flex items-center gap-4 px-3 py-1 rounded-full text-xs font-medium bg-[rgba(15,174,150,0.1)] text-[#ECF1F0] shadow-sm">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 4a2 2 0 00-2 2v1h14V6a2 2 0 00-2-2H5zm0 4v6a2 2 0 002 2h6a2 2 0 002-2V8H5z" />
            </svg>
            Active Filters
          </span>
        )}
        <button
          onClick={handleDownloadDetails}
          className="inline-flex items-center px-4 py-2 gap-2 rounded-md text-sm font-raleway font-semibold bg-[#0FAE96] text-white cursor-pointer shadow-md transition duration-200 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0FAE96]"
        >
          Download Details
        </button>
        <button
          onClick={handleSendEmail}
          className="inline-flex items-center px-4 py-2 gap-2 rounded-md text-sm font-raleway font-semibold bg-[#0FAE96] text-white cursor-pointer shadow-md transition duration-200 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0FAE96]"
          disabled={isEmailButtonLoading}
        >
          {isEmailButtonLoading ? (
            <div className="flex items-center gap-2">
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processing...
            </div>
          ) : (
            "Send Auto Email"
          )}
        </button>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={areAllSelected}
            onChange={handleSelectAll}
            className="h-5 w-5 text-[#0FAE96] cursor-pointer rounded focus:ring-[#0FAE96] focus:ring-offset-1 focus-ring-offset-[#11011E]"
          />
          <label className="text-sm text-[#ECF1F0] font-medium">Select All</label>
        </div>
      </div>
    )}
  </div>

  {/* Scrollable Candidate List */}
  <div className="flex-1 overflow-y-auto">
    <hr className="border-t border-[rgba(255,255,255,0.05)] my-2" />
    {isClient && (
      <div className="space-y-4 relative">
        <div className="absolute -z-10 w-64 h-64 rounded-full bg-[#7000FF] blur-[180px] opacity-25 top-10 -left-10"></div>
        {filteredCandidates.length > 0 ? (
          [...filteredCandidates]
            .filter((c: Candidate) => c.name !== 'Processing Error')
            .sort((a: Candidate, b: Candidate) => b.score - a.score)
            .map((c: Candidate) => (
              <motion.div
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                className={`bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-xl p-5 cursor-pointer shadow-md hover:shadow-lg transition-all duration-200 ${selectedId === c.id ? "ring-2 ring-[#0FAE96]" : "hover:border-[#0FAE96]/50"}`}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex justify-between">
                  <div>
                    <p className="text-lg font-bold font-raleway text-[#ECF1F0]">{c.name}</p>
                    <p className="text-sm text-[#B6B6B6] mt-1">{c.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedCandidates.includes(c.id)}
                      onChange={() => handleCandidateSelect(c.id)}
                      className="h-6 w-6 text-[#0FAE96] cursor-pointer rounded focus:ring-[#0FAE96]"
                    />
                  </div>
                </div>
                <div className="float-right mt-2 text-xs bg-[#0FAE96] rounded-full px-3 py-1 text-white font-semibold shadow-sm">
                  Score: {c.score}
                </div>
              </motion.div>
            ))
        ) : (
          <p className="text-[#B6B6B6] text-center py-8 text-lg">No candidates found</p>
        )}
      </div>
    )}
  </div>
</div>

        {/* Right Panel */}
        <div className="w-full lg:w-2/3 p-4 sm:p-8 bg-[#11011E] relative overflow-y-auto h-full">
          <div className="absolute -z-10 w-96 h-96 rounded-full bg-[#FF00C7] blur-[180px] opacity-25 bottom-10 right-10"></div>
          {selectedCandidate ? (
            <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-xl p-6 shadow-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-3xl font-bold font-raleway text-[#ECF1F0]">{selectedCandidate.name}</h2>
                  <p className="text-[#B6B6B6] mt-1">{selectedCandidate.location}</p>
                  <p className="mt-2 text-sm text-[#B6B6B6]">{selectedCandidate.email}</p>
                  <p className="mt-1 text-sm text-[#B6B6B6]">{selectedCandidate.phone}</p>
                  <div className="flex flex-wrap gap-3 mt-4">
                    <button
                      onClick={() => {
                        const phone = selectedCandidate.phone.replace(/\D/g, "");
                        const message = `Hi ${selectedCandidate.name}, we've shortlisted you for an interview. Let us know when you're available to proceed.`;
                        const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
                        window.open(url, "_blank");
                      }}
                      className="bg-[#0FAE96] text-white font-raleway font-semibold text-base px-6 py-3 rounded-md transition duration-200 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0FAE96] shadow-md h-12"
                    >
                      Message
                    </button>
                    <button
                      onClick={() => {
                        const subject = "Interview Shortlisting";
                        const body = `Hi ${selectedCandidate.name},\n\nYou've been shortlisted for an interview. Please reply with your availability.\n\nBest regards,`;
                        const gmailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=${selectedCandidate.email}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                        window.open(gmailLink, "_blank");
                      }}
                      className="bg-[#0FAE96] text-white font-raleway font-semibold text-base px-6 py-3 rounded-md transition duration-200 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0FAE96] shadow-md h-12"
                    >
                      Send Email
                    </button>
                  </div>
                </div>
                <div className="space-x-3 flex items-center">
                  <button
                    onClick={() => updateApproval(selectedCandidate.id)}
                    className={`p-3 rounded-full shadow-md cursor-pointer h-10 w-10 flex items-center justify-center transition duration-200 ${selectedCandidate.approved ? "bg-[#0FAE96] text-white" : "bg-[rgba(255,255,255,0.02)] text-[#B6B6B6] hover:bg-[#0FAE96]/20 hover:text-[#ECF1F0]"}`}
                    aria-label={selectedCandidate.approved ? "Approved" : "Approve candidate"}
                  >
                    <FaCheck className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => updateApproval(selectedCandidate.id)}
                    className={`p-3 rounded-full shadow-md cursor-pointer h-10 w-10 flex items-center justify-center transition duration-200 ${!selectedCandidate.approved ? "bg-red-500 text-white" : "bg-[rgba(255,255,255,0.02)] text-[#B6B6B6] hover:bg-red-500/20 hover:text-[#ECF1F0]"}`}
                    aria-label={selectedCandidate.approved ? "Reject candidate" : "Rejected"}
                  >
                    <FaTimes className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <hr className="my-6 border-[rgba(255,255,255,0.05)]" />
              <div className="flex justify-between items-center mb-4">
                <p className="text-2xl font-semibold font-raleway text-[#ECF1F0]">Resume</p>
                <button
                  onClick={handleDownload}
                  className="bg-[#0FAE96] text-white font-raleway font-semibold text-base px-6 py-3 rounded-md transition duration-200 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0FAE96] inline-flex items-center gap-2"
                  aria-label="Download resume"
                >
                  Download Resume
                </button>
              </div>
              <div className="w-full overflow-hidden border border-[rgba(255,255,255,0.05)] rounded-xl shadow-lg bg-[rgba(255,255,255,0.02)] h-[400px] sm:h-[500px] lg:h-[calc(100vh-300px)]">
                {selectedCandidate.resumeUrl ? (
                  <iframe
                    src={`${selectedCandidate.resumeUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                    title="Resume Viewer"
                    className="w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#B6B6B6] bg-[rgba(255,255,255,0.01)]">
                    Resume not available
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-[#B6B6B6] text-lg">
              Select a candidate to view details
            </div>
          )}
        </div>
      </motion.div>

      {/* Filter Modal */}
      <AnimatePresence>
        {isFilterModalOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          >
            <FilterModalForm onClose={() => setIsFilterModalOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Email Modal */}
      <AnimatePresence>
        {isEmailModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-[#11011E] p-6 rounded-xl w-full max-w-md border border-[rgba(255,255,255,0.05)] shadow-xl"
            >
              <h2 className="text-2xl font-bold font-raleway text-[#ECF1F0] mb-4">Send Email</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#ECF1F0] mb-1">Subject</label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-md px-3 py-2 text-[#ECF1F0] focus:outline-none focus:ring-2 focus:ring-[#0FAE96]"
                    placeholder="e.g. Application Update: Interview Invitation"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#ECF1F0] mb-1">Body</label>
                  <textarea
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    className="w-full bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-md px-3 py-2 text-[#ECF1F0] focus:outline-none focus:ring-2 focus:ring-[#0FAE96] min-h-[150px]"
                    placeholder="Write your message here. The greeting 'Hello [Candidate Name],' is already included. (Press Enter to add a new line)"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#ECF1F0] mb-1">Footer</label>
                  <textarea
                    value={emailFooter}
                    onChange={(e) => setEmailFooter(e.target.value)}
                    className="w-full bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-md px-3 py-2 text-[#ECF1F0] focus:outline-none focus:ring-2 focus:ring-[#0FAE96] min-h-[150px]"
                    placeholder="Add a closing remark or signature. For example, 'Best regards, HR Team' (Press Enter to add a new line)"
                    required
                  />
                </div>
                {emailError && (
                  <p className="text-red-500 text-sm">{emailError}</p>
                )}
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setIsEmailModalOpen(false)}
                    className="bg-[rgba(255,255,255,0.02)] text-[#B6B6B6] font-raleway font-semibold text-base px-6 py-3 rounded-md transition duration-200 hover:scale-105 focus:outline-none"
                    disabled={isSending}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEmailSubmit}
                    className="bg-[#0FAE96] text-white font-raleway font-semibold text-base px-6 py-3 rounded-md transition duration-200 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0FAE96] flex items-center justify-center"
                    disabled={isSending}
                  >
                    {isSending ? (
                      <div className="flex items-center gap-2">
                        <svg
                          className="animate-spin h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Processing...
                      </div>
                    ) : (
                      "Send"
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full-Page Loading Screen for Email Sending */}
      <AnimatePresence>
        {isSending && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center"
          >
            <div className="flex flex-col items-center gap-4">
              <svg
                className="animate-spin h-12 w-12 text-[#0FAE96]"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <p className="text-[#ECF1F0] text-lg font-raleway font-semibold">
                Sending Emails...
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}