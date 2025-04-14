"use client";
import { useState, useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  loading: boolean;
  inputValue: string;
  setInputValue: (value: string) => void;
  error: string;
  resumeText: string;
  file: File | null;
  setFile: (file: File | null) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handelDataSubmit: () => void;
  handleGetExistingResume: () => void;
  actionType: "build" | "analyze" | null;
}

export default function Modal({
  isOpen,
  onClose,
  loading,
  inputValue,
  setInputValue,
  error,
  resumeText,
  file,
  handleFileChange,
  handelDataSubmit,
  handleGetExistingResume,
  actionType,
}: ModalProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    console.log(loading, "loading");
    if (isOpen) {
      document.body.style.overflow = "hidden"; // Disable scrolling
    } else {
      document.body.style.overflow = "auto"; // Re-enable scrolling
    }
    return () => {
      document.body.style.overflow = "auto"; // Cleanup on unmount
    };
  }, [isOpen, loading]);

  if (!isOpen) return null;

  const modalHeading = actionType === "build" ? "Build Your Resume" : "Analyze Your Resume";
  const loadingText = actionType === "build" ? "Building..." : "Analyzing...";
  const submitText = loading ? loadingText : "Submit";

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300 pointer-events-auto z-50 ${isClosing ? "opacity-0" : "opacity-100"}`}
      onClick={onClose}
    >
      <div
        className={`bg-[rgba(255,255,255,0.05)] backdrop-blur-2xl text-white p-6 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.08)] w-96 relative transition-transform duration-300 ${isClosing ? "scale-90 opacity-0" : "scale-100 opacity-100"}`}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        {/* Close Button (X) */}
        <button
          className="absolute top-3 right-3 text-[rgba(255,255,255,0.9)] hover:text-[#0FAE96] text-xl font-bold transition-colors duration-200"
          onClick={onClose}
          disabled={loading}
        >
          ×
        </button>

        <h2 className="text-2xl font-semibold text-[#0FAE96] mb-4">
          {modalHeading}
        </h2>
        <p className="text-gray-300 mb-4 text-sm leading-relaxed">
          Choose how you&rsquo;d like to {modalHeading.toLowerCase().replace("your ", "")}:
        </p>

        <div className="flex flex-col gap-4 items-center">
          <button
            className="bg-gradient-to-r from-[#0FAE96] to-[#7000FF] text-white font-semibold py-2 px-4 rounded-xl shadow-[0_6px_24px_rgba(15,174,150,0.6)] hover:shadow-[0_8px_32px_rgba(112,0,255,0.7)] hover:scale-105 transition-all duration-300 transform relative overflow-hidden group w-full"
            onClick={handleGetExistingResume}
            disabled={loading}
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.3)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-shimmer"></span>
            <span className="relative z-10">
              {loading ? "Loading Resume..." : "Use Your Existing Resume"}
            </span>
          </button>

          {/* OR Divider */}
          <div className="flex items-center w-full">
            <hr className="flex-grow border-[rgba(255,255,255,0.2)]" />
            <span className="mx-4 text-gray-300 font-semibold">OR</span>
            <hr className="flex-grow border-[rgba(255,255,255,0.2)]" />
          </div>

          <button
            className="bg-gradient-to-r from-[#0FAE96] to-[#7000FF] text-white font-semibold py-2 px-4 rounded-xl shadow-[0_6px_24px_rgba(15,174,150,0.6)] hover:shadow-[0_8px_32px_rgba(112,0,255,0.7)] hover:scale-105 transition-all duration-300 transform relative overflow-hidden group w-full"
            onClick={() => document.getElementById("file-upload")?.click()}
            disabled={loading}
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.3)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-shimmer"></span>
            <span className="relative z-10">
              {loading ? "Loading Resume..." : "Upload a New Resume"}
            </span>
          </button>
          <input
            id="file-upload"
            type="file"
            accept=".pdf,.docx"
            onChange={handleFileChange}
            className="hidden"
            disabled={loading}
          />
          <p className="text-center text-sm text-gray-300 leading-relaxed">
            Drag your resume here or choose a file.<br />
            PDF & DOCX only.
          </p>

          {file && (
            <div className="bg-[rgba(112,0,255,0.1)] rounded-xl px-3 py-1 text-sm text-[rgba(255,255,255,0.9)]">
              {file.name}
            </div>
          )}
          {resumeText && (
            <div className="bg-[rgba(112,0,255,0.1)] rounded-xl px-3 py-1 text-sm text-[rgba(255,255,255,0.9)]">
              Your Resume Upload Successfully!
            </div>
          )}
        </div>

        <br />

        {/* Input Field Label with Asterisk */}
        <label className="text-white font-medium">
          Job Description <span className="text-[#E02529]">*</span>
        </label>

        {/* Input Field */}
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Enter Job Description"
          className={`w-full h-40 p-4 rounded-xl text-black bg-white border-2  
          ${error ? "border-[#E02529]" : "border-[rgba(255,255,255,0.2)]"} 
          focus:outline-none focus:border-[#0FAE96] transition-all duration-300 resize-none`}
          disabled={loading}
        />

        {/* Error Message (Shows Only If Empty) */}
        {error && <p className="text-[#E02529] text-sm mt-1">{error}</p>}

        {/* Submit Button */}
        <div className="flex justify-end mt-4">
          <button
            className="bg-[#0FAE96] text-white font-semibold py-2 px-4 rounded-xl shadow-[0_4px_20px_rgba(15,174,150,0.5)] hover:bg-[#0E8C77] hover:scale-105 hover:shadow-[0_6px_30px_rgba(15,174,150,0.7)] transition-all duration-300 transform relative overflow-hidden"
            onClick={handelDataSubmit}
            disabled={loading}
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.2)] to-transparent animate-shimmer"></span>
            <span className="relative z-10">
              {submitText}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
