"use client"
import React from 'react';
import { Lightbulb } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { FormStep } from '@/types';

const Header = () => {
  const { state } = useAppContext();
  const { formStep, milestones } = state;
  
  const achievedMilestones = milestones.filter(m => m.isAchieved).length;
  const totalMilestones = milestones.length;
  const showProgress = formStep === FormStep.RESULTS;

  return (
    <header className="border-b py-4 px-6 bg-white">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center">
        <div className="flex items-center mb-4 sm:mb-0">
          <Lightbulb className="h-8 w-8 text-primary mr-2" />
          <h1 className="text-2xl font-bold text-gray-900">Resume to Roadmap</h1>
        </div>
        
        {showProgress && (
          <div className="text-sm text-gray-600">
            <div className="flex items-center">
              <span className="mr-2">Milestones:</span>
              <span className="font-medium text-primary">{achievedMilestones}</span>
              <span className="mx-1">/</span>
              <span>{totalMilestones}</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
