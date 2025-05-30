'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import CryptoJS from 'crypto-js';


export default function SearchParamsHandler() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code");
    const title = searchParams.get("title")
    if (code) {
      try {
        const decoded = decodeURIComponent(code); // ✅ decode it first!
        const decode_title = decodeURIComponent(title)
        const secret = "a1d604f8305dd7882459029f21891b84";
        const bytes = CryptoJS.AES.decrypt(decoded, secret);
        const decryptedUID = bytes.toString(CryptoJS.enc.Utf8);

        if (!decryptedUID) throw new Error("Decryption failed or returned empty string");

        localStorage.setItem("hr_code", decryptedUID);
        localStorage.setItem("title",decode_title)
        console.log(title)
        console.log("✅ HR Code saved to localStorage:", decryptedUID);
      } catch (err) {
        console.error("❌ Failed to decrypt code:", err);
      }
    }
  }, [searchParams]);

  return null; // No UI rendering
}
