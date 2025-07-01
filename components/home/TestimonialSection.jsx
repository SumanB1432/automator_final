/** @format */
"use client";
import Image from "next/image";
import { motion } from "framer-motion";

const TestimonialSection = () => {
  const testimonials = [
    {
      name: "Arun Kumar",
      role: "React JS Consultant",
      feedback:
        "JobForm Automator streamlined my application process, saving me countless hours. Thanks to it, I secured a position at <span style=\"font-size: 1.2em; color: #1e90ff;\">Infosys</span> and couldn't be happier!",
      image: "/images/team1.png",
    },
    {
      name: "Godchoice Bright",
      role: "Full Stack Engineer",
      feedback:
        "This tool transformed my job search, making it efficient and stress-free. I landed my dream role at <span style=\"font-size: 1.2em; color: #1e90ff;\">Uplers</span>, and I highly recommend JobForm Automator!",
      image: "/images/team2.png",
    },
    {
      name: "Emma",
      role: "Sales And Marketing Specialist",
      feedback:
        "JobForm Automator helped me stand out and land interviews at top companies. I’m now proudly working at <span style=\"font-size: 1.2em; color: #1e90ff;\">PolicyStacker</span>, and this tool made all the difference!",
      image: "/images/team3.png",
    },
    {
      name: "Isah Muhammed",
      role: "Software Engineer- Nodejs",
      feedback:
        "Using JobForm Automator was a game-changer! It simplified my applications and helped me secure a role at <span style=\"font-size: 1.2em; color: #1e90ff;\">Paytm</span>. Highly recommend it to every job seeker!",
      image: "/images/team4.png",
    },
    
  ];

  return (
    <div className="py-12 lg:py-16 bg-[#11011E]">
      {/* Responsive horizontal padding */}
      <div className="max-w-[1440px] mx-auto text-center px-4 sm:px-8 md:px-12 lg:px-[90px]">
        <h2 className="font-raleway font-bold text-2xl sm:text-3xl text-[#ECF1F0]">
          Trusted by Job Seekers Everywhere
        </h2>
        <p className="mt-4 font-roboto text-sm sm:text-lg text-[#B6B6B6]">
          See how we're streamlining the job search process and saving time for users like you.
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
              <p
                className="mt-4 font-roboto text-sm text-[#B6B6B6]"
                dangerouslySetInnerHTML={{ __html: testimonial.feedback }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TestimonialSection;