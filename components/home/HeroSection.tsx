/** @format */
"use client";
// Removed import Image from "next/image"; as 'next/image' is not available in this environment.
import React, { useState, useEffect } from "react";
import AiSuccessPath from "@/components/home/Aisuccesspath"; // Assuming this component handles its own responsiveness


// Assuming AiSuccessPath is a responsive component or its content adapts to container size
// import AiSuccessPath from "@/components/AiSuccessPath"; // This import path is external, assuming it's handled by the user's setup.
// Removed Firebase imports as they are commented out and not used in the render logic.
// import { get, ref, getDatabase, update, set } from "firebase/database";
// import { app, auth } from "@/firebase/config";
// const db = getDatabase(app);

function HeroSection() {
  // const [uid,setUid] = useState("");
  // useEffect(()=>{
  //   let uid = auth?.currentUser?.uid;
  //   if(uid){
  //     setUid(uid)
  //   }
  // },[])
  // useEffect(()=>{
  //   let subRef = (db,`user/${uid}`)
  // })
  return (
    <div className="relative bg-[#11011E] pt-4 px-4 sm:px-6 md:px-8 overflow-hidden font-inter">
      {/* Blurred Accent Elements */}
      <div className="absolute top-0 left-0 w-1/2 max-w-[200px] h-[200px] bg-[#90e6d959] opacity-40 blur-[80px] sm:blur-[100px] md:blur-[120px]"></div>
      <div className="absolute top-0 right-0 w-1/2 max-w-[200px] h-[200px] bg-[#90e6d959] opacity-40 blur-[80px] sm:blur-[100px] md:blur-[120px]"></div>

      {/* Main Flex Row */}
      <div className="flex flex-col lg:flex-row items-start gap-8 justify-between max-w-7xl mx-auto relative z-10 py-8">
        {/* LEFT SIDE */}
        <div className="w-full pt-6 lg:w-1/2 text-left space-y-6">
          {/* Star Rating */}
          <div className="flex justify-start items-center mb-4">
            <span className="flex items-center bg-[#FFFFFF05] border border-[#ffffff17] px-3 py-1 rounded-full">
              {Array(5)
                .fill(null)
                .map((_, index) => (
                  // Replaced Next.js Image component with standard <img> tag
                  <img
                    key={index}
                    src="/images/star.png" // Placeholder for star image
                    alt="Star"
                    className="w-3 h-3 mr-1"
                    onError={(e) => {
                      e.currentTarget.src = "https://placehold.co/12x12/B6B6B6/000000?text=X"; // Fallback
                    }}
                  />
                ))}
              <span className="font-roboto text-[#B6B6B6] text-xs sm:text-sm ml-1">
                5 star rated
              </span>
            </span>
          </div>

          {/* Main Heading */}
          <div className="flex flex-col items-start justify-center gap-6 w-full text-left">
            {/* Removed whitespace-nowrap from h1 */}
            <h1 className="font-raleway font-bold text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight mb-2">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#0FAE96] to-cyan-400">
                World’s{" "}
              </span>
              most advanced <span></span>
              {/* Removed whitespace-nowrap and <br className="sm:hidden" /> from this span */}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#0FAE96] to-cyan-400">
                AI Career System.
              </span>🚀
            </h1>

            {/* Features List */}
            <ul className="space-y-4 text-base sm:text-lg md:text-xl font-bold font-roboto mb-2">
              <li className="flex items-center gap-3 text-[#B6B6B6]">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded">
                  {/* SVG for Apply faster icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="#ffffff"><path d="M18.4 445c11.2 5.3 24.5 3.6 34.1-4.4L224 297.7 224 416c0 12.4 7.2 23.7 18.4 29s24.5 3.6 34.1-4.4L448 297.7 448 416c0 17.7 14.3 32 32 32s32-14.3 32-32l0-320c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 118.3L276.5 71.4c-9.5-7.9-22.8-9.7-34.1-4.4S224 83.6 224 96l0 118.3L52.5 71.4c-9.5-7.9-22.8-9.7-34.1-4.4S0 83.6 0 96L0 416c0 12.4 7.2 23.7 18.4 29z"/></svg>
                             </span>
                Apply faster
              </li>
              <li className="flex items-center gap-3 text-[#B6B6B6]">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded ">
                  {/* SVG for Get more interviews icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" fill="#ffffff"><path d="M72 88a56 56 0 1 1 112 0A56 56 0 1 1 72 88zM64 245.7C54 256.9 48 271.8 48 288s6 31.1 16 42.3l0-84.7zm144.4-49.3C178.7 222.7 160 261.2 160 304c0 34.3 12 65.8 32 90.5l0 21.5c0 17.7-14.3 32-32 32l-64 0c-17.7 0-32-14.3-32-32l0-26.8C26.2 371.2 0 332.7 0 288c0-61.9 50.1-112 112-112l32 0c24 0 46.2 7.5 64.4 20.3zM448 416l0-21.5c20-24.7 32-56.2 32-90.5c0-42.8-18.7-81.3-48.4-107.7C449.8 183.5 472 176 496 176l32 0c61.9 0 112 50.1 112 112c0 44.7-26.2 83.2-64 101.2l0 26.8c0 17.7-14.3 32-32 32l-64 0c-17.7 0-32-14.3-32-32zm8-328a56 56 0 1 1 112 0A56 56 0 1 1 456 88zM576 245.7l0 84.7c10-11.3 16-26.1 16-42.3s-6-31.1-16-42.3zM320 32a64 64 0 1 1 0 128 64 64 0 1 1 0-128zM240 304c0 16.2 6 31 16 42.3l0-84.7c-10 11.3-16 26.1-16 42.3zm144-42.3l0 84.7c10-11.3 16-26.1 16-42.3s-6-31.1-16-42.3zM448 304c0 44.7-26.2 83.2-64 101.2l0 42.8c0 17.7-14.3 32-32 32l-64 0c-17.7 0-32-14.3-32-32l0-42.8c-37.8-18-64-56.5-64-101.2c0-61.9 50.1-112 112-112l32 0c61.9 0 112 50.1 112 112z"/></svg>
                 </span>
                Get more interviews
              </li>
              <li className="flex items-center gap-3 text-[#B6B6B6]">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded">
                  {/* SVG for Grow skills icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="#ffffff"><path d="M64 64c0-17.7-14.3-32-32-32S0 46.3 0 64L0 400c0 44.2 35.8 80 80 80l400 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L80 416c-8.8 0-16-7.2-16-16L64 64zm406.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L320 210.7l-57.4-57.4c-12.5-12.5-32.8-12.5-45.3 0l-112 112c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L240 221.3l57.4 57.4c12.5 12.5 32.8 12.5 45.3 0l128-128z"/></svg>    

                </span>
                Grow skills
              </li>
            </ul>

            {/* CTA Button */}
            <a
              href="https://chromewebstore.google.com/detail/jobform-automator-ai-auto/lknamgjmcmbfhcjjeicdndokedcmpbaa"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 sm:mt-6 inline-block bg-[#0FAE96] text-white font-roboto font-bold text-base px-8 py-3 rounded-full transition-transform duration-300 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0FAE96] min-h-[40px] text-center"
              style={{
                transition: "box-shadow 0.3s cubic-bezier(.4,0,.2,1), transform 0.3s cubic-bezier(.4,0,.2,1)"
              }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 0 32px 0 #0FAE9655")}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}
            >
              Get started - Try it for free
            </a>

            {/* Trust Avatars & Text */}
            <div className="flex items-center gap-2 mt-4">
              <div className="flex -space-x-3">
                {/* Replaced Image components with standard <img> tags */}
                <img src="/images/Img1.png" alt="User avatar" className="w-8 h-8 rounded-full border-2 border-[#11011E]" onError={(e) => { e.currentTarget.src = "https://placehold.co/32x32/B6B6B6/000000?text=X"; }} />
                <img src="/images/Img2.png" alt="User avatar" className="w-8 h-8 rounded-full border-2 border-[#11011E]" onError={(e) => { e.currentTarget.src = "https://placehold.co/32x32/B6B6B6/000000?text=X"; }} />
                <img src="/images/Img3.png" alt="User avatar" className="w-8 h-8 rounded-full border-2 border-[#11011E]" onError={(e) => { e.currentTarget.src = "https://placehold.co/32x32/B6B6B6/000000?text=X"; }} />
                <img src="/images/Img4.png" alt="User avatar" className="w-8 h-8 rounded-full border-2 border-[#11011E]" onError={(e) => { e.currentTarget.src = "https://placehold.co/32x32/B6B6B6/000000?text=X"; }} />
              </div>
              <span className="text-[#B6B6B6] text-sm font-roboto ml-2">
                <span className="text-white font-bold">450+</span> JobSeekers using JobForm Automator.
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}

                      <AiSuccessPath />
        {/* END RIGHT SIDE */}
      </div>
    </div>
  );
}

export default HeroSection;
