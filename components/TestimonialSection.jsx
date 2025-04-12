/** @format */
"use client";
import Image from "next/image";
import { motion } from "framer-motion"; // Import motion

const TestimonialSection = () => {
  const testimonials = [
    {
      name: "Arun Kumar",
      role: "Software Testing Engineer",
      feedback:
        '"The Job From Automator is a very useful extension tool for filling the job application, offering significant time savings in the India Job Market"',
      image: "/images/avatar.png", // Replace with actual image path
    },
  ];

  return (
    <div className="py-12 lg:py-16 bg-[#11011E]">
      <div className="max-w-[1440px] mx-auto text-center px-[90px]">
        <h2 className="font-raleway font-bold text-2xl sm:text-3xl text-[#ECF1F0]">
          Trusted by Job Seekers Everywhere
        </h2>
        <p className="mt-4 font-roboto text-sm sm:text-lg text-[#B6B6B6]">
          See how we&apos;re streamlining the job search process and saving time for users like you.
        </p>
        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          {Array(4)
            .fill(testimonials[0])
            .map((testimonial, index) => (
              <motion.div
                key={index}
                className="bg-[rgba(255,255,255,0.02)] border border-[#ffffff17] p-6 rounded-[18px]"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.6 }}
              >
                <div className="flex items-center gap-4 text-left">
                  <div className="flex-shrink-0">
                    <Image
                      src={testimonial.image}
                      alt={`${testimonial.name}'s picture`}
                      width={64}
                      height={64}
                      className="rounded-full border border-[#FFFFFF]"
                    />
                  </div>
                  <div className="text-left">
                    <h3 className="font-raleway font-semibold text-lg text-[#ECF1F0]">
                      {testimonial.name}
                    </h3>
                    <p className="mt-1 font-roboto text-sm text-[#B6B6B6]">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
                <p className="mt-4 font-roboto text-sm text-[#B6B6B6] text-left">
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
