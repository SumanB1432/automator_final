"use client";
import React, { useState } from "react";
import { toast } from "react-toastify";

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    userQuery: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const response = await fetch("/api/sendemails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
  
      if (response.ok) {
        toast.success("Your query has been sent successfully!");
        setFormData({ name: "", email: "", phoneNumber: "", userQuery: "" });
      } else {
        toast.error("There was an issue sending your query. Please try again later.");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error("There was an error. Please try again later.");
    }
  };
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#11011E] via-[#35013E] to-[#11011E] px-4">
      <div className="flex flex-col md:flex-row items-center justify-center mx-auto gap-40">
        {/* Left Illustration */}
        <div className="hidden md:block md:w-1/3">
          <img
            src="images/contact.svg"
            alt="Illustration"
            className="max-w-sm mx-auto"
          />
        </div>

        <div className="w-full md:w-2/3 p-6 rounded-lg shadow-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)]">
          <h2 className="text-2xl font-semibold font-raleway text-[#ECF1F0] mb-text-2xl font-raleway font-semibold mb-6 text-center animate-slideDown text-[#ECF1F0]">
            Contact Us
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-medium text-[#B6B6B6] mb-1">
                Name
              </label>
              <input
                type="text"
                name="name"
                placeholder="Name"
                className="border border-[rgba(255,255,255,0.1)] w-full px-3 py-2 rounded-md bg-[#1A1A2E] text-[#ECF1F0] focus:outline-none focus:ring-2 focus:ring-[#0FAE96] placeholder-[#B6B6B6]"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block font-medium text-[#B6B6B6] mb-1">
                Phone No.
              </label>
              <input
                type="tel"
                name="phoneNumber"
                placeholder="phoneNo"
                className="border border-[rgba(255,255,255,0.1)] w-full px-3 py-2 rounded-md bg-[#1A1A2E] text-[#ECF1F0] focus:outline-none focus:ring-2 focus:ring-[#0FAE96] placeholder-[#B6B6B6]"
                required
                value={formData.phoneNumber}
                onChange={handleChange}
                pattern="[0-9]{10}"
              />
            </div>
            <div>
              <label className="block font-medium text-[#B6B6B6] mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="Email"
                className="border border-[rgba(255,255,255,0.1)] w-full px-3 py-2 rounded-md bg-[#1A1A2E] text-[#ECF1F0] focus:outline-none focus:ring-2 focus:ring-[#0FAE96] placeholder-[#B6B6B6]"
                required
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block font-medium text-[#B6B6B6] mb-1">
                Query
              </label>
              <textarea
                name="userQuery"
                placeholder="query"
                className="border border-[rgba(255,255,255,0.1)] w-full px-3 py-2 rounded-md bg-[#1A1A2E] text-[#ECF1F0] focus:outline-none focus:ring-2 focus:ring-[#0FAE96] placeholder-[#B6B6B6]"
                required
                value={formData.userQuery}
                onChange={handleChange}
              />
            </div>
            <br />
            <button
              type="submit"
              className="w-full py-2 bg-[#0FAE96] text-[#FFFFFF] rounded-md font-raleway font-medium text-base hover:opacity-90 bg-[#0FAE96] text-black px-4 py-2 rounded-md hover:bg-[#0FAE96]/80 transform transition duration-200 hover:scale-105 text-sm sm:text-base"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
