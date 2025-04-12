import React from 'react';

const ReferralLink = () => {
  return (
    <div className="max-w-2xl mx-auto px-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-6 p-5 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg">
        {/* Read-only referral input */}
        <input
          type="text"
          value="https://example.com/ref/xyz123"
          readOnly
          className="w-full bg-transparent text-white font-roboto text-sm sm:text-base px-4 py-3 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0FAE96] transition"
        />

        {/* Copy button */}
        <button
          className="w-full sm:w-auto bg-[#0FAE96] hover:brightness-110 text-white font-raleway font-semibold text-sm sm:text-base px-5 py-3 rounded-lg transition-all duration-200"
        >
          Copy Link
        </button>
      </div>
    </div>
  );
};

export default ReferralLink;
