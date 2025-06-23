"use client";

import { useEffect, useCallback, useState } from "react";
import { getDatabase, ref, get, runTransaction } from "firebase/database";
import FilterSidebar from "@/components/tallentpool/FilterSidebar";
import PaginationControls from "@/components/tallentpool/PaginationControls";
import CandidateList from "@/components/tallentpool/CandidateList";
import { useSearchStore } from "@/store/searchStore";
import { Candidate, Metrics } from "@/components/types/types";
import app, { auth } from "@/firebase/config";

export default function SearchPage() {
  const {
    candidates,
    filteredCandidates,
    loading,
    error,
    jobTitle,
    education,
    location,
    skills,
    experienceRange,
    setCandidates,
    setFilter,
    setLoading,
    setError,
    clearFilters,
    applyFiltersFromJD,
  } = useSearchStore();

  const [newSkill, setNewSkill] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const db = getDatabase(app);
  const [quotaExceeded, setQuotaExceeded] = useState(false);
  const [checkingQuota, setCheckingQuota] = useState(true);
  const [uid, setUid] = useState<string>("");
  const [filtersJustApplied, setFiltersJustApplied] = useState(false);
  const [subscriptionType, setSubscriptionType] = useState<"Free" | "Premium">(
    "Free"
  );

  // ✅ Combined fetch for subscription type and quota
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setUid(user.uid);

      const fetchSubscriptionAndQuota = async () => {
        try {
          const subRef = ref(db, `hr/${user.uid}/Payment/SubscriptionType`);
          const usageRef = ref(db, `hr/${user.uid}/usage/metrics`);
          const [subSnap, usageSnap] = await Promise.all([
            get(subRef),
            get(usageRef),
          ]);

          const subscription = subSnap.exists() ? subSnap.val() : "Free";
          const maxQuota = subscription === "Premium" ? 500 : 10;
          setSubscriptionType(subscription === "Premium" ? "Premium" : "Free");

          const usageData = usageSnap.exists() ? usageSnap.val() : { matchesFound: 0 };
          if (usageData.matchesFound >= maxQuota) {
            setQuotaExceeded(true);
          }
        } catch (err) {
          console.error("Error fetching subscription or quota:", err);
          setSubscriptionType("Free");
          setQuotaExceeded(false); // fallback to Free
        } finally {
          setCheckingQuota(false);
        }
      };

      fetchSubscriptionAndQuota();
    }
  }, [db]);

  // ✅ Filters from JD (URL query)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const jobTitleParam = params.get("jobTitle");
      const educationParam = params.get("education");
      const locationParam = params.get("location");
      const skillsParam = params.get("skills");
      const experienceRangeParam = params.get("experienceRange");

      if (
        jobTitleParam ||
        educationParam ||
        locationParam ||
        skillsParam ||
        experienceRangeParam
      ) {
        try {
          const filterValues = {
            jobTitle: jobTitleParam || "",
            education: educationParam || "",
            location: locationParam || "",
            skills: skillsParam ? JSON.parse(skillsParam) : [],
            experienceRange: experienceRangeParam
              ? JSON.parse(experienceRangeParam)
              : [0, 10],
          };
          applyFiltersFromJD(filterValues);
          setFiltersJustApplied(true);
        } catch (err) {
          console.error("Error parsing query params:", err);
          setError("Failed to apply JD filters.");
        }
      }
    }
  }, [applyFiltersFromJD, setError]);

  const updateUsageMetrics = useCallback(
    async (updates: { matchesFound?: number; candidatesViewed?: number }) => {
      if (!uid) return;

      const usageRef = ref(db, `hr/${uid}/usage/metrics`);
      const maxQuota = subscriptionType === "Premium" ? 500 : 10;

      try {
        await runTransaction(usageRef, (current) => {
          const currentData: Metrics = current || {
            matchesFound: 0,
            candidatesViewed: 0,
            quotaLeft: maxQuota,
          };

          const updatedMatchesFound =
            currentData.matchesFound + (updates.matchesFound ?? 0);
          const updatedCandidatesViewed =
            currentData.candidatesViewed + (updates.candidatesViewed ?? 0);
          const updatedQuotaLeft = Math.max(maxQuota - updatedMatchesFound, 0);

          return {
            ...currentData,
            matchesFound: updatedMatchesFound,
            candidatesViewed: updatedCandidatesViewed,
            quotaLeft: updatedQuotaLeft,
          };
        });

        const snapshot = await get(usageRef);
        const updatedData = snapshot.val();
        if (updatedData?.quotaLeft <= 0) {
          setQuotaExceeded(true);
        }

        setError(null);
      } catch (err) {
        console.error("Error updating usage metrics:", err);
        setError("Failed to update usage metrics. Please try again.");
      }
    },
    [uid, db, setError, subscriptionType]
  );

  useEffect(() => {
    if (filtersJustApplied && filteredCandidates.length > 0 && uid) {
      updateUsageMetrics({ matchesFound: filteredCandidates.length });
      setFiltersJustApplied(false);
    }
  }, [filteredCandidates, uid, filtersJustApplied, updateUsageMetrics]);

  const fetchCandidates = useCallback(async () => {
    if (quotaExceeded) return;
    setLoading(true);
    try {
      const snapshot = await get(ref(db, "talent_pool"));
      if (snapshot.exists()) {
        const candidatesObj: { [key: string]: Candidate } = snapshot.val();
        const data = Object.entries(candidatesObj).map(([id, candidate]) => ({
          id,
          ...candidate,
        }));
        setCandidates(data.slice(0, 5));
        setError(null);
      } else {
        setCandidates([]);
        setError("No candidates found.");
      }
    } catch (error) {
      console.error("Error fetching candidates:", error);
      setError("Failed to load candidates.");
    } finally {
      setLoading(false);
    }
  }, [db, setCandidates, setError, setLoading, quotaExceeded]);

  
  useEffect(() => {
    if (!quotaExceeded && candidates.length === 0) {
      fetchCandidates();
    }
  }, [quotaExceeded, candidates.length, fetchCandidates]);

  const addSkill = (
    e: React.KeyboardEvent<HTMLInputElement>,
    skill: string
  ) => {
    if (e.key === "Enter" && skill.trim() && !skills.includes(skill.trim())) {
      setFilter({ skills: [...skills, skill.trim()] });
      setNewSkill("");
    }
  };

  const removeSkill = (skill: string) => {
    setFilter({ skills: skills.filter((s) => s !== skill) });
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCandidates = filteredCandidates.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredCandidates.length / itemsPerPage);

  if (checkingQuota) {
    return <p className="text-center p-10 text-gray-500">Checking quota...</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6 p-4">
      {quotaExceeded ? (
        <div className="col-span-2 flex flex-col items-center justify-center p-10 text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-4">
            Quota Limit Reached
          </h2>
          <p className="text-gray-700 mb-6">
            You have used your free plan. Kindly upgrade to{" "}
            <span className="font-semibold">Pro</span> to continue searching.
          </p>
        </div>
      ) : (
        <>
          <FilterSidebar
            jobTitle={jobTitle}
            setJobTitle={(val) => setFilter({ jobTitle: val })}
            education={education}
            setEducation={(val) => setFilter({ education: val })}
            location={location}
            setLocation={(val) => setFilter({ location: val })}
            skills={skills}
            setSkills={(val) => setFilter({ skills: val })}
            newSkill={newSkill}
            setNewSkill={setNewSkill}
            experienceRange={experienceRange}
            setExperienceRange={(val) => setFilter({ experienceRange: val })}
            applyFilters={() => {
              applyFiltersFromJD({
                jobTitle,
                education,
                location,
                skills,
                experienceRange,
              });
              setFiltersJustApplied(true);
            }}
            clearFilters={clearFilters}
            addSkill={addSkill}
            removeSkill={removeSkill}
          />

          <section className="space-y-4">
            {error && <p className="text-red-500">{error}</p>}
            {loading || candidates.length === 0 ? (
              <p className="text-gray-500">Loading candidates...</p>
            ) : filteredCandidates.length === 0 ? (
              <p className="text-gray-500">
                No candidates found matching your criteria.
              </p>
            ) : (
              <CandidateList
                candidates={paginatedCandidates}
                onView={(email) =>
                  window.open(
                    `/hr/talent_pool/candidate/${encodeURIComponent(email)}`,
                    "_blank"
                  )
                }
                onEdit={(email) =>
                  window.open(
                    `/hr/talent_pool/edit/${encodeURIComponent(email)}`,
                    "_blank"
                  )
                }
              />
            )}

            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </section>
        </>
      )}
    </div>
  );
}