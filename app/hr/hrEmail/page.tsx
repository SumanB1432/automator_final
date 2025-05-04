"use client";
import React, { useState } from "react";
import { getDatabase, ref, get } from 'firebase/database';
import app from "@/firebase/config";
import { auth } from "@/firebase/config";

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
  const db = getDatabase(app);

  const handleReadEmails = async () => {
    if (!userEmail) {
      setError("Please enter your email.");
      return;
    }

    setLoadingEmails(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:8080/read-emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: userEmail, daysAgo: parseInt(daysAgo) }),
      });

      const data = await response.json();
      if (response.ok) {
        setInterestEmails(data.interestEmails || []);
        setQueryEmails(data.queryEmails || []);
        setReadEmailsChecked(false); // Reset checkbox
        setView("results"); // Switch to results view
      } else {
        setError(data.error || "Failed to fetch emails");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setError("An error occurred while reading emails.");
    } finally {
      setLoadingEmails(false);
    }
  };

  const getCalendlyLink = async (uid, email) => {
    try {
      const safeEmail = email.replace(/\./g, ",").toLowerCase();
      const jobIdSnapshot = await get(ref(db, `hr/${uid}/emailSent/${safeEmail}/jobId`));

      if (!jobIdSnapshot.exists()) {
        console.error("jobId not found.");
        return null;
      }

      const jobId = jobIdSnapshot.val();
      const calendlySnapshot = await get(ref(db, `hr/${uid}/jobProfiles/${jobId}/calendlyLink`));

      if (!calendlySnapshot.exists()) {
        console.log("calendlyLink not found.");
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
    try {
      if (interestEmails.length === 0) {
        alert("No interested candidates to email.");
        return;
      }

      const uid = "ZEgE8varFRNnThMfjpbEm7h8gJY2";

      for (const email of interestEmails) {
        const emailId = email?.from;
        const safeEmail = emailId.replace(/\./g, ",").toLowerCase();
        const calendlyLink = await getCalendlyLink(uid, safeEmail);

        if (!calendlyLink) {
          console.warn(`Skipping ${emailId}: No Calendly link found.`);
          continue;
        }

        const response = await fetch("http://localhost:8080/send-email-interestedCandidate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            senderEmail: userEmail,
            reciverEmail: emailId,
            text: "Hello, here's your interview meeting link!",
            companyName: "AIKING",
            mettingLink: calendlyLink,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          console.error("Failed to send email to:", emailId, data);
        }
      }

      alert("Emails sent to all interested candidates!");
    } catch (error) {
      console.error("Fetch error:", error);
      alert("An error occurred while sending emails.");
    }
  };

  const getJd = async (uid, email) => {
    try {
      const safeEmail = email.replace(/\./g, ",").toLowerCase();
      const jobIdSnapshot = await get(ref(db, `hr/${uid}/emailSent/${safeEmail}/jobId`));

      if (!jobIdSnapshot.exists()) {
        console.error("jobId not found.");
        return null;
      }

      const jobId = jobIdSnapshot.val();
      const jdSnapshot = await get(ref(db, `hr/${uid}/jobProfiles/${jobId}/jdText`));
      const guideSnapshot = await get(ref(db, `hr/${uid}/jobProfiles/${jobId}/hrGuideLines`));

      if (!jdSnapshot.exists()) {
        console.log("jd not found.");
        return null;
      }

      const jdText = jdSnapshot.val();
      const hrGuideLines = guideSnapshot.val();

      console.log("JD Text:", jdText);
      return { jdText, hrGuideLines };
    } catch (error) {
      console.error("Error fetching JD:", error);
      return null;
    }
  };

  const sendEmailToQueryCandidates = async () => {
    try {
      if (queryEmails.length === 0) {
        alert("No query candidates to email.");
        return;
      }

      const uid = "ZEgE8varFRNnThMfjpbEm7h8gJY2";

      for (const email of queryEmails) {
        const emailId = email?.from;
        const safeEmail = emailId.replace(/\./g, ",").toLowerCase();
        const result = await getJd(uid, safeEmail);

        const jdText = result?.jdText;
        const hrGuide = result?.hrGuideLines;

        if (!jdText) {
          console.warn(`Skipping ${emailId}: No JD text found.`);
          continue;
        }

        const response = await fetch("http://localhost:8080/send-email-queryCandidate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            senderEmail: userEmail,
            reciverEmail: emailId,
            text: "Hello, here's your Query Answers",
            companyName: "AIKING",
            jD: jdText,
            hrGuide: hrGuide,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          console.error("Failed to send email to:", emailId, data);
        }
      }

      alert("Emails sent to all query candidates!");
    } catch (error) {
      console.error("Fetch error:", error);
      alert("An error occurred while sending emails.");
    }
  };

  const handleBack = () => {
    setView("input");
    setInterestEmails([]);
    setQueryEmails([]);
    setError(null);
    setReadEmailsChecked(false);
  };

  const handleNextToForm = () => {
    setView("form"); // Switch to form view
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    // Save values in state (already done via onChange)
    alert(
      `Values saved:\nMeeting Link: ${meetingLink}\nHR Guideline: ${hrGuideline}\nEmail Body: ${emailBody}`
    );
    // Add further logic here if needed (e.g., save to Firebase, proceed to another view)
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-6 sm:p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          HR Email Reader
        </h1>

        {view === "input" && (
          <div className="space-y-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Your Email
              </label>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="example@gmail.com"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Select Time Range
              </label>
              <select
                value={daysAgo}
                onChange={(e) => setDaysAgo(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                  <option key={day} value={day}>
                    {day} Day{day > 1 ? "s" : ""} Ago
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <div
                className="p-4 bg-red-100 text-red-700 rounded-lg"
                role="alert"
              >
                {error}
              </div>
            )}

            <button
              onClick={handleReadEmails}
              disabled={loadingEmails || !userEmail}
              className={`w-full py-3 rounded-xl text-white font-semibold transition duration-300 ${loadingEmails || !userEmail
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
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
                      cx="	screen 12"
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
                "Next"
              )}
            </button>
          </div>
        )}

        {view === "results" && (
          <div className="space-y-6">
            <button
              onClick={handleBack}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 rounded-xl transition duration-300"
            >
              Back
            </button>

            {interestEmails.length > 0 && (
              <div className="max-h-64 overflow-y-auto bg-gray-50 p-4 rounded-lg border">
                <h3 className="text-lg font-bold mb-3 text-gray-800">Interested Emails:</h3>
                <ul className="space-y-3">
                  {interestEmails.map((email, index) => (
                    <li key={email.id || index} className="border-b pb-2">
                      <p className="text-sm text-gray-800">
                        <span className="font-semibold">From:</span> {email.from}
                      </p>
                      <p className="text-sm text-gray-800">
                        <span className="font-semibold">Subject:</span> {email.subject}
                      </p>
                      <p className="text-xs text-gray-500">{email.date}</p>
                    </li>
                  ))}
                </ul>

              </div>
            )}

            {queryEmails.length > 0 && (
              <div className="max-h-64 overflow-y-auto bg-gray-50 p-4 rounded-lg border">
                <h3 className="text-lg font-bold mb-3 text-gray-800">Query Emails:</h3>
                <ul className="space-y-3">
                  {queryEmails.map((email, index) => (
                    <li key={email.id || index} className="border-b pb-2">
                      <p className="text-sm text-gray-800">
                        <span className="font-semibold">From:</span> {email.from}
                      </p>
                      <p className="text-sm text-gray-800">
                        <span className="font-semibold">Subject:</span> {email.subject}
                      </p>
                      <p className="text-xs text-gray-500">{email.date}</p>
                    </li>
                  ))}
                </ul>

              </div>
            )}

            {interestEmails.length === 0 && queryEmails.length === 0 && (
              <div className="text-center">
                <svg
                  className="mx-auto h-24 w-24 text-gray-400"
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
                <p className="mt-4 text-gray-500">No emails found for the selected time range.</p>
              </div>
            )}

            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="read-emails-checkbox"
                checked={readEmailsChecked}
                onChange={(e) => setReadEmailsChecked(e.target.checked)}
                className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor="read-emails-checkbox" className="ml-2 text-sm text-gray-700">
                I read all emails carefully
              </label>
            </div>

            <button
              onClick={handleNextToForm}
              disabled={!readEmailsChecked}
              className={`w-full py-3 rounded-xl text-white font-semibold transition duration-300 ${readEmailsChecked
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-gray-400 cursor-not-allowed"
                }`}
            >
              Next
            </button>
          </div>
        )}

        {view === "form" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
              Enter Email Details
            </h2>
            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Meeting Link
                </label>
                <input
                  type="text"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  placeholder="e.g., https://calendly.com/your-link"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  HR Guideline
                </label>
                <textarea
                  value={hrGuideline}
                  onChange={(e) => setHrGuideline(e.target.value)}
                  placeholder="Enter HR guidelines here..."
                  className="w-full h-28 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Email Body
                </label>
                <textarea
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  placeholder="Write your email content here..."
                  className="w-full h-40 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition duration-300"
                  onClick={sendEmailToInterestedCandidates}
                >
                  Send Interview Link to Interested Candidates
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition duration-300"
                  onClick={sendEmailToQueryCandidates}
                >
                  Send Email to Candidates with Queries
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default HREmailPage;