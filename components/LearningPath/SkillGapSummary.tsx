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
       <div className="flex flex-col bg-[#11011E]">
      <Card className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg sm:text-xl ml-7 mt-7 font-raleway font-bold text-[#ECF1F0]">
            Skill Gap Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="h-8 w-8 rounded-full bg-[rgba(15,174,150,0.1)] flex items-center justify-center mr-3 flex-shrink-0">
                <FileText className="h-4 w-4 text-[#0FAE96]" />
                <span className="sr-only">Resume Skills Icon</span>
              </div>
              <div>
                <h3 className="font-raleway font-semibold text-base text-[#ECF1F0] mb-1">
                  Your Resume Skills
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {resumeSkills.length > 0 ? (
                    resumeSkills.map((skill, idx) => (
                      <Badge key={idx} className="border-[rgba(255,255,255,0.05)] text-[#B6B6B6] font-inter text-xs">
                        {skill}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-[#B6B6B6] font-inter">
                      No skills detected
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-start">
              <div className="h-8 w-8 rounded-full bg-[rgba(15,174,150,0.1)] flex items-center justify-center mr-3 flex-shrink-0">
                <Briefcase className="h-4 w-4 text-[#0FAE96]" />
                <span className="sr-only">Job Skills Icon</span>
              </div>
              <div>
                <h3 className="font-raleway font-semibold text-base text-[#ECF1F0] mb-1">
                  Required Job Skills
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {jobSkills.length > 0 ? (
                    jobSkills.map((skill, idx) => (
                      <Badge key={idx} className="border-[rgba(255,255,255,0.05)] text-[#B6B6B6] font-inter text-xs">
                        {skill}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-[#B6B6B6] font-inter">
                      No skills detected
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-start">
              <div className="h-8 w-8 rounded-full bg-[rgba(15,174,150,0.1)] flex items-center justify-center mr-3 flex-shrink-0">
                <GraduationCap className="h-4 w-4 text-[#0FAE96]" />
                <span className="sr-only">Skills to Learn Icon</span>
              </div>
              <div>
                <h3 className="font-raleway font-semibold text-base text-[#ECF1F0] mb-1">
                  Skills to Learn
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {missingSkills.length > 0 ? (
                    missingSkills.map((skill, idx) => (
                      <Badge key={idx} className="bg-[#0FAE96] text-white font-inter text-xs">
                        {skill}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-[#B6B6B6] font-inter">
                      No skill gaps detected
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
export default SkillGapSummary;
