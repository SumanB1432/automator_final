'use client';

import React from 'react';
import { Range } from 'react-range';
import { FilterSidebarProps } from '../types/types';


export default function FilterSidebar({
  jobTitle,
  education,
  location,
  skills,
  newSkill,
  experienceRange,
  setJobTitle,
  setEducation,
  setLocation,
  setNewSkill,
  setExperienceRange,
  addSkill,
  removeSkill,
  applyFilters,
  clearFilters,
}: FilterSidebarProps) {
  return (
    <aside className="bg-white p-4 rounded shadow h-fit space-y-4 text-black">
      <h2 className="text-lg font-semibold text-center">Filter Candidates</h2>

      <div className="space-y-2">
        <input
          type="text"
          placeholder="Job Title"
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Education"
          value={education}
          onChange={(e) => setEducation(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <div>
          <label className="block text-sm font-semibold text-gray-800">Skills</label>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <span
                key={index}
                className="bg-indigo-500 text-white px-3 py-1 rounded-full flex items-center"
              >
                {skill}
                <button
                  onClick={() => removeSkill(skill)}
                  className="ml-2 text-sm text-gray-200 hover:text-white"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
          <input
            type="text"
            placeholder="Type a skill and press Enter"
            className="w-full border p-2 rounded mt-2"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyDown={(e) => addSkill(e, newSkill)}
          />
        </div>

        {/* Experience Range */}
        <div>
          <label className="text-sm font-semibold">Experience (years)</label>
          <Range
            step={1}
            min={0}
            max={20}
            values={experienceRange}
            onChange={(values) => {
              setExperienceRange([values[0], values[1]]);
            }}
            renderTrack={({ props, children }) => (
              <div {...props} className="h-2 w-full bg-gray-200 rounded-full mt-2">
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
            renderThumb={({ props }) => (
              <div {...props} key={props.key} className="h-4 w-4 bg-indigo-500 rounded-full" />
            )}
          />
          <div className="flex justify-between text-sm text-gray-600">
            <span>{experienceRange[0]} yrs</span>
            <span>{experienceRange[1]} yrs</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 pt-4">
        <button
          onClick={applyFilters}
          className="w-full p-2 rounded-md bg-indigo-700 text-white hover:bg-indigo-500 shadow"
        >
          Apply Filters
        </button>
        <button
          onClick={clearFilters}
          className="w-full p-2 rounded-md bg-gray-200 text-black hover:bg-gray-300 shadow"
        >
          Clear
        </button>
      </div>
    </aside>
  );
}
