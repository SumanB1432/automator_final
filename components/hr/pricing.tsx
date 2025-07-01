/** @format */
"use client";
import React, { useEffect, useRef, useState } from "react";
import { getDatabase, get, update, ref } from "firebase/database";
import app from "@/firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase/config";

const PricingSection = () => {
  const [currency, setCurrency] = useState("");
  const [country, setCountry] = useState("");
  const [country_name, setCountryname] = useState("");
  const [error, setError] = useState(null);
  const [uid, setUid] = useState("")
  const db = getDatabase(app)

  useEffect(() => {
    // Set up the Firebase auth state listener
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is logged in, set the uid
        setUid(user.uid);
      } 
    });

    // Cleanup the listener on component unmount
    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
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
      })
      .catch((err) => {
        console.error("Client location error:", err);
        setError("Unable to detect location, defaulting to USD");
        setCountry("US");
        setCountryname("United States");
        setCurrency("USD");
      });
  }, []);

  useEffect(() => {
    console.log("State updated:", { country, country_name, currency, error });
  }, [currency, country, country_name, error]);


  useEffect(() => {
    const checkSubscriptionStatus = async (uid) => {
      try {
        const paymentRef = ref(db, `hr/${uid}/Payment`);
        const snapshot = await get(paymentRef);

        if (!snapshot.exists()) {
          return { isPremium: false, paymentData: null };
        }

        const paymentData = snapshot.val();
        if (paymentData.Status === "Premium" && paymentData.End_Date) {
          const endDate = new Date(paymentData.End_Date.replace(" ", "T") + "Z");
          const now = new Date();

          if (endDate < now) {
            // Downgrade to Free
            await update(paymentRef, {
              Status: "Free",
              SubscriptionType: "Free",
              End_Date: null
            });
            return { isPremium: false, paymentData: { ...paymentData, Status: "Free", SubscriptionType: "Free", End_Date: null } };
          }
        }

        return { isPremium: paymentData.Status === "Premium", paymentData };
      } catch (error) {
        console.error("Error checking subscription status:", error);
        return { isPremium: false, paymentData: null };
      }
    };
    checkSubscriptionStatus(uid)
  }, [uid])

  const formatPrice = (usd, inr) => {
    return currency === "INR" ? `${inr.toLocaleString("en-IN")}` : `${usd}`;
  };

  const plans = [
    {
      name: "Basic",
      priceUSD: "Free",
      priceINR: "Free",
      description: "Essential Tools to Kickstart Your Job Search",
      features: [
        "Auto-Download Resumes",
        "AI Resume Parsing (Basic Fields)",
        "Send up to 500 AI Emails/Month",
        "Delete your data anytime",
      ],
      buttonText: "Get Started",
      buttonStyle:
        "bg-transparent border border-[#0FAE96] text-[#0FAE96] hover:bg-[#0FAE96] hover:text-white hover:shadow-lg transition-all duration-300",
    },
    {
      name: "Premium",
      priceUSD: "$49",
      priceINR: "₹1499",
      description: "Advanced Features for the Serious Job Seeker",
      features: [
        "All in Beginner plan",
        "Auto-Download from All Major Job Boards",
        "AI Parsing with 98%+ Accuracy",
        "1,000 AI Emails/Month",
        "AI Video Interview (Up to 50 Seats)",
      ],
      buttonText: "Subscribe",
      buttonStyle:
        "bg-[#0FAE96] text-white hover:brightness-110 hover:shadow-xl transition-all duration-300",
      bestSeller: true,
    },
    {
      name: "Diamond",
      priceUSD: "$99",
      priceINR: "₹2999",
      description: "Untill you are hired",
      features: [
        "All in Premium Plan",
        "Enterprise-Grade AI Parsing",
        "10,000 AI Emails/Month",
        "Unlimited AI Interviews",
      ],
      buttonText: "Subscribe",
      buttonStyle:
        "bg-transparent border border-[#0FAE96] text-[#0FAE96] hover:bg-[#0FAE96] hover:text-white hover:shadow-lg transition-all duration-300",
    },
  ];

  const cardRefs = useRef([]);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setIsInView(true);
        });
      },
      { threshold: 0.5 }
    );

    cardRefs.current
      .filter((card) => card !== null)
      .forEach((card) => observer.observe(card));

    return () => {
      cardRefs.current
        .filter((card) => card !== null)
        .forEach((card) => observer.unobserve(card));
    };
  }, []);

  function handlePyment(name, usd, inr) {
    if (name !== "Basic") {
      const selectedPrice = currency === "INR" ? inr : usd;
      window.location.href = `/payment?plan=${encodeURIComponent(
        name
      )}&price=${encodeURIComponent(selectedPrice)}¤cy=${currency}&for=${encodeURIComponent("hr")}`;
    }
  }

  return (
    <section className="bg-[#11011E] text-[#ECF1F0] py-20 px-6 sm:px-8">
      <div className="max-w-6xl mx-auto text-center">
        {/* Header */}
        <div className="inline-flex items-center space-x-3 px-5 py-2 rounded-full border border-[#FFFFFF0D] bg-[#FFFFFF05] backdrop-blur-lg">
          <span className="w-3 h-3 rounded-full bg-[#0FAE96]" />
          <span className="text-sm text-[#0FAE96]">Pricing</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-semibold font-raleway mt-6">
          The perfect plan for your job hunt
        </h2>
        <p className moving-right-to-left="text-lg sm:text-xl text-[#B6B6B6] mt-3">
          Choose the plan that best supports your job search and unlock more
          powerful features.
        </p>

        {/* Pricing Cards */}
        <div className="pricing-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
          {plans.map((plan, index) => (
            <div
              key={index}
              ref={(el) => (cardRefs.current[index] = el)}
              className={`
                card relative group p-6 sm:p-8 rounded-3xl border transition-all duration-700 ease-in-out transform
                ${isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}
                ${plan.bestSeller
                  ? "border-[#0FAE96] bg-gradient-to-bl from-[#0fae9655] via-[#11011E] to-[#11011E] shadow-[0_0_20px_#0FAE96aa]"
                  : "border-[#ffffff1A] bg-[#FFFFFF05]"
                }
                hover:scale-[1.02] hover:shadow-2xl
              `}
            >
              {/* Best Seller Badge */}
              {plan.bestSeller && (
                <div className="absolute top-4 right-4 bg-[#0FAE96] text-white text-xs px-3 py-1 rounded-full shadow-md font-medium">
                  Best seller
                </div>
              )}

              <h3 className="text-xl font-semibold font-raleway">
                {plan.name}
              </h3>
              <p className="text-sm text-[#B6B6B6] mt-2">{plan.description}</p>
              <div className="mt-6 text-4xl font-bold">
                {currency && country ? (
                  formatPrice(plan.priceUSD, plan.priceINR)
                ) : (
                  <div className="flex justify-center items-center">
                    <div className="loader border-t-4 border-[#0FAE96] rounded-full w-8 h-8 animate-spin"></div>
                  </div>
                )}
              </div>

              <button
                className={`mt-6 w-full px-4 py-2 rounded-xl ${plan.buttonStyle}`}
                onClick={() =>
                  handlePyment(plan.name, plan.priceUSD, plan.priceINR)
                }
              >
                {plan.buttonText}
              </button>

              {/* Features */}
              <ul className="mt-6 space-y-3 text-sm text-[#B6B6B6] text-left">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center">
                    <span className="w-3 h-3 mr-3 bg-[#0FAE96] rounded-full shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      {/* Custom CSS to blur/dim non-hovered cards and for loader */}
      <style jsx>{`
        .pricing-grid:hover .card {
          filter: blur(4px);
          opacity: 0.6;
          transition: filter 0.3s ease, opacity 0.3s ease;
        }
        .pricing-grid:hover .card:hover {
          filter: blur(0px) !important;
          opacity: 1 !important;
          transition: filter 0.3s ease, opacity 0.3s ease;
        }
        .loader {
          border: 4px solid #f3f3f3;
          border-top: 4px solid #0FAE96;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </section>
  );
};

export default PricingSection;