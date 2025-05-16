"use client";
import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle, Lightbulb, Layout, FileText, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';



const ATSResumeEvaluation = () => {

  const [atsData, setAtsData] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const [skillData, setSkilllsData] = useState<any>(null)
  const router = useRouter();



  useEffect(() => {

    let storedAtsData = localStorage.getItem("atsData");
    const storedSkillData = localStorage.getItem("skill")
    if (storedSkillData) {
      setSkilllsData(JSON.parse(storedSkillData));
    }

    if (storedAtsData) {
      try {
        storedAtsData = JSON.parse(storedAtsData);
        // @ts-ignore
        setAtsData(storedAtsData);

      } catch (error) {
        console.error("Error parsing atsData from localStorage:", error);
        // Handle error appropriately, maybe set atsData to an error state or null
      } finally {
        setIsLoading(false); // Set loading to false after attempting to load data
      }
    } else {
      setIsLoading(false); // If no data in localStorage, still set loading to false
    }

  }, []);

  const handleSkills = function () {
    window.location.href = "/ats-score/ats-skill";

  }


  const canvasRef = useRef<HTMLCanvasElement>(null);
  console.log("skill Data", skillData)

  useEffect(() => {

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: { x: number; y: number; radius: number; speedX: number; speedY: number }[] = [];
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2 + 1,
        speedX: Math.random() * 0.5 - 0.25,
        speedY: Math.random() * 0.5 - 0.25,
      });
    }

    let animationFrameId: number;
    const animateParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(112, 0, 255, 0.3)';
        ctx.fill();
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
        if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;
      });
      animationFrameId = requestAnimationFrame(animateParticles);
    };
    animateParticles();

    // Cleanup to prevent multiple animation loops
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleClick = () => {
    router.push('/atsresume');
  }

  const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${star <= rating ? 'text-[#0FAE96] fill-[#0FAE96]' : 'text-[rgba(255,255,255,0.2)]'} transition-all duration-300`}
        />
      ))}
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen  text-white bg-gradient-to-br from-[#0A0015] via-[#1A0D2B] to-[#2B1A4A] flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-300">Loading ATS Data...</p>
        </div>
      </div>
    );
  }

  if (!atsData) {
    return (
      <div className="min-h-screen  text-white bg-gradient-to-br from-[#0A0015] via-[#1A0D2B] to-[#2B1A4A] flex justify-center items-center">
        <div className="text-center">
          <p className="mt-4 text-gray-300">Failed to load ATS Data.</p>
        </div>
      </div>
    );
  }


  return (

    <div className="min-h-screen  text-white overflow-x-hidden relative">
      {/* Futuristic Background Container */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Main Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A0015] via-[#1A0D2B] to-[#2B1A4A] opacity-90"></div>

        {/* Subtle Glowing Light Source - Top Left */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#7000FF] rounded-full mix-blend-overlay filter blur-3xl opacity-20"></div>

        {/* Neon Glows Near Edges */}
        <div className="absolute top-10 right-0 w-72 h-72 bg-[#FF00C7] rounded-full mix-blend-screen filter blur-2xl opacity-15"></div>
        <div className="absolute bottom-0 left-10 w-64 h-64 bg-[#0FAE96] rounded-full mix-blend-screen filter blur-2xl opacity-10"></div>

        {/* Vignette Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-[rgba(0,0,0,0.4)] to-transparent pointer-events-none [mask-image:radial-gradient(circle_at_center,transparent_20%,black_80%)]"></div>

        {/* Abstract Circular Gradients and Floating Shapes */}
        <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-gradient-to-r from-[rgba(112,0,255,0.1)] to-transparent rounded-full filter blur-xl opacity-30"></div>
        <div className="absolute bottom-1/4 right-1/4 w-60 h-60 bg-gradient-to-r from-[rgba(15,174,150,0.1)] to-transparent rounded-full filter blur-xl opacity-25"></div>
        <div className="absolute top-1/2 left-1/5 w-40 h-2 bg-[rgba(255,255,255,0.05)] rounded-full filter blur-sm opacity-20"></div>
      </div>

      {/* Particle Background */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none opacity-70 mix-blend-overlay"></canvas>

      {/* Glassmorphism Overlay Container */}
      <div className="relative z-10 max-w-5xl mx-auto py-20 px-6 pt-24">
        {/* Floating Navbar with Glassmorphism */}
        <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-20 bg-[rgba(255,255,255,0.05)] backdrop-blur-xl rounded-2xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-[rgba(255,255,255,0.08)] w-[90%] max-w-3xl flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#0FAE96] tracking-wide">ATS Resume Analyzer</h1>

          <StarRating rating={Math.round(atsData.atsScore / 20)} />
        </nav>

        {/* ATS Score Card with Glassmorphism */}
        <div className="mb-12 bg-[rgba(255,255,255,0.05)] backdrop-blur-2xl rounded-3xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.08)] transform hover:-translate-y-2 transition-all duration-500">
          <h2 className="text-2xl font-semibold text-[#0FAE96] mb-4 flex items-center">
            <CheckCircle className="w-6 h-6 mr-2 text-[#0FAE96] glow-effect" />
            ATS Score
          </h2>
          <p className="text-gray-300 mb-4">
            Improve your resume with AI-driven skill suggestions tailored for your industry.
            Enhance your chances of getting shortlisted by optimizing your ATS score.
          </p>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center">
              <div className="text-5xl font-bold text-white mr-4">{atsData.atsScore}</div>
              <div className="h-2 w-32 bg-[rgba(255,255,255,0.1)] rounded-full overflow-hidden shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-[#0FAE96] to-[#7000FF] rounded-full transition-all duration-700"
                  style={{ width: `${atsData.atsScore}%` }}
                ></div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <StarRating rating={Math.round(atsData.atsScore / 20)} />
              <button className="px-6 py-2 bg-gradient-to-r from-[#0FAE96] to-[#7000FF] text-white font-semibold rounded-xl shadow-[0_6px_24px_rgba(15,174,150,0.6)] hover:shadow-[0_8px_32px_rgba(112,0,255,0.7)] hover:scale-105 transition-all duration-300 transform relative overflow-hidden group" 
              onClick={handleClick}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.3)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-shimmer"></span>
                <span className="relative z-10 flex items-center">
                  Create Now
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="mb-12 bg-[rgba(255,255,255,0.05)] backdrop-blur-2xl rounded-3xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.08)] transform hover:-translate-y-2 transition-all duration-500">
          <h2 className="text-2xl font-semibold text-[#0FAE96] mb-4 flex items-center">
            <CheckCircle className="w-6 h-6 mr-2 text-[#0FAE96] glow-effect" />
            Skills Suggestions
          </h2>
          <p className="text-gray-300 mb-4">
            Improve your resume with AI-driven skill suggestions tailored for your industry.
            Enhance your chances of getting shortlisted by optimizing your ATS score.
          </p>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center">
              <div className="text-5xl font-bold text-white mr-4">{skillData["Skills Compatibility Score"]}</div>
              <div className="h-2 w-32 bg-[rgba(255,255,255,0.1)] rounded-full overflow-hidden shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-[#0FAE96] to-[#7000FF] rounded-full transition-all duration-700"
                  style={{ width: `${skillData["Skills Compatibility Score"]}%` }}
                ></div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <StarRating rating={Math.round(skillData["Skills Compatibility Score"] / 20)} />
              <button className="px-6 py-2 bg-gradient-to-r from-[#0FAE96] to-[#7000FF] text-white font-semibold rounded-xl shadow-[0_6px_24px_rgba(15,174,150,0.6)] hover:shadow-[0_8px_32px_rgba(112,0,255,0.7)] hover:scale-105 transition-all duration-300 transform relative overflow-hidden group" onClick={handleSkills}>
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.3)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-shimmer"></span>
                <span className="relative z-10 flex items-center">
                  Get Suggestion
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Detailed Evaluation Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {atsData?.detailedEvaluation && Object.entries(atsData.detailedEvaluation).map(([key, value]: any, index: number) => (
            <div
              key={index}
              className="bg-[rgba(255,255,255,0.06)] backdrop-blur-2xl rounded-3xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.08)] transform hover:-translate-y-2 hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)] transition-all duration-500 relative overflow-hidden"
              style={{ marginLeft: index % 2 === 0 ? '0' : '2rem' }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[rgba(112,0,255,0.08)] to-transparent opacity-50 pointer-events-none"></div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-semibold text-[#0FAE96] capitalize flex items-center">
                  {index === 0 && <Lightbulb className="w-5 h-5 mr-2 text-[#E02529] glow-effect" />}
                  {index === 1 && <Layout className="w-5 h-5 mr-2 text-[#E02529] glow-effect" />}
                  {index === 2 && <FileText className="w-5 h-5 mr-2 text-[#E02529] glow-effect" />}
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </h3>
                <StarRating rating={value.rating} />
              </div>
              <p className="text-[rgba(255,255,255,0.9)]  text-sm leading-relaxed">
                {value.text}
              </p>
            </div>
          ))}
        </div>

        {/* Suggestions Section */}
        <div className="bg-[rgba(255,255,255,0.05)] backdrop-blur-2xl rounded-3xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.08)] transition-all duration-500">
          <h2 className="text-2xl font-semibold text-[#0FAE96] mb-6 flex items-center">
            <CheckCircle className="w-6 h-6 mr-2 text-[#0FAE96] glow-effect" />
            Actionable Suggestions
          </h2>
          <div className="space-y-6">
            {atsData?.suggestion && Object.entries(atsData.suggestion).map(([key, items]:[any,any], index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-medium text-white capitalize">{key}</h3>
                  {/* <StarRating rating={3} /> */}
                </div>
                <ul className="space-y-2">
                  {items.map((item: string, i: number) => (
                    <li
                      key={i}
                      className="text-[rgba(255,255,255,0.85)] text-sm pl-4 relative flex items-center before:content-['•'] before:absolute before:left-0 before:text-[#E02529] before:font-bold hover:text-[#0FAE96] transition-colors duration-200"
                    >
                      <Star className="w-3 h-3 mr-2 text-[#0FAE96] opacity-50" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

          </div>
          <button className="mt-8 px-6 py-3 bg-[#0FAE96] text-white font-semibold rounded-xl shadow-[0_4px_20px_rgba(15,174,150,0.5)] hover:bg-[#0E8C77] hover:scale-105 hover:shadow-[0_6px_30px_rgba(15,174,150,0.7)] transition-all duration-300 transform relative overflow-hidden"
          onClick={handleClick}
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.2)] to-transparent animate-shimmer"></span>
            Optimize Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default ATSResumeEvaluation;