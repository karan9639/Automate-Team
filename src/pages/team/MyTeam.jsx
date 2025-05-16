"use client"

import { useState } from "react"
import { UserPlus, Upload, Pencil, Trash2, Search, Filter, ArrowLeft, Eye, EyeOff } from "lucide-react"
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

  // New member form state
  const [newMember, setNewMember] = useState({
    firstName: "",
    lastName: "",
    email: "",
    country: "India",
    whatsappNumber: "",
    role: "",
    reportingManager: "",
    password: "",
    taskAccess: false,
    leaveAttendanceAccess: false,
  })

  // Password visibility state
  const [showPassword, setShowPassword] = useState(false)

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
    {
      id: "2",
      name: "Prashant Tyagi",
      email: "prashant@natharts.com",
      mobile: "9876543210",
      role: "Team Member",
      reportsTo: "Karan Singh",
      accessType: "Limited",
    },
    {
      id: "3",
      name: "Sunny Prajapat",
      email: "sunnyprajapat65351@gmail.com",
      mobile: "8765432109",
      role: "Manager",
      reportsTo: "Karan Singh",
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
    setNewMember({
      firstName: "",
      lastName: "",
      email: "",
      country: "India",
      whatsappNumber: "",
      role: "",
      reportingManager: "",
      password: "",
      taskAccess: false,
      leaveAttendanceAccess: false,
    })
    setIsAddMemberModalOpen(true)
  }

  // Handle edit member
  const handleEditMember = (member) => {
    const nameParts = member.name.split(" ")
    setSelectedMember(member)
    setNewMember({
      firstName: nameParts[0] || "",
      lastName: nameParts.slice(1).join(" ") || "",
      email: member.email || "",
      country: "India",
      whatsappNumber: member.mobile || "",
      role: member.role || "",
      reportingManager: member.reportsTo || "",
      password: "",
      taskAccess: member.accessType === "Full" || member.accessType === "Limited",
      leaveAttendanceAccess: member.accessType === "Full" || member.accessType === "Limited",
    })
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

  // Handle input change for new member form
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setNewMember((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  // Handle form submission
  const handleSubmitMember = (e) => {
    e.preventDefault()

    const accessType =
      newMember.taskAccess && newMember.leaveAttendanceAccess
        ? "Full"
        : newMember.taskAccess || newMember.leaveAttendanceAccess
          ? "Limited"
          : "Read-only"

    const memberData = {
      id: selectedMember ? selectedMember.id : Date.now().toString(),
      name: `${newMember.firstName} ${newMember.lastName}`.trim(),
      email: newMember.email,
      mobile: newMember.whatsappNumber,
      role: newMember.role,
      reportsTo: newMember.reportingManager || null,
      accessType: accessType,
    }

    if (selectedMember) {
      // Update existing member
      setMembers(members.map((m) => (m.id === selectedMember.id ? memberData : m)))
    } else {
      // Add new member
      setMembers([...members, memberData])
    }

    setIsAddMemberModalOpen(false)
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
            <option value="Team Member">Team Member</option>
          </select>

          <select
            value={filters.reportingManager}
            onChange={(e) => handleFilterChange("reportingManager", e.target.value)}
            className="border rounded-md px-3 py-2"
          >
            <option value="">Reporting Manager</option>
            <option value="Karan Singh">Karan Singh</option>
            <option value="Prashant Tyagi">Prashant Tyagi</option>
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
          {members.filter((m) => m.accessType === "Full" || m.accessType === "Limited").length}/{members.length} Task
          App
        </div>
        <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-full">
          {members.filter((m) => m.accessType === "Full" || m.accessType === "Limited").length}/{members.length} Leave &
          Attendance App
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

      {/* Add/Edit Member Modal */}
      {isAddMemberModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md mx-4 overflow-hidden shadow-xl">
            <div className="p-4 border-b flex items-center">
              <button onClick={() => setIsAddMemberModalOpen(false)} className="mr-3 text-gray-500 hover:text-gray-700">
                <ArrowLeft size={20} />
              </button>
              <h2 className="text-xl font-semibold">{selectedMember ? "Edit Team Member" : "Add New Team Member"}</h2>
            </div>

            <form onSubmit={handleSubmitMember} className="p-5">
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={newMember.firstName}
                    onChange={handleInputChange}
                    className="w-full p-1.5 border rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={newMember.lastName}
                    onChange={handleInputChange}
                    className="w-full p-1.5 border rounded-md"
                  />
                </div>
              </div>

              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={newMember.email}
                  onChange={handleInputChange}
                  className="w-full p-1.5 border rounded-md"
                  required
                />
              </div>

              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <div className="flex items-center p-1.5 border rounded-md bg-gray-50">
                  <div className="flex items-center">
                    <div className="w-6 h-4 mr-2 overflow-hidden">
                      <div className="flex flex-col h-full">
                        <div className="h-1/3 bg-orange-500"></div>
                        <div className="h-1/3 bg-white"></div>
                        <div className="h-1/3 bg-green-600"></div>
                      </div>
                    </div>
                    <span>India</span>
                  </div>
                </div>
              </div>

              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number</label>
                <div className="flex">
                  <div className="bg-gray-100 p-1.5 border border-r-0 rounded-l-md">+91</div>
                  <input
                    type="tel"
                    name="whatsappNumber"
                    value={newMember.whatsappNumber}
                    onChange={handleInputChange}
                    className="w-full p-1.5 border rounded-r-md"
                    required
                  />
                </div>
              </div>

              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  name="role"
                  value={newMember.role}
                  onChange={handleInputChange}
                  className="w-full p-1.5 border rounded-md"
                  required
                >
                  <option value="">Select Role</option>
                  <option value="Admin">Admin</option>
                  <option value="Manager">Manager</option>
                  <option value="Team Member">Team Member</option>
                </select>
              </div>

              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Reporting Manager</label>
                <select
                  name="reportingManager"
                  value={newMember.reportingManager}
                  onChange={handleInputChange}
                  className="w-full p-1.5 border rounded-md"
                >
                  <option value="">Select Manager</option>
                  {members.map((member) => (
                    <option key={member.id} value={member.name}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={newMember.password}
                    onChange={handleInputChange}
                    className="w-full p-1.5 border rounded-md pr-10"
                    required={!selectedMember}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="mb-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Task Access</label>
                  <div
                    className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${newMember.taskAccess ? "bg-green-500" : "bg-gray-300"}`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${newMember.taskAccess ? "translate-x-6" : ""}`}
                      onClick={() => setNewMember({ ...newMember, taskAccess: !newMember.taskAccess })}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Leave & Attendance Access</label>
                  <div
                    className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${newMember.leaveAttendanceAccess ? "bg-green-500" : "bg-gray-300"}`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${newMember.leaveAttendanceAccess ? "translate-x-6" : ""}`}
                      onClick={() =>
                        setNewMember({ ...newMember, leaveAttendanceAccess: !newMember.leaveAttendanceAccess })
                      }
                    ></div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
              >
                <UserPlus size={18} />
                {selectedMember ? "Update Team Member" : "Add Team Member"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyTeam
