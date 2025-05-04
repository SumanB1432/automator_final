"use client";
import React, { useState } from "react";

const GetEmail = () => {
    const [email, setEmail] = useState("");
    const [daysAgo, setDaysAgo] = useState("1");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);
    const [expandedEmails, setExpandedEmails] = useState({});

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setResult(null);
        setExpandedEmails({});
        setLoading(true);

        try {
            const response = await fetch("/read-emails", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, daysAgo: parseInt(daysAgo) }),
            });

            const data = await response.json();
            if (response.ok) {
                setResult(data);
            } else {
                setError(data.error || "Failed to fetch emails.");
            }
        } catch (err) {
            setError("An error occurred while fetching emails.");
        } finally {
            setLoading(false);
        }
    };

    const dismissError = () => setError(null);

    const toggleEmailBody = (emailId) => {
        setExpandedEmails((prev) => ({
            ...prev,
            [emailId]: !prev[emailId],
        }));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-6">
            <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-3xl">
                <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Email Fetcher</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                            placeholder="Enter your email"
                            required
                            aria-describedby="email-error"
                        />
                    </div>
                    <div>
                        <label htmlFor="daysAgo" className="block text-sm font-medium text-gray-700 mb-2">
                            Select Time Range
                        </label>
                        <select
                            id="daysAgo"
                            value={daysAgo}
                            onChange={(e) => setDaysAgo(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                            required
                        >
                            {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                                <option key={day} value={day}>
                                    {day} Day{day > 1 ? "s" : ""} Ago
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={loading || !email}
                    className={`w-full py-3 px-4 rounded-lg text-white font-semibold ${
                        loading || !email ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                    } transition duration-200 flex items-center justify-center`}
                >
                    {loading ? (
                        <span className="flex items-center">
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
                            Fetching...
                        </span>
                    ) : (
                        "Fetch Emails"
                    )}
                </button>

                {error && (
                    <div
                        className="mt-6 p-4 bg-red-100 text-red-700 rounded-lg flex justify-between items-center"
                        role="alert"
                        id="email-error"
                    >
                        <span>{error}</span>
                        <button
                            onClick={dismissError}
                            className="text-red-700 hover:text-red-900"
                            aria-label="Dismiss error"
                        >
                            <svg
                                className="h-5 w-5"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>
                )}

                {!result && !loading && !error && (
                    <div className="mt-8 text-center">
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
                        <p className="mt-4 text-gray-500">Enter an email and time range to fetch emails.</p>
                    </div>
                )}

                {result && (
                    <div className="mt-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Fetched Emails for {result.userEmail}
                        </h2>
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-lg font-medium text-gray-800 mb-3">
                                    Interested Emails ({result.interestEmails.length})
                                </h3>
                                {result.interestEmails.length > 0 ? (
                                    <ul className="space-y-4">
                                        {result.interestEmails.map((email) => (
                                            <li
                                                key={email.id}
                                                className="p-6 bg-gray-50 rounded-lg shadow-sm"
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p>
                                                            <strong>From:</strong> {email.fromFull}
                                                        </p>
                                                        <p>
                                                            <strong>Subject:</strong> {email.subject}
                                                        </p>
                                                        <p>
                                                            <strong>Date:</strong> {email.date}
                                                        </p>
                                                        <p className="mt-2 text-gray-600">{email.snippet}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => toggleEmailBody(email.id)}
                                                        className="text-blue-600 hover:text-blue-800"
                                                        aria-label={
                                                            expandedEmails[email.id]
                                                                ? "Hide email body"
                                                                : "Show email body"
                                                        }
                                                    >
                                                        {expandedEmails[email.id] ? "Hide" : "Show"} Body
                                                    </button>
                                                </div>
                                                {expandedEmails[email.id] && (
                                                    <div className="mt-4 p-4 bg-white rounded-md border border-gray-200">
                                                        <p className="text-gray-700 whitespace-pre-wrap">
                                                            {email.body || "No body content available."}
                                                        </p>
                                                    </div>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-gray-600">No interested emails found.</p>
                                )}
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-gray-800 mb-3">
                                    Query Emails ({result.queryEmails.length})
                                </h3>
                                {result.queryEmails.length > 0 ? (
                                    <ul className="space-y-4">
                                        {result.queryEmails.map((email) => (
                                            <li
                                                key={email.id}
                                                className="p-6 bg-gray-50 rounded-lg shadow-sm"
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p>
                                                            <strong>From:</strong> {email.fromFull}
                                                        </p>
                                                        <p>
                                                            <strong>Subject:</strong> {email.subject}
                                                        </p>
                                                        <p>
                                                            <strong>Date:</strong> {email.date}
                                                        </p>
                                                        <p className="mt-2 text-gray-600">{email.snippet}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => toggleEmailBody(email.id)}
                                                        className="text-blue-600 hover:text-blue-800"
                                                        aria-label={
                                                            expandedEmails[email.id]
                                                                ? "Hide email body"
                                                                : "Show email body"
                                                        }
                                                    >
                                                        {expandedEmails[email.id] ? "Hide" : "Show"} Body
                                                    </button>
                                                </div>
                                                {expandedEmails[email.id] && (
                                                    <div className="mt-4 p-4 bg-white rounded-md border border-gray-200">
                                                        <p className="text-gray-700 whitespace-pre-wrap">
                                                            {email.body || "No body content available."}
                                                        </p>
                                                    </div>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-gray-600">No query emails found.</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GetEmail;
