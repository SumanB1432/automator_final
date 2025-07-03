"use client";
import React, { useState } from "react";
import { auth } from "@/firebase/config";
import DeleteAccountModal from "../../../components/DeleteAccountModal";
import { FiKey, FiTrash2, FiLogOut, FiChevronRight } from "react-icons/fi";

const Settings = function () {
    const [isModalOpen, setIsModalOpen] = useState(false);

    // --- Data-driven approach for cleaner code and easier updates ---
    const menuItems = [
        {
            label: "Update Gemini Key",
            description: "Manage your API key for Gemini services.",
            action: () => (window.location.href = "/hr/updateGemini"),
            icon: <FiKey className="w-6 h-6 text-indigo-400" />,
            isDestructive: false,
        },
        {
            label: "Logout",
            description: "Sign out of your current session.",
            action: handleLogout,
            icon: <FiLogOut className="w-6 h-6 text-slate-400" />,
            isDestructive: false,
        },
        {
            label: "Delete Account",
            description: "Permanently erase your account and data.",
            action: () => setIsModalOpen(true),
            icon: <FiTrash2 className="w-6 h-6 text-red-500" />,
            isDestructive: true,
        },
    ];

    function notifyExtensionOnLogout() {
        try {
            const event = new CustomEvent("onLogout", { detail: { status: "logged out" } });
            document.dispatchEvent(event);
            return true;
        } catch (error) {
            console.error("Error dispatching logout event:", error);
            return false;
        }
    }

    async function handleLogout() {
        try {
            await auth.signOut();
            localStorage.clear();
            notifyExtensionOnLogout();
            // --- Reduced delay for a more responsive feel ---
            setTimeout(() => {
                window.location.href = "/hr/login";
            }, 500);
        } catch (error) {
            console.error("Error logging out:", error.message);
            // Consider adding a user-facing error notification here
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#11011E] via-[#35013E] to-[#11011E] px-4 py-12 text-slate-200">
            <div className="w-full max-w-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-2xl shadow-2xl p-8 backdrop-blur-sm">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold text-white mb-2">
                        Settings
                    </h1>
                    <p className="text-slate-400">Manage your account and preferences.</p>
                </div>
                <div className="space-y-4">
                    {menuItems.map((item, index) => (
                        <div
                            key={index}
                            onClick={item.action}
                            // --- Conditional styling for visual hierarchy (standard vs. destructive) ---
                            className={`group flex items-center justify-between p-4 rounded-lg transition-all duration-300 cursor-pointer ${
                                item.isDestructive
                                    ? "bg-red-900/20 hover:bg-red-900/40 border border-red-500/30"
                                    : "bg-slate-800/40 hover:bg-slate-700/60 border border-transparent hover:border-purple-500"
                            }`}
                        >
                            <div className="flex items-center space-x-4">
                                {/* --- Icon styling for better visual grouping --- */}
                                <div className={`p-2 rounded-full ${item.isDestructive ? "bg-red-900/30" : "bg-slate-700/50"}`}>
                                    {item.icon}
                                </div>
                                <div>
                                    <span className={`font-semibold text-lg ${item.isDestructive ? "text-red-400" : "text-slate-200"}`}>
                                        {item.label}
                                    </span>
                                    {/* --- Added description for clarity --- */}
                                    <p className="text-slate-400 text-sm">{item.description}</p>
                                </div>
                            </div>
                            {/* --- Universal navigation cue with hover micro-interaction --- */}
                            <FiChevronRight className="w-6 h-6 text-slate-500 group-hover:translate-x-1 transition-transform duration-300" />
                        </div>
                    ))}
                </div>
                {isModalOpen && <DeleteAccountModal onClose={() => setIsModalOpen(false)} />}
            </div>
        </div>
    );
};

export default Settings;