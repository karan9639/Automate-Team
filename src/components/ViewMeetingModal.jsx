"use client"

import { useState, useEffect, useRef } from "react"
import { X, Calendar, Briefcase, FileText, Video, Users, Edit2, Save, XCircle, Trash2, Plus } from "lucide-react"
import DeleteConfirmationModal from "./DeleteConfirmationModal"

const ViewMeetingModal = ({ isOpen, onClose, meeting, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [editForm, setEditForm] = useState({
    title: "",
    date: "",
    department: "",
    type: "",
    description: "",
    members: [],
  })
  const [newMember, setNewMember] = useState({ name: "", role: "" })
  const descriptionRef = useRef(null)

  // Initialize edit form when meeting changes
  useEffect(() => {
    if (meeting) {
      setEditForm({
        title: meeting.title || "",
        date: formatDateForInput(meeting.date) || "",
        department: meeting.department || "IT",
        type: meeting.type || "Online",
        description: meeting.description || "",
        members: meeting.members || [],
      })
      setIsEditing(false)
    }
  }, [meeting])

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return ""

    try {
      const date = new Date(dateString)

      // Check if date is valid
      if (isNaN(date.getTime())) return dateString

      // Format: 09 Jan 2026, 05:30 am (IST)
      const options = {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Kolkata", // Indian Standard Time
      }

      return date.toLocaleString("en-IN", options)
    } catch (error) {
      return dateString
    }
  }

  const formatDateForInput = (dateString) => {
    if (!dateString) return ""

    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return ""

      // Format for input: YYYY-MM-DD
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, "0")
      const day = String(date.getDate()).padStart(2, "0")

      return `${year}-${month}-${day}`
    } catch (error) {
      return ""
    }
  }

  const formatCreatedAtForDisplay = (dateString) => {
    if (!dateString) return ""

    try {
      const date = new Date(dateString)

      // Check if date is valid
      if (isNaN(date.getTime())) return dateString

      // Format: 12 Jan 2026, 03:39 pm (IST)
      const options = {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Kolkata", // Indian Standard Time
      }

      return date.toLocaleString("en-IN", options)
    } catch (error) {
      return dateString
    }
  }

  const handleChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }))
  }

  // Description auto-numbering
  const handleDescriptionKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      const textarea = e.target
      const cursorPos = textarea.selectionStart
      const textBefore = editForm.description.substring(0, cursorPos)
      const textAfter = editForm.description.substring(cursorPos)

      const lines = textBefore.split("\n")
      const currentLine = lines[lines.length - 1]

      const match = currentLine.match(/^(\d+)\.\s?/)
      if (match) {
        const currentNum = Number.parseInt(match[1])
        const nextNum = currentNum + 1
        const newText = textBefore + "\n" + nextNum + ". " + textAfter

        setEditForm((prev) => ({ ...prev, description: newText }))

        setTimeout(() => {
          const newPos = cursorPos + nextNum.toString().length + 3
          textarea.setSelectionRange(newPos, newPos)
        }, 0)
      }
    }

    // Handle backspace to renumber
    if (e.key === "Backspace") {
      setTimeout(() => {
        const value = descriptionRef.current?.value || ""
        const lines = value.split("\n")
        let needsRenumber = false

        lines.forEach((line, index) => {
          const match = line.match(/^(\d+)\.\s?/)
          if (match && Number.parseInt(match[1]) !== index + 1) {
            needsRenumber = true
          }
        })

        if (needsRenumber) {
          const renumbered = lines
            .map((line, index) => {
              return line.replace(/^(\d+)\.\s?/, `${index + 1}. `)
            })
            .join("\n")
          setEditForm((prev) => ({ ...prev, description: renumbered }))
        }
      }, 0)
    }
  }

  // Add member
  const handleAddMember = () => {
    if (newMember.name.trim() && newMember.role.trim()) {
      const member = {
        id: Date.now(),
        name: newMember.name.trim(),
        role: newMember.role.trim(),
      }
      setEditForm((prev) => ({
        ...prev,
        members: [...prev.members, member],
      }))
      setNewMember({ name: "", role: "" })
    }
  }

  // Remove member
  const handleRemoveMember = (memberId) => {
    setEditForm((prev) => ({
      ...prev,
      members: prev.members.filter((m) => m.id !== memberId),
    }))
  }

  const handleSave = () => {
    const updatedMeeting = {
      ...meeting,
      ...editForm,
      date: formatDateForDisplay(editForm.date),
    }
    onUpdate(updatedMeeting)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditForm({
      title: meeting.title || "",
      date: formatDateForInput(meeting.date) || "",
      department: meeting.department || "IT",
      type: meeting.type || "Online",
      description: meeting.description || "",
      members: meeting.members || [],
    })
    setIsEditing(false)
    setNewMember({ name: "", role: "" })
  }

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = () => {
    onDelete(meeting.id)
    setIsDeleteModalOpen(false)
  }

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false)
  }

  // Parse description for display
  const parseDescription = (desc) => {
    if (!desc) return []
    return desc.split("\n").filter((line) => line.trim())
  }

  if (!isOpen || !meeting) return null

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-emerald-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-600 rounded-lg">
                <Video className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Meeting Details</h2>
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
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6 space-y-5">
            {/* Meeting Title */}
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
                <p className="text-lg font-semibold text-gray-900">{meeting.title}</p>
              )}
            </div>

            {/* Date and Type Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Meeting Date */}
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
                  <p className="text-gray-900">{formatCreatedAtForDisplay(meeting.createdAt)}</p>
                )}
              </div>

              {/* Meeting Type */}
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
                      meeting.type === "Online" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {meeting.type}
                  </span>
                )}
              </div>
            </div>

            {/* Department */}
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

            {/* Members */}
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
                    onChange={(e) => setNewMember((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Member name"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                  <input
                    type="text"
                    value={newMember.role}
                    onChange={(e) => setNewMember((prev) => ({ ...prev, role: e.target.value }))}
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
                  {(isEditing ? editForm.members : meeting.members).map((member) => (
                    <div key={member.id} className="flex items-center justify-between px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-medium">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{member.name}</p>
                          <p className="text-xs text-gray-500">{member.role}</p>
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
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">No members assigned</p>
              )}
            </div>

            {/* Description */}
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
                    onChange={(e) => handleChange("description", e.target.value)}
                    onKeyDown={handleDescriptionKeyDown}
                    rows="6"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none font-mono text-sm"
                    placeholder="1. First point..."
                  />
                  <p className="mt-1 text-xs text-gray-500">Press Enter for automatic numbering.</p>
                </>
              ) : meeting.description ? (
                <div className="bg-gray-50 rounded-lg p-4">
                  <ol className="space-y-2">
                    {parseDescription(meeting.description).map((line, index) => (
                      <li key={index} className="flex gap-3 text-gray-700">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-semibold">
                          {index + 1}
                        </span>
                        <span className="flex-1">{line.replace(/^\d+\.\s*/, "")}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">No description provided</p>
              )}
            </div>

            {/* Created Date */}
            {meeting.createdAt && (
              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-400">Note Created: {formatCreatedAtForDisplay(meeting.createdAt)}</p>
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
  )
}

export default ViewMeetingModal
