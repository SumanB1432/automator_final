export interface Candidate {
    id?: string;
    name?: string;
    email: string;
    phone?: string;
    location?: string;
    resumeUrl?: string;
    score: number;
    parsedText: string;
    skills: string[];
    experience: number;
    jobTitle: string;
    education: string;
    matchScore?: number;
  }

  export interface FilterSidebarProps {
    jobTitle: string;
    education: string;
    location: string;
    skills: string[];
    newSkill: string;
    experienceRange: [number, number];
  
    setJobTitle: (val: string) => void;
    setEducation: (val: string) => void;
    setLocation: (val: string) => void;
    setSkills: (val: string[]) => void;
    setNewSkill: (val: string) => void;
    setExperienceRange: (val: [number, number]) => void;
  
    addSkill: (e: React.KeyboardEvent<HTMLInputElement>, skill: string) => void;
    removeSkill: (skill: string) => void;
  
    applyFilters: () => void;
    clearFilters: () => void;
  }
  export interface Candidate {
  id?: string;
  name?: string;
  email: string;
  phone?: string;
  location?: string;
  resumeUrl?: string;
  score: number;
  parsedText: string;
  skills: string[];
  experience: number;
  jobTitle: string;
  education: string;
  matchScore?: number;
}

export interface Metrics {
  candidatesViewed: number;
  matchesFound: number;
  quotaLeft: number;
}
export interface FilterSidebarProps {
  jobTitle: string;
  education: string;
  location: string;
  skills: string[];
  newSkill: string;
  experienceRange: [number, number];

  setJobTitle: (val: string) => void;
  setEducation: (val: string) => void;
  setLocation: (val: string) => void;
  setSkills: (val: string[]) => void;
  setNewSkill: (val: string) => void;
  setExperienceRange: (val: [number, number]) => void;

  addSkill: (e: React.KeyboardEvent<HTMLInputElement>, skill: string) => void;
  removeSkill: (skill: string) => void;

  applyFilters: () => void;
  clearFilters: () => void;
}
  