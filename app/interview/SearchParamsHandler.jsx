'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function SearchParamsHandler() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code");
    console.log(code, "code");
    if (code) {
      localStorage.setItem("hr_code", code);
      console.log("Saved HR Code to localStorage:", code);
    }
  }, [searchParams]);

  return null; // No UI rendering
}