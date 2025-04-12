import React from "react";
//"Img1.png", "Img2.png", "Img3.png", "Img4.png"
export default function Demo() {
  return (
    <div className="bg-[#11011E] text-[#ECF1F0] min-h-screen flex items-center justify-center">
      {/* Main Content */}
      <main className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-12">
        {/* Hero Section with Split Design */}
        <section className="flex flex-col lg:flex-row items-center gap-12 mb-16">
          {/* Left Side - Content */}
          <div className="w-full lg:w-1/2 space-y-6">
            <div className="inline-block px-3 py-1 rounded-full bg-[rgba(15,174,150,0.1)] border border-[#0FAE96] text-[#0FAE96] text-xs font-medium mb-2">
              Start Now
            </div>
            
            <h1 className="font-raleway font-bold text-3xl md:text-4xl xl:text-5xl leading-tight">
              Apply to 100+ LinkedIn Jobs With <span className="text-[#0FAE96]">Just One Click</span>
            </h1>
            
            <p className="text-[#B6B6B6] text-base md:text-lg">
              Stop filling out repetitive applications. AutoApply lets you apply to multiple jobs instantly, customizing your resume for each position automatically.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button className="bg-[#0FAE96] text-black px-4 py-2 rounded-md hover:bg-[#0FAE96]/80 transform transition duration-200 hover:scale-105 text-sm sm:text-base">
                Auto-Apply
              </button>
              
              <button className="bg-transparent border border-[rgba(255,255,255,0.2)] text-white font-medium text-base px-8 py-3 rounded-lg transition-all duration-200 hover:bg-[rgba(255,255,255,0.05)] hover:bg-[#0FAE96]/80 transform transition duration-200 hover:scale-105 text-sm sm:text-base">
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
              <p className="text-sm text-[#B6B6B6]"><span className="text-white font-medium">1,200+</span> job seekers applied this week</p>
            </div>
          </div>
          
          {/* Right Side - Video */}
          <div className="w-full lg:w-1/2">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#0FAE96] to-[#5b34ea] opacity-30 blur-xl rounded-2xl"></div>
              <div className="relative rounded-2xl overflow-hidden border border-[rgba(255,255,255,0.1)]">
                <div className="aspect-video">
                  <iframe
                    src="https://www.youtube.com/embed/z6JgvamQCb0?rel=0"
                    title="Auto-Apply with LinkedIn Demo"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Stats Section */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8 border-t border-b border-[rgba(255,255,255,0.05)]">
          <div className="text-center py-6">
            <p className="text-3xl font-bold text-[#0FAE96]">8,500+</p>
            <p className="text-sm text-[#B6B6B6]">Jobs Applied To</p>
          </div>
          <div className="text-center py-6">
            <p className="text-3xl font-bold text-[#0FAE96]">70%</p>
            <p className="text-sm text-[#B6B6B6]">Time Saved</p>
          </div>
          <div className="text-center py-6">
            <p className="text-3xl font-bold text-[#0FAE96]">24/7</p>
            <p className="text-sm text-[#B6B6B6]">Support</p>
          </div>
          <div className="text-center py-6">
            <p className="text-3xl font-bold text-[#0FAE96]">4.8/5</p>
            <p className="text-sm text-[#B6B6B6]">User Rating</p>
          </div>
        </section>
        
        {/* How It Works Section */}
        <section className="py-12">
          <h2 className="text-2xl font-bold text-center mb-10">How Auto-Apply Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[rgba(255,255,255,0.02)] rounded-xl p-6 relative">
              <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-[#0FAE96] flex items-center justify-center font-bold">1</div>
              <h3 className="font-semibold text-lg mb-3">Connect Your LinkedIn</h3>
              <p className="text-[#B6B6B6] text-sm">Securely link your LinkedIn profile with just one click - we never store your password.</p>
            </div>
            
            <div className="bg-[rgba(255,255,255,0.02)] rounded-xl p-6 relative">
              <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-[#0FAE96] flex items-center justify-center font-bold">2</div>
              <h3 className="font-semibold text-lg mb-3">Select Job Preferences</h3>
              <p className="text-[#B6B6B6] text-sm">Choose job titles, locations, and salary ranges that match your career goals.</p>
            </div>
            
            <div className="bg-[rgba(255,255,255,0.02)] rounded-xl p-6 relative">
              <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-[#0FAE96] flex items-center justify-center font-bold">3</div>
              <h3 className="font-semibold text-lg mb-3">One-Click Apply</h3>
              <p className="text-[#B6B6B6] text-sm">Hit the Auto-Apply button and watch as applications are submitted automatically.</p>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="mt-8 mb-12">
          <div className="bg-gradient-to-r from-[rgba(15,174,150,0.1)] to-[rgba(91,52,234,0.1)] rounded-2xl p-8 lg:p-10 text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to revolutionize your job search?</h2>
            <p className="text-[#B6B6B6] max-w-2xl mx-auto mb-6">Join thousands of job seekers who are landing interviews faster with AutoApply&apos;s one-click application tool.</p>
            
            <button className="bg-[#0FAE96] text-white font-medium text-lg px-10 py-4 rounded-lg transition-all duration-200 hover:bg-opacity-90 hover:shadow-lg hover:shadow-[#0FAE96]/20 mx-auto hover:bg-[#0FAE96]/80 transform transition duration-200 hover:scale-105 text-sm sm:text-base">
              Start Applying For Free
            </button>
            
            <p className="text-xs text-[#B6B6B6] mt-4">No credit card required. Apply to 10 jobs daily, free forever.</p>
          </div>
        </section>
      </main>
    </div>
  );
}