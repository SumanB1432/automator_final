/** @format */
"use client";

import Image from "next/image";

const JobSeeker = () => {
  const handleClick = function () {
    try {
      window.location.href = "hr/referral";
    } catch (error) {
      console.error("Error :", error);
    }
  };

  return (
    <section
      className="relative m-4 md:m-8 lg:m-12 py-12 md:py-16 px-4 md:px-12 lg:px-16 text-white border-[1.5px] border-[#ffffff17] rounded-2xl overflow-hidden shadow-xl min-h-[40vh] bg-[#11011E]"
    >
      {/* Background */}
      <div className="absolute inset-0">
        <Image
          className="absolute inset-0 object-cover object-center"
          src="/images/JobSeeker.png"
          alt="Background"
          fill
          priority
        />
        {/* Reduced overlay opacity from /70 to /30 to make the image more visible */}
        <div className="absolute inset-0 bg-[#11011E]/30"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-2xl mx-auto text-center flex flex-col items-center justify-center min-h-[40vh]">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
        Enjoy our premium benefits for free.
        </h1>

        <p className="text-sm md:text-base lg:text-lg text-gray-200 mb-6 max-w-xl px-4">
        Refer your friends or share on LinkedIn to unlock premium rewards instantly.
        </p>

        <div>
          <button
            className="group relative px-4 md:px-6 lg:px-8 py-2 md:py-3 bg-[#0FAE96] text-white font-semibold rounded-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105"
            onClick={handleClick}
          >
            <span className="relative z-10">Get Started</span>
            <div className="absolute inset-0 bg-emerald-500 opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
          </button>
        </div>
      </div>

      {/* Decorative Line */}
      <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-[#0FAE96]/70 to-transparent"></div>
    </section>
  );
};

export default JobSeeker;
