'use client';

import React, { useEffect, useState } from 'react';
import { getDatabase, ref, onValue, get } from 'firebase/database';
import Link from 'next/link';
import app from '@/firebase/config';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState({
    candidatesViewed: 0,
    matchesFound: 0,
    quotaLeft: 100,
  });

  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const recruiterId = 'demo_recruiter';
  const db = getDatabase(app);

  useEffect(() => {
    // Realtime listener for metrics
    const metricsRef = ref(db, `recruiters/${recruiterId}/usage/metrics`);
    const unsubscribeMetrics = onValue(
      metricsRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setMetrics({
            candidatesViewed: data.candidatesViewed || 0,
            matchesFound: data.matchesFound || 0,
            quotaLeft: data.quotaLeft || 100,
          });
        }
        setError(null);
      },
      (err) => {
        console.error('Error loading metrics:', err);
        setError('Failed to load real-time metrics.');
      }
    );

    // Fetch recent searches once
    const fetchRecentSearches = async () => {
      try {
        const searchesSnap = await get(
          ref(db, `recruiters/${recruiterId}/searches`)
        );
        if (searchesSnap.exists()) {
          const searchesObj = searchesSnap.val() as Record<string,{ query?:string}>;
          const recent = Object.values(searchesObj)
            .map((entry) => entry.query || 'Unnamed Search')
            .slice(-5)
            .reverse();
          setRecentSearches(recent);
        } else {
          setRecentSearches([]);
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching recent searches:', err);
        setError('Failed to load recent searches.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecentSearches();

    // Cleanup listener
    return () => {
      unsubscribeMetrics(); // in Realtime DB this is just a function returned by onValue
    };
  }, [db, recruiterId]);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <p className="text-gray-400">Loading dashboard...</p>
      </div>
    );
  }

  return (
   <div className="p-4 sm:p-5 bg-[#11011E] space-y-3 relative overflow-hidden">
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

      {/* Recent Searches */}
      <div>
        <h2 className="text-lg font-raleway font-semibold text-[#ECF1F0] mt-3 mb-2 tracking-tight">Recent Searches</h2>
        <ul className="space-y-2">
          {recentSearches.length > 0 ? (
            recentSearches.map((search, idx) => (
              <li key={idx} className="bg-[rgba(255,255,255,0.02)] p-2.5 rounded-lg border border-[rgba(255,255,255,0.05)] text-[#B6B6B6] font-inter text-base hover:bg-[rgba(255,255,255,0.05)] hover:shadow-md transition-all duration-200 shadow-sm">
                {search}
              </li>
            ))
          ) : (
            <p className="text-[#B6B6B6] font-inter text-base opacity-80">No recent searches found.</p>
          )}
        </ul>
      </div>
    </div>
  );
}
