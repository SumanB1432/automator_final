// src/app/course/page.tsx
'use client';

import { useAppContext } from '@/context/AppContext';
import { FormStep } from '@/types/index';
import Welcome from '@/components/FormSteps/Welcome';
import ResumeUpload from '@/components/FormSteps/ResumeUpload';
import JobDescriptionUpload from '@/components/FormSteps/JobDescriptionUpload';
import Analyzing from '@/components/FormSteps/Analyzing';
import Dashboard from '@/components/LearningPath/Dashboard';

export default function CoursePage() {
  const { state } = useAppContext();
  const { formStep } = state;

  console.log('[CoursePage] Current formStep:', formStep);

  switch (formStep) {
    case FormStep.WELCOME:
      console.log('[CoursePage] Rendering Welcome');
      return <Welcome />;
    case FormStep.RESUME:
      console.log('[CoursePage] Rendering ResumeUpload');
      return <ResumeUpload />;
    case FormStep.JOB_DESCRIPTIONS:
      console.log('[CoursePage] Rendering JobDescriptionUpload');
      return <JobDescriptionUpload />;
    case FormStep.ANALYZING:
      console.log('[CoursePage] Rendering Analyzing');
      return <Analyzing />;
    case FormStep.RESULTS:
      console.log('[CoursePage] Rendering Dashboard');
      return <Dashboard />;
    default:
      console.warn('[CoursePage] Invalid formStep. Falling back to Welcome');
      return <Welcome />;
  }
}
