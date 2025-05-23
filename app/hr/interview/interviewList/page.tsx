'use client'
import { useState, useEffect } from "react";
import { getDatabase, ref, get } from "firebase/database";
import app from "@/firebase/config";
import { toast } from "react-toastify";
import { auth } from "@/firebase/config";

const CheckInterviews = () => {
  const [interviews, setInterviews] = useState([]);
  const [uid,setUid] = useState<string>("");


    useEffect(() => {
    const isHRLoggedIn = localStorage.getItem("IsLoginAsHR");
    console.log(isHRLoggedIn)
  
    if (isHRLoggedIn !== "true") {
      toast.warning("Access denied. Please log in as an HR user.");
  
      setTimeout(() => {
        window.location.href = "/hr/login";
      }, 2000);
    }
    let uid = localStorage.getItem("UIDforHR");
    console.log(uid,"uid")
    setUid(uid);
  }, []);

  useEffect(() => {
    const fetchInterviews = async () => {
      const db = getDatabase(app);
      const interviewsRef = ref(db, `hr/${uid}/interviews`);
      
      const snapshot = await get(interviewsRef);
      if (snapshot.exists()) {
        const interviewIds = Object.keys(snapshot.val());
        const interviewPromises = interviewIds.map(id => 
          get(ref(db, `interviews/${id}`))
        );
        const interviewSnapshots = await Promise.all(interviewPromises);
        const interviewsData = interviewSnapshots.map(snap => snap.val());
        
        setInterviews(interviewsData);
      }
    };

    fetchInterviews();
  }, [uid]);

  return (
    <div className="min-h-screen bg-[#11011E] text-white p-6">
      <div className="max-w-3xl mx-auto bg-[#2A0A3A] rounded-2xl shadow-lg p-6">
        <h1 className="text-3xl font-bold text-[#0FAE96] mb-6 text-center">Scheduled Interviews</h1>
        {interviews.length === 0 ? (
          <p className="text-center text-gray-400">No interviews found.</p>
        ) : (
          <ul className="space-y-4">
            {interviews.map((interview, index) => (
              <li key={index} className="bg-[#3B1E5A] hover:bg-[#4B2E6A] transition rounded-xl p-4 shadow-md">
                <a
                  href={`/hr/interview/interviewDetails/?id=${interview.sessionId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-lg font-medium text-[#0FAE96]"
                >
                  {interview.role}
                </a>
                <p className="text-sm text-gray-300">{interview.email} • {interview.role}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default CheckInterviews;
