/** @format */
"use client";
import { useState } from "react";
import { motion } from "framer-motion"; // For smooth animations

const FAQSection = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setActiveIndex(index === activeIndex ? null : index);
  };

  const faqs = [
    {
      question: "How does Jobform Automator work?",
      answer:
        "Jobform Automator uses AI to instantly apply to jobs, optimize your resume, and reach recruiters—so you can get hired faster with less effort.",
    },
    {
      question: "Can I customize the information that gets filled in?",
      answer:
        "Yes, you can customize the information inside settings page in the Automator Site.",
    },
    {
      question: "Is there a cost to use Jobform Automator?",
      answer:
        "There are both free and premium plans available depending on your needs.",
    },
    {
      question:
        "When can I expect to get hired using Jobform Automator?",
      answer:
        "The timeline depends on the job market and the positions you're applying for, but the tool significantly streamlines your application process.",
    },
  ];

  return (
    <section className="py-16 px-6 md:px-16 lg:px-20 text-white bg-[#11011E]">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-2xl sm:text-3xl font-raleway font-semibold mb-3 text-[#ECF1F0]">
          Your questions answered
        </h2>
        <p className="text-sm sm:text-lg font-roboto text-[#B6B6B6] mb-8">
          Explore our FAQ section to learn more.
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-6">
        {faqs.map((faq, index) => (
          <motion.div
            key={index}
            className={`border-b border-[#ffffff17] transition-all duration-500 ease-in-out ${
              activeIndex === index ? "pb-6" : "pb-4"
            }`}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.6 }}
          >
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full flex justify-between items-center text-left text-base sm:text-lg font-raleway text-[#ECF1F0] hover:text-[#0FAE96] transition-colors duration-500 ease-in-out"
            >
              {faq.question}
              <span
                className={`ml-2 transform transition-transform duration-500 ease-in-out text-base sm:text-lg font-raleway text-[#0FAE96] ${
                  activeIndex === index ? "rotate-180" : "rotate-0"
                }`}
              >
                {activeIndex === index ? "−" : "+"}
              </span>
            </button>
            <div
              className={`overflow-hidden transition-all duration-500 ease-in-out ${
                activeIndex === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              {activeIndex === index && (
                <p className="mt-4 font-roboto text-xs sm:text-sm text-[#B6B6B6]">
                  {faq.answer}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default FAQSection;
