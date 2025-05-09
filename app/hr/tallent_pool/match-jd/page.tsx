//src/match-jd/page.tsx
'use client';

import { useState } from 'react';
import { getFirestore } from 'firebase/firestore';
import { collection, getDocs, query } from 'firebase/firestore';
import { Candidate } from '@/components/types/types';
import { useRouter } from 'next/navigation';
import app from '@/firebase/config';

export default function MatchJDPage() {
  const [jdText, setJdText] = useState('');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const firestore = getFirestore(app)

  const handleJdSubmit = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Existing logic: Parse JD and match candidates
      const parsedResponsibilities = extractResponsibilitiesFromJd(jdText);
      const matchedCandidates = await fetchMatchedCandidates(parsedResponsibilities);
      setCandidates(matchedCandidates);

      // New logic: Send JD to Gemini API and navigate to SearchPage
      const filterValues = await parseJdWithGemini(jdText);
      // Encode filter values as query params
      const queryParams = new URLSearchParams({
        jobTitle: filterValues.jobTitle || '',
        education: filterValues.education || '',
        location: filterValues.location || '',
        skills: JSON.stringify(filterValues.skills || []),
        experienceRange: JSON.stringify(filterValues.experienceRange || [0, 10]),
      }).toString();
      router.push(`/hr/tallent_pool/search?${queryParams}`);
    } catch (err) {
      setError('Error while processing JD. Please try again later.');
      console.error('Error:', err);
    }
    setLoading(false);
  };
  

  const parseJdWithGemini = async (jdText: string) => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || 'your-api-key-here'; // Use env variable
      if (!apiKey) {
        throw new Error('Gemini API key is not configured');
      }
  
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Extract the following details from this job description in JSON format: jobTitle, education, location, skills (as an array), experienceRange (as an array of two numbers [min, max]). Return only the JSON object, without any Markdown or code blocks. JD: ${jdText}`,
                  },
                ],
              },
            ],
          }),
        }
      );
  
      if (!response.ok) {
        console.log('API Response:', await response.text());
        throw new Error('Gemini API request failed');
      }
  
      const result = await response.json();
      let extractedText = result.candidates[0].content.parts[0].text;
  
      // Clean the response to remove Markdown code blocks
      extractedText = extractedText
        .replace(/```json\n?/, '') // Remove opening ```json
        .replace(/```\n?/, '') // Remove closing ```
        .replace(/```/, '') // Remove any stray ```
        .trim(); // Remove leading/trailing whitespace
  
      // Parse the cleaned text as JSON
      const extracted = JSON.parse(extractedText);
      return {
        jobTitle: extracted.jobTitle || '',
        education: extracted.education || '',
        location: extracted.location || '',
        skills: extracted.skills || [],
        experienceRange: extracted.experienceRange || [0, 10],
      };
    } catch (err) {
      console.error('Gemini API error:', err);
      throw new Error('Failed to parse JD with Gemini API');
    }
  };
  const extractResponsibilitiesFromJd = (jdText: string) => {
    const responsibilityPattern = /•\s*([A-Za-z0-9\s,;.'-]+)/g;
    const responsibilities = [];
    let match;
    while ((match = responsibilityPattern.exec(jdText)) !== null) {
      responsibilities.push(match[1].toLowerCase());
    }
    return responsibilities;
  };

  const fetchMatchedCandidates = async (responsibilities: string[]) => {
    const q = query(collection(firestore, 'candidates'));
    const snapshot = await getDocs(q);

    const matched = snapshot.docs
      .map((doc) => {
        const candidateData = { id: doc.id, ...(doc.data() as Omit<Candidate, 'id'>) };
        const matchScore = responsibilities.filter((responsibility) =>
          candidateData.parsedText?.toLowerCase().includes(responsibility)
        ).length;
        return { ...candidateData, matchScore };
      })
      .filter((candidate) => candidate.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore);

    return matched;
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Match JD with Candidates</h1>
      <textarea
        className="w-full p-4 border rounded-md mb-4"
        placeholder="Enter Job Description or paste a JD text here..."
        value={jdText}
        onChange={(e) => setJdText(e.target.value)}
        rows={6}
      />
      <div className="mb-4">
        <button
          onClick={handleJdSubmit}
          className="bg-blue-600 text-white px-6 py-2 rounded-md"
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Match Candidates'}
        </button>
      </div>
      {error && <p className="text-red-500">{error}</p>}
      <div>
        {candidates.map((candidate) => (
            <div key={candidate.id} className="border p-4 rounded-md mb-4">
              <h2 className="font-bold text-xl">{candidate.name}</h2>
              <p>{candidate.jobTitle}</p>
              <p className="text-sm">{candidate.location}</p>
              <p>Match Score: {candidate.matchScore}</p>
              <button
                onClick={() => router.push(`/candidate/${candidate.email}`)}
                className="text-blue-600 hover:underline"
              >
                View Profile
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
}