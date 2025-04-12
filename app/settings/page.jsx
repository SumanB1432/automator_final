"use client";
import React, { useState } from "react";
import { auth } from "@/firebase/config";
import DeleteAccountModal from "../../components/DeleteAccountModal";

const Settings = function () {
    let user = auth.currentUser;
    const [isModalOpen, setIsModalOpen] = useState(false);

    async function updateKey() {
        window.location.href = "/updategemini";
    }

    async function updateData() {
        window.location.href = "/updateresume";
    }

    async function deleteAccount() {
        window.location.href = "/deleteaccount";
    }

    async function handleLogout() {
        try {
            await auth.signOut();
            localStorage.clear();
            window.location.href = "/sign-in";
            function notifyExtensionOnLogout() {
                const event = new CustomEvent("onLogout");
                document.dispatchEvent(event);
            }
            notifyExtensionOnLogout();
        } catch (error) {
            console.error("Error logging out:", error.message);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#11011E] via-[#35013E] to-[#11011E] px-4">
            <div className="w-full max-w-lg p-8 rounded-2xl shadow-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)]">
                <h1 className="text-center text-3xl font-bold text-[#ECF1F0] mb-6 bg-gradient-to-r from-[#0FAE96] to-[#FF00C7] bg-clip-text text-transparent">
                    Settings
                </h1>
                <div className="space-y-6">
                    {[{ label: "Update Gemini Key", action: updateKey },
                      { label: "Update Data", action: updateData },
                      { label: "Delete Account", action: () => setIsModalOpen(true), color: "bg-red-600" },
                      { label: "Logout", action: handleLogout }].map((item, index) => (
                        <div key={index} className="flex justify-between items-center bg-[rgba(255,255,255,0.1)] rounded-xl px-6 py-4 shadow-md hover:bg-opacity-20 transition-all">
                            <span className="text-[#ECF1F0] font-semibold text-lg">{item.label}</span>
                            <button
                                className={`${item.color || "bg-gradient-to-r from-[#0FAE96] to-[#0FAE96]"} text-white font-semibold text-lg px-6 py-2 rounded-xl shadow-md hover:opacity-90 transition-all duration-300 hover:scale-105`}
                                onClick={item.action}
                            >
                                {item.label}
                            </button>
                        </div>
                    ))}
                </div>
                {isModalOpen && <DeleteAccountModal onClose={() => setIsModalOpen(false)} />}
            </div>
        </div>
    );
}

export default Settings;
