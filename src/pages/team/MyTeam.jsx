"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "@reduxjs/toolkit";
import { toast } from "react-hot-toast";
import {
  Plus,
  Trash2,
  UserPlus,
  Search,
  Filter,
  MoreHorizontal,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import EmptyState from "@/components/common/EmptyState";
import ConfirmModal from "@/components/common/ConfirmModal";
import AddMemberModal from "@/components/modals/AddMemberModal";
import { userApi } from "@/api/userApi";
import {
  selectAllTeamMembers,
  setTeamMembers,
  deleteTeamMember,
  addTeamMember,
} from "@/store/slices/teamSlice";

// Memoized selector for team members
const selectFilteredTeamMembers = createSelector(
  [
    selectAllTeamMembers,
    (_, searchTerm) => searchTerm,
    (_, __, filterType) => filterType,
  ],
  (teamMembers, searchTerm, filterType) => {
    let filtered = teamMembers || [];

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (member) =>
          member.fullname?.toLowerCase().includes(term) ||
          member.email?.toLowerCase().includes(term) ||
          member.whatsappNumber?.includes(term)
      );
    }

    // Filter by account type
    if (filterType && filterType !== "All") {
      filtered = filtered.filter((member) => member.accountType === filterType);
    }

    return filtered;
  }
);

const MyTeam = () => {
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const prevTeamMembersLengthRef = useRef(0);

  // Get team members from Redux store
  const teamMembers = useSelector((state) =>
    selectFilteredTeamMembers(state, searchTerm, filterType)
  );

  // Fetch team members on component mount
  const fetchTeamMembersData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await userApi.fetchAllTeamMembers();
      // console.log("API Response for fetchAllTeamMembers:", response.data); // For debugging

      if (response.data && response.data.success) {
        const members = response.data.data || [];
        // console.log("Extracted members:", members); // For debugging
        dispatch(setTeamMembers(members));
      } else {
        // console.error("Failed to fetch team members, API success false:", response.data?.message); // For debugging
        toast.error(
          response.data?.message ||
            "Failed to fetch team members: API indicated failure"
        );
        dispatch(setTeamMembers([])); // Clear members or set to empty on failure
      }
    } catch (error) {
      console.error("Error fetching team members:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to load team members. Please try again.";
      toast.error(errorMessage);
      dispatch(setTeamMembers([])); // Clear members or set to empty on error
    } finally {
      setIsLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchTeamMembersData();
  }, [fetchTeamMembersData]);

  // Monitor changes in team members array
  useEffect(() => {
    if (teamMembers) {
      const currentLength = teamMembers.length;
      const prevLength = prevTeamMembersLengthRef.current;

      if (prevLength > 0 && currentLength < prevLength) {
        console.log(
          "Team member was removed. Previous count:",
          prevLength,
          "Current count:",
          currentLength
        );
      } else if (currentLength > prevLength) {
        console.log(
          "Team member was added or list was initially loaded. Previous count:",
          prevLength,
          "Current count:",
          currentLength
        );
      }

      prevTeamMembersLengthRef.current = currentLength;
    }
  }, [teamMembers]);

  const handleAddMember = async (memberData) => {
    try {
      const response = await userApi.addNewMember(memberData);

      if (response.data.success) {
        const newMember = response.data.data;
        dispatch(addTeamMember(newMember));
        toast.success("Team member added successfully");

        // Refresh the team members list to ensure we have the latest data
        fetchTeamMembersData();
        return true;
      } else {
        toast.error(response.data.message || "Failed to add team member");
        return false;
      }
    } catch (error) {
      console.error("Error adding team member:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to add team member";
      toast.error(errorMessage);
      throw error;
    }
  };

  const handleDeleteClick = (memberId) => {
    setSelectedMemberId(memberId);
    setIsConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedMemberId) return;

    try {
      const response = await userApi.deleteMember(selectedMemberId);

      if (response.data.success) {
        dispatch(deleteTeamMember(selectedMemberId));
        toast.success("Team member deleted successfully");
        // Refresh the team members list
        fetchTeamMembersData();
      } else {
        toast.error(response.data.message || "Failed to delete team member");
      }
    } catch (error) {
      console.error(
        "Error deleting member:",
        error,
        "Member ID:",
        selectedMemberId
      );

      // Check if it's a 404 error with "not found" message, which could mean the member was already deleted
      if (
        error.response?.status === 404 &&
        error.response?.data?.message?.includes("not found")
      ) {
        toast.warning("Member was already removed or not found");
        dispatch(deleteTeamMember(selectedMemberId));
        // Refresh the team members list
        fetchTeamMembersData();
      } else {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Failed to delete team member";
        toast.error(errorMessage);
      }
    } finally {
      setIsConfirmDeleteOpen(false);
      setSelectedMemberId(null);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  const handleClearFilter = () => {
    setFilterType("All");
  };

  const getInitials = (name) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const getAvatarColor = (name) => {
    if (!name) return "bg-gray-400";
    const colors = [
      "bg-red-500",
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-teal-500",
    ];
    const index =
      name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
      colors.length;
    return colors[index];
  };

  const renderAccountTypeBadge = (accountType) => {
    switch (accountType) {
      case "Admin":
        return (
          <Badge className="bg-red-500 hover:bg-red-600">{accountType}</Badge>
        );
      case "Manager":
        return (
          <Badge className="bg-blue-500 hover:bg-blue-600">{accountType}</Badge>
        );
      case "Team Member":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            {accountType}
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-500 hover:bg-gray-600">
            {accountType || "Unknown"}
          </Badge>
        );
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">My Team</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage your team members and their access
          </p>
        </div>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="mt-4 md:mt-0 bg-green-600 hover:bg-green-700"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Add Team Member
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
          <Input
            placeholder="Search by name, email or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchTerm && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>
          )}
        </div>

        <div className="relative">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full md:w-48 h-10 pl-10 pr-4 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="All">All Types</option>
            <option value="Admin">Admin</option>
            <option value="Manager">Manager</option>
            <option value="Team Member">Team Member</option>
          </select>
          <Filter
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
          {filterType !== "All" && (
            <button
              onClick={handleClearFilter}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                    <div>
                      <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                      <div className="h-3 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-3 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : teamMembers && teamMembers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teamMembers.map((member) => (
            <Card key={member._id || member.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-4">
                    <Avatar
                      className={`h-12 w-12 ${getAvatarColor(member.fullname)}`}
                    >
                      <AvatarImage
                        src={member.profilePicture || "/placeholder.svg"}
                        alt={member.fullname}
                      />
                      <AvatarFallback>
                        {getInitials(member.fullname)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">
                        {member.fullname}
                      </CardTitle>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {member.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-5 w-5" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        className="text-red-600 dark:text-red-400 cursor-pointer"
                        onClick={() =>
                          handleDeleteClick(member._id || member.id)
                        }
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Account Type
                    </span>
                    {renderAccountTypeBadge(member.accountType)}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      WhatsApp
                    </span>
                    <span className="text-sm">+91 {member.whatsappNumber}</span>
                  </div>
                  {member.joinedAt && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Joined
                      </span>
                      <span className="text-sm">
                        {new Date(member.joinedAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Plus className="h-12 w-12 text-gray-400" />}
          title="No team members found"
          description={
            searchTerm || filterType !== "All"
              ? "Try adjusting your search or filter criteria"
              : "Add your first team member to get started"
          }
          actionLabel="Add Team Member"
          onAction={() => setIsAddModalOpen(true)}
        />
      )}

      {/* Add Member Modal */}
      <AddMemberModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddMember}
        teamMembers={teamMembers}
      />

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Team Member"
        description="Are you sure you want to delete this team member? This action cannot be undone."
        confirmLabel="Delete"
        confirmVariant="destructive"
      />
    </div>
  );
};

export default MyTeam;
