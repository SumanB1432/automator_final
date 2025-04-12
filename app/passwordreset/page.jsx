"use client";
import React, { useState } from "react";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { toast } from "react-toastify";

const PasswordReset = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    const auth = getAuth();

    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Password Reset Email Sent Successfully!");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#11011E] to-[#1A022D] text-white px-4 sm:px-6 lg:px-[90px] py-12">
      <div className="max-w-md w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-2xl p-6 sm:p-8 shadow-xl backdrop-blur-md transition-all hover:shadow-2xl">
        <h1 className="text-3xl font-bold text-center text-[#ECF1F0] bg-clip-text bg-gradient-to-r from-[#0FAE96] to-[#FF00C7] animate-fade-in">Password Reset</h1>
        <p className="text-sm text-gray-400 text-center mt-2">Enter your email below to receive a password reset link.</p>
        
        <form onSubmit={handlePasswordReset} className="mt-6 space-y-4">
          <input 
            type="email" 
            placeholder="Enter your email" 
            required 
            className="w-full p-4 rounded-lg bg-[rgba(255,255,255,0.03)] text-[#ECF1F0] border border-[rgba(255,255,255,0.1)] focus:ring-2 focus:ring-[#0FAE96] focus:outline-none placeholder-[#B6B6B6] disabled:opacity-50 transition-all duration-300"
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
          
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-gradient-to-r from-[#0FAE96] to-[#0FAE96] text-white font-semibold text-lg py-3 rounded-lg hover:from-[#0FAE96]/80 hover:to-[#0FAE96]/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105">
            {loading ? "Sending..." : "Reset Password"}
          </button>
        </form>

        <div className="text-center mt-4">
          <a href="/sign-in" className="text-[#0FAE96] hover:text-[#FF00C7] transition-colors duration-200">Back to Login</a>
        </div>
      </div>
    </div>
  );
};

export default PasswordReset;