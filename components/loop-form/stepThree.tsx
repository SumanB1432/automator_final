"use client";
import { useRouter } from "next/navigation";
import { FaCheckCircle } from "react-icons/fa";

interface FormData {
  jobTitle: string;
  jobLocation: string;
  experience: string;
  jobType: string;
  phoneNumber: string;
  recruiterEmailTemplate: string;
  examEmailTemplate?: string;
  coverLetter: string;
}

interface InfoRowProps {
  label: string;
  value: string;
}

const InfoRow = ({ label, value }: InfoRowProps) => (
  <div className="flex flex-col p-4 rounded-lg border border-gray-700">
    <span className="text-gray-400 font-semibold">{label}:</span>
    <p className="text-white text-base mt-1 break-words">{value || "N/A"}</p>
  </div>
);

const StepThree = ({ formData }: { formData: FormData }) => {
  const router = useRouter();

  const handleOnClick = () => {
    // Convert form data to JSON and encode for URL
    const jsonData = encodeURIComponent(JSON.stringify(formData));
    router.push(`/send-auto-mail?data=${jsonData}`);
  };

  return (
    <div className="max-w-2xl mx-auto p-8 rounded-2xl shadow-xl border border-gray-700">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
        <FaCheckCircle className="text-green-500" /> Step 3: Review & Submit
      </h2>
      
      <div className="space-y-6">
        <InfoRow label="Job Title" value={formData.jobTitle} />
        <InfoRow label="Job Location" value={formData.jobLocation} />
        <InfoRow label="Experience" value={formData.experience} />
        <InfoRow label="Job Type" value={formData.jobType} />
        <InfoRow label="Phone Number" value={formData.phoneNumber} />
        <InfoRow label="Recruiter Email Template" value={formData.recruiterEmailTemplate} />
        <InfoRow label="Exam Email Template" value={formData.examEmailTemplate} />
        <InfoRow label="Cover Letter" value={formData.coverLetter} />
      </div>

      <button 
        onClick={handleOnClick} 
        className="mt-8 w-full px-5 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 transition-all"
      >
        Submit Application
      </button>
    </div>
  );
};

export default StepThree;