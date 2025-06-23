import React, { useState, useEffect } from 'react';
// Importing Lucide React icons directly as requested
import { TrendingUp, Users, Mail, FileText, Award, Play, Zap, Clock, Target, Shield, Sparkles, Brain, Code, MessageSquare } from 'lucide-react';

const StatsSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [animatedValues, setAnimatedValues] = useState({
    jobsApplied: 0,
    emailsSent: 0,
    studentsTrained: 0,
    resumesCreated: 0,
    interviewsSecured: 0
  });

  // State for video playback
  const [showVideo, setShowVideo] = useState(false);

  const handlePlayClick = () => {
    setShowVideo(true);
  };

  // Updated final values for the job automator statistics
  const finalValues = {
    jobsApplied: 15000, // More jobs applied daily
    emailsSent: 18000, // More emails sent
    studentsTrained: 12000, // More users
    resumesCreated: 4500, // More resumes created
    interviewsSecured: 750 // More interviews
  };

  const stats = [
    {
      key: 'jobsApplied',
      value: animatedValues.jobsApplied,
      final: finalValues.jobsApplied,
      label: 'Jobs Applied To',
      icon: TrendingUp, // Using Lucide React icon directly
      color: 'from-emerald-400 to-teal-500'
    },
    {
      key: 'emailsSent',
      value: animatedValues.emailsSent,
      final: finalValues.emailsSent,
      label: 'Personalized Emails Sent',
      icon: Mail, // Using Lucide React icon directly
      color: 'from-blue-400 to-cyan-500'
    },
    {
      key: 'studentsTrained',
      value: animatedValues.studentsTrained,
      final: finalValues.studentsTrained,
      label: 'Job Seekers Empowered',
      icon: Users, // Using Lucide React icon directly
      color: 'from-purple-400 to-pink-500'
    },
    {
      key: 'resumesCreated',
      value: animatedValues.resumesCreated,
      final: finalValues.resumesCreated,
      label: 'ATS Resumes Optimized',
      icon: FileText, // Using Lucide React icon directly
      color: 'from-orange-400 to-red-500'
    },
    {
      key: 'interviewsSecured',
      value: animatedValues.interviewsSecured,
      final: finalValues.interviewsSecured,
      label: 'Interviews Secured',
      icon: Award, // Using Lucide React icon directly
      color: 'from-yellow-400 to-orange-500'
    }
  ];

  useEffect(() => {
    // Set isVisible to true when the component mounts to trigger initial animations
    setIsVisible(true);

    const duration = 2000; // 2 seconds for animation
    const steps = 60; // Number of animation frames
    const stepDuration = duration / steps; // Duration of each frame

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const easeProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic function for smooth animation

      setAnimatedValues({
        jobsApplied: Math.floor(finalValues.jobsApplied * easeProgress),
        emailsSent: Math.floor(finalValues.emailsSent * easeProgress),
        studentsTrained: Math.floor(finalValues.studentsTrained * easeProgress),
        resumesCreated: Math.floor(finalValues.resumesCreated * easeProgress),
        interviewsSecured: Math.floor(finalValues.interviewsSecured * easeProgress)
      });

      if (currentStep >= steps) {
        clearInterval(timer);
        setAnimatedValues(finalValues); // Ensure exact final values are set when animation completes
      }
    }, stepDuration);

    // Cleanup function to clear the interval if the component unmounts
    return () => clearInterval(timer);
  }, []); // Empty dependency array means this effect runs once on mount and cleans up on unmount

  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
  };

  return (
    <div className="bg-[#11011E] text-[#ECF1F0] min-h-screen flex flex-col items-center justify-center font-inter">
      {/* Main Content Area */}
      <main className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-12">
        {/* Hero Section with Split Design */}
        <section className="flex flex-col lg:flex-row items-center gap-12 mb-16">
          {/* Left Side - Content (Hero Text and Buttons) */}
          <div className="w-full lg:w-1/2 space-y-6">
            <div className="inline-block px-3 py-1 rounded-full bg-[rgba(15,174,150,0.1)] border border-[#0FAE96] text-[#0FAE96] text-xs font-medium mb-2">
              Supercharge Your Job Hunt
            </div>

            <h1 className="font-raleway font-bold text-3xl md:text-4xl xl:text-5xl leading-tight">
              Apply to 100s of Jobs Across Platforms With <span className="text-[#0FAE96]">AI Automation</span>
            </h1>

            <p className="text-[#B6B6B6] text-base md:text-lg">
              Stop the manual grind. JobForm Automator fills applications, optimizes your resume, and connects you with recruiters automatically, across LinkedIn, Monster, and company sites.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button className="bg-[#0FAE96] text-black px-4 py-2 rounded-md hover:bg-[#0FAE96]/80 transform transition duration-200 hover:scale-105 text-sm sm:text-base">
                Start Auto-Applying
              </button>

              <button className="bg-transparent border border-[rgba(255,255,255,0.2)] text-white font-medium text-base px-8 py-3 rounded-lg transition-all duration-200 hover:bg-[rgba(255,255,255,0.05)] transform transition duration-200 hover:scale-105 text-sm sm:text-base">
                Watch Demo
              </button>
            </div>

            <div className="flex items-center gap-4 pt-2">
            <div className="flex -space-x-3">
                <img src="/images/Img1.png" alt="User avatar" className="w-8 h-8 rounded-full border-2 border-[#11011E]" />
                <img src="/images/Img2.png" alt="User avatar" className="w-8 h-8 rounded-full border-2 border-[#11011E]" />
                <img src="/images/Img3.png" alt="User avatar" className="w-8 h-8 rounded-full border-2 border-[#11011E]" />
                <img src="/images/Img4.png" alt="User avatar" className="w-8 h-8 rounded-full border-2 border-[#11011E]" />
              </div>
              <p className="text-sm text-[#B6B6B6]"><span className="text-white font-medium">100+</span> job seekers are using JobForm Automator!</p>
            </div>
          </div>

          {/* Right Side - Video Section (Integrated) */}
          <div className="w-full lg:w-1/2 flex items-center justify-center">
            {/* Decorative blur effects for the video section */}

            {/* Main video container with gradient border effect */}
            <div className="relative z-10 w-full max-w-[1200px] aspect-video">
                {/* Gradient blur effect for the border */}
                <div className="absolute -inset-1 bg-gradient-to-r from-[#0FAE96] to-[#5b34ea75] opacity-30 blur-xl rounded-[24px]"></div>

                {/* Video card content wrapper */}
                <div className="relative bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-[24px] overflow-hidden shadow-2xl transition-all duration-500 hover:shadow-[0_0_80px_rgba(15,174,150,0.15)] hover:border-[rgba(15,174,150,0.2)] hover:scale-[1.02] group w-full h-full">
                  <div className="relative w-full h-full">
                    {!showVideo ? (
                      <>
                        {/* Play button overlay */}
                        <div className="absolute inset-0 z-20 flex items-center justify-center opacity-100 scale-110 group-hover:opacity-100 transition-opacity duration-300 bg-black/20 ">
                          <button
                            onClick={handlePlayClick}
                            className="w-16 h-16 sm:w-20 sm:h-20 bg-[#0FAE96] rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 hover:shadow-[0_0_30px_rgba(15,174,150,0.4)] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0FAE96]"
                            aria-label="Play video"
                          >
                            <Play className="w-6 h-6 sm:w-8 sm:h-8 text-white ml-1" />
                          </button>
                        </div>

                        {/* Corner accent indicators */}
                        <div className="absolute top-4 left-4 w-3 h-3 bg-[#0FAE96] rounded-full opacity-60 animate-pulse"></div>
                        <div className="absolute top-4 right-4 w-2 h-2 bg-[#0FAE96] rounded-full opacity-40"></div>
                        <div className="absolute bottom-4 left-4 w-2 h-2 bg-[#0FAE96] rounded-full opacity-40"></div>
                        <div className="absolute bottom-4 right-4 w-3 h-3 bg-[#0FAE96] rounded-full opacity-60 animate-pulse delay-500"></div>

                        {/* Placeholder image for the video thumbnail */}
                        <img
                          className="w-full h-full object-cover relative z-10 cursor-pointer"
                          src="/images/autoapply.png"
                          alt="Demo Video Thumbnail"
                          onClick={handlePlayClick}
                        />
                      </>
                    ) : (
                      // YouTube iframe - loads when 'Play' is clicked
                      <iframe
                        className="w-full h-full relative z-10"
                        src="https://www.youtube.com/embed/z6JgvamQCb0?rel=0&autoplay=1"
                        title="Demo Video"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    )}
                  </div>

                  {/* Bottom gradient border accent */}
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#0FAE96] to-transparent opacity-60"></div>
                </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <div className="relative bg-[#11011E] py-16 px-6 overflow-hidden min-h-screen flex items-center justify-center font-inter">
          {/* Background Elements - Using blur-purple and blur-pink */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#11011E] via-[#11011E] to-[#11011E]"></div>
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#7000FF]/10 rounded-full blur-[180px] opacity-25"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#FF00C7]/10 rounded-full blur-[180px] opacity-25"></div>

          <div className="relative max-w-7xl mx-auto z-10">
            {/* Header */}
            <div className="text-center mb-16">
              <h2 className="text-[#ECF1F0] font-raleway font-bold text-3xl md:text-4xl lg:text-5xl leading-tight mb-4">
                Proven Success – Join <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#0FAE96] to-cyan-400">Thousands of Empowered Job Seekers</span>
              </h2>
              <p className="text-[#B6B6B6] text-lg md:text-xl max-w-3xl mx-auto">
                Our commitment to your success is reflected in every metric. See how JobForm Automator empowers careers.
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8 mb-20">
              {stats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <div
                    key={stat.key}
                    className={`group relative bg-[rgba(255,255,255,0.02)] rounded-xl p-6 border border-[rgba(255,255,255,0.05)] hover:border-white/[0.1] transition-all duration-500 hover:scale-[1.02] hover:bg-[rgba(255,255,255,0.03)] min-h-[160px] flex flex-col justify-between
                      ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                    style={{
                      transitionDelay: `${index * 100}ms`
                    }}
                  >
                    {/* Gradient Border Effect */}
                    <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500 blur-xl`}></div>

                    <div className="relative z-10 flex-grow">
                      {/* Icon */}
                      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r ${stat.color} mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>

                      {/* Number */}
                      <div className="text-4xl md:text-5xl font-bold text-[#ECF1F0] mb-2 tabular-nums font-raleway">
                        {formatNumber(stat.value)}+
                      </div>

                      {/* Label */}
                      <div className="text-sm md:text-base text-[#B6B6B6] group-hover:text-gray-300 transition-colors duration-300">
                        {stat.label}
                      </div>
                    </div>

                    {/* Pulse Animation */}
                    <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-5 animate-pulse`}></div>
                  </div>
                );
              })}
            </div>

            {/* Extension Benefits */}
            <div className="mb-20">
              <div className="text-center mb-16">
                <h3 className="text-[#ECF1F0] font-raleway font-bold text-3xl md:text-4xl lg:text-5xl mb-4">
                  Why JobForm Automator is Your <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#0FAE96] to-teal-400">Ultimate Job Search Companion</span>
                </h3>
                <p className="text-[#B6B6B6] text-lg md:text-xl max-w-3xl mx-auto">
                  Supercharge your job search with intelligent automation that works tirelessly for you.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {[
                  {
                    icon: Zap,
                    title: "Multi-Platform Auto-Apply",
                    description: "Apply to hundreds of relevant jobs daily on LinkedIn, Monster, and company career pages, all automatically filled.",
                    color: "from-yellow-400 to-orange-500"
                  },
                  {
                    icon: Mail,
                    title: "AI-Powered Personalized Emails",
                    description: "Send personalized, AI-written emails directly to recruiters, making your application stand out effortlessly.",
                    color: "from-blue-400 to-cyan-500"
                  },
                  {
                    icon: FileText,
                    title: "ATS-Optimized Resume Builder",
                    description: "Generate a keyword-optimized ATS resume that gets through filters with just one click. No guesswork, just results.",
                    color: "from-purple-400 to-pink-500"
                  },
                  {
                    icon: Brain,
                    title: "Intelligent Skill Gap Analysis",
                    description: "Discover missing skills based on real-time job market data, learn them for free, and get an ATS checker for rejection reasons.",
                    color: "from-green-400 to-teal-500"
                  },
                  {
                    icon: MessageSquare,
                    title: "AI Mock Interview Coach",
                    description: "Nail every interview with AI-powered mock sessions, tailored questions, and instant feedback to boost your confidence.",
                    color: "from-indigo-400 to-purple-500"
                  },
                  {
                    icon: Shield,
                    title: "Secure & Private Data Handling",
                    description: "Your personal information is encrypted and never shared with third parties, ensuring complete privacy and security.",
                    color: "from-red-400 to-pink-500"
                  }
                ].map((benefit, index) => {
                  const IconComponent = benefit.icon;
                  return (
                    <div
                      key={index}
                      className={`group relative bg-[rgba(255,255,255,0.02)] rounded-xl p-6 border border-[rgba(255,255,255,0.05)] hover:border-white/[0.1] transition-all duration-500 hover:scale-[1.02] hover:bg-[rgba(255,255,255,0.03)] min-h-[220px] flex flex-col justify-start
                        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                      style={{
                        transitionDelay: `${(index + 5) * 100}ms`
                      }}
                    >
                      <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${benefit.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500 blur-xl`}></div>

                      <div className="relative z-10 flex-grow">
                        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r ${benefit.color} mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>

                        <h4 className="text-xl md:text-2xl font-bold text-[#ECF1F0] mb-3 font-raleway group-hover:text-gray-100 transition-colors duration-300">
                          {benefit.title}
                        </h4>

                        <p className="text-base text-[#B6B6B6] group-hover:text-gray-300 transition-colors duration-300 leading-relaxed">
                          {benefit.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Call to Action */}
            <div className="text-center">
              <div className="inline-flex flex-col items-center gap-10 p-8 md:p-12 bg-[rgba(255,255,255,0.02)] rounded-3xl border border-[rgba(255,255,255,0.05)] backdrop-blur-sm max-w-4xl mx-auto shadow-2xl shadow-purple-900/10">
                <div className="text-center">
                  <h3 className="text-[#ECF1F0] font-raleway font-bold text-3xl md:text-4xl lg:text-5xl mb-4 leading-tight">
                    Ready to Revolutionize Your Job Search?
                  </h3>
                  <p className="text-[#B6B6B6] text-lg md:text-xl mb-8 max-w-2xl">
                    Experience how JobForm Automator can significantly boost your application rate and secure interviews faster.
                  </p>
                </div>

                <div className="flex flex-col md:flex-row items-center md:justify-center gap-8 md:gap-12 w-full">
                  {/* Watch Demo Button */}
                  <button className="group relative bg-[#0FAE96] text-white font-raleway font-semibold text-base px-8 py-4 rounded-md transition duration-200 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0FAE96] min-h-[40px] shadow-lg hover:shadow-xl">
                    <span className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                          <Play className="w-4 h-4 text-white ml-0.5" />
                        </div>
                        <div className="absolute inset-0 bg-white/30 rounded-full animate-pulse-slow"></div>
                      </div>
                      Watch Demo
                    </span>
                    <div className="absolute inset-0 rounded-md bg-[#0FAE96] opacity-0 group-hover:opacity-30 blur-lg transition-opacity duration-300"></div>
                  </button>

                  {/* Trust Indicators */}
                  <div className="flex flex-wrap items-center justify-center gap-6 pt-6 md:pt-0 md:border-t-0 border-t border-[rgba(255,255,255,0.05)] md:border-l md:border-[rgba(255,255,255,0.05)] md:pl-8">
                    <div className="flex items-center gap-2 text-[#B6B6B6] text-sm md:text-base">
                      <Shield className="w-4 h-4 text-white/70" />
                      <span>100% Secure</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#B6B6B6] text-sm md:text-base">
                      <Zap className="w-4 h-4 text-white/70" />
                      <span>Instant Setup</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#B6B6B6] text-sm md:text-base">
                      <Target className="w-4 h-4 text-white/70" />
                      <span>97% Success Rate</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StatsSection;
