"use client";
import React, { useState } from "react";
import { auth } from "@/firebase/config";
import DeleteAccountModal from "@/components/DeleteAccountModal";
import { FiKey, FiUser, FiTrash2, FiLogOut } from "react-icons/fi";

const Settings = function () {
    const user = auth.currentUser;
    const [isModalOpen, setIsModalOpen] = useState(false);

    async function updateKey() {
        window.location.href = "/updategemini";
    }

    async function updateData() {
        window.location.href = "/updateresume";
    }

    async function deleteAccount() {
        setIsModalOpen(true);
    }

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
            console.log("User signed out");
            localStorage.clear();
            console.log("LocalStorage cleared");

            const notificationSuccess = notifyExtensionOnLogout();
            console.log("Notification success:", notificationSuccess);
            if (!notificationSuccess) {
                console.warn("Logout notification may not have been processed correctly");
            }

            setTimeout(() => {
                console.log("Redirecting...");
                window.location.href = "/sign-in";
            }, 2000);
        } catch (error) {
            console.error("Error logging out:", error.message);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0A0015] via-[#1A0030] to-[#0A0015] px-4 py-12">
            <div className="w-full max-w-md bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-2xl shadow-xl p-8">
                <h1 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-[#0FAE96] to-[#FF00C7] mb-8">
                    Settings
                </h1>
                <div className="space-y-4">
                    {[
                        { label: "Update Gemini Key", action: updateKey, icon: <FiKey className="w-6 h-6" />, color: "bg-gradient-to-r from-[#0FAE96] to-[#0FAE96]" },
                        { label: "Update Data", action: updateData, icon: <FiUser className="w-6 h-6" />, color: "bg-gradient-to-r from-[#0FAE96] to-[#0FAE96]" },
                        { label: "Delete Account", action: deleteAccount, icon: <FiTrash2 className="w-6 h-6" />, color: "bg-red-600" },
                        { label: "Logout", action: handleLogout, icon: <FiLogOut className="w-6 h-6" />, color: "bg-gradient-to-r from-[#0FAE96] to-[#0FAE96]" },
                    ].map((item, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between bg-[rgba(255,255,255,0.08)] rounded-lg p-4 hover:bg-[rgba(255,255,255,0.12)] transition-all duration-300 cursor-pointer"
                            onClick={item.action}
                        >
                            <div className="flex items-center space-x-4">
                                <div className="text-[#ECF1F0] opacity-80">{item.icon}</div>
                                <span className="text-[#ECF1F0] font-medium text-lg">{item.label}</span>
                            </div>
                            <button
                                className={`${item.color} text-white font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-all duration-300 transform hover:scale-105 focus:outline-none`}
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
};

export default Settings;