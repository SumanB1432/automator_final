"use client"
import { useState } from "react";

export default function SkiilSuggestion() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [text, setText] = useState<string>("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
    } else {
      alert("Please upload a valid PDF file.");
    }
  };
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!pdfFile || !text) {
      alert("Please upload a PDF and enter text.");
      return;
    }

    const formData = new FormData();
    formData.append("jobDescription", text);
    formData.append("file", pdfFile);
  
    try {
      const res = await fetch("/api/skills", {
        method: "POST",
        body: formData,
      });
  
      if (!res.ok) {
        throw new Error("Failed to upload data");
      }
  
      const data = await res.json();
      console.log("Response:", data);
      return data;
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 text-black">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md"
      >
        <label className="block mb-2 font-semibold">Upload PDF:</label>
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="w-full p-2 border border-gray-300 rounded mb-4"
        />
        <label className="block mb-2 font-semibold">Enter Text:</label>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded mb-4"
        />
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
        >
          Submit
        </button>
      </form>
    </div>
  );
}
