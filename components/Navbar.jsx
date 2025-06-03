/** @format */
"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { auth } from "@/firebase/config";
import app from "@/firebase/config";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { getDatabase, ref, get } from "firebase/database";

const Navbar = () => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isLogin, setIsLogin] = useState(null);
  const [fullName, setFullName] = useState("");
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
      const loginStatus = localStorage.getItem("IsLogin");
      setIsLogin(loginStatus);

      const userId = localStorage.getItem("UID");
      if (userId) {
        const findUser = ref(db, `user/${userId}`);
        get(findUser).then((snapshot) => {
          let Name = snapshot.val()?.name;
          let fname = snapshot.val()?.fname;
          let lname = snapshot.val()?.lname;
          let email = snapshot.val()?.email;
          let user = "";

          if (Name) {
            user = Name;
            const cleanedName = user.replace(/\s/g, "");
            localStorage.setItem("name", user);
            localStorage.setItem("email", email);
            setFullName(user);
          } else {
            user = fname + " " + lname;
            const cleanedName = user.replace(/\s/g, "");
            localStorage.setItem("name", user);
            localStorage.setItem("email", email);
            setFullName(user);
          }
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
      window.location.href = "/settings";
    } catch (error) {
      console.error("Error :", error);
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
          { label: "Home", path: "/" },
          { label: "Referral", path: "/referral" },
          { label: "Skill Advisor", path: "/course" },
          { label: "ATS Resume", path: "/atsresume" },
          { label: "For Recruiters", path: "/hr" },

        ].map((item) => (
          <li
            key={item.path}
            className={`${isActive(item.path) ? "text-[#0FAE96] border-b-2 border-[#0FAE96]" : "hover:text-[#0FAE96] hover:bg-[#0FAE96]/20"} px-2 py-1 rounded-md transition duration-200 transform hover:scale-105`}
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
          {/* Hamburger Icon */}
          <svg
            className={`w-6 h-6 transform transition-transform duration-300 ${isMenuOpen ? "rotate-45" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"}
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
        className={`sm:hidden fixed top-0 left-0 w-4/5 h-full bg-[#11011E] py-6 px-6 shadow-lg z-50 transform transition-transform duration-300 ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <ul className="space-y-6 text-base">
          {[
            { label: "Home", path: "/" },
            { label: "Referral", path: "/referral" },
            { label: "Skill Advisor", path: "/course" },
            { label: "ATS Resume", path: "/atsresume" },
            { label: "For Recruiters", path: "/hr" },
          ].map((item) => (
            <li
              key={item.path}
              className={`${isActive(item.path) ? "text-[#0FAE96] border-l-4 border-[#0FAE96]" : "hover:text-[#0FAE96] hover:bg-[#0FAE96]/20"} px-2 py-1 rounded-md transition duration-200 transform hover:scale-105`}
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
          {!isLogin && (
            <li className="hover:text-[#0FAE96] transition duration-200 transform hover:scale-105">
              <Link href="/sign-in" onClick={() => setIsMenuOpen(false)}>
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
            <button className="text-sm sm:text-base text-primary transform transition duration-200 hover:scale-105">
              {fullName}
            </button>
            <button
              onClick={handleSettings}
              className="bg-[#0FAE96] text-black px-4 py-2 rounded-md hover:bg-[#0FAE96]/80 transform transition duration-200 hover:scale-105 text-sm sm:text-base"
            >
              Settings
            </button>
          </>
        ) : (
          <>
            <Link href="/sign-in">
              <button className="text-sm sm:text-base text-white hover:text-[#0FAE96] hover:bg-[#0FAE96]/20 px-2 py-1 rounded-md transform transition duration-200 hover:scale-105">
                Login
              </button>
            </Link>
            <Link href="/sign-up">
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