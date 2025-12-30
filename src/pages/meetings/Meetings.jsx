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
} from "lucide-react";
import CreateMeetingModal from "../../components/CreateMeetingModal";
import ViewMeetingModal from "../../components/ViewMeetingModal";

const Meetings = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [loading, setLoading] = useState(true);
  const [meetings, setMeetings] = useState([]);

  // Simulate initial loading state only
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const openMeetingDetails = (meeting) => {
    setSelectedMeeting(meeting);
    setIsViewModalOpen(true);
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedMeeting(null);
  };

  const openCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleCreateMeeting = (meetingData) => {
    const newMeeting = {
      id: Date.now(), // Unique ID based on timestamp
      ...meetingData,
      createdAt: new Date().toLocaleDateString("en-GB"),
    };
    setMeetings((prevMeetings) => [...prevMeetings, newMeeting]);
    closeCreateModal();
  };

  const handleUpdateMeeting = (updatedMeeting) => {
    setMeetings((prevMeetings) =>
      prevMeetings.map((meeting) =>
        meeting.id === updatedMeeting.id ? updatedMeeting : meeting
      )
    );
    setSelectedMeeting(updatedMeeting);
  };

  const handleDeleteMeeting = (meetingId) => {
    setMeetings((prevMeetings) =>
      prevMeetings.filter((meeting) => meeting.id !== meetingId)
    );
    closeViewModal();
  };

  // Filter meetings
  const filteredMeetings = meetings.filter((meeting) => {
    const matchesSearch = meeting.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesDepartment =
      filterDepartment === "all" || meeting.department === filterDepartment;
    return matchesSearch && matchesDepartment;
  });

  const departments = ["all", ...new Set(meetings.map((m) => m.department))];

  const getDescriptionPreview = (description) => {
    if (!description) return [];
    const lines = description.split("\n").filter((line) => line.trim());
    return lines.slice(0, 3);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Meetings</h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage and view all your meetings
              </p>
            </div>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-md transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="h-5 w-5" />
              Create Meeting
            </button>
          </div>

          {/* Search and Filter Bar - Only show when there are meetings */}
          {meetings.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search meetings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div className="relative sm:w-48">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none bg-white"
                >
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept === "all" ? "All Departments" : dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 text-emerald-600 animate-spin mb-4" />
            <p className="text-gray-600">Loading meetings...</p>
          </div>
        ) : meetings.length === 0 ? (
          /* Empty State - No meetings created yet */
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-lg border-2 border-dashed border-gray-300">
            <Video className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No meetings yet
            </h3>
            <p className="text-gray-600 mb-6 text-center max-w-md">
              Get started by creating your first meeting. Click the button below
              to add a new meeting.
            </p>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-md transition-all duration-200"
            >
              <Plus className="h-5 w-5" />
              Create Your First Meeting
            </button>
          </div>
        ) : filteredMeetings.length === 0 ? (
          /* No results from search/filter */
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-lg border-2 border-dashed border-gray-300">
            <Search className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No meetings found
            </h3>
            <p className="text-gray-600 mb-6 text-center max-w-md">
              Try adjusting your search or filter criteria to find what you're
              looking for.
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setFilterDepartment("all");
              }}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          /* Meetings Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredMeetings.map((meeting) => (
              <div
                key={meeting.id}
                className="group bg-white rounded-lg border border-gray-200 hover:border-emerald-500 hover:shadow-lg transition-all duration-200 overflow-hidden"
              >
                {/* Card Header with Type Badge */}
                <div className="p-5 border-b border-gray-100">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors line-clamp-2 mb-2">
                        {meeting.title}
                      </h3>
                    </div>
                    <span
                      className={`ml-2 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                        meeting.type === "Online"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {meeting.type}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>{meeting.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Briefcase className="h-4 w-4 text-gray-400" />
                      <span>{meeting.department}</span>
                    </div>
                    {meeting.members && meeting.members.length > 0 && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span>
                          {meeting.members.length} member
                          {meeting.members.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Description Preview - First 3 lines */}
                  {meeting.description && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">Description:</p>
                      <div className="space-y-1">
                        {getDescriptionPreview(meeting.description).map(
                          (line, index) => (
                            <p
                              key={index}
                              className="text-sm text-gray-600 truncate"
                            >
                              {line}
                            </p>
                          )
                        )}
                        {meeting.description.split("\n").filter((l) => l.trim())
                          .length > 3 && (
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
                </div>

                {/* Card Footer with Actions */}
                <div className="px-5 py-3 bg-gray-50 flex items-center justify-between">
                  <button
                    onClick={() => openMeetingDetails(meeting)}
                    className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    View Details
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (
                        window.confirm(
                          "Are you sure you want to delete this meeting?"
                        )
                      ) {
                        handleDeleteMeeting(meeting.id);
                      }
                    }}
                    className="inline-flex items-center gap-1 text-sm font-medium text-red-500 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results Count */}
        {!loading && filteredMeetings.length > 0 && (
          <div className="mt-6 text-center text-sm text-gray-600">
            Showing {filteredMeetings.length} of {meetings.length} meeting
            {meetings.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      {/* Create Meeting Modal */}
      <CreateMeetingModal
        isOpen={isCreateModalOpen}
        onClose={closeCreateModal}
        onSubmit={handleCreateMeeting}
      />

      {/* View Meeting Modal - Instead of Sidebar */}
      <ViewMeetingModal
        isOpen={isViewModalOpen}
        onClose={closeViewModal}
        meeting={selectedMeeting}
        onUpdate={handleUpdateMeeting}
        onDelete={handleDeleteMeeting}
      />
    </div>
  );
};

export default Meetings;
