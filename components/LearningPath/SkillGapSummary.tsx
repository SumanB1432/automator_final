"use client";
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAppContext } from '@/context/AppContext';
import { FileText, Briefcase, GraduationCap } from 'lucide-react';

const SkillGapSummary = () => {
  const { state } = useAppContext();
  const { resume, jobDescriptions, missingSkills } = state;
  
  const resumeSkills = resume?.skills || [];
  const jobSkills = jobDescriptions
    .flatMap(job => job.skills)
    .filter((skill, index, self) => self.indexOf(skill) === index); // Remove duplicates
  
return (
      <Card className="bg-white shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Skill Gap Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3 flex-shrink-0">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="font-medium mb-1">Your Resume Skills</h3>
              <div className="flex flex-wrap gap-1">
                {resumeSkills.length > 0 ? (
                  resumeSkills.map((skill, idx) => (
                    <Badge key={idx} variant="outline">{skill}</Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">No skills detected</span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3 flex-shrink-0">
              <Briefcase className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="font-medium mb-1">Required Job Skills</h3>
              <div className="flex flex-wrap gap-1">
                {jobSkills.length > 0 ? (
                  jobSkills.map((skill, idx) => (
                    <Badge key={idx} variant="outline">{skill}</Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">No skills detected</span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3 flex-shrink-0">
              <GraduationCap className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="font-medium mb-1">Skills to Learn</h3>
              <div className="flex flex-wrap gap-1">
                {missingSkills.length > 0 ? (
                  missingSkills.map((skill, idx) => (
                    <Badge key={idx}>{skill}</Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">No skill gaps detected</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
export default SkillGapSummary;
