'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { getDatabase, ref, get, set, update } from 'firebase/database';
import { Candidate } from '@/components/types/types';
import { onAuthStateChanged } from 'firebase/auth';
import app from '@/firebase/config';
import { auth } from '@/firebase/config';
import Link from 'next/link'; // Use next/link instead of lucide-react Link

export default function CandidatePage() {
  const { email: rawEmail } = useParams() as { email: string };
  const email = decodeURIComponent(rawEmail).toLowerCase();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [uid, setUid] = useState<string | null>(null); // Allow null to track unauthenticated state
  const db = getDatabase(app);

  const incrementCandidateView = useCallback(async () => {
    if (!uid) return; // Don't increment if no UID
    const usageRef = ref(db, `hr/${uid}/usage/metrics`);
    try {
      const snapshot = await get(usageRef);
      if (!snapshot.exists()) {
        await set(usageRef, {
          candidatesViewed: 1,
          matchesFound: 0,
          quotaLeft: 99,
        });
      } else {
        await update(usageRef, {
          candidatesViewed: snapshot.val().candidatesViewed + 1,
          quotaLeft: snapshot.val().quotaLeft - 1,
        });
      }
    } catch (error) {
      console.error('Failed to update candidate view metrics:', error);
    }
  }, [db, uid]);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is logged in, set UID
        setUid(user.uid);
      } else {
        // User is not logged in, redirect to login page
        window.location.href = '/hr/login';
        setLoading(false); // Stop loading if redirected
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Only fetch candidate if UID is set (user is authenticated)
    if (!uid) return;

    const fetchCandidate = async () => {
      try {
        const snapshot = await get(ref(db, 'talent_pool'));
        if (snapshot.exists()) {
          const candidatesObj: { [key: string]: Candidate } = snapshot.val();
          const found = Object.values(candidatesObj).find(
            (candidate) => candidate.email === email
          );
          setCandidate(found ?? null);
        } else {
          setCandidate(null);
        }
      } catch (err) {
        console.error('Failed to fetch candidate:', err);
        setCandidate(null);
      } finally {
        setLoading(false); // Only stop loading after fetch completes
      }
    };

    fetchCandidate();
  }, [email, uid, db]);

  useEffect(() => {
    if (candidate && uid) {
      incrementCandidateView();
    }
  }, [candidate, incrementCandidateView, uid]);

  if (loading) {
    return <p className="p-6 text-gray-500">Loading candidate...</p>;
  }

  if (!candidate) {
    return (
      <div className="p-6">
        <p className="text-red-500 mb-4">Candidate not found.</p>
        <Link href="/hr/talent_pool/search" className="text-blue-600 hover:underline">
          ← Back to Search
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md space-y-6 dark:bg-neutral-900">
      <div className="flex justify-between items-center text-white">
        <div>
          <h1 className="text-2xl font-bold">{candidate.name}</h1>
          <p className="text-sm">{candidate.jobTitle}</p>
          <p className="text-sm">{candidate.location}</p>
        </div>
        <div className="text-right text-sm text-white">
          <p>Score: {candidate.score}</p>
          <p>{candidate.experience} yrs exp</p>
        </div>
      </div>

      <div className="space-y-2 text-white">
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
            {candidate.skills?.map((skill) => (
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