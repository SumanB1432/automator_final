// src/context/AppContext.tsx
"use client"
import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Resume, 
  JobDescription, 
  Phase, 
  UserProgress, 
  FormStep,
  Milestone,
  Quiz,
  Video
} from '@/types';
import { 
  extractSkillsFromText, 
  findSkillGaps, 
  createLearningPath,
  getMockVideosForSkill,
  analyzeWithGeminiAI,
  fetchEducationalVideos
} from '@/services/analysisService';

interface AppState {
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
}

const initialState: AppState = {
  resume: null,
  jobDescriptions: [],
  formStep: FormStep.WELCOME,
  resumeSkills: [],
  jobSkills: [],
  missingSkills: [],
  learningPath: [],
  userProgress: {
    currentPhaseId: '',
    completedSkills: [],
    completedVideos: [],
    completedQuizzes: [],
    achievedMilestones: []
  },
  milestones: [
    {
      id: 'milestone-1',
      name: 'Getting Started',
      description: 'Begin your learning journey',
      isAchieved: false,
      requirements: ['Upload resume', 'Add job descriptions']
    },
    {
      id: 'milestone-2',
      name: 'Foundation Builder',
      description: 'Complete all fundamental skills',
      isAchieved: false,
      requirements: ['Complete Phase 1']
    },
    {
      id: 'milestone-3',
      name: 'Skill Master',
      description: 'Complete all skills in your learning path',
      isAchieved: false,
      requirements: ['Complete all phases']
    }
  ],
  quizzes: [],
  isAnalyzing: false
};

type AppAction =
  | { type: 'SET_RESUME'; payload: string }
  | { type: 'ADD_JOB_DESCRIPTION'; payload: { id: string; text: string; title?: string; company?: string } }
  | { type: 'REMOVE_JOB_DESCRIPTION'; payload: string }
  | { type: 'SET_FORM_STEP'; payload: FormStep }
  | { type: 'START_ANALYSIS' }
  | { type: 'COMPLETE_ANALYSIS'; payload: { resumeSkills: string[], jobSkills: string[], missingSkills: string[], learningPath: Phase[] } }
  | { type: 'UPDATE_VIDEO_PROGRESS'; payload: { skillId: string; videoId: string; progress: number } }
  | { type: 'COMPLETE_VIDEO'; payload: { skillId: string; videoId: string } }
  | { type: 'COMPLETE_SKILL'; payload: string }
  | { type: 'UNLOCK_PHASE'; payload: string }
  | { type: 'COMPLETE_PHASE'; payload: string }
  | { type: 'ACHIEVE_MILESTONE'; payload: string }
  | { type: 'SET_SKILL_VIDEOS'; payload: { skillId: string; videos: Video[] } };

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_RESUME': {
      const skills = extractSkillsFromText(action.payload);
      return {
        ...state,
        resume: {
          text: action.payload,
          skills
        }
      };
    }
    
    case 'ADD_JOB_DESCRIPTION': {
      const { id, text, title, company } = action.payload;
      const skills = extractSkillsFromText(text);
      const newJobDescription: JobDescription = {
        id,
        text,
        title,
        company,
        skills
      };
      
      return {
        ...state,
        jobDescriptions: [...state.jobDescriptions, newJobDescription]
      };
    }
    
    case 'REMOVE_JOB_DESCRIPTION': {
      return {
        ...state,
        jobDescriptions: state.jobDescriptions.filter(job => job.id !== action.payload)
      };
    }
    
    case 'SET_FORM_STEP': {
      return {
        ...state,
        formStep: action.payload
      };
    }
    
    case 'START_ANALYSIS': {
      return {
        ...state,
        isAnalyzing: true
      };
    }
    
    case 'COMPLETE_ANALYSIS': {
      if (!state.resume) {
        return state;
      }
      const { resumeSkills, jobSkills, missingSkills, learningPath } = action.payload;
      const quizzes = learningPath.map(phase => ({
        id: `quiz-${phase.id}`,
        phaseId: phase.id,
        questions: [
          {
            id: `question-1-${phase.id}`,
            question: `Which of these is a key concept in ${phase.skills[0]?.name || 'this skill'}?`,
            options: ['Option A', 'Option B', 'Option C', 'Option D'],
            correctAnswerIndex: 1
          },
          {
            id: `question-2-${phase.id}`,
            question: `What is the primary advantage of using ${phase.skills[1]?.name || 'this skill'}?`,
            options: ['Option A', 'Option B', 'Option C', 'Option D'],
            correctAnswerIndex: 0
          },
          {
            id: `question-3-${phase.id}`,
            question: `How would you implement ${phase.skills[2]?.name || 'this skill'} in a real project?`,
            options: ['Option A', 'Option B', 'Option C', 'Option D'],
            correctAnswerIndex: 2
          }
        ],
        isUnlocked: phase.isUnlocked,
        isCompleted: false,
        passingScore: 70
      }));
      return {
        ...state,
        resumeSkills,
        jobSkills,
        missingSkills,
        learningPath,
        quizzes,
        userProgress: {
          ...state.userProgress,
          currentPhaseId: learningPath[0]?.id || ''
        },
        isAnalyzing: false,
        formStep: FormStep.RESULTS,
        milestones: state.milestones.map(milestone => 
          milestone.id === 'milestone-1' 
            ? { ...milestone, isAchieved: true } 
            : milestone
        )
      };
    }
    
    case 'UPDATE_VIDEO_PROGRESS': {
      const { skillId, videoId, progress } = action.payload;
      
      return {
        ...state,
        learningPath: state.learningPath.map(phase => ({
          ...phase,
          skills: phase.skills.map(skill => {
            if (skill.id !== skillId) return skill;
            
            return {
              ...skill,
              videos: skill.videos.map(video => {
                if (video.id !== videoId) return video;
                
                return {
                  ...video,
                  progress,
                  isCompleted: progress >= 90 || video.isCompleted
                };
              })
            };
          })
        }))
      };
    }
    
    case 'COMPLETE_VIDEO': {
      const { skillId, videoId } = action.payload;
      
      const newState = {
        ...state,
        learningPath: state.learningPath.map(phase => ({
          ...phase,
          skills: phase.skills.map(skill => {
            if (skill.id !== skillId) return skill;
            
            return {
              ...skill,
              videos: skill.videos.map(video => {
                if (video.id !== videoId) return video;
                
                return {
                  ...video,
                  progress: 100,
                  isCompleted: true
                };
              })
            };
          })
        })),
        userProgress: {
          ...state.userProgress,
          completedVideos: [...state.userProgress.completedVideos, videoId]
        }
      };
      
      const skillToCheck = newState.learningPath
        .flatMap(phase => phase.skills)
        .find(skill => skill.id === skillId);

      if (skillToCheck && skillToCheck.videos.every(video => video.isCompleted)) {
        return appReducer(newState, { type: 'COMPLETE_SKILL', payload: skillId });
      }
      
      return newState;
    }
    
    case 'COMPLETE_SKILL': {
      const skillId = action.payload;
      const newState = {
        ...state,
        learningPath: state.learningPath.map(phase => ({
          ...phase,
          skills: phase.skills.map(skill => {
            if (skill.id !== skillId) return skill;
            return {
              ...skill,
              isCompleted: true,
              videos: skill.videos.map(video => ({
                ...video,
                isCompleted: true,
                progress: 100
              }))
            };
          }),
        })),
        userProgress: {
          ...state.userProgress,
          completedSkills: [...state.userProgress.completedSkills, skillId],
          completedVideos: [
            ...state.userProgress.completedVideos,
            ...state.learningPath
              .flatMap(phase => phase.skills)
              .find(skill => skill.id === skillId)
              ?.videos
              .map(video => video.id) || []
          ]
        }
      };
      const updatedPath = newState.learningPath.map(phase => ({
        ...phase,
        progress: calculatePhaseProgress(phase.skills)
      }));
      for (const phase of updatedPath) {
        if (phase.skills.every(skill => skill.isCompleted) && !phase.isCompleted) {
          const phaseIndex = updatedPath.findIndex(p => p.id === phase.id);
          return {
            ...newState,
            learningPath: updatedPath.map((p, index) => {
              if (p.id === phase.id) {
                return { ...p, isCompleted: true };
              }
              if (index === phaseIndex + 1) {
                return { ...p, isUnlocked: true };
              }
              return p;
            }),
            quizzes: newState.quizzes.map(quiz => {
              if (quiz.phaseId === phase.id) {
                return { ...quiz, isUnlocked: true };
              }
              return quiz;
            }),
            milestones: newState.milestones.map(milestone => {
              if (
                milestone.id === 'milestone-2' && 
                phase.id === 'phase-1'
              ) {
                return { ...milestone, isAchieved: true };
              }
              if (
                milestone.id === 'milestone-3' && 
                phase.id === 'phase-3'
              ) {
                return { ...milestone, isAchieved: true };
              }
              return milestone;
            })
          };
        }
      }
      return {
        ...newState,
        learningPath: updatedPath
      };
    }
    
    case 'UNLOCK_PHASE': {
      const phaseId = action.payload;
      
      return {
        ...state,
        learningPath: state.learningPath.map(phase => {
          if (phase.id === phaseId) {
            return { ...phase, isUnlocked: true };
          }
          return phase;
        }),
        quizzes: state.quizzes.map(quiz => {
          if (quiz.phaseId === phaseId) {
            return { ...quiz, isUnlocked: true };
          }
          return quiz;
        })
      };
    }
    
    case 'COMPLETE_PHASE': {
      const phaseId = action.payload;
      
      const phaseIndex = state.learningPath.findIndex(phase => phase.id === phaseId);
      const nextPhaseIndex = phaseIndex + 1;
      
      return {
        ...state,
        learningPath: state.learningPath.map((phase, index) => {
          if (phase.id === phaseId) {
            return { ...phase, isCompleted: true };
          }
          if (index === nextPhaseIndex) {
            return { ...phase, isUnlocked: true };
          }
          return phase;
        }),
        userProgress: {
          ...state.userProgress,
          currentPhaseId: 
            nextPhaseIndex < state.learningPath.length 
              ? state.learningPath[nextPhaseIndex].id 
              : state.userProgress.currentPhaseId
        }
      };
    }
    
    case 'ACHIEVE_MILESTONE': {
      const milestoneId = action.payload;
      
      return {
        ...state,
        milestones: state.milestones.map(milestone => {
          if (milestone.id === milestoneId) {
            return { ...milestone, isAchieved: true };
          }
          return milestone;
        }),
        userProgress: {
          ...state.userProgress,
          achievedMilestones: [...state.userProgress.achievedMilestones, milestoneId]
        }
      };
    }
    
    case 'SET_SKILL_VIDEOS': {
      const { skillId, videos } = action.payload;
      return {
        ...state,
        learningPath: state.learningPath.map(phase => ({
          ...phase,
          skills: phase.skills.map(skill => {
            if (skill.id === skillId) {
              return { ...skill, videos };
            }
            return skill;
          })
        }))
      };
    }
    
    default:
      return state;
  }
};

const calculatePhaseProgress = (skills: any[]): number => {
  if (skills.length === 0) return 0;
  const completedSkills = skills.filter(skill => skill.isCompleted).length;
  return Math.round((completedSkills / skills.length) * 100);
};

interface AppContextProps {
  state: AppState;
  setResume: (text: string) => void;
  addJobDescription: (text: string, title?: string, company?: string) => void;
  removeJobDescription: (id: string) => void;
  setFormStep: (step: FormStep) => void;
  analyzeData: () => Promise<void>;
  updateVideoProgress: (skillId: string, videoId: string, progress: number) => void;
  completeVideo: (skillId: string, videoId: string) => void;
  completeSkill: (skillId: string) => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Define course-related routes
    const courseRoutes = [
      '/course',
      '/resume',
      '/resume/job-descriptions',
      '/resume/job-descriptions/dashboard'
    ];
    // Only trigger navigation for course-related routes
    if (courseRoutes.includes(pathname)) {
      switch (state.formStep) {
        case FormStep.WELCOME:
          router.push('/course');
          break;
        case FormStep.RESUME:
          router.push('/resume');
          break;
        case FormStep.JOB_DESCRIPTIONS:
        case FormStep.ANALYZING:
          router.push('/resume/job-descriptions');
          break;
        case FormStep.RESULTS:
          console.log('Navigating to /resume/job-descriptions/dashboard');
          router.push('/resume/job-descriptions/dashboard');
          break;
      }
    }
  }, [state.formStep, router, pathname]);

  const setResume = (text: string) => {
    dispatch({ type: 'SET_RESUME', payload: text });
  };

  const addJobDescription = (text: string, title?: string, company?: string) => {
    const id = `job-${Date.now()}`;
    dispatch({ 
      type: 'ADD_JOB_DESCRIPTION', 
      payload: { id, text, title, company } 
    });
  };

  const removeJobDescription = (id: string) => {
    dispatch({ type: 'REMOVE_JOB_DESCRIPTION', payload: id });
  };

  const setFormStep = (step: FormStep) => {
    console.log(`Setting formStep to: ${step}`);
    dispatch({ type: 'SET_FORM_STEP', payload: step });
  };

  const analyzeData = async () => {
    console.log('Starting analyzeData...');
    dispatch({ type: 'START_ANALYSIS' });
    
    if (!state.resume || state.jobDescriptions.length === 0) {
      console.error('Missing resume or job descriptions');
      dispatch({ type: 'SET_FORM_STEP', payload: FormStep.JOB_DESCRIPTIONS });
      return;
    }
    
    try {
      const jobDescriptionTexts = state.jobDescriptions.map(job => job.text);
      const analysisResult = await analyzeWithGeminiAI(
        state.resume.text,
        jobDescriptionTexts
      );

      // Create learning path
      let learningPath = createLearningPath(analysisResult.missingSkills);

      // Fetch videos for each skill
      learningPath = await Promise.all(
        learningPath.map(async (phase) => ({
          ...phase,
          skills: await Promise.all(
            phase.skills.map(async (skill) => ({
              ...skill,
              videos: await fetchEducationalVideos(skill.name),
            })),
          ),
        })),
      );

      console.log('Analysis complete:', { ...analysisResult, learningPath });

      dispatch({ 
        type: 'COMPLETE_ANALYSIS',
        payload: { ...analysisResult, learningPath }
      });

      console.log('State updated, formStep set to RESULTS');
    } catch (error) {
      console.error('Error during analysis:', error);
      
      const resumeSkills = state.resume ? extractSkillsFromText(state.resume.text) : [];
      const allJobSkills = state.jobDescriptions
        .flatMap(job => job.skills)
        .filter((skill, index, self) => self.indexOf(skill) === index);
      const missingSkills = findSkillGaps(resumeSkills, allJobSkills);
      
      // Create fallback learning path
      let learningPath = createLearningPath(missingSkills);
      learningPath = await Promise.all(
        learningPath.map(async (phase) => ({
          ...phase,
          skills: await Promise.all(
            phase.skills.map(async (skill) => ({
              ...skill,
              videos: await fetchEducationalVideos(skill.name),
            })),
          ),
        })),
      );

      dispatch({
        type: 'COMPLETE_ANALYSIS',
        payload: {
          resumeSkills,
          jobSkills: allJobSkills,
          missingSkills,
          learningPath
        }
      });
    }
  };

  const updateVideoProgress = (skillId: string, videoId: string, progress: number) => {
    dispatch({ 
      type: 'UPDATE_VIDEO_PROGRESS', 
      payload: { skillId, videoId, progress } 
    });
  };

  const completeVideo = (skillId: string, videoId: string) => {
    dispatch({ 
      type: 'COMPLETE_VIDEO', 
      payload: { skillId, videoId } 
    });
  };

  const completeSkill = (skillId: string) => {
    dispatch({ type: 'COMPLETE_SKILL', payload: skillId });
  };

  return (
    <AppContext.Provider
      value={{
        state,
        setResume,
        addJobDescription,
        removeJobDescription,
        setFormStep,
        analyzeData,
        updateVideoProgress,
        completeVideo,
        completeSkill,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};