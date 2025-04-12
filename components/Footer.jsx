"use client";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { FaInstagram, FaFacebook, FaYoutube, FaLinkedin } from "react-icons/fa";
import Image from "next/image";

const Footer = () => {
  const footerRef = useRef(null);
  const [isInView, setIsInView] = useState(false);
  const socialLinks = [
    { name: "instagram", color: "hover:text-pink-500",link:"https://www.instagram.com/jobform.automator_offical" },
    { name: "facebook", color: "hover:text-blue-600",link:"https://www.facebook.com/people/Job-Tips/61556365446390/" },
    { name: "linkedin", color: "hover:text-blue-400",link:"https://www.linkedin.com/company/aikingsolutions/posts/?feedView=all" },
    { name: "youtube", color: "hover:text-red-500",link:"https://www.youtube.com/@JobFormAutomator" },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsInView(entry.isIntersecting);
        });
      },
      { threshold: 0.2 }
    );

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    return () => {
      if (footerRef.current) {
        observer.unobserve(footerRef.current);
      }
    };
  }, []);

  return (
    <footer
      ref={footerRef}
      className={`text-gray-300 py-12 sm:py-16 transition-all duration-700 ease-in-out 
      bg-gradient-to-b from-[#11011E] to-[#1A0435] border-t border-gray-800/30 
      ${isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Logo and Social Links */}
          <div className="col-span-2 sm:col-span-2 lg:col-span-1 flex flex-col items-start space-y-6">
            <Image
              src="/images/Logo.png"
              alt="Logo"
              width={45}
              height={45}
              className="hover:opacity-80 transition-opacity filter drop-shadow-lg"
            />

            <div className="flex flex-wrap gap-5">
              {socialLinks.map(({ name, color }) => (
                <a
                  key={name}
                  href="#"
                  aria-label={`Follow us on ${name}`}
                  className={`text-gray-400 transform hover:scale-110 
        transition-all duration-300 ease-out hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] ${color}`}
                >
                  {name === "instagram" && <FaInstagram size={22} />}
                  {name === "facebook" && <FaFacebook size={22} />}
                  {name === "linkedin" && <FaLinkedin size={22} />}
                  {name === "youtube" && <FaYoutube size={22} />}
                </a>
              ))}
            </div>
            <p className="mt-4 text-sm text-gray-400 font-light">
              © 2024 JobFormAutomator. <span className="hidden sm:inline">All rights reserved.</span>
            </p>
          </div>

          {/* Navigation Sections */}
          {["Quick Links", "Features", "Help"].map((section) => (
            <div key={section} className="flex flex-col space-y-4">
              <h3 className="text-lg font-bold text-white relative inline-flex items-center group">
                {section}
                <span className="absolute -bottom-2 left-0 w-12 h-0.5 bg-purple-500/80 
                group-hover:w-full transition-all duration-300"></span>
              </h3>
              <ul className="space-y-3 mt-2">
                {section === "Quick Links" &&
                  [
                    { name: "Home", path: "/" },
                    { name: "Referral", path: "/referral" },
                    { name: "About", path: "/about" },
                  ].map((item) => (
                    <FooterLink key={item.name} href={item.path} text={item.name} />
                  ))}

                {section === "Features" &&
                  [
                    { name: "ATSCheck", path: "/atsresume" },
                    { name: "QuickResume", path: "/atsresume" },
                    { name: "SkillMatch", path: "/atsresume" },
                  ].map((item) => (
                    <FooterLink key={item.name} href={item.path} text={item.name} />
                  ))}

                {section === "Help" &&
                  [
                    { name: "Contact Us", path: "/contactUs" },
                    { name: "Settings", path: "/settings" },
                  ].map((item) => (
                    <FooterLink key={item.name} href={item.path} text={item.name} />
                  ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
};

const FooterLink = ({ href, text }) => (
  <li>
    <Link
      href={href}
      className="text-gray-400 hover:text-white transition-all duration-200 flex items-center group
      hover:translate-x-1 relative overflow-hidden"
    >
      <span
        className="absolute left-0 w-full h-[1px] bg-purple-500/30 -translate-x-full 
        group-hover:translate-x-0 transition-transform duration-300"
      ></span>
      <span className="opacity-0 group-hover:opacity-100 mr-2 transition-opacity">›</span>
      {text}
    </Link>
  </li>
);

export default Footer;