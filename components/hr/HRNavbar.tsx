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
import { FaUser, FaCog, FaCrown } from "react-icons/fa";

const Navbar = () => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isLogin, setIsLogin] = useState(null);
  const [fullName, setFullName] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(defaultProfileImage);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const db = getDatabase(app);

  useEffect(() => {
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
            let photoURL = snapshot.val()?.profilePhoto;
            let premium = snapshot.val()?.Payment?.Status;
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

            if (premium === "Premium") {
              setIsPremium(true);
            } else {
              setIsPremium(false);
            }

            if (
              photoURL &&
              typeof photoURL === "string" &&
              photoURL.startsWith("https://")
            ) {
              setProfilePhoto(photoURL);
            } else {
              setProfilePhoto(defaultProfileImage);
            }
          })
          .catch((error) => {
            console.error("Error fetching user data:", error);
            setProfilePhoto(defaultProfileImage);
          });
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsProfileMenuOpen(false);
  }, [pathname]);

  const isActive = (path) => pathname === path;
  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const toggleProfileMenu = () => setIsProfileMenuOpen((prev) => !prev);

  const handleSettings = async () => {
    try {
      window.location.href = "/hr/settings";
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-gradient-to-r from-[#11011E] to-[#2A0A3A] text-white py-4 px-6 sm:px-12 flex items-center justify-between z-50 shadow-lg shadow-[#ffffff]/20">
      <div className="flex items-center">
        <Link href="/hr">
        <Image
          src="/images/Logo.png"
          alt="Logo"
          width={40}
          height={40}
          className="animate-[logoFade_0.5s_ease-in-out] hover:scale-105 transition-transform duration-200"
        />
        </Link>
      </div>

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

      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}

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
                    width={40}
                    height={40}
                    className={`rounded-full object-cover ${
                      isPremium ? "border-2 border-yellow-400" : "border-2 border-gray-300"
                    } hover:scale-110 transition-transform duration-200 cursor-pointer`}
                    style={{ borderRadius: '50%', objectFit: 'cover', width: '40px', height: '40px' }}
                    onClick={toggleProfileMenu}
                  />
                  {isPremium && (
                    <FaCrown
                      className="absolute top-0 right-0 w-4 h-4 text-yellow-400 transform translate-x-1/2 -translate-y-1/2"
                      onClick={toggleProfileMenu}
                    />
                  )}
                </div>
                <span className="text-[#0FAE96]">{fullName}</span>
              </li>
              {isProfileMenuOpen && (
                <div className="mt-4 bg-[#2A0A3A] rounded-md shadow-lg py-2 px-4 relative">
                  <button
                    onClick={toggleProfileMenu}
                    className="absolute top-2 right-2 text-white hover:text-red-500 transition-colors duration-200"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                  <ul className="space-y-2">
                    <li>
                      <Link
                        href="/hr/profile"
                        className="flex items-center space-x-2 text-white hover:text-[#0FAE96] hover:bg-[#0FAE96]/20 px-2 py-1 rounded-md transition duration-200"
                        onClick={() => {
                          setIsMenuOpen(false);
                          setIsProfileMenuOpen(false);
                        }}
                      >
                        <FaUser className="w-4 h-4" />
                        <span>Profile</span>
                      </Link>
                    </li>
                    <li>
                      <button
                        onClick={() => {
                          handleSettings();
                          setIsMenuOpen(false);
                          setIsProfileMenuOpen(false);
                        }}
                        className="flex items-center space-x-2 text-white hover:text-[#0FAE96] hover:bg-[#0FAE96]/20 px-2 py-1 rounded-md transition duration-200 w-full text-left"
                      >
                        <FaCog className="w-4 h-4" />
                        <span>Settings</span>
                      </button>
                    </li>
                  </ul>
                </div>
              )}
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

      <div className="hidden sm:flex items-center space-x-4">
        {isLogin ? (
          <div className="relative flex items-center space-x-2">
            <div className="relative">
              <Image
                src={profilePhoto}
                alt="User Profile"
                width={40}
                height={40}
                className={`rounded-full object-cover ${
                  isPremium ? "border-2 border-yellow-400" : "border-2 border-gray-300"
                } hover:scale-110 transition-transform duration-200 cursor-pointer`}
                style={{ borderRadius: '50%', objectFit: 'cover', width: '40px', height: '40px' }}
                onClick={toggleProfileMenu}
              />
              {isPremium && (
                <FaCrown
                  className="absolute top-0 right-0 w-4 h-4 text-yellow-400 transform translate-x-1/2 -translate-y-1/2"
                  onClick={toggleProfileMenu}
                />
              )}
            </div>
            {isProfileMenuOpen && (
              <div className="absolute top-12 right-0 bg-[#2A0A3A] rounded-md shadow-lg py-2 w-40 z-50">
                <button
                  onClick={toggleProfileMenu}
                  className="absolute top-2 right-2 text-white hover:text-red-500 transition-colors duration-200"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
                <ul className="space-y-1">
                  <li>
                    <Link
                      href="/hr/profile"
                      className="flex items-center space-x-2 text-white hover:text-[#0FAE96] hover:bg-[#0FAE96]/20 px-4 py-2 rounded-md transition duration-200"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <FaUser className="w-4 h-4" />
                      <span>Profile</span>
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        handleSettings();
                        setIsProfileMenuOpen(false);
                      }}
                      className="flex items-center space-x-2 text-white hover:text-[#0FAE96] hover:bg-[#0FAE96]/20 px-4 py-2 rounded-md transition duration-200 w-full text-left"
                    >
                      <FaCog className="w-4 h-4" />
                      <span>Settings</span>
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
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