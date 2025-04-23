"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
import { getDatabase, ref, set } from "firebase/database";
import app from "@/firebase/config";
import { v4 as uuidv4 } from "uuid"; // Make sure this is installed

type ReferralParams = {
    referral?: string;
};

export default function ReferralPage({ params }: { params: Promise<ReferralParams> }) {
    const router = useRouter();
    const resolvedParams = use(params);
    const db = getDatabase(app);

    useEffect(() => {
        const referral = resolvedParams?.referral;

        if (!referral) return;

        // 1. Store referral in cookie
        document.cookie = `referral=${referral}; path=/; max-age=${30 * 24 * 60 * 60}`;

        // 2. Generate or get visitorId from cookie
        let visitorId = getCookie("visitorId");
        if (!visitorId) {
            visitorId = uuidv4();
            document.cookie = `visitorId=${visitorId}; path=/; max-age=${30 * 24 * 60 * 60}`;
        }

        // 3. Store visitor under their visitorId (to prevent multiple entries)
        // ✅ use `await set()` in an async function
        const storeVisitor = async () => {
            try {
                const visitorRef = ref(db, `visitors/${referral}/${visitorId}`);
                await set(visitorRef, {
                    timestamp: Date.now(),
                });
                console.log("✅ Visitor tracked successfully");
            } catch (err) {
                console.error("❌ Failed to write visitor:", err);
            }
        };

        storeVisitor();

        // 4. Redirect to homepage
        setTimeout(() => {
            router.push("/");
        }, 1500);
    }, [resolvedParams?.referral, router, db]);

    // Helper function to get a cookie
    const getCookie = (name: string): string | null => {
        const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
        return match ? match[2] : null;
    };

    return (
        <div className="flex items-center justify-center h-screen w-full bg-[#11011E]">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-[#0FAE96] border-solid mb-4"></div>
          <p className="text-[#ECF1F0] text-lg font-medium">
            Loading,Please Wait...
          </p>
        </div>
      </div>
    );
}
