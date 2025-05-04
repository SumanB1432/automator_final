'use client';

import { useState } from 'react';

type Props = {
  onSubmit: (jobDescription: string, recruiterSuggestion: string) => void;
};

export default function JobInputPanel({ onSubmit }: Props) {
  const [jobDescription, setJobDescription] = useState('');
  const [recruiterSuggestion, setRecruiterSuggestion] = useState('');

  const handleSubmit = () => {
    if (!jobDescription.trim()) {
      alert('Please enter a job description.');
      return;
    }
    onSubmit(jobDescription, recruiterSuggestion);
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-md space-y-4">
      <h2 className="text-xl font-bold">Job Details</h2>

      <div>
        <label className="block mb-1 font-medium">Job Description</label>
        <textarea
          rows={5}
          className="w-full p-3 border rounded-xl text-sm"
          placeholder="Paste the job description here..."
          value={jobDescription}
          onChange={e => setJobDescription(e.target.value)}
        />
      </div>

      <div>
        <label className="block mb-1 font-medium">Recruiter Suggestions (Optional)</label>
        <textarea
          rows={3}
          className="w-full p-3 border rounded-xl text-sm"
          placeholder="Any recruiter notes or suggestions..."
          value={recruiterSuggestion}
          onChange={e => setRecruiterSuggestion(e.target.value)}
        />
      </div>

      <button
        onClick={handleSubmit}
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-xl"
      >
        Submit Job Details
      </button>
    </div>
  );
}
