"use client"

import React from "react";
import { useRouter } from "next/navigation";

export default function ListView () {
  const router = useRouter();

  return (
    <div className="p-6 bg-gradient-to-b from-[#11011E] via-[#35013e] to-[#11011E] min-h-screen">
      <div className="max-w-4xl mx-auto bg-[#ffffff0f] border border-[#ffffff17] rounded-lg shadow-lg">
        {/* Create new resume item */}
        <div className="border-b border-[#ffffff17] p-4 hover:bg-[#ffffff1a] transition-colors duration-200">
          <div 
            onClick={() => router.push("/Resume")}
            className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-16 bg-[#11011ea3] flex items-center justify-center rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Create New Resume</h3>
                <p className="text-sm text-gray-300">Start fresh with a new resume template</p>
              </div>
            </div>
            <div className="text-gray-300 hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Import existing resume item */}
        <div className="p-4 hover:bg-[#ffffff1a] transition-colors duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <label className="w-12 h-16 bg-[#11011ea3] flex items-center justify-center rounded-lg cursor-pointer hover:bg-[#11011e] transition-colors">
                <input 
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      console.log("Imported file:", e.target.files[0]);
                    }
                  }}
                />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </label>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Import Existing Resume</h3>
                <p className="text-sm text-gray-300">Upload your existing resume file</p>
              </div>
            </div>
            <div className="text-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

