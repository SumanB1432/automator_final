"use client";
import React from "react";

export const PageBreakGuide = ({ index }: { index: number }) => (
  <div className="relative print:hidden">
    <div className="border-t border-dashed border-gray-300 my-2" />
    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 text-xs text-gray-400">
      Page {index + 1}
    </div>
  </div>
);
