"use client";
import { useAppContext } from "@/context/AppContext";
import PhaseCard from "./PhaseCard";
import SkillGapSummary from "./SkillGapSummary";
import Milestones from "./Milestones";
import { Sparkles } from "lucide-react";
import { useEffect } from 'react';

const Dashboard = () => {
  const { state } = useAppContext();
  const { learningPath } = state;

  useEffect(() => {
    console.log('Dashboard component mounted, learningPath:', state.learningPath); // **Added**: Debug log
    console.log('Dashboard formStep:', state.formStep); // **Added**: Debug log
  }, [state.learningPath, state.formStep]);

  if (!state.learningPath.length) {
    console.warn('No learning path available, rendering fallback UI'); // **Added**: Debug log
    return <div>No learning path available. Please try analyzing again.</div>; // **Added**: Fallback UI
  }

  return (
    <div className="animate-slide-in">
      <div className="mb-8">
        <div className="flex items-center gap-2">
          <h2 className="text-3xl font-bold">Your AI Learning Roadmap</h2>
          <Sparkles className="h-6 w-6 text-amber-400" />
        </div>
        <p className="text-muted-foreground mt-1">
          Based on AI-powered analysis of your resume and job requirements
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-16">
        <div className="lg:col-span-2">
          <div className="space-y-8">
            {learningPath.map((phase) => (
              <PhaseCard key={phase.id} phase={phase} />
            ))}
          </div>
        </div>
        
        <div className="space-y-6">
          <SkillGapSummary />
          <Milestones />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;