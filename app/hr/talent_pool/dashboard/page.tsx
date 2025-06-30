'use client';

import React, { useEffect, useState } from 'react';
import { getDatabase, ref, onValue, get } from 'firebase/database';
import Link from 'next/link';
import app, { auth } from '@/firebase/config';
import { toast } from "react-toastify"
import { onAuthStateChanged } from 'firebase/auth';


export default function DashboardPage() {

  

  const [metrics, setMetrics] = useState({
    candidatesViewed: 0,
    matchesFound: 0,
    quotaLeft: 100,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uid, setUid] = useState("")
  const db = getDatabase(app);


  useEffect(() => {
    const isHRLoggedIn = localStorage.getItem("IsLoginAsHR");

    if (isHRLoggedIn !== "true") {
      toast.warning("Access denied. Please log in as an HR user.");

      setTimeout(() => {
        window.location.href = "/hr/login";
      }, 2000);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUid(user.uid);
      } else {
        setError("User not authenticated");
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!uid) return;

    const metricsRef = ref(db, `hr/${uid}/usage/metrics`);

    const unsubscribe = onValue(
      metricsRef,
      (snapshot) => {
        const data = snapshot.val();
        setMetrics({
          candidatesViewed: data?.candidatesViewed || 0,
          matchesFound: data?.matchesFound || 0,
          quotaLeft: data?.quotaLeft ?? (100 - (data?.matchesFound || 0)),
        });
        setError(null);
        setLoading(false);
      },
      (err) => {
        console.error('Error loading metrics:', err);
        setError('Failed to load real-time metrics.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [db, uid]);

  useEffect(() => {
    const getSubscriptionType = async function (uid: any) {
      const subRef = ref(db, `hr/${uid}/Payment/SubscriptionType`);
      const subSnap = await get(subRef);
      const subType = subSnap.exists() && subSnap.val() === "Premium" ? "Premium" : "Free";
    }

    getSubscriptionType(uid)


  })

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <p className="text-gray-400">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-5 bg-[#11011E] space-y-3 relative overflow-hidden min-h-screen flex flex-col">
      <div className="absolute inset-0 bg-gradient-to-br from-[#7000FF]/15 to-[#FF00C7]/15 opacity-25 blur-[180px] -z-10" />
      <h1 className="text-2xl sm:text-3xl font-raleway font-extrabold text-[#ECF1F0] tracking-tight">Dashboard</h1>

      {error && <p className="text-red-400 font-inter text-base bg-[rgba(255,255,255,0.03)] px-3 py-2 rounded-lg shadow-sm">{error}</p>}

      {/* Metrics Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        <div className="bg-[rgba(255,255,255,0.02)] p-4 rounded-xl border border-[rgba(255,255,255,0.05)] shadow-lg hover:shadow-xl hover:bg-[rgba(255,255,255,0.04)] transition-all duration-300 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#7000FF]/10 to-[#FF00C7]/10 opacity-20 blur-[120px] -z-10" />
          <h2 className="text-sm font-inter text-[#B6B6B6] uppercase tracking-wide">Candidates Viewed</h2>
          <p className="text-2xl font-raleway font-extrabold text-[#ECF1F0] mt-1">{metrics.candidatesViewed}</p>
        </div>
        <div className="bg-[rgba(255,255,255,0.02)] p-4 rounded-xl border border-[rgba(255,255,255,0.05)] shadow-lg hover:shadow-xl hover:bg-[rgba(255,255,255,0.04)] transition-all duration-300 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#7000FF]/10 to-[#FF00C7]/10 opacity-20 blur-[120px] -z-10" />
          <h2 className="text-sm font-inter text-[#B6B6B6] uppercase tracking-wide">Matches Found</h2>
          <p className="text-2xl font-raleway font-extrabold text-[#ECF1F0] mt-1">{metrics.matchesFound}</p>
        </div>
        <div className="bg-[rgba(255,255,255,0.02)] p-4 rounded-xl border border-[rgba(255,255,255,0.05)] shadow-lg hover:shadow-xl hover:bg-[rgba(255,255,255,0.04)] transition-all duration-300 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#7000FF]/10 to-[#FF00C7]/10 opacity-20 blur-[120px] -z-10" />
          <h2 className="text-sm font-inter text-[#B6B6B6] uppercase tracking-wide">Quota Left</h2>
          <p className="text-2xl font-raleway font-extrabold text-[#ECF1F0] mt-1">{metrics.quotaLeft}</p>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/hr/talent_pool/match-jd">
          <button className="bg-[#0FAE96] text-white font-raleway font-semibold text-base px-6 py-2.5 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-lg hover:bg-[#0FAE96]/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0FAE96] h-10 w-full sm:w-auto">
            Upload JD
          </button>
        </Link>
        <Link href="/hr/talent_pool/search">
          <button className="bg-[#0FAE96] text-white font-raleway font-semibold text-base px-6 py-2.5 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-lg hover:bg-[#0FAE96]/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0FAE96] h-10 w-full sm:w-auto">
            Start New Search
          </button>
        </Link>
      </div>


    </div>
  );
}