// src/components/FormSteps/Analyzing.tsx
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { useAppContext } from '@/context/AppContext';
import { FormStep } from '@/types/index';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation'; // **Added**: For redirect

const Analyzing = () => {
  const { state } = useAppContext();
  const router = useRouter(); // **Added**: Router for redirect

  // Redirect if analysis completes or user navigates incorrectly
  useEffect(() => {
    if (state.formStep !== FormStep.ANALYZING) {
      if (state.formStep === FormStep.RESULTS) {
        router.push('/course/dashboard');
      } else {
        router.push('/course/jobdescription');
      }
    }
  }, [state.formStep, router]);

  // Don't render the analyzing UI unless currently analyzing
  if (state.formStep !== FormStep.ANALYZING) {
    return null;
  }


  return (
   <div className="flex flex-col bg-[#11011E]">
      <div className="w-full max-w-4xl mx-auto animate-fade-in px-4 sm:px-6 lg:px-8 py-8">
        <Card className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
          <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16">
            <div className="w-16 h-16 border-4 border-[#0FAE96] border-t-transparent rounded-full animate-spin mb-8"></div>
            <h2 className="text-xl sm:text-2xl font-raleway font-bold text-[#ECF1F0] mb-2">
              Analyzing Your Data with AI
            </h2>
            <p className="text-center text-[#B6B6B6] font-inter text-sm sm:text-base max-w-md">
              Our AI is analyzing your resume and job descriptions to identify skill gaps
              and create a personalized learning roadmap for you.
            </p>
            <div className="mt-6 flex flex-col items-center">
              <div className="flex space-x-2 items-center mb-2">
                <div className="w-2 h-2 bg-[#0FAE96] rounded-full animate-pulse"></div>
                <div className="text-sm text-[#B6B6B6] font-inter">
                  Extracting skills from resume
                </div>
              </div>
              <div className="flex space-x-2 items-center mb-2">
                <div className="w-2 h-2 bg-[#0FAE96] rounded-full animate-pulse delay-300"></div>
                <div className="text-sm text-[#B6B6B6] font-inter">
                  Analyzing job requirements
                </div>
              </div>
              <div className="flex space-x-2 items-center">
                <div className="w-2 h-2 bg-[#0FAE96] rounded-full animate-pulse delay-700"></div>
                <div className="text-sm text-[#B6B6B6] font-inter">
                  Generating personalized learning path
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analyzing;