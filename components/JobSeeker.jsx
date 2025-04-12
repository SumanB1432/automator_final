/** @format */
"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

const JobSeeker = () => {
  const sectionRef = useRef(null);
  const [isInView, setIsInView] = useState(false);

  // Intersection Observer to trigger animation when section is in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsInView(entry.isIntersecting);
        });
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  const handleClick = function (){
    window.open(
      "https://chromewebstore.google.com/detail/jobform-automator-ai-auto/lknamgjmcmbfhcjjeicdndokedcmpbaa",
      "_blank"
    );
  }

  // Background animation: subtle scale and opacity transition
  const bgVariants = {
    hidden: { 
      scale: 1.02, // Slightly zoomed in
      opacity: 0.8, // Slightly faded
    },
    visible: {
      scale: 1, // Normal size
      opacity: 1, // Fully opaque
      transition: {
        duration: 2, // Slow and smooth
        ease: "easeInOut", // Natural easing
      },
    },
  };

  // Content animation: gentle fade-in and slight slide-up
  const containerVariants = {
    hidden: { opacity: 0, y: 10 }, // Start slightly below and invisible
    visible: {
      opacity: 1, // Fade in
      y: 0, // Move to original position
      transition: {
        duration: 1.5, // Smooth duration
        ease: "easeInOut", // Natural flow
        staggerChildren: 0.2, // Slight delay between children
        delay: 0.5, // Initial delay for natural entry
      },
    },
  };

  // Child elements animation: consistent with container
  const childVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 1, // Slightly faster than container
        ease: "easeInOut",
      },
    },
  };

  return (
    <section
      ref={sectionRef}
      className="relative m-4 md:m-8 lg:m-12 py-12 md:py-16 px-4 md:px-12 lg:px-16 text-white border-[1.5px] border-[#ffffff17] rounded-2xl overflow-hidden shadow-xl min-h-[40vh] bg-[#11011E]"
    >
      {/* Background */}
      <motion.div 
        className="absolute inset-0"
        variants={bgVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        <Image
          className="absolute inset-0 object-cover object-center"
          src="/images/JobSeeker.png"
          alt="Background"
          fill
          priority
        />
        <div className="absolute inset-0 bg-[#11011E]/70"></div>
      </motion.div>

      {/* Content */}
      <motion.div
        className="relative z-10 max-w-2xl mx-auto text-center flex flex-col items-center justify-center min-h-[40vh]"
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        <motion.h1
          variants={childVariants}
          className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300"
        >
          We help job seekers succeed
        </motion.h1>
        
        <motion.p
          variants={childVariants}
          className="text-sm md:text-base lg:text-lg text-gray-200 mb-6 max-w-xl px-4"
        >
          "Streamline your job hunt, save time, and land more interviews effortlessly."
        </motion.p>

        <motion.div variants={childVariants}>
          <button className="group relative px-4 md:px-6 lg:px-8 py-2 md:py-3 bg-[#0FAE96] text-white font-semibold rounded-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105" onClick={handleClick}>
            <span className="relative z-10">Add To Chrome</span>
            <div className="absolute inset-0 bg-emerald-500 opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
          </button>
        </motion.div>
      </motion.div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#0FAE96]/50 to-transparent"></div>
    </section>
  );
};

export default JobSeeker;