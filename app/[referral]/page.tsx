"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { use } from "react"; // Unwraps promises in Next.js 14+

type ReferralParams = {
    referral?: string;
};

export default function ReferralPage({ params }: { params: Promise<ReferralParams> }) {
    const router = useRouter();
    const resolvedParams = use(params); // Unwrap the Promise

    useEffect(() => {
        if (resolvedParams?.referral) {
            document.cookie = `referral=${resolvedParams.referral}; path=/; max-age=${30 * 24 * 60 * 60}`;
            router.push("/"); // Redirect to Home Page
        }
    }, [resolvedParams?.referral, router]);

    return <div>Redirecting...</div>; // Temporary UI before redirect
}
