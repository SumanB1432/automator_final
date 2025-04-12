"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";

const FeaturesSection = () => {
  const features = [
    {
      icon: "/images/Bag.png",
      title: "Apply Without the Burnout",
      description:
        "No more repetitive typing. Upload your resume once, and we handle the rest.",
    },
    {
      icon: "/images/globle.png",
      title: "Stand Out. Get Picked",
      description:
        "Build an ATS-optimized resume that passes filters. Send personalized AI emails to recruiters.",
    },
    {
      icon: "/images/bolt.png",
      title: "Know What You’re Missing",
      description:
        "Our Skill Engine scans real job listings and tells you exactly which skills you need—and where to learn them for free.",
    },
    {
      icon: "/images/shield.png",
      title: "Secure & Private",
      description:
        "Your personal information is encrypted and never shared—ensuring complete privacy.",
    },
  ];

  // Create refs for each feature card for animation
  const sectionRef = useRef(null);
  const [animatedCards, setAnimatedCards] = useState([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          // Stagger the animations when section comes into view
          const timer = setTimeout(() => {
            setAnimatedCards(features.map((_, i) => i));
          }, 100);
          return () => clearTimeout(timer);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, [features.length]);

  return (
    <section 
      ref={sectionRef}
      className="bg-[#11011E] text-white py-12 md:py-20 px-4 overflow-hidden"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Label - centered on mobile */}
        <div className="flex justify-center">
          <div className="flex items-center space-x-3 px-4 py-2 bg-[rgba(255,255,255,0.05)] border border-[#FFFFFF0D] rounded-full">
            <div className="w-2.5 h-2.5 bg-[#0FAE96] rounded-full"></div>
            <div className="text-sm text-[#0FAE96] font-medium">Features</div>
          </div>
        </div>

        {/* Section Header - responsive text sizes */}
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-[#ECF1F0] text-center mt-6 max-w-3xl mx-auto leading-tight">
        The Future Doesn’t Wait. Neither Do You
        </h2>

        {/* Section Subheading - improved readability */}
        <p className="mt-4 text-base md:text-lg text-[#B6B6B6] text-center max-w-2xl mx-auto">
        The job you want isn’t waiting. Neither should you.
        </p>

        {/* Features Grid - better responsive layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mt-12">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`bg-[rgba(255,255,255,0.02)] border border-[#ffffff17] backdrop-blur-xl rounded-2xl p-6 transition-all duration-500 ease-out transform ${
                animatedCards.includes(index)
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              } hover:bg-[rgba(255,255,255,0.05)] hover:border-[#ffffff30] hover:shadow-lg hover:-translate-y-1`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              {/* Icon - better positioning */}
              <div className="flex justify-center mb-6">
                <div className="flex justify-center items-center w-16 h-16 bg-[#2C223B] rounded-full shadow-md">
                  <Image
                    src={feature.icon}
                    alt={`${feature.title} Icon`}
                    width={32}
                    height={32}
                    className="transform transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
              </div>
              
              {/* Title - improved typography */}
              <h3 className="text-lg md:text-xl font-semibold text-[#ECF1F0] text-center mb-3">
                {feature.title}
              </h3>
              
              {/* Description - better readability */}
              <p className="text-sm md:text-base text-[#B6B6B6] text-center leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;