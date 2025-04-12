"use client"
import { create } from "zustand";
import React from "react";
//change the personal data
type PersonalData = {
  name: string;
  headline: string;
  summary: string;
  profile: string;
  address: string;
  phone: string;
  email: string;
  skill: string;
  hobbie: string;
  language: string;
  twitter: string;
  linkedin: string;
  github: string;
  location: string;
  website: string;

};

type PersonalDataStore = {
  personalData: PersonalData;
  updatePersonalData: (name: string, value: string) => void;
};

export const usePersonalDataStore = create<PersonalDataStore>((set) => ({
  personalData: {
    name: "",
    headline: "",
    summary: "",
    profile: "",
    address: "",
    phone: "",
    email: "",
    skill: "",
    hobbie: "",
    language: "",
    twitter: "",
    linkedin: "",
    github: "",
    location: "",
    website: "",
    

  },
  updatePersonalData: (name, value) => {
    set((state) => ({
      personalData: {
        ...state.personalData,
        [name]: value,
      },
    }));
  },
}));

//change the project data
type Project = {
  id: string;
  name: string;
  description: string;
  date: string;
  website: string;
};

type ProjectStore = {
  projects: Project[];
  addProject: (name: string, description: string, date: string, website: string) => void;
  updateProject: (id: string, name: string, description: string, date: string, website: string) => void;
  deleteProject: (id: string) => void;
};

export const useProjectStore = create<ProjectStore>((set) => ({
  projects: [],

  addProject: (name, description, website, date) => {
    const newProject: Project = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9), // More unique ID
      name,
      description,
      website,
      date,
    };
    set((state) => ({
      projects: [...state.projects, newProject],
    }));
  },

  updateProject: (id, name, description, date, website) => {
    set((state) => ({
      projects: state.projects.map((project) =>
        project.id === id 
          ? { ...project, name, description, date, website } 
          : project
      ),
    }));
  },

  deleteProject: (id) => {
    set((state) => ({
      projects: state.projects.filter((project) => project.id !== id),
    }));
  },
}));

type Education = {
  id: string;
  institute: string;
  areaofstudy: string;
  typeofstudy: string;
  dateRange: string;
  score: string;
  location: string;
};

type EducationStore = {
  educations: Education[];
  addEducation: (institute: string, areaofstudy: string, typeofstudy: string, dateRange: string, score: string) => void;
  updateEducation: (id: string, institute: string, areaofstudy: string, typeofstudy: string, dateRange: string, score: string) => void;
  deleteEducation: (id: string) => void;
};

export const useEducationStore = create<EducationStore>((set) => ({
  educations: [],

  addEducation: (institute, areaofstudy, typeofstudy, dateRange, score) => {
    const newEducation: Education = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      institute,
      areaofstudy,
      typeofstudy,
      dateRange,
      score,
      location: "",
    };
    set((state) => ({
      educations: [...state.educations, newEducation],
    }));
  },

  updateEducation: (id, institute, areaofstudy, typeofstudy, dateRange, score) => {
    set((state) => ({
      educations: state.educations.map((education) =>
        education.id === id 
          ? { ...education, institute, areaofstudy, typeofstudy, dateRange, score } 
          : education
      ),
    }));
  },

  deleteEducation: (id) => {
    set((state) => ({
      educations: state.educations.filter((education) => education.id !== id),
    }));
  },
}));

//change the certificate data
type Certificate = {
  id: string;
  title: string;
  awarder: string;
  date: string;
  link: string;
};

type CertificateStore = {
  certificates: Certificate[];
  addCertificate: (title: string, awarder: string, date: string, link: string) => void;
  updateCertificate: (id: string, title: string, awarder: string, date: string, link: string) => void;
  deleteCertificate: (id: string) => void;
};

export const useCertificateStore = create<CertificateStore>((set) => ({
  certificates: [],

  addCertificate: (title, awarder, date, link) => {
    const newCertificate: Certificate = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9), // Unique ID
      title,
      awarder,
      date,
      link,
    };
    set((state) => ({
      certificates: [...state.certificates, newCertificate],
    }));
  },

  updateCertificate: (id, title, awarder, date, link) => {
    set((state) => ({
      certificates: state.certificates.map((certificate) =>
        certificate.id === id ? { ...certificate, title, awarder, date, link } : certificate
      ),
    }));
  },

  deleteCertificate: (id) => {
    set((state) => ({
      certificates: state.certificates.filter((certificate) => certificate.id !== id),
    }));
  },
}));

//change the work experience
type Experience = {
  id: string;
  company: string;
  position: string;
  dateRange: string;
  location: string;
  description: string;
};

type ExperienceStore = {
  experiences: Experience[];
  addExperience: (
    company: string,
    position: string,
    dateRange: string,
    location: string,
    description: string
  ) => void;
  updateExperience: (
    id: string,
    company: string,
    position: string,
    dateRange: string,
    location: string,
    description: string
  ) => void;
  deleteExperience: (id: string) => void;
};

export const useExperienceStore = create<ExperienceStore>((set) => ({
  experiences: [],

  addExperience: (company, position, dateRange, location, description) => {
    const newExperience: Experience = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9), // Unique ID
      company,
      position,
      dateRange,
      location,
      description,
    };
    set((state) => ({
      experiences: [...state.experiences, newExperience],
    }));
  },

  updateExperience: (id, company, position, dateRange, location, description) => {
    set((state) => ({
      experiences: state.experiences.map((experience) =>
        experience.id === id
          ? { ...experience, company, position, dateRange, location, description }
          : experience
      ),
    }));
  },

  deleteExperience: (id) => {
    set((state) => ({
      experiences: state.experiences.filter((experience) => experience.id !== id),
    }));
  },
}));

type Skill = {
  id: string;
  heading: string;
  items: string; // Ensure it's an array of strings
};

type SkillStore = {
  skills: Skill[];
  addSkill: (heading: string, items: string) => void;
  updateSkill: (id: string, heading: string, items: string) => void;
  deleteSkill: (id: string) => void;
};

export const useSkillStore = create<SkillStore>((set) => ({
  skills: [],

  addSkill: (heading, items) => {
    const newSkill: Skill = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9), // Unique ID
      heading,
      items,
    };
    set((state) => ({
      skills: [...state.skills, newSkill],
    }));
  },

  updateSkill: (id, heading, items) => {
    set((state) => ({
      skills: state.skills.map((skill) =>
        skill.id === id ? { ...skill, heading, items } : skill
      ),
    }));
  },

  deleteSkill: (id) => {
    set((state) => ({
      skills: state.skills.filter((skill) => skill.id !== id),
    }));
  },
}));

//change the achievements
type Achievement = {
  id: string;
  name: string;
  details: string;
};

type AchievementStore = {
  achievements: Achievement[];
  addAchievement: (name: string, details: string) => void;
  updateAchievement: (id: string, name: string, details: string) => void;
  deleteAchievement: (id: string) => void;
};

export const useAchievementStore = create<AchievementStore>((set) => ({
  achievements: [],

  addAchievement: (name, details) => {
    const newAchievement: Achievement = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9), // Unique ID
      name,
      details,
    };
    set((state) => ({
      achievements: [...state.achievements, newAchievement],
    }));
  },

  updateAchievement: (id, name, details) => {
    set((state) => ({
      achievements: state.achievements.map((achievement) =>
        achievement.id === id ? { ...achievement, name, details } : achievement
      ),
    }));
  },

  deleteAchievement: (id) => {
    set((state) => ({
      achievements: state.achievements.filter((achievement) => achievement.id !== id),
    }));
  },
}));
type Language = {
  id: string;
  heading: string;
  option: string;
};

type LanguageStore = {
  languages: Language[];
  addLanguage: (heading: string, option: string) => void;
  updateLanguage: (id: string, heading: string, option: string) => void;
  deleteLanguage: (id: string) => void;
};

export const useLanguageStore = create<LanguageStore>((set) => ({
  languages: [],

  addLanguage: (heading, option) => {
    const newLanguage: Language = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9), // Unique ID
      heading,
      option,
    };
    set((state) => ({
      languages: [...state.languages, newLanguage],
    }));
  },

  updateLanguage: (id, heading, option) => {
    set((state) => ({
      languages: state.languages.map((language) =>
        language.id === id ? { ...language, heading, option } : language
      ),
    }));
  },

  deleteLanguage: (id) => {
    set((state) => ({
      languages: state.languages.filter((language) => language.id !== id),
    }));
  },
}));

type fontSize = {
  sizeValue: number[];
  setsizeValue: (newValue: number[]) => void;
};
export const usefontSize = create<fontSize>((set) => ({
  sizeValue: [33], // Default value
  setsizeValue: (newValue) => set(() => ({ sizeValue: newValue })),
}));

//font weight
type fontWeight = {
  weightValue: number[];
  setweightValue: (newValue: number[]) => void;
};
export const usefontWeight = create<fontWeight>((set) => ({
  weightValue: [33], // Default value
  setweightValue: (newValue) => set(() => ({ weightValue: newValue })),
}));

//margin
type Margin = {
  marginValue: number[];
  setmarginValue: (newValue: number[]) => void;
};
export const useMargin = create<Margin>((set) => ({
  marginValue: [33], // Default value
  setmarginValue: (newValue) => set(() => ({ marginValue: newValue })),
}));

//font family
type fontFamily = {
  position: string;
  setPosition: (newPosition: string) => void;
};
export const usefontFamily = create<fontFamily>((set) => ({
  position: "top",
  setPosition: (newPosition) => set({ position: newPosition }),
}));

//template
// Define the type for the templates

type Template = {
  id: string;
  name: string;
  component: React.ReactNode;
};

type TemplateStore = {
  templates: Template[];
  activeTemplateId: string | null;
  setActiveTemplate: (id: string) => void;
};

export const useTemplateStore = create<TemplateStore>((set) => ({
  templates: [], // Initialize with no templates; add manually or dynamically
  activeTemplateId: null, // No active template initially

  setActiveTemplate: (id) => set({ activeTemplateId: id }),
}));

interface ThemeState {
  selectedFont: string;
  setSelectedFont: (font: string) => void;
  fontWeight: string; // e.g., '400', '700'
  setFontWeight: (weight: string) => void;
  fontStyle: string; // e.g., 'normal', 'italic'
  setFontStyle: (style: string) => void;
  fontSubset: string; // e.g., 'latin', 'cyrillic', 'greek'
  setFontSubset: (subset: string) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  lineHeight: number;
  setLineHeight: (height: number) => void;
  primaryColor: string;
  setPrimaryColor: (color: string) => void;
  backgroundColor: string;
  setBackgroundColor: (color: string) => void;
  hideIcons: boolean;
  setHideIcons: (hide: boolean) => void;
  underlineLinks: boolean;
  setUnderlineLinks: (underline: boolean) => void;
  selectedTemplate: string; // New state for selected template
  setSelectedTemplate: (template: string) => void; // Setter for selected template
}

export const useThemeStore = create<ThemeState>((set) => ({
  selectedFont: 'Open Sans',
  setSelectedFont: (font) => set({ selectedFont: font }),
  fontWeight: '400',
  setFontWeight: (weight) => set({ fontWeight: weight }),
  fontStyle: 'normal',
  setFontStyle: (style) => set({ fontStyle: style }),
  fontSubset: 'latin', // Default font subset
  setFontSubset: (subset) => set({ fontSubset: subset }),
  fontSize: 18,
  setFontSize: (size) => set({ fontSize: size }),
  lineHeight: 1.5,
  setLineHeight: (height) => set({ lineHeight: height }),
  primaryColor: '#565257',
  setPrimaryColor: (color) => set({ primaryColor: color }),
  backgroundColor: '#ffffff',
  setBackgroundColor: (color) => set({ backgroundColor: color }),
  hideIcons: false,
  setHideIcons: (hide) => set({ hideIcons: hide }),
  underlineLinks: true,
  setUnderlineLinks: (underline) => set({ underlineLinks: underline }),
  selectedTemplate: 'bonzor', // Use lowercase here
  setSelectedTemplate: (template) => set({ selectedTemplate: template.toLowerCase() }),
}));
