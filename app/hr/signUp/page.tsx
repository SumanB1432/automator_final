"use client";

import { createUserWithEmailAndPassword, getAuth, sendEmailVerification, updateProfile, signOut } from "firebase/auth";
import React, { useState } from "react";
import { toast } from "react-toastify";
import app from "@/firebase/config";
import { getDatabase, ref, set } from "firebase/database";
import axios from "axios";
import Link from 'next/link';
// import { checkEmailType } from "../utils/emailCheck"

function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fname, setFname] = useState("");
    const [lname, setLname] = useState("");
    const [loading, setLoading] = useState(false);
    const [emailError, setEmailError] = useState("");

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        const auth = getAuth();
        const displayName = `${fname} ${lname}`;

        try {
            // const checkEmail = checkEmailType(email);
            // if (checkEmail.message == false) {
            //     setEmailError("Warning: Please use a company or HR email"); // Show error below input
            //     setLoading(false);
            //     return;
            // } else {
            //     setEmailError("");
            // }
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            if (user) {
                await updateProfile(user, { displayName });
                await sendEmailVerification(user);

                const db = getDatabase(app);
                const newDocRef = ref(db, "hr/" + user.uid);

                await set(newDocRef, { fname, lname, email }); // Removed password for security

                toast.success("Registered! Check your email for verification.", { position: "top-center" });

                await axios.post("https://us-central1-jobform-automator-website.cloudfunctions.net/welcomeEmailHR/send-email", {
                    email: email,
                    name: displayName || "User",
                });

                // Sign out to prevent immediate email verification check
                await signOut(auth);

    
            }
        } catch (error) {
            toast.error(error.message || "An unknown error occurred", { position: "bottom-center" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#11011E] via-[#35013E] to-[#11011E] p-6">
            <div className="w-full max-w-md p-8 bg-[rgba(255,255,255,0.05)] rounded-2xl shadow-2xl border border-[rgba(255,255,255,0.1)]">
                <h1 className="text-2xl font-raleway font-semibold text-[#ECF1F0] mb-6 text-center animate-slideDown">
                    Sign Up
                </h1>
                <p className="text-gray-400 text-center mb-4">
                    Achieve career success with Job Form Automator! Start auto-applying now!
                </p>

                <form onSubmit={handleRegister} className="space-y-4">
                    <input
                        type="text"
                        placeholder="First Name"
                        className="w-full p-3 border border-gray-600 rounded-lg bg-[#1A1A2E] text-white focus:ring-2 focus:ring-[#0FAE96]"
                        onChange={(e) => setFname(e.target.value)}
                        required
                        disabled={loading}
                    />
                    <input
                        type="text"
                        placeholder="Last Name"
                        className="w-full p-3 border border-gray-600 rounded-lg bg-[#1A1A2E] text-white focus:ring-2 focus:ring-[#0FAE96]"
                        onChange={(e) => setLname(e.target.value)}
                        required
                        disabled={loading}
                    />
                    <div>
                        <input
                            type="email"
                            placeholder="Email"
                            className={`w-full p-3 border rounded-lg bg-[#1A1A2E] text-white focus:ring-2 ${emailError ? "border-red-500 focus:ring-red-500" : "border-gray-600 focus:ring-[#0FAE96]"
                                }`}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setEmailError(""); // clear error while typing
                            }}
                            required
                            disabled={loading}
                        />
                        {emailError && (
                            <p className="text-red-500 text-sm mt-1">{emailError}</p>
                        )}
                    </div>

                    <input
                        type="password"
                        placeholder="Password"
                        className="w-full p-3 border border-gray-600 rounded-lg bg-[#1A1A2E] text-white focus:ring-2 focus:ring-[#0FAE96]"
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                    />

                    <button
                        type="submit"
                        className="w-full bg-[#0FAE96] text-white p-3 rounded-lg hover:opacity-90 transition duration-300 transform hover:scale-105"
                        disabled={loading}
                    >
                        {loading ? "Signing up..." : "Sign up"}
                    </button>
                </form>

                <p className="text-center text-gray-400 mt-4">
                    Already registered?{" "}
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
}

export default Register;