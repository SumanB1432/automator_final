"use client";

import React, { useState, useEffect } from "react";
import { auth } from "@/firebase/config";
import app from "@/firebase/config";
import { toast } from "react-toastify";
import { getDatabase, ref, update } from "firebase/database";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";

const GeminiPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [geminiKey, setGeminiKey] = useState<string>("");
  const db = getDatabase(app);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        console.log("User signed in:", currentUser);
      } else {
        toast.error("You need to be signed in to upload your Gemini key!");
        window.location.href = "/sign-in";
      }
    });

    return () => unsubscribe();
  }, []);

  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!auth.currentUser) {
      toast.error("User not authenticated!");
      setLoading(false);
      return;
    }

    const userId = auth.currentUser.uid;
    const userRef = ref(db, `hr/${userId}`);
    const paymentRef = ref(db, `hr/${userId}/Payment`);

    const genAI = new GoogleGenerativeAI(geminiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = "Write a story about an AI and magic";

    try {
      const result = await model.generateContent(prompt);
      const response = result.response;

      if (response) {
        toast.success("API Key Submitted Successfully");
        localStorage.setItem("api_key", geminiKey);

        // function notifyExtensionOnGeminiKey(key: string): void {
        //   console.log("geminnnni")
        //   const event = new CustomEvent<{ key: string }>("geminiKeySubmitted", { detail: { key } });
        //   document.dispatchEvent(event);
        // }
        // notifyExtensionOnGeminiKey(geminiKey);

        const currentDate = new Date().toISOString().replace("T", " ").split(".")[0];

        await Promise.all([
          update(userRef, { API: { apikey: geminiKey } }).catch((err) =>
            console.error("Error updating API key:", err)
          ),
          update(paymentRef, {
            Status: "Free",
            Start_Date: currentDate,
            SubscriptionType: "Free",
          }).catch((err) => console.error("Error updating payment details:", err)),
        ]);

      }
    } catch (error) {
      toast.error("Invalid API key!");
      console.error("Error generating content:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#11011E] via-[#35013E] to-[#11011E] p-6">
      <div className="w-full max-w-md p-8 bg-[rgba(255,255,255,0.05)] rounded-2xl shadow-2xl border border-[rgba(255,255,255,0.1)] text-center">
        <h1 className="text-2xl font-semibold font-raleway text-[#ECF1F0] mb-text-2xl font-raleway font-semibold mb-6 text-center animate-slideDown text-[#ECF1F0]">Enter Your Free Gemini Key</h1>
        <iframe
          className="w-full rounded-xl aspect-video mb-6"
          src="https://www.youtube.com/embed/5VbhMJKTbak?si=7N-YplG58Z6EXs4R"
          title="YouTube video player"
          allowFullScreen
        ></iframe>
        <form onSubmit={submitHandler} className="space-y-4">
          <input
            type="text"
            placeholder="Enter Your Gemini Key"
            required
            className="w-full p-3 border border-gray-600 rounded-lg bg-[#1A1A2E] text-white focus:ring-2 focus:ring-[#0FAE96]"
            onChange={(e) => setGeminiKey(e.target.value)}
            disabled={loading}
          />
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-[#0FAE96] hover:underline"
          >
            Don’t have a key? Get your Gemini Key here
          </a>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0FAE96] text-white p-3 rounded-lg hover:opacity-90 transition duration-300 transform hover:scale-105"
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </form>
      </div>
    </main>
  );
};

export default GeminiPage;
