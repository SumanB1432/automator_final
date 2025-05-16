/** @format */
"use client";
import Image from "next/image";
import { motion } from "framer-motion";

const TestimonialSection = () => {
  const testimonials = [
    {
      name: "Vikram Desai",
      role: "HR Director",
      feedback:
        "Our time-to-shortlist dropped from five days to four hours.",
      image: "/images/team1.jpg",
    },
    {
      name: "Godchoice Bright",
      role: "Human Resources Manager",
      feedback:
        "Resume sorting used to take half my day. Now it’s done Automatically.",
      image: "/images/team2.jpg",
    },
    {
      name: "David N.",
      role: "Job Seeker",
      feedback:
        "We missed great candidates because of slow outreach. Now every lead gets a personalized email within seconds",
      image: "/images/team3.jpg",
    },
    {
      name: "Mark Thompson",
      role: "Software Engineer",
      feedback:
        "JobForm Automator helped us fill a high-priority role in 48 hours",
      image: "/images/team1.jpg",
    },
  ];

  return (
    <div className="py-12 lg:py-16 bg-[#11011E]">
      {/* Responsive horizontal padding */}
      <div className="max-w-[1440px] mx-auto text-center px-4 sm:px-8 md:px-12 lg:px-[90px]">
        <h2 className="font-raleway font-bold text-2xl sm:text-3xl text-[#ECF1F0]">
        Trusted by Hiring Teams Everywhere
        </h2>
        <p className="mt-4 font-roboto text-sm sm:text-lg text-[#B6B6B6]">
        See how we're eliminating manual work, speeding up shortlisting, and helping HR teams hire the right talent—faster and smarter.
        </p>
        {/* Responsive grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mt-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              className="bg-[rgba(255,255,255,0.02)] border border-[#ffffff17] p-4 sm:p-6 rounded-[18px]"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.6 }}
            >
              {/* Stack content vertically on mobile, horizontally on larger screens */}
              <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                <div className="flex-shrink-0">
                  <Image
                    src={testimonial.image}
                    alt={`${testimonial.name}'s picture`}
                    width={64}
                    height={64}
                    className="rounded-full border border-[#FFFFFF]"
                  />
                </div>
                <div>
                  <h3 className="font-raleway font-semibold text-lg text-[#ECF1F0]">
                    {testimonial.name}
                  </h3>
                  <p className="mt-1 font-roboto text-sm text-[#B6B6B6]">
                    {testimonial.role}
                  </p>
                </div>
              </div>
              <p className="mt-4 font-roboto text-sm text-[#B6B6B6]">
                {testimonial.feedback}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TestimonialSection;
