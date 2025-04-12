"use client";
import { useState } from "react";
import { FaTimes } from "react-icons/fa";
import { GiAchievement } from "react-icons/gi";
import { Pencil, Trash2 } from "lucide-react";
import { useSkillStore } from "@/app/store";

export default function SkillsInput() {
  const { skills, addSkill, updateSkill, deleteSkill } = useSkillStore();
  const [isOpen, setIsOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    heading: "",
    items: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editId) {
      updateSkill(editId, formData.heading, formData.items);
    } else {
      addSkill(formData.heading, formData.items);
    }

    setFormData({ heading: "", items: "" });
    setEditId(null);
    setIsOpen(false);
  };

  const handleEdit = (id: string) => {
    const skill = skills.find((s) => s.id === id);
    if (skill) {
      setFormData({ heading: skill.heading, items: skill.items });
      setIsOpen(true);
      setEditId(id);
    }
  };

  const handleDelete = (id: string) => {
    deleteSkill(id);
  };

  return (
    <section className="p-6 border-b border-[rgba(255,255,255,0.05)] bg-gradient-to-b from-main-bg via-[rgba(17,1,30,0.95)] to-main-bg text-text-subtitle shadow-2xl rounded-xl">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <GiAchievement className="text-2xl text-white drop-shadow-glow" />
          <h2 className="text-2xl font-extrabold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent animate-pulse">
            Skills
          </h2>
        </div>
      </div>

      {/* Display Skills List */}
      {skills.length > 0 && (
        <div className="mb-6 space-y-4">
          {skills.map((skill) => (
            <div
              key={skill.id}
              className="p-4 bg-gray-800/50 backdrop-blur-md rounded-xl flex justify-between items-center transition-all duration-300 hover:shadow-glow hover:scale-[1.02]"
            >
              <div>
                <strong className="text-lg font-semibold text-white drop-shadow-md">
                  {skill.heading}
                </strong>
                <p className="text-sm text-gray-300">
                  {skill.items.split(",").join(", ")}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleEdit(skill.id)}
                  className="p-2 rounded-full bg-blue-600/20 hover:bg-blue-600/40 transition-all duration-300"
                >
                  <Pencil className="w-5 h-5 text-blue-400" />
                </button>
                <button
                  onClick={() => handleDelete(skill.id)}
                  className="p-2 rounded-full bg-red-600/20 hover:bg-red-600/40 transition-all duration-300"
                >
                  <Trash2 className="w-5 h-5 text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add New Skill Button */}
      <button
        onClick={() => {
          setIsOpen(true);
          setEditId(null);
        }}
        className="w-full p-4 border-2 border-dashed border-gray-600 rounded-xl text-gray-400 bg-[rgba(255,255,255,0.05)] backdrop-blur-md hover:border-gray-500 hover:text-white transition-all duration-300 shadow-inner hover:shadow-glow"
      >
        + Add a new item
      </button>

      {/* Skill Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-6 z-50">
          <div className="bg-gradient-to-b from-[#0F011E] via-[rgba(17,1,30,0.95)] to-[#0F011E] text-white p-8 rounded-2xl w-full max-w-[650px] shadow-2xl backdrop-blur-md border border-gray-700">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                {editId ? "Update Skill" : "Add Skill"}
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full bg-gray-700/50 hover:bg-gray-600/70 transition-all duration-300"
              >
                <FaTimes size={20} className="text-gray-300" />
              </button>
            </div>

            {/* Skill Form */}
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-5 mb-6">
                <input
                  type="text"
                  name="heading"
                  placeholder="Heading"
                  className="w-full p-3 bg-gradient-to-b from-[#0F011E] via-[rgba(17,1,30,0.95)] to-[#0F011E] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 focus:outline-none transition-all duration-300 shadow-inner hover:shadow-glow"
                  value={formData.heading}
                  onChange={handleChange}
                  required
                />
                <input
                  type="text"
                  name="items"
                  placeholder="Items (comma separated)"
                  className="w-full p-3 bg-gradient-to-b from-[#0F011E] via-[rgba(17,1,30,0.95)] to-[#0F011E] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 focus:outline-none transition-all duration-300 shadow-inner hover:shadow-glow"
                  value={formData.items}
                  onChange={handleChange}
                  required
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