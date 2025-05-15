"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Calendar, Plus, FileText, Clock, Filter, Search } from "lucide-react"

// Leave balance card component
const LeaveBalanceCard = ({ title, used, total, icon: Icon, bgColor, textColor }) => {
  return (
    <div className={`${bgColor} rounded-lg shadow p-4`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <h3 className={`mt-1 text-2xl font-semibold ${textColor}`}>
            {used}/{total}
          </h3>
        </div>
        <div className={`p-2 rounded-lg ${bgColor}`}>
          <Icon className={`w-6 h-6 ${textColor}`} />
        </div>
      </div>
      <div className="mt-3 w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full ${textColor === "text-green-600" ? "bg-green-600" : textColor === "text-blue-600" ? "bg-blue-600" : "bg-yellow-600"}`}
          style={{ width: `${(used / total) * 100}%` }}
        ></div>
      </div>
    </div>
  )
}

// Mock data for leave applications
const leaveApplications = [
  {
    id: 1,
    type: "Sick Leave",
    startDate: "2023-06-10",
    endDate: "2023-06-12",
    duration: "3 days",
    reason: "Medical appointment and recovery",
    status: "Approved",
    appliedOn: "2023-06-05",
  },
  {
    id: 2,
    type: "Casual Leave",
    startDate: "2023-07-02",
    endDate: "2023-07-02",
    duration: "1 day",
    reason: "Personal work",
    status: "Pending",
    appliedOn: "2023-06-25",
  },
  {
    id: 3,
    type: "Vacation",
    startDate: "2023-08-15",
    endDate: "2023-08-20",
    duration: "6 days",
    reason: "Family vacation",
    status: "Pending",
    appliedOn: "2023-06-30",
  },
  {
    id: 4,
    type: "Work from Home",
    startDate: "2023-06-22",
    endDate: "2023-06-22",
    duration: "1 day",
    reason: "Internet installation at home",
    status: "Rejected",
    appliedOn: "2023-06-20",
  },
]

// Leave applications table component
const LeaveApplicationsTable = ({ data }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-800"
      case "Pending":
        return "bg-yellow-100 text-yellow-800"
      case "Rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="overflow-x-auto mt-6 bg-white rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Applied On
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((leave) => (
            <tr key={leave.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{leave.type}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {leave.startDate === leave.endDate ? leave.startDate : `${leave.startDate} to ${leave.endDate}`}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{leave.duration}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{leave.appliedOn}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                    leave.status,
                  )}`}
                >
                  {leave.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button className="text-blue-600 hover:text-blue-900 mr-2">View</button>
                {leave.status === "Pending" && <button className="text-red-600 hover:text-red-900">Cancel</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Main component
const MyLeaves = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("All")

  // Filter leave applications
  const filteredLeaves = leaveApplications.filter(
    (leave) =>
      (filterStatus === "All" || leave.status === filterStatus) &&
      (leave.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        leave.reason.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  // Mock leave balance data
  const leaveBalance = [
    { type: "Sick Leave", used: 2, total: 10, icon: FileText, bgColor: "bg-green-50", textColor: "text-green-600" },
    { type: "Casual Leave", used: 3, total: 12, icon: Clock, bgColor: "bg-blue-50", textColor: "text-blue-600" },
    { type: "Vacation", used: 5, total: 15, icon: Calendar, bgColor: "bg-yellow-50", textColor: "text-yellow-600" },
  ]

  // Handle apply leave
  const handleApplyLeave = () => {
    alert("Open leave application form")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Leaves</h1>
        <button
          onClick={handleApplyLeave}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
        >
          <Plus className="h-4 w-4 mr-1" /> Apply Leave
        </button>
      </div>

      {/* Leave balance cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {leaveBalance.map((leave, index) => (
          <motion.div
            key={leave.type}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <LeaveBalanceCard {...leave} />
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search leaves..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="block w-full md:w-40 pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="All">All Status</option>
          <option value="Approved">Approved</option>
          <option value="Pending">Pending</option>
          <option value="Rejected">Rejected</option>
        </select>

        <button className="md:w-40 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
          <Filter className="h-4 w-4" />
          <span>More Filters</span>
        </button>
      </div>

      {/* Leave applications table */}
      <LeaveApplicationsTable data={filteredLeaves} />

      {filteredLeaves.length === 0 && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No leaves found</h3>
          <p className="text-gray-500">No leave applications match your search criteria.</p>
        </div>
      )}
    </div>
  )
}

export default MyLeaves
