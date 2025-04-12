import React from 'react';
import { Gift, Mail, Zap } from 'lucide-react';

const ReferralStats = () => {
  return (
    <section className="relative overflow-hidden bg-[#11011E] px-4 sm:px-6 md:px-[90px] py-[60px] text-white text-center max-w-[1440px] mx-auto rounded-lg">
      {/* Background Blurs */}
      <div className="absolute top-[-150px] left-[-100px] w-[400px] h-[400px] bg-[#6f00ff31] opacity-30 blur-[200px] rounded-full z-0" />
      <div className="absolute bottom-[-150px] right-[-100px] w-[400px] h-[400px] bg-[#ff00c836] opacity-30 blur-[200px] rounded-full z-0" />

      {/* Top Badge */}
      <div className="relative z-10 flex justify-center mb-4 sm:mb-6">
        <span className="bg-[#14303C] text-[#3EE2A8] text-xs font-semibold px-4 py-1 rounded-full">
          ● What to expect
        </span>
      </div>

      {/* Heading */}
      <h2 className="relative z-10 text-[24px] sm:text-[28px] md:text-[32px] font-raleway font-bold leading-snug mb-6 sm:mb-12 opacity-0 animate-fade-in">
        {/* Intentionally left blank per original code */}
      </h2>

      <h3 className="font-raleway font-bold text-2xl sm:text-3xl md:text-4xl text-text-title mb-6 sm:mb-8 tracking-wide transition-colors duration-300 hover:text-primary-accent px-2">
        An exclusive opportunity to earn cash when you share Jobform Automator
      </h3>

      {/* Card Grid */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6 max-w-6xl mx-auto px-2 sm:px-0">
        {/* Card 1 */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-5 sm:p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:scale-[1.02]">
          <div className="flex justify-center mb-4">
            <Gift size={32} className="text-white" />
          </div>
          <h3 className="font-raleway text-base sm:text-lg font-semibold mb-2 text-[#ECF1F0]">
            Receive $9* per user
          </h3>
          <p className="font-roboto text-sm text-[#B6B6B6] leading-relaxed">
            Get $9 for each new user you refer who installs our Chrome extension and automates their job form applications.
          </p>
        </div>

        {/* Card 2 */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-5 sm:p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:scale-[1.02]">
          <div className="flex justify-center mb-4">
            <Mail size={32} className="text-white" />
          </div>
          <h3 className="font-raleway text-base sm:text-lg font-semibold mb-2 text-[#ECF1F0]">
            Newsletter & exclusive offers
          </h3>
          <p className="font-roboto text-sm text-[#B6B6B6] leading-relaxed">
            Be the first to know about new features, updates, and special offers you can share with your audience.
          </p>
        </div>

        {/* Card 3 */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-5 sm:p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:scale-[1.02]">
          <div className="flex justify-center mb-4">
            <Zap size={32} className="text-white" />
          </div>
          <h3 className="font-raleway text-base sm:text-lg font-semibold mb-2 text-[#ECF1F0]">
            Free access to auto apply 10 jobs for 7 days
          </h3>
          <p className="font-roboto text-sm text-[#B6B6B6] leading-relaxed">
            Every new referral gets access to auto-apply to 20 jobs daily for 7 days, giving them a powerful jumpstart in their job search.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ReferralStats;
