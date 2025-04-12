// // "use client";
// // import React, { useState,useEffect } from "react";
// // import { auth } from "@/firebase/config";
// // import app from "@/firebase/config";
// // import { toast } from "react-toastify";
// // import { getDatabase, ref, update } from "firebase/database";
// // import { GoogleGenerativeAI } from "@google/generative-ai";
// // import { useRouter } from "next/navigation";
// // import { onAuthStateChanged } from "firebase/auth";

// // const GeminiPage: React.FC = () => {
// //   const [loading, setLoading] = useState<boolean>(false);
// //   const [geminiKey, setGeminiKey] = useState<string>("");
// //   const db = getDatabase(app);
// //   const router = useRouter();

// //     useEffect(() => {
// //       const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
// //         if (currentUser) {
// //           console.log("User signed in:", currentUser); // Debugging user 
// //         } else {
// //           toast.error("You need to be signed in to update your gemini kay!");
// //           window.location.href = "/sign-in"
// //         }
// //       });

// //       return () => unsubscribe();
// //     }, []);

// //   const submitHandler = async (e: React.FormEvent) => {
// //     e.preventDefault();
// //     setLoading(true);

// //     if (!auth.currentUser) {
// //       toast.error("User not authenticated!");
// //       setLoading(false);
// //       return;
// //     }

// //     const userId = auth.currentUser.uid;
// //     const userRef = ref(db, `user/${userId}`);
// //     const paymentRef = ref(db, `user/${userId}/Payment`);

// //     const genAI = new GoogleGenerativeAI(geminiKey);
// //     const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
// //     const prompt = "Write a story about an AI and magic";

// //     try {
// //       const result = await model.generateContent(prompt);
// //       const response = result.response;

// //       if (response) {
// //         toast.success("API Key Updation Successfully");
// //         localStorage.setItem("api_key", geminiKey);

// //         function notifyExtensionOnUpdateGeminiKey(key: string): void {
// //           const event = new CustomEvent<{ key: string }>("geminiKeyUpdated", { detail: { key } });
// //           document.dispatchEvent(event);
// //         }
// //         notifyExtensionOnUpdateGeminiKey(geminiKey);
// //         window.location.href = `/home`;



// //         await Promise.all([
// //           update(userRef, { API: { apikey: geminiKey } }).catch((err) =>
// //             console.error("Error updating API key:", err)
// //           ),
// //         ]);

// //       }
// //     } catch (error) {
// //       toast.error("Invalid API key!");
// //       console.error("Error generating content:", error);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   return (
// //     <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-6">
// //       <h1 className="text-3xl font-bold mb-4 text-purple-400">Enter Free Gemini Key</h1>
// //       <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-lg">
// //         <div className="mb-4">
// //           <iframe
// //             className="w-full rounded-md"
// //             height="250"
// //             src="https://www.youtube.com/embed/5VbhMJKTbak?si=7N-YplG58Z6EXs4R"
// //             title="YouTube video player"
// //             allowFullScreen
// //           ></iframe>
// //         </div>
// //         <form onSubmit={submitHandler} className="space-y-4">
// //           <input
// //             type="text"
// //             placeholder="Enter Your Gemini Key"
// //             required
// //             className="w-full p-3 rounded-md bg-gray-700 text-white border border-gray-600 focus:ring-2 focus:ring-purple-500 focus:outline-none"
// //             onChange={(e) => setGeminiKey(e.target.value)}
// //             disabled={loading}
// //           />
// //           <a
// //             href="https://aistudio.google.com/app/apikey"
// //             target="_blank"
// //             className="block text-purple-400 hover:underline text-center"
// //           >
// //             Get Gemini Key
// //           </a>
// //           <button
// //             type="submit"
// //             disabled={loading}
// //             className="w-full bg-purple-500 hover:bg-purple-600 text-white py-3 rounded-md font-bold transition-all"
// //           >
// //             {loading ? "Submitting..." : "Submit"}
// //           </button>
// //         </form>
// //       </div>
// //     </div>
// //   );
// // };

// // export default GeminiPage;
// "use client";
// import React, { useState, useEffect } from "react";
// import { auth } from "@/firebase/config";
// import app from "@/firebase/config";
// import { toast } from "react-toastify";
// import { getDatabase, ref, update } from "firebase/database";
// import { GoogleGenerativeAI } from "@google/generative-ai";
// import { useRouter } from "next/navigation";
// import { onAuthStateChanged } from "firebase/auth";

// const GeminiPage: React.FC = () => {
//   const [loading, setLoading] = useState<boolean>(false);
//   const [geminiKey, setGeminiKey] = useState<string>("");
//   const db = getDatabase(app);
//   const router = useRouter();

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
//       if (currentUser) {
//         console.log("User signed in:", currentUser);
//       } else {
//         toast.error("You need to be signed in to upload your Gemini key!");
//         window.location.href = "/sign-in";
//       }
//     });

//     return () => unsubscribe();
//   }, []);

//   const submitHandler = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);

//     if (!auth.currentUser) {
//       toast.error("User not authenticated!");
//       setLoading(false);
//       return;
//     }

//     const userId = auth.currentUser.uid;
//     const userRef = ref(db, `user/${userId}`);
//     const paymentRef = ref(db, `user/${userId}/Payment`);

//     const genAI = new GoogleGenerativeAI(geminiKey);
//     const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
//     const prompt = "Write a story about an AI and magic";

//     try {
//       const result = await model.generateContent(prompt);
//       const response = result.response;

//       if (response) {
//         toast.success("API Key Submitted Successfully");
//         localStorage.setItem("api_key", geminiKey);

//         function notifyExtensionOnUpdateGeminiKey(key: string): void {
//           const event = new CustomEvent<{ key: string }>("geminiKeyUpdated", { detail: { key } });
//           document.dispatchEvent(event);
//         }
//         notifyExtensionOnUpdateGeminiKey(geminiKey);

//         const currentDate = new Date().toISOString().replace("T", " ").split(".")[0];

//         await Promise.all([
//           update(userRef, { API: { apikey: geminiKey } }).catch((err) =>
//             console.error("Error updating API key:", err)
//           ),
//           update(paymentRef, {
//             Status: "Free",
//             Start_Date: currentDate,
//             SubscriptionType: "GetResume",
//           }).catch((err) => console.error("Error updating payment details:", err)),
//         ]);

//         router.push("/resume2");
//       }
//     } catch (error) {
//       toast.error("Invalid API key!");
//       console.error("Error generating content:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#11011E] to-[#1A022D] text-white px-4 sm:px-6 lg:px-[90px] py-12">
//       {/* Main Container */}
//       <div className="max-w-[1440px] w-full flex flex-col items-center gap-12">
//         {/* Heading */}
//         <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-raleway font-bold text-center text-[#ECF1F0] bg-clip-text bg-gradient-to-r from-[#0FAE96] to-[#FF00C7] animate-fade-in">
//           Enter Your Free Gemini Key
//         </h1>

//         {/* Card */}
//         <div className="w-full max-w-md sm:max-w-lg lg:max-w-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-2xl p-6 sm:p-8 lg:p-10 shadow-xl backdrop-blur-md transition-all hover:shadow-2xl">
//           {/* Video */}
//           <div className="mb-6 sm:mb-8">
//             <iframe
//               className="w-full rounded-xl aspect-video"
//               src="https://www.youtube.com/embed/5VbhMJKTbak?si=7N-YplG58Z6EXs4R"
//               title="YouTube video player"
//               allowFullScreen
//             ></iframe>
//           </div>

//           {/* Form */}
//           <form onSubmit={submitHandler} className="space-y-6">
//             {/* Input */}
//             <input
//               type="text"
//               placeholder="Enter Your Gemini Key"
//               required
//               className="w-full p-4 rounded-lg bg-[rgba(255,255,255,0.03)] text-[#ECF1F0] border border-[rgba(255,255,255,0.1)] focus:ring-2 focus:ring-[#0FAE96] focus:outline-none placeholder-[#B6B6B6] disabled:opacity-50 transition-all duration-300"
//               onChange={(e) => setGeminiKey(e.target.value)}
//               disabled={loading}
//             />

//             {/* Link */}
//             <a
//               href="https://aistudio.google.com/app/apikey"
//               target="_blank"
//               rel="noopener noreferrer"
//               className="block text-center text-[#0FAE96] font-raleway text-sm sm:text-base hover:text-[#FF00C7] transition-colors duration-200"
//             >
//               Don’t have a key? Get your Gemini Key here
//             </a>

//             {/* Button */}
//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full bg-gradient-to-r from-[#0FAE96] to-[#0FAE96] text-white font-raleway font-semibold text-base sm:text-lg py-3 px-6 rounded-lg hover:from-[#0FAE96]/80 hover:to-[#7000FF]/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
//             >
//               {loading ? (
//                 <span className="flex items-center justify-center gap-2">
//                   <svg
//                     className="animate-spin h-5 w-5 text-white"
//                     xmlns="http://www.w3.org/2000/svg"
//                     fill="none"
//                     viewBox="0 0 24 24"
//                   >
//                     <circle
//                       className="opacity-25"
//                       cx="12"
//                       cy="12"
//                       r="10"
//                       stroke="currentColor"
//                       strokeWidth="4"
//                     ></circle>
//                     <path
//                       className="opacity-75"
//                       fill="currentColor"
//                       d="M4 12a8 8 0 018-8v8h-8z"
//                     ></path>
//                   </svg>
//                   Submitting...
//                 </span>
//               ) : (
//                 "Submit"
//               )}
//             </button>
//           </form>
//         </div>
//       </div>

//       {/* Optional Background Ellipse for Visual Flair */}
//       <div className="absolute inset-0 -z-10 overflow-hidden">
//         <div className="w-[675px] h-[314px] bg-[#7000FF] opacity-20 blur-[200px] absolute top-[10%] left-[10%]"></div>
//         <div className="w-[675px] h-[314px] bg-[#FF00C7] opacity-20 blur-[200px] absolute bottom-[10%] right-[10%]"></div>
//       </div>
//     </div>
//   );
// };

// export default GeminiPage;
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

        function notifyExtensionOnUpdateGeminiKey(key: string): void {
          const event = new CustomEvent<{ key: string }>("geminiKeyUpdated", { detail: { key } });
          document.dispatchEvent(event);
        }
        notifyExtensionOnUpdateGeminiKey(geminiKey);

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
    <main className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#11011E] via-[#35013E] to-[#11011E] p-6">
      <div className="w-full max-w-md p-8 bg-[rgba(255,255,255,0.05)] rounded-2xl shadow-2xl border border-[rgba(255,255,255,0.1)] text-center">
        <h1 className="text-2xl font-semibold font-raleway text-[#ECF1F0] mb-text-2xl font-raleway font-semibold mb-6 text-center animate-slideDown text-[#ECF1F0]">Update Your Free Gemini Key</h1>
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
