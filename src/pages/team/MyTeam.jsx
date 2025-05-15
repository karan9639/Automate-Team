"use client"

import { useState } from "react"
import { UserPlus, Upload, Pencil, Trash2, Search, Filter } from "lucide-react"
import ConfirmModal from "../../components/common/ConfirmModal"
import EmptyState from "../../components/common/EmptyState"
import DataTable from "../../components/common/DataTable"

/**
 * My Team page component
 * Displays and manages team members
 */
const MyTeam = () => {
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState({
    role: "",
    reportingManager: "",
    accessType: "",
  })

  // Mock data for team members
  const [members, setMembers] = useState([
    {
      id: "1",
      name: "Karan Singh",
      email: "karan.singh@example.com",
      mobile: "7055424269",
      role: "Admin",
      reportsTo: null,
      accessType: "Full",
    },
  ])

  // Filter members based on search query and filters
  const filteredMembers = members.filter((member) => {
    // Search filter
    if (
      searchQuery &&
      !member.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !member.email.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !member.mobile.includes(searchQuery)
    ) {
      return false
    }

    // Role filter
    if (filters.role && member.role !== filters.role) {
      return false
    }

    // Reporting manager filter
    if (filters.reportingManager && member.reportsTo !== filters.reportingManager) {
      return false
    }

    // Access type filter
    if (filters.accessType && member.accessType !== filters.accessType) {
      return false
    }

    return true
  })

  // Handle add member
  const handleAddMember = () => {
    setSelectedMember(null)
    setIsAddMemberModalOpen(true)
  }

  // Handle edit member
  const handleEditMember = (member) => {
    setSelectedMember(member)
    setIsAddMemberModalOpen(true)
  }

  // Handle delete member
  const handleDeleteMember = (member) => {
    setSelectedMember(member)
    setIsDeleteModalOpen(true)
  }

  // Handle confirm delete
  const handleConfirmDelete = () => {
    if (selectedMember) {
      setMembers(members.filter((m) => m.id !== selectedMember.id))
      setIsDeleteModalOpen(false)
    }
  }

  // Handle filter change
  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }))
  }

  const columns = [
    {
      key: "name",
      header: "User",
      render: (row) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-500 flex items-center justify-center text-white">
            {row.name.charAt(0)}
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{row.name}</div>
            <div className="text-sm text-gray-500">{row.email}</div>
          </div>
        </div>
      ),
    },
    { key: "mobile", header: "Mobile" },
    { key: "reportsTo", header: "Reports To", render: (row) => row.reportsTo || "NA" },
    {
      key: "role",
      header: "Role",
      render: (row) => (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
          {row.role}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="flex space-x-2">
          <button onClick={() => handleEditMember(row)} className="text-blue-600 hover:text-blue-800">
            <Pencil size={18} />
          </button>
          <button onClick={() => handleDeleteMember(row)} className="text-red-600 hover:text-red-800">
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
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
          <button className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
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
            className="w-full pl-10 pr-4 py-2 border rounded-md"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={filters.role}
            onChange={(e) => handleFilterChange("role", e.target.value)}
            className="border rounded-md px-3 py-2"
          >
            <option value="">Role</option>
            <option value="Admin">Admin</option>
            <option value="Manager">Manager</option>
            <option value="Member">Member</option>
          </select>

          <select
            value={filters.reportingManager}
            onChange={(e) => handleFilterChange("reportingManager", e.target.value)}
            className="border rounded-md px-3 py-2"
          >
            <option value="">Reporting Manager</option>
            <option value="Karan">Karan</option>
            <option value="Prashant">Prashant</option>
          </select>

          <select
            value={filters.accessType}
            onChange={(e) => handleFilterChange("accessType", e.target.value)}
            className="border rounded-md px-3 py-2"
          >
            <option value="">Access Type</option>
            <option value="Full">Full</option>
            <option value="Limited">Limited</option>
            <option value="Read-only">Read-only</option>
          </select>

          <button className="flex items-center gap-2 px-3 py-2 border rounded-md hover:bg-gray-50">
            <Filter size={18} />
            <span className="sr-only md:not-sr-only">Filters</span>
          </button>
        </div>
      </div>

      {/* Status Pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-full">{members.length} Members</div>
        <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-full">
          {members.length}/{members.length} Task App
        </div>
        <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-full">
          {members.length}/{members.length} Leave & Attendance App
        </div>
      </div>

      {filteredMembers.length === 0 ? (
        <EmptyState
          title="No team members found"
          description="Add team members to your organization or adjust your filters."
          icon={UserPlus}
          actionLabel="Add Member"
          onAction={handleAddMember}
          className="bg-white rounded-lg border p-8"
        />
      ) : (
        <DataTable
          data={filteredMembers}
          columns={columns}
          onRowClick={(row) => handleEditMember(row)}
          className="bg-white rounded-lg border"
        />
      )}

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
    </div>
  )
}

export default MyTeam
