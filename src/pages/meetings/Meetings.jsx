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

const isObjectId = (v) => typeof v === "string" && /^[a-f\d]{24}$/i.test(v);

/**
 * ✅ Dedupe UI members:
 * - Company: by companyMemberId OR email OR name
 * - Outside: by name
 */
const dedupeUiMembers = (members = []) => {
  const seenCompany = new Set();
  const seenOutside = new Set();

  return (members || []).filter((m) => {
    const type = m?.memberType;

    if (type === "company") {
      const key =
        (m?.companyMemberId && isObjectId(String(m.companyMemberId))
          ? String(m.companyMemberId)
          : cleanText(m?.email).toLowerCase()) ||
        cleanText(m?.name).toLowerCase();

      if (!key) return false;
      if (seenCompany.has(key)) return false;
      seenCompany.add(key);
      return true;
    }

    // outside
    const nameKey = cleanText(m?.name).toLowerCase();
    if (!nameKey) return false;
    if (seenOutside.has(nameKey)) return false;
    seenOutside.add(nameKey);
    return true;
  });
};

/**
 * ✅ API -> UI members
 * fetchMeetingNotes returns:
 * meetingMembers: [{ fullname, email, accountType, whatsappNumber }]
 *
 * Normalize into UI:
 * { id, name, email, accountType, whatsappNumber, memberType, companyMemberId }
 */
const normalizeMembers = (meetingMembers, meetingId = "") => {
  if (!Array.isArray(meetingMembers)) return [];

  const members = meetingMembers
    .map((m, idx) => {
      const fullname = cleanText(m?.fullname);
      const email = m?.email ? cleanText(m.email) : null;
      const accountType =
        cleanText(m?.accountType) || (email ? "Team Member" : "Outside");

      const name = fullname || "";
      if (!name) return null;

      const memberType = accountType === "Team Member" ? "company" : "outside";

      // NOTE: list API does NOT include companyMemberId. We'll hydrate it in ViewMeetingModal.
      return {
        id: `${meetingId}-member-${idx}`, // UI-only id
        name,
        email,
        accountType,
        whatsappNumber: m?.whatsappNumber ?? null,
        memberType,
        companyMemberId: null, // hydrated in modal from fetchAllTeamMembers
      };
    })
    .filter(Boolean);

  return dedupeUiMembers(members);
};

/**
 * ✅ UI -> Backend payload
 * meetingMembers: [{ companyMember, outsideMember }]
 *
 * IMPORTANT:
 * - Company MUST have ObjectId (companyMemberId)
 * - Outside uses name
 * - DEDUPE before sending
 */
const toBackendMeetingMembers = (members = []) => {
  if (!Array.isArray(members)) return [];

  const seenCompany = new Set();
  const seenOutside = new Set();

  return members
    .map((m) => {
      const name = cleanText(m?.name);

      // Prefer companyMemberId if present
      const cmId =
        m?.companyMemberId && isObjectId(String(m.companyMemberId))
          ? String(m.companyMemberId)
          : isObjectId(String(m?.id))
            ? String(m.id)
            : null;

      const isCompany =
        m?.memberType === "company" || m?.accountType === "Team Member";

      if (isCompany && cmId && isObjectId(cmId)) {
        if (seenCompany.has(cmId)) return null;
        seenCompany.add(cmId);
        return { companyMember: cmId, outsideMember: null };
      }

      if (name) {
        const key = name.toLowerCase();
        if (seenOutside.has(key)) return null;
        seenOutside.add(key);
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

  const [fromDate, setFromDate] = useState(""); // "YYYY-MM-DD"
  const [toDate, setToDate] = useState(""); // "YYYY-MM-DD"

  const startOfDayMs = (yyyyMmDd) => {
    if (!yyyyMmDd) return null;
    const [y, m, d] = yyyyMmDd.split("-").map(Number);
    // local midnight
    return new Date(y, m - 1, d, 0, 0, 0, 0).getTime();
  };

  const endOfDayMs = (yyyyMmDd) => {
    if (!yyyyMmDd) return null;
    const [y, m, d] = yyyyMmDd.split("-").map(Number);
    // local 23:59:59.999
    return new Date(y, m - 1, d, 23, 59, 59, 999).getTime();
  };

  const meetingDateMs = (meetingDateString) => {
    if (!meetingDateString) return null;
    const ms = new Date(meetingDateString).getTime();
    return Number.isFinite(ms) ? ms : null;
  };

  // ✅ Trigger re-fetch after create/update/delete
  const [refreshKey, setRefreshKey] = useState(0);

  // ✅ useEffect you requested: whenever refreshKey changes, fetch meetingNotes again
  useEffect(() => {
    loadMeetings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  useEffect(() => {
    if (fromDate && toDate && startOfDayMs(fromDate) > endOfDayMs(toDate)) {
      // auto-fix: if from is after to, clear to
      setToDate("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromDate]);
  

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
          members: normalizeMembers(meeting.meetingMembers, meeting._id),
          description: meeting.meetingDescription,
        }));

        setMeetings(meetingsData);

        // ✅ keep selectedMeeting fresh after refresh
        if (selectedMeeting?.id) {
          const fresh = meetingsData.find(
            (m) => String(m.id) === String(selectedMeeting.id),
          );
          if (fresh) setSelectedMeeting(fresh);
        }
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
        meetingDate: meetingData.date
          ? `${meetingData.date}T00:00:00.000Z`
          : null,
        department: meetingData.department,
        meetingMode: meetingData.type,
        meetingMembers: toBackendMeetingMembers(meetingData.members),
        meetingDescription: meetingData.description,
      };

      const result = await createMeetingNote(apiData);
      if (!result?.success)
        throw new Error(result?.message || "Failed to create meeting");

      setIsCreateModalOpen(false);
      setRefreshKey((k) => k + 1); // ✅ re-fetch list
    } catch (err) {
      console.error("[Meetings] Error creating meeting note:", err);
      alert("Failed to create meeting note. Please try again.");
    }
  };

  // ✅ Modal calls onUpdate(updatedMeeting)
  const handleUpdateMeeting = async (updatedMeeting) => {
    try {
      const apiData = {
        meetingTitle: updatedMeeting.title,
        meetingDate: updatedMeeting.date
          ? `${updatedMeeting.date}T00:00:00.000Z`
          : null,
        department: updatedMeeting.department,
        meetingMode: updatedMeeting.type,
        meetingMembers: toBackendMeetingMembers(updatedMeeting.members),
        meetingDescription: updatedMeeting.description,
      };

      const result = await updateMeetingNote(updatedMeeting.id, apiData);
      if (!result?.success)
        throw new Error(result?.message || "Failed to update meeting");

      // ✅ Do NOT patch list using update response (different shape).
      // ✅ Always re-fetch meetingNotes list so UI shows correct normalized data.
      setRefreshKey((k) => k + 1);
    } catch (err) {
      console.error("[Meetings] Error updating meeting note:", err);
      alert("Failed to update meeting note. Please try again.");
    }
  };

  const handleDeleteMeeting = async (meetingId) => {
    try {
      const result = await deleteMeetingNote(meetingId);
      if (!result?.success)
        throw new Error(result?.message || "Failed to delete meeting");

      closeViewModal();
      setRefreshKey((k) => k + 1); // ✅ re-fetch list
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

    const ms = meetingDateMs(meeting.date);
    const fromMs = startOfDayMs(fromDate);
    const toMs = endOfDayMs(toDate);

    const matchesFrom = fromMs == null || (ms != null && ms >= fromMs);
    const matchesTo = toMs == null || (ms != null && ms <= toMs);

    return matchesSearch && matchesDepartment && matchesFrom && matchesTo;
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

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-red-800 break-words">{error}</p>
              </div>
              <button
                onClick={() => setRefreshKey((k) => k + 1)}
                className="text-sm font-medium text-red-600 hover:text-red-700 underline"
              >
                Retry
              </button>
            </div>
          )}

          {!loading && meetings.length > 0 && (
            <div className="mt-4 bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-[1fr_220px_160px_160px] gap-3">
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
                {/* From Date */}
                <div className="relative">
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                    title="From date"
                  />
                </div>

                {/* To Date */}
                <div className="relative">
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                    title="To date"
                  />
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
              Get started by creating your first meeting.
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
              Try adjusting your search or filter criteria.
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setFilterDepartment("all");
                setFromDate("");
                setToDate("");
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-4 sm:gap-5">
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
                        <span>View</span>
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
