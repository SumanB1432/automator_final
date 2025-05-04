export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  resumeUrl?: string;
  score: number;
  parsedText: string;
  approved: boolean;

  skills: string[];           // List of skills extracted from the resume
  experience: number;         // Total years of experience extracted from the resume
  jobTitle: string;           // Job title extracted from the resume
  education: string; 
}

export type ParsedResume = {
  index: number;
  success: boolean;
  parsed?: string;
  error?: string;
  parsedText: string;
};

export interface WhatsAppResponse {
  phone: string;
  status: 'success' | 'error';
  messageId?: string;
  error?: string;
}
