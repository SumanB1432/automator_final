"use client";

import React, { useState, useEffect } from "react";
import { auth } from "@/firebase/config";
import app from "@/firebase/config";
import { toast } from "react-toastify";
import { getDatabase, ref, update } from "firebase/database";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { KeyRound, ExternalLink, Loader2 } from 'lucide-react';

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
    const userRef = ref(db, `user/${userId}`);
    const paymentRef = ref(db, `user/${userId}/Payment`);

    const genAI = new GoogleGenerativeAI(geminiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = "Write a story about an AI and magic";

    try {
      const result = await model.generateContent(prompt);
      const response = result.response;

      if (response) {
        toast.success("API Key Submitted Successfully");
        localStorage.setItem("api_key", geminiKey);

        function notifyExtensionOnGeminiKey(key: string): void {
          console.log("geminnnni")
          const event = new CustomEvent<{ key: string }>("geminiKeySubmitted", { detail: { key } });
          document.dispatchEvent(event);
        }
        notifyExtensionOnGeminiKey(geminiKey);

        const currentDate = new Date().toISOString().replace("T", " ").split(".")[0];

        await Promise.all([
          update(userRef, { API: { apikey: geminiKey } }).catch((err) =>
            console.error("Error updating API key:", err)
          ),
          update(paymentRef, {
            Status: "Free",
            Start_Date: currentDate,
            SubscriptionType: "GetResume",
          }).catch((err) => console.error("Error updating payment details:", err)),
        ]);

        router.push("/resume2");
      }
    } catch (error) {
      toast.error("Invalid API key!");
      console.error("Error generating content:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
     <main className="flex items-center justify-center min-h-screen bg-[#11011E] p-6">
      <div className="relative w-full max-w-md">
        {/* Decorative elements */}
        <div className="absolute -top-10 -left-10 w-20 h-20 bg-[#7000FF] rounded-full blur-3xl opacity-20"></div>
        <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-[#FF00C7] rounded-full blur-3xl opacity-20"></div>

        {/* Main card */}
        <div className="relative w-full bg-[rgba(255,255,255,0.02)] rounded-2xl shadow-2xl border border-[rgba(255,255,255,0.05)] p-8 overflow-hidden z-10">
          {/* Subtle mesh gradient overlay */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJncmlkIiB4PSIwIiB5PSIwIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxwYXRoIGQ9Ik0gMjAgMCBMIDAgMCAwIDIwIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')]"></div>

          {/* Content */}
          <div className="relative z-10">
            {/* Header with glow effect */}
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                
                <h1 className="text-3xl font-raleway font-bold text-[#ECF1F0]">
                Activate powerful features at minimal cost.
                </h1>
              </div>
            </div>

            {/* Video player with enhanced border */}
            <div className="relative mb-8 rounded-xl overflow-hidden border border-[rgba(255,255,255,0.05)] shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-r from-[#7000FF]/10 to-[#FF00C7]/10 pointer-events-none"></div>
              <iframe
                className="w-full aspect-video"
                src="https://www.youtube.com/embed/5VbhMJKTbak?si=7N-YplG58Z6EXs4R"
                title="YouTube video player"
                allowFullScreen
              ></iframe>
            </div>

            {/* Form with subtle animations */}
            <form onSubmit={submitHandler} className="space-y-5">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-[#3e0969] rounded-lg blur opacity-30 group-hover:opacity-70 transition duration-1000"></div>
                <input
                  type="text"
                  placeholder="Enter Your Gemini Key"
                  required
                  className="relative w-full p-4 border border-[rgba(255,255,255,0.05)] rounded-lg bg-[rgba(255,255,255,0.02)] text-[#ECF1F0] focus:outline-none focus:ring-2 focus:ring-[#0FAE96] transition-all duration-300 placeholder-[#B6B6B6]"
                  onChange={(e) => setGeminiKey(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="flex justify-center">
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-[#0FAE96] hover:underline transition duration-200 group focus-visible:ring-2 focus-visible:ring-[#0FAE96]"
                >
                  <span className="font-inter">Don't have a key? Get your Gemini Key here</span>
                  <ExternalLink className="ml-1 w-4 h-4 text-[#0FAE96] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-[#0FAE96] text-white font-raleway font-semibold text-base px-6 py-3 rounded-md transition duration-200 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0FAE96] disabled:opacity-70 ${loading ? 'cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="animate-spin mr-2 text-white" size={18} />
                    <span>Processing...</span>
                  </div>
                ) : (
                  <span>Submit Key</span>
                )}
              </button>
            </form>

            {/* Added trust indicators */}
            <div className="mt-6 flex items-center justify-center space-x-2 text-[#B6B6B6] font-inter text-xs">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span>Secure Connection</span>
              <span>•</span>
              <span>Encrypted</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default GeminiPage;
