"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Mainpage() {
  const router = useRouter();

  // Example access check - implement your own auth logic
//   useEffect(() => {
//     const userRole = localStorage.getItem("role");
//     if (userRole !== "hr" && userRole !== "recruiter") {
//       router.push("/unauthorized");
//     }
//   }, []);

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  return (
    <div className='min-h-screen bg-[#11011E] text-white p-8'>
      <h1 className='text-4xl font-bold mb-6'>Welcome HR / Recruiter</h1>
      <p className='text-lg mb-10 text-gray-300'>
        Manage your job postings, analyze resumes, and find the right candidates.
      </p>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
        <button
          onClick={() => handleNavigate("/post-job")}
          className='bg-indigo-600 hover:bg-indigo-700 px-6 py-4 rounded-xl shadow-md text-lg font-medium'
        >
          📄 Post a Job
        </button>

        <button
          onClick={() => handleNavigate("/applicants")}
          className='bg-purple-600 hover:bg-purple-700 px-6 py-4 rounded-xl shadow-md text-lg font-medium'
        >
          🧑‍💼 View Applicants
        </button>

        <button
          onClick={() => handleNavigate("/analyze-resumes")}
          className='bg-pink-600 hover:bg-pink-700 px-6 py-4 rounded-xl shadow-md text-lg font-medium'
        >
          🧠 Analyze Resumes
        </button>

        <button
          onClick={() => handleNavigate("/talent-insights")}
          className='bg-blue-600 hover:bg-blue-700 px-6 py-4 rounded-xl shadow-md text-lg font-medium'
        >
          📊 Talent Insights
        </button>
      </div>
    </div>
  );
}
