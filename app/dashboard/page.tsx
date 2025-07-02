/** @format */
"use client";
import React, { useEffect, useState } from "react";
import { FaUser, FaChartBar, FaCog, FaSignOutAlt } from "react-icons/fa";
import { get, ref, getDatabase, update, set } from "firebase/database";
import app, { auth } from "@/firebase/config";
import { toast } from "react-toastify";
import { onAuthStateChanged } from "firebase/auth";
import ShareMenu from "@/components/shareMenu/shareMenu";
import RewardsDashboard from "@/components/Reward/reward";
const db = getDatabase(app);

const Dashboard = () => {
  const [name, setName] = useState("");
  const [uid, setUid] = useState("");
  const [refArray, setRefArray] = useState([]);
  const [notCompletedArray, setNotCompletedArray] = useState([]);
  const [freeArray, setFreeArray] = useState([]);
  const [premiumArray, setPremiumArray] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalVisitors, setTotalVisitors] = useState(0);
  const [mess, setMessage] = useState<string>("")


  type ReferralData = {
    uid: string;
    name: string;
    email: string;
    joinedOn: string;
    status: string;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        toast.error("You need to be signed in!");
        window.location.href = "/sign-in";
      } else {
        setUid(auth?.currentUser?.uid);
      }
    });
    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const fetchName = async () => {
      const nameRef = ref(db, `user/${uid}/name`);
      const nameSnapshot = await get(nameRef);
      if (nameSnapshot.val() === null) {
        const fnameRef = ref(db, `user/${uid}/fname`);
        const lnameRef = ref(db, `user/${uid}/lname`);
        const [fnameSnapshot, lnameSnapshot] = await Promise.all([get(fnameRef), get(lnameRef)]);
        const fname = fnameSnapshot.val() || "";
        const lname = lnameSnapshot.val() || "";
        const fullName = fname + lname;
        const nameWithoutSpaces = fullName.trim().replace(/\s/g, "")
        setName(nameWithoutSpaces);
      } else {
        let name = nameSnapshot.val();
        const nameWithoutSpaces = name.replace(/\s/g, "");
        setName(nameWithoutSpaces);
      }
    };
    if (uid) fetchName();
  }, [uid]);

  useEffect(() => {
    if (!name) return;
    setMessage(`🚀 Boost your career with AIKING!

🎯 Get access to top jobs, resume help & AI tools.

💸 Use my referral link to join and get exclusive benefits: window.location.origin}/${name}

🔥 Limited time offer! Don’t miss out.`)
    console.log("name", name)
    const visitorRef = ref(db, `visitors/${name}`);
    get(visitorRef).then((snapshot) => {
      const visitorData = snapshot.val();
      console.log(visitorData, "visitors")
      if (!visitorData) return;
      else {
        const totalVisitors = Object.keys(visitorData).length;
        setTotalVisitors(totalVisitors);
      }
    });

    const referralRef = ref(db, `referrals/${name}`);
    get(referralRef).then((snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setRefArray([]);
        setLoading(false);
        return;
      }
      // const visitorRef = ref(db, `visitors/${name}`);
      // get(visitorRef).then((snapshot) => {
      //   const visitorData = snapshot.val();
      //   console.log(visitorData,"visitors")
      //   if (!visitorData) return;
      //   else {
      //     const totalVisitors = Object.keys(visitorData).length;
      //     setTotalVisitors(totalVisitors);
      //   }
      // });
      const referralArray = Object.keys(data);
      setRefArray(referralArray);
    });
  }, [name]);

  useEffect(() => {
    if (!refArray.length) return;
    const fetchAndCategorizeReferralData = async () => {
      setLoading(true);
      const notCompleted = [];
      const free = [];
      const premium = [];
      await Promise.all(
        refArray.map(async (uid) => {
          console.log("dashboard", uid);
          let userRef = ref(db, `hr/${uid}`);
          let userData;
          try {
            let snapshot = await get(userRef);
            userData = snapshot.val();

            // If no data found in hr/uid, try user/uid
            if (!userData) {
              userRef = ref(db, `user/${uid}`);
              snapshot = await get(userRef);
              userData = snapshot.val();
            }

            if (!userData) return;

            const marketingRef = ref(db, `marketing_email/${uid}`);
            let fullName = userData.name || "";
            if (!fullName) {
              const fname = userData.fname || "";
              const lname = userData.lname || "";
              fullName = `${fname} ${lname}`.trim();
            }
            let newStatus = "not completed";
            if (userData.Payment?.Status === "Free") {
              newStatus = "Free";
            } else if (userData.Payment?.Status === "Premium") {
              newStatus = "Premium";
            }
            console.log("data", uid, newStatus);
            const referralData = {
              uid,
              name: fullName || "Unknown",
              email: userData.email || "Unknown",
              joinedOn: userData.createdAt
                ? new Date(userData.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                : "Unknown",
              status: newStatus,
            };
            await set(marketingRef, {
              email: userData.email || "unknown",
              status: newStatus,
              emailCount: 0,
            });
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

  return (
    <div className="min-h-screen bg-[#11011E] font-inter">
      {/* <Header name={name} /> */}
      {loading ? (
        <div className="flex items-center justify-center h-screen w-full bg-[#11011E]">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#0FAE96] border-solid mb-4"></div>
            <p className="text-[#ECF1F0] text-base font-medium">Loading referral users...</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center bg-[#11011E] min-h-screen py-10 px-6">
          <h1 className="text-3xl md:text-4xl font-bold text-center text-[#0FAE96] mb-4">🎯 Referral Dashboard</h1>
          <p className="text-[#B6B6B6] text-center mb-10">Track your impact and earnings through shared links</p>

          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-7xl mb-8">
            <div
              className={`bg-[#1A1A2E]/80 backdrop-blur-md rounded-lg p-6 border border-[#0FAE96]/30 hover:scale-102 hover:shadow-[0_0_10px_rgba(15,174,150,0.5)] transition duration-300 ease-in-out ${freeArray.length > 0 ? "shadow-[0_0_10px_rgba(15,174,150,0.5)]" : ""
                }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🧑‍💻</span>
                <div>
                  <h3 className="text-lg font-medium text-[#ECF1F0]">Free Users</h3>
                  <p className="text-2xl font-bold text-[#0FAE96]">{freeArray.length}</p>
                  <p className="text-[#B6B6B6] text-sm">Signed up but on free plan</p>
                </div>
              </div>
            </div>
            <div
              className={`bg-[#1A1A2E]/80 backdrop-blur-md rounded-lg p-6 border border-[#0FAE96]/30 hover:scale-102 hover:shadow-[0_0_10px_rgba(15,174,150,0.5)] transition duration-300 ease-in-out ${premiumArray.length > 0 ? "shadow-[0_0_10px_rgba(15,174,150,0.5)]" : ""
                }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">💎</span>
                <div>
                  <h3 className="text-lg font-medium text-[#ECF1F0]">Premium Users</h3>
                  <p className="text-2xl font-bold text-[#0FAE96]">{premiumArray.length}</p>
                  <p className="text-[#B6B6B6] text-sm">Upgraded via your link</p>
                </div>
              </div>
            </div>
            <div
              className={`bg-[#1A1A2E]/80 backdrop-blur-md rounded-lg p-6 border border-[#0FAE96]/30 hover:scale-102 hover:shadow-[0_0_10px_rgba(15,174,150,0.5)] transition duration-300 ease-in-out ${notCompletedArray.length > 0 ? "shadow-[0_0_10px_rgba(15,174,150,0.5)]" : ""
                }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">⏳</span>
                <div>
                  <h3 className="text-lg font-medium text-[#ECF1F0]">Pending Users</h3>
                  <p className="text-2xl font-bold text-[#0FAE96]">{notCompletedArray.length}</p>
                  <p className="text-[#B6B6B6] text-sm">Started but didn’t finish</p>
                </div>
              </div>
            </div>
            <div
              className={`bg-[#1A1A2E]/80 backdrop-blur-md rounded-lg p-6 border border-[#0FAE96]/30 hover:scale-102 hover:shadow-[0_0_10px_rgba(15,174,150,0.5)] transition duration-300 ease-in-out ${totalVisitors > 0 ? "shadow-[0_0_10px_rgba(15,174,150,0.5)]" : ""
                }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">👣</span>
                <div>
                  <h3 className="text-lg font-medium text-[#ECF1F0]">Total Visitors</h3>
                  <p className="text-2xl font-bold text-[#0FAE96]">{totalVisitors}</p>
                  <p className="text-[#B6B6B6] text-sm">Clicked your referral link</p>
                </div>
              </div>
            </div>
          </div>

          {/* User Breakdown Table */}
          <div className="bg-[#1A1A2E]/80 backdrop-blur-md rounded-lg p-6 w-full max-w-7xl mb-8">
            <h2 className="text-xl font-semibold text-[#ECF1F0] mb-4">👤 All Referrals</h2>
            {(freeArray.length > 0 || premiumArray.length > 0 || notCompletedArray.length > 0) ? (
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[#B6B6B6]">
                    <th className="py-2">Name</th>
                    <th>Email</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[...freeArray, ...premiumArray, ...notCompletedArray].map((user, index) => (
                    <tr key={index} className="text-[#ECF1F0] border-b border-[#2A2A3E]/50">
                      <td className="py-2">{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-[#B6B6B6]">No referrals found.</p>
            )}
          </div>
          {/* Analytics Widget */}
          <div className="bg-[#1A1A2E]/80 backdrop-blur-md rounded-lg p-6 w-full max-w-7xl mb-8">
            <h2 className="text-xl font-semibold text-[#ECF1F0] mb-4">🔍 Conversion Funnel</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-[#ECF1F0]">
                  Visitors: <span className="font-bold text-[#0FAE96]">{totalVisitors}</span>
                </p>
                <p className="text-[#ECF1F0]">
                  Pending Users: <span className="font-bold text-[#0FAE96]">{notCompletedArray.length}</span>
                </p>
                <p className="text-[#ECF1F0]">
                  Free Users: <span className="font-bold text-[#0FAE96]">{freeArray.length}</span>
                </p>
                <p className="text-[#ECF1F0]">
                  Premium: <span className="font-bold text-[#0FAE96]">{premiumArray.length}</span>
                </p>
                <p className="text-[#ECF1F0]">
                  Conversion Rate:{" "}
                  <span className="font-bold text-[#0FAE96]">
                    {refArray.length > 0 ? ((premiumArray.length / refArray.length) * 100).toFixed(2) : "0.00"}%
                  </span>
                </p>
              </div>
              <div>
                <div className="mb-4">
                  <p className="text-[#B6B6B6] text-sm">Visitors</p>
                  <div className="w-full bg-[#2A2A3E] rounded h-4">
                    <div className="bg-[#0FAE96] h-4 rounded" style={{ width: "100%" }}></div>
                  </div>
                </div>
                <div className="mb-4">
                  <p className="text-[#B6B6B6] text-sm">Free Users</p>
                  <div className="w-full bg-[#2A2A3E] rounded h-4">
                    <div
                      className="bg-[#0FAE96] h-4 rounded"
                      style={{ width: totalVisitors > 0 ? `${(freeArray.length / totalVisitors) * 100}%` : "0%" }}
                    ></div>
                  </div>
                </div>
                <div className="mb-4">
                  <p className="text-[#B6B6B6] text-sm">Pending Users</p>
                  <div className="w-full bg-[#2A2A3E] rounded h-4">
                    <div
                      className="bg-[#0FAE96] h-4 rounded"
                      style={{ width: totalVisitors > 0 ? `${(notCompletedArray.length / totalVisitors) * 100}%` : "0%" }}
                    ></div>
                  </div>
                </div>
                <div>
                  <p className="text-[#B6B6B6] text-sm">Premium</p>
                  <div className="w-full bg-[#2A2A3E] rounded h-4">
                    <div
                      className="bg-[#0FAE96] h-4 rounded"
                      style={{ width: totalVisitors > 0 ? `${(premiumArray.length / totalVisitors) * 100}%` : "0%" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-12 w-full max-w-7xl bg-[#1A1A2E]/80 backdrop-blur-md rounded-lg p-8 text-center border border-[#0FAE96]/30">
            <RewardsDashboard
              totalRef={freeArray.length + premiumArray.length}
              userName={name}
            />

          </div>

          {/* CTA Banner */}
          <div className="mt-12 w-full max-w-7xl bg-[#1A1A2E]/80 backdrop-blur-md rounded-lg p-8 text-center border border-[#0FAE96]/30">
            <h2 className="text-2xl font-semibold text-[#ECF1F0] mb-3">🎁 Invite More & Earn Rewards!</h2>
            <p className="text-[#B6B6B6] mb-6">Get 45% commission for every premium user you refer.</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => {
                  const linkToCopy = `${window.location.origin}/${name}`;
                  navigator.clipboard.writeText(linkToCopy)
                    .then(() => {
                      alert("Link copied to clipboard!"); // You can use toast instead
                    })
                    .catch(err => {
                      console.error("Failed to copy: ", err);
                    });
                }}
                className="bg-[#0FAE96] text-[#11011E] px-6 py-2 rounded-md hover:bg-[#0FAE96]/80 transition"
              >
                🔗 Copy Your Link
              </button>
              <ShareMenu name={name} />



            </div>

            <div className="mb-8"></div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;