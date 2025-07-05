"use client";
import React, { useState, useEffect } from "react";
import { getDatabase, ref, get } from 'firebase/database';
import app from "@/firebase/config";
import { auth } from "@/firebase/config";
import { useAuthState } from 'react-firebase-hooks/auth'; // Import hook to track auth state
import { toast } from 'react-toastify';

const HREmailPage = () => {
  const [userEmail, setUserEmail] = useState("");
  const [daysAgo, setDaysAgo] = useState("1");
  const [loadingEmails, setLoadingEmails] = useState(false);
  const [interestEmails, setInterestEmails] = useState([]);
  const [queryEmails, setQueryEmails] = useState([]);
  const [view, setView] = useState("input"); // "input", "results", or "form"
  const [error, setError] = useState(null);
  const [readEmailsChecked, setReadEmailsChecked] = useState(false); // Single checkbox state
  const [meetingLink, setMeetingLink] = useState(""); // Saved form value
  const [hrGuideline, setHrGuideline] = useState(""); // Saved form value
  const [emailBody, setEmailBody] = useState(""); // Saved form value
  const [apiKey, setApiKey] = useState(null);
  const [uid, setUid] = useState("");
  const [user, loadingAuth, errorAuth] = useAuthState(auth); // Track auth state
  const [isLoadingInitialData, setIsLoadingInitialData] = useState(true); // New state for initial loading


  const db = getDatabase(app);


  useEffect(() => {
  const isHRLoggedIn = localStorage.getItem("IsLoginAsHR");

  if (isHRLoggedIn !== "true") {
    toast.warning("Access denied. Please log in as an HR user.");

    setTimeout(() => {
      window.location.href = "/hr/login";
    }, 2000);
  }
}, []);


  useEffect(() => {
    // Wait until auth state is loaded
    if (loadingAuth) {
      return;
    }

    const getApiAndEmail = async (currentUid) => {
      if (!currentUid) {
        console.log("User not logged in or UID not available.");
        setIsLoadingInitialData(false); // Stop initial loading if no UID
        setError("Please log in to access this page."); // Set an error if not logged in
        return;
      }
      setUid(currentUid);

      try {
        const apiRef = ref(db, `hr/${currentUid}/API/apikey`);
        const emailRef = ref(db, `hr/${currentUid}/email`);
        const snapshot1 = await get(apiRef);
        const snapshot2 = await get(emailRef);

        if (snapshot1.exists()) {
          setApiKey(snapshot1.val());
        } else {
          console.log("No API key found for this user.");
          setError("API key not found in database. Cannot proceed."); // Indicate missing data
        }
        if (snapshot2.exists()) {
          setUserEmail(snapshot2.val());
        } else {
          console.log("NO EMAIL FOUND for this user.");
           setError("User email not found in database. Cannot proceed."); // Indicate missing data
        }
      } catch (err) {
        console.error("Error fetching API key/EMAIL:", err);
        setError("Error fetching user configuration: " + err.message);
      } finally {
          setIsLoadingInitialData(false); // Finish initial loading regardless of success/failure
      }
    };

    if (user) {
        getApiAndEmail(user.uid);
    } else {
        // If user is null after auth loading is done, handle it
        setIsLoadingInitialData(false);
        setError("Please log in to access this page.");
    }

  }, [user, loadingAuth, db]); // Depend on user and loadingAuth

  const handleReadEmails = async () => {
    // This check is redundant because the button is disabled if userEmail is empty,
    // but keeping existing logic as requested.
    if (!userEmail || !apiKey) { // Also check apiKey as it's needed for the fetch
       setError("User email or API key not loaded. Cannot proceed.");
       return;
    }

    setLoadingEmails(true);
    setError(null);
    try {

      // Check if hr_token/userEmail exists in the database
      // Using the userEmail state which should now be populated
      const safeEmail = userEmail.replace(/\./g, ",").toLowerCase();
      const tokenRef = ref(db, `hr_token/${safeEmail}`);
      const tokenSnapshot = await get(tokenRef);
      console.log("Token snapshot exists:", tokenSnapshot.exists(),"value:", tokenSnapshot.val());

      if (!tokenSnapshot.exists()) {
        // Redirect to Google auth page if token is not found
        // NOTE: This redirect will reload the page, losing current state.
        // Consider a popup or link instead for better UX.
        alert("Google authentication token not found. Please authorize email access.");
        // Replace with your frontend's auth redirect page if needed,
        // or ensure your backend handles the redirect and then returns
        // the user *back* to this page with their token stored.
        // Example: window.location.href = "/auth-redirect-page";
        // For this example, directly sending to backend auth route might work
        // if the backend successfully redirects back after auth.
        window.location.href = "https://email-sending-hr.onrender.com/auth/google?state=hrEmail";
        setLoadingEmails(false); // Stop loading before redirect
        return; // Stop further execution
      }

      const response = await fetch("https://email-sending-hr.onrender.com/read-emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // Pass apiKey as it's used in the backend according to the body
        body: JSON.stringify({ email: userEmail, daysAgo: parseInt(daysAgo), apiKey: apiKey }),
      });

      const data = await response.json();
      if (response.ok) {
        setInterestEmails(data.interestEmails || []);
        setQueryEmails(data.queryEmails || []);
        setReadEmailsChecked(false); // Reset checkbox
        setView("results"); // Switch to results view
      } else {
         // Handle specific backend errors, e.g., invalid token
         if (response.status === 401 || response.status === 403) {
             setError(data.error || "Authorization failed. Please re-authorize your email.");
             // Maybe prompt re-auth here instead of automatic redirect earlier
         } else {
             setError(data.error || "Failed to fetch emails");
         }
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setError("An error occurred while reading emails: " + error.message);
    } finally {
      setLoadingEmails(false);
    }
  };

  // ... (getCalendlyLink, sendEmailToInterestedCandidates, getJd, sendEmailToQueryCandidates functions - kept as is)
  const getCalendlyLink = async (uid, email) => {
    try {
      const safeEmail = email.replace(/\./g, ",").toLowerCase();
      // Ensure uid is available (should be if initial loading succeeded)
      if (!uid) {
        console.error("UID is not available to fetch calendlyLink.");
        return null;
      }
      const jobIdSnapshot = await get(ref(db, `hr/${uid}/emailSent/${safeEmail}/jobId`));

      if (!jobIdSnapshot.exists()) {
        console.log(`jobId not found for ${email}.`);
        return null;
      }

      const jobId = jobIdSnapshot.val();
      const calendlySnapshot = await get(ref(db, `hr/${uid}/jobProfiles/${jobId}/calendlyLink`));

      if (!calendlySnapshot.exists()) {
        console.log(`calendlyLink not found for jobId ${jobId}.`);
        return null;
      }

      const calendlyLink = calendlySnapshot.val();
      console.log("Calendly Link:", calendlyLink);
      return calendlyLink;
    } catch (error) {
      console.error("Error fetching calendlyLink:", error);
      return null;
    }
  };

  const sendEmailToInterestedCandidates = async () => {
     // Prevent sending if UID or userEmail isn't properly loaded (shouldn't happen if form is visible)
     if (!uid || !userEmail) {
         alert("App not fully configured (missing UID or user email). Cannot send emails.");
         return;
     }

    try {
      if (interestEmails.length === 0) {
        alert("No interested candidates to email.");
        return;
      }

      // Disable buttons during sending? (Optional enhancement)

      for (const email of interestEmails) {
        const emailId = email?.from;
        if (!emailId) {
             console.warn("Skipping email with no 'from' address:", email);
             continue;
        }
        const safeEmail = emailId.replace(/\./g, ",").toLowerCase();
        const calendlyLink = await getCalendlyLink(uid, safeEmail);

        if (!calendlyLink) {
          console.warn(`Skipping sending interview link to ${emailId}: No Calendly link found in DB for associated jobId.`);
          continue; // Skip this candidate if link isn't found
        }
        console.log(`Attempting to send interview link to: ${emailId} with link: ${calendlyLink}`);

        // You might want to use the 'meetingLink' state from the form if the user entered it,
        // instead of fetching the calendlyLink from DB here. The current logic fetches per candidate.
        // If the user entered one link in the form, use that instead. Let's assume the form
        // values are intended for *manual* overrides/defaults, and the DB is for job-specific links.
        // Sticking to current logic using DB fetch per candidate based on jobId.

        const response = await fetch("https://email-sending-hr.onrender.com/send-email-interestedCandidate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            senderEmail: userEmail,
            reciverEmail: emailId,
            text: "Hello, here's your interview meeting link!", // This 'text' might be ignored by backend, check your backend logic
            companyName: "AIKING", // Assuming this is a placeholder or used by backend
            mettingLink: calendlyLink, // Using the fetched link
            // You might want to include the user-provided emailBody here if applicable
            // emailBody: emailBody // Add this if backend uses it
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          console.error("Failed to send email to:", emailId, "Error:", data.error || "Unknown error");
           // Potentially update UI or a list to show which emails failed
        } else {
           console.log("Successfully sent email to:", emailId);
           // Potentially update UI or a list to show which emails succeeded
        }
      }

      alert("Attempted to send emails to all interested candidates. Check console for specific failures.");
      // Consider clearing the interestEmails list or marking them as processed

    } catch (error) {
      console.error("Fetch error during sendEmailToInterestedCandidates:", error);
      alert("An error occurred while sending emails.");
    }
  };

  const getJd = async (uid, email) => {
    try {
      // Ensure uid is available
       if (!uid) {
            console.error("UID is not available to fetch JD.");
            return null;
        }
      const safeEmail = email.replace(/\./g, ",").toLowerCase();
      const jobIdSnapshot = await get(ref(db, `hr/${uid}/emailSent/${safeEmail}/jobId`));

      if (!jobIdSnapshot.exists()) {
        console.error(`jobId not found for ${email}.`);
        return null;
      }

      const jobId = jobIdSnapshot.val();
      const jdSnapshot = await get(ref(db, `hr/${uid}/jobProfiles/${jobId}/jdText`));
      const guideSnapshot = await get(ref(db, `hr/${uid}/jobProfiles/${jobId}/hrGuideLines`)); // Typo in original code: hrGuideLines

      if (!jdSnapshot.exists()) {
        console.log(`jd not found for jobId ${jobId}.`);
        return null; // JD is required for this email type
      }

      const jdText = jdSnapshot.val();
      // hrGuideLines is optional, proceed even if not found
      const hrGuideLines = guideSnapshot.exists() ? guideSnapshot.val() : null;


      console.log("JD Text:", jdText ? "Found" : "Not Found");
      console.log("HR GuideLines:", hrGuideLines ? "Found" : "Not Found");

      return { jdText, hrGuideLines };
    } catch (error) {
      console.error("Error fetching JD/Guide:", error);
      return null;
    }
  };


  const sendEmailToQueryCandidates = async () => {
      // Prevent sending if UID or userEmail isn't properly loaded
     if (!uid || !userEmail) {
         alert("App not fully configured (missing UID or user email). Cannot send emails.");
         return;
     }

    try {
      if (queryEmails.length === 0) {
        alert("No query candidates to email.");
        return;
      }

       // Disable buttons during sending? (Optional enhancement)

      for (const email of queryEmails) {
         const emailId = email?.from;
         if (!emailId) {
             console.warn("Skipping email with no 'from' address:", email);
             continue;
         }

        const safeEmail = emailId.replace(/\./g, ",").toLowerCase();
        const result = await getJd(uid, safeEmail);

        const jdText = result?.jdText;
        const hrGuide = result?.hrGuideLines;

        if (!jdText) {
          console.warn(`Skipping sending query response to ${emailId}: No JD text found in DB for associated jobId.`);
          toast.warning(`Skipping sending query response to ${emailId}: No Candidate found in DB for associated jobId.`)
          continue; // JD is required for this email type
        }
         console.log(`Attempting to send query response to: ${emailId}`);
        //  toast.success(``)

        // You might want to use the user-provided emailBody and hrGuideline from the form here
        // The current logic uses fetched JD and HR guide from DB.
        // If form values are intended for *all* query emails, use them instead.
        // Sticking to current logic using DB fetch per candidate based on jobId.


        const response = await fetch("https://email-sending-hr.onrender.com/send-email-queryCandidate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            senderEmail: userEmail,
            reciverEmail: emailId,
            text: "Hello, here's your Query Answers", // This 'text' might be ignored by backend
            companyName: "AIKING", // Assuming this is a placeholder
            jD: jdText, // Using the fetched JD
            hrGuide: hrGuide, // Using the fetched HR Guide (can be null)
             // You might want to include the user-provided emailBody here if applicable
            // emailBody: emailBody // Add this if backend uses it
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          console.error("Failed to send email to:", emailId, "Error:", data.error || "Unknown error");
           // Potentially update UI or a list to show which emails failed
        } else {
           console.log("Successfully sent email to:", emailId);
           toast.success("Successfully sent email to:", emailId);
            // Potentially update UI or a list to show which emails succeeded
        }
      }

      alert("Attempted to send emails to all query candidates.");
      // Consider clearing the queryEmails list or marking them as processed

    } catch (error) {
      console.error("Fetch error during sendEmailToQueryCandidates:", error);
      alert("An error occurred while sending emails.");
    }
  };


  const handleBack = () => {
    setView("input");
    setInterestEmails([]);
    setQueryEmails([]);
    setError(null);
    setReadEmailsChecked(false); // Reset checkbox when going back
    // Do NOT reset userEmail, apiKey, uid, daysAgo, form values here
  };

  const handleNextToForm = () => {
    // Only allow moving to form if the checkbox is checked
    if (readEmailsChecked) {
        setView("form"); // Switch to form view
    } else {
        // This shouldn't be reachable if the button is disabled correctly,
        // but added as a safeguard.
         alert("Please confirm you have read the emails.");
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    // The buttons inside the form handle the actual email sending via their onClick.
    // This form's onSubmit could be used for validation or saving form values if needed.
    // For now, it just prevents the default page reload.
    console.log("Form submitted (values saved in state)");
    // The send functions are called directly by the buttons.
  };

 // Show loading state while checking auth and fetching config
 if (isLoadingInitialData || loadingAuth) {
  return (
    <div className="min-h-screen bg-[#11011E] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-lg shadow-lg p-8 text-center text-[#B6B6B6] font-inter font-semibold">
        <svg
          className="animate-spin h-8 w-8 text-[#0FAE96] mx-auto mb-4"
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
            d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"
          ></path>
        </svg>
        Loading configuration...
      </div>
    </div>
  );
}

// Authentication error
if (errorAuth) {
  return (
    <div className="min-h-screen bg-[#11011E] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-lg shadow-lg p-8 text-center text-red-400 font-inter font-semibold">
        Authentication Error: {errorAuth.message}
      </div>
    </div>
  );
}

// Configuration error (not logged in)
if (!user && !isLoadingInitialData && error) {
  return (
    <div className="min-h-screen bg-[#11011E] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-lg shadow-lg p-8 text-center text-red-400 font-inter font-semibold">
        Configuration Error: {error} <br />
        <br /> Please ensure you are logged in and your HR email and API key are configured in the database.
      </div>
    </div>
  );
}

// Configuration error (logged in, missing data)
if (user && !isLoadingInitialData && (error || !userEmail || !apiKey)) {
  return (
    <div className="min-h-screen bg-[#11011E] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-lg shadow-lg p-8 text-center text-red-400 font-inter font-semibold">
        Configuration Error: {error || "Missing HR email or API key in database."}
        <br />
        <br /> Please ensure your HR email and API key are correctly set up in the database for your account.
      </div>
    </div>
  );
}

// Main UI
return (
  <div className="min-h-screen bg-[#11011E] flex items-center justify-center p-4 relative">
    {/* Background glow accents */}
    <div className="absolute top-0 left-0 w-64 h-64 bg-[#7000FF] rounded-full blur-[180px] opacity-25"></div>
    <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#FF00C7] rounded-full blur-[180px] opacity-25"></div>
    <div className="w-full max-w-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-lg shadow-lg p-6 sm:p-8 relative z-10">
      <h1 className="text-2xl md:text-3xl font-raleway font-bold text-[#ECF1F0] mb-6 text-center">
        HR Email Reader
      </h1>

      {view === "input" && (
        <div className="space-y-6">
          {userEmail && (
            <div className="p-3 bg-[rgba(15,174,150,0.1)] text-[#0FAE96] rounded-md border border-[rgba(15,174,150,0.3)] text-sm text-center font-inter">
              Using HR Email: <span className="font-semibold">{userEmail}</span>
            </div>
          )}
          {apiKey && (
            <div className="p-3 bg-[rgba(15,174,150,0.1)] text-[#0FAE96] rounded-md border border-[rgba(15,174,150,0.3)] text-sm text-center font-inter">
              API Key Loaded Successfully.
            </div>
          )}
          <div>
            <label className="block text-[#B6B6B6] font-inter font-semibold mb-2">
              Select Time Range (Days Ago)
            </label>
            <select
              value={daysAgo}
              onChange={(e) => setDaysAgo(e.target.value)}
              className="w-full p-3 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-md text-[#B6B6B6] font-inter focus:outline-none focus:ring-2 focus:ring-[#0FAE96] h-15"
            >
              {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                <option key={day} value={day} className="bg-[#11011E] text-[#B6B6B6]">
                  {day} Day{day > 1 ? "s" : ""} Ago
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="p-4 bg-[rgba(239,68,68,0.1)] text-red-400 rounded-md font-inter" role="alert">
              {error}
            </div>
          )}

          <button
            onClick={handleReadEmails}
            disabled={loadingEmails || !userEmail || !apiKey}
            className={`w-full bg-[#0FAE96] text-white font-raleway font-semibold text-base px-6 py-3 rounded-md transition duration-200 h-10 flex items-center justify-center
              ${
                loadingEmails || !userEmail || !apiKey
                  ? "bg-gray-600 cursor-not-allowed"
                  : "hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0FAE96]"
              }`}
          >
            {loadingEmails ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-white"
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
                    d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"
                  ></path>
                </svg>
                Fetching Emails...
              </span>
            ) : (
              "Fetch Emails"
            )}
          </button>
          {!userEmail && !isLoadingInitialData && (
            <p className="text-sm text-center text-red-400 font-inter">
              Waiting for HR email to load from database.
            </p>
          )}
          {!apiKey && !isLoadingInitialData && (
            <p className="text-sm text-center text-red-400 font-inter">
              Waiting for API Key to load from database.
            </p>
          )}
        </div>
      )}

      {view === "results" && (
        <div className="space-y-6">
          <button
            onClick={handleBack}
            className="w-full bg-[#0FAE96] text-white font-raleway font-semibold text-base px-6 py-3 rounded-md transition duration-200 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0FAE96] h-10"
          >
            Back
          </button>

          {interestEmails.length > 0 && (
            <div className="max-h-64 overflow-y-auto bg-[rgba(255,255,255,0.02)] p-4 rounded-md border border-[rgba(255,255,255,0.05)]">
              <h3 className="text-lg font-raleway font-bold mb-3 text-[#ECF1F0]">
                Interested Emails ({interestEmails.length}):
              </h3>
              <ul className="space-y-3">
                {interestEmails.map((email, index) => (
                  <li key={email.id || index} className="border-b border-[rgba(255,255,255,0.05)] pb-2">
                    <p className="text-sm text-[#B6B6B6] font-inter">
                      <span className="font-semibold">From:</span> {email.from}
                    </p>
                    <p className="text-sm text-[#B6B6B6] font-inter">
                      <span className="font-semibold">Subject:</span> {email.subject}
                    </p>
                    <p className="text-xs text-[#B6B6B6] font-inter">{email.date}</p>
                    {email.snippet && (
                      <p className="text-xs text-[#B6B6B6] mt-1 line-clamp-2 font-inter">{email.snippet}</p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {queryEmails.length > 0 && (
            <div className="max-h-64 overflow-y-auto bg-[rgba(255,255,255,0.02)] p-4 rounded-md border border-[rgba(255,255,255,0.05)]">
              <h3 className="text-lg font-raleway font-bold mb-3 text-[#ECF1F0]">
                Query Emails ({queryEmails.length}):
              </h3>
              <ul className="space-y-3">
                {queryEmails.map((email, index) => (
                  <li key={email.id || index} className="border-b border-[rgba(255,255,255,0.05)] pb-2">
                    <p className="text-sm text-[#B6B6B6] font-inter">
                      <span className="font-semibold">From:</span> {email.from}
                    </p>
                    <p className="text-sm text-[#B6B6B6] font-inter">
                      <span className="font-semibold">Subject:</span> {email.subject}
                    </p>
                    <p className="text-xs text-[#B6B6B6] font-inter">{email.date}</p>
                    {email.snippet && (
                      <p className="text-xs text-[#B6B6B6] mt-1 line-clamp-2 font-inter">{email.snippet}</p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {interestEmails.length === 0 && queryEmails.length === 0 && (
            <div className="text-center p-8 border border-[rgba(255,255,255,0.05)] rounded-md bg-[rgba(255,255,255,0.02)]">
              <svg
                className="mx-auto h-16 w-16 text-[#B6B6B6] mb-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <p className="mt-4 text-[#B6B6B6] font-inter font-semibold">
                No emails found matching interest or query criteria for the selected time range.
              </p>
              {error && (
                <div
                  className="p-3 mt-4 bg-[rgba(239,68,68,0.1)] text-red-400 rounded-md text-sm font-inter"
                  role="alert"
                >
                  Error during fetch: {error}
                </div>
              )}
            </div>
          )}

          {(interestEmails.length > 0 || queryEmails.length > 0) && (
            <>
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="read-emails-checkbox"
                  checked={readEmailsChecked}
                  onChange={(e) => setReadEmailsChecked(e.target.checked)}
                  className="h-5 w-5 text-[#0FAE96] focus:ring-[#0FAE96] border-[rgba(255,255,255,0.05)] rounded bg-[rgba(255,255,255,0.02)]"
                />
                <label
                  htmlFor="read-emails-checkbox"
                  className="ml-2 text-sm text-[#B6B6B6] font-inter font-medium"
                >
                  I have reviewed all emails carefully and am ready to proceed.
                </label>
              </div>

              <button
                onClick={handleNextToForm}
                disabled={!readEmailsChecked}
                className={`w-full bg-[#0FAE96] text-white font-raleway font-semibold text-base px-6 py-3 rounded-md transition duration-200 h-10
                  ${
                    !readEmailsChecked
                      ? "bg-gray-600 cursor-not-allowed"
                      : "hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0FAE96]"
                  }`}
              >
                Proceed to Email Sending Options
              </button>
            </>
          )}
        </div>
      )}

      {view === "form" && (
        <div className="space-y-6">
          <button
            onClick={() => setView("results")}
            className="w-full bg-[#0FAE96] text-white font-raleway font-semibold text-base px-6 py-3 rounded-md transition duration-200 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0FAE96] h-10"
          >
            Back to Results
          </button>
          <h2 className="text-xl md:text-2xl font-raleway font-bold text-[#ECF1F0] mb-4 text-center">
            Enter Email Details
          </h2>
          <div className="flex justify-around text-center text-[#B6B6B6] font-inter font-medium">
            <span>
              Interested: <span className="font-bold text-[#0FAE96]">{interestEmails.length}</span>
            </span>
            <span>
              Queries: <span className="font-bold text-[#0FAE96]">{queryEmails.length}</span>
            </span>
          </div>
          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div>
              <label className="block text-[#B6B6B6] font-inter font-semibold mb-2">
                Meeting Link (Optional default for Interested)
              </label>
              <input
                type="text"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                placeholder="e.g., https://calendly.com/your-link"
                className="w-full p-3 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-md text-[#B6B6B6] font-inter focus:outline-none focus:ring-2 focus:ring-[#0FAE96] h-10"
              />
              <p className="text-sm text-[#B6B6B6] mt-1 font-inter">
                Currently, job-specific links are fetched from the database.
              </p>
            </div>

            <div>
              <label className="block text-[#B6B6B6] font-inter font-semibold mb-2">
                HR Guideline (Optional default for Queries)
              </label>
              <textarea
                value={hrGuideline}
                onChange={(e) => setHrGuideline(e.target.value)}
                placeholder="Enter HR guidelines here..."
                className="w-full h-28 p-3 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-md text-[#B6B6B6] font-inter resize-none focus:outline-none focus:ring-2 focus:ring-[#0FAE96]"
              />
              <p className="text-sm text-[#B6B6B6] mt-1 font-inter">
                Currently, job-specific guidelines are fetched from the database.
              </p>
            </div>

            <div>
              <label className="block text-[#B6B6B6] font-inter font-semibold mb-2">
                Additional Email Body Content (Optional)
              </label>
              <textarea
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                placeholder="Write your email content here..."
                className="w-full h-40 p-3 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-md text-[#B6B6B6] font-inter resize-none focus:outline-none focus:ring-2 focus:ring-[#0FAE96]"
              />
              <p className="text-sm text-[#B6B6B6] mt-1 font-inter">
                This content is currently *not* used by the email sending functions. Modify them if needed.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              {interestEmails.length > 0 && (
                <button
                  type="button"
                  onClick={sendEmailToInterestedCandidates}
                  className="flex-1 bg-[#0FAE96] text-white font-raleway font-semibold text-base px-6 py-3 rounded-md transition duration-200 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0FAE96] h-10 disabled:bg-gray-600 disabled:cursor-not-allowed"
                  disabled={interestEmails.length === 0}
                >
                  Send Interview Link to {interestEmails.length} Interested Candidate
                  {interestEmails.length !== 1 ? "s" : ""}
                </button>
              )}
              {queryEmails.length > 0 && (
                <button
                  type="button"
                  onClick={sendEmailToQueryCandidates}
                  className="flex-1 bg-[#0FAE96] text-white font-raleway font-semibold text-base px-6 py-3 rounded-md transition duration-200 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0FAE96] h-10 disabled:bg-gray-600 disabled:cursor-not-allowed"
                  disabled={queryEmails.length === 0}
                >
                  Send Response to {queryEmails.length} Candidate{queryEmails.length !== 1 ? "s" : ""} with Quer
                  {queryEmails.length !== 1 ? "ies" : "y"}
                </button>
              )}
              {interestEmails.length === 0 && queryEmails.length === 0 && (
                <p className="text-center text-[#B6B6B6] col-span-full font-inter">
                  No candidates in either category to email.
                </p>
              )}
            </div>
            <p className="text-sm text-red-400 text-center font-inter">
              Note: Sending emails uses backend services. Check browser console and backend logs for detailed
              success/failure statuses for each email.
            </p>
          </form>
        </div>
      )}
    </div>
  </div>
);
}

export default HREmailPage;