// Welcome.tsx
"use client";
import { Button } from '@/components/ui/buttoncourse';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/cardforCourse';
import { useAppContext } from '@/context/AppContext';
import { FormStep } from '@/types/index';
import { FileText, Briefcase, BookOpen, ChevronRight, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebase/config';
import { fetchSkillsDataFromFirebase } from '@/services/firebaseService';

const Welcome = () => {
  const { setFormStep } = useAppContext();
  const [uid, setUid] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUid(currentUser?.uid);
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
    if (uid) {
      fetchSkillsDataFromFirebase(uid)
        .then((skillsData) => {
          if (
            skillsData &&
            Object.keys(skillsData).length > 0 &&
            skillsData.learningPath?.[0]?.skills?.[0]?.videos?.length > 0
          ) {
            setTimeout(() => {
              window.location.href = "/course/dashboard";
            }, 1000);
          }
        })
        .catch((error) => {
          console.error("Error fetching skills data:", error);
        });
    }
  }, [uid]);

  const handleOnclick = () => {
    setLoading(true);
    setFormStep(FormStep.RESUME);
    setTimeout(() => {
      router.push('/course/resumeUpload');
    }, 2000);
  };

  return (
    <div className="flex flex-col bg-[#11011E]">
      <div className="max-w-4xl mx-auto animate-fade-in py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-[rgba(255,255,255,0.02)] shadow-lg border-[rgba(255,255,255,0.05)] rounded-lg overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#7000FF]/25 to-[#FF00C7]/25 blur-[180px] opacity-25 pointer-events-none"></div>
          <div className="bg-[#0FAE96] text-white text-center py-10 relative">
            <h2 className="text-3xl font-raleway font-bold text-[#ECF1F0]">Welcome to Resume to Roadmap</h2>
            <p className="text-[#ECF1F0]/90 text-lg mt-2 font-inter">Transform your resume into a personalized learning path</p>
          </div>
          <div className="pt-8 px-6 sm:px-8">
            <div className="grid gap-8 md:grid-cols-3">
              <div className="flex flex-col items-center text-center p-4">
                <div className="h-12 w-12 rounded-full bg-[#0FAE96]/10 flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-[#0FAE96]" />
                </div>
                <h3 className="text-lg font-raleway font-medium text-[#ECF1F0] mb-2">Upload Your Resume</h3>
                <p className="text-[#B6B6B6] text-sm font-inter">We'll analyze your current skills and experience</p>
              </div>
              <div className="flex flex-col items-center text-center p-4">
                <div className="h-12 w-12 rounded-full bg-[#0FAE96]/10 flex items-center justify-center mb-4">
                  <Briefcase className="h-6 w-6 text-[#0FAE96]" />
                </div>
                <h3 className="text-lg font-raleway font-medium text-[#ECF1F0] mb-2">Add Job Descriptions</h3>
                <p className="text-[#B6B6B6] text-sm font-inter">Tell us about the roles you're aiming for</p>
              </div>
              <div className="flex flex-col items-center text-center p-4">
                <div className="h-12 w-12 rounded-full bg-[#0FAE96]/10 flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-[#0FAE96]" />
                </div>
                <h3 className="text-lg font-raleway font-medium text-[#ECF1F0] mb-2">Get Your Roadmap</h3>
                <p className="text-[#B6B6B6] text-sm font-inter">Receive a personalized learning path to achieve your goals</p>
              </div>
            </div>
          </div>
          <div className="bg-[rgba(255,255,255,0.02)] p-6 flex justify-center">
            <button
              className={`bg-[#0FAE96] text-white font-raleway font-semibold text-base px-6 py-2 rounded-md h-10 transition duration-200 ${
                loading ? "opacity-70 cursor-not-allowed" : "hover:scale-105"
              } focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0FAE96] flex items-center justify-center`}
              onClick={handleOnclick}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                  Loading...
                </>
              ) : (
                <>
                  Get Started <ChevronRight className="ml-2 h-5 w-5 inline" />
                </>
              )}
            </button>
          </div>
        </div>
        <div className="mt-8 text-center text-[#B6B6B6] text-sm font-inter">
          <p>Your data is securely processed and not shared with third parties.</p>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
