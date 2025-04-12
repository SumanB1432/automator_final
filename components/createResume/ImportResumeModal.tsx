"use client";
import React, { useState } from "react";
import { toast } from "react-toastify";
import { ref, getDatabase, update } from "firebase/database";
import app from "@/firebase/config";
import { getAuth } from "firebase/auth";

export function ImportResumeModal({ onClose }: { onClose: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const auth = getAuth();
  const db = getDatabase(app);
  const uid = auth.currentUser ? auth.currentUser.uid : null;
  const userRef = ref(db, "user/" + uid);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first.");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch("/api/resumeParser", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        alert("File uploaded successfully!");
        const data = await response.json();
        const newData = data.parsedData;
        try {
          await update(userRef, {
            resume_data: {
              newData,
            },
          });
          toast.success("Document uploaded successfully!");
        } catch (err) {
          if (err instanceof Error) {
            toast.error(err.message || "An error occurred while submitting.");
          } else {
            toast.error("An error occurred while submitting.");
          }
        }
        console.log(data);
      } else {
        alert("Upload failed.");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-gray-900 text-white p-6 rounded-lg shadow-lg w-[400px]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">
            📥 Import an existing resume
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200"
          >
            ✖
          </button>
        </div>

        <p className="text-sm mb-4">Upload a file in pdf format</p>

        <label className="text-sm block mb-2">File</label>
        <input
          type="file"
          accept="pdf"
          className="w-full bg-gray-800 text-white p-2 border border-gray-700 rounded cursor-pointer"
          onChange={handleFileChange}
        />
        <button
          className="w-full bg-white text-black font-semibold p-2 rounded mt-4 hover:bg-gray-300"
          disabled={!file}
          onClick={handleUpload}
        >
          Validate
        </button>
      </div>
    </div>
  );
}
