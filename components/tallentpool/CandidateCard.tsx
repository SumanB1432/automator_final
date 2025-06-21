import React from "react";
import { Candidate } from "../types/types";

type Props = {
  candidate: Candidate;
  onView?: () => void;
  onEdit?: () => void;
};

export default function CandidateCard({ candidate, onView, onEdit }: Props) {
  return (
    <div className="border rounded-xl p-4 shadow-sm flex flex-col gap-2 bg-white text-white dark:bg-neutral-900">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">{candidate.name}</h3>
          <p className="text-sm">{candidate.jobTitle}</p>
          <p className="text-sm">{candidate.location}</p>
        </div>
        <div className="text-right text-sm text-gray-400">
          <p>Score: {candidate.score}</p>
          <p>{candidate.experience} yrs exp</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {candidate.skills?.slice(0, 6).map((skill) => (
          <span
            key={skill}
            className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-md"
          >
            {skill}
          </span>
        ))}
      </div>

      <div className="flex gap-2 mt-2">
        <button
          className="text-sm text-blue-600 hover:underline"
          onClick={onView}
        >
          View Resume
        </button>
        {onEdit && (
          <button
            className="text-sm text-gray-600 hover:underline"
            onClick={onEdit}
          >
            Edit Info
          </button>
        )}
      </div>
    </div>
  );
}