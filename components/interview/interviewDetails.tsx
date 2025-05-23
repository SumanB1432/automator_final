'use client'
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getDatabase, ref, get } from "firebase/database";
import app from "@/firebase/config";
import { toast } from "react-toastify";

const InterviewDetails = () => {
  const searchParams = useSearchParams();
  const interviewId = searchParams.get("id");
  const [interview, setInterview] = useState<any>(null);

  useEffect(() => {
    const fetchInterview = async () => {
      if (!interviewId) {
        toast.error("Interview ID not provided.");
        return;
      }

      try {
        const db = getDatabase(app);
        const interviewRef = ref(db, `interviews/${interviewId}`);
        const snapshot = await get(interviewRef);

        if (snapshot.exists()) {
          setInterview(snapshot.val());
        } else {
          toast.error("Interview not found.");
        }
      } catch (error) {
        console.error("Error fetching interview:", error);
        toast.error("Failed to fetch interview details.");
      }
    };

    fetchInterview();
  }, [interviewId]);

  return (
    <div className="min-h-screen bg-[#11011E] text-white p-6">
      <div className="max-w-3xl mx-auto bg-[#2A0A3A] rounded-2xl shadow-lg p-6">
        <h1 className="text-3xl font-bold text-[#0FAE96] mb-6 text-center">Interview Details</h1>

        {!interview ? (
          <p className="text-center text-gray-400">Loading interview details...</p>
        ) : (
          <div className="space-y-4 text-base">
            <div className="bg-[#3B1E5A] rounded-xl p-4 shadow-md">
              <p><span className="text-[#0FAE96] font-semibold">Name:</span> {interview.name}</p>
              <p><span className="text-[#0FAE96] font-semibold">Email:</span> {interview.email}</p>
              <p><span className="text-[#0FAE96] font-semibold">Role:</span> {interview.role}</p>
              <p><span className="text-[#0FAE96] font-semibold">Session ID:</span> {interview.sessionId}</p>
              <p><span className="text-[#0FAE96] font-semibold">Scheduled Time:</span> {interview.time || "N/A"}</p>
              <p><span className="text-[#0FAE96] font-semibold">Additional Notes:</span> {interview.notes || "N/A"}</p>
              <p className="text-[#0FAE96] font-semibold">Recording : <span>{interview.feedback.recording}</span></p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewDetails;