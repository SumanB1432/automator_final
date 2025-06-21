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


      let result = [...state.candidates];
      //Changes for JobTitle 
      // ✅ Job Title Filter (manual AND match of cleaned keywords)
      if (filterValues.jobTitle.trim()) {
        const cleaned = filterValues.jobTitle
          .toLowerCase()
          .replace(/\band\b/g, '')
          .replace(/[^a-z\s]/g, '')
          .replace(/\s+/g, ' ')
          .trim();

        const words = cleaned.split(' ');

        result = result.filter((candidate) => {
          const title = candidate.jobTitle?.toLowerCase() || '';
          return words.every((word) => title.includes(word));
        });
      }
      // ✅ Education Filter
      if (filterValues.education.trim()) {
        const educationKeywords = filterValues.education
          .toLowerCase()
          .split(',')
          .map((keyword) => keyword.trim());

        result = result.filter((c) =>
          educationKeywords.some((keyword) =>
            c.education?.toLowerCase().includes(keyword)
          )
        );
      }
      // ✅ Location Filter (fuzzy)
      if (filterValues.location.trim()) {
        const fuse = new Fuse(result, {
          keys: ['location'],
          threshold: 0.3,
          includeScore: true,
        });
        const fuseResults = fuse.search(filterValues.location.trim());
        result = fuseResults.map(({ item }) => item);
      }

      // ✅ Skills Filter (fuzzy)
      if (filterValues.skills.length > 0) {
        const fuse = new Fuse(result, {
          keys: ['skills'],
          threshold: 0.3,
          includeScore: true,
        });

        let matchedSkillsCandidates: Candidate[] = [];

        filterValues.skills.forEach((skill) => {
          const fuseResults = fuse.search(skill);
          const matchedItems = fuseResults.map(({ item }) => item);
          matchedSkillsCandidates = [...matchedSkillsCandidates, ...matchedItems];
        });

        // Remove duplicates
        matchedSkillsCandidates = [...new Set(matchedSkillsCandidates)];

        // Apply skills match filter if matches found
        if (matchedSkillsCandidates.length > 0) {
          result = result.filter((candidate) =>
            matchedSkillsCandidates.includes(candidate)
          );
        }
      }

      // ✅ Experience Filter
      result = result.filter(
        (c) =>
          c.experience >= filterValues.experienceRange[0] &&
          c.experience <= filterValues.experienceRange[1]
      );

      return {
        ...newState,
        filteredCandidates: result,
      };
    }),
}));