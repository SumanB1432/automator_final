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
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Subscription Details</h1>

      <div className="my-6">
        <h2 className="text-xl font-medium">Current Plan</h2>
        <p>Plan: <span className="font-bold">{subscription.plan}</span></p>
        <p>Quota Used: {subscription.quotaUsed}/{subscription.quotaLimit}</p>
        <p>Renewal Date: {subscription.renewalDate}</p>
        <p>Status: <span className={`font-bold ${subscription.paymentStatus === 'Paid' ? 'text-green-600' : 'text-red-600'}`}>{subscription.paymentStatus}</span></p>
      </div>

      <div className="my-6">
        <h2 className="text-xl font-medium">Upgrade Your Plan</h2>
        <p>If you need more candidates or additional features, consider upgrading your plan!</p>
        <button 
          className="bg-blue-600 text-white p-2 rounded-md mt-2"
          onClick={handleUpgrade}
        >
          Upgrade Plan
        </button>
      </div>

      <div className="my-6">
        <h2 className="text-xl font-medium">Payment Details</h2>
        <p>Manage your payment methods and view invoices.</p>
        <button 
          className="bg-gray-600 text-white p-2 rounded-md mt-2"
        >
          Manage Payment
        </button>
      </div>
    </div>
  );
}
