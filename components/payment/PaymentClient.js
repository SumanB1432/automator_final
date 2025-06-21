
"use client";
import React, { useState, useEffect } from "react";
import { get, ref, getDatabase, update } from "firebase/database";
import app, { auth } from "@/firebase/config";
import { toast } from "react-toastify";
import { onAuthStateChanged } from "firebase/auth";
import { FaCheck, FaTimes } from "react-icons/fa";
import { MdLocationOn, MdCall, MdEmail } from "react-icons/md";
import { FaInstagram, FaFacebook, FaLinkedin, FaYoutube } from "react-icons/fa";
import { ArrowRightIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import master from "./mastercard.svg";
import visa from "./visa.svg";
import rupay from "./rupay.svg";
import upi from "./upi.svg";

const db = getDatabase(app);

const PaymentClient = () => {
  const [currency, setCurrency] = useState("");
  const [amount, setAmount] = useState(0);
  const [promocode, setPromocode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [coupon, setCoupon] = useState("");
  const [country, setCountry] = useState("");
  const [country_name, setCountryname] = useState("");
  const [section_for, setSectionFor] = useState("")
  const receiptId = "qwsaq1";
  const socialLinks = [
    { Icon: FaInstagram, color: "#ec4899", href: "https://www.instagram.com/yourprofile" },
    { Icon: FaFacebook, color: "#2563eb", href: "https://www.facebook.com/yourprofile" },
    { Icon: FaLinkedin, color: "#60a5fa", href: "https://www.linkedin.com/company/aikingsolutions/posts/?feedView=all" },
    { Icon: FaYoutube, color: "#ef4444", href: "https://www.youtube.com/@JobFormAutomator" },
  ];
  const paymentMethods = [master, visa, rupay, upi];

  const searchParams = useSearchParams();

  useEffect(() => {
    // Extract price from URL
    const priceFromUrl = searchParams.get("price");
    const section = searchParams.get("for");
    console.log(section)
    setSectionFor(section)
    let initialAmount = 0;
    if (priceFromUrl) {
      // Decode and remove currency symbol (₹ or others) to get numeric value
      const decodedPrice = decodeURIComponent(priceFromUrl).replace(/[^0-9.]/g, "");
      initialAmount = parseFloat(decodedPrice) || 0;
    }

    // Redirect user if not signed in
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        toast.error("You need to be signed in!");
        window.location.href = "/sign-in";
      }
    });

    // Fetch user location data client-side
    fetch("https://geolocation-db.com/json/")
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch location");
        return response.json();
      })
      .then((data) => {
        console.log("Client location data:", data);
        const countryCode = data.country_code || "US";
        setCountry(countryCode);
        setCountryname(data.country_name || "Unknown");
        setCurrency(countryCode === "IN" ? "INR" : "USD");
        // Use URL price if available, otherwise fallback to default logic
        setAmount(initialAmount || (countryCode === "IN" ? 499 : 20));
      })
      .catch((err) => {
        console.error("Client location error:", err);
        setCountry("US");
        setCountryname("United States");
        setCurrency("USD");
        // Use URL price if available, otherwise fallback to default
        setAmount(initialAmount || 20);
        toast.error("Unable to detect location, defaulting to USD");
      });

    // Load Razorpay script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => console.log("Razorpay script loaded successfully.");
    document.body.appendChild(script);

    return () => {
      unsubscribe();
    };
  }, [searchParams]);

  const handlePayment = async (e) => {
    e.preventDefault();
    const finalAmount = (amount - discount) * 100;
    const response = await fetch(
      "https://us-central1-browser-extension-01.cloudfunctions.net/app/order",
      {
        method: "POST",
        body: JSON.stringify({
          amount: finalAmount,
          currency,
          receipt: receiptId,
        }),
        headers: { "Content-Type": "application/json" },
      }
    );
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const order = await response.json();

    initiateRazorpay(order, currency);
  };

  const initiateRazorpay = (order, currency) => {
    if (typeof window !== "undefined" && window.Razorpay) {
      var options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
        amount: order.amount,
        currency,
        name: "JobForm Automator",
        description: "Subscription",
        order_id: order.id,
        handler: async function (response) {
          fetch("https://us-central1-browser-extension-01.cloudfunctions.net/app/order/validate", {
            method: "POST",
            body: JSON.stringify(response),
            headers: { "Content-Type": "application/json" },
          }).catch((err) => {
            console.error("Payment validation failed:", err);
          });

          const notifyExtensionOnPayment = (uid) => {
            const event = new CustomEvent("paymentSuccessfull", { detail: { uid } });
            document.dispatchEvent(event);
          };

          const currentUser = auth?.currentUser?.uid;
          notifyExtensionOnPayment(currentUser);

          const currentDate = new Date();
          const formattedDateTime = currentDate.toISOString().replace("T", " ").split(".")[0];

          const getReferralCodeFromCookie = () => {
            const cookie = document.cookie.split("; ").find((row) => row.startsWith("referral="));
            return cookie ? cookie.split("=")[1] : null;
          };

          const referralCode = getReferralCodeFromCookie();
          console.log("referral code", referralCode)
          const userRef = ref(db, `/referrals/${referralCode}/${currentUser}`);

          update(userRef, {
            amount: amount,
            currency: currency,
            paymentDate: formattedDateTime,
          })
            .then(() => {
              console.log("Referral info updated.");
            })
            .catch((error) => {
              console.error("Referral update error:", error);
            });

          //UPDATE DATABASE PAYMENT STATUS FOR CANDIDATE OR HRS
          const recentDate = new Date();
          const startDateStr = recentDate.toISOString().replace("T", " ").split(".")[0];

          // Calculate End_Date (1 month from Start_Date)
          const endDate = new Date(recentDate);
          endDate.setMonth(recentDate.getMonth() + 1);
          const endDateStr = endDate.toISOString().replace("T", " ").split(".")[0];
          const userPaymentRef = ref(db, `user/${currentUser}/Payment`);
          const hrPaymentRef = ref(db, `hr/${currentUser}/Payment`);
          if (section_for == "hr") {
            update(hrPaymentRef, {
              Start_Date: startDateStr,
              End_Date:endDateStr,
              Status: "Premium",
              SubscriptionType: "Premium"

            }).then(() => {
              window.location.href = "/hr"
              console.log("HR payment status update!")
            })
          }
          if (section_for == "candidate") {
            update(userPaymentRef, {
              Start_Date: startDateStr,
              End_Date:endDateStr,
              Status: "Premium",
              SubscriptionType: "Premium"

            }).then(() => {
              window.location.href = "/"
              console.log("HR payment status update!")
            })
          }

          const paymentRef = ref(db, `user/${currentUser}/Payment`);
          update(paymentRef, {
            email_count: 0,
          }).then(() => {
            console.log("Email count reset.");
          });

          const marketingRef = ref(db, `marketing_email/${currentUser}`);
          get(marketingRef)
            .then((snapshot) => {
              if (snapshot.exists()) {
                console.log("marketting email update")
                return update(marketingRef, { status: "Premium" });
              } else {
                console.log("No marketing_email entry found for user.");
              }
            })
            .then(() => {
              console.log("Marketing email updated successfully");
            })
            .catch((err) => {
              console.log("Error:", err.message);
            });
        },
        theme: { color: "#4CAF50" },
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } else {
      toast.error("Razorpay SDK failed to load. Please check your internet connection.");
    }
  };

  const applyPromocode = async (e) => {
    e.preventDefault();
    document.getElementById('promocode').value = '';
    let db = getDatabase(app);
    const userRef = ref(db, "promo_codes/" + promocode);
    get(userRef).then(async (snapshot) => {
      console.log(snapshot.val());
      if (snapshot.val() === null) {
        toast.error("Invalid promocode!");
        return;
      }
      if ((country === "IN" && snapshot.val().currency_type === "INR") || (country !== "IN" && snapshot.val().currency_type === "USD")) {
        if (snapshot.val().discount_type === "fixed") {
          setCoupon(promocode);
          setDiscount(snapshot.val().discount_value);
        } else if (snapshot.val().discount_type === "percentage") {
          setCoupon(promocode);
          let finalValue = Math.floor(amount * (snapshot.val().discount_value / 100));
          setDiscount(finalValue);
        }
      } else {
        toast.error(`Invalid Promocode :This promocode is not applicable for  ${country_name}`);
      }
    }).catch((err) => {
      toast.error(err);
    });
  };

  const deleteCoupon = () => {
    setCoupon("");
    setDiscount(0);
  };

  const subtotal = ((amount - discount) * 100) / 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D0117] via-[#1A0229] to-[#2A033D] py-8 md:py-16 text-[#ECF1F0] overflow-x-hidden">
      <motion.main
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        {/* Header */}
        <div className="text-center mb-10 md:mb-14">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#0FAE96] via-[#76E0CC] to-[#ECF1F0]">
            Seamless Checkout
          </h1>
          <p className="mt-2 text-base sm:text-lg md:text-xl text-[#B6B6B6] max-w-lg mx-auto">
            Unlock premium automation with a secure, hassle-free payment.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {/* Left Section - Why Choose Us & Contact */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="rounded-3xl p-6 sm:p-8 bg-[#1A0229]/60 backdrop-blur-xl border border-[#ECF1F0]/10 shadow-2xl hover:shadow-[0_0_20px_rgba(15,174,150,0.2)] transition-all duration-500"
          >
            <h2 className="text-xl sm:text-2xl font-semibold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#0FAE96] to-[#ECF1F0]">
              Why JobForm Automator?
            </h2>
            <div className="space-y-4 sm:space-y-5 text-[#B6B6B6] text-sm sm:text-base">
              {[
                "Automate job applications effortlessly.",
                "Round-the-clock expert support.",
                "Risk-free with a money-back promise.",
              ].map((text, index) => (
                <motion.div
                  key={index}
                  whileHover={{ x: 5, color: "#ECF1F0" }}
                  transition={{ duration: 0.3 }}
                  className="flex items-start"
                >
                  <FaCheck className="text-[#0FAE96] mr-3 mt-1 flex-shrink-0" />
                  <p>{text}</p>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 sm:mt-10">
              <h2 className="text-xl sm:text-2xl font-semibold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#0FAE96] to-[#ECF1F0]">
                Contact Us
              </h2>
              <div className="space-y-4 text-[#B6B6B6] text-sm sm:text-base">
                <div className="flex items-center">
                  <MdLocationOn className="text-[#0FAE96] mr-3" />
                  <span>Location: {country_name || "Detecting..."}</span>
                </div>
                <div className="flex items-center">
                  <MdCall className="text-[#0FAE96] mr-3" />
                  <span>+91 9766116839</span>
                </div>
                <div className="flex items-center">
                  <MdEmail className="text-[#0FAE96] mr-3" />
                  <span>support@jobformautomator.com</span>
                </div>
              </div>

              <div className="mt-6 flex justify-center gap-4 sm:gap-6">
                {socialLinks.map(({ Icon, href, color }, idx) => (
                  <motion.a
                    key={idx}
                    onClick={() => window.open(href, "_blank")}
                    whileHover={{ scale: 1.2, rotate: 5, color: `${color}` }}
                    transition={{ duration: 0.3 }}
                    className="text-[#B6B6B6]"
                  >
                    <Icon size={14} className="sm:size-14" />
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right Section - Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="rounded-3xl p-6 sm:p-8 bg-[#1A0229]/60 backdrop-blur-xl border border-[#ECF1F0]/10 shadow-2xl hover:shadow-[0_0_20px_rgba(15,174,150,0.2)] transition-all duration-500"
          >
            <h2 className="text-xl sm:text-2xl font-semibold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#0FAE96] to-[#ECF1F0]">
              Your Order
            </h2>
            <div className="space-y-6">
              <div className="flex justify-between text-[#B6B6B6] text-sm sm:text-base">
                <span>Total ({currency || "Loading"}):</span>
                {amount === 0 && currency === "" ? (
                  <div className="flex items-center">
                    <svg
                      className="animate-spin h-5 w-5 text-[#0FAE96]"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  </div>
                ) : (
                  <span className="font-medium text-lg sm:text-xl">
                    {coupon
                      ? `${currency} ${subtotal.toFixed(2)}`
                      : `${currency} ${amount.toFixed(2)}`}
                  </span>
                )}
              </div>

              {/* Promo Code */}
              <form onSubmit={applyPromocode} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  id="promocode"
                  placeholder="Promo Code"
                  value={promocode}
                  onChange={(e) => setPromocode(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-[#2A033D]/70 border border-[#ECF1F0]/20 text-[#ECF1F0] focus:outline-none focus:ring-2 focus:ring-[#0FAE96] transition-all duration-300 placeholder-[#B6B6B6]"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#0FAE96] hover:bg-[#0fae96d0] font-semibold text-white transition-all duration-300"
                >
                  Apply
                </motion.button>
              </form>

              {/* Coupon Display */}
              {coupon && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-[#0FAE96]/10 border border-[#0FAE96]/40 rounded-lg"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-[#ECF1F0]">
                      Code: {coupon}
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.1, color: "#FF6B6B" }}
                      onClick={deleteCoupon}
                      className="text-[#ECF1F0]"
                    >
                      <FaTimes />
                    </motion.button>
                  </div>
                  <p className="text-[#0FAE96] mt-2 text-sm sm:text-base">
                    <FaCheck className="inline mr-2" />
                    Saved {currency} {discount.toFixed(2)}
                  </p>
                </motion.div>
              )}

              {/* Pay Button */}
              <motion.button
                whileHover={{ scale: 1.03, boxShadow: "0 0 15px rgba(15,174,150,0.5)" }}
                whileTap={{ scale: 0.98 }}
                onClick={handlePayment}
                className="w-full py-3 px-6 rounded-lg bg-gradient-to-r from-[#0FAE96] to-[#76E0CC] font-semibold text-white flex items-center justify-center gap-2 transition-all duration-300 shadow-lg"
              >
                Pay Now
                <ArrowRightIcon className="h-5 w-5" />
              </motion.button>

              {/* Payment Methods */}
              <div className="mt-6 text-center">
                <p className="text-[#B6B6B6] font-medium text-sm sm:text-base">
                  Trusted Payment Options
                </p>
                <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mt-3">
                  {paymentMethods.map((src, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ scale: 1.1, y: -3 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Image
                        src={src}
                        alt="Payment Method"
                        width={40}
                        height={30}
                        className="opacity-80 hover:opacity-100 transition-opacity duration-300"
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.main>

      <footer className="py-6 text-center text-[#B6B6B6] mt-10 text-sm sm:text-base">
        <p>© 2025 JobForm Automator. Crafted with ❤️ for job seekers.</p>
      </footer>
    </div>
  );
};

export default PaymentClient;
