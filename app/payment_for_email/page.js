"use client";
import React, { useState, useEffect } from "react";
import { get, ref, getDatabase } from "firebase/database";
import app, { auth } from "@/firebase/config";
import { toast } from "react-toastify";
import { onAuthStateChanged } from "firebase/auth";
import { FaInstagram, FaFacebook, FaLinkedin, FaYoutube } from "react-icons/fa";
import { motion } from "framer-motion";
import master from "./mastercard.svg";
import visa from "./visa.svg";
import rupay from "./rupay.svg";
import upi from "./upi.svg";

const Payment = () => {
  const [currency, setCurrency] = useState("INR");
  const [amount, setAmount] = useState(999);
  const [promocode, setPromocode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [coupon, setCoupon] = useState("");
  const [country, setCountry] = useState("");
  const [country_name, setCountryname] = useState("");
  const [isClient, setIsClient] = useState(false);
  const receiptId = "qwsaq1";

  const socialLinks = [
    { Icon: FaInstagram, href: "https://www.instagram.com/yourprofile" },
    { Icon: FaFacebook, href: "https://www.facebook.com/yourprofile" },
    { Icon: FaLinkedin, href: "https://www.linkedin.com/in/yourprofile" },
    { Icon: FaYoutube, href: "https://www.youtube.com/yourchannel" },
  ];

  const paymentMethods = [master, visa, rupay, upi];

  useEffect(() => {
    setIsClient(true); // This ensures code relying on `window` only runs client-side

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        toast.error("You need to be signed in!");
        if (typeof window !== "undefined") {
          window.location.href = "/sign-in";
        }
      }
    });

    if (typeof window !== "undefined") {
      fetch("https://ipapi.co/json/")
        .then((response) => response.json())
        .then((data) => {
          setCountry(data.country);
          setCountryname(data.country_name);
          setCurrency(data.country === "IN" ? "INR" : "USD");
          setAmount(data.country === "IN" ? 1 : 20);
        });

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () =>
        console.log("Razorpay script loaded successfully.");
      document.body.appendChild(script);
    }

    return () => {
      unsubscribe();
    };
  }, []);

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

    if (!response.ok)
      throw new Error(`HTTP error! status: ${response.status}`);
    const order = await response.json();
    initiateRazorpay(order, currency);
  };

  const initiateRazorpay = (order, currency) => {
    if (typeof window !== "undefined" && window.Razorpay) {
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
        amount: order.amount,
        currency,
        name: "JobForm Automator",
        description: "Subscription",
        order_id: order.id,
        handler: async function (response) {
          const validateRes = await fetch(
            "https://us-central1-browser-extension-01.cloudfunctions.net/app/order/validate",
            {
              method: "POST",
              body: JSON.stringify(response),
              headers: { "Content-Type": "application/json" },
            }
          );
          await validateRes.json().then((status) => {
            if (status.msg === "success") {
              toast.success("Payment Successful!");
            }
          });
        },
        theme: { color: "#4CAF50" },
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } else {
      toast.error(
        "Razorpay SDK failed to load. Please check your internet connection."
      );
    }
  };

  const applyPromocode = async (e) => {
    e.preventDefault();
    document.getElementById("promocode").value = "";
    let db = getDatabase(app);
    const userRef = ref(db, "promo_codes/" + promocode);

    get(userRef)
      .then(async (snapshot) => {
        if (snapshot.val() === null) {
          toast.error("Invalid promocode!");
          return;
        }

        if (
          (country === "IN" && snapshot.val().currency_type === "INR") ||
          (country !== "IN" && snapshot.val().currency_type === "USD")
        ) {
          if (snapshot.val().discount_type === "fixed") {
            setCoupon(promocode);
            setDiscount(snapshot.val().discount_value);
          } else if (snapshot.val().discount_type === "percentage") {
            setCoupon(promocode);
            let finalValue = Math.floor(
              amount * (snapshot.val().discount_value / 100)
            );
            setDiscount(finalValue);
          }
        } else {
          toast.error(
            `Invalid Promocode :This promocode is not applicable for ${country_name}`
          );
        }
      })
      .catch((err) => {
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
      {/* --- Main Component Below --- */}
      {/* Keep the rest of the JSX unchanged (you already have it) */}
      {/* Just make sure to check isClient before using any `window` or `document` based features */}
      {/* Example below on social icon click: */}
      {isClient && (
        <div className="mt-6 flex justify-center gap-4 sm:gap-6">
          {socialLinks.map(({ Icon, href }, idx) => (
            <motion.a
              key={idx}
              onClick={() => window.open(href, "_blank")}
              whileHover={{ scale: 1.2, rotate: 5, color: "#0FAE96" }}
              transition={{ duration: 0.3 }}
              className="text-[#B6B6B6]"
            >
              <Icon size={14} className="sm:size-14" />
            </motion.a>
          ))}
        </div>
      )}
    </div>
  );
};

export default Payment;
