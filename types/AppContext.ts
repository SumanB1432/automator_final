import { FormStep, Resume, JobDescription, Phase, UserProgress, Milestone, Quiz, Video } from '@/types';

export interface AppState {
  resume: Resume | null;
  jobDescriptions: JobDescription[];
  formStep: FormStep;
  resumeSkills: string[];
  jobSkills: string[];
  missingSkills: string[];
  learningPath: Phase[];
  userProgress: UserProgress;
  milestones: Milestone[];
  quizzes: Quiz[];
  isAnalyzing: boolean;
  isLoading: boolean;
}