'use client';

import React from 'react';
import CandidateCard from './CandidateCard';
import { Candidate } from '../types/types';

interface CandidateListProps {
  candidates: Candidate[];
  onView: (email: string) => void;
  onEdit: (email: string) => void;
}

const CandidateList: React.FC<CandidateListProps> = ({ candidates, onView, onEdit }) => {
  return (
    <section className="space-y-4">
      {candidates.length === 0 ? (
        <p className="text-gray-500">Use filter to get candidates</p>
      ) : (
        candidates.map((candidate) => (
          <CandidateCard
            key={candidate.id}
            candidate={candidate}
            onView={() => onView(candidate.email)}
            onEdit={() => onEdit(candidate.email)}
          />
        ))
      )}
    </section>
  );
};

export default CandidateList;
