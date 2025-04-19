/** @format */
"use client";
import React, { useEffect, useState } from "react";
import { FaUser, FaChartBar, FaCog, FaSignOutAlt } from "react-icons/fa";
import { get, ref, getDatabase, update,set } from "firebase/database";
import app, { auth } from "@/firebase/config";
import { toast } from "react-toastify";
import { onAuthStateChanged } from "firebase/auth";
const db = getDatabase(app)


const Dashboard = () => {
  const [name, setName] = useState<unknown>("");
  const [uid, setUid] = useState<unknown>("");
  const [refArray, setRefArray] = useState<string[]>([]);
  const [notCompletedArray, setNotCompletedArray] = useState<ReferralData[]>([]);
  const [freeArray, setFreeArray] = useState<ReferralData[]>([]);
  const [premiumArray, setPremiumArray] = useState<ReferralData[]>([]);
  const [loading, setLoading] = useState(true); // loading state
  const [totalVisitors,setTotalVisitors] = useState<number>(0)


  type ReferralData = {
    uid: string;
    name: string;
    status: string;
  };



  useEffect(() => {
    // Redirect user if not signed in
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        toast.error("You need to be signed in!");
        window.location.href = "/sign-in";
      }
      else {
        setUid(auth?.currentUser?.uid)
      }
    });

    return () => {
      unsubscribe();
    };
  })

  useEffect(() => {
    const fetchName = async () => {
      const nameRef = ref(db, `user/${uid}/name`);
      const nameSnapshot = await get(nameRef);

      if (nameSnapshot.val() === null) {
        const fnameRef = ref(db, `user/${uid}/fname`);
        const lnameRef = ref(db, `user/${uid}/lname`);

        const [fnameSnapshot, lnameSnapshot] = await Promise.all([
          get(fnameRef),
          get(lnameRef)
        ]);

        const fname = fnameSnapshot.val() || "";
        const lname = lnameSnapshot.val() || "";
        const fullName = fname + lname;

        setName(fullName.trim());
      } else {
        let name = nameSnapshot.val()
        const nameWithoutSpaces = name.replace(/\s/g, "");
        setName(nameWithoutSpaces);
      }
    };

    if (uid) fetchName();
  }, [uid]);


  useEffect(() => {
    if (!name) return;

    const referralRef = ref(db, `referrals/${name}`);
    get(referralRef).then((snapshot) => {
      const data = snapshot.val();
      if (!data) {
        // No referrals
        setRefArray([]); // Make sure it's empty
        setLoading(false); // Stop loading screen
        return;
      }

      const visitorRef  = ref(db,`visitors/${name}`)
      get(visitorRef).then((snapshot)=>{
        const visitorData = snapshot.val();
        if(!visitorData)return;
        else{
          const totalVisitors = Object.keys(visitorData).length;
          setTotalVisitors(totalVisitors)
        }
      })

      const referralArray = Object.keys(data);
      console.log("Referral UIDs:", referralArray);
      setRefArray(referralArray);
    });
  }, [name]);






  useEffect(() => {
    if (!refArray.length) return;
  
    const fetchAndCategorizeReferralData = async () => {
      setLoading(true);
      const notCompleted: ReferralData[] = [];
      const free: ReferralData[] = [];
      const premium: ReferralData[] = [];
  
      await Promise.all(
        refArray.map(async (uid: string) => {
          const userRef = ref(db, `user/${uid}`);
          const marketingRef = ref(db, `marketing_email/${uid}`);
  
          try {
            const snapshot = await get(userRef);
            const userData = snapshot.val();
  
            if (!userData) return;
  
            // Get name fallback
            let fullName = userData.name || "";
            if (!fullName) {
              const fname = userData.fname || "";
              const lname = userData.lname || "";
              fullName = `${fname} ${lname}`.trim();
            }
  
            // Determine payment status
            let newStatus = "not completed";
            if (userData.Payment?.Status === "Free") {
              newStatus = "Free";
            } else if (userData.Payment?.Status === "Premium") {
              newStatus = "Premium";
            }
  
            // Prepare referral data for UI
            const referralData: ReferralData = {
              uid,
              name: fullName || "Unknown",
              status: newStatus,
            };
  
            // Store in marketing_email
            await set(marketingRef, {
              email: userData.email || "unknown",
              status: newStatus,
              emailCount: 0,
            });
  
            // Categorize for UI
            if (newStatus === "not completed") {
              notCompleted.push(referralData);
            } else if (newStatus === "Free") {
              free.push(referralData);
            } else if (newStatus === "Premium") {
              premium.push(referralData);
            }
          } catch (error) {
            console.error("Error fetching/storing data for UID:", uid, error);
          }
        })
      );
  
      setNotCompletedArray(notCompleted);
      setFreeArray(free);
      setPremiumArray(premium);
      setLoading(false);
    };
  
    fetchAndCategorizeReferralData();
  }, [refArray]);
  

  useEffect(() => {
    console.log(freeArray)
    console.log(premiumArray);
    console.log(notCompletedArray)
  }, [freeArray])



  return (
      <div>
        {loading ? (
          <div className="flex items-center justify-center h-screen w-full bg-[#11011E]">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-[#0FAE96] border-solid mb-4"></div>
              <p className="text-[#ECF1F0] text-lg font-medium">
                Loading referral users...
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center bg-[#11011E] min-h-screen py-10 px-6">
            <h1 className="text-4xl font-bold text-center text-[#0FAE96] mb-10">
              Dashboard: Users from Your Referral Link
            </h1>
    
            {!refArray.length ? (
              <div className="text-center text-[#ECF1F0] text-xl font-medium mt-10">
                You haven&apos;t referred anyone yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full max-w-7xl">
                {/* Free Users Box */}
                <div className="bg-[#1A1A2E] text-[#ECF1F0] rounded-[10px] shadow-[0px_0px_16px_5px_#DFDFDF] p-6 border border-[#0FAE96] hover:shadow-xl transition duration-300 ease-in-out">
                  <h2 className="text-2xl font-semibold text-[#0FAE96] mb-4">
                    Free Users
                  </h2>
                  <ul className="space-y-4">
                    {freeArray.length > 0 ? (
                      freeArray.map((user, index) => (
                        <li
                          key={index}
                          className="flex justify-between items-center p-3 border-b border-[#2A2A3E]"
                        >
                          <span className="text-white">{user.name}</span>
                          <span className="text-[#0FAE96] font-medium">
                            {user.status}
                          </span>
                        </li>
                      ))
                    ) : (
                      <p className="text-[#B6B6B6]">No free users found.</p>
                    )}
                  </ul>
                </div>
    
                {/* Premium Users Box */}
                <div className="bg-[#1A1A2E] text-[#ECF1F0] rounded-[10px] shadow-[0px_0px_16px_5px_#DFDFDF] p-6 border border-[#0FAE96] hover:shadow-xl transition duration-300 ease-in-out">
                  <h2 className="text-2xl font-semibold text-[#0FAE96] mb-4">
                    Premium Users
                  </h2>
                  <ul className="space-y-4">
                    {premiumArray.length > 0 ? (
                      premiumArray.map((user, index) => (
                        <li
                          key={index}
                          className="flex justify-between items-center p-3 border-b border-[#2A2A3E]"
                        >
                          <span className="text-white">{user.name}</span>
                          <span className="text-[#0FAE96] font-medium">
                            {user.status}
                          </span>
                        </li>
                      ))
                    ) : (
                      <p className="text-[#B6B6B6]">No premium users found.</p>
                    )}
                  </ul>
                </div>
    
                {/* Not Completed Users Box */}
                <div className="bg-[#1A1A2E] text-[#ECF1F0] rounded-[10px] shadow-[0px_0px_16px_5px_#DFDFDF] p-6 border border-[#0FAE96] hover:shadow-xl transition duration-300 ease-in-out">
                  <h2 className="text-2xl font-semibold text-[#0FAE96] mb-4">
                    Not Completed Users
                  </h2>
                  <ul className="space-y-4">
                    {notCompletedArray.length > 0 ? (
                      notCompletedArray.map((user, index) => (
                        <li
                          key={index}
                          className="flex justify-between items-center p-3 border-b border-[#2A2A3E]"
                        >
                          <span className="text-white">{user.name}</span>
                          <span className="text-[#0FAE96] font-medium">
                            {user.status}
                          </span>
                        </li>
                      ))
                    ) : (
                      <p className="text-[#B6B6B6]">No users found in this category.</p>
                    )}
                  </ul>
                </div>
    
                {/* Visitors Box */}
                <div className="bg-[#1A1A2E] text-[#ECF1F0] rounded-[10px] shadow-[0px_0px_16px_5px_#DFDFDF] p-6 border border-[#0FAE96] hover:shadow-xl transition duration-300 ease-in-out">
                  <h2 className="text-2xl font-semibold text-[#0FAE96] mb-4">
                    Total Visitors
                  </h2>
                  <div className="text-center text-5xl font-bold text-white mt-8">
                    {totalVisitors}
                  </div>
                  <p className="text-center text-[#B6B6B6] mt-4">
                    People who clicked your referral link.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    
    

  );
};



export default Dashboard;
