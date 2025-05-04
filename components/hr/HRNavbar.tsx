"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const HRNavbar = () => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path: string) => pathname === path;
  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  // Auto-close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  return (
    <nav className="fixed top-0 left-0 w-full bg-gradient-to-r from-[#11011E] to-[#2A0A3A] text-white py-4 px-6 sm:px-12 flex items-center justify-between z-50 shadow-lg shadow-[#ffffff]/20">
      {/* Logo */}
      <div className="flex items-center space-x-2">
        <Image
          src="/images/Logo.png"
          alt="Logo"
          width={40}
          height={40}
          className="animate-[logoFade_0.5s_ease-in-out] hover:scale-105 transition-transform duration-200"
        />
        <span className="text-lg font-semibold hidden sm:inline">HR Panel</span>
      </div>

      {/* Desktop Menu */}
      <ul className="hidden sm:flex space-x-8 text-sm sm:text-base">
        {[
          { label: "Dashboard", path: "/hr" },
          { label: "Post Job", path: "/hr/post-job" },
          { label: "Applicants", path: "/hr/applicants" },
          { label: "Analyze", path: "/hr/analyze-resumes" },
          { label: "Insights", path: "/hr/talent-insights" },
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

      {/* Backdrop */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}

      {/* Mobile Menu */}
      <div
        className={`sm:hidden fixed top-0 left-0 w-4/5 h-full bg-[#11011E] py-6 px-6 shadow-lg z-50 transform transition-transform duration-300 ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <ul className="space-y-6 text-base">
          {[
            { label: "Dashboard", path: "/hr" },
            { label: "Post Job", path: "/hr/post-job" },
            { label: "Applicants", path: "/hr/applicants" },
            { label: "Analyze", path: "/hr/analyze-resumes" },
            { label: "Insights", path: "/hr/talent-insights" },
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
        </ul>
      </div>
    </nav>
  );
};

export default HRNavbar;
