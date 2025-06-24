"use client";
import React, { useState } from "react";
import { auth } from "@/firebase/config";
import DeleteAccountModal from "../../../components/DeleteAccountModal";
import { FiKey, FiTrash2, FiLogOut } from "react-icons/fi";

const Settings = function () {
    let user = auth.currentUser;
    const [isModalOpen, setIsModalOpen] = useState(false);

    async function updateKey() {
        window.location.href = "/hr/updategemini";
    }

    async function deleteAccount() {
        window.location.href = "/deleteaccount";
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
                window.location.href = "/hr/login";
            }, 2000);
        } catch (error) {
            console.error("Error logging out:", error.message);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#11011E] via-[#35013E] to-[#11011E] px-4 py-12">
            <div className="w-full max-w-md p-8 rounded-2xl shadow-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] backdrop-blur-sm">
                <h1 className="text-center text-4xl font-extrabold text-[#ECF1F0] mb-8 bg-gradient-to-r from-[#0FAE96] to-[#FF00C7] bg-clip-text text-transparent">
                    Settings
                </h1>
                <div className="space-y-4">
                    {[
                        { label: "Update Gemini Key", action: updateKey, icon: <FiKey size={24} />, color: "bg-gradient-to-r from-[#0FAE96] to-[#0FAE96]" },
                        { label: "Delete Account", action: () => setIsModalOpen(true), icon: <FiTrash2 size={24} />, color: "bg-gradient-to-r from-red-600 to-red-800" },
                        { label: "Logout", action: handleLogout, icon: <FiLogOut size={24} />, color: "bg-gradient-to-r from-[#0FAE96] to-[#0FAE96]" },
                    ].map((item, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between bg-[rgba(255,255,255,0.08)] rounded-xl px-4 py-3 shadow-md hover:bg-opacity-20 transition-all duration-300"
                        >
                            <div className="flex items-center space-x-3">
                                <span className="text-[#ECF1F0]">{item.icon}</span>
                                <span className="text-[#ECF1F0] font-medium text-lg">{item.label}</span>
                            </div>
                            <button
                                className={`${item.color} text-white font-semibold text-base px-4 py-2 rounded-xl shadow-md hover:opacity-90 transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#11011E] focus:ring-[#0FAE96]`}
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