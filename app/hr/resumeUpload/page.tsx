'use client';

import React, { useState } from "react";
import ResumeUpload from "@/components/upload/ResumeUpload";

export default function ResumeUploadPage() {
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [recruiterSuggestion, setRecruiterSuggestion] = useState('');

  return (
    <ResumeUpload
      jobTitle={jobTitle}
      setJobTitle={setJobTitle}
      jobDescription={jobDescription}
      setJobDescription={setJobDescription}
      recruiterSuggestion={recruiterSuggestion}
      setRecruiterSuggestion={setRecruiterSuggestion}
    />
  );
}
