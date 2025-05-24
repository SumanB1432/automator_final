'use client'
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getDatabase, ref, get } from "firebase/database";
import app from "@/firebase/config";
import { toast } from "react-toastify";

const InterviewDetails = () => {
  const searchParams = useSearchParams();
  const interviewId = searchParams.get("id");
  const [interview, setInterview] = useState(null);
  const [transcript, setTranscript] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInterview = async () => {
      if (!interviewId) {
        setError("Interview ID not provided.");
        toast.error("Interview ID not provided.", {
          position: "top-center",
          autoClose: 3000,
        });
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const db = getDatabase(app);
        const interviewRef = ref(db, `interviews/${interviewId}`);
        const snapshot = await get(interviewRef);

        if (snapshot.exists()) {
          const data = snapshot.val();
          setInterview(data);
          setTranscript(data.transcript || []);
        } else {
          setError("Interview not found.");
          toast.error("Interview not found.", {
            position: "top-center",
            autoClose: 3000,
          });
        }
      } catch (error) {
        console.error("Error fetching interview:", error);
        setError("Failed to fetch interview details.");
        toast.error("Failed to fetch interview details.", {
          position: "top-center",
          autoClose: 3000,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInterview();
  }, [interviewId]);

  return (
    <div className="min-h-screen bg-[#11011E] text-white p-4 sm:p-6 flex items-center justify-center">
      <div className="w-full max-w-4xl bg-[#2A0A3A] rounded-2xl shadow-xl p-6 sm:p-8 transform transition-all duration-300">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#0FAE96] mb-6 text-center">
          Interview Details
        </h1>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0FAE96]"></div>
          </div>
        ) : error ? (
          <p className="text-center text-red-400 py-4">{error}</p>
        ) : !interview ? (
          <p className="text-center text-gray-400 py-4">No interview data available.</p>
        ) : (
          <div className="space-y-6">
            {/* Interview Details Section */}
            <div className="bg-[#3B1E5A] rounded-xl p-5 shadow-md">
              <h2 className="text-xl font-semibold text-[#0FAE96] mb-4">Candidate Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <p>
                  <span className="text-[#0FAE96] font-semibold">Name:</span>{" "}
                  {interview.name || "N/A"}
                </p>
                <p>
                  <span className="text-[#0FAE96] font-semibold">Email:</span>{" "}
                  {interview.email || "N/A"}
                </p>
                <p>
                  <span className="text-[#0FAE96] font-semibold">Role:</span>{" "}
                  {interview.role || "N/A"}
                </p>

                <p>
                  <span className="text-[#0FAE96] font-semibold">Additional Notes:</span>{" "}
                  {interview.notes || "N/A"}
                </p>
              </div>
            </div>

            {/* Feedback Section */}
            <div className="bg-[#3B1E5A] rounded-xl p-5 shadow-md">
              <h2 className="text-xl font-semibold text-[#0FAE96] mb-4">Feedback</h2>
              <p>
                <span className="text-[#0FAE96] font-semibold">Overall Score:</span>{" "}
                {interview.feedback?.overallScore
                  ? `${interview.feedback.overallScore} / 10`
                  : "N/A"}
              </p>
              <p>
                <span className="text-[#0FAE96] font-semibold">Strength:</span>{" "}
                {interview.feedback?.strength || "N/A"}
              </p>
              <p>
                <span className="text-[#0FAE96] font-semibold">Skill Level:</span>{" "}
                {interview.skillLevel || "N/A"}
              </p>
            </div>

            {/* Recording Section */}
            <div className="bg-[#3B1E5A] rounded-xl p-5 shadow-md">
              <h2 className="text-xl font-semibold text-[#0FAE96] mb-4">Interview Recording</h2>
              {interview.feedback?.recording ? (
                <div className="relative w-full h-0 pb-[56.25%] rounded-lg overflow-hidden">
                  <video
                    className="absolute top-0 left-0 w-full h-full"
                    controls
                    src={interview.feedback.recording}
                    poster="/placeholder-video.jpg"
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              ) : (
                <p className="text-gray-400">No recording available.</p>
              )}
            </div>

            {/* Transcript Section */}
            <div className="bg-[#3B1E5A] rounded-xl p-5 shadow-md">
              <h2 className="text-xl font-semibold text-[#0FAE96] mb-4">Transcript</h2>
              {transcript.length === 0 ? (
                <p className="text-gray-400">No transcript available.</p>
              ) : (
                <ul className="space-y-3">
                  {transcript.map((item, index) => (
                    <li
                      key={index}
                      className="bg-[#4B2E6A] p-4 rounded-lg shadow-sm transition-all duration-200 hover:-translate-y-1"
                    >
                      <p className="text-[#0FAE96] font-semibold">
                        Question {index + 1}:{" "}
                        <span className="text-white">{item.question || "N/A"}</span>
                      </p>
                      <p className="text-gray-300 mt-1">
                        <span className="text-[#0FAE96] font-semibold">Answer:</span>{" "}
                        {item.answer || "N/A"}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewDetails;