"use client";

import { useEffect, useState} from "react";
import { useParams } from "next/navigation";
import { getDatabase, ref, get, update } from "firebase/database";
import { Candidate } from "@/components/types/types";
import { onAuthStateChanged } from "firebase/auth";
import app, { auth } from "@/firebase/config";
import Link from "next/link";

export default function CandidatePage() {
  const { email: rawEmail } = useParams() as { email: string };
  const email = decodeURIComponent(rawEmail).toLowerCase();

  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [uid, setUid] = useState<string | null>(null);
  const [subscriptionType, setSubscriptionType] = useState<"Free" | "Premium">("Free");
  const [quotaLeft, setQuotaLeft] = useState<number>(0);
  const [hasViewed, setHasViewed] = useState(false);

  const db = getDatabase(app);

  // ✅ Fetch subscription type and usage metrics
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userUid = user.uid;
        setUid(userUid);

        const subRef = ref(db, `hr/${userUid}/Payment/SubscriptionType`);
        const usageRef = ref(db, `hr/${userUid}/usage/metrics`);
        const maxQuota = subscriptionType === "Premium" ? 500 : 10;

        try {
          // Get subscription type
          const subSnap = await get(subRef);
          const subType = subSnap.exists() && subSnap.val() === "Premium" ? "Premium" : "Free";
          setSubscriptionType(subType);

          // Ensure usage node exists
          const usageSnap = await get(usageRef);
          if (!usageSnap.exists()) {
            await update(usageRef, {
              matchesFound: 0,
              candidatesViewed: 0,
              quotaLeft: subType === "Premium" ? 500 : 10,
            });
            setQuotaLeft(subType === "Premium" ? 500 : 10);
          } else {
            const usage = usageSnap.val();
            setQuotaLeft(usage.quotaLeft ?? maxQuota);
          }

        } catch (err) {
          console.error("Error fetching subscription or usage data:", err);
        }
      } else {
        window.location.href = "/hr/login";
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [db, subscriptionType]);

  // ✅ Increment candidate views and update quota
  const incrementCandidateView = async () => {
    if (!uid || hasViewed) return; // Prevent multiple increments
    const usageRef = ref(db, `hr/${uid}/usage/metrics`);
    const maxQuota = subscriptionType === "Premium" ? 500 : 10;

    try {
      const snapshot = await get(usageRef);
      const data = snapshot.val();

      if (snapshot.exists() && data?.quotaLeft > 0) {
        const updatedMatchesFound = data?.matchesFound ?? 0;
        const newViewed = (data.candidatesViewed ?? 0) + 1;
        const newQuota = Math.max(maxQuota - updatedMatchesFound, 0);

        await update(usageRef, {
          candidatesViewed: newViewed,
          quotaLeft: newQuota,
        });

        setQuotaLeft(newQuota);
        setHasViewed(true); // Mark as viewed
      } else {
        console.warn("Quota exceeded or usage not initialized.");
      }
    } catch (error) {
      console.error("Failed to update candidate view metrics:", error);
    }
  };

  // Reset hasViewed when email changes
  useEffect(() => {
    setHasViewed(false); // Reset when a new candidate is loaded
  }, [email]);


  // ✅ Fetch candidate data once UID is known
  useEffect(() => {
    if (!uid || quotaLeft <= 0) return;

    const fetchCandidate = async () => {
      try {
        const snapshot = await get(ref(db, "talent_pool"));
        if (snapshot.exists()) {
          const candidatesObj: { [key: string]: Candidate } = snapshot.val();
          const found = Object.values(candidatesObj).find(
            (candidate) => candidate.email === email
          );
          setCandidate(found ?? null);
        } else {
          setCandidate(null);
        }
      } catch (err) {
        console.error("Failed to fetch candidate:", err);
        setCandidate(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidate();
  }, [email, uid, db, quotaLeft]);

  // ✅ Increment view only if quota is not exceeded
  const onViewClick = function () {
    if (candidate && uid && quotaLeft > 0) {
      incrementCandidateView();
    }
  }

  if (loading) {
    return <p className="p-6 text-gray-500">Loading candidate...</p>;
  }

  if (quotaLeft <= 0) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold text-red-500 mb-4">Quota Limit Reached</h2>
        <p className="text-gray-700 mb-4">
          You&rsquo;ve used all your candidate views under the <strong>{subscriptionType}</strong> plan.
        </p>
        <Link href="/hr/talent_pool/search" className="text-blue-600 hover:underline">
          ← Back to Search
        </Link>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="p-6">
        <p className="text-red-500 mb-4">Candidate not found.</p>
        <Link href="/hr/talent_pool/search" className="text-blue-600 hover:underline">
          ← Back to Search
        </Link>
      </div>
    );
  }
  

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md space-y-6 dark:bg-neutral-900">
      <div className="flex justify-between items-center text-white">
        <div>
          <h1 className="text-2xl font-bold">{candidate.name}</h1>
          <p className="text-sm">{candidate.jobTitle}</p>
          <p className="text-sm">{candidate.location}</p>
        </div>
        <div className="text-right text-sm text-white">
          <p>Score: {candidate.score}</p>
          <p>{candidate.experience} yrs exp</p>
        </div>
      </div>

      <div className="space-y-2 text-white">
        <p className="text-sm">
          <strong>Email:</strong> {candidate.email}
        </p>
        <p className="text-sm">
          <strong>Phone:</strong> {candidate.phone}
        </p>
        <p className="text-sm">
          <strong>Education:</strong> {candidate.education}
        </p>
        <div>
          <strong>Skills:</strong>
          <div className="flex flex-wrap gap-2 mt-1">
            {candidate.skills?.map((skill) => (
              <span key={skill} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {candidate.resumeUrl && (
        <div className="mt-4">
          <a
            href={candidate.resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500"
            onClick={() => onViewClick()}
          >
            View Resume PDF
          </a>
        </div>
      )}
    </div>
  );
}