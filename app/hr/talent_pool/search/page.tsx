"use client";

import { useEffect, useCallback, useState } from "react";
import { getDatabase, ref, get, set } from "firebase/database";
import { useRouter } from "next/navigation";
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
    setFilteredCandidates,
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

  const router = useRouter();
  const [uid, setUid] = useState<string>("");
  // const usageRef = ref(db, `hr/${recruiterId}/usage/metrics`);
  //GET UID FOR HR
  useEffect(() => {
    const user = auth.currentUser;
    if(user){
      let uid = user.uid;
      setUid(uid)
    }


  })
  // ✅ Updated: use window.location.search instead of useSearchParams
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
        } catch (err) {
          console.error("Error parsing query params:", err);
          setError("Failed to apply JD filters.");
        }
      }
    }
  }, [applyFiltersFromJD, setError]);

  const updateUsageMetrics = useCallback(
    async (updates: { matchesFound?: number; candidatesViewed?: number }) => {
      try {
        const usageRef = ref(db,`hr/${uid}/usage/metrics`)
        const snapshot = await get(usageRef);
        const currentData: Metrics = snapshot.exists()
          ? snapshot.val()
          : { matchesFound: 0, candidatesViewed: 0, quotaLeft: 100 };

        const updatedMatchesFound =
          (updates.matchesFound ?? currentData.matchesFound) || 0;
        const updatedCandidatesViewed =
          (updates.candidatesViewed ?? currentData.candidatesViewed) || 0;
        const updatedQuotaLeft = Math.max(100 - updatedMatchesFound, 0);

        await set(usageRef, {
          matchesFound: updatedMatchesFound,
          candidatesViewed: updatedCandidatesViewed,
          quotaLeft: updatedQuotaLeft,
        });

        if (updatedQuotaLeft <= 0) {
          setQuotaExceeded(true);
        }

        setError(null);
      } catch (err) {
        console.error("Error updating usage metrics:", err);
        setError("Failed to update usage metrics. Please try again.");
      }
    },
    [ uid,setError]
  );

  const fetchCandidates = useCallback(async () => {
    setLoading(true);
    try {
      const snapshot = await get(ref(db, "talent_pool"));
      if (snapshot.exists()) {
        const candidatesObj: { [key: string]: Candidate } = snapshot.val();
        const data = Object.entries(candidatesObj).map(([id, candidate]) => ({
          id,
          ...candidate,
        }));
        setCandidates(data.slice(0, 20));
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
  }, [db, setCandidates, setError, setLoading]);

  useEffect(() => {
    if (candidates.length === 0) {
      fetchCandidates();
    }
  }, [candidates, fetchCandidates]);

  const handleViewCandidate = useCallback(
    async (email: string) => {
      window.open(`/hr/talent_pool/candidate/${encodeURIComponent(email)}`, "_blank");
      try {
        const usageRef = ref(db,`hr/${uid}/usage/metrics`)
        const snapshot = await get(usageRef);
        const currentViewed = snapshot.exists()
          ? snapshot.val().candidatesViewed || 0
          : 0;
        await updateUsageMetrics({ candidatesViewed: currentViewed + 1 });
      } catch (err) {
        console.error("Error updating candidates viewed:", err);
        setError("Failed to update candidate view count.");
      }
    },
    [updateUsageMetrics, setError, uid]
  );

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
            applyFilters={() =>
              applyFiltersFromJD({
                jobTitle,
                education,
                location,
                skills,
                experienceRange,
              })
            }
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
              <>
                <CandidateList
                  candidates={paginatedCandidates}
                  onView={handleViewCandidate}
                  onEdit={(email) => window.open(`/hr/talent_pool/edit/${encodeURIComponent(email)}`, "_blank")}
                />
              </>
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