// ResumeUpload.tsx
"use client";
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/cardforCourse';
import { Textarea } from '@/components/ui/textarea';
import { useAppContext } from '@/context/AppContext';
import { FormStep } from '@/types/index';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

const ResumeUpload = () => {
  const { state, setResume, setFormStep } = useAppContext();
  const [resumeText, setResumeText] = useState(state.resume?.text || '');
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false); // Track submission
  const router = useRouter();

  const handleSubmit = () => {
    if (!resumeText.trim()) {
      setError('Please paste your resume text');
      return;
    }
    console.log('Submitting resume:', resumeText); // Debug log
    setResume(resumeText);
    setIsSubmitted(true); // Mark as submitted
  };

  // Navigate after resume is set
  useEffect(() => {
    if (isSubmitted && state.resume?.text === resumeText && resumeText.trim()) {
      console.log('Resume set, navigating to job descriptions'); // Debug log
      setFormStep(FormStep.JOB_DESCRIPTIONS);
      router.push('/course/jobdescription');
      setIsSubmitted(false); // Reset submission flag
    }
  }, [isSubmitted, state.resume, resumeText, setFormStep, router]);

  // Debug state changes
  useEffect(() => {
    console.log('ResumeUpload state.resume:', state.resume);
  }, [state.resume]);

  return (
    <div className="min-h-screen flex flex-col bg-[#11011E]">
      <div className="w-full max-w-4xl mx-auto animate-fade-in py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-[rgba(255,255,255,0.02)] shadow-lg border-[rgba(255,255,255,0.05)] rounded-lg overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#7000FF]/25 to-[#FF00C7]/25 blur-[180px] opacity-25 pointer-events-none"></div>
          <div className="px-6 py-8 relative">
            <h2 className="text-2xl font-raleway font-bold text-[#ECF1F0]">Upload Your Resume</h2>
            <p className="text-[#B6B6B6] font-inter mt-2">Copy and paste the text from your resume in the field below</p>
          </div>
          <div className="px-6 sm:px-8 pb-8">
            <div className="space-y-6">
              <div className="space-y-3">
                <textarea
                  placeholder="Paste your resume text here..."
                  className="min-h-[300px] w-full text-base font-inter text-[#B6B6B6] bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.05)] rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0FAE96] transition duration-200"
                  value={resumeText}
                  onChange={(e) => {
                    setResumeText(e.target.value);
                    setError('');
                  }}
                />
                {error && <p className="text-[#FF6B6B] text-sm font-inter">{error}</p>}
              </div>
              <div className="bg-[#11011E] p-4 rounded-md">
                <h4 className="font-raleway font-medium text-[#ECF1F0] mb-2">Tips for best results:</h4>
                <ul className="text-sm text-[#B6B6B6] font-inter space-y-1">
                  <li>• Include all relevant technical skills and technologies</li>
                  <li>• Add certifications and education details</li>
                  <li>• Mention projects you've worked on and your role</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="bg-[#11011E] px-6 py-6 flex justify-between">
            <button
              className="bg-transparent text-[#0FAE96] font-raleway font-semibold text-base px-6 py-3 rounded-md h-10 border-[rgba(255,255,255,0.05)] transition duration-200 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0FAE96]"
              onClick={() => setFormStep(FormStep.WELCOME)}
            >
              <ArrowLeft className="mr-2 h-4 w-4 inline" /> Back
            </button>
            <button
              className="bg-[#0FAE96] text-white font-raleway font-semibold text-base px-6 py-3 rounded-md h-10 transition duration-200 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0FAE96]"
              onClick={handleSubmit}
            >
              Continue <ArrowRight className="ml-2 h-4 w-4 inline" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeUpload;