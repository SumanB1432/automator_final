'use client';

import { useState, useEffect } from 'react';
import { getFirestore } from 'firebase/firestore';
import { collection, getDocs, query, updateDoc, where, doc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Candidate } from '@/components/types/types';
import { use } from 'react';  // Make sure to import 'use'
import app from '@/firebase/config';

type CandidateEditProps = {
  params: Promise<{ email: string }>;  // Make sure params is a Promise
};

export default function CandidateEdit({ params }: CandidateEditProps) {
  // Unwrap the params using React.use()
  const { email } = use(params); // Use 'use' to access the value

  const normalizedEmail = decodeURIComponent(email).toLowerCase(); // Normalize email
  const router = useRouter();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const firestore = getFirestore(app)

  useEffect(() => {
    const fetchCandidate = async () => {
      try {
        const q = query(collection(firestore, 'candidates'), where('email', '==', normalizedEmail));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const docSnap = snapshot.docs[0];
          const data = docSnap.data();
          setCandidate({
            id: docSnap.id,
            name: data.name || '',
            email: data.email || '',
            location: data.location || '',
            score: data.score || 0,
            parsedText: data.parsedText || '',
            skills: data.skills || [],
            experience: data.experience || 0,
            jobTitle: data.jobTitle || '',
            education: data.education || '',
            matchScore: data.matchScore || 0,
            phone: data.phone || '',
            resumeUrl: data.resumeUrl || '',
          });
        } else {
          setError('Candidate not found');
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load candidate');
      } finally {
        setLoading(false);
      }
    };

    fetchCandidate();
  }, [normalizedEmail]);

  const handleSave = async () => {
    if (candidate && candidate.id) {
      try {
        const docRef = doc(firestore, 'candidates', candidate.id);
        await updateDoc(docRef, {
          name: candidate.name,
          jobTitle: candidate.jobTitle,
          location: candidate.location,
          skills: candidate.skills,
          experience: candidate.experience,
          education: candidate.education,
        });
        router.push(`/hr/tallent_pool/candidate/${encodeURIComponent(candidate.email)}`); // Safe redirect
      } catch (err) {
        console.error(err);
        setError('Failed to save changes');
      }
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Edit Candidate</h1>
      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="w-1/2">
            <label className="block text-sm font-medium">Name</label>
            <input
              type="text"
              value={candidate?.name || ''}
              onChange={(e) => setCandidate({ ...candidate!, name: e.target.value })}
              className="w-full border p-2 rounded"
            />
          </div>

          <div className="w-1/2">
            <label className="block text-sm font-medium">Job Title</label>
            <input
              type="text"
              value={candidate?.jobTitle || ''}
              onChange={(e) => setCandidate({ ...candidate!, jobTitle: e.target.value })}
              className="w-full border p-2 rounded"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Location</label>
          <input
            type="text"
            value={candidate?.location || ''}
            onChange={(e) => setCandidate({ ...candidate!, location: e.target.value })}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Education</label>
          <input
            type="text"
            value={candidate?.education || ''}
            onChange={(e) => setCandidate({ ...candidate!, education: e.target.value })}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Experience (years)</label>
          <input
            type="number"
            value={candidate?.experience || 0}
            onChange={(e) => setCandidate({ ...candidate!, experience: Number(e.target.value) })}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Skills (comma separated)</label>
          <input
            type="text"
            value={candidate?.skills?.join(', ') || ''}
            onChange={(e) =>
              setCandidate({ ...candidate!, skills: e.target.value.split(',').map((s) => s.trim()) })
            }
            className="w-full border p-2 rounded"
          />
        </div>

        <button
          onClick={handleSave}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-500"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
