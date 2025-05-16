'use client';

import React, { useState,useEffect } from "react";
import ResumeUpload from "@/components/upload/ResumeUpload";
import {toast} from "react-toastify"

export default function ResumeUploadPage() {
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [recruiterSuggestion, setRecruiterSuggestion] = useState('');

  useEffect(() => {
    const isHRLoggedIn = localStorage.getItem("IsLoginAsHR");
    console.log(isHRLoggedIn)
  
    if (isHRLoggedIn !== "true") {
      toast.warning("Access denied. Please log in as an HR user.");
  
      setTimeout(() => {
        window.location.href = "/hr/login";
      }, 2000);
    }
  }, []);

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
