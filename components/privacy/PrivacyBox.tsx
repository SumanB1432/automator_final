import React from "react";
import Image from "next/image";

const PrivacyBox = () => {
  return (
    <div className="relative bg-gradient-to-b from-[#11011E] via-[#35013e] to-[#11011E] text-white py-10 px-4">
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 mx-6 sm:mx-12 lg:mx-20 max-w-8xl rounded-xl bg-[#FFFFFF05] px-6 sm:px-10 py-10 sm:py-16 border border-[#ffffff17] shadow-lg transition-transform duration-500 hover:scale-105">
        {/* Text Section */}
        <div className="text-center md:text-left max-w-lg">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
            Your Privacy Matters to Us
          </h1>
          <p className="text-base sm:text-lg font-normal text-[#EAEAEA] leading-relaxed">
            Discover how we protect your personal information and ensure a secure experience while using our services.
          </p>
        </div>

        {/* Illustration Section */}
        <div className="relative flex-shrink-0">
          <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-56 md:h-56 relative z-10">
            <Image
              src="/images/shield-icon.png" // Replace with your image
              alt="Privacy Shield"
              fill
              className="object-contain"
              priority
            />
          </div>

          {/* Background Design */}
          <div className="absolute inset-0 z-0 bg-gradient-to-r from-blue-500 to-purple-600 opacity-30 rounded-full blur-xl"></div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyBox;
