import { useState, useEffect } from "react";
import {
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
  reauthenticateWithPopup,
  GoogleAuthProvider,
  User,
  Auth,
} from "firebase/auth";
import { getDatabase, ref, remove, set } from "firebase/database";
import app, { auth } from "@/firebase/config";
import { toast } from "react-toastify";
// import { User } from "lucide-react";


interface DeleteAccountModalProps {
  onClose: () => void;
}

export default function DeleteAccountModal({ onClose }: DeleteAccountModalProps) {
  const [reason, setReason] = useState<string>("");
  const [confirmation, setConfirmation] = useState<string>("");
  const [showReauth, setShowReauth] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const db = getDatabase(app)
  // Prevent background scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);
  useEffect(()=>{
    if(auth.currentUser){
      let email = auth.currentUser.email;
      setEmail(email)
    }
  },[])

  const deleteUserData = async (uid: string): Promise<void> => {
    try {
      const userRef = ref(db, `user/${uid}`);
      await remove(userRef);
      console.log("User data deleted from Realtime Database");
    } catch (error: any) {
      console.error("Error deleting user data:", error.message);
      throw error;
    }
  };

  //SAVE DELETED MESSAGE IN FIREABSE
  const handleSaveMessage = async (uid: string, email: string, reason: string): Promise<void> => {
    try {
      const messageRef = ref(db, `DeletedUser/Message/${uid}`);
      await set(messageRef, {
        email,
        text: reason,
        timestamp: Date.now(), // Optional: Add timestamp for tracking
      });
      console.log("Message saved successfully for UID:", uid);
    } catch (error: any) {
      console.error("Error saving message:", error.message);
      throw new Error(`Failed to save message: ${error.message}`);
    }
  };

  const handleLogout = async (): Promise<void> => {
    try {
      await auth.signOut();
      console.log("User signed out");
      localStorage.clear();
      console.log("LocalStorage cleared");

      // Notify extension (replace with actual implementation if needed)
      const notificationSuccess = notifyExtensionOnLogout();
      console.log("Notification success:", notificationSuccess);
      if (!notificationSuccess) {
        console.warn("Logout notification may not have been processed correctly");
      }

      setTimeout(() => {
        console.log("Redirecting...");
        window.location.href = "/";
      }, 1000);
    } catch (error: any) {
      console.error("Error logging out:", error.message);
      alert("Error logging out: " + error.message);
    }
  };

  const handleReauthenticate = async (user: User): Promise<void> => {
    console.log("Starting re-authentication");
    try {
      const providerData = user.providerData[0]?.providerId;
      console.log("Provider:", providerData);

      if (providerData === "password") {
        console.log("Attempting email/password re-auth");
        const credential = EmailAuthProvider.credential(email, password);
        await reauthenticateWithCredential(user, credential);
      } else if (providerData === "google.com") {
        console.log("Attempting Google re-auth");
        const provider = new GoogleAuthProvider();
        await reauthenticateWithPopup(user, provider);
      } else {
        throw new Error(`Unsupported provider: ${providerData}`);
      }

      console.log("Re-authentication successful, retrying deletion");
      await deleteUserData(user.uid);
      await deleteUser(user);
      toast.success("Account deleted successfully!");
      await handleLogout();
      setShowReauth(false);
      onClose();
    } catch (error: any) {
      console.error("Re-authentication failed:", error.message);
      alert("Re-authentication failed: " + error.message);
    }
  };

  const handleDelete = async (): Promise<void> => {
    try {
      if (confirmation.toUpperCase() !== "DELETE") {
        alert("Please type 'DELETE' to confirm.");
        return;
      }

      const user = auth.currentUser;
      if (!user) {
        alert("No user is signed in.");
        return;
      }

      try {
        await handleSaveMessage(user.uid,email,reason);
        await deleteUserData(user.uid);
        await deleteUser(user);
        toast.success("Account deleted successfully!");
        await handleLogout();
        onClose();
      } catch (error: any) {
        if (error.code === "auth/requires-recent-login") {
          console.log("Requires recent login, showing re-auth form");
          setShowReauth(true);
        } else {
          console.error("Delete error:", error.message);
          alert("Failed to delete account: " + error.message);
        }
      }
    } catch (error: any) {
      console.error("Unexpected error in handleDelete:", error.message);
      alert("An unexpected error occurred: " + error.message);
    }
  };

  // Placeholder for notifyExtensionOnLogout (replace with actual implementation)
  const notifyExtensionOnLogout = (): boolean => {
    // Implement your extension notification logic here
    return true; // Return true for success, false for failure
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-[#1A1A2E] border border-gray-600 text-white p-6 rounded-xl shadow-2xl max-w-md w-full relative animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-3 right-4 text-gray-400 hover:text-red-500 text-2xl"
          onClick={onClose}
        >
          ×
        </button>
        <h2 className="text-2xl font-bold text-center mb-3">Confirm Account Deletion</h2>
        <p className="text-center text-sm text-gray-400 mb-6">
          Deleting your account will permanently remove all data. This action cannot be undone.
        </p>

        {!showReauth ? (
          <>
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
            <div className="mb-4">
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter your reason (optional)"
                className="w-full p-2 rounded-lg bg-[#2E2E4E] text-white border border-gray-500 focus:ring-2 focus:ring-gray-400"
              />
            </div>
            <button
              onClick={handleDelete}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-semibold transition shadow-lg"
            >
              Delete Account
            </button>
          </>
        ) : (
          <>
            <h3 className="text-lg font-semibold text-center mb-3">
              Please sign in again to confirm deletion
            </h3>
            {auth.currentUser?.providerData[0]?.providerId === "password" ? (
              <div className="mb-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full p-2 rounded-lg bg-[#2E2E4E] text-white border border-gray-500 focus:ring-2 focus:ring-red-500 mb-2"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full p-2 rounded-lg bg-[#2E2E4E] text-white border border-gray-500 focus:ring-2 focus:ring-red-500"
                />
              </div>
            ) : (
              <p className="text-center text-sm text-gray-400 mb-4">
                Please re-authenticate with your {auth.currentUser?.providerData[0]?.providerId} account.
              </p>
            )}
            <button
              onClick={() => handleReauthenticate(auth.currentUser!)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition shadow-lg"
            >
              {auth.currentUser?.providerData[0]?.providerId === "password"
                ? "Re-authenticate"
                : "Sign in with Google"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}