"use client";
import React, { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { useRouter } from "next/navigation";

// Define interfaces for the expected data structure
interface SkillsData {
  "Skills Compatibility Score": number;
  "Detailed Skills Compatibility Evaluation": Record<string, string>;
  "Actionable Suggestions for Improvement": Record<string, string[]>;
}

// StarRating Component
const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
  return (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${star <= rating ? 'text-[#0FAE96] fill-[#0FAE96]' : 'text-[rgba(255,255,255,0.2)]'} transition-all duration-300`}
        />
      ))}
    </div>
  );
};

// SkillsSuggestions Component
const SkillsSuggestions: React.FC<{ skillsData: SkillsData }> = ({ skillsData }) => {
    const router = useRouter();
  if (!skillsData) {
    return (
      <div className="text-gray-300 text-center ">
        Error: Skills data is missing.
      </div>
    );
  }

    const handleClick = () => {
    window.location.href = "/course/jobdescription"
  }

  return (
    <div className="min-h-screen  text-white overflow-x-hidden relative">
      {/* Futuristic Background Container */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A0015] via-[#1A0D2B] to-[#2B1A4A] opacity-90"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#7000FF] rounded-full mix-blend-overlay filter blur-3xl opacity-20"></div>
        <div className="absolute top-10 right-0 w-72 h-72 bg-[#FF00C7] rounded-full mix-blend-screen filter blur-2xl opacity-15"></div>
        <div className="absolute bottom-0 left-10 w-64 h-64 bg-[#0FAE96] rounded-full mix-blend-screen filter blur-2xl opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-[rgba(0,0,0,0.4)] to-transparent pointer-events-none [mask-image:radial-gradient(circle_at_center,transparent_20%,black_80%)]"></div>
        <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-gradient-to-r from-[rgba(112,0,255,0.1)] to-transparent rounded-full filter blur-xl opacity-30"></div>
        <div className="absolute bottom-1/4 right-1/4 w-60 h-60 bg-gradient-to-r from-[rgba(15,174,150,0.1)] to-transparent rounded-full filter blur-xl opacity-25"></div>
      </div>

      {/* Glassmorphism Overlay Container */}
      <div className="relative z-10 max-w-5xl mx-auto py-20 px-6 pt-24">
        {/* Skills Compatibility Section */}
        <div className="mb-12 bg-[rgba(255,255,255,0.05)] backdrop-blur-2xl rounded-3xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.08)] transform hover:-translate-y-2 transition-all duration-500">
          <h2 className="text-2xl font-semibold text-[#0FAE96] mb-4 flex items-center">
            <Star className="w-6 h-6 mr-2 text-[#0FAE96] glow-effect" />
            Skills Compatibility
          </h2>
          <p className="text-gray-300 mb-4">
            Enhance your resume with AI-driven skill suggestions tailored to your target role.
          </p>

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center">
              <div className="text-5xl font-bold text-white mr-4">{skillsData["Skills Compatibility Score"]}</div>
              <div className="h-2 w-32 bg-[rgba(255,255,255,0.1)] rounded-full overflow-hidden shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-[#0FAE96] to-[#7000FF] rounded-full transition-all duration-700"
                  style={{ width: `${skillsData["Skills Compatibility Score"]}%` }}
                ></div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <StarRating rating={Math.round(skillsData["Skills Compatibility Score"] / 20)} />
              <button className="px-6 py-2 bg-gradient-to-r from-[#0FAE96] to-[#7000FF] text-white font-semibold rounded-xl shadow-[0_6px_24px_rgba(15,174,150,0.6)] hover:shadow-[0_8px_32px_rgba(112,0,255,0.7)] hover:scale-105 transition-all duration-300 transform relative overflow-hidden group"
              onClick={handleClick}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.3)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-shimmer"></span>
                <span className="relative z-10 flex items-center">
                  Create Resume
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Detailed Skills Evaluation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {Object.entries(skillsData["Detailed Skills Compatibility Evaluation"] || {}).map(([key, text]:[any,any], index) => (
            <div
              key={index}
              className="bg-[rgba(255,255,255,0.06)] backdrop-blur-2xl rounded-3xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.08)] transform hover:-translate-y-2 hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)] transition-all duration-500 relative overflow-hidden"
              style={{ marginLeft: index % 2 === 0 ? '0' : '2rem' }}
            >
              {/* Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-[rgba(112,0,255,0.08)] to-transparent opacity-50 pointer-events-none"></div>

              {/* Rating in Top-Right Corner */}
              <div className="absolute top-4 right-4">
                <StarRating rating={text?.rating} />
              </div>

              <h3 className="text-xl font-semibold text-[#0FAE96] capitalize mb-2">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </h3>

              <p className="text-[rgba(255,255,255,0.9)]  text-sm leading-relaxed">
                {text?.text}
              </p>
            </div>
          ))}
        </div>


        {/* Actionable Suggestions */}
        <div className="bg-[rgba(255,255,255,0.05)] backdrop-blur-2xl rounded-3xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.08)] transition-all duration-500">
          <h3 className="text-2xl font-semibold text-[#0FAE96] mb-6 flex items-center">
            <Star className="w-6 h-6 mr-2 text-[#0FAE96] glow-effect" />
            Actionable Suggestions
          </h3>
          <div className="space-y-6">
            {Object.entries(skillsData["Actionable Suggestions for Improvement"] || {}).map(([key, items], index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-lg font-medium text-white capitalize">{key}</h4>
                  {/* <StarRating rating={3} /> */}
                </div>
                <ul className="space-y-2">
                  {items.map((item: string, i: number) => (
                    <li
                      key={i}
                      className="text-[rgba(255,255,255,0.85)]  text-sm pl-4 relative flex items-center before:content-['•'] before:absolute before:left-0 before:text-[#E02529] before:font-bold hover:text-[#0FAE96] transition-colors duration-200"
                    >
                      <Star className="w-3 h-3 mr-2 text-[#0FAE96] opacity-50" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <button className="mt-8 px-6 py-3 bg-[#0FAE96] text-white font-semibold rounded-xl shadow-[0_4px_20px_rgba(15,174,150,0.5)] hover:bg-[#0E8C77] hover:scale-105 hover:shadow-[0_6px_30px_rgba(15,174,150,0.7)] transition-all duration-300 transform relative overflow-hidden" onClick={handleClick}>
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.2)] to-transparent animate-shimmer"></span>
            Build Skills
          </button>
        </div>
      </div>
    </div>
  );
};

// SkillsSuggestionsWrapper Component
const SkillsSuggestionsWrapper = () => {
  const [skillsData, setSkillsData] = useState<SkillsData | null>(null);

  useEffect(() => {
    const storedSkillData = localStorage.getItem("skill");
    if (storedSkillData) {
      setSkillsData(JSON.parse(storedSkillData));
    }
  }, []);

  if (!skillsData) {
    return (
      <div className="min-h-screen  text-white bg-gradient-to-br from-[#0A0015] via-[#1A0D2B] to-[#2B1A4A] flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-300">Loading Skills Data...</p>
        </div>
      </div>
    );
  }

  return <SkillsSuggestions skillsData={skillsData} />;
};

export default SkillsSuggestionsWrapper;