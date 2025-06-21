/** @format */
"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { auth } from "@/firebase/config";
import app from "@/firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, get } from "firebase/database";
import defaultProfileImage from "../../public/images/profile.jpeg";

const Navbar = () => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isLogin, setIsLogin] = useState(null);
  const [fullName, setFullName] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(defaultProfileImage); // Default profile photo
  const db = getDatabase(app);

  useEffect(() => {
    // Track authentication state
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      const loginStatus = localStorage.getItem("IsLoginAsHR");
      setIsLogin(loginStatus);

      const userId = localStorage.getItem("UIDforHR");
      if (userId) {
        const findUser = ref(db, `hr/${userId}`);
        get(findUser)
          .then((snapshot) => {
            let Name = snapshot.val()?.name;
            let fname = snapshot.val()?.fname;
            let lname = snapshot.val()?.lname;
            let photoURL = snapshot.val()?.profilePhoto; // Fetch profile photo URL
            let premium = snapshot.val()?.Payment?.Status; // Fetch premium status
            let user = "";

            if (Name) {
              user = Name;
              const cleanedName = user.replace(/\s/g, "");
              setFullName(user);
            } else {
              user = fname + " " + lname;
              const cleanedName = user.replace(/\s/g, "");
              setFullName(user);
            }

            // Set premium status
            if (premium === "Premium") {
              setIsPremium(true);
            } else {
              setIsPremium(false);
            }

            // Validate and set profile photo
            if (
              photoURL &&
              typeof photoURL === "string" &&
              photoURL.startsWith("https://")
            ) {
              setProfilePhoto(photoURL);
            } else {
              setProfilePhoto(defaultProfileImage); // Fallback to default image
            }
          })
          .catch((error) => {
            console.error("Error fetching user data:", error);
            setProfilePhoto(defaultProfileImage); // Fallback on error
          });
      }
    };

    fetchUserData();
  }, []);

  // Close the mobile menu when the pathname changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const isActive = (path) => pathname === path;
  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  const handleSettings = async () => {
    try {
      window.location.href = "/hr/settings";
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-gradient-to-r from-[#11011E] to-[#2A0A3A] text-white py-4 px-6 sm:px-12 flex items-center justify-between z-50 shadow-lg shadow-[#ffffff]/20">
      {/* Logo */}
      <div className="flex items-center">
        <Image
          src="/images/Logo.png"
          alt="Logo"
          width={40}
          height={40}
          className="animate-[logoFade_0.5s_ease-in-out] hover:scale-105 transition-transform duration-200"
        />
      </div>

      {/* Desktop Menu */}
      <ul className="hidden sm:flex space-x-8 text-sm sm:text-base">
        {[
          { label: "Home", path: "/hr" },
          { label: "Parse Resume", path: "/hr/resumeUpload" },
          { label: "About", path: "/hr/aboutUs" },
          { label: "Policy", path: "/hr/policy" },
          { label: "For Candidates", path: "/" },
        ].map((item) => (
          <li
            key={item.path}
            className={`${
              isActive(item.path)
                ? "text-[#0FAE96] border-b-2 border-[#0FAE96]"
                : "hover:text-[#0FAE96] hover:bg-[#0FAE96]/20"
            } px-2 py-1 rounded-md transition duration-200 transform hover:scale-105`}
          >
            <Link href={item.path}>{item.label}</Link>
          </li>
        ))}
      </ul>

      {/* Mobile Menu Toggle */}
      <div className="sm:hidden flex items-center">
        <button
          onClick={toggleMenu}
          className="text-[#0FAE96] focus:outline-none focus:ring-2 focus:ring-[#0FAE96] rounded"
        >
          <svg
            className={`w-6 h-6 transform transition-transform duration-300 ${
              isMenuOpen ? "rotate-45" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d={
                isMenuOpen
                  ? "M6 18L18 6M6 6l12 12"
                  : "M4 6h16M4 12h16m-7 6h7"
              }
            />
          </svg>
        </button>
      </div>

      {/* Backdrop for Mobile Menu */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}

      {/* Mobile Dropdown Menu */}
      <div
        className={`sm:hidden fixed top-0 left-0 w-4/5 h-full bg-[#11011E] py-6 px-6 shadow-lg z-50 transform transition-transform duration-300 ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <ul className="space-y-6 text-base">
          {[
            { label: "Home", path: "/hr" },
            { label: "Parse Resume", path: "/hr/resumeUpload" },
            { label: "About", path: "/hr/aboutUs" },
            { label: "Contact Us", path: "/hr/contactUs" },
            { label: "For Candidates", path: "/" },
          ].map((item) => (
            <li
              key={item.path}
              className={`${
                isActive(item.path)
                  ? "text-[#0FAE96] border-l-4 border-[#0FAE96]"
                  : "hover:text-[#0FAE96] hover:bg-[#0FAE96]/20"
              } px-2 py-1 rounded-md transition duration-200 transform hover:scale-105`}
            >
              <Link
                href={item.path}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMenuOpen(false);
                }}
              >
                {item.label}
              </Link>
            </li>
          ))}
          {isLogin ? (
            <>
              <li className="flex items-center space-x-2">
                <div className="relative">
                  <Image
                    src={profilePhoto}
                    alt="User Profile"
                    width={32}
                    height={32}
                    className={`rounded-full object-cover ${
                      isPremium
                        ? "border-2 border-yellow-400"
                        : "border-2 border-gray-300"
                    }`}
                  />
                  {isPremium && (
                    <svg
                      className="absolute -top-1 -right-1 w-4 h-4 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M3 8l3-5 3 5 3-5 3 5 3-5 3 5h-18zM3 8v8h18v-8h-3l-2 4-2-4-2 4-2-4-2 4-2-4h-3z" />
                    </svg>
                  )}
                </div>
                <span className="text-[#0FAE96]">{fullName}</span>
              </li>
              <li>
                <button
                  onClick={() => {
                    handleSettings();
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left hover:text-[#0FAE96] hover:bg-[#0FAE96]/20 px-2 py-1 rounded-md transition duration-200 transform hover:scale-105"
                >
                  Settings
                </button>
              </li>
            </>
          ) : (
            <li className="hover:text-[#0FAE96] transition duration-200 transform hover:scale-105">
              <Link href="/hr/login" onClick={() => setIsMenuOpen(false)}>
                Login / Sign Up
              </Link>
            </li>
          )}
        </ul>
      </div>

      {/* Auth Buttons */}
      <div className="hidden sm:flex items-center space-x-4">
        {isLogin ? (
          <>
            <div className="relative group flex items-center space-x-2">
              <div className="relative">
                <Image
                  src={profilePhoto}
                  alt="User Profile"
                  width={32}
                  height={32}
                  className={`rounded-full object-cover transition-transform duration-200 group-hover:scale-110 ${
                    isPremium ? "border-2 border-yellow-400" : "border-2 border-gray-300"
                  }`}
                />
                {isPremium && (
                  <svg
                    className="absolute -top-1 -right-1 w-4 h-4 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    >
                    <path d="M3 8l3-5 3 5 3-5 3 5 3-5 3 5h-18zM3 8v8h18v-8h-3l-2 4-2-4-2 4-2-4-2 4-2-4h-3z" />
                  </svg>
                )}
              </div>
              <span className="absolute top-full mt-2 hidden group-hover:block bg-[#0FAE96] text-black text-xs rounded-md px-2 py-1">
                {fullName}
              </span>
            </div>
            <button
              onClick={handleSettings}
              className="bg-[#0FAE96] text-black px-4 py-2 rounded-md hover:bg-[#0FAE96]/80 transform transition duration-200 hover:scale-105 text-sm sm:text-base"
            >
              Settings
            </button>
          </>
        ) : (
          <>
            <Link href="/hr/login">
              <button className="text-sm sm:text-base text-white hover:text-[#0FAE96] hover:bg-[#0FAE96]/20 px-2 py-1 rounded-md transform transition duration-200 hover:scale-105">
                Login
              </button>
            </Link>
            <Link href="/hr/signUp">
              <button className="bg-[#0FAE96] text-black px-4 py-2 rounded-md hover:bg-[#0FAE96]/80 transform transition duration-200 hover:scale-105 text-sm sm:text-base">
                Sign Up
              </button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;