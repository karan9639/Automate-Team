"use client";

import { useEffect, useRef, useState } from "react";
import {
  X,
  Calendar,
  Briefcase,
  FileText,
  Video,
  Users,
  Plus,
  Trash2,
  ChevronDown,
  Search,
  Check,
  Loader2,
} from "lucide-react";

import { userApi } from "@/api/userApi";
import {
  formatTsvToAlignedColumns,
  prepareDescriptionForStorage,
} from "@/utils/descriptionUtils";

const departments = [
  "Sampling",
  "PPC",
  "Job Work",
  "Greige",
  "Form Lamination",
  "Flat Knit",
  "Dyeing",
  "Dyeing Lab",
  "Dispatch Dyeing",
  "Digital Printing",
  "Biling",
  "Adhessive",
  "Accounts",
  "IT",
  "HR",
];

const departmentOptions = [...departments, "Other"];

const normalizeNewlines = (text) =>
  (text || "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\u00A0/g, " ");

const cleanText = (v) =>
  String(v ?? "")
    .replace(/\s+/g, " ")
    .trim();

const CreateMeetingModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    department: "IT",
    type: "Online",
    description: "1. ",
    // members: [{id,name,email,department,memberType:"company"|"outside"}]
    members: [],
  });

  const [errors, setErrors] = useState({});

  const descriptionRef = useRef(null);

  // Date UX fix
  const dateInputRef = useRef(null);
  const [isDateOpen, setIsDateOpen] = useState(false);

  // Dropdown state
  const wrapRef = useRef(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [outsiderName, setOutsiderName] = useState("");

  // Team users
  const [allUsers, setAllUsers] = useState([]);
  const [isFetchingUsers, setIsFetchingUsers] = useState(false);
  const [usersError, setUsersError] = useState("");

  const handleDatePointerDown = (e) => {
    if (isDateOpen) {
      e.preventDefault();
      e.stopPropagation();
      dateInputRef.current?.blur();
    }
  };

  // Reset on open
  useEffect(() => {
    if (!isOpen) return;

    setFormData({
      title: "",
      date: "",
      department: "IT",
      type: "Online",
      description: "1. ",
      members: [],
    });
    setErrors({});
    setIsDateOpen(false);

    setIsDropdownOpen(false);
    setSearchQuery("");
    setOutsiderName("");

    setUsersError("");
  }, [isOpen]);

  // Close dropdown on outside click/Esc
  useEffect(() => {
    if (!isDropdownOpen) return;

    const onDocDown = (e) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target)) setIsDropdownOpen(false);
    };

    const onKey = (e) => {
      if (e.key === "Escape") setIsDropdownOpen(false);
    };

    document.addEventListener("mousedown", onDocDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [isDropdownOpen]);

  // Fetch team members
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsFetchingUsers(true);
        setUsersError("");

        const res = await userApi.fetchAllTeamMembers(); // /api/v1/user/fetch-all-team-members
        const rows = res?.data?.data ?? [];

        const users = rows
          .map((r) => r?.newMember ?? r)
          .filter(Boolean)
          .map((m) => ({
            id: String(m?._id ?? ""),
            name: cleanText(m?.fullname),
            email: m?.email ?? null,
            department: m?.department ?? "NA",
            avatar: m?.avatar ?? null,
          }))
          .filter((u) => u.id && u.name);

        setAllUsers(users);
      } catch (err) {
        console.error("fetchAllTeamMembers failed:", err);
        setAllUsers([]);
        setUsersError("Failed to load users.");
      } finally {
        setIsFetchingUsers(false);
      }
    };

    if (isOpen) fetchUsers();
  }, [isOpen]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  // ✅ Toggle company user selection
  const handleUserSelect = (userId) => {
    const user = allUsers.find((u) => String(u.id) === String(userId));
    if (!user) return;

    setFormData((prev) => {
      const exists = prev.members.some(
        (m) => m.memberType === "company" && String(m.id) === String(user.id),
      );

      if (exists) {
        return {
          ...prev,
          members: prev.members.filter(
            (m) =>
              !(m.memberType === "company" && String(m.id) === String(user.id)),
          ),
        };
      }

      const member = {
        id: user.id,
        name: user.name,
        email: user.email,
        department: user.department,
        memberType: "company",
      };

      return { ...prev, members: [...prev.members, member] };
    });
  };

  // ✅ Add outsider
  const addOutsider = () => {
    const name = cleanText(outsiderName);
    if (!name) return;

    setFormData((prev) => {
      const exists = prev.members.some(
        (m) =>
          m.memberType === "outside" &&
          cleanText(m.name).toLowerCase() === name.toLowerCase(),
      );
      if (exists) return prev;

      const member = {
        id: `outside-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        name,
        memberType: "outside",
      };

      return { ...prev, members: [...prev.members, member] };
    });

    setOutsiderName("");
  };

  const handleRemoveMember = (memberId) => {
    setFormData((prev) => ({
      ...prev,
      members: prev.members.filter((m) => String(m.id) !== String(memberId)),
    }));
  };

  const filteredUsers = allUsers.filter((u) => {
    const q = cleanText(searchQuery).toLowerCase();
    if (!q) return true;
    return (
      cleanText(u.name).toLowerCase().includes(q) ||
      cleanText(u.email).toLowerCase().includes(q) ||
      cleanText(u.department).toLowerCase().includes(q)
    );
  });

  // Description paste
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

    setFormData((prev) => ({ ...prev, description: newValue }));
    if (errors.description) setErrors((prev) => ({ ...prev, description: "" }));

    setTimeout(() => {
      const el = descriptionRef.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(newCursor, newCursor);
    }, 0);
  };

  // Enter numbering + Backspace renumber
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
        const currentNum = Number.parseInt(match[1], 10);
        const nextNum = currentNum + 1;

        const newText = textBefore + "\n" + nextNum + ". " + textAfter;
        setFormData((prev) => ({ ...prev, description: newText }));

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
          if (match && Number.parseInt(match[1], 10) !== index + 1)
            needsRenumber = true;
        });

        if (needsRenumber) {
          const renumbered = lines
            .map((line, index) => line.replace(/^(\d+)\.\s?/, `${index + 1}. `))
            .join("\n");
          setFormData((prev) => ({ ...prev, description: renumbered }));
        }
      }, 0);
    }
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
    if (!validate()) return;

    const cleanedDescription = prepareDescriptionForStorage(
      formData.description,
    );

    // ✅ Modal only sends UI data; parent converts to backend payload
    onSubmit({
      ...formData,
      description: cleanedDescription,
    });
  };

  const handleClose = () => {
    onClose();
  };

  if (!isOpen) return null;

  const safeDepartment = departmentOptions.includes(formData.department)
    ? formData.department
    : "Other";

  const selectedCount = formData.members.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-emerald-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-600 rounded-lg">
              <Video className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              Minutes of Meeting
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="overflow-y-auto max-h-[calc(90vh-140px)]"
        >
          <div className="p-6 space-y-5">
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

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4" />
                Meeting Date <span className="text-red-500">*</span>
              </label>

              <input
                ref={dateInputRef}
                type="date"
                value={formData.date}
                onChange={(e) => handleChange("date", e.target.value)}
                onPointerDown={handleDatePointerDown}
                onFocus={() => setIsDateOpen(true)}
                onBlur={() => setIsDateOpen(false)}
                className={`w-full px-4 py-2.5 border ${
                  errors.date ? "border-red-500" : "border-gray-300"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent`}
              />

              {errors.date && (
                <p className="mt-1 text-sm text-red-500">{errors.date}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Briefcase className="h-4 w-4" />
                  Department
                </label>
                <select
                  value={safeDepartment}
                  onChange={(e) => handleChange("department", e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                >
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                  <option value="Other">Other</option>
                </select>
              </div>

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

            {/* ✅ Members dropdown + outsider */}
            <div ref={wrapRef} className="relative">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Users className="h-4 w-4" />
                Meeting Members
              </label>

              <button
                type="button"
                onClick={() => setIsDropdownOpen((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-2.5 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <span
                  className={
                    selectedCount
                      ? "text-gray-900 font-medium"
                      : "text-gray-500"
                  }
                >
                  {selectedCount
                    ? `${selectedCount} selected`
                    : "Select User(s)"}
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-gray-500 transition-transform ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isDropdownOpen && (
                <div className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                  <div className="p-2 border-b border-gray-100">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search users..."
                        className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        autoFocus
                      />
                    </div>
                    {usersError && (
                      <p className="mt-1 text-xs text-red-500">{usersError}</p>
                    )}
                  </div>

                  <ul role="listbox" className="py-1 overflow-y-auto max-h-60">
                    {isFetchingUsers ? (
                      <li className="px-3 py-2 text-gray-500 text-sm text-center flex items-center justify-center">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />{" "}
                        Loading users...
                      </li>
                    ) : filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => {
                        const isSelected = formData.members.some(
                          (m) =>
                            m.memberType === "company" &&
                            String(m.id) === String(user.id),
                        );

                        return (
                          <li
                            key={user.id}
                            role="option"
                            aria-selected={isSelected}
                            className={`px-3 py-2 cursor-pointer flex items-center text-sm ${
                              isSelected ? "bg-emerald-50" : "hover:bg-gray-100"
                            }`}
                            onClick={() => handleUserSelect(user.id)}
                          >
                            <div
                              className={`w-5 h-5 rounded border mr-3 flex items-center justify-center flex-shrink-0 ${
                                isSelected
                                  ? "bg-emerald-500 border-emerald-500"
                                  : "border-gray-300 bg-white"
                              }`}
                            >
                              {isSelected && (
                                <Check className="h-3 w-3 text-white" />
                              )}
                            </div>

                            <img
                              src={user.avatar || "/placeholder.svg"}
                              alt={user.name}
                              className="w-7 h-7 rounded-full mr-2 flex-shrink-0 object-cover"
                              onError={(e) => {
                                e.currentTarget.src = `/placeholder.svg?height=28&width=28&query=${encodeURIComponent(
                                  user.name,
                                )}`;
                              }}
                            />

                            <div className="flex-1 min-w-0">
                              <span className="block truncate font-medium">
                                {user.name}
                                <span className="bg-purple-200 rounded-md px-2 text-purple-600 font-medium text-xs ml-2 inline-block">
                                  {user.department || "NA"}
                                </span>
                              </span>
                              {user.email && (
                                <span className="block truncate text-xs text-gray-500">
                                  {user.email}
                                </span>
                              )}
                            </div>
                          </li>
                        );
                      })
                    ) : (
                      <li className="px-3 py-2 text-gray-500 text-sm text-center">
                        {allUsers.length === 0
                          ? "No users available."
                          : "No users match your search."}
                      </li>
                    )}
                  </ul>

                  {/* Outsider add */}
                  <div className="p-2 border-t border-gray-100 bg-gray-50">
                    <p className="text-xs text-gray-500 mb-2">
                      Add outsider (custom name)
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={outsiderName}
                        onChange={(e) => setOutsiderName(e.target.value)}
                        placeholder="Type outsider name..."
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addOutsider();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={addOutsider}
                        disabled={!cleanText(outsiderName)}
                        className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-md transition-colors"
                        title="Add outsider"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Selected list */}
              {formData.members.length > 0 ? (
                <div className="mt-3 border border-gray-200 rounded-lg divide-y divide-gray-200 max-h-40 overflow-y-auto">
                  {formData.members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between px-3 py-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-medium">
                          {(member.name || "?").charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {member.name}
                            <span className="ml-2 text-xs text-gray-500">
                              (
                              {member.memberType === "company"
                                ? "Company"
                                : "Outside"}
                              )
                            </span>
                          </p>
                          {member.email && (
                            <p className="text-xs text-gray-500 truncate">
                              {member.email}
                            </p>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveMember(member.id)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                        title="Remove"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic mt-2">
                  No members added yet
                </p>
              )}
            </div>

            {/* Description */}
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
                onPaste={handleDescriptionPaste}
                rows="8"
                wrap="off"
                spellCheck={false}
                style={{ tabSize: 8, MozTabSize: 8 }}
                className={`w-full px-4 py-2.5 border ${
                  errors.description ? "border-red-500" : "border-gray-300"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none font-mono text-sm overflow-x-auto whitespace-pre`}
              />

              {errors.description && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.description}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Paste from Excel will stay aligned. Press Enter for numbering.
              </p>
            </div>
          </div>

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
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateMeetingModal;
