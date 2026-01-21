"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Calendar,
  Briefcase,
  Users,
  Search,
  Filter,
  Video,
  Loader2,
  Trash2,
  Eye,
  Download,
  AlertCircle,
} from "lucide-react";

import CreateMeetingModal from "../../components/CreateMeetingModal";
import ViewMeetingModal from "../../components/ViewMeetingModal";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
import { generateMeetingPDF } from "../../utils/generateMeetingPDF";
import {
  fetchMeetingNotes,
  createMeetingNote,
  updateMeetingNote,
  deleteMeetingNote,
} from "../../api/meetingNotesApi";

const cleanText = (v) =>
  String(v ?? "")
    .replace(/\s+/g, " ")
    .trim();

/**
 * Backend schema:
 * meetingMembers: [{ companyMember: ObjectId|User, outsideMember: String|null }]
 *
 * This normalizer supports:
 * - companyMember populated object OR only ObjectId string
 * - outsideMember string
 */
const normalizeMembersFromBackend = (meetingMembers = [], meetingId = "") => {
  if (!Array.isArray(meetingMembers)) return [];

  return meetingMembers
    .map((entry, idx) => {
      // company member
      if (entry?.companyMember) {
        const cm = entry.companyMember;
        const id = typeof cm === "object" ? cm._id : cm;

        const name =
          typeof cm === "object"
            ? cleanText(cm.fullname ?? cm.name ?? cm.email ?? "Company Member")
            : "Company Member";

        return {
          id: String(id),
          name,
          email: typeof cm === "object" ? (cm.email ?? null) : null,
          department: typeof cm === "object" ? (cm.department ?? null) : null,
          memberType: "company",
        };
      }

      // outside member
      if (entry?.outsideMember) {
        const name = cleanText(entry.outsideMember);
        if (!name) return null;

        return {
          id: `outside-${meetingId}-${idx}`,
          name,
          memberType: "outside",
        };
      }

      return null;
    })
    .filter(Boolean);
};

/** UI -> Backend meetingMembers */
const toBackendMeetingMembers = (members = []) => {
  if (!Array.isArray(members)) return [];

  return members
    .map((m) => {
      if (m?.memberType === "company") {
        return { companyMember: m.id, outsideMember: null };
      }
      if (m?.memberType === "outside") {
        const name = cleanText(m?.name);
        if (!name) return null;
        return { companyMember: null, outsideMember: name };
      }
      return null;
    })
    .filter(Boolean);
};

const Meetings = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [meetingToDelete, setMeetingToDelete] = useState(null);
  const [selectedMeeting, setSelectedMeeting] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");

  const [loading, setLoading] = useState(true);
  const [meetings, setMeetings] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadMeetings();
  }, []);

  const loadMeetings = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await fetchMeetingNotes();

      if (result?.success && Array.isArray(result?.data?.meetingNotes)) {
        const meetingsData = result.data.meetingNotes.map((meeting) => ({
          id: meeting._id,
          title: meeting.meetingTitle,
          date: meeting.meetingDate,
          createdAt: meeting.createdAt,
          department: meeting.department,
          type: meeting.meetingMode,
          members: normalizeMembersFromBackend(
            meeting.meetingMembers,
            meeting._id,
          ),
          description: meeting.meetingDescription,
        }));
        setMeetings(meetingsData);
      } else {
        setMeetings([]);
      }
    } catch (err) {
      console.error("[Meetings] Error loading meeting notes:", err);
      setError("Failed to load meeting notes. Please refresh the page.");
      setMeetings([]);
    } finally {
      setLoading(false);
    }
  };

  const openMeetingDetails = (meeting) => {
    setSelectedMeeting(meeting);
    setIsViewModalOpen(true);
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedMeeting(null);
  };

  const handleCreateMeeting = async (meetingData) => {
    try {
      const apiData = {
        meetingTitle: meetingData.title,
        // backend has Date, ISO is safest (input gives YYYY-MM-DD)
        meetingDate: new Date(meetingData.date).toISOString(),
        department: meetingData.department,
        meetingMode: meetingData.type, // Online/Offline
        meetingMembers: toBackendMeetingMembers(meetingData.members),
        meetingDescription: meetingData.description,
      };

      const result = await createMeetingNote(apiData);
      if (!result?.success)
        throw new Error(result?.message || "Failed to create meeting");

      await loadMeetings();
      setIsCreateModalOpen(false);
    } catch (err) {
      console.error("[Meetings] Error creating meeting note:", err);
      alert("Failed to create meeting note. Please try again.");
    }
  };

  const handleUpdateMeeting = async (updatedMeeting) => {
    try {
      const apiData = {
        meetingTitle: updatedMeeting.title,
        meetingDate: new Date(updatedMeeting.date).toISOString(),
        department: updatedMeeting.department,
        meetingMode: updatedMeeting.type,
        meetingMembers: toBackendMeetingMembers(updatedMeeting.members),
        meetingDescription: updatedMeeting.description,
      };

      const result = await updateMeetingNote(updatedMeeting.id, apiData);

      // support both: result.data or result.data.meetingNote
      const updated = result?.data?.meetingNote ?? result?.data;

      if (result?.success && updated) {
        const transformedMeeting = {
          id: updated._id,
          title: updated.meetingTitle,
          date: updated.meetingDate,
          createdAt: updated.createdAt,
          department: updated.department,
          type: updated.meetingMode,
          members: normalizeMembersFromBackend(
            updated.meetingMembers,
            updated._id,
          ),
          description: updated.meetingDescription,
        };

        setMeetings((prev) =>
          prev.map((m) =>
            m.id === updatedMeeting.id ? transformedMeeting : m,
          ),
        );
        setSelectedMeeting(transformedMeeting);
      }
    } catch (err) {
      console.error("[Meetings] Error updating meeting note:", err);
      alert("Failed to update meeting note. Please try again.");
    }
  };

  const handleDeleteMeeting = async (meetingId) => {
    try {
      const result = await deleteMeetingNote(meetingId);
      if (result?.success) {
        setMeetings((prev) => prev.filter((m) => m.id !== meetingId));
        closeViewModal();
      }
    } catch (err) {
      console.error("[Meetings] Error deleting meeting note:", err);
      alert("Failed to delete meeting note. Please try again.");
    }
  };

  const handleDeleteClick = (meeting, e) => {
    e.stopPropagation();
    setMeetingToDelete(meeting);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (meetingToDelete) {
      await handleDeleteMeeting(meetingToDelete.id);
      setIsDeleteModalOpen(false);
      setMeetingToDelete(null);
    }
  };

  const handleDownloadPDF = async (meeting, e) => {
    e.stopPropagation();
    try {
      await generateMeetingPDF(meeting);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    });
  };

  const formatCreatedAtForDisplay = (dateString) => {
    if (!dateString) return "";
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
  };

  const filteredMeetings = meetings.filter((meeting) => {
    const matchesSearch = meeting.title
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesDepartment =
      filterDepartment === "all" || meeting.department === filterDepartment;
    return matchesSearch && matchesDepartment;
  });

  const departments = [
    "all",
    ...new Set(meetings.map((m) => m.department).filter(Boolean)),
  ];

  const getDescriptionPreview = (description) => {
    if (!description) return [];
    const lines = description.split("\n").filter((line) => line.trim());
    return lines.slice(0, 3);
  };

  return (
    <div className="min-h-[100dvh] bg-gray-50">
      <div className="mx-auto w-full max-w-7xl px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Header */}
        <div className="mb-5 sm:mb-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">
                Minutes of Meetings
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage and view all your meetings
              </p>
            </div>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm transition active:scale-[0.99]"
            >
              <Plus className="h-5 w-5" />
              Create
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-red-800 break-words">{error}</p>
              </div>
              <button
                onClick={loadMeetings}
                className="text-sm font-medium text-red-600 hover:text-red-700 underline"
              >
                Retry
              </button>
            </div>
          )}

          {/* Search + Filter */}
          {!loading && meetings.length > 0 && (
            <div className="mt-4 bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-[1fr_220px] gap-3">
                <div className="relative min-w-0">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search meetings..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full min-w-0 pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <select
                    value={filterDepartment}
                    onChange={(e) => setFilterDepartment(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none bg-white"
                  >
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept === "all" ? "All Departments" : dept}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Body */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 sm:py-24">
            <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 text-emerald-600 animate-spin mb-4" />
            <p className="text-gray-600">Loading meetings...</p>
          </div>
        ) : meetings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 sm:py-24 bg-white rounded-xl border-2 border-dashed border-gray-300 px-4">
            <Video className="h-14 w-14 sm:h-16 sm:w-16 text-gray-400 mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 text-center">
              No meetings yet
            </h3>
            <p className="text-gray-600 mb-6 text-center max-w-md">
              Get started by creating your first meeting. Click the button below
              to add a new meeting.
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm transition"
            >
              <Plus className="h-5 w-5" />
              Create Your First Minutes of Meeting
            </button>
          </div>
        ) : filteredMeetings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 sm:py-24 bg-white rounded-xl border-2 border-dashed border-gray-300 px-4">
            <Search className="h-14 w-14 sm:h-16 sm:w-16 text-gray-400 mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 text-center">
              No meetings found
            </h3>
            <p className="text-gray-600 mb-6 text-center max-w-md">
              Try adjusting your search or filter criteria to find what
              you&apos;re looking for.
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setFilterDepartment("all");
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-5">
              {filteredMeetings.map((meeting) => (
                <div
                  key={meeting.id}
                  className="group bg-white rounded-xl border border-gray-200 hover:border-emerald-500 hover:shadow-lg transition-all overflow-hidden"
                >
                  <div className="p-4 sm:p-5 border-b border-gray-100">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="min-w-0">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors line-clamp-2">
                          {meeting.title}
                        </h3>
                      </div>

                      <span
                        className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-medium ${
                          meeting.type === "Online"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {meeting.type}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600 min-w-0">
                        <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
                        <span className="truncate">
                          {formatDateForDisplay(meeting.date)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-600 min-w-0">
                        <Briefcase className="h-4 w-4 text-gray-400 shrink-0" />
                        <span className="truncate">{meeting.department}</span>
                      </div>

                      {meeting.members?.length > 0 && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Users className="h-4 w-4 text-gray-400 shrink-0" />
                          <span>
                            {meeting.members.length} member
                            {meeting.members.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                      )}
                    </div>

                    {meeting.description && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-500 mb-1">
                          Description:
                        </p>

                        <div className="space-y-1">
                          {getDescriptionPreview(meeting.description).map(
                            (line, index) => (
                              <p
                                key={index}
                                className="text-sm text-gray-600 truncate"
                              >
                                {line}
                              </p>
                            ),
                          )}

                          {meeting.description
                            .split("\n")
                            .filter((l) => l.trim()).length > 3 && (
                            <p className="text-xs text-gray-400 italic">
                              +
                              {meeting.description
                                .split("\n")
                                .filter((l) => l.trim()).length - 3}{" "}
                              more...
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {meeting.createdAt && (
                      <p className="mt-3 text-xs text-gray-400 break-words">
                        Created: {formatCreatedAtForDisplay(meeting.createdAt)}
                      </p>
                    )}
                  </div>

                  <div className="p-3 sm:px-5 sm:py-3 bg-gray-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                      <button
                        onClick={() => openMeetingDetails(meeting)}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                        <span>View Details</span>
                      </button>

                      <button
                        onClick={(e) => handleDownloadPDF(meeting, e)}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                        title="Download PDF Report"
                      >
                        <Download className="h-4 w-4" />
                        <span>Download</span>
                      </button>
                    </div>

                    <button
                      onClick={(e) => handleDeleteClick(meeting, e)}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 text-sm font-medium text-red-500 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 sm:mt-6 text-center text-sm text-gray-600">
              Showing {filteredMeetings.length} of {meetings.length} meeting
              {meetings.length !== 1 ? "s" : ""}
            </div>
          </>
        )}
      </div>

      <CreateMeetingModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateMeeting}
      />

      <ViewMeetingModal
        isOpen={isViewModalOpen}
        onClose={closeViewModal}
        meeting={selectedMeeting}
        onUpdate={handleUpdateMeeting}
        onDelete={handleDeleteMeeting}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setMeetingToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Meeting Note"
        message={`Are you sure you want to delete "${meetingToDelete?.title}"? This action cannot be undone.`}
      />
    </div>
  );
};

export default Meetings;
