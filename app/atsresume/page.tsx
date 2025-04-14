"use client";
import React from "react";
import JobSeeker from "../../components/JobSeeker";
import FAQSection from "../../components/home/FAQSection";
import TestimonialSection from "../../components/home/TestimonialSection";
import PricingSection from "../../components/pricing/PricingSection";
import GetHired from '../../components/ats-resume/GetHired';
import ThreeStepsResume from '../../components/ats-resume/ThreeStepsResume';
import Template from '../../components/ats-resume/Template';

export default function AtsResume() {
  return (
    <div className="bg-[#11011E]">
    
      <GetHired />
      <ThreeStepsResume />
      <Template />
      <PricingSection />
      <TestimonialSection />
      <FAQSection />
      <JobSeeker />
    </div>
  );
}