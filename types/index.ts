
// Resume and Job Description types
export interface Resume {
  text: string;
  skills: string[];
}

export interface JobDescription {
  id: string;
  text: string;
  title?: string;
  company?: string;
  skills: string[];
}

// Learning path types
export interface Skill {
  id: string;
  name: string;
  description?: string;
  videos: Video[];
  isCompleted: boolean;
}

export interface Video {
  id: string;
  title: string;
  url: string;
  thumbnailUrl: string;
  duration: string;
  viewCount: number;
  progress: number; // 0-100
  isCompleted: boolean;
}

export interface Phase {
  id: string;
  name: string;
  description?: string;
  skills: Skill[];
  isUnlocked: boolean;
  isCompleted: boolean;
  progress: number; // 0-100
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
  isAchieved: boolean;
  requirements: string[];
}

export interface Quiz {
  id: string;
  phaseId: string;
  questions: QuizQuestion[];
  isUnlocked: boolean;
  isCompleted: boolean;
  score?: number;
  passingScore: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  selectedAnswerIndex?: number;
}

// App state types
export interface UserProgress {
  currentPhaseId: string;
  completedSkills: string[];
  completedVideos: string[];
  completedQuizzes: string[];
  achievedMilestones: string[];
}

// Multi-step form state
export enum FormStep {
  WELCOME = 'welcome',
  RESUME = 'resume',
  JOB_DESCRIPTIONS = 'jobDescriptions',
  ANALYZING = 'analyzing',
  RESULTS = 'results'
}
