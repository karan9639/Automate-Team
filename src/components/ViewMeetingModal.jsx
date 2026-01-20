"use client";

import { useState, useEffect, useRef } from "react";
import {
  X,
  Calendar,
  Briefcase,
  FileText,
  Video,
  Users,
  Edit2,
  Save,
  XCircle,
  Trash2,
  Plus,
} from "lucide-react";
import DeleteConfirmationModal from "./DeleteConfirmationModal";

import {
  getDescriptionLines,
  linesToNumberedText,
  prepareDescriptionForStorage,
  formatTsvToAlignedColumns,
} from "@/utils/descriptionUtils";

const normalizeNewlines = (text) =>
  (text || "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\u00A0/g, " ");

const ViewMeetingModal = ({ isOpen, onClose, meeting, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [editForm, setEditForm] = useState({
    title: "",
    date: "",
    department: "",
    type: "",
    description: "",
    members: [],
  });

  const [newMember, setNewMember] = useState({ name: "", role: "" });
  const descriptionRef = useRef(null);

  useEffect(() => {
    if (meeting) {
      const lines = getDescriptionLines(meeting.description || "");
      setEditForm({
        title: meeting.title || "",
        date: formatDateForInput(meeting.date) || "",
        department: meeting.department || "IT",
        type: meeting.type || "Online",
        // ✅ show numbered text while editing
        description: lines.length ? linesToNumberedText(lines) : "1. ",
        members: meeting.members || [],
      });
      setIsEditing(false);
      setNewMember({ name: "", role: "" });
    }
  }, [meeting]);

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Kolkata",
      });
    } catch {
      return dateString;
    }
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    } catch {
      return "";
    }
  };

  const formatCreatedAtForDisplay = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Kolkata",
      });
    } catch {
      return dateString;
    }
  };

  const handleChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  // ✅ Paste Excel in edit mode (keeps alignment)
  const handleDescriptionPaste = (e) => {
    const pastedRaw = e.clipboardData?.getData("text/plain") || "";
    if (!pastedRaw) return;

    e.preventDefault();

    const textarea = e.currentTarget;
    const value = textarea.value;

    const selectionStart = textarea.selectionStart ?? value.length;
    const selectionEnd = textarea.selectionEnd ?? value.length;

    const before = value.slice(0, selectionStart);
    const after = value.slice(selectionEnd);

    const formatted = pastedRaw.includes("\t")
      ? formatTsvToAlignedColumns(pastedRaw)
      : normalizeNewlines(pastedRaw);

    const lineStart = before.lastIndexOf("\n") + 1;
    const currentLineUptoCursor = before.slice(lineStart);
    const bulletOnlyMatch = currentLineUptoCursor.match(/^\s*(\d+)\.\s*$/);

    let newValue = "";
    let newCursor = 0;

    if (bulletOnlyMatch) {
      const startNum = parseInt(bulletOnlyMatch[1], 10);

      let lines = normalizeNewlines(formatted).split("\n");
      if (lines.length > 1 && lines[lines.length - 1] === "") lines.pop();

      const lastNum = startNum + lines.length - 1;
      const maxDigits = String(lastNum).length;

      const numberedBlock = lines
        .map((ln, idx) => {
          const n = startNum + idx;
          const prefix = `${String(n).padStart(maxDigits, " ")}. `;
          return prefix + ln;
        })
        .join("\n");

      newValue = value.slice(0, lineStart) + numberedBlock + after;
      newCursor = lineStart + numberedBlock.length;
    } else {
      newValue = before + formatted + after;
      newCursor = before.length + formatted.length;
    }

    setEditForm((prev) => ({ ...prev, description: newValue }));

    setTimeout(() => {
      const el = descriptionRef.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(newCursor, newCursor);
    }, 0);
  };

  // ✅ Enter numbering + Backspace renumber
  const handleDescriptionKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const textarea = e.target;
      const cursorPos = textarea.selectionStart;
      const textBefore = editForm.description.substring(0, cursorPos);
      const textAfter = editForm.description.substring(cursorPos);

      const lines = textBefore.split("\n");
      const currentLine = lines[lines.length - 1];

      const match = currentLine.match(/^(\d+)\.\s?/);
      if (match) {
        const currentNum = Number.parseInt(match[1], 10);
        const nextNum = currentNum + 1;
        const newText = textBefore + "\n" + nextNum + ". " + textAfter;

        setEditForm((prev) => ({ ...prev, description: newText }));

        setTimeout(() => {
          const newPos = cursorPos + nextNum.toString().length + 3;
          textarea.setSelectionRange(newPos, newPos);
        }, 0);
      }
    }

    if (e.key === "Backspace") {
      setTimeout(() => {
        const value = descriptionRef.current?.value || "";
        const lines = value.split("\n");
        let needsRenumber = false;

        lines.forEach((line, index) => {
          const match = line.match(/^(\d+)\.\s?/);
          if (match && Number.parseInt(match[1], 10) !== index + 1) {
            needsRenumber = true;
          }
        });

        if (needsRenumber) {
          const renumbered = lines
            .map((line, index) => line.replace(/^(\d+)\.\s?/, `${index + 1}. `))
            .join("\n");
          setEditForm((prev) => ({ ...prev, description: renumbered }));
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
      setEditForm((prev) => ({
        ...prev,
        members: [...prev.members, member],
      }));
      setNewMember({ name: "", role: "" });
    }
  };

  const handleRemoveMember = (memberId) => {
    setEditForm((prev) => ({
      ...prev,
      members: prev.members.filter((m) => m.id !== memberId),
    }));
  };

  const handleSave = () => {
    const cleanedDescription = prepareDescriptionForStorage(
      editForm.description,
    );

    const updatedMeeting = {
      ...meeting,
      ...editForm,
      description: cleanedDescription, // ✅ store clean
      date: editForm.date, // ✅ keep YYYY-MM-DD from input
    };

    onUpdate(updatedMeeting);
    setIsEditing(false);
  };

  const handleCancel = () => {
    const lines = getDescriptionLines(meeting.description || "");
    setEditForm({
      title: meeting.title || "",
      date: formatDateForInput(meeting.date) || "",
      department: meeting.department || "IT",
      type: meeting.type || "Online",
      description: lines.length ? linesToNumberedText(lines) : "1. ",
      members: meeting.members || [],
    });
    setIsEditing(false);
    setNewMember({ name: "", role: "" });
  };

  const handleDeleteClick = () => setIsDeleteModalOpen(true);
  const handleDeleteConfirm = () => {
    onDelete(meeting.id);
    setIsDeleteModalOpen(false);
  };
  const handleDeleteCancel = () => setIsDeleteModalOpen(false);

  if (!isOpen || !meeting) return null;

  // ✅ Lines for VIEW (no numbering inside)
  const viewLines = getDescriptionLines(meeting.description || "");

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-emerald-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-600 rounded-lg">
                <Video className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Meeting Details
              </h2>
            </div>

            <div className="flex items-center gap-2">
              {!isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="h-5 w-5" />
                  </button>
                  <button
                    onClick={handleDeleteClick}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors"
                    title="Save"
                  >
                    <Save className="h-5 w-5" />
                  </button>
                  <button
                    onClick={handleCancel}
                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Cancel"
                  >
                    <XCircle className="h-5 w-5" />
                  </button>
                </>
              )}

              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
          </div>

          <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6 space-y-5">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-1">
                <FileText className="h-4 w-4" />
                Meeting Title
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              ) : (
                <p className="text-lg font-semibold text-gray-900">
                  {meeting.title}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-1">
                  <Calendar className="h-4 w-4" />
                  Meeting Date
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    value={editForm.date}
                    onChange={(e) => handleChange("date", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                ) : (
                  <p className="text-gray-900">
                    {formatDateForDisplay(meeting.date)}
                  </p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-1">
                  <Video className="h-4 w-4" />
                  Meeting Type
                </label>
                {isEditing ? (
                  <div className="flex gap-3">
                    <label className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 flex-1">
                      <input
                        type="radio"
                        name="editType"
                        value="Online"
                        checked={editForm.type === "Online"}
                        onChange={(e) => handleChange("type", e.target.value)}
                        className="text-emerald-600"
                      />
                      <span className="text-sm">Online</span>
                    </label>
                    <label className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 flex-1">
                      <input
                        type="radio"
                        name="editType"
                        value="Offline"
                        checked={editForm.type === "Offline"}
                        onChange={(e) => handleChange("type", e.target.value)}
                        className="text-emerald-600"
                      />
                      <span className="text-sm">Offline</span>
                    </label>
                  </div>
                ) : (
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      meeting.type === "Online"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {meeting.type}
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-1">
                <Briefcase className="h-4 w-4" />
                Department
              </label>
              {isEditing ? (
                <select
                  value={editForm.department}
                  onChange={(e) => handleChange("department", e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="IT">IT</option>
                  <option value="HR">HR</option>
                  <option value="Sales">Sales</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Finance">Finance</option>
                  <option value="Operations">Operations</option>
                </select>
              ) : (
                <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                  {meeting.department}
                </span>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-2">
                <Users className="h-4 w-4" />
                Meeting Members
              </label>

              {isEditing && (
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newMember.name}
                    onChange={(e) =>
                      setNewMember((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="Member name"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                  <input
                    type="text"
                    value={newMember.role}
                    onChange={(e) =>
                      setNewMember((prev) => ({
                        ...prev,
                        role: e.target.value,
                      }))
                    }
                    placeholder="Role"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
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
              )}

              {(isEditing ? editForm.members : meeting.members)?.length > 0 ? (
                <div className="border border-gray-200 rounded-lg divide-y divide-gray-200 max-h-40 overflow-y-auto">
                  {(isEditing ? editForm.members : meeting.members).map(
                    (member) => (
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
                            <p className="text-xs text-gray-500">
                              {member.role}
                            </p>
                          </div>
                        </div>
                        {isEditing && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMember(member.id)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ),
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">
                  No members assigned
                </p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-2">
                <FileText className="h-4 w-4" />
                Meeting Description
              </label>

              {isEditing ? (
                <>
                  <textarea
                    ref={descriptionRef}
                    value={editForm.description}
                    onChange={(e) =>
                      handleChange("description", e.target.value)
                    }
                    onKeyDown={handleDescriptionKeyDown}
                    onPaste={handleDescriptionPaste}
                    rows="8"
                    wrap="off"
                    spellCheck={false}
                    style={{ tabSize: 8, MozTabSize: 8 }}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none font-mono text-sm overflow-auto whitespace-pre"
                    placeholder="1. First point..."
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Press Enter for automatic numbering.
                  </p>
                </>
              ) : viewLines.length ? (
                <div className="bg-gray-50 rounded-lg p-4">
                  {/* ✅ Full box scroll (vertical + horizontal) */}
                  <div className="max-h-80 overflow-auto">
                    <ol className="space-y-2 min-w-max">
                      {viewLines.map((line, index) => (
                        <li
                          key={index}
                          className="flex gap-3 text-gray-700 items-start"
                        >
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-semibold">
                            {index + 1}
                          </span>

                          {/* ✅ keep columns aligned + enable horizontal scroll */}
                          <pre className="m-0 font-mono text-sm whitespace-pre min-w-max">
                            {line}
                          </pre>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">
                  No description provided
                </p>
              )}
            </div>

            {meeting.createdAt && (
              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-400">
                  Note Created: {formatCreatedAtForDisplay(meeting.createdAt)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Meeting Note"
        message="Are you sure you want to delete this meeting note? This action cannot be undone."
      />
    </>
  );
};

export default ViewMeetingModal;
