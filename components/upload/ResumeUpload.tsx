'use client';

import { ChangeEvent, useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCandidateStore } from '@/store/useCandidateStore';
import { Candidate } from '@/types/candidate';
import { toast } from 'react-toastify';

type Props = {
  jobDescription: string;
  setJobDescription: (text: string) => void;
  recruiterSuggestion: string;
  setRecruiterSuggestion: (text: string) => void;
  jobTitle: string;
  setJobTitle: (text: string) => void;
};

export default function ResumeUpload({
  jobDescription,
  setJobDescription,
  recruiterSuggestion,
  setRecruiterSuggestion,
  jobTitle,
  setJobTitle,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { setCandidates } = useCandidateStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const router = useRouter();

  // Load from localStorage
  useEffect(() => {
    const storedJobDescription = localStorage.getItem('jobDescription');
    const storedRecruiterSuggestion = localStorage.getItem('recruiterSuggestion');
    const storedJobTitle = localStorage.getItem('jobTitle');

    if (storedJobDescription) setJobDescription(storedJobDescription);
    if (storedRecruiterSuggestion) setRecruiterSuggestion(storedRecruiterSuggestion);
    if (storedJobTitle) setJobTitle(storedJobTitle);
  }, [setJobDescription, setRecruiterSuggestion, setJobTitle]);

  // Save to localStorage
  useEffect(() => {
    if (jobDescription) localStorage.setItem('jobDescription', jobDescription);
  }, [jobDescription]);

  useEffect(() => {
    if (recruiterSuggestion) localStorage.setItem('recruiterSuggestion', recruiterSuggestion);
  }, [recruiterSuggestion]);

  useEffect(() => {
    if (jobTitle) localStorage.setItem('jobTitle', jobTitle);
  }, [jobTitle]);

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const fileList = Array.from(files);
    setSelectedFiles(fileList);
  };

  const handleParseResumes = async () => {
    if (!jobDescription.trim()) {
      setError('Job description is required.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (selectedFiles.length === 0) {
      setError('Please select at least one resume file.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const formData = new FormData();
    selectedFiles.forEach(file => formData.append('file', file));

    setLoading(true);
    setError('');

    try {
      const query = new URLSearchParams({
        jd: jobDescription,
        rs: recruiterSuggestion,
        jt: jobTitle,
      });

      const res = await fetch(`/api/parseresume?${query.toString()}`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Failed to parse resumes');

      const { candidates }: { candidates: Candidate[] } = await res.json();
      setCandidates(candidates);
      setSelectedFiles([]);
      toast.success('Resumes parsed successfully!');
      router.push('/candidates');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Unexpected error occurred.');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setError('Unexpected error occurred.');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md space-y-6">
      <h2 className="text-xl font-semibold text-black">Upload Resumes</h2>

      {/* Job Details */}
      <div className="grid gap-4">
        <textarea
          rows={2}
          placeholder="Enter the Job Title"
          value={jobTitle}
          onChange={e => setJobTitle(e.target.value)}
          className="w-full p-3 border rounded-xl text-sm text-gray-800"
        />
        <textarea
          rows={5}
          placeholder="Paste the Job Description here..."
          value={jobDescription}
          onChange={e => setJobDescription(e.target.value)}
          className="w-full p-3 border rounded-xl text-sm text-gray-800"
        />
        <textarea
          rows={3}
          placeholder="Recruiter notes or suggestions (optional)"
          value={recruiterSuggestion}
          onChange={e => setRecruiterSuggestion(e.target.value)}
          className="w-full p-3 border rounded-xl text-sm text-gray-800"
        />
      </div>

      {/* File Upload */}
      <div className="space-y-3">
        <h3 className="text-lg font-medium text-gray-600">Resume Files</h3>

        <input
          type="file"
          accept=".pdf"
          multiple
          ref={inputRef}
          onChange={handleFileSelect}
          className="hidden"
        />
        <button
          onClick={() => inputRef.current?.click()}
          className="bg-black text-white py-2 px-4 rounded-xl hover:bg-gray-900"
        >
          Select PDF Resumes
        </button>

        {selectedFiles.length > 0 && (
          <div className="max-h-40 overflow-y-auto border rounded-md p-2">
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
              {selectedFiles.map((file, i) => (
                <li key={i}>{file.name}</li>
              ))}
            </ul>
          </div>
        )}

        {error && <p className="text-red-600 text-sm">{error}</p>}
      </div>

      {/* Parse Button */}
      <button
        onClick={handleParseResumes}
        className={`bg-blue-500 text-white py-2 px-4 rounded-xl hover:bg-blue-700 w-full ${
          loading ? 'cursor-not-allowed opacity-70' : ''
        }`}
        disabled={loading}
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Parsing Resumes...
          </div>
        ) : (
          'Parse Resumes'
        )}
      </button>
    </div>
  );
}
