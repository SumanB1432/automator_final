"use client";
import React, { useEffect, useState } from "react";
import app from "@/firebase/config";
import { getDatabase, ref, get } from "firebase/database";
import ReferralInvite from '@/components/hr/referal/referralinvite';
import ReferralStats from '@/components/hr/referal/referralstats';
import ReferralBenefit from '@/components/hr/referal/referralbenefit';

const Referral = ({ params }) => {
  const [isLogin, setIsLogin] = useState(null);
  const [fullName, setFullName] = useState("");
  const [copySuccess, setCopySuccess] = useState("");
  const db = getDatabase(app);

  return (
    <section className="min-h-screen bg-[#11011E] text-white p-4 sm:p-8 md:p-16 lg:p-24 rounded-none border-0 backdrop-blur-md">
      <div className="max-w-6xl mx-auto">
        <ReferralInvite />
        <div className="my-6 sm:my-8 md:mb-16"></div>
        <ReferralBenefit />
        <div className="my-6 sm:my-8"></div>
        <ReferralStats />
      </div>
    </section>
  );
};

export default Referral;