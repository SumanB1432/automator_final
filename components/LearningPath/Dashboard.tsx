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
    <div className="min-h-screen flex flex-col bg-[#11011E]">
      <div className="animate-slide-in px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl sm:text-3xl font-raleway font-bold text-[#ECF1F0]">
              Your AI Learning Roadmap
            </h2>
            <Sparkles className="h-6 w-6 text-amber-400" />
          </div>
          <p className="text-[#B6B6B6] font-inter text-sm sm:text-base mt-2">
            Based on AI-powered analysis of your resume and job requirements
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 pb-16">
          <div className="lg:col-span-2">
            <div className="space-y-6">
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
    </div>
  );
};

export default Dashboard;