/** @format */
"use client";

import React from "react";
import HRAiSuccessPath from "@/components/hr/HRAisuccesspath"; // Assuming this component handles its own responsiveness
// Removed import Image from "next/image"; as 'next/image' is not available in this environment.
// import AiSuccessPath from "@/components/AiSuccessPath"; // This import path is external, assuming it's handled by the user's setup.

const HRHeroSection = () => {
  return (
    // Main container with dark background and responsive padding
    <div className="relative bg-[#11011E] pt-4 px-4 sm:px-6 md:px-8 overflow-hidden font-inter">
      {/* Decorative blurred elements for accent */}
      <div className="absolute top-0 left-0 w-1/2 max-w-[200px] h-[200px] bg-[#90e6d959] opacity-40 blur-[80px] sm:blur-[100px] md:blur-[120px]"></div>
      <div className="absolute top-0 right-0 w-1/2 max-w-[200px] h-[200px] bg-[#90e6d959] opacity-40 blur-[80px] sm:blur-[100px] md:blur-[120px]"></div>

      {/* Flex container for the two main columns */}
      <div className="flex flex-col lg:flex-row items-start gap-8 justify-between max-w-7xl mx-auto relative z-10 py-8">

        {/* LEFT SIDE: Text content, CTA, and trust signals */}
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
                    className="w-3.5 h-3.5 mr-1" // Slightly increased size for better visibility

                  />
                ))}
              <span className="font-roboto text-[#B6B6B6] text-xs sm:text-sm ml-1">
                Loved by busy HR teams worldwide
              </span>
            </span>
          </div>

          {/* Main Heading */}
          <div className="flex flex-col items-start justify-center gap-6 w-full text-left">
            {/* Removed whitespace-nowrap from h1 and inner span for responsive text wrapping */}
            <h1 className="font-raleway font-bold text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight mb-2">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#0FAE96] to-cyan-400">
                World’s{" "}
              </span>
              most advanced <span></span>
              {/* Removed <br /> as text will now wrap naturally */}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#0FAE96] to-cyan-400">
                AI Hiring System.
              </span>🚀
            </h1>

            {/* Feature List with updated icons */}
            <ul className="space-y-4 text-base sm:text-lg md:text-xl font-bold font-roboto mb-2">
              <li className="flex items-center gap-3 text-[#B6B6B6]">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded">
                  {/* SVG for Save hours icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="#ffffff" ><path d="M176 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l16 0 0 34.4C92.3 113.8 16 200 16 304c0 114.9 93.1 208 208 208s208-93.1 208-208c0-41.8-12.3-80.7-33.5-113.2l24.1-24.1c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L355.7 143c-28.1-23-62.2-38.8-99.7-44.6L256 64l16 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L224 0 176 0zm72 192l0 128c0 13.3-10.7 24-24 24s-24-10.7-24-24l0-128c0-13.3 10.7-24 24-24s24 10.7 24 24z" /></svg>
                </span>
                Save hours.
              </li>
              <li className="flex items-center gap-3 text-[#B6B6B6]">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded ">
                  {/* SVG for Find top talent icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="#ffffff"><path d="M184 0c30.9 0 56 25.1 56 56l0 400c0 30.9-25.1 56-56 56c-28.9 0-52.7-21.9-55.7-50.1c-5.2 1.4-10.7 2.1-16.3 2.1c-35.3 0-64-28.7-64-64c0-7.4 1.3-14.6 3.6-21.2C21.4 367.4 0 338.2 0 304c0-31.9 18.7-59.5 45.8-72.3C37.1 220.8 32 207 32 192c0-30.7 21.6-56.3 50.4-62.6C80.8 123.9 80 118 80 112c0-29.9 20.6-55.1 48.3-62.1C131.3 21.9 155.1 0 184 0zM328 0c28.9 0 52.6 21.9 55.7 49.9c27.8 7 48.3 32.1 48.3 62.1c0 6-.8 11.9-2.4 17.4c28.8 6.2 50.4 31.9 50.4 62.6c0 15-5.1 28.8-13.8 39.7C493.3 244.5 512 272.1 512 304c0 34.2-21.4 63.4-51.6 74.8c2.3 6.6 3.6 13.8 3.6 21.2c0 35.3-28.7 64-64 64c-5.6 0-11.1-.7-16.3-2.1c-3 28.2-26.8 50.1-55.7 50.1c-30.9 0-56-25.1-56-56l0-400c0-30.9 25.1-56 56-56z"/></svg>  
                </span>
                Find top talent
              </li>
              <li className="flex items-center gap-3 text-[#B6B6B6]">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded">
                  {/* SVG for Hire Faster icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="#ffffff">
                    <path fill="#ffffff" d="M184 48l144 0c4.4 0 8 3.6 8 8l0 40L176 96l0-40c0-4.4 3.6-8 8-8zm-56 8l0 40L64 96C28.7 96 0 124.7 0 160l0 96 192 0 128 0 192 0 0-96c0-35.3-28.7-64-64-64l-64 0 0-40c0-30.9-25.1-56-56-56L184 0c-30.9 0-56 25.1-56 56zM512 288l-192 0 0 32c0 17.7-14.3 32-32 32l-64 0c-17.7 0-32-14.3-32-32l0-32L0 288 0 416c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-128z" />
                  </svg>
                </span>
                Hire Faster.
              </li>
            </ul>

            {/* CTA Button */}
            <a
              href="https://chromewebstore.google.com/detail/jobform-automator-ai-hiri/odejagafiodlccfjnfcnhgpeggmbapnk"
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
                <span className="text-white font-bold">350+</span> Recruiters
                already accelerating hiring.
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: AI Success Path Visualization */}
        {/* The AiSuccessPath component will render the diagram */}
              <HRAiSuccessPath /> {/* Assuming this component handles its own responsiveness */}
        {/* END RIGHT SIDE */}

      </div>
    </div>
  );
};

export default HRHeroSection;
