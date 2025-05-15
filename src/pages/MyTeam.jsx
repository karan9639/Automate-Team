"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { UserPlus, Upload, Pencil, Trash2, Search } from "lucide-react"
import MainLayout from "../layouts/MainLayout"
import AddMemberModal from "../components/AddMemberModal"
import ConfirmModal from "../components/ConfirmModal"

// Dummy data for team members
const initialMembers = [
  {
    id: 1,
    name: "Karan Singh",
    email: "karan.singh@narharts.com",
    mobile: "7055424269",
    reportsTo: "NA",
    role: "Admin",
    avatar: "KS",
  },
]

const MyTeam = () => {
  const [members, setMembers] = useState(initialMembers)
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState({
    role: "",
    reportingManager: "",
    accessType: "",
  })

  // Filter members based on search term and filters
  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.mobile.includes(searchTerm)

    const matchesRole = filters.role ? member.role === filters.role : true
    const matchesManager = filters.reportingManager ? member.reportsTo === filters.reportingManager : true
    // Add more filters as needed

    return matchesSearch && matchesRole && matchesManager
  })

  const handleAddMember = (newMember) => {
    // Generate a new ID for the member
    const newId = members.length > 0 ? Math.max(...members.map((m) => m.id)) + 1 : 1
    setMembers([...members, { ...newMember, id: newId }])
    setIsAddMemberModalOpen(false)
  }

  const handleEditMember = (member) => {
    setSelectedMember(member)
    setIsAddMemberModalOpen(true)
  }

  const handleUpdateMember = (updatedMember) => {
    setMembers(members.map((m) => (m.id === updatedMember.id ? updatedMember : m)))
    setIsAddMemberModalOpen(false)
    setSelectedMember(null)
  }

  const handleDeleteClick = (member) => {
    setSelectedMember(member)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = () => {
    setMembers(members.filter((m) => m.id !== selectedMember.id))
    setIsDeleteModalOpen(false)
    setSelectedMember(null)
  }

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value })
  }

  return (
    <MainLayout>
      <div className="p-4 md:p-6">
        {/* Filters and Actions */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="flex gap-3">
            <motion.button
              className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-md"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setSelectedMember(null)
                setIsAddMemberModalOpen(true)
              }}
            >
              <UserPlus size={18} />
              <span>Add Member</span>
            </motion.button>

            <motion.button
              className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-md"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Upload size={18} />
              <span>Upload User</span>
            </motion.button>
          </div>

          <div className="flex flex-1 flex-col md:flex-row gap-3">
            <select
              className="px-4 py-2 border border-gray-300 rounded-md bg-transparent text-white"
              value={filters.role}
              onChange={(e) => handleFilterChange("role", e.target.value)}
            >
              <option value="">Role</option>
              <option value="Admin">Admin</option>
              <option value="Manager">Manager</option>
              <option value="Member">Member</option>
            </select>

            <select
              className="px-4 py-2 border border-gray-300 rounded-md bg-transparent text-white"
              value={filters.reportingManager}
              onChange={(e) => handleFilterChange("reportingManager", e.target.value)}
            >
              <option value="">Reporting Manager</option>
              <option value="Karan Singh">Karan Singh</option>
            </select>

            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search Team Member"
                className="w-full px-4 py-2 border border-gray-300 rounded-md bg-transparent text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute right-3 top-2.5 text-gray-400" size={18} />
            </div>

            <select
              className="px-4 py-2 border border-gray-300 rounded-md bg-transparent text-white"
              value={filters.accessType}
              onChange={(e) => handleFilterChange("accessType", e.target.value)}
            >
              <option value="">Access Type</option>
              <option value="Full">Full</option>
              <option value="Limited">Limited</option>
              <option value="View Only">View Only</option>
            </select>
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="bg-green-600 text-white px-4 py-1 rounded-full">{members.length} Members</div>
          <div className="bg-blue-600 text-white px-4 py-1 rounded-full">1/0 Task App</div>
          <div className="bg-blue-600 text-white px-4 py-1 rounded-full">1/0 Leave & Attendance App</div>
        </div>

        {/* Team Members Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left">
                <th className="py-3 px-4">Select</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Mobile</th>
                <th className="py-3 px-4">Reports To</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member) => (
                <tr key={member.id} className="border-t border-gray-700">
                  <td className="py-3 px-4">
                    <input type="checkbox" className="rounded" />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center text-white">
                        {member.avatar}
                      </div>
                      <div>
                        <div className="font-medium">{member.name}</div>
                        <div className="text-sm text-gray-400">{member.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">{member.mobile}</td>
                  <td className="py-3 px-4">{member.reportsTo}</td>
                  <td className="py-3 px-4">
                    <span className="bg-green-600 text-white px-3 py-1 rounded-md text-sm">{member.role}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-3">
                      <button className="text-blue-400 hover:text-blue-300" onClick={() => handleEditMember(member)}>
                        <Pencil size={18} />
                      </button>
                      <button className="text-red-400 hover:text-red-300" onClick={() => handleDeleteClick(member)}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredMembers.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-400">No team members found. Add members to your team.</p>
          </div>
        )}
      </div>

      {/* Add/Edit Member Modal */}
      <AddMemberModal
        isOpen={isAddMemberModalOpen}
        onClose={() => {
          setIsAddMemberModalOpen(false)
          setSelectedMember(null)
        }}
        onSubmit={selectedMember ? handleUpdateMember : handleAddMember}
        member={selectedMember}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Team Member"
        message={`Are you sure you want to delete ${selectedMember?.name}? This action cannot be undone.`}
        confirmText="Delete"
        confirmButtonClass="bg-red-500 hover:bg-red-600"
      />
    </MainLayout>
  )
}

export default MyTeam
