import React, { useEffect, useState } from 'react';
import { get, ref, getDatabase, update, set, push } from "firebase/database";
import app, { auth } from "@/firebase/config";
const db = getDatabase(app)

const RewardsDashboard = ({ totalRef, userName }) => {
    const referralGoal = 3;
    const isEligible = totalRef >= referralGoal;
    const [uid, setUid] = useState("")
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [linkedinURL, setLinkedinURL] = useState("");
    const [shared, setShared] = useState(false);
    const [couponCode, setCouponCode] = useState("");
    const [shareError, setShareError] = useState("");
    const [country, setCountry] = useState("");
    const [copied, setCopied] = useState(false);
    const [indianEarning, setIndianEarning] = useState(0)
    const [foreignEarning, setForeignEarning] = useState(0)
    const [indUser, setIndUser] = useState(0);
    const [foreignUser, setForeignUser] = useState(0);
    const [showBankModal, setShowBankModal] = useState(false);
    const [bankForm, setBankForm] = useState({
        name: "",
        accountNumber: "",
        ifscOrSwift: "",
        contactNo: "",
    });
    const [bankSubmitLoading, setBankSubmitLoading] = useState(false);
    const [submitMsg, setSubmitMsg] = useState("");
    const [confirmAccountNumber, setConfirmAccountNumber] = useState("");

    // Calculate total earnings for eligibility check
    const totalEarnings = parseFloat(((indianEarning / 90) + foreignEarning).toFixed(2));
    const isEarningsEligible = totalEarnings >= 50;


    useEffect(() => {
        const uid = auth.currentUser?.uid;
        if (uid) {
            setUid(uid)
        }
    }, [])

    useEffect(() => {
        // Fetch user location data client-side
        fetch("https://geolocation-db.com/json/")
            .then((response) => {
                if (!response.ok) throw new Error("Failed to fetch location");
                return response.json();
            }).then((data) => {
                console.log("Client location data:", data);
                const countryCode = data.country_code || "US";
                setCountry(countryCode);

            })
            .catch((err) => {
                console.error("Client location error:", err);
                setCountry("US");
            });

    }, [])

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(couponCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000); // Reset after 2 sec
        } catch (err) {
            console.error("Failed to copy coupon:", err);
        }
    };

    const deleteReferralsFromDB = async (userName) => {
        // TODO: Replace this with your actual Firebase DB deletion logic
        console.log(`Deleting referrals for user: ${userName}`);
        let userRef = ref(db, `referrals/${userName}`)
        await set(userRef, null)
    };

    const updatePayment = async (uid: any) => {
        console.log("Update User Payment Mode to Premium");
        const recentDate = new Date();
        const startDateStr = recentDate.toISOString().replace("T", " ").split(".")[0];

        // Calculate End_Date (1 month from Start_Date)
        const endDate = new Date(recentDate);
        endDate.setMonth(recentDate.getMonth() + 1);
        const endDateStr = endDate.toISOString().replace("T", " ").split(".")[0];
        let paymentRef = ref(db, `user/${uid}/Payment`)
        const updatedPaymentData = {
            Start_Date: startDateStr, // or use dynamic date
            End_Date: endDateStr,
            Status: "Premium",
            SubscriptionType: "Premium"
        };
        try {
            await update(paymentRef, updatedPaymentData);
            console.log("Payment data updated successfully.");
        } catch (error) {
            console.error("Error updating payment:", error);
        }

    }


    const isValidLinkedInPost = (url) => {
        const pattern = /^https:\/\/(www\.)?linkedin\.com\/posts\/.+/i;
        return pattern.test(url);
    };

    const handleLinkedInSubmit = async () => {
        if (!isValidLinkedInPost(linkedinURL)) {
            setShareError("Invalid LinkedIn post URL");
            return;
        }

        const shareRef = ref(db, `sharedLinks/${userName}`);

        try {
            await set(shareRef, {
                linkedinURL,
                sharedAt: new Date().toISOString(),
            });

            country === "IN" ? setCouponCode("AIKING50P") : setCouponCode("AIKINGP50")
            setShared(true);
            setShareError("");
        } catch (err) {
            console.error(err);
            setShareError("Something went wrong. Try again.");
        }
    };

    const notifyExtensionOnPayment = (uid: any) => {
        const event = new CustomEvent("paymentSuccessfull", { detail: { uid } });
        document.dispatchEvent(event);
    };



    const handleClaim = async () => {
        setLoading(true);
        try {
            const currentUser = auth?.currentUser?.uid;
            notifyExtensionOnPayment(currentUser);
            await deleteReferralsFromDB(userName);
            await updatePayment(uid)
            alert('Premium claimed and referral data deleted!');
            setShowModal(false);
            window.location.reload();
        } catch (err) {
            alert('Failed to delete referral data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const getRef = async function () {
            const referralRef = ref(db, `referrals/${userName}`);
            const snapshot = await get(referralRef);

            if (snapshot.exists()) {
                const data = snapshot.val();
                let inrCount = 0;
                let foreignCount = 0;

                Object.values(data).forEach((user) => {
                    if (user.currency === "INR") {
                        inrCount++;
                    } else if (user.currency === "USD") {
                        foreignCount++;
                    }
                });

                setIndUser(inrCount);
                setForeignUser(foreignCount);
            } else {
                console.log("No referral data found.");
            }
        }
        getRef()
    }, [uid])

    useEffect(() => {
        setIndianEarning(250 * indUser)
        setForeignEarning(10 * foreignUser)
    }, [indUser, foreignUser])

    return (
        <div className="bg-[#11011E] text-white p-8 font-sans">
            {/* Header with subtle glow effect */}
            <h2 className="text-4xl font-bold mb-8 flex items-center gap-3">
                <span role="img" aria-label="gift" className="text-3xl">🎁</span>
                <span className="text-white font-bold tracking-wide">REWARDS & MILESTONES</span>
            </h2>

            {/* Card 1: Referrals */}
            <div className="bg-gray-800 p-4 sm:p-6 mb-6 rounded-2xl shadow-lg border border-gray-700 hover:border-purple-500 transition-all duration-300 w-full">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
                    <div className="text-lg sm:text-xl font-semibold flex items-center gap-2">
                        <span className="text-green-400">✔</span> REFER USERS
                    </div>
                    <div className="bg-[#0FAE96] px-3 py-1 sm:px-4 rounded-full text-sm text-center w-fit">
                        GET 1 MONTH PREMIUM
                    </div>
                </div>

                <div className="mb-3 text-sm sm:text-base text-gray-300">
                    You've referred: <span className="text-white font-medium">{totalRef} / {referralGoal}</span>
                </div>

                <div className="relative w-full h-3 bg-gray-700 rounded-full overflow-hidden mb-4">
                    <div
                        className="h-full bg-gradient-to-r from-[#0FAE96] to-[#0FAE96] rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((totalRef / referralGoal) * 100, 100)}%` }}
                    ></div>
                </div>

                <button
                    disabled={!isEligible}
                    onClick={() => setShowModal(true)}
                    className={`mt-2 w-full sm:w-auto font-semibold text-base sm:text-lg px-5 sm:px-6 py-2 rounded-xl shadow-md transition-all duration-300 hover:scale-105
            ${isEligible
                            ? "bg-gradient-to-r from-[#0FAE96] to-[#0FAE96] text-white hover:opacity-90 cursor-pointer"
                            : "bg-gray-600 text-gray-400 cursor-not-allowed"
                        }`}
                >
                    Claim Your Premium
                </button>
            </div>

            {/* Card 2: LinkedIn Share */}
            <div className="bg-gray-800 p-4 sm:p-6 mb-6 rounded-2xl shadow-lg border border-gray-700 hover:border-purple-500 transition-all duration-300 w-full">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
                    <div className="text-lg sm:text-xl font-semibold flex items-center gap-2">
                        <span className="text-blue-400">ℹ</span> SHARE ON LINKEDIN
                    </div>
                    <div className="bg-[#0FAE96] px-3 py-1 sm:px-4 rounded-full text-sm text-center w-fit">
                        50% DISCOUNT
                    </div>
                </div>

                {!shared ? (
                    <>
                        <div className="mb-4 text-base text-red-400 flex items-center">
                            <span className="mr-2">✖</span> Not Shared
                        </div>

                        <div className="mt-4 relative">
                            <input
                                type="text"
                                placeholder="Paste LinkedIn Post URL here to unlock the reward"
                                value={linkedinURL}
                                onChange={(e) => setLinkedinURL(e.target.value)}
                                className="p-3 w-full rounded-lg border border-gray-600 bg-gray-900 text-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                            <div className="absolute right-3 top-3 text-gray-400 text-lg">🔗</div>
                        </div>
                        {shareError && <p className="text-red-400 text-sm mt-2">{shareError}</p>}

                        <button
                            onClick={handleLinkedInSubmit}
                            className="mt-4 bg-gradient-to-r from-[#0FAE96] to-[#0FAE96] text-white font-semibold text-base sm:text-lg px-5 py-2 rounded-xl shadow-md hover:opacity-90 transition-all duration-300 hover:scale-105 w-full sm:w-auto"
                        >
                            Submit
                        </button>
                    </>
                ) : (
                    <>
                        <div className="mb-4 text-base text-green-400 flex items-center">
                            <span className="mr-2">✅</span> Shared Successfully
                        </div>
                        <div className="text-white font-semibold text-lg sm:text-xl mt-4">
                            🎉 Your Coupon:
                            <div
                                className="inline-flex flex-wrap items-center gap-2 mt-2 sm:mt-0 sm:ml-3 cursor-pointer bg-[#0FAE96] text-black font-bold px-4 py-2 rounded-lg relative group transition hover:scale-105"
                                onClick={handleCopy}
                            >
                                {couponCode}
                                <span className="text-sm text-gray-800 font-medium hidden group-hover:inline">
                                    📋 Click to copy
                                </span>

                                {copied && (
                                    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded-md shadow-md animate-fade-in-out">
                                        ✅ Copied!
                                    </span>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Card 3: Earnings */}
            <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700 hover:border-purple-500 transition-all duration-300">
                <div className="text-xl font-semibold flex items-center gap-2 mb-4">
                    <span className="text-yellow-400">💰</span> YOUR EARNINGS THIS MONTH
                </div>

                <div className="flex justify-between items-center mb-4">
                    <div className="text-gray-300">Total Earnings:</div>
                    <div className="text-2xl font-bold text-[#0FAE96]">${totalEarnings}</div>
                </div>
                <p className="text-sm text-gray-400 mb-4">
                    Minimum $50 required to claim earnings
                </p>


                <button
                    disabled={!isEarningsEligible}
                    onClick={() => setShowBankModal(true)}
                    className={`mt-2 mb-6 w-full sm:w-auto font-semibold text-base sm:text-lg px-5 sm:px-6 py-2 rounded-xl shadow-md transition-all duration-300 hover:scale-105
            ${isEarningsEligible
                            ? "bg-gradient-to-r from-[#0FAE96] to-[#0FAE96] text-white hover:opacity-90 cursor-pointer"
                            : "bg-gray-600 text-gray-400 cursor-not-allowed"
                        }`}
                >
                    Claim Your Earnings
                </button>

                <div className="bg-gray-700 p-4 sm:p-6 rounded-lg text-sm text-gray-300 flex justify-center items-center w-full">
                    <div className="flex flex-col md:flex-row md:space-x-12 space-y-6 md:space-y-0 w-full max-w-4xl justify-center items-center md:items-start">
                        {/* Indian User Breakdown */}
                        <div className="flex flex-col items-center md:items-start gap-2 w-full md:w-auto">
                            <div className="flex items-start gap-2 text-center md:text-left">
                                <span className="text-xl">🇮🇳</span>
                                <div>
                                    <div className="text-white font-medium">Breakdown: 1 Paid Indian</div>
                                    <div>User × <span className="text-white font-semibold">₹250</span> Commission</div>
                                </div>
                            </div>
                            <div className="mt-2 md:ml-7 text-white">
                                Total Indian Earnings: <span className="font-semibold">₹{indianEarning}</span>
                            </div>
                        </div>

                        {/* Foreign User Breakdown */}
                        <div className="flex flex-col items-center md:items-start gap-2 w-full md:w-auto">
                            <div className="flex items-start gap-2 text-center md:text-left">
                                <span className="text-xl">🌍</span>
                                <div>
                                    <div className="text-white font-medium">Breakdown: 1 Paid Foreign</div>
                                    <div>User × <span className="text-white font-semibold">$10</span> Commission</div>
                                </div>
                            </div>
                            <div className="mt-2 md:ml-7 text-white">
                                Total Foreign Earnings: <span className="font-semibold">${foreignEarning}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
                    <div className="bg-gray-900 p-6 rounded-xl max-w-md w-full text-white border border-gray-600 shadow-lg">
                        <h3 className="text-xl font-bold mb-4">Are you sure?</h3>
                        <p className="mb-4 text-gray-300">
                            After claiming, <span className="text-red-400 font-semibold">all your referral data will be reset</span> and previous referral rewards will no longer be available.
                        </p>

                        <div className="flex justify-end gap-4">
                            <button
                                className="px-4 py-2 bg-gray-700 rounded-md hover:bg-gray-600 transition"
                                onClick={() => setShowModal(false)}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 bg-gradient-to-r from-[#0FAE96] to-[#0FAE96] rounded-md font-semibold hover:opacity-90 transition"
                                onClick={handleClaim}
                                disabled={loading}
                            >
                                {loading ? 'Claiming...' : 'Yes, Claim & Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showBankModal && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
                    <div className="bg-gray-900 p-6 rounded-xl max-w-md w-full text-white border border-gray-600 shadow-lg">
                        <h3 className="text-xl font-bold mb-4">Bank Details</h3>
                        <p className="text-gray-300 mb-4">Please enter your payout details to receive funds.</p>

                        <input
                            type="text"
                            placeholder="Name on Bank Account"
                            className="mb-3 w-full p-2 rounded bg-gray-800 border border-gray-700"
                            value={bankForm.name}
                            onChange={(e) => setBankForm({ ...bankForm, name: e.target.value })}
                        />
                        <input
                            type="text"
                            placeholder="Account Number"
                            className="mb-3 w-full p-2 rounded bg-gray-800 border border-gray-700"
                            value={bankForm.accountNumber}
                            onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                        />
                        <input
                            type="text"
                            placeholder="Confirm Account Number"
                            className="mb-3 w-full p-2 rounded bg-gray-800 border border-gray-700"
                            value={confirmAccountNumber}
                            onChange={(e) => setConfirmAccountNumber(e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder={country === "IN" ? "IFSC Code" : "SWIFT Code"}
                            className="mb-4 w-full p-2 rounded bg-gray-800 border border-gray-700"
                            value={bankForm.ifscOrSwift}
                            onChange={(e) => setBankForm({ ...bankForm, ifscOrSwift: e.target.value })}
                        />

                        <input
                            type="tel"
                            placeholder="Contact No."
                            className="mb-3 w-full p-2 rounded bg-gray-800 border border-gray-700"
                            value={bankForm.contactNo}
                            onChange={(e) => setBankForm({ ...bankForm, contactNo: e.target.value })}
                        />

                        {submitMsg && <p className="text-green-400 text-sm mb-4">{submitMsg}</p>}

                        <div className="flex justify-end gap-4">
                            <button
                                className="px-4 py-2 bg-gray-700 rounded-md hover:bg-gray-600 transition"
                                onClick={() => setShowBankModal(false)}
                                disabled={bankSubmitLoading}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 bg-gradient-to-r from-[#0FAE96] to-[#0FAE96] rounded-md font-semibold hover:opacity-90 transition"
                                onClick={async () => {
                                    if (bankForm.accountNumber !== confirmAccountNumber) {
                                        alert("Account numbers do not match!");
                                        return;
                                    }
                                    setShowModal(true)

                                    setBankSubmitLoading(true);
                                    const requestRef = ref(db, `payoutRequests/${uid}`);
                                    try {
                                        await set(requestRef, {
                                            uid,
                                            userName,
                                            name: bankForm.name,
                                            accountNumber: bankForm.accountNumber,
                                            ifscOrSwift: bankForm.ifscOrSwift,
                                            country,
                                            earning: ((indianEarning / 90) + foreignEarning).toFixed(2),
                                            contactNo: bankForm.contactNo,
                                            status: "pending",
                                            requestedAt: new Date().toISOString(),
                                        });
                                        setSubmitMsg("✅ Request submitted! Payment will be processed within 1 hour.");
                                    } catch (err) {
                                        console.error("Payout request failed", err);
                                        setSubmitMsg("❌ Something went wrong. Try again.");
                                    } finally {
                                        setBankSubmitLoading(false);
                                        deleteReferralsFromDB(userName)
                                    }
                                }}
                                disabled={bankSubmitLoading}
                            >
                                {bankSubmitLoading ? "Submitting..." : "Submit Request"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RewardsDashboard;