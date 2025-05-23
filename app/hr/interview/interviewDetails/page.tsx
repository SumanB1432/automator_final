// app/hr/interview/interviewDetails/page.jsx
import { Suspense } from "react";
import InterviewDetails from "@/components/interview/interviewDetails"

export default function InterviewDetailsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#11011E] text-white p-6 text-center">Loading...</div>}>
      <InterviewDetails />
    </Suspense>
  );
}