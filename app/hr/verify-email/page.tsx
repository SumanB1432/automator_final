"use client";

import { getAuth, sendEmailVerification } from "firebase/auth";
import { useState } from "react";
import { toast } from "react-toastify";
import Link from "next/link";

const VerifyEmail = () => {
    const [loading, setLoading] = useState(false);

    const resendVerificationEmail = async () => {
        setLoading(true);
        try {
            const auth = getAuth();
            const user = auth.currentUser;
            if (user) {
                await sendEmailVerification(user);
                toast.success("Verification email resent. Please check your inbox.", { position: "top-center" });
            } else {
                toast.error("No user is signed in. Please register or log in.", { position: "bottom-center" });
            }
        } catch (error) {
            toast.error(error.message || "Failed to resend verification email", { position: "bottom-center" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#11011E] via-[#35013E] to-[#11011E] p-6">
            <div className="w-full max-w-md p-8 bg-[rgba(255,255,255,0.05)] rounded-2xl shadow-2xl border border-[rgba(255,255,255,0.1)]">
                <h1 className="text-2xl font-raleway font-semibold text-[#ECF1F0] mb-6 text-center animate-slideDown">
                    Verify Your Email
                </h1>
                <p className="text-gray-400 text-center mb-4">
                    A verification email has been sent to your inbox. Please verify your email to continue.
                </p>
                <button
                    onClick={resendVerificationEmail}
                    className="w-full bg-[#0FAE96] text-white p-3 rounded-lg hover:opacity-90 transition duration-300 transform hover:scale-105"
                    disabled={loading}
                >
                    {loading ? "Resending..." : "Resend Verification Email"}
                </button>
                <p className="text-center text-gray-400 mt-4">
                    Already verified?{" "}
                    <Link
                        href="/hr/login"
                        className="text-[#0FAE96] hover:text-[#FF00C7] transition-colors duration-200"
                    >
                        Login
                    </Link>
                </p>
            </div>
        </main>
    );
};

export default VerifyEmail;