import React, { useState, useCallback } from "react";
import { useCandidateStore } from "@/store/useCandidateStore";
import { Range } from "react-range";
import { debounce } from "lodash";

interface FilterModalFormProps {
  onClose: () => void;
}

const FilterModalForm: React.FC<FilterModalFormProps> = ({ onClose }) => {
  const { filters, setFilters, clearFilters } = useCandidateStore();

  const [jobTitle, setJobTitle] = useState(filters.jobTitle || "");
  const [education, setEducation] = useState(filters.education || "");
  const [location, setLocation] = useState(filters.location || "");
  const [skills, setSkills] = useState(filters.skills.join(", ") || "");
  const [experienceRange, setExperienceRange] = useState<number[]>([
    Number(filters.minExperience) || 0,
    Number(filters.maxExperience) || 10,
  ]);
  const [scoreRange, setScoreRange] = useState<number[]>([
    Number(filters.minScore) || 0,
    Number(filters.maxScore) || 100,
  ]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const debouncedSetExperienceRange = useCallback(
    debounce((values: number[]) => setExperienceRange(values), 100),
    []
  );
  const debouncedSetScoreRange = useCallback(
    debounce((values: number[]) => setScoreRange(values), 100),
    []
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const skillsArray = skills
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s);
    if (skills && skillsArray.length === 0) {
      setError("Please enter valid skills separated by commas.");
      return;
    }

    setIsSubmitting(true);
    try {
      setFilters({
        jobTitle,
        education,
        location,
        skills: skillsArray,
        minExperience: String(experienceRange[0]),
        maxExperience: String(experienceRange[1]),
        minScore: String(scoreRange[0]),
        maxScore: String(scoreRange[1]),
      });
      onClose();
    } catch (err) {
      setError(`Failed to apply filters. Please try again. ${err}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = () => {
    setJobTitle("");
    setEducation("");
    setLocation("");
    setSkills("");
    setExperienceRange([0, 10]);
    setScoreRange([0, 100]);
    setError(null);
    clearFilters();
  };

  return (
    <div className="absolute left-0 top-0 h-full w-80 bg-white shadow-2xl p-6 z-50">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 transition duration-200"
        aria-label="Close modal"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <form onSubmit={handleSubmit} className="space-y-6">
        <h2 className="text-2xl font-extrabold text-gray-900 text-center">Filter Candidates</h2>

        {error && (
          <div className="text-red-500 text-sm bg-red-50 p-2 rounded-xl" role="alert">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="jobTitle" className="block text-sm font-semibold text-gray-800">
            Job Title
          </label>
          <input
            id="jobTitle"
            type="text"
            className="w-full p-3 text-gray-900 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 shadow-sm"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="e.g., Software Engineer"
            aria-describedby="jobTitle"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="education" className="block text-sm font-semibold text-gray-800">
            Education
          </label>
          <input
            id="education"
            type="text"
            className="w-full p-3 text-gray-900 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 shadow-sm"
            value={education}
            onChange={(e) => setEducation(e.target.value)}
            placeholder="e.g., Bachelor's in Computer Science"
            aria-describedby="education"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="location" className="block text-sm font-semibold text-gray-800">
            Location
          </label>
          <input
            id="location"
            type="text"
            className="w-full p-3 text-gray-900 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 shadow-sm"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g., New York, NY"
            aria-describedby="location"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="skills" className="block text-sm font-semibold text-gray-800">
            Skills (comma-separated)
          </label>
          <input
            id="skills"
            type="text"
            className="w-full p-3 text-gray-900 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 shadow-sm"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            placeholder="e.g., JavaScript, Python, React"
            aria-describedby="skills"
          />
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-800">Experience Range (in years)</label>
          <Range
            step={1}
            min={0}
            max={20}
            values={experienceRange}
            onChange={debouncedSetExperienceRange}
            renderTrack={({ props, children }) => (
              <div
                {...props}
                className="h-2 w-full bg-gray-200 rounded-full"
                style={{ marginTop: "8px" }}
              >
                <div
                  className="h-2 bg-indigo-500 rounded-full"
                  style={{
                    width: `${((experienceRange[1] - experienceRange[0]) / 20) * 100}%`,
                    marginLeft: `${(experienceRange[0] / 20) * 100}%`,
                  }}
                />
                {children}
              </div>
            )}
            renderThumb={({ props, index }) => (
              <div
                {...props}
                className="h-5 w-5 bg-indigo-500 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                role="slider"
                aria-label={`Experience ${index === 0 ? "minimum" : "maximum"}`}
                aria-valuemin={0}
                aria-valuemax={20}
                aria-valuenow={experienceRange[index]}
                tabIndex={0}
              />
            )}
          />
          <div className="flex justify-between text-sm text-gray-600">
            <span>{experienceRange[0]} yrs</span>
            <span>{experienceRange[1]} yrs</span>
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-800">Score Range</label>
          <Range
            step={1}
            min={0}
            max={100}
            values={scoreRange}
            onChange={debouncedSetScoreRange}
            renderTrack={({ props, children }) => (
              <div
                {...props}
                className="h-2 w-full bg-gray-200 rounded-full"
                style={{ marginTop: "8px" }}
              >
                <div
                  className="h-2 bg-indigo-500 rounded-full"
                  style={{
                    width: `${((scoreRange[1] - scoreRange[0]) / 100) * 100}%`,
                    marginLeft: `${(scoreRange[0] / 100) * 100}%`,
                  }}
                />
                {children}
              </div>
            )}
            renderThumb={({ props, index }) => (
              <div
                {...props}
                className="h-5 w-5 bg-indigo-500 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                role="slider"
                aria-label={`Score ${index === 0 ? "minimum" : "maximum"}`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={scoreRange[index]}
                tabIndex={0}
              />
            )}
          />
          <div className="flex justify-between text-sm text-gray-600">
            <span>{scoreRange[0]}</span>
            <span>{scoreRange[1]}</span>
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <button
            type="submit"
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-5 py-2 rounded-xl disabled:bg-indigo-400 transition duration-200 shadow-md"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Applying..." : "Apply Filters"}
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-5 py-2 rounded-xl disabled:bg-gray-100 transition duration-200 shadow-md"
            disabled={isSubmitting}
          >
            Clear
          </button>
        </div>
      </form>
    </div>
  );
};

export default FilterModalForm;