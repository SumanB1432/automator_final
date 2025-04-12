"use client"
import React from "react";
import { useRouter } from "next/navigation";
export default function GridView () {
  const router = useRouter();

  return (
    <div className=" flex p-6 h-[100vh] gap-10 bg-gradient-to-b pt-5 from-[#11011E] via-[#35013e] to-[#11011E] bg-[#11011E] text-white">
      {/* Create new resume card */}
      <div 
        onClick={() => router.push("/create-new-resume")}
        className="bg-[#ffffff0f] border-[#ffffff17] w-[25%] h-[60%] border-[1.5px] rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-200 cursor-pointer">
        <div className="aspect-w-8 aspect-h-11 bg-[#11011ea3] mb-4 py-20 px-10  rounded-lg">
          <div className="w-full h-full flex flex-col items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          
          </div>
        </div>
        <h3 className="text-lg font-semibold ">Create New Resume</h3>
        <p className="text-sm  mt-1">Create a new resume from scratch</p>
      </div>

      {/* Import existing resume card */}
      <div 
        className="bg-[#ffffff0f] border-[#ffffff17] border-[1.5px] w-[25%] h-[60%] rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-200 cursor-pointer">
        <div className="aspect-w-8 aspect-h-11 bg-[#11011E] mb-4 py-20 px-10 rounded-lg">
          <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
            <input 
              type="file" 
              accept=".pdf,.doc,.docx" 
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  // Handle file import logic here
                  console.log("Imported file:", e.target.files[0]);
                }
              }}
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 " fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          
          </label>
        </div>
        <h3 className="text-lg font-semibold ">Import Existing Resume</h3>
        <p className="text-sm  mt-1">Upload an existing resume</p>
      </div>
    </div>
  );
};

