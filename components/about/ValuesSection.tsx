/** @format */
"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";

const ValuesSection = () => {
  const values = [
    {
      icon: "/images/clock.png",
      title: "Efficiency",
      description:
        "We prioritize time-saving automation to help users apply for jobs quickly and effortlessly, allowing them to focus on what truly matters.",
    },
    {
      icon: "/images/brain.png",
      title: "Innovation",
      description:
        "We constantly push the boundaries of AI technology to enhance our platform, ensuring it remains at the forefront of job application automation.",
    },
    {
      icon: "/images/userIcon.png",
      title: "User-Centricity",
      description:
        "Our users are at the heart of everything we do. We design our tool to be intuitive, reliable, and tailored to meet the diverse needs of job seekers worldwide.",
    },
    {
      icon: "/images/privacy.png",
      title: "Integrity",
      description:
        "We are committed to maintaining transparency, trust, and ethical practices in all our operations, ensuring that our users can rely on us for a fair and honest experience.",
    },
  ];

  const valueRefs = useRef([]);
  const [isInView, setIsInView] = useState([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = valueRefs.current.findIndex((card) => card === entry.target);
          if (index !== -1 && entry.isIntersecting) {
            setIsInView((prev) => {
              const newInView = [...prev];
              newInView[index] = true;
              return newInView;
            });
          }
        });
      },
      { threshold: 0.2 }
    );

    valueRefs.current.forEach((card) => card && observer.observe(card));

    return () => {
      valueRefs.current.forEach((card) => card && observer.unobserve(card));
    };
  }, []);

  return (
    <section className="py-12 px-4 sm:px-6 md:px-10 lg:px-20 bg-[#11011E] text-white overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-center text-2xl sm:text-3xl md:text-4xl font-bold mb-10 sm:mb-12">
          Our Values
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {values.map((value, index) => (
            <div
              key={index}
              ref={(el) => (valueRefs.current[index] = el)}
              className={`bg-[#1A1125] border border-[#ffffff17] backdrop-blur-lg p-5 sm:p-6 md:p-8 rounded-2xl shadow-md transition-all duration-700 ease-out transform hover:-translate-y-1 hover:shadow-xl ${
                isInView[index] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 flex justify-center items-center bg-[#2C223B] rounded-full mb-4 sm:mb-6 mx-auto">
                <Image
                  src={value.icon}
                  alt={value.title}
                  width={32}
                  height={32}
                  className="w-8 h-8"
                  priority
                />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-center">
                {value.title}
              </h3>
              <p className="text-sm sm:text-base text-gray-300 text-center leading-relaxed">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ValuesSection;