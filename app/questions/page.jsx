"use client";
import React, { useEffect, useState } from "react";

const QuestionAns = () => {
  const [questions, setQuestions] = useState([]);
  const [formData, setFormData] = useState({});
  const [allFieldsFilled, setAllFieldsFilled] = useState(true);

  // Handle form data change
  const handleChange = (questionName, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [questionName]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    let filled = true;
    questions.forEach((question) => {
      const sanitizedQuestionName = question.question.replace(/[^a-zA-Z0-9]/g, "_");
      if (!formData[sanitizedQuestionName]) {
        filled = false;
      }
    });
    setAllFieldsFilled(filled);

    if (filled) {
      console.log("All fields are filled. Data to be sent:", formData);
      document.dispatchEvent(
        new CustomEvent("sendFormData", {
          detail: { formData },
        })
      );
      setFormData({});
    } else {
      console.error("Not all fields are filled. Data will not be sent.");
    }
  };

  useEffect(() => {
    // Simulate receiving questions after a delay
    const sendQuestionsEvent = new Event("sendQuestions");
    setTimeout(() => {
      console.log("sendQuestions website");
      document.dispatchEvent(sendQuestionsEvent);
    }, 1000);

    document.addEventListener("questionsData", (event) => {
      const receivedQuestions = event.detail;
      console.log("Received questions in index.js:", receivedQuestions);
      setQuestions(receivedQuestions);
    });

    return () => {
      document.removeEventListener("questionsData", () => {});
    };
  }, []);

  const renderQuestion = (question) => {
    const sanitizedQuestionName = question.question.replace(/[^a-zA-Z0-9]/g, "_");

    switch (question.type) {
      case "input":
        return (
          <input
            type="text"
            name={sanitizedQuestionName}
            value={formData[sanitizedQuestionName] || ""}
            onChange={(e) => handleChange(sanitizedQuestionName, e.target.value)}
            className="w-full p-3 rounded-md bg-[rgba(255,255,255,0.02)] text-[#ECF1F0] border border-[rgba(255,255,255,0.05)] focus:ring-2 focus:ring-[#0FAE96] focus:outline-none"
          />
        );

      case "textarea":
        return (
          <textarea
            name={sanitizedQuestionName}
            value={formData[sanitizedQuestionName] || ""}
            onChange={(e) => handleChange(sanitizedQuestionName, e.target.value)}
            className="w-full p-3 rounded-md bg-[rgba(255,255,255,0.02)] text-[#ECF1F0] border border-[rgba(255,255,255,0.05)] focus:ring-2 focus:ring-[#0FAE96] focus:outline-none"
            rows={4}
          />
        );

      case "select":
        return (
          <select
            name={sanitizedQuestionName}
            value={formData[sanitizedQuestionName] || ""}
            onChange={(e) => handleChange(sanitizedQuestionName, e.target.value)}
            className="w-full p-3 rounded-md bg-[rgba(255,255,255,0.02)] text-[#ECF1F0] border border-[rgba(255,255,255,0.05)] focus:ring-2 focus:ring-[#0FAE96] focus:outline-none"
          >
            {question.text.map((optionValue, index) => (
              <option key={index} value={optionValue} className="bg-[#11011E]">
                {optionValue}
              </option>
            ))}
          </select>
        );

      case "radio":
        return (
          <div className="space-y-2">
            {question.text.map((optionValue, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={sanitizedQuestionName}
                  value={optionValue}
                  checked={formData[sanitizedQuestionName] === optionValue}
                  onChange={() => handleChange(sanitizedQuestionName, optionValue)}
                  className="text-[#0FAE96] focus:ring-[#0FAE96]"
                  id={`${sanitizedQuestionName}-${index}`}
                />
                <label htmlFor={`${sanitizedQuestionName}-${index}`} className="font-roboto text-base text-[#ECF1F0]">
                  {optionValue}
                </label>
              </div>
            ))}
          </div>
        );

      case "checkbox":
        return (
          <div className="space-y-2">
            {question.text.map((optionValue, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name={sanitizedQuestionName}
                  value={optionValue}
                  checked={formData[sanitizedQuestionName]?.includes(optionValue) || false}
                  onChange={(e) => {
                    const updatedValue = formData[sanitizedQuestionName] ? [...formData[sanitizedQuestionName]] : [];
                    if (e.target.checked) {
                      updatedValue.push(optionValue);
                    } else {
                      const idx = updatedValue.indexOf(optionValue);
                      if (idx > -1) {
                        updatedValue.splice(idx, 1);
                      }
                    }
                    handleChange(sanitizedQuestionName, updatedValue);
                  }}
                  className="text-[#0FAE96] focus:ring-[#0FAE96]"
                  id={`${sanitizedQuestionName}-${index}`}
                />
                <label htmlFor={`${sanitizedQuestionName}-${index}`} className="font-roboto text-base text-[#ECF1F0]">
                  {optionValue}
                </label>
              </div>
            ))}
          </div>
        );

      case "number":
        return (
          <input
            type="number"
            name={sanitizedQuestionName}
            value={formData[sanitizedQuestionName] || ""}
            onChange={(e) => handleChange(sanitizedQuestionName, e.target.value)}
            className="w-full p-3 rounded-md bg-[rgba(255,255,255,0.02)] text-[#ECF1F0] border border-[rgba(255,255,255,0.05)] focus:ring-2 focus:ring-[#0FAE96] focus:outline-none"
          />
        );

      default:
        console.log("Unsupported question type:", question.type);
        return null;
    }
  };

  return (
    <>
      <main className="min-h-screen bg-[#11011E] text-white relative overflow-hidden">
        <div className="absolute w-[675px] h-[314px] bg-[#7000FF] opacity-20 blur-[200px] top-[-100px] left-[-100px]"></div>
        <div className="absolute w-[675px] h-[314px] bg-[#FF00C7] opacity-20 blur-[200px] bottom-[-100px] right-[-100px]"></div>
        <h1 className="text-4xl font-raleway font-bold text-[#ECF1F0] text-center mt-12">Unanswered</h1>
        <div className="max-w-[1440px] mx-auto px-[90px] py-12 flex flex-col md:flex-row gap-12">
          <div className="flex-1">
            <h2 className="text-2xl font-raleway font-semibold text-[#ECF1F0] mb-4">AI isn’t confident here.</h2>
            <p className="font-roboto text-base text-[#B6B6B6]">
              Review these sections carefully, as AI couldn’t provide accurate answers. Please check and fill these answers to make sure everything is accurate.
            </p>
          </div>
          <div className="flex-1 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-2xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {questions.map((question, index) => (
                <div key={index} className="space-y-2">
                  <label className="block font-raleway text-lg text-[#ECF1F0]">{question.question}</label>
                  {renderQuestion(question)}
                </div>
              ))}
              {questions.length > 0 && (
                <div className="mt-6">
                  <button
                    type="submit"
                    className="w-full bg-[#0FAE96] text-white font-raleway font-semibold text-base px-6 py-3 rounded-md hover:bg-opacity-80 transition-all"
                  >
                    Submit
                  </button>
                </div>
              )}
              {!allFieldsFilled && <p className="text-red-500 text-sm mt-2">Please fill out all fields.</p>}
            </form>
          </div>
        </div>
      </main>
    </>
  );
};

export default QuestionAns;