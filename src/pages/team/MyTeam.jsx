"use client";

import { useState, useEffect } from "react";
import { UserPlus, Search, Filter, RefreshCw } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import ConfirmModal from "../../components/common/ConfirmModal"; // Assuming this path is correct
import EmptyState from "../../components/common/EmptyState"; // Assuming this path is correct
import DataTable from "../../components/DataTable"; // Using the DataTable from src/components
import ActionDropdown from "../../components/common/ActionDropdown"; // Assuming this path is correct
import AddMemberModal from "../../components/modals/AddMemberModal";
import UploadUsersModal from "../../components/modals/UploadUsersModal";
import ReassignAllTasksModal from "../../components/modals/ReassignAllTasksModal";
import DeleteAllTasksModal from "../../components/modals/DeleteAllTasksModal";
import { userApi } from "../../apiService/apiService";
import {
  setTeamMembers,
  addTeamMember,
  deleteTeamMember,
  selectAllTeamMembers,
} from "../../store/slices/teamSlice";

/**
 * My Team page component
 * Displays and manages team members
 */
const MyTeam = () => {
  const dispatch = useDispatch();
  const teamMembers = useSelector(selectAllTeamMembers) || [];

  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isReassignTasksModalOpen, setIsReassignTasksModalOpen] =
    useState(false);
  const [isDeleteTasksModalOpen, setIsDeleteTasksModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filters, setFilters] = useState({
    accountType: "",
    reportingManager: "",
  });

  useEffect(() => {
    const fetchTeamMembers = async () => {
      setIsLoading(true);
      try {
        const response = await userApi.fetchAllTeamMembers();
        const members = response.data?.data || [];
        dispatch(setTeamMembers(members));
      } catch (error) {
        console.error("Error fetching team members:", error);
        toast.error(
          error.response?.data?.message || "Failed to fetch team members"
        );
        dispatch(setTeamMembers([]));
      } finally {
        setIsLoading(false);
      }
    };
    fetchTeamMembers();
  }, [dispatch]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const response = await userApi.fetchAllTeamMembers();
      const members = response.data?.data || [];
      dispatch(setTeamMembers(members));
      toast.success("Team members refreshed");
    } catch (error) {
      console.error("Error refreshing team members:", error);
      toast.error("Failed to refresh team members");
      dispatch(setTeamMembers([]));
    } finally {
      setIsRefreshing(false);
    }
  };

  const safeTeamMembers = Array.isArray(teamMembers) ? teamMembers : [];

  const filteredMembers = safeTeamMembers.filter((member) => {
    const memberData = member.newMember || member;
    if (
      searchQuery &&
      !memberData.fullname?.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !memberData.email?.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !memberData.whatsappNumber?.toString().includes(searchQuery)
    ) {
      return false;
    }
    if (filters.accountType && memberData.accountType !== filters.accountType) {
      return false;
    }
    if (
      filters.reportingManager &&
      member.reportsTo !== filters.reportingManager &&
      memberData.reportsTo !== filters.reportingManager
    ) {
      return false;
    }
    return true;
  });

  const handleAddMember = () => {
    setSelectedMember(null);
    setIsAddMemberModalOpen(true);
  };

  const handleDeleteMember = (member) => {
    setSelectedMember(member);
    setIsDeleteModalOpen(true);
  };

  const handleReassignAllTasks = (member) => {
    setSelectedMember(member);
    setIsReassignTasksModalOpen(true);
  };

  const handleDeleteAllTasks = (member) => {
    setSelectedMember(member);
    setIsDeleteTasksModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedMember) {
      const memberId =
        selectedMember.newMember?._id ||
        selectedMember._id ||
        selectedMember.id;
      try {
        await userApi.deleteMember(memberId);
        dispatch(deleteTeamMember(memberId));
        toast.success("Team member deleted successfully");
        setIsDeleteModalOpen(false);
        setSelectedMember(null);
      } catch (error) {
        console.error("Error deleting member:", error);
        toast.error(
          error.response?.data?.message || "Failed to delete team member"
        );
      }
    }
  };

  const handleConfirmReassignTasks = async (member, targetUserId) => {
    const memberId = member.newMember?._id || member._id || member.id;
    try {
      console.log("Reassigning tasks from", memberId, "to", targetUserId);
      toast.success("Tasks reassignment initiated successfully");
    } catch (error) {
      console.error("Error reassigning tasks:", error);
      toast.error("Failed to reassign tasks");
      throw error;
    }
  };

  const handleConfirmDeleteTasks = async (member) => {
    const memberId = member.newMember?._id || member._id || member.id;
    try {
      console.log("Deleting all tasks for", memberId);
      toast.success("Tasks deletion initiated successfully");
    } catch (error) {
      console.error("Error deleting tasks:", error);
      toast.error("Failed to delete tasks");
      throw error;
    }
  };

  const handleSaveMember = async (memberData) => {
    try {
      const response = await userApi.addNewMember(memberData);
      const newMemberResponse = response.data?.data || response.data;
      dispatch(addTeamMember(newMemberResponse));
      toast.success("Team member added successfully");
      setIsAddMemberModalOpen(false);
    } catch (error) {
      console.error("Error adding member:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to add team member";
      toast.error(errorMessage);
      throw error;
    }
  };

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const handleDownloadTemplate = () => {
    const csvContent =
      "fullname,email,whatsappNumber,accountType,password\n" +
      "John Doe,john@example.com,9876543210,Member,password123\n" +
      "Jane Smith,jane@example.com,9876543211,Manager,password456";
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "team_members_template.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    toast.success("Template downloaded successfully");
  };

  const columns = [
    {
      key: "fullname",
      header: "User",
      render: (row) => {
        const memberData = row.newMember || row;
        return (
          <div className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-medium">
              {memberData.fullname
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase() || "?"}
            </div>
            <div className="ml-3">
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {memberData.fullname || "N/A"}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {memberData.email}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: "whatsappNumber",
      header: "WhatsApp",
      render: (row) => {
        const memberData = row.newMember || row;
        return memberData.whatsappNumber || "N/A";
      },
    },
    {
      key: "accountType",
      header: "Account Type",
      render: (row) => {
        const memberData = row.newMember || row;
        return (
          <span className="px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
            {memberData.accountType || "Member"}
          </span>
        );
      },
    },
    {
      key: "createdAt",
      header: "Joined",
      render: (row) => {
        if (!row.createdAt) return "N/A";
        return new Date(row.createdAt).toLocaleDateString();
      },
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => {
        const memberData = row.newMember || row;
        return (
          <ActionDropdown
            onReassignTasks={() => handleReassignAllTasks(row)}
            onDeleteTasks={() => handleDeleteAllTasks(row)}
            onDeleteMember={() => handleDeleteMember(row)}
            memberName={memberData.fullname}
          />
        );
      },
    },
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          My Team
        </h1>
        <div className="flex flex-col sm:flex-row flex-wrap gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 text-sm"
          >
            <RefreshCw
              size={16}
              className={isRefreshing ? "animate-spin" : ""}
            />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleAddMember}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm"
          >
            <UserPlus size={16} />
            <span>Add Member</span>
          </button>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        <div className="relative flex-1 min-w-0">
          {" "}
          {/* Ensures input can shrink and grow */}
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search team members by name, email, or WhatsApp..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
          />
        </div>
        <div className="flex flex-col sm:flex-row flex-wrap gap-2">
          <select
            value={filters.accountType}
            onChange={(e) => handleFilterChange("accountType", e.target.value)}
            className="w-full sm:w-auto border border-gray-300 rounded-md px-3 py-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
          >
            <option value="">All Types</option>
            <option value="Admin">Admin</option>
            <option value="Manager">Manager</option>
            <option value="Team Member">Member</option>
          </select>
          <button
            onClick={() =>
              setFilters({
                accountType: "",
                reportingManager: "",
              })
            }
            className="w-full sm:w-auto flex items-center justify-center sm:justify-start gap-2 px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700 text-sm"
          >
            <Filter size={16} />
            <span>Clear Filters</span>
          </button>
        </div>
      </div>

      {/* Status Pills Section */}
      <div className="flex flex-wrap gap-2">
        <div className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-xs font-medium dark:bg-gray-700 dark:text-gray-200">
          {safeTeamMembers.length} Total Members
        </div>
        <div className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-xs font-medium dark:bg-blue-700 dark:text-blue-200">
          {
            safeTeamMembers.filter(
              (m) => (m.newMember || m).accountType === "Admin"
            ).length
          }{" "}
          Admins
        </div>
        <div className="bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full text-xs font-medium dark:bg-purple-700 dark:text-purple-200">
          {
            safeTeamMembers.filter(
              (m) => (m.newMember || m).accountType === "Manager"
            ).length
          }{" "}
          Managers
        </div>
        <div className="bg-yellow-100 text-yellow-700 px-3 py-1.5 rounded-full text-xs font-medium dark:bg-yellow-700 dark:text-yellow-200">
          {
            safeTeamMembers.filter(
              (m) => (m.newMember || m).accountType === "Team Member"
            ).length
          }{" "}
          Members
        </div>
      </div>

      {/* Data Table or Empty State Section */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      ) : filteredMembers.length === 0 ? (
        <EmptyState
          Icon={UserPlus}
          title="No team members found"
          description={
            searchQuery || filters.accountType
              ? "Try adjusting your filters or search query."
              : "Add team members to your organization."
          }
          actionLabel="Add Member"
          onAction={handleAddMember}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8"
        />
      ) : (
        <DataTable
          data={filteredMembers}
          columns={columns}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"
          // Pass pagination props if your DataTable supports them
          // pagination={{ page: currentPage, limit: itemsPerPage, total: filteredMembers.length }}
          // onPageChange={handlePageChange}
        />
      )}

      {/* Modals */}
      <AddMemberModal
        isOpen={isAddMemberModalOpen}
        onClose={() => {
          setIsAddMemberModalOpen(false);
          setSelectedMember(null);
        }}
        onSave={handleSaveMember}
        teamMembers={safeTeamMembers}
      />
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Team Member"
        description={`Are you sure you want to delete ${
          (selectedMember?.newMember || selectedMember)?.fullname
        }? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
      <ReassignAllTasksModal
        isOpen={isReassignTasksModalOpen}
        onClose={() => {
          setIsReassignTasksModalOpen(false);
          setSelectedMember(null);
        }}
        selectedMember={selectedMember}
        onConfirm={handleConfirmReassignTasks}
      />
      <DeleteAllTasksModal
        isOpen={isDeleteTasksModalOpen}
        onClose={() => {
          setIsDeleteTasksModalOpen(false);
          setSelectedMember(null);
        }}
        selectedMember={selectedMember}
        onConfirm={handleConfirmDeleteTasks}
      />
      <UploadUsersModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onDownloadTemplate={handleDownloadTemplate}
      />
    </div>
  );
};

export default MyTeam;
