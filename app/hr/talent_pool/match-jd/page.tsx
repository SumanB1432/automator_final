'use client';

import { useState, useCallback } from 'react';
import { getDatabase, ref, get } from 'firebase/database';
import { Candidate } from '@/components/types/types';
import { useRouter } from 'next/navigation';
import app from '@/firebase/config';

export default function MatchJDPage() {
  const [jdText, setJdText] = useState('');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const db = getDatabase(app);

  const parseJdWithGemini = useCallback(async (jdText: string) => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || 'your-api-key-here';
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

      extractedText = extractedText
        .replace(/```json\n?/, '')
        .replace(/```\n?/, '')
        .replace(/```/, '')
        .trim();

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
  }, []);

  const extractResponsibilitiesFromJd = useCallback((jdText: string) => {
    const responsibilityPattern = /•\s*([A-Za-z0-9\s,;.'-]+)/g;
    const responsibilities = [];
    let match;
    while ((match = responsibilityPattern.exec(jdText)) !== null) {
      responsibilities.push(match[1].toLowerCase());
    }
    return responsibilities;
  }, []);

  const fetchMatchedCandidates = useCallback(async (responsibilities: string[]) => {
    try {
      const snapshot = await get(ref(db, 'talent_pool'));
      if (snapshot.exists()) {
        const candidatesObj: { [key: string]: Candidate } = snapshot.val();
        const matched = Object.entries(candidatesObj)
          .map(([id, candidateData]) => {
            console.log(candidateData, "data")
            const matchScore = responsibilities.filter((responsibility) =>
              candidateData.parsedText?.toLowerCase().includes(responsibility.toLowerCase())
            ).length;

            return { ...candidateData, id, matchScore };
          })
          .filter((candidate) => candidate.matchScore > 0)
          .sort((a, b) => b.matchScore - a.matchScore);
        return matched;
      }
      return [];
    } catch (err) {
      console.error('Error fetching candidates:', err);
      throw new Error('Failed to fetch candidates');
    }
  }, [db]);

  const handleJdSubmit = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const parsedResponsibilities = extractResponsibilitiesFromJd(jdText);
      const matchedCandidates = await fetchMatchedCandidates(parsedResponsibilities);
      setCandidates(matchedCandidates);

      const filterValues = await parseJdWithGemini(jdText);
      const queryParams = new URLSearchParams({
        jobTitle: filterValues.jobTitle || '',
        education: filterValues.education || '',
        location: filterValues.location || '',
        skills: JSON.stringify(filterValues.skills || []),
        experienceRange: JSON.stringify(filterValues.experienceRange || [0, 10]),
      }).toString();
      router.push(`/hr/talent_pool/search?${queryParams}`);
    } catch (err) {
      setError('Error while processing JD. Please try again later.');
      console.error('Error:', err);
    }
    setLoading(false);
  }, [jdText, router, parseJdWithGemini, extractResponsibilitiesFromJd, fetchMatchedCandidates]);

  return (
    <div className="container mx-auto px-6 py-8 bg-[#11011E] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#7000FF]/10 to-[#FF00C7]/10 opacity-20 blur-[180px] -z-10" />
      <h1 className="text-3xl md:text-4xl font-raleway font-extrabold text-[#ECF1F0] mb-6 tracking-tight">Match JD with Candidates</h1>
      <textarea
        className="w-full p-4 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded-lg text-[#B6B6B6] font-inter text-base focus:outline-none focus:ring-2 focus:ring-[#0FAE96] focus:border-transparent transition-all duration-200 mb-6 shadow-sm hover:shadow-md"
        placeholder="Enter Job Description or paste a JD text here..."
        value={jdText}
        onChange={(e) => setJdText(e.target.value)}
        rows={6}
      />
      <div className="mb-6">
        <button
          onClick={handleJdSubmit}
          className="bg-[#0FAE96] text-white font-raleway font-semibold text-base px-6 py-3 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0FAE96] h-10 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Match Candidates'}
        </button>
      </div>
      {error && <p className="text-red-400 font-inter text-base mb-6 bg-[rgba(255,255,255,0.03)] p-3 rounded-lg">{error}</p>}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {candidates.map((candidate) => (
          <div key={candidate.id} className="relative bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] p-5 rounded-lg shadow-md hover:shadow-lg transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-[#7000FF]/15 to-[#FF00C7]/15 opacity-20 blur-[120px] -z-10" />
            <h2 className="font-raleway font-bold text-xl text-[#ECF1F0] mb-2 tracking-tight">{candidate.name}</h2>
            <p className="text-[#B6B6B6] font-inter text-base mb-1">{candidate.jobTitle}</p>
            <p className="text-[#B6B6B6] font-inter text-sm mb-3 opacity-80">{candidate.location}</p>
            <p className="text-[#B6B6B6] font-inter text-base mb-4">Match Score: <span className="text-[#0FAE96] font-semibold">{candidate.matchScore}</span></p>
            <button
              onClick={() => router.push(`/candidate/${candidate.email}`)}
              className="text-[#0FAE96] font-inter text-base font-medium hover:underline hover:text-[#0FAE96]/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0FAE96] focus-visible:ring-offset-2 h-10 transition-colors duration-200"
            >
              View Profile
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}