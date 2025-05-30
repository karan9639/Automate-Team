"use client";

import { useState, useEffect } from "react";
import {
  UserPlus,
  Upload,
  Trash2,
  Search,
  Filter,
  RefreshCw,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import ConfirmModal from "../../components/common/ConfirmModal";
import EmptyState from "../../components/common/EmptyState";
import DataTable from "../../components/common/DataTable";
import AddMemberModal from "../../components/modals/AddMemberModal";
import UploadUsersModal from "../../components/modals/UploadUsersModal";
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
  const teamMembers = useSelector(selectAllTeamMembers) || []; // Ensure it's always an array

  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filters, setFilters] = useState({
    accountType: "",
    reportingManager: "",
  });

  // Fetch team members on component mount
  useEffect(() => {
    fetchTeamMembers();
  }, []);

  // Fetch team members from API
  const fetchTeamMembers = async () => {
    setIsLoading(true);
    try {
      const response = await userApi.fetchAllTeamMembers();
      console.log("API Response:", response.data);

      // Extract the actual data array from the nested response structure
      const members = response.data?.data || [];
      console.log("Extracted members:", members);

      dispatch(setTeamMembers(members));
    } catch (error) {
      console.error("Error fetching team members:", error);
      toast.error(
        error.response?.data?.message || "Failed to fetch team members"
      );
      // Set empty array on error to prevent filter issues
      dispatch(setTeamMembers([]));
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh team members
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const response = await userApi.fetchAllTeamMembers();

      // Extract the actual data array from the nested response structure
      const members = response.data?.data || [];

      dispatch(setTeamMembers(members));
      toast.success("Team members refreshed");
    } catch (error) {
      console.error("Error refreshing team members:", error);
      toast.error("Failed to refresh team members");
      // Set empty array on error to prevent filter issues
      dispatch(setTeamMembers([]));
    } finally {
      setIsRefreshing(false);
    }
  };

  // Ensure teamMembers is always an array before filtering
  const safeTeamMembers = Array.isArray(teamMembers) ? teamMembers : [];

  // Filter members based on search query and filters
  const filteredMembers = safeTeamMembers.filter((member) => {
    const memberData = member.newMember || member; // Handle both structures

    // Search filter
    if (
      searchQuery &&
      !memberData.fullname?.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !memberData.email?.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !memberData.whatsappNumber?.toString().includes(searchQuery)
    ) {
      return false;
    }

    // Account type filter
    if (filters.accountType && memberData.accountType !== filters.accountType) {
      return false;
    }

    // Reporting manager filter (assuming reportsTo is at the top level or in newMember)
    if (
      filters.reportingManager &&
      member.reportsTo !== filters.reportingManager &&
      memberData.reportsTo !== filters.reportingManager
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

  // Handle delete member
  const handleDeleteMember = (member) => {
    setSelectedMember(member);
    setIsDeleteModalOpen(true);
  };

  // Handle confirm delete
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

  // Handle save member (add new member via API)
  const handleSaveMember = async (memberData) => {
    try {
      const response = await userApi.addNewMember(memberData);

      // Extract the actual member data from the response
      const newMemberResponse = response.data?.data || response.data;

      // Add to Redux store
      dispatch(addTeamMember(newMemberResponse));

      toast.success("Team member added successfully");
      setIsAddMemberModalOpen(false);

      // Refresh the list to ensure sync
      fetchTeamMembers();
    } catch (error) {
      console.error("Error adding member:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to add team member";
      toast.error(errorMessage);
      throw error; // Re-throw to handle in modal
    }
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
    // Create CSV template
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
        const memberData = row.newMember || row; // Handle both structures
        return (
          <div className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-500 flex items-center justify-center text-white">
              {memberData.fullname
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase() || "?"}
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {memberData.fullname || "N/A"}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
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
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
            {memberData.accountType || "Member"}
          </span>
        );
      },
    },
    {
      key: "createdAt",
      header: "Joined",
      render: (row) => {
        // createdAt is at the top level of the row object
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
          <div className="flex space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteMember(row); // Pass the whole row for ID extraction
              }}
              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
              aria-label={`Delete ${memberData.fullname}`}
            >
              <Trash2 size={18} />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">My Team</h1>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            <RefreshCw
              size={18}
              className={isRefreshing ? "animate-spin" : ""}
            />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleAddMember}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            <UserPlus size={18} />
            <span>Add Member</span>
          </button>
          {/* <button
            onClick={handleUploadUsers}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            <Upload size={18} />
            <span>Upload Users</span>
          </button> */}
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
            value={filters.accountType}
            onChange={(e) => handleFilterChange("accountType", e.target.value)}
            className="border rounded-md px-3 py-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
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
          {safeTeamMembers.length} Total Members
        </div>
        <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-full dark:bg-gray-700 dark:text-gray-200">
          {
            safeTeamMembers.filter(
              (m) => (m.newMember || m).accountType === "Admin"
            ).length
          }{" "}
          Admins
        </div>
        <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-full dark:bg-gray-700 dark:text-gray-200">
          {
            safeTeamMembers.filter(
              (m) => (m.newMember || m).accountType === "Manager"
            ).length
          }{" "}
          Managers
        </div>
        <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-full dark:bg-gray-700 dark:text-gray-200">
          {
            safeTeamMembers.filter(
              (m) => (m.newMember || m).accountType === "Team Member"
            ).length
          }{" "}
          Members
        </div>
      </div>

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
          className="bg-white dark:bg-gray-800 rounded-lg border p-8 dark:border-gray-700"
        />
      ) : (
        <DataTable
          data={filteredMembers}
          columns={columns}
          className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700"
        />
      )}

      {/* Add Member Modal */}
      <AddMemberModal
        isOpen={isAddMemberModalOpen}
        onClose={() => {
          setIsAddMemberModalOpen(false);
          setSelectedMember(null);
        }}
        onSave={handleSaveMember}
        teamMembers={safeTeamMembers}
      />

      {/* Delete Confirmation Modal */}
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
