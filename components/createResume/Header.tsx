/** @format */

"use client";
import React, { useState } from "react";
import { BsGrid, BsList } from "react-icons/bs";
import GridView from "./GridView";
import ListView from "./ListView";
import { usePathname } from "next/navigation";

const Header = () => {
  const [viewMode, setViewMode] = useState("grid");
  const pathname = usePathname();

  return (
    <div>
      <div className="w-full p-4 text-white">
        <div className="container mx-auto">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
             
              <span className="text-2xl font-bold">Resumes</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md ${
                  viewMode === "grid" ? "bg-[#ffffff1a]" : (
                    "hover:bg-[#ffffff0f]"
                  )
                }`}>
                <BsGrid size={20} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md ${
                  viewMode === "list" ? "bg-[#ffffff1a]" : (
                    "hover:bg-[#ffffff0f]"
                  )
                }`}>
                <BsList size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Render the appropriate view based on viewMode */}
      {pathname === "/create-resumes" &&
        (viewMode === "grid" ? <GridView /> : <ListView />)}
    </div>
  );
};

export default Header;
