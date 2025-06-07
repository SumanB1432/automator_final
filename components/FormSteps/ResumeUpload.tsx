"use client";
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/cardforCourse';
import { Textarea } from '@/components/ui/textarea';
import { useAppContext } from '@/context/AppContext';
import { FormStep } from '@/types/index';
import { ArrowLeft, ArrowRight, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getAuth } from 'firebase/auth';
import { fetchGeminiApiKey, fetchUserResumeData } from '@/services/firebaseService';
import { onAuthStateChanged } from 'firebase/auth';
import { toast } from 'react-toastify';

const ResumeUpload = () => {
  const { state, setResume, setFormStep } = useAppContext();
  const [resumeText, setResumeText] = useState(state.resume?.text || '');
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoadingResume, setIsLoadingResume] = useState(false);
  const [isLoadingContinue, setIsLoadingContinue] = useState(false); // New state for Continue button
  const [apiKey, setApiKey] = useState<string | null>(null);
  const router = useRouter();
  const auth = getAuth();

  // Fetch Gemini API key on mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        // console.log("User signed in:", currentUser);
      } else {
        toast.error("You need to be signed in to access this page!");
        setTimeout(() => {
          window.location.href = "/sign-in";
        }, 2000);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchApiKey = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const key = await fetchGeminiApiKey(user.uid);
          setApiKey(key);
          // console.log('Gemini API key fetched:', key ? 'Present' : 'Not found');
        } catch (error) {
          console.error('Error fetching Gemini API key:', error);
          setError('Failed to fetch API key. Manual resume input is still available.');
        }
      }
    };
    fetchApiKey();
  }, [auth.currentUser]);

  // Load resume from URD
  const handleLoadResume = async () => {
    setIsLoadingResume(true);
    setError('');
    const user = auth.currentUser;
    if (!user) {
      setError('Please sign in to load your resume.');
      setIsLoadingResume(false);
      return;
    }
    try {
      const urd = await fetchUserResumeData(user.uid);
      if (urd) {
        // console.log('URD fetched:', urd);
        setResumeText(urd);
        setResume(urd);
        setIsSubmitted(true);
      } else {
        setError('No resume data found in your profile.');
      }
    } catch (error) {
      console.error('Error fetching URD:', error);
      setError('Failed to load resume. Please try again or paste manually.');
      setTimeout(() => {
        window.location.href = "/resume2";
      }, 2000);
    } finally {
      setIsLoadingResume(false);
    }
  };

  const handleSubmit = () => {
    if (!resumeText.trim()) {
      setError('Please paste your resume text or load from profile.');
      return;
    }
    // console.log('Submitting resume:', resumeText);
    setResume(resumeText);
    setIsLoadingContinue(true); // Set loading state for Continue button
    setIsSubmitted(true);
  };

  // Navigate after resume is set
  useEffect(() => {
    if (isSubmitted && state.resume?.text === resumeText && resumeText.trim()) {
      console.log('Resume set, navigating to job descriptions');
      setFormStep(FormStep.JOB_DESCRIPTIONS);
      setTimeout(() => {
        router.push('/course/jobdescription');
        setIsLoadingContinue(false); // Reset loading state after navigation
      }, 2000);
      setIsSubmitted(false);
    }
  }, [isSubmitted, state.resume, resumeText, setFormStep, router]);

  // Debug state changes
  useEffect(() => {
    // console.log('ResumeUpload state.resume:', state.resume);
  }, [state.resume]);

  return (
    <div className="min-h-screen flex flex-col bg-[#11011E]">
      <div className="w-full max-w-4xl mx-auto animate-fade-in py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-[rgba(255,255,255,0.02)] shadow-lg border-[rgba(255,255,255,0.05)] rounded-lg overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#7000FF]/25 to-[#FF00C7]/25 blur-[180px] opacity-25 pointer-events-none"></div>
          <div className="px-6 py-8 relative">
            <h2 className="text-2xl font-raleway font-bold text-[#ECF1F0]">Upload Your Resume</h2>
            <p className="text-[#B6B6B6] font-inter mt-2">Copy and paste the text from your resume or load from your profile</p>
          </div>
          <div className="px-6 sm:px-8 pb-8">
            <div className="space-y-6">
              <div className="space-y-3">
                <Textarea
                  placeholder="Paste your resume text here..."
                  className="min-h-[300px] w-full text-base font-inter text-[#B6B6B6] bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.05)] rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0FAE96] transition duration-200"
                  value={resumeText}
                  onChange={(e) => {
                    setResumeText(e.target.value);
                    setError('');
                  }}
                />
                <Button
                  className="bg-[#7000FF] text-white font-raleway font-semibold text-base px-6 py-2 rounded-md h-10 transition duration-200 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#7000FF]"
                  onClick={handleLoadResume}
                  disabled={isLoadingResume}
                >
                  {isLoadingResume ? (
                    <span className="flex items-center">
                      <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading...
                    </span>
                  ) : (
                    <>
                      <User className="mr-2 h-4 w-4 inline" />
                      Load Resume from Profile
                    </>
                  )}
                </Button>
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
            <Button
              className="bg-transparent text-[#0FAE96] font-raleway font-semibold text-base px-6 py-3 rounded-md h-10 border-[rgba(255,255,255,0.05)] transition duration-200 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0FAE96]"
              onClick={() => setFormStep(FormStep.WELCOME)}
            >
              <ArrowLeft className="mr-2 h-4 w-4 inline" /> Back
            </Button>
            <Button
              className="bg-[#0FAE96] text-white font-raleway font-semibold text-base px-6 py-2 rounded-md h-10 transition duration-200 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0FAE96]"
              onClick={handleSubmit}
              disabled={isLoadingResume || isLoadingContinue}
            >
              {isLoadingContinue ? (
                <span className="flex items-center">
                  <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading...
                </span>
              ) : (
                <>
                  Continue <ArrowRight className="ml-2 h-4 w-4 inline" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeUpload;