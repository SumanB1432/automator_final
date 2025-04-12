"use client"
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ToastContainer } from "react-toastify";
import { usePathname } from "next/navigation";
import { useState,useEffect } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const [name,setName] = useState("pt-16");

  const hideNavAndFooter = pathname === "/atsresume/createresume"; 
  // Adjust this route if your file path is different
  useEffect(() => {
    if (hideNavAndFooter) {
      setName("pt-1");
    } else {
      setName("pt-16");
    }
  }, [hideNavAndFooter]);
  

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ToastContainer />
        {!hideNavAndFooter && <Navbar />}
        <main className={name}>{children}</main>
        {!hideNavAndFooter && <Footer />}
      </body>
    </html>
  );
}