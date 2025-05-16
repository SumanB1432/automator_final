import { useState, useEffect } from "react";

export default function DeleteAccountModal({ onClose }) {
  const [reason, setReason] = useState("");
  const [confirmation, setConfirmation] = useState("");

  // Prevent background scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleDelete = () => {
    if (confirmation === "DELETE") {
      alert("Account Deleted Successfully!");
      handleLogout()
      onClose();
    } else {
      alert("Please type 'DELETE' to confirm.");
    }
  };

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
        window.location.href = "/";
      }, 1000);
    } catch (error) {
      console.error("Error logging out:", error.message);
    }
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-[#1A1A2E] border border-gray-600 text-white p-6 rounded-xl shadow-2xl max-w-md w-full relative animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          className="absolute top-3 right-4 text-gray-400 hover:text-red-500 text-2xl"
          onClick={onClose}
        >
          &times;
        </button>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center mb-3">Confirm Account Deletion</h2>
        <p className="text-center text-sm text-gray-400 mb-6">
          Deleting your account will permanently remove all data. This action cannot be undone.
        </p>

        {/* Confirmation Input */}
        <div className="mb-4">
          <label className="text-sm block text-gray-300 mb-2 text-center">
            Type <span className="font-bold text-red-500">"DELETE"</span> to confirm:
          </label>
          <input
            type="text"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            placeholder="Type DELETE"
            className="w-full p-2 rounded-lg bg-[#2E2E4E] text-white border border-gray-500 focus:ring-2 focus:ring-red-500 text-center"
          />
        </div>

        {/* Reason Input */}
        <div className="mb-4">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter your reason (optional)"
            className="w-full p-2 rounded-lg bg-[#2E2E4E] text-white border border-gray-500 focus:ring-2 focus:ring-gray-400"
          />
        </div>

        {/* Delete Button */}
        <button
          onClick={handleDelete}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-semibold transition shadow-lg"
        >
          Delete Account
        </button>
      </div>
    </div>
  );
}
