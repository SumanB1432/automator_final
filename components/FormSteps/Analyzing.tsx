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

  // useEffect(() => {
  //   console.log('Analyzing component mounted, formStep:', state.formStep); // **Changed**: Existing debug log
  //   // Redirect if formStep is not ANALYZING
  //   if (state.formStep !== FormStep.ANALYZING) {
  //     console.log('Redirecting from Analyzing due to formStep:', state.formStep); // **Added**: Debug log
  //     router.push(state.formStep === FormStep.RESULTS ? '/dashboard' : '/'); // **Added**: Redirect logic
  //   }
  // }, [state.formStep, router]);

  // // Only render if formStep is ANALYZING
  // if (state.formStep !== FormStep.ANALYZING) {
  //   return null; // **Added**: Prevent rendering
  // }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <Card className="bg-white shadow-md">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-8"></div>
          <h2 className="text-2xl font-bold mb-2">Analyzing Your Data with AI</h2>
          <p className="text-center text-muted-foreground max-w-md">
            Our AI is analyzing your resume and job descriptions to identify skill gaps
            and create a personalized learning roadmap for you.
          </p>
          <div className="mt-6 flex flex-col items-center">
            <div className="flex space-x-2 items-center mb-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <div className="text-sm text-muted-foreground">Extracting skills from resume</div>
            </div>
            <div className="flex space-x-2 items-center mb-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-300"></div>
              <div className="text-sm text-muted-foreground">Analyzing job requirements</div>
            </div>
            <div className="flex space-x-2 items-center">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-700"></div>
              <div className="text-sm text-muted-foreground">Generating personalized learning path</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analyzing;