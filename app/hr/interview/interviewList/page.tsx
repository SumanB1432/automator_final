'use client'
import { useState, useEffect } from "react";
import { getDatabase, ref, get } from "firebase/database";
import app from "@/firebase/config";
import { toast } from "react-toastify";
import { auth } from "@/firebase/config";

const CheckInterviews = () => {
  const [interviews, setInterviews] = useState([]);
  const [uid, setUid] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const isHRLoggedIn = localStorage.getItem("IsLoginAsHR");
    if (isHRLoggedIn !== "true") {
      toast.warning("Access denied. Please log in as an HR user.", {
        position: "top-center",
        autoClose: 2000,
      });
      setTimeout(() => {
        window.location.href = "/hr/login";
      }, 2000);
    } else {
      const storedUid = localStorage.getItem("UIDforHR");
      setUid(storedUid || "");
    }
  }, []);

  useEffect(() => {
    if (!uid) return;

    const fetchInterviews = async () => {
      try {
        setLoading(true);
        const db = getDatabase(app);
        const interviewsRef = ref(db, `hr/${uid}/interviews`);
        const snapshot = await get(interviewsRef);

        if (snapshot.exists()) {
          const interviewIds = Object.keys(snapshot.val());
          const interviewPromises = interviewIds.map(id =>
            get(ref(db, `interviews/${id}`))
          );
          const interviewSnapshots = await Promise.all(interviewPromises);
          const interviewsData = interviewSnapshots
            .map(snap => snap.val())
            .filter(Boolean);

          setInterviews(interviewsData);
        } else {
          setInterviews([]);
        }
      } catch (err) {
        setError("Failed to fetch interviews. Please try again later.");
        toast.error("Error fetching interviews.", {
          position: "top-center",
          autoClose: 3000,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInterviews();
  }, [uid]);

  return (
    <div className="min-h-screen bg-[#11011E] text-white p-4 sm:p-6 flex items-center justify-center">
      <div className="w-full max-w-4xl bg-[#2A0A3A] rounded-2xl shadow-xl p-6 sm:p-8 transform transition-all duration-300">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#0FAE96] mb-6 text-center">
          Scheduled Interviews
        </h1>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0FAE96]"></div>
          </div>
        ) : error ? (
          <p className="text-center text-red-400 py-4">{error}</p>
        ) : interviews.length === 0 ? (
          <p className="text-center text-gray-400 py-4">No interviews scheduled at this time.</p>
        ) : (
          <ul className="space-y-3">
            {interviews.map((interview, index) => (
              <li
                key={index}
                className="bg-[#3B1E5A] hover:bg-[#4B2E6A] transition-all duration-200 rounded-lg p-4 shadow-md transform hover:-translate-y-1 flex justify-between items-center"
              >
                <div>
                  <span className="block text-lg font-semibold text-[#0FAE96]">
                    {interview.name || "Untitled Role"}
                  </span>
                  <p className="text-sm text-gray-300 mt-1">
                    {interview.email || "No email provided"} • {interview.role || "No role specified"}
                  </p>
                </div>
                <a
                  href={`/hr/interview/interviewDetails/?id=${interview.sessionId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#0FAE96] text-white rounded-full p-2 hover:bg-[#0D9C85] active:bg-[#0B8A73] transform hover:scale-105 active:scale-95 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#0FAE96] focus:ring-opacity-50"
                  aria-label={`View details for ${interview.role || "interview"}`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default CheckInterviews;