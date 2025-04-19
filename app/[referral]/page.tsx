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
        <div className="h-screen bg-[#11011E] text-[#ECF1F0] flex flex-col justify-center items-center">
            <h1 className="text-3xl font-bold text-[#0FAE96]">Tracking your visit...</h1>
            <p className="mt-4 text-lg">You came through referral link: <strong>{resolvedParams?.referral}</strong></p>
            <p className="text-sm mt-2 text-gray-400">Redirecting to homepage...</p>
        </div>
    );
}
