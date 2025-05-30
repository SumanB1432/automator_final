"use client";
import { Button } from '@/components/ui/buttoncourse';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/cardforCourse';
import { useAppContext } from '@/context/AppContext';
import { FormStep } from '@/types/index';
import { FileText, Briefcase, BookOpen, ChevronRight } from 'lucide-react';

const Welcome = () => {
  const { setFormStep } = useAppContext();
  
  return (
     <div className="max-w-4xl mx-auto animate-fade-in">
      <Card className="bg-white shadow-lg border-0 overflow-hidden">
        <CardHeader className="bg-primary text-primary-foreground text-center py-8">
          <CardTitle className="text-3xl font-bold">Welcome to Resume to Roadmap</CardTitle>
          <CardDescription className="text-primary-foreground/90 text-lg mt-2">
            Transform your resume into a personalized learning path
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-8 px-8">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center text-center p-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">Upload Your Resume</h3>
              <p className="text-muted-foreground text-sm">
                We'll analyze your current skills and experience
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center p-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">Add Job Descriptions</h3>
              <p className="text-muted-foreground text-sm">
                Tell us about the roles you're aiming for
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center p-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">Get Your Roadmap</h3>
              <p className="text-muted-foreground text-sm">
                Receive a personalized learning path to achieve your goals
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-muted/50 p-6 flex justify-center">
          <Button 
            size="lg" 
            className="px-8 py-6 text-lg"
            onClick={() => setFormStep(FormStep.RESUME)}
          >
            Get Started <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        </CardFooter>
      </Card>
      
      <div className="mt-8 text-center text-muted-foreground text-sm">
        <p>Your data is securely processed and not shared with third parties.</p>
      </div>
    </div>
  );
};

export default Welcome;