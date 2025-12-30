"use client";

import { useState, useRef, useEffect } from "react";
import {
  X,
  Calendar,
  Briefcase,
  FileText,
  Video,
  Users,
  Plus,
  Trash2,
} from "lucide-react";

const CreateMeetingModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    department: "IT",
    type: "Online",
    description: "1. ",
    members: [],
  });

  const [errors, setErrors] = useState({});
  const [newMember, setNewMember] = useState({ name: "", role: "" });
  const descriptionRef = useRef(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: "",
        date: "",
        department: "IT",
        type: "Online",
        description: "1. ",
        members: [],
      });
      setErrors({});
      setNewMember({ name: "", role: "" });
    }
  }, [isOpen]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleDescriptionKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const textarea = e.target;
      const cursorPos = textarea.selectionStart;
      const textBefore = formData.description.substring(0, cursorPos);
      const textAfter = formData.description.substring(cursorPos);

      const lines = textBefore.split("\n");
      const currentLine = lines[lines.length - 1];

      const match = currentLine.match(/^(\d+)\.\s?/);
      if (match) {
        const currentNum = Number.parseInt(match[1]);
        const nextNum = currentNum + 1;
        const newText = textBefore + "\n" + nextNum + ". " + textAfter;

        setFormData((prev) => ({ ...prev, description: newText }));

        setTimeout(() => {
          const newPos = cursorPos + nextNum.toString().length + 3;
          textarea.setSelectionRange(newPos, newPos);
        }, 0);
      } else {
        // If no number found, just add next line with number
        const lineCount = lines.length;
        const newText = textBefore + "\n" + (lineCount + 1) + ". " + textAfter;
        setFormData((prev) => ({ ...prev, description: newText }));
      }
    }

    // Handle backspace to renumber
    if (e.key === "Backspace") {
      setTimeout(() => {
        const value = descriptionRef.current?.value || "";
        const lines = value.split("\n");
        let needsRenumber = false;

        // Check if renumbering is needed
        lines.forEach((line, index) => {
          const match = line.match(/^(\d+)\.\s?/);
          if (match && Number.parseInt(match[1]) !== index + 1) {
            needsRenumber = true;
          }
        });

        if (needsRenumber) {
          const renumbered = lines
            .map((line, index) => {
              return line.replace(/^(\d+)\.\s?/, `${index + 1}. `);
            })
            .join("\n");
          setFormData((prev) => ({ ...prev, description: renumbered }));
        }
      }, 0);
    }
  };

  const handleAddMember = () => {
    if (newMember.name.trim() && newMember.role.trim()) {
      const member = {
        id: Date.now(),
        name: newMember.name.trim(),
        role: newMember.role.trim(),
      };
      setFormData((prev) => ({
        ...prev,
        members: [...prev.members, member],
      }));
      setNewMember({ name: "", role: "" });
    }
  };

  const handleRemoveMember = (memberId) => {
    setFormData((prev) => ({
      ...prev,
      members: prev.members.filter((m) => m.id !== memberId),
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Meeting title is required";
    if (!formData.date) newErrors.date = "Meeting date is required";
    if (!formData.description.trim() || formData.description.trim() === "1.") {
      newErrors.description = "Meeting description is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      // Format date from YYYY-MM-DD to DD/MM/YYYY
      const [year, month, day] = formData.date.split("-");
      const formattedDate = `${day}/${month}/${year}`;

      onSubmit({
        ...formData,
        date: formattedDate,
      });

      // Reset form
      setFormData({
        title: "",
        date: "",
        department: "IT",
        type: "Online",
        description: "1. ",
        members: [],
      });
      setErrors({});
    }
  };

  const handleClose = () => {
    setFormData({
      title: "",
      date: "",
      department: "IT",
      type: "Online",
      description: "1. ",
      members: [],
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-emerald-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-600 rounded-lg">
              <Video className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              Create New Meeting
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="overflow-y-auto max-h-[calc(90vh-140px)]"
        >
          <div className="p-6 space-y-5">
            {/* Meeting Title */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <FileText className="h-4 w-4" />
                Meeting Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder="Enter meeting title"
                className={`w-full px-4 py-2.5 border ${
                  errors.title ? "border-red-500" : "border-gray-300"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent`}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-500">{errors.title}</p>
              )}
            </div>

            {/* Meeting Date */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4" />
                Meeting Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleChange("date", e.target.value)}
                className={`w-full px-4 py-2.5 border ${
                  errors.date ? "border-red-500" : "border-gray-300"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent`}
              />
              {errors.date && (
                <p className="mt-1 text-sm text-red-500">{errors.date}</p>
              )}
            </div>

            {/* Department and Type in a row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Department */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Briefcase className="h-4 w-4" />
                  Department
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => handleChange("department", e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                >
                  <option value="IT">IT</option>
                  <option value="HR">HR</option>
                  <option value="Sales">Sales</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Finance">Finance</option>
                  <option value="Operations">Operations</option>
                </select>
              </div>

              {/* Meeting Type */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Video className="h-4 w-4" />
                  Meeting Type
                </label>
                <div className="flex gap-3">
                  <label className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 flex-1">
                    <input
                      type="radio"
                      name="type"
                      value="Online"
                      checked={formData.type === "Online"}
                      onChange={(e) => handleChange("type", e.target.value)}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-sm">Online</span>
                  </label>
                  <label className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 flex-1">
                    <input
                      type="radio"
                      name="type"
                      value="Offline"
                      checked={formData.type === "Offline"}
                      onChange={(e) => handleChange("type", e.target.value)}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-sm">Offline</span>
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Users className="h-4 w-4" />
                Meeting Members
              </label>

              {/* Add Member Form */}
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newMember.name}
                  onChange={(e) =>
                    setNewMember((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Member name"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                />
                <input
                  type="text"
                  value={newMember.role}
                  onChange={(e) =>
                    setNewMember((prev) => ({ ...prev, role: e.target.value }))
                  }
                  placeholder="Role"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                />
                <button
                  type="button"
                  onClick={handleAddMember}
                  disabled={!newMember.name.trim() || !newMember.role.trim()}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* Members List */}
              {formData.members.length > 0 ? (
                <div className="border border-gray-200 rounded-lg divide-y divide-gray-200 max-h-32 overflow-y-auto">
                  {formData.members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-medium">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {member.name}
                          </p>
                          <p className="text-xs text-gray-500">{member.role}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(member.id)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">
                  No members added yet
                </p>
              )}
            </div>

            {/* Meeting Description */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <FileText className="h-4 w-4" />
                Meeting Description <span className="text-red-500">*</span>
              </label>
              <textarea
                ref={descriptionRef}
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                onKeyDown={handleDescriptionKeyDown}
                placeholder="Type your first point and press Enter for automatic numbering"
                rows="6"
                className={`w-full px-4 py-2.5 border ${
                  errors.description ? "border-red-500" : "border-gray-300"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none font-mono text-sm`}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.description}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Press Enter for automatic numbering. Each point will be on a new
                line.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-md transition-all duration-200 hover:shadow-lg"
            >
              Create Meeting
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateMeetingModal;
