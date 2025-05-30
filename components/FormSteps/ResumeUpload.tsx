
"use client";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/cardforCourse';
import { Textarea } from '@/components/ui/textarea';
import { useAppContext } from '@/context/AppContext';
import { FormStep } from '@/types/index';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const ResumeUpload = () => {
  const { state, setResume, setFormStep } = useAppContext();
  const [resumeText, setResumeText] = useState(state.resume?.text || '');
  const [error, setError] = useState('');

  const handleSubmit = () => {
  if (!resumeText.trim()) {
    setError('Please paste your resume text');
    return;
  }
  
  setResume(resumeText);
  setFormStep(FormStep.JOB_DESCRIPTIONS); // This will trigger navigation to /resume/job-descriptions
};

 return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <Card className="bg-white shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl">Upload Your Resume</CardTitle>
          <CardDescription>
            Copy and paste the text from your resume in the field below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Textarea
                placeholder="Paste your resume text here..."
                className="min-h-[300px] text-base"
                value={resumeText}
                onChange={(e) => {
                  setResumeText(e.target.value);
                  setError('');
                }}
              />
              {error && <p className="text-destructive text-sm">{error}</p>}
            </div>
            
            <div className="bg-muted/50 p-4 rounded-md">
              <h4 className="font-medium mb-2">Tips for best results:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Include all relevant technical skills and technologies</li>
                <li>• Add certifications and education details</li>
                <li>• Mention projects you've worked on and your role</li>
              </ul>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline"
            onClick={() => setFormStep(FormStep.WELCOME)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <Button onClick={handleSubmit}>
            Continue <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ResumeUpload;
