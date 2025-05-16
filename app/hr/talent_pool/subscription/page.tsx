'use client'

import React, { useState, useEffect } from 'react';

type Plan = 'Basic' | 'Pro' | 'Enterprise';

interface SubscriptionDetails {
  plan: Plan;
  quotaUsed: number;
  quotaLimit: number;
  renewalDate: string;
  paymentStatus: 'Paid' | 'Unpaid';
}

export default function SubscriptionPage() {
  const [subscription, setSubscription] = useState<SubscriptionDetails | null>(null);

  useEffect(() => {
    // Mocked fetch function. Replace with actual API call
    const fetchSubscriptionDetails = async () => {
      const data: SubscriptionDetails = {
        plan: 'Pro',
        quotaUsed: 150,
        quotaLimit: 200,
        renewalDate: '2025-05-01',
        paymentStatus: 'Paid',
      };
      setSubscription(data);
    };
    
    fetchSubscriptionDetails();
  }, []);

  const handleUpgrade = () => {
    // Logic for upgrading subscription
    console.log('Redirecting to upgrade page...');
  };

  if (!subscription) {
    return <div>Loading...</div>;
  }

  return (
 <div className="relative min-h-screen bg-[#11011E] px-4 py-8 sm:px-6 lg:px-8">
      {/* Enhanced background glows with layered effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-[#7000FF] rounded-full blur-[180px] opacity-20 mix-blend-screen"></div>
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-[#FF00C7] rounded-full blur-[180px] opacity-20 mix-blend-screen"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#0FAE96] rounded-full blur-[120px] opacity-10"></div>
      </div>

      <div className="relative z-10 max-w-3xl mx-auto bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-xl shadow-2xl p-6 sm:p-8 lg:p-10 backdrop-blur-sm">
        <h1 className="text-3xl sm:text-4xl font-raleway font-bold text-[#ECF1F0] mb-8 text-center tracking-tight">
          Subscription Details
        </h1>

        <div className="my-8 space-y-6">
          <h2 className="text-2xl sm:text-3xl font-raleway font-bold text-[#ECF1F0] mb-4">Current Plan</h2>
          <div className="grid gap-3 text-[#B6B6B6] font-inter text-base sm:text-lg">
            <p className="flex justify-between items-center">
              <span>Plan:</span>
              <span className="font-semibold text-[#ECF1F0]">{subscription.plan}</span>
            </p>
            <p className="flex justify-between items-center">
              <span>Quota Used:</span>
              <span>
                {subscription.quotaUsed}/{subscription.quotaLimit}
              </span>
            </p>
            <p className="flex justify-between items-center">
              <span>Renewal Date:</span>
              <span>{subscription.renewalDate}</span>
            </p>
            <p className="flex justify-between items-center">
              <span>Status:</span>
              <span
                className={`font-semibold ${
                  subscription.paymentStatus === "Paid" ? "text-[#0FAE96]" : "text-red-400"
                }`}
              >
                {subscription.paymentStatus}
              </span>
            </p>
          </div>
        </div>

        <div className="my-8 space-y-6">
          <h2 className="text-2xl sm:text-3xl font-raleway font-bold text-[#ECF1F0] mb-4">Upgrade Your Plan</h2>
          <p className="text-[#B6B6B6] font-inter text-base sm:text-lg leading-relaxed">
            Unlock more candidates and premium features by upgrading your plan today!
          </p>
          <button
            className="w-full sm:w-auto bg-[#0FAE96] text-white font-raleway font-semibold text-base px-8 py-3 rounded-md transition-all duration-300 hover:scale-105 hover:bg-[#0D9983] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0FAE96] h-12 shadow-lg"
            onClick={handleUpgrade}
          >
            Upgrade Plan
          </button>
        </div>

        <div className="my-8 space-y-6">
          <h2 className="text-2xl sm:text-3xl font-raleway font-bold text-[#ECF1F0] mb-4">Payment Details</h2>
          <p className="text-[#B6B6B6] font-inter text-base sm:text-lg leading-relaxed">
            Effortlessly manage your payment methods and review your billing history.
          </p>
          <button
            className="w-full sm:w-auto bg-[#0FAE96] text-white font-raleway font-semibold text-base px-8 py-3 rounded-md transition-all duration-300 hover:scale-105 hover:bg-[#0D9983] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0FAE96] h-12 shadow-lg"
          >
            Manage Payment
          </button>
        </div>
      </div>
    </div>
  );
}

