/** @format */
"use client";
import React, { useEffect, useRef, useState } from "react";





const PricingSection = () => {
  const [currency, setCurrency] = useState("INR");
  const [country, setCountry] = useState("");
  const [country_name, setCountryname] = useState("");

  useEffect(() => {
    // Fetch user location data
    fetch("/api/location")
      .then((response) => response.json())
      .then((data) => {
        console.log("country", data)
        setCountry(data.country_code);
        setCountryname(data.country_name);
        setCurrency(data.country_code === "IN" ? "INR" : "USD");

      });

  })

  useEffect(() => {
    console.log(country, country_name, currency)
  }, [currency, country, country_name])

  const formatPrice = (usd, inr) => {
    return currency === "INR"
      ? `${inr.toLocaleString("en-IN")}`
      : `${usd}`;
  };

  const plans = [
    {
      name: "Basic",
      priceUSD: "Free",
      priceINR: "Free",
      description: "Essential Tools to Kickstart Your Job Search",
      features: [
        "Auto-Apply up to 10 jobs/day",
        "AI Autofill on job forms",
        "One click ATS Resume Builder",
        "Delete your data anytime",
      ],
      buttonText: "Get Started",
      buttonStyle:
        "bg-transparent border border-[#0FAE96] text-[#0FAE96] hover:bg-[#0FAE96] hover:text-white hover:shadow-lg transition-all duration-300",
    },
    {
      name: "Premium",
      priceUSD: "$20",
      priceINR: "₹499",
      description: "Advanced Features for the Serious Job Seeker",
      features: [
        "All in Beginner plan",
        "100 Auto Email to Recruiters",
        "Auto-Apply 300 jobs Daily",
        "Skill Suggestions Based on Job Market Trends",
        "Advanced AI-Crafted Resume",
      ],
      buttonText: "Subscribe",
      buttonStyle:
        "bg-[#0FAE96] text-white hover:brightness-110 hover:shadow-xl transition-all duration-300",
      bestSeller: true,
    },
    {
      name: "Silver",
      priceUSD: "$99",
      priceINR: "₹999",
      description: "Untill you are hired",
      features: [
        "All in Premium Plan",
        "Priority Email + Call Supportl",
        "1000 Auto Email to Recruiters",
        "Real-Time Skill Gap Analysis with Free Learning Links",
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
      window.location.href = `/payment?plan=${encodeURIComponent(name)}&price=${encodeURIComponent(selectedPrice)}&currency=${currency}`;
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
        <p className="text-lg sm:text-xl text-[#B6B6B6] mt-3">
          Choose the plan that best supports your job search and unlock more powerful features.
        </p>

        {/* Pricing Cards */}
        <div className="pricing-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
          {plans.map((plan, index) => (
            <div
              key={index}
              ref={(el) => (cardRefs.current[index] = el)}
              className={`
                card relative group p-6 sm:p-8 rounded-3xl border transition-all duration-700 ease-in-out transform
                ${isInView
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
                }
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
                {formatPrice(plan.priceUSD, plan.priceINR)}
              </div>

              <button className={`mt-6 w-full px-4 py-2 rounded-xl ${plan.buttonStyle}`} onClick={() => handlePyment(plan.name, plan.priceUSD, plan.priceINR)}>
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
      {/* Custom CSS to blur/dim non-hovered cards */}
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
      `}</style>
    </section>
  );
};

export default PricingSection;