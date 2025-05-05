"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import CompaniesSection from '@/components/home/CompaniesSection';
import FAQSection from '@/components/home/FAQSection';
import FeaturesSection from '@/components/home/FeaturesSection';
import HeroSection from '@/components/home/HeroSection';
import HowItWorks from '@/components/home/HowItWorks';
import ResumeATSChecker from '@/components/home/ResumeATSChecker';
import PricingSection from '@/components/pricing/PricingSection';
import TestimonialSection from "../components/home/TestimonialSection";
import JobSeeker from "../components/JobSeeker";
import VideoSection from "../components/home/video";
import ResumeUpload from "@/components/upload/ResumeUpload";
export default function Mainpage({ params }) {
  const router = useRouter();
  const [jobDescription, setJobDescription] = useState('');
  const [recruiterSuggestion, setRecruiterSuggestion] = useState('');
  const [jobTitle, setJobTitle] = useState('');

  useEffect(() => {
    if (params?.referral) {
      document.cookie = `referral=${params.referral}; path=/; max-age=${30 * 24 * 60 * 60}`;
      router.push("/"); // Redirect to homepage
    }
  }, [params?.referral, router]);

  return (
    <div className='bg-[#11011E]'>
      <HeroSection />
      <VideoSection />
      <CompaniesSection />
      <HowItWorks />
      <FeaturesSection />
      <PricingSection />
      <TestimonialSection />
      <ResumeATSChecker />
      <FAQSection />
      <JobSeeker />
    </div>
  );
}
