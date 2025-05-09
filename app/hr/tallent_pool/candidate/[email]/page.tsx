'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getFirestore } from 'firebase/firestore';
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
} from 'firebase/firestore';
import { Candidate } from '@/components/types/types';
import Link from 'next/link';
import app from '@/firebase/config';

export default function CandidatePage() {
  const { email: rawEmail } = useParams() as { email: string };
  const email = decodeURIComponent(rawEmail).toLowerCase();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const firestore = getFirestore(app)

  useEffect(() => {
    const fetchCandidate = async () => {
      try {
        const q = query(collection(firestore, 'candidates'), where('email', '==', email));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          const data = doc.data() as Omit<Candidate, 'id'>;
          const candidateData = { id: doc.id, ...data };
          setCandidate(candidateData);

          await incrementCandidateView();
        } else {
          console.warn('Candidate not found');
        }
      } catch (err) {
        console.error('Error fetching candidate:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidate();
  }, [email]);

  
  const incrementCandidateView = async () => {
    const recruiterId = 'demo_recruiter';

    const usageRef = doc(firestore, `recruiters/${recruiterId}/usage/summary`);

    try {
      const docSnap = await getDoc(usageRef);
      if (!docSnap.exists()) {
        await setDoc(usageRef, {
          candidatesViewed: 1,
          matchesFound: 0,
          quotaLeft: 99, 
        });
      } else {
        await updateDoc(usageRef, {
          candidatesViewed: increment(1),
          quotaLeft: increment(-1),
        });
      }
    } catch (error) {
      console.error('Failed to update candidate view metrics:', error);
    }
  };

  if (loading) return <p className="p-6 text-gray-500">Loading candidate...</p>;

  if (!candidate) {
    return (
      <div className="p-6">
        <p className="text-red-500 mb-4">Candidate not found.</p>
        <Link href="/hr/tallent_pool/search" className="text-blue-600 hover:underline">
          ← Back to Search
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md space-y-6 dark:bg-neutral-900">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{candidate.name}</h1>
          <p className="text-sm text-gray-500">{candidate.jobTitle}</p>
          <p className="text-sm text-gray-500">{candidate.location}</p>
        </div>
        <div className="text-right text-sm text-gray-400">
          <p>Score: {candidate.score}</p>
          <p>{candidate.experience} yrs exp</p>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm">
          <strong>Email:</strong> {candidate.email}
        </p>
        <p className="text-sm">
          <strong>Phone:</strong> {candidate.phone}
        </p>
        <p className="text-sm">
          <strong>Education:</strong> {candidate.education}
        </p>
        <div>
          <strong>Skills:</strong>
          <div className="flex flex-wrap gap-2 mt-1">
            {candidate.skills.map((skill) => (
              <span key={skill} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {candidate.resumeUrl && (
        <div className="mt-4">
          <a
            href={candidate.resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500"
          >
            View Resume PDF
          </a>
        </div>
      )}
    </div>
  );
}
