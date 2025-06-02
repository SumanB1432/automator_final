// JobDescriptionUpload.tsx
"use client";
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/cardforCourse';
import { useAppContext } from '@/context/AppContext';
import { FormStep } from '@/types/index';
import { ArrowLeft, PlusCircle, X, ArrowRight, Sparkles } from 'lucide-react';
import Analyzing from '@/components/FormSteps/Analyzing';

const JobDescriptionUpload = () => {
  const { state, addJobDescription, removeJobDescription, setFormStep, analyzeData } = useAppContext();
  const [jobText, setJobText] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [jobCompany, setJobCompany] = useState('');
  const [error, setError] = useState('');
  const [apiKey, setApiKey] = useState<string>('');

  useEffect(() => {
    console.log('JobDescriptionUpload mounted, state.resume:', state.resume); // Debug log
    let key = localStorage.getItem("geminiApiKey") || "";
    setApiKey(key);
  }, [state.resume]);

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
    
    console.log('handleSubmit, state.resume:', state.resume); // Debug log
    if (apiKey.trim()) {
      localStorage.setItem('geminiApiKey', apiKey.trim());
    }
    
    setFormStep(FormStep.ANALYZING);
    await analyzeData();
  };

  if (state.formStep === FormStep.ANALYZING) {
    return <Analyzing />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#11011E]">
      <div className="w-full max-w-4xl mx-auto animate-fade-in py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-[rgba(255,255,255,0.02)] shadow-lg border-[rgba(255,255,255,0.05)] rounded-lg overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#7000FF]/25 to-[#FF00C7]/25 blur-[180px] opacity-25 pointer-events-none"></div>
          <div className="px-6 py-8 relative">
            <h2 className="text-2xl font-raleway font-bold text-[#ECF1F0]">Add Job Descriptions</h2>
            <p className="text-[#B6B6B6] font-inter mt-2">Add 1-5 job descriptions for roles you're interested in</p>
          </div>
          <div className="px-6 sm:px-8 pb-8">
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-raleway font-medium text-[#ECF1F0] mb-1 block">
                      Job Title (Optional)
                    </label>
                    <input
                      placeholder="e.g. Frontend Developer"
                      className="w-full text-base font-inter text-[#B6B6B6] bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.05)] rounded-md px-4 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0FAE96] transition duration-200"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-raleway font-medium text-[#ECF1F0] mb-1 block">
                      Company (Optional)
                    </label>
                    <input
                      placeholder="e.g. Acme Inc."
                      className="w-full text-base font-inter text-[#B6B6B6] bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.05)] rounded-md px-4 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0FAE96] transition duration-200"
                      value={jobCompany}
                      onChange={(e) => setJobCompany(e.target.value)}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-raleway font-medium text-[#ECF1F0] mb-1 block">
                    Job Description*
                  </label>
                  <textarea
                    placeholder="Paste the job description here..."
                    className="min-h-[200px] w-full text-base font-inter text-[#B6B6B6] bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.05)] rounded-md px-4 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0FAE96] transition duration-200"
                    value={jobText}
                    onChange={(e) => {
                      setJobText(e.target.value);
                      setError('');
                    }}
                  />
                </div>
                
                <button 
                  onClick={handleAddJob}
                  className="w-full bg-transparent text-[#0FAE96] font-raleway font-semibold text-base px-6 py-3 rounded-md h-10 border-[rgba(255,255,255,0.05)] transition duration-200 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0FAE96]"
                >
                  <PlusCircle className="mr-2 h-4 w-4 inline" />
                  Add Job Description ({state.jobDescriptions.length}/5)
                </button>
                
                {error && <p className="text-[#FF6B6B] text-sm font-inter">{error}</p>}
              </div>
              
              {state.jobDescriptions.length > 0 && (
                <div>
                  <h3 className="text-lg font-raleway font-medium text-[#ECF1F0] mb-4">Added Job Descriptions:</h3>
                  <div className="space-y-3">
                    {state.jobDescriptions.map((job) => (
                      <div 
                        key={job.id} 
                        className="bg-[rgba(255,255,255,0.02)]/40 rounded-lg p-4 flex justify-between items-start"
                      >
                        <div>
                          <h4 className="font-raleway font-medium text-[#ECF1F0]">
                            {job.title || 'Untitled Position'}
                            {job.company && ` at ${job.company}`}
                          </h4>
                          <p className="text-sm text-[#B6B6B6] font-inter line-clamp-2 mt-1">
                            {job.text}
                          </p>
                        </div>
                        <button 
                          className="text-[#0FAE96] font-inter text-sm h-10 px-2 transition duration-200 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0FAE96]"
                          onClick={() => removeJobDescription(job.id)}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="border border-dashed border-[rgba(255,255,255,0.05)] p-4 rounded-md bg-[rgba(255,255,255,0.02)]">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-5 w-5 text-[#0FAE96]" />
                  <h4 className="font-raleway font-medium text-sm text-[#ECF1F0]">Enable AI-Powered Analysis</h4>
                </div>
                <p className="text-sm text-[#B6B6B6] font-inter mb-3">
                  For more accurate skill extraction and analysis, enter your Gemini API key (optional):
                </p>
                <input
                  type="password"
                  placeholder="Your Gemini API key"
                  className="w-full text-base font-inter text-[#B6B6B6] bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.05)] rounded-md px-4 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0FAE96] transition duration-200"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                <p className="text-xs text-[#B6B6B6] font-inter mt-2">
                  If no API key is provided, we'll use our standard analysis method.
                </p>
              </div>
            </div>
          </div>
          <div className="bg-[#11011E] px-6 py-6 flex justify-between">
            <button 
              className="bg-transparent text-[#0FAE96] font-raleway font-semibold text-base px-6 py-3 rounded-md h-10 border-[rgba(255,255,255,0.05)] transition duration-200 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0FAE96]"
              onClick={() => setFormStep(FormStep.RESUME)}
            >
              <ArrowLeft className="mr-2 h-4 w-4 inline" /> Back
            </button>
            <button 
              className="bg-[#0FAE96] text-white font-raleway font-semibold text-base px-6 py-3 rounded-md h-10 transition duration-200 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0FAE96] disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSubmit}
              disabled={state.jobDescriptions.length === 0 || state.isAnalyzing}
            >
              Continue <ArrowRight className="ml-2 h-4 w-4 inline" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDescriptionUpload;