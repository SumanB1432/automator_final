'use client';

import React, { useEffect, useState } from 'react';
import { getFirestore } from 'firebase/firestore';
import { doc, collection, getDocs, onSnapshot } from 'firebase/firestore';
import Link from 'next/link';
import app from '@/firebase/config';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<{
    candidatesViewed: number;
    matchesFound: number;
    quotaLeft: number;
  }>({ candidatesViewed: 0, matchesFound: 0, quotaLeft: 100 });

  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const firestore = getFirestore(app)

  const recruiterId = 'demo_recruiter';
  const usageRef = doc(firestore, `recruiters/${recruiterId}/usage`, 'metrics');
  const searchesRef = collection(firestore, `recruiters/${recruiterId}/searches`);

  useEffect(() => {
    // Real-time listener for metrics
    const unsubscribeMetrics = onSnapshot(
      usageRef,
      (doc) => {
        const quotaData = doc.exists() ? doc.data() : {};
        setMetrics({
          candidatesViewed: Number(quotaData?.candidatesViewed) || 0,
          matchesFound: Number(quotaData?.matchesFound) || 0,
          quotaLeft: Number(quotaData?.quotaLeft) || 100,
        });
        setError(null);
      },
      (err) => {
        console.error('Error listening to metrics:', err);
        setError('Failed to load real-time metrics. Please try again.');
      }
    );

    // Fetch recent searches (one-time)
    const fetchRecentSearches = async () => {
      try {
        const searchSnapshot = await getDocs(searchesRef);
        const recent = searchSnapshot.docs
          .map((doc) => doc.data().query || 'Unnamed Search')
          .slice(0, 5);
        setRecentSearches(recent);
        setError(null);
      } catch (err) {
        console.error('Error fetching recent searches:', err);
        setError('Failed to load recent searches. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecentSearches();

    // Cleanup listener on unmount
    return () => unsubscribeMetrics();
  }, [searchesRef, usageRef]); // Added dependencies to fix ESLint warning

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <p className="text-gray-400">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      {error && <p className="text-red-500">{error}</p>}

      {/* Metrics Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-sm text-gray-800">Candidates Viewed</h2>
          <p className="text-xl font-bold text-gray-600">{metrics.candidatesViewed}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-sm text-gray-800">Matches Found</h2>
          <p className="text-xl font-bold text-gray-600">{metrics.matchesFound}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-sm text-gray-800">Quota Left</h2>
          <p className="text-xl font-bold text-gray-600">{metrics.quotaLeft}</p>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="flex gap-4">
        <Link href="/hr/tallent_pool/match-jd">
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Upload JD
          </button>
        </Link>
        <Link href="/hr/tallent_pool/search">
          <button className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800">
            Start New Search
          </button>
        </Link>
      </div>

      {/* Recent Searches */}
      <div>
        <h2 className="text-lg font-medium mt-4 mb-2">Recent Searches</h2>
        <ul className="space-y-2">
          {recentSearches.length > 0 ? (
            recentSearches.map((search, idx) => (
              <li key={idx} className="bg-gray-100 p-3 rounded">
                {search}
              </li>
            ))
          ) : (
            <p className="text-gray-400">No recent searches found.</p>
          )}
        </ul>
      </div>
    </div>
  );
}