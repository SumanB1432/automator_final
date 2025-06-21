"use client";
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/cardforCourse';
import { useAppContext } from '@/context/AppContext';
import { FormStep } from '@/types/index';
import { ArrowLeft, PlusCircle, X, ArrowRight, Sparkles, Loader2 } from 'lucide-react';
import Analyzing from '@/components/FormSteps/Analyzing';
import { getAuth } from 'firebase/auth';
import { fetchGeminiApiKey, fetchSkillsDataFromFirebase, fetchUserResumeData } from '@/services/firebaseService';
import { toast } from 'react-toastify';
import { onAuthStateChanged } from 'firebase/auth';


const JobDescriptionUpload = () => {
  const { state, addJobDescription, removeJobDescription, setFormStep, analyzeData, setResume } = useAppContext();
  const [jobText, setJobText] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [jobCompany, setJobCompany] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<string[]>([])
  const [apiKey, setApiKey] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false); // New loading state
  const [uid, setUid] = useState<string>("");
  const [resumeText, setResumeText] = useState(state.resume?.text || '');
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        // console.log("User signed in:", currentUser);
        setUid(currentUser?.uid)
      } else {
        toast.error("You need to be signed in to access this page!");
        setTimeout(() => {
          window.location.href = "/sign-in";
        }, 2000);
      }
    });

    return () => unsubscribe();
  }, []);
  //Fetch Data From Firebase Data Base
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

  // Load resume from URD
  useEffect(() => {
    const getURD = async function (uid: string) {
      setError('');
      try {
        const urd = await fetchUserResumeData(uid);
        if (urd) {

          setSuccess((prevSuccess) => [...prevSuccess, "Resume data loaded successfully!"]);
          setResumeText(urd);
          setResume(urd);

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

      }
    }
    if (uid) {
      getURD(uid)
    }
  }, [uid]);
  //Feth Gemini Key
  useEffect(() => {
    // console.log('JobDescriptionUpload mounted, state.resume:', state.resume);

    const fetchApiKey = async (uid: string) => {


      try {
        const key = await fetchGeminiApiKey(uid);
        if (key) {
          setApiKey(key);
          setSuccess((prevSuccess) => [...prevSuccess, "API key loaded successfully!"]);
          // console.log('Gemini API key fetched from Firebase:', key);
        } else {
          toast.error("Please Provide Your API key");
          setError('No resume data found in your profile.');
          setTimeout(() => {
            window.location.href = "/gemini";
          }, 2000);
        }
      } catch (error) {
        console.error('Error fetching Gemini API key:', error);
        setError('Failed to fetch API key. You can still enter it manually.');
        const localKey = localStorage.getItem("geminiApiKey") || "";
        setApiKey(localKey);
      }

    };
    if (uid) {
      // console.log(uid, "gemini")
      fetchApiKey(uid);
    }
  }, [uid]);

  const handleAddJob = () => {
    if (!jobText.trim()) {
      setError('Please paste a job description');
      return;
    }

    addJobDescription(jobText, jobTitle, jobCompany);
    setJobText('');
    setJobTitle('');
    setJobCompany('');
    setError('');
  };

  const handleSubmit = async () => {
    if (state.jobDescriptions.length === 0) {
      setError('Please add at least one job description');
      return;
    }

    // console.log('handleSubmit, state.resume:', state.resume);
    if (apiKey.trim()) {
      localStorage.setItem('geminiApiKey', apiKey.trim());
      // console.log('API key saved to localStorage:', apiKey.trim());
    }

    setIsLoading(true); // Start loading
    try {
      setFormStep(FormStep.ANALYZING);
      await analyzeData();
    } catch (error) {
      console.error('Error during analysis:', error);
      setError('Failed to analyze job descriptions. Please try again.');
      setFormStep(FormStep.JOB_DESCRIPTION); // Revert to current step on error
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  const handleClick = function(){
     window.open("https://youtu.be/FeRTK3aHdIk", "_blank");
  }

  if (state.formStep === FormStep.ANALYZING) {
    return <Analyzing />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#11011E]">
      <div className="w-full max-w-4xl mx-auto animate-fade-in py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-[rgba(255,255,255,0.02)] shadow-md border border-[rgba(255,255,255,0.05)] rounded-xl overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#7000FF]/25 to-[#FF00C7]/25 blur-[180px] opacity-25 pointer-events-none"></div>
          <div className="px-6 py-8 relative">
            <h2 className="text-2xl font-raleway font-bold text-[#ECF1F0]">🎯 Discover Exactly What You Need to Learn</h2>
            <div className="mt-4 bg-[#3b796f13] rounded-xl p-4 border border-[#2D2B3F]">
              <p className="text-[#B6B6B6] font-inter mb-2">
                Add job descriptions <span className="text-[#0FAE96]">(5 Job Descriptions Recommended)</span>
              </p>
              <p className="text-[#B6B6B6] font-inter mb-2">By adding job descriptions, you’ll get:</p>
              <ul className="text-[#B6B6B6] font-inter space-y-2 list-disc list-inside">
                <li>Personalized skill roadmap</li>
                <li>Learning videos for each required skill</li>

              </ul>
              <button className="mt-4 px-4 py-2 bg-[#0FAE96] text-white rounded-lg font-inter hover:bg-[#0da789] transition hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0FAE96] flex items-center justify-center" onClick={()=>handleClick()}>
                🎬 Watch Demo
              </button>
            </div>

          </div>

          <div className="px-6 sm:px-8 pb-8">
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-m font-raleway font-medium text-[#ECF1F0] mb-2 block">
                      Job Title (Optional)
                    </label>
                    <Input
                      placeholder="e.g. Frontend Developer"
                      className="w-full text-base font-inter text-[#B6B6B6] bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-lg px-4 py-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0FAE96] transition duration-200"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-m font-raleway font-medium text-[#ECF1F0] mb-2 block">
                      Company (Optional)
                    </label>
                    <Input
                      placeholder="e.g. Acme Inc."
                      className="w-full text-base font-inter text-[#B6B6B6] bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-lg px-4 py-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0FAE96] transition duration-200"
                      value={jobCompany}
                      onChange={(e) => setJobCompany(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-m font-raleway font-medium text-[#ECF1F0] mb-2 block">
                    Job Description*
                  </label>
                  <Textarea
                    placeholder="Paste the job description here..."
                    className="min-h-[200px] w-full text-base font-inter text-[#B6B6B6] bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-lg px-4 py-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0FAE96] transition duration-200"
                    value={jobText}
                    onChange={(e) => {
                      setJobText(e.target.value);
                      setError('');
                    }}
                  />
                </div>


                <div className="flex justify-center mt-4">
                  <Button
                    onClick={handleAddJob}
                    className="w-[200px] bg-[#0FAE96] text-white font-raleway font-semibold text-base px-6 py-3 rounded-md h-10 transition duration-200 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0FAE96] flex items-center justify-center"
                  >
                    <PlusCircle className="mr-2 h-4 w-4 inline" />
                    Add ({state.jobDescriptions.length}/5)
                  </Button>
                </div>


                {error && <p className="text-[#FF6B6B] text-sm font-inter mt-2">{error}</p>}
              </div>

              {state.jobDescriptions.length > 0 && (
                <div>
                  <h3 className="text-lg font-raleway font-medium text-[#ECF1F0] mb-4">Added Job Descriptions:</h3>
                  <div className="space-y-4">
                    {state.jobDescriptions.map((job) => (
                      <div
                        key={job.id}
                        className=" border border-[rgba(255,255,255,0.05)] rounded-lg p-5 flex justify-between items-start"
                      >
                        <div>
                          <h4 className="font-raleway font-medium text-[#ECF1F0] text-base">
                            {job.title || 'Untitled Position'}
                            {job.company && ` at ${job.company}`}
                          </h4>
                          <p className="text-sm text-[#B6B6B6] font-inter line-clamp-2 mt-2">
                            {job.text}
                          </p>
                        </div>
                        <Button
                          className="text-[#0FAE96] font-inter text-sm h-10 px-3 transition duration-200 hover:bg-[rgba(255,255,255,0.05)] hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0FAE96]"
                          onClick={() => removeJobDescription(job.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="bg-[#11011E] px-6 py-6 flex justify-between">
            <Button
              className="bg-transparent text-[#0FAE96] font-raleway font-semibold text-base px-6 py-3 rounded-md h-10  transition duration-200 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0FAE96]"
              onClick={() => setFormStep(FormStep.RESUME)}
            >

            </Button>
            <Button
              className="bg-[#0FAE96] text-white font-raleway font-semibold text-base px-6 py-3 rounded-md h-10 transition duration-200 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0FAE96] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              onClick={handleSubmit}
              disabled={state.jobDescriptions.length < 5 || state.isAnalyzing || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
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

export default JobDescriptionUpload;