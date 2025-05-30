
"use client"
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/cardforCourse';
import { useAppContext } from '@/context/AppContext';
import { FormStep } from '@/types/index';
import { ArrowLeft, PlusCircle, X, ArrowRight, Sparkles } from 'lucide-react';
import Analyzing from '@/components/FormSteps/Analyzing'; // Import Analyzing component

const JobDescriptionUpload = () => {
  const { state, addJobDescription, removeJobDescription, setFormStep, analyzeData } = useAppContext();
  const [jobText, setJobText] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [jobCompany, setJobCompany] = useState('');
  const [error, setError] = useState('');
  const [apiKey, setApiKey] = useState<string>('');
  
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
  useEffect(()=>{
 let key = localStorage.getItem("geminiApiKey") || ""
 setApiKey(key)
  },[])

  const handleSubmit = () => {
    if (state.jobDescriptions.length === 0) {
      setError('Please add at least one job description');
      return;
    }
    
    // Save API key to localStorage if provided
    if (apiKey.trim()) {
      localStorage.setItem('geminiApiKey', apiKey.trim());
    }
    
    setFormStep(FormStep.ANALYZING);
    analyzeData();
  };

  if (state.formStep === FormStep.ANALYZING) {
    return <Analyzing />;
  }

return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <Card className="bg-white shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl">Add Job Descriptions</CardTitle>
          <CardDescription>
            Add 1-5 job descriptions for roles you're interested in
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Job Title (Optional)
                  </label>
                  <Input
                    placeholder="e.g. Frontend Developer"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Company (Optional)
                  </label>
                  <Input
                    placeholder="e.g. Acme Inc."
                    value={jobCompany}
                    onChange={(e) => setJobCompany(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Job Description*
                </label>
                <Textarea
                  placeholder="Paste the job description here..."
                  className="min-h-[200px]"
                  value={jobText}
                  onChange={(e) => {
                    setJobText(e.target.value);
                    setError('');
                  }}
                />
              </div>
              
              <Button 
                onClick={handleAddJob}
                className="w-full"
                variant="outline"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Job Description ({state.jobDescriptions.length}/5)
              </Button>
              
              {error && <p className="text-destructive text-sm">{error}</p>}
            </div>
            
            {state.jobDescriptions.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-4">Added Job Descriptions:</h3>
                <div className="space-y-3">
                  {state.jobDescriptions.map((job) => (
                    <div 
                      key={job.id} 
                      className="bg-muted/40 rounded-lg p-4 flex justify-between items-start"
                    >
                      <div>
                        <h4 className="font-medium">
                          {job.title || 'Untitled Position'}
                          {job.company && ` at ${job.company}`}
                        </h4>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {job.text}
                        </p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => removeJobDescription(job.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="border border-dashed border-gray-300 p-4 rounded-md bg-gray-50">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                <h4 className="font-medium text-sm">Enable AI-Powered Analysis</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                For more accurate skill extraction and analysis, enter your Gemini API key (optional):
              </p>
              <Input
                type="password"
                placeholder="Your Gemini API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-2">
                If no API key is provided, we'll use our standard analysis method.
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline"
            onClick={() => setFormStep(FormStep.RESUME)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={state.jobDescriptions.length !== 5 || state.isAnalyzing}
          >
            Continue <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default JobDescriptionUpload;
