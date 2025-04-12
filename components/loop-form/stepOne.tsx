/** @format */
"use client";
import { useState, useEffect } from "react";
import { FaBriefcase, FaMapMarkerAlt, FaClock, FaUserClock } from 'react-icons/fa';
import { commonJobRoles, validateJobTitle } from '@/data/jobRoles';

const StepOne = ({ formData , handleChange }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [validationError, setValidationError] = useState("");

  const handleJobTitleChange = (e:unknown) => {
    const value = e.target.value;
    handleChange(e);
    
    // Validate input
    const error = validateJobTitle(value);
    setValidationError(error || "");

    // Update suggestions
    if (value.length > 0) {
      const filtered = commonJobRoles.filter(role =>
        role.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion:unknown) => {
    handleChange({ target: { name: 'jobTitle', value: suggestion } });
    setShowSuggestions(false);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowSuggestions(false);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-8  rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-3">
        <FaBriefcase className="text-blue-500" />
        Step 1: Job Details
      </h2>
      <div className="space-y-6">
        {/* Job Title */}
        <div className="relative group">
          <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
            <FaBriefcase className="text-blue-500" />
            Job Title
          </label>
          <input
            name="jobTitle"
            placeholder="e.g. Senior Software Engineer, Product Manager"
            className="w-full p-3 border border-gray-600 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ease-in-out hover:border-blue-400"
            onChange={handleJobTitleChange}
            value={formData.jobTitle}
            required
          />
          {validationError && (
            <p className="text-sm text-red-500 mt-1">{validationError}</p>
          )}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="p-2 hover:bg-gray-700 cursor-pointer text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSuggestionClick(suggestion);
                  }}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Job Location */}
        <div className="relative group">
          <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
            <FaMapMarkerAlt className="text-blue-500" />
            Job Location
          </label>
          <input
            name="jobLocation"
            placeholder="e.g. New York, Remote, Hybrid - London"
            className="w-full p-3 border border-gray-600 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ease-in-out hover:border-blue-400"
            onChange={handleChange}
            value={formData.jobLocation}
            required
          />
          <p className="text-sm text-red-500 mt-1">{!formData.jobLocation && "Job location is required."}</p>
        </div>

        {/* Experience */}
        <div className="relative group">
          <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
            <FaUserClock className="text-blue-500" />
            Experience Required
          </label>
          <select
            name="experience"
            className="w-full p-3 border border-gray-600 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ease-in-out hover:border-blue-400 cursor-pointer"
            onChange={handleChange}
            value={formData.experience}
            required
          >
            <option value="">Select years of experience required</option>
            <option value="0-1 year">0-1 year</option>
            <option value="1-3 years">1-3 years</option>
            <option value="3-5 years">3-5 years</option>
            <option value="5+ years">5+ years</option>
          </select>
          <p className="text-sm text-red-500 mt-1">{!formData.experience && "Experience level is required."}</p>
        </div>

        {/* Job Type */}
        <div className="relative group">
          <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
            <FaClock className="text-blue-500" />
            Employment Type
          </label>
          <select
            name="jobType"
            className="w-full p-3 border border-gray-600 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ease-in-out hover:border-blue-400 cursor-pointer"
            onChange={handleChange}
            value={formData.jobType}
            required
          >
            <option value="">Select employment type</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Internship">Internship</option>
          </select>
          <p className="text-sm text-red-500 mt-1">{!formData.jobType && "Employment type is required."}</p>
        </div>
      </div>
    </div>
  );
};

export default StepOne;