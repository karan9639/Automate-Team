"use client";

import { useState } from "react";
import { UserPlus, Upload, Pencil, Trash2, Search, Filter } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import ConfirmModal from "../../components/common/ConfirmModal";
import EmptyState from "../../components/common/EmptyState";
import DataTable from "../../components/common/DataTable";
import AddMemberModal from "../../components/modals/AddMemberModal";
import {
  addTeamMember,
  updateTeamMember,
  deleteTeamMember,
  selectAllTeamMembers,
} from "../../store/slices/teamSlice";
import UploadUsersModal from "../../components/modals/UploadUsersModal";

/**
 * My Team page component
 * Displays and manages team members
 */
const MyTeam = () => {
  const dispatch = useDispatch();
  const teamMembers = useSelector(selectAllTeamMembers);

  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    role: "",
    reportingManager: "",
  });

  // Filter members based on search query and filters
  const filteredMembers = teamMembers.filter((member) => {
    // Search filter
    if (
      searchQuery &&
      !member.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !member.email.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !member.mobile.includes(searchQuery)
    ) {
      return false;
    }

    // Role filter
    if (filters.role && member.role !== filters.role) {
      return false;
    }

    // Reporting manager filter
    if (
      filters.reportingManager &&
      member.reportsTo !== filters.reportingManager
    ) {
      return false;
    }

    return true;
  });

  // Handle add member
  const handleAddMember = () => {
    setSelectedMember(null);
    setIsAddMemberModalOpen(true);
  };

  // Handle upload users
  const handleUploadUsers = () => {
    setIsUploadModalOpen(true);
  };

  // Handle edit member
  const handleEditMember = (member) => {
    setSelectedMember(member);
    setIsAddMemberModalOpen(true);
  };

  // Handle delete member
  const handleDeleteMember = (member) => {
    setSelectedMember(member);
    setIsDeleteModalOpen(true);
  };

  // Handle confirm delete
  const handleConfirmDelete = () => {
    if (selectedMember) {
      dispatch(deleteTeamMember(selectedMember.id));
      setIsDeleteModalOpen(false);
      setSelectedMember(null);
    }
  };

  // Handle save member
  const handleSaveMember = (memberData) => {
    if (selectedMember) {
      // Update existing member
      dispatch(updateTeamMember({ ...memberData, id: selectedMember.id }));
    } else {
      // Add new member
      dispatch(addTeamMember({ ...memberData, id: Date.now().toString() }));
    }
    setIsAddMemberModalOpen(false);
    setSelectedMember(null);
  };

  // Handle filter change
  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  // Handle download template
  const handleDownloadTemplate = () => {
    // In a real app, this would download a CSV template
    alert("Downloading CSV template for user upload");
  };

  const columns = [
    {
      key: "name",
      header: "User",
      render: (row) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-500 flex items-center justify-center text-white">
            {row.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()}
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {row.name}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {row.email}
            </div>
          </div>
        </div>
      ),
    },
    { key: "mobile", header: "Mobile" },
    {
      key: "reportsTo",
      header: "Reports To",
      render: (row) => row.reportsTo || "NA",
    },
    {
      key: "role",
      header: "Role",
      render: (row) => (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
          {row.role}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="flex space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEditMember(row);
            }}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            aria-label={`Edit ${row.name}`}
          >
            <Pencil size={18} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteMember(row);
            }}
            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
            aria-label={`Delete ${row.name}`}
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">My Team</h1>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleAddMember}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            <UserPlus size={18} />
            <span>Add Member</span>
          </button>
          <button
            onClick={handleUploadUsers}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            <Upload size={18} />
            <span>Upload Users</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search team members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={filters.role}
            onChange={(e) => handleFilterChange("role", e.target.value)}
            className="border rounded-md px-3 py-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          >
            <option value="">Role</option>
            <option value="Admin">Admin</option>
            <option value="Manager">Manager</option>
            <option value="Team Member">Team Member</option>
          </select>

          <select
            value={filters.reportingManager}
            onChange={(e) =>
              handleFilterChange("reportingManager", e.target.value)
            }
            className="border rounded-md px-3 py-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          >
            <option value="">Reporting Manager</option>
            <option value="Karan Singh">Karan Singh</option>
            <option value="Prashant">Prashant</option>
          </select>

          <button
            onClick={() =>
              setFilters({
                role: "",
                reportingManager: "",
              })
            }
            className="flex items-center gap-2 px-3 py-2 border rounded-md hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700 dark:text-white"
          >
            <Filter size={18} />
            <span className="sr-only md:not-sr-only">Clear Filters</span>
          </button>
        </div>
      </div>

      {/* Status Pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-full dark:bg-gray-700 dark:text-gray-200">
          {teamMembers.length} Members
        </div>
        <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-full dark:bg-gray-700 dark:text-gray-200">
          {teamMembers.filter((m) => m.role === "Admin").length} Admins
        </div>
        <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-full dark:bg-gray-700 dark:text-gray-200">
          {teamMembers.filter((m) => m.role === "Manager").length} Managers
        </div>
        <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-full dark:bg-gray-700 dark:text-gray-200">
          {teamMembers.filter((m) => m.role === "Member").length} Members
        </div>
      </div>

      {filteredMembers.length === 0 ? (
        <EmptyState
          title="No team members found"
          description={
            searchQuery || filters.role || filters.reportingManager
              ? "Try adjusting your filters or search query."
              : "Add team members to your organization."
          }
          icon={UserPlus}
          actionLabel="Add Member" 
          onAction={handleAddMember}
          className="bg-white dark:bg-gray-800 rounded-lg border p-8 dark:border-gray-700"
        />
      ) : (
        <DataTable
          data={filteredMembers}
          columns={columns}
          onRowClick={(row) => handleEditMember(row)}
          className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700"
        />
      )}

      {/* Add/Edit Member Modal */}
      <AddMemberModal
        isOpen={isAddMemberModalOpen}
        onClose={() => {
          setIsAddMemberModalOpen(false);
          setSelectedMember(null);
        }}
        member={selectedMember}
        onSave={handleSaveMember}
        teamMembers={teamMembers}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Team Member"
        description={`Are you sure you want to delete ${selectedMember?.name}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />

      {/* Upload Users Modal */}
      <UploadUsersModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onDownloadTemplate={handleDownloadTemplate}
      />
    </div>
  );
};

export default MyTeam;
