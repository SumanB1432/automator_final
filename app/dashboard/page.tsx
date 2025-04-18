/** @format */
"use client";
import React, { useEffect, useState } from "react";
import { FaUser, FaChartBar, FaCog, FaSignOutAlt } from "react-icons/fa";
import { get, ref, getDatabase, update } from "firebase/database";
import app, { auth } from "@/firebase/config";
import { toast } from "react-toastify";
import { onAuthStateChanged } from "firebase/auth";
const db = getDatabase(app)


const Dashboard = () => {
    const [name, setName] = useState<unknown>("");
    const [uid, setUid] = useState<unknown>("");
    const [refArray, setRefArray] = useState<string[]>([]);
    // const [refDataArray, setRefDataArray] = useState<ReferralData[]>([]);
    const [notCompletedArray, setNotCompletedArray] = useState<ReferralData[]>([]);
    const [freeArray, setFreeArray] = useState<ReferralData[]>([]);
    const [premiumArray, setPremiumArray] = useState<ReferralData[]>([]);
    const [loading, setLoading] = useState(true); // loading state
    

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
            else{
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
          if (!data) return;
      
          const referralArray = Object.keys(data);
          console.log("Referral UIDs:", referralArray);
          setRefArray(referralArray);
        });
      }, [name]);
     


      
      
      
      useEffect(() => {
        if (!refArray.length) return;
      
        const fetchAndCategorizeReferralData = async () => {
          setLoading(true); // Start loading
          const notCompleted: ReferralData[] = [];
          const free: ReferralData[] = [];
          const premium: ReferralData[] = [];
      
          await Promise.all(
            refArray.map(async (uid: string) => {
              const userRef = ref(db, `user/${uid}`);
      
              try {
                const snapshot = await get(userRef);
                const userData = snapshot.val();
      
                if (!userData) return;
      
                // Fallback to fname and lname if name is not available
                let fullName = userData.name || "";
                if (!fullName) {
                  const fname = userData.fname || "";
                  const lname = userData.lname || "";
                  fullName = `${fname} ${lname}`.trim();
                }
      
                // Determine the payment status and categorize accordingly
                let newStatus = "not completed"; // default to "not completed"
                if (userData.Payment?.Status === "Free") {
                  newStatus = "Free";
                } else if (userData.Payment?.Status === "Premium") {
                  newStatus = "Premium";
                }
      
                const referralData: ReferralData = {
                  uid,
                  name: fullName || "Unknown",
                  status: newStatus,
                };
      
                // Categorize into the appropriate array
                if (newStatus === "not completed") {
                  notCompleted.push(referralData);
                } else if (newStatus === "Free") {
                  free.push(referralData);
                } else if (newStatus === "Premium") {
                  premium.push(referralData);
                }
              } catch (error) {
                console.error("Error fetching user data for UID:", uid, error);
              }
            })
          );
      
          // Update state arrays
          setNotCompletedArray(notCompleted);
          setFreeArray(free);
          setPremiumArray(premium);
          setLoading(false); // Done loading
        };
      
        fetchAndCategorizeReferralData();
      }, [refArray]);

      useEffect(()=>{
        console.log(freeArray)
        console.log(premiumArray);
        console.log(notCompletedArray)
      },[freeArray])
      
            
      
    return (
        <div>
        {loading ? (
          <div className="flex items-center justify-center h-screen w-full">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-teal-500 border-solid mb-4"></div>
              <p className="text-gray-600 text-lg font-medium">
                Loading referral users...
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center bg-gray-100 min-h-screen py-10 px-4">
            <h1 className="text-4xl font-bold text-center text-teal-600 mb-8">
              Dashboard: Users from Your Referral Link
            </h1>
  
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-7xl">
              {/* Free Users Box */}
              <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-teal-500 hover:shadow-xl transition duration-300 ease-in-out">
                <h2 className="text-xl font-semibold text-teal-600 mb-4">
                  Free Users
                </h2>
                <ul className="space-y-3">
                  {freeArray.length > 0 ? (
                    freeArray.map((user, index) => (
                      <li
                        key={index}
                        className="flex justify-between items-center p-2 border-b"
                      >
                        <span className="text-gray-700">{user.name}</span>
                        <span className="text-teal-500 font-medium">
                          {user.status}
                        </span>
                      </li>
                    ))
                  ) : (
                    <p className="text-gray-500">No free users found.</p>
                  )}
                </ul>
              </div>
  
              {/* Premium Users Box */}
              <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-teal-500 hover:shadow-xl transition duration-300 ease-in-out">
                <h2 className="text-xl font-semibold text-teal-600 mb-4">
                  Premium Users
                </h2>
                <ul className="space-y-3">
                  {premiumArray.length > 0 ? (
                    premiumArray.map((user, index) => (
                      <li
                        key={index}
                        className="flex justify-between items-center p-2 border-b"
                      >
                        <span className="text-gray-700">{user.name}</span>
                        <span className="text-teal-500 font-medium">
                          {user.status}
                        </span>
                      </li>
                    ))
                  ) : (
                    <p className="text-gray-500">No premium users found.</p>
                  )}
                </ul>
              </div>
  
              {/* Not Completed Users Box */}
              <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-teal-500 hover:shadow-xl transition duration-300 ease-in-out">
                <h2 className="text-xl font-semibold text-teal-600 mb-4">
                  Not Completed Users
                </h2>
                <ul className="space-y-3">
                  {notCompletedArray.length > 0 ? (
                    notCompletedArray.map((user, index) => (
                      <li
                        key={index}
                        className="flex justify-between items-center p-2 border-b"
                      >
                        <span className="text-gray-700">{user.name}</span>
                        <span className="text-teal-500 font-medium">
                          {user.status}
                        </span>
                      </li>
                    ))
                  ) : (
                    <p className="text-gray-500">No users found in this category.</p>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    );
};



export default Dashboard;
