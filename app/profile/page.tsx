/** @format */
"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@/firebase/config";
import app from "@/firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref as dbRef, get, update } from "firebase/database";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import defaultProfileImage from "@/public/images/profile.jpeg";
import { FaUser, FaEnvelope, FaCrown, FaSave, FaTimes, FaUpload } from "react-icons/fa";

const CandidateProfilePage = () => {
  const [user, setUser] = useState(null);
  const [isLogin, setIsLogin] = useState(null);
  const [fullName, setFullName] = useState("Unknown User");
  const [email, setEmail] = useState("No email available");
  const [isPremium, setIsPremium] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(defaultProfileImage);
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [error, setError] = useState(null);
  const [file, setFile] = useState(null);
  const db = getDatabase(app);
  const storage = getStorage(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    }, (err) => {
      console.error("Auth state error:", err);
      setError("Failed to load authentication state.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      const loginStatus = localStorage.getItem("IsLogin");
      setIsLogin(loginStatus);

      const userId = localStorage.getItem("UID");
      if (!userId) {
        setError("User ID not found. Please log in again.");
        setLoading(false);
        return;
      }

      try {
        const findUser = dbRef(db, `user/${userId}`);
        const snapshot = await get(findUser);
        if (!snapshot.exists()) {
          setError("User data not found in database.");
          setLoading(false);
          return;
        }

        const data = snapshot.val();
        let userName = data?.name || (data?.fname && data?.lname ? `${data.fname} ${data.lname}` : "Unknown User");
        let userEmail = data?.email || "No email available";
        let premium = data?.Payment?.Status || "Free";
        let photoURL = data?.profilePhoto || "";

        setFullName(userName);
        setEmail(userEmail);
        setIsPremium(premium === "Premium");

        if (photoURL && typeof photoURL === "string" && photoURL.startsWith("https://")) {
          setProfilePhoto(photoURL);
          setImageError(false);
        } else {
          setProfilePhoto(defaultProfileImage);
          setImageError(true);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Failed to load profile data.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) {
      setFile(null);
      return;
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!allowedTypes.includes(selectedFile.type)) {
      alert("Please upload a valid image file (JPEG, PNG, or GIF).");
      setFile(null);
      e.target.value = null; // Clear input
      return;
    }

    // Validate file size (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB.");
      setFile(null);
      e.target.value = null;
      return;
    }

    setFile(selectedFile);
  };

  const handleSave = async () => {
    const userId = localStorage.getItem("UID");
    if (!userId) {
      alert("User ID not found. Please log in again.");
      return;
    }

    if (!file) {
      alert("Please select an image to upload.");
      return;
    }

    setUploadLoading(true);
    try {
      // Upload to Firebase Storage
      const fileRef = storageRef(storage, `user_profile_photos/${userId}/${file.name}`);
      await uploadBytes(fileRef, file);
      const downloadURL = await getDownloadURL(fileRef);

      // Update Realtime Database
      const userRef = dbRef(db, `user/${userId}`);
      await update(userRef, { profilePhoto: downloadURL });

      // Update local state
      setProfilePhoto(downloadURL);
      setImageError(false);
      setFile(null);
      alert("Profile photo updated successfully!");
    } catch (error) {
      console.error("Error uploading profile photo:", error);
      alert("Failed to update profile photo. Please try again.");
      setImageError(true);
      setProfilePhoto(defaultProfileImage);
    } finally {
      window.location.href = "/profile";
      setUploadLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#11011E] to-[#2A0A3A] text-white flex items-center justify-center">
        <p className="text-[#0FAE96] text-lg">Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#11011E] to-[#2A0A3A] text-white flex flex-col items-center py-12 px-6 sm:px-12">
        <Link href="/" className="absolute top-4 right-4">
          <FaTimes className="w-6 h-6 text-white hover:text-red-500 transition-colors duration-200" />
        </Link>
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#11011E] to-[#2A0A3A] text-white flex flex-col items-center py-12 px-6 sm:px-12">
      <Link href="/" className="absolute top-4 right-4">
        <FaTimes className="w-6 h-6 text-white hover:text-red-500 transition-colors duration-200" />
      </Link>

      <div className="relative flex flex-col items-center mb-8">
        <div className="relative">
          <Image
            src={imageError ? defaultProfileImage : profilePhoto}
            alt="Candidate Profile"
            width={150}
            height={150}
            className="rounded-full object-cover border-4 border-gray-300 shadow-lg"
            style={{ borderRadius: '50%', objectFit: 'cover', width: '150px', height: '150px' }}
            onError={() => {
              setImageError(true);
              setProfilePhoto(defaultProfileImage);
            }}
          />
          {isPremium && (
            <FaCrown className="absolute -top-2 right-0 w-6 h-6 text-yellow-400" />
          )}
        </div>
        <h1 className="mt-4 text-2xl sm:text-3xl font-bold text-[#0FAE96]">
          {fullName}
        </h1>
        <p className="text-sm text-gray-400">{email}</p>
      </div>

      <div className="w-full max-w-md bg-[#2A0A3A]/50 backdrop-blur-md rounded-lg p-6 shadow-xl border border-[#0FAE96]/20">
        <h2 className="text-xl font-semibold mb-4 text-[#0FAE96]">
          Profile Details
        </h2>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <FaUser className="w-5 h-5 text-[#0FAE96]" />
            <div className="flex-1">
              <label className="text-sm text-gray-400">Full Name</label>
              <input
                type="text"
                value={fullName}
                disabled
                className="w-full bg-[#11011E] text-gray-400 rounded-lg px-4 py-2 border border-[#0FAE96]/30 cursor-not-allowed"
                placeholder="Your name"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <FaEnvelope className="w-5 h-5 text-[#0FAE96]" />
            <div className="flex-1">
              <label className="text-sm text-gray-400">Email</label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full bg-[#11011E] text-gray-400 rounded-lg px-4 py-2 border border-[#0FAE96]/30 cursor-not-allowed"
                placeholder="Your email"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <FaUpload className="w-5 h-5 text-[#0FAE96]" />
            <div className="flex-1">
              <label className="text-sm text-gray-400">Profile Photo</label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/gif"
                onChange={handleFileChange}
                className="w-full bg-[#11011E] text-white rounded-lg px-4 py-2 border border-[#0FAE96]/30 focus:outline-none focus:ring-2 focus:ring-[#0FAE96] transition duration-200"
              />
              {file && <p className="text-sm text-gray-400 mt-1">Selected: {file.name}</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-md bg-[#2A0A3A]/50 backdrop-blur-md rounded-lg p-6 shadow-xl border border-[#0FAE96]/20 mt-6">
        <h2 className="text-xl font-semibold mb-4 text-[#0FAE96]">
          Premium Status
        </h2>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FaCrown className={`w-5 h-5 ${isPremium ? "text-yellow-400" : "text-gray-400"}`} />
            <span>{isPremium ? "Premium Member" : "Free Member"}</span>
          </div>
          {!isPremium && (
            <Link href="/pricing">
              <button className="bg-[#0FAE96] text-black px-4 py-2 rounded-lg hover:bg-[#0FAE96]/80 transform transition duration-200 hover:scale-105 text-sm">
                Upgrade to Premium
              </button>
            </Link>
          )}
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={uploadLoading || !file}
        className={`mt-8 flex items-center space-x-2 px-6 py-3 rounded-lg transition duration-200 ${
          uploadLoading || !file
            ? "bg-gray-500 text-gray-300 cursor-not-allowed"
            : "bg-[#0FAE96] text-black hover:bg-[#0FAE96]/80 hover:scale-105"
        }`}
      >
        <FaSave className="w-5 h-5" />
        <span>{uploadLoading ? "Uploading..." : "Save Changes"}</span>
      </button>
    </div>
  );
};

export default CandidateProfilePage;