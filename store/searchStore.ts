import { create } from 'zustand';
import { Candidate } from '@/components/types/types';
import Fuse from 'fuse.js';

interface SearchState {
  candidates: Candidate[];
  filteredCandidates: Candidate[];
  jobTitle: string;
  education: string;
  location: string;
  skills: string[];
  experienceRange: [number, number];
  loading: boolean;
  error: string | null;
  setCandidates: (candidates: Candidate[]) => void;
  setFilteredCandidates: (candidates: Candidate[]) => void;
  setFilter: (filter: Partial<Omit<SearchState, 'candidates' | 'filteredCandidates' | 'loading' | 'error'>>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearFilters: () => void;
  applyFiltersFromJD: (filterValues: {
    jobTitle: string;
    education: string;
    location: string;
    skills: string[];
    experienceRange: [number, number];
  }) => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  candidates: [],
  filteredCandidates: [],
  jobTitle: '',
  education: '',
  location: '',
  skills: [],
  experienceRange: [0, 10],
  loading: true,
  error: null,
  setCandidates: (candidates) => set({ candidates }),
  setFilteredCandidates: (filteredCandidates) => set({ filteredCandidates }),
  setFilter: (filter) => set(filter),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearFilters: () =>
    set({
      jobTitle: '',
      education: '',
      location: '',
      skills: [],
      experienceRange: [0, 10],
      filteredCandidates: [],
    }),
  applyFiltersFromJD: (filterValues) =>
    set((state) => {
      const newState = {
        ...state,
        jobTitle: filterValues.jobTitle,
        education: filterValues.education,
        location: filterValues.location,
        skills: filterValues.skills,
        experienceRange: filterValues.experienceRange,
      };

      const fuseOptions = {
        keys: ['jobTitle', 'location', 'skills'], 
        threshold: 0.3,
        includeScore: true,
      };

      const fuse = new Fuse(state.candidates, fuseOptions);

      
      let result = [...state.candidates];
      
      if (filterValues.jobTitle.trim()) {
        const fuseResults = fuse.search(filterValues.jobTitle.trim());
        result = fuseResults.map(({ item }) => item);

      }
      if (filterValues.education.trim()) {
        // Split the education field by commas, considering different areas/fields
        const educationKeywords = filterValues.education
          .toLowerCase()
          .split(',')
          .map((keyword) => keyword.trim());

        // Apply fuzzy matching for each part of the education string
        result = result.filter((c) =>
          educationKeywords.some((keyword) =>
            c.education?.toLowerCase().includes(keyword) // check if each keyword matches part of the education field
          )
        );
      }
      if (filterValues.location.trim()) {
        const fuseResults = fuse.search(filterValues.location.trim());
        result = fuseResults.map(({ item }) => item);
      }

      if (filterValues.skills.length > 0) {
        let matchedSkillsCandidates: Candidate[] = [];

        // Check if any of the candidates have matching skills
        filterValues.skills.forEach((skill) => {
          const fuseResults = fuse.search(skill); // Search using the current skill
          const matchedItems = fuseResults.map(({ item }) => item); // Get the matched candidates

          matchedSkillsCandidates = [...matchedSkillsCandidates, ...matchedItems];
        });

        // Remove duplicates from the matched candidates
        matchedSkillsCandidates = [...new Set(matchedSkillsCandidates)];

        // If no candidates matched any skills, don't filter them out entirely, just keep the ones that match other filters
        if (matchedSkillsCandidates.length > 0) {
          result = result.filter((candidate) =>
            matchedSkillsCandidates.includes(candidate)
          );
        }
      }
      result = result.filter(
        (c) =>
          c.experience >= filterValues.experienceRange[0] &&
          c.experience <= filterValues.experienceRange[1]
      );
      return { ...newState, filteredCandidates: result };
    }),
}));