"use client";
import { useEducationStore } from "@/app/store";
import { useState } from "react";
import { FaTimes } from "react-icons/fa";
import { Pencil, Trash2 } from "lucide-react";
import { GiGraduateCap } from "react-icons/gi";

export default function EducationInput() {
  const { educations, addEducation, updateEducation, deleteEducation } =
    useEducationStore();
  const [isOpen, setIsOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    institute: "",
    areaofstudy: "",
    typeofstudy: "",
    dateRange: "",
    score: "",
    location: "",
  });

  // Handle Form Changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.institute || !formData.typeofstudy || !formData.areaofstudy)
      return;

    if (editId) {
      updateEducation(
        editId,
        formData.institute,
        formData.areaofstudy,
        formData.typeofstudy,
        formData.dateRange,
        formData.score
      );
    } else {
      addEducation(
        formData.institute,
        formData.areaofstudy,
        formData.typeofstudy,
        formData.dateRange,
        formData.score
      );
    }

    // Reset Form and Close Modal
    setFormData({
      institute: "",
      dateRange: "",
      areaofstudy: "",
      typeofstudy: "",
      score: "",
      location: "",
    });
    setEditId(null);
    setIsOpen(false);
  };

  // Handle Edit
  const handleEdit = (id: string) => {
    const education = educations.find((edu) => edu.id === id);
    if (education) {
      setFormData({
        institute: education.institute,
        areaofstudy: education.areaofstudy,
        typeofstudy: education.typeofstudy,
        dateRange: education.dateRange,
        score: education.score,
        location: education.location || "", // Provide default empty string if location is missing
      });
      setIsOpen(true);
      setEditId(id);
    }
  };

  // Handle Delete
  const handleDelete = (id: string) => {
    deleteEducation(id);
  };

  return (
    <section className="p-6 border-b border-[rgba(255,255,255,0.05)] bg-gradient-to-b from-main-bg via-[rgba(17,1,30,0.95)] to-main-bg text-text-subtitle shadow-2xl rounded-xl">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <GiGraduateCap className="text-2xl text-white drop-shadow-glow" />
          <h2 className="text-2xl font-extrabold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent animate-pulse">
            Education
          </h2>
        </div>
      </div>

      {/* Display Education List */}
      {educations.length > 0 && (
        <div className="mb-6 space-y-4">
          {educations.map((education) => (
            <div
              key={education.id}
              className="p-4 bg-gray-800/50 backdrop-blur-md rounded-xl flex justify-between items-center transition-all duration-300 hover:shadow-glow hover:scale-[1.02]"
            >
              <div>
                <strong className="text-lg font-semibold text-white drop-shadow-md">
                  {education.institute}
                </strong>
                <p className="text-sm text-gray-300">{education.typeofstudy}</p>
                <p className="text-sm text-gray-300">{education.areaofstudy}</p>
                <p className="text-sm text-gray-400">{education.dateRange}</p>
                {education.score && (
                  <p className="text-xs text-gray-500">
                    Score: {education.score}
                  </p>
                )}
                {education.location && (
                  <p className="text-xs text-gray-500">
                    Location: {education.location}
                  </p>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleEdit(education.id)}
                  className="p-2 rounded-full bg-blue-600/20 hover:bg-blue-600/40 transition-all duration-300"
                >
                  <Pencil className="w-5 h-5 text-blue-400" />
                </button>
                <button
                  onClick={() => handleDelete(education.id)}
                  className="p-2 rounded-full bg-red-600/20 hover:bg-red-600/40 transition-all duration-300"
                >
                  <Trash2 className="w-5 h-5 text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add New Education Button */}
      <button
        onClick={() => {
          setIsOpen(true);
          setEditId(null);
        }}
        className="w-full p-4 border-2 border-dashed border-gray-600 rounded-xl text-gray-400 bg-[rgba(255,255,255,0.05)] backdrop-blur-md hover:border-gray-500 hover:text-white transition-all duration-300 shadow-inner hover:shadow-glow"
      >
        + Add a new item
      </button>

      {/* Education Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-6 z-50">
          <div className="bg-gradient-to-b from-[#0F011E] via-[rgba(17,1,30,0.95)] to-[#0F011E] text-white p-8 rounded-2xl w-full max-w-[650px] shadow-2xl backdrop-blur-md border border-gray-700">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                {editId ? "Edit Education" : "Add Education"}
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full bg-gray-700/50 hover:bg-gray-600/70 transition-all duration-300"
              >
                <FaTimes size={20} className="text-gray-300" />
              </button>
            </div>

            {/* Education Form */}
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-5 mb-6">
                <input
                  type="text"
                  name="institute"
                  placeholder="Institute"
                  className="w-full p-3 bg-gradient-to-b from-[#0F011E] via-[rgba(17,1,30,0.95)] to-[#0F011E] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 focus:outline-none transition-all duration-300 shadow-inner hover:shadow-glow"
                  value={formData.institute}
                  onChange={handleChange}
                  required
                />
                <input
                  type="text"
                  name="typeofstudy"
                  placeholder="Type of Study"
                  className="w-full p-3 bg-gradient-to-b from-[#0F011E] via-[rgba(17,1,30,0.95)] to-[#0F011E] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 focus:outline-none transition-all duration-300 shadow-inner hover:shadow-glow"
                  value={formData.typeofstudy}
                  onChange={handleChange}
                  required
                />
                <input
                  type="text"
                  name="areaofstudy"
                  placeholder="Area of Study"
                  className="w-full p-3 bg-gradient-to-b from-[#0F011E] via-[rgba(17,1,30,0.95)] to-[#0F011E] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 focus:outline-none transition-all duration-300 shadow-inner hover:shadow-glow"
                  value={formData.areaofstudy}
                  onChange={handleChange}
                  required
                />
                <input
                  type="number"
                  name="score"
                  placeholder="Score"
                  className="w-full p-3 bg-gradient-to-b from-[#0F011E] via-[rgba(17,1,30,0.95)] to-[#0F011E] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 focus:outline-none transition-all duration-300 shadow-inner hover:shadow-glow"
                  value={formData.score}
                  onChange={handleChange}
                  step="0.01" // Allows decimal values
                />
                <input
                  type="date"
                  name="dateRange"
                  className="w-full p-3 bg-gradient-to-b from-[#0F011E] via-[rgba(17,1,30,0.95)] to-[#0F011E] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 focus:outline-none transition-all duration-300 shadow-inner hover:shadow-glow"
                  value={formData.dateRange}
                  onChange={handleChange}
                  onFocus={(e) => e.target.showPicker()} // Show the date picker
                  required
                />
                <input
                  type="text"
                  name="location"
                  placeholder="Location"
                  className="w-full p-3 bg-gradient-to-b from-[#0F011E] via-[rgba(17,1,30,0.95)] to-[#0F011E] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 focus:outline-none transition-all duration-300 shadow-inner hover:shadow-glow"
                  value={formData.location}
                  onChange={handleChange}
                />
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#0eae95] text-white rounded-lg shadow-md hover:from-green-600 hover:to-green-800 hover:shadow-glow transition-all duration-300"
                >
                  {editId ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}