"use client"
import React, { useState, useEffect,useCallback } from "react";
import { useCandidateStore } from "@/store/useCandidateStore";
import { FaCheck, FaTimes } from "react-icons/fa";
import FilterModalForm from "@/components/FilterModalForm";
import { Candidate } from "@/types/candidate";
import { motion, AnimatePresence } from "framer-motion";
import { getDatabase, set, ref as databaseRefUtil,push } from 'firebase/database';
import app from "@/firebase/config";
import { auth } from "@/firebase/config";
import debounce from 'lodash/debounce';



export default function CandidatesPage()  {
  const { filteredCandidates, updateApproval } = useCandidateStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [jobTitle, setJobTitle] = useState<string>("");
  const [jobDescription, setJobDescription] = useState<string>("");
  const [recruiterSuggestion,setRecruiterSuggestion] = useState<string>("");
  var [uid,setUid] = useState<string>("")


  const areAllSelected =
    filteredCandidates.length > 0 &&
    selectedCandidates.length === filteredCandidates.length;

  const handleSelectAll = () => {
    if (areAllSelected) {
      setSelectedCandidates([]);
    } else {
      const allIds = filteredCandidates.map((c) => c.id);
      setSelectedCandidates(allIds);
    }
  };

  useEffect(() => {
    let uid = auth?.currentUser?.uid
    setUid(uid ?? " ")
    const jobTitle = localStorage.getItem("jobTitle");
    const storedJobDescription = localStorage.getItem('jobDescription');
    const storedRecruiterSuggestion = localStorage.getItem('recruiterSuggestion');
    setJobTitle(jobTitle ?? " ")
    setJobDescription(storedJobDescription  ?? " ")
    setRecruiterSuggestion(storedRecruiterSuggestion ?? " ")
  })

  const selectedCandidate = filteredCandidates.find(
    (c: Candidate) => c.id === selectedId
  );

  const saveCandidateToRealtimeDatabase = useCallback(
    debounce(async (jobTitle:string, jd:string, recruiterSuggestion:string) => {
      if (!jobTitle || !jd || !recruiterSuggestion) {
        console.log('Skipping save: Missing required fields');
        return;
      }

      try {
        const db = getDatabase(app);
        const baseTitle = jobTitle.trim().replace(/\s+/g, '').toLowerCase();
        const uid = 'ZEgE8varFRNnThMfjpbEm7h8gJY2';
        const candidateRef = databaseRefUtil(db, `hr/${uid}/jobProfiles/${baseTitle}`);

        await set(candidateRef, {
          title: jobTitle,
          jdText: jd,
          hrGuideLines: recruiterSuggestion,
          calendlyLink: '',
          updatedAt: Date.now(),
        });

        console.log('Job Profile saved successfully');
      } catch (error) {
        console.error('❌ Error saving candidate:', error);
      }
    }, 500), // 500ms debounce delay
    []
  );


  useEffect(() => {
    // Only trigger save if all fields are valid
    if (jobTitle && jobDescription && recruiterSuggestion) {
      saveCandidateToRealtimeDatabase(jobTitle, jobDescription, recruiterSuggestion);
    }
  }, [jobTitle, jobDescription, recruiterSuggestion, saveCandidateToRealtimeDatabase]);

  const handleDownload = () => {
    if (selectedCandidate?.resumeUrl) {
      window.open(selectedCandidate.resumeUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleDownloadDetails = () => {
    const lines = filteredCandidates.map((c) => {
      return `Name: ${c.name}, Email: ${c.email}, Phone: ${c.phone}, Score: ${c.score}`;
    });
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "candidate_details.txt";
    a.click();
    URL.revokeObjectURL(url);
  };
  const db = getDatabase(app); // Get DB instance
  uid = 'ZEgE8varFRNnThMfjpbEm7h8gJY2'
  const handleSendEmail = async () => {
    const hr_id = "123456789"; // Replace with actual HR ID
    const companyName = "AIKING"; // Replace with actual company name
    const companyEmail = "suman85bera@gmail.com"; // Replace with actual company email

    for (const candidate of filteredCandidates) {
      const recipient = {
        name: candidate.name,
        email: candidate.email,
      };

      try {
        const response = await fetch("http://localhost:8080/send-job-application", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            recipient, // Send only one recipient per request
            hr_id,
            companyName,
            companyEmail,
          }),
        });

        if (!response.ok) {
          console.error(`Failed to send email to ${recipient.email}`);
        } else {
          console.log(`Email sent to ${recipient.email}`);
          const safeEmail = candidate.email.replace(/\./g, ',').toLowerCase();
          const baseTitle = jobTitle.trim().replace(/\s+/g, '').toLowerCase();
          const emailSentListRef = databaseRefUtil(db, `hr/${uid}/emailSent/${safeEmail}`);
          const emailData = {
            email: candidate.email,
            phone: candidate.phone,
            name: candidate.name,
            jobId: baseTitle, // Use the jobTitle state
            timestamp: Date.now(), // Add a timestamp for when the email was sent
        };
        

                        // Use SET to write data to this new, unique location
        await set(emailSentListRef, emailData);

        }
      } catch (error) {
        console.error(`Error sending email to ${recipient.email}:`, error);
      }
    }

    alert("All emails have been processed.");
  };

  const handleCandidateSelect = (id: string) => {
    setSelectedCandidates((prev) =>
      prev.includes(id) ? prev.filter((candidateId) => candidateId !== id) : [...prev, id]
    )
  };

  // const handleSendMessageAll = async () => {
  //   const candidates = filteredCandidates.filter((c) => selectedCandidates.includes(c.id))
  //     .map((c) => ({
  //       name: c.name,
  //       phone: c.phone.replace(/\D/g, "")
  //     }))
  //   try {
  //     const response = await fetch("/api/sendwhatsapp", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ candidates }),
  //     });

  //     if (response.ok) {
  //       alert("Messages sent successfully!");
  //     } else {
  //       alert("Failed to send messages.");
  //     }
  //   } catch (error) {
  //     console.error("Error sending messages:", error);
  //     alert("An error occurred while sending messages.");
  //   }
  // };

  return (
    <div className="flex flex-col lg:flex-row h-auto min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100 font-sans">
      {/* Left Panel */}
      <div className="w-full lg:w-1/3 bg-white p-4 sm:p-6 space-y-6 overflow-y-auto shadow-xl max-h-[50vh] lg:max-h-screen">
        {/* Sticky Header */}
        <div className="sticky top-0 bg-white z-10 pb-4">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Candidates
            </h2>
            <button
              onClick={() => setIsFilterModalOpen(!isFilterModalOpen)}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2 rounded-xl hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300 flex items-center gap-2 shadow-md"
              aria-label={
                isFilterModalOpen ? "Close filter modal" : "Open filter modal"
              }
            >
              {isFilterModalOpen ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1m-17 4h14m-7 4h7m-14 4h14"
                  />
                </svg>
              )}
              {isFilterModalOpen ? "Close" : "Filter"}
            </button>
          </div>
          <hr className="border-t border-gray-300 mt-3" />
          {jobTitle && (
            <div
              style={{
                backgroundColor: '#FFE4E1', // Pastel pink
                padding: '10px',
                borderRadius: '8px',
                color: '#333', // Dark text for contrast
                fontWeight: '500',
              }}
            >
              Job Title: {jobTitle}
            </div>
          )}
          {/* Active Filters Indicator */}

          <div className="flex items-center gap-4">
            {Object.values(useCandidateStore.getState().filters).some((value) =>
              Array.isArray(value) ? value.length > 0 : value
            ) && (
                <span className="inline-flex items-center gap-4 px-3 py-1 mt-4 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 shadow-sm">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M5 4a2 2 0 00-2 2v1h14V6a2 2 0 00-2-2H5zm0 4v6a2 2 0 002 2h6a2 2 0 002-2V8H5z" />
                  </svg>
                  Active Filters
                </span>
              )}
            <button
              onClick={handleDownloadDetails}
              className="inline-flex items-center px-3 py-1 mt-4 gap-2 rounded-full text-sm font-medium bg-gradient-to-r from-indigo-600 to-purple-600 text-white cursor-pointer shadow-md hover:drop-shadow-lg"
            >
              Download Details
            </button>
            <button
              onClick={handleSendEmail}
              className="inline-flex items-center px-3 py-1 mt-4 gap-2 rounded-full text-sm font-medium bg-gradient-to-r from-indigo-600 to-purple-600 text-white cursor-pointer shadow-md hover:drop-shadow-lg"
            >
              Send Email
            </button>
            <button
              className="inline-flex items-center px-3 py-1 mt-4 gap-2 rounded-full text-sm font-medium bg-gradient-to-r from-indigo-600 to-purple-600 text-white cursor-pointer shadow-md hover:drop-shadow-lg"
            >
              Message All
            </button>
            <div className="flex items-center gap-2 mt-4">
              <input
                type="checkbox"
                checked={areAllSelected}
                onChange={handleSelectAll}
                className="h-5 w-5 text-indigo-600 cursor-pointer"
              />
              <label className="text-sm text-gray-700 font-medium">
                Select All
              </label>
            </div>
          </div>
        </div>
        <hr className="border-t border-gray-300 my-2" />

        {/* Candidate List */}
        <div className="space-y-4">
          {filteredCandidates.length > 0 ? (
            filteredCandidates.map((c: Candidate) => (
              <motion.div
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                className={`bg-gray-50 rounded-xl p-5 cursor-pointer shadow-md hover:shadow-lg transition-all duration-200 ${selectedId === c.id ? "ring-2 ring-indigo-500" : ""
                  }`}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex justify-between">
                  <div>
                    <p className="text-lg font-bold text-gray-900">{c.name}</p>
                    <p className="text-sm text-gray-600 mt-1">{c.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedCandidates.includes(c.id)}
                      onChange={() => handleCandidateSelect(c.id)}
                      className="h-6 w-6 text-indigo-600 cursor-pointer"
                    />
                  </div>
                </div>
                <div className="float-right mt-2 text-xs bg-indigo-600 rounded-full px-3 py-1 text-white font-semibold shadow-sm">
                  Score: {c.score}
                </div>
              </motion.div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-8 text-lg">
              No candidates found
            </p>
          )}
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-2/3 p-4 sm:p-8 bg-gray-100 relative">
        {selectedCandidate ? (
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-extrabold text-gray-900">
                  {selectedCandidate.name}
                </h2>
                <p className="text-gray-500 mt-1">
                  {selectedCandidate.location}
                </p>
                <p className="mt-2 text-sm text-gray-600">
                  {selectedCandidate.email}
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  {selectedCandidate.phone}
                </p>
                <div className="flex flex-wrap gap-3 mt-4">
                  <button
                    onClick={() => {
                      const phone = selectedCandidate.phone.replace(/\D/g, "");
                      const message = `Hi ${selectedCandidate.name}, we’ve shortlisted you for an interview. Let us know when you’re available to proceed.`;
                      const url = `https://wa.me/${phone}?text=${encodeURIComponent(
                        message
                      )}`;
                      window.open(url, "_blank");
                    }}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-xl hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300 shadow-sm cursor-pointer"
                  >
                    Message
                  </button>
                  <button
                    onClick={() => {
                      const subject = "Interview Shortlisting";
                      const body = `Hi ${selectedCandidate.name},\n\nYou’ve been shortlisted for an interview. Please reply with your availability.\n\nBest regards,`;
                      const gmailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=${selectedCandidate.email
                        }&su=${encodeURIComponent(
                          subject
                        )}&body=${encodeURIComponent(body)}`;
                      window.open(gmailLink, "_blank");
                    }}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-xl hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300 shadow-sm cursor-pointer"
                  >
                    Send Email
                  </button>
                </div>
              </div>

              <div className="space-x-3 flex items-center">
                <button
                  onClick={() => updateApproval(selectedCandidate.id)}
                  className={`p-3 rounded-full shadow-md cursor-pointer ${selectedCandidate.approved
                    ? "bg-green-500 text-white"
                    : "bg-white text-gray-600 hover:bg-green-100"
                    } transition duration-200`}
                  aria-label={
                    selectedCandidate.approved
                      ? "Approved"
                      : "Approve candidate"
                  }
                >
                  <FaCheck className="w-5 h-5" />
                </button>
                <button
                  onClick={() => updateApproval(selectedCandidate.id)}
                  className={`p-3 rounded-full shadow-md cursor-pointer ${!selectedCandidate.approved
                    ? "bg-red-500 text-white"
                    : "bg-white text-gray-600 hover:bg-red-100"
                    } transition duration-200`}
                  aria-label={
                    selectedCandidate.approved ? "Reject candidate" : "Rejected"
                  }
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>
            </div>

            <hr className="my-6 border-gray-200" />

            <div className="flex justify-between items-center mb-4">
              <p className="text-2xl font-semibold text-gray-900">Resume</p>
              <button
                onClick={handleDownload}
                className="inline-flex items-center px-3 py-1 mt-4 gap-2 rounded-md text-sm font-medium bg-gradient-to-r from-indigo-600 to-purple-600 text-white cursor-pointer shadow-md hover:drop-shadow-lg"
                aria-label="Download resume"
              >
                Download Resume
              </button>
            </div>

            <div className="w-full overflow-hidden border rounded-xl shadow-lg bg-white h-[400px] sm:h-[500px] lg:h-[calc(100vh-300px)]">
              {selectedCandidate.resumeUrl ? (
                <iframe
                  src={`${selectedCandidate.resumeUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                  title="Resume Viewer"
                  className="w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500 bg-gray-50">
                  Resume not available
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400 text-lg">
            Select a candidate to view details
          </div>
        )}
      </div>

      {/* Filter Modal */}
      <AnimatePresence>
        {isFilterModalOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
          >
            <FilterModalForm onClose={() => setIsFilterModalOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


