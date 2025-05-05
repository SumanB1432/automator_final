import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Candidate } from "@/types/candidate";

// Filter interface to manage candidate search filters
interface Filter {
  jobTitle: string;
  education: string;
  location: string;
  skills: string[];
  minExperience: string;
  maxExperience: string;
  minScore: string;
  maxScore: string;
}

interface CandidateStore {
  candidates: Candidate[];
  filteredCandidates: Candidate[];
  filters: Filter;
  availableSkills: string[];
  setCandidates: (candidates: Candidate[]) => void;
  clearCandidates: () => void;
  updateApproval: (id: string) => void;
  shortlistedCandidates: Candidate[];
  setShortlistedCandidates: (candidates: Candidate[]) => void;
  step: number;
  setStep: (step: number) => void;
  setFilters: (filters: Partial<Filter>) => void;
  clearFilters: () => void;
}

// Apply filters to candidates data
const applyFilters = (candidates: Candidate[], filters: Filter): Candidate[] => {
  return candidates.filter((candidate) => {
    const matchesJobTitle = filters.jobTitle
      ? candidate.jobTitle.toLowerCase().includes(filters.jobTitle.toLowerCase())
      : true;
    const matchesEducation = filters.education
      ? candidate.education.toLowerCase().includes(filters.education.toLowerCase())
      : true;
    const matchesLocation = filters.location
      ? candidate.location.toLowerCase().includes(filters.location.toLowerCase())
      : true;
    const matchesSkills = filters.skills.length
      ? filters.skills.every((skill) => candidate.skills.includes(skill))
      : true;
    const matchesExperience =
      (filters.minExperience
        ? candidate.experience >= +filters.minExperience
        : true) &&
      (filters.maxExperience
        ? candidate.experience <= +filters.maxExperience
        : true);
    const matchesScore =
      (filters.minScore ? candidate.score >= +filters.minScore : true) &&
      (filters.maxScore ? candidate.score <= +filters.maxScore : true);
    return (
      matchesJobTitle &&
      matchesEducation &&
      matchesLocation &&
      matchesSkills &&
      matchesExperience &&
      matchesScore
    );
  });
};

// Create store with persist
export const useCandidateStore = create<CandidateStore>()(
  persist(
    (set) => ({
      candidates: [],
      filteredCandidates: [],
      filters: {
        jobTitle: "",
        education: "",
        location: "",
        skills: [],
        minExperience: "",
        maxExperience: "",
        minScore: "",
        maxScore: "",
      },
      availableSkills: ["JavaScript", "Python", "React", "Node.js", "SQL"],
      setCandidates: (candidates) =>
        set((state) => ({
          candidates,
          filteredCandidates: applyFilters(candidates, state.filters),
        })),
      clearCandidates: () => set({ candidates: [], filteredCandidates: [] }),
      updateApproval: (id) =>
        set((state) => ({
          candidates: state.candidates.map((c) =>
            c.id === id ? { ...c, approved: !c.approved } : c
          ),
          filteredCandidates: state.filteredCandidates.map((c) =>
            c.id === id ? { ...c, approved: !c.approved } : c
          ),
        })),
      shortlistedCandidates: [],
      setShortlistedCandidates: (candidates) => set({ shortlistedCandidates: candidates }),
      step: 1,
      setStep: (step) => set({ step }),
      setFilters: (newFilters) =>
        set((state) => {
          const updatedFilters = { ...state.filters, ...newFilters };
          if (
            updatedFilters.minExperience &&
            updatedFilters.maxExperience &&
            +updatedFilters.minExperience > +updatedFilters.maxExperience
          ) {
            return state;
          }
          if (
            updatedFilters.minScore &&
            updatedFilters.maxScore &&
            +updatedFilters.minScore > +updatedFilters.maxScore
          ) {
            return state;
          }
          return {
            filters: updatedFilters,
            filteredCandidates: applyFilters(state.candidates, updatedFilters),
          };
        }),
      clearFilters: () =>
        set((state) => ({
          filters: {
            jobTitle: "",
            education: "",
            location: "",
            skills: [],
            minExperience: "",
            maxExperience: "",
            minScore: "",
            maxScore: "",
          },
          filteredCandidates: state.candidates,
        })),
    }),
    {
      name: "candidate-store", // LocalStorage key
    }
  )
);
