"use client"

import { useState } from "react"
import { Calendar, Download, Search, Filter, ChevronDown } from "lucide-react"

// Mock data for team leaves
const teamLeaves = [
  {
    id: 1,
    employeeName: "Alex Johnson",
    department: "Engineering",
    leaveType: "Sick Leave",
    startDate: "2023-06-10",
    endDate: "2023-06-12",
    duration: "3 days",
    reason: "Medical appointment and recovery",
    status: "Approved",
    appliedOn: "2023-06-05",
  },
  {
    id: 2,
    employeeName: "Sarah Williams",
    department: "Design",
    leaveType: "Casual Leave",
    startDate: "2023-07-02",
    endDate: "2023-07-02",
    duration: "1 day",
    reason: "Personal work",
    status: "Pending",
    appliedOn: "2023-06-25",
  },
  {
    id: 3,
    employeeName: "Michael Brown",
    department: "Marketing",
    leaveType: "Vacation",
    startDate: "2023-08-15",
    endDate: "2023-08-20",
    duration: "6 days",
    reason: "Family vacation",
    status: "Pending",
    appliedOn: "2023-06-30",
  },
  {
    id: 4,
    employeeName: "Emily Davis",
    department: "Product",
    leaveType: "Work from Home",
    startDate: "2023-06-22",
    endDate: "2023-06-22",
    duration: "1 day",
    reason: "Internet installation at home",
    status: "Rejected",
    appliedOn: "2023-06-20",
  },
  {
    id: 5,
    employeeName: "David Wilson",
    department: "Finance",
    leaveType: "Sick Leave",
    startDate: "2023-07-05",
    endDate: "2023-07-07",
    duration: "3 days",
    reason: "Fever and cold",
    status: "Approved",
    appliedOn: "2023-07-01",
  },
]

// Leave table component
const LeaveTable = ({ data }) => {
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
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Department
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Leave Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((leave) => (
            <tr key={leave.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="h-10 w-10 flex-shrink-0">
                    <img
                      className="h-10 w-10 rounded-full"
                      src={`https://ui-avatars.com/api/?name=${leave.employeeName}&background=random`}
                      alt={leave.employeeName}
                    />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{leave.employeeName}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{leave.department}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{leave.leaveType}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {leave.startDate === leave.endDate ? leave.startDate : `${leave.startDate} to ${leave.endDate}`}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{leave.duration}</td>
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
                <button className="text-blue-600 hover:text-blue-900">View</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Main component
const AllLeaves = () => {
  const [dateRange, setDateRange] = useState("This Month")
  const [filterOpen, setFilterOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState({
    department: "All",
    leaveType: "All",
    status: "All",
  })

  // Filter data based on search term and filters
  const filteredLeaves = teamLeaves.filter(
    (leave) =>
      (leave.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        leave.reason.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filters.department === "All" || leave.department === filters.department) &&
      (filters.leaveType === "All" || leave.leaveType === filters.leaveType) &&
      (filters.status === "All" || leave.status === filters.status),
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Team Leaves</h1>

        <div className="flex space-x-2">
          <div className="relative">
            <button
              className="flex items-center space-x-2 bg-white border rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              onClick={() => setFilterOpen(!filterOpen)}
            >
              <Calendar className="h-4 w-4" />
              <span>{dateRange}</span>
              <ChevronDown className="h-4 w-4" />
            </button>

            {filterOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                <div className="py-1">
                  {["Today", "This Week", "This Month", "Last Month", "Custom Range"].map((range) => (
                    <button
                      key={range}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => {
                        setDateRange(range)
                        setFilterOpen(false)
                      }}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button className="bg-white border rounded-md p-2 text-gray-700 hover:bg-gray-50">
            <Download className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="relative w-full md:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Search leaves"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            className="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            value={filters.department}
            onChange={(e) => setFilters({ ...filters, department: e.target.value })}
          >
            <option value="All">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Design">Design</option>
            <option value="Marketing">Marketing</option>
            <option value="Product">Product</option>
            <option value="Finance">Finance</option>
          </select>

          <select
            className="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            value={filters.leaveType}
            onChange={(e) => setFilters({ ...filters, leaveType: e.target.value })}
          >
            <option value="All">All Leave Types</option>
            <option value="Sick Leave">Sick Leave</option>
            <option value="Casual Leave">Casual Leave</option>
            <option value="Vacation">Vacation</option>
            <option value="Work from Home">Work from Home</option>
          </select>

          <select
            className="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="All">All Status</option>
            <option value="Approved">Approved</option>
            <option value="Pending">Pending</option>
            <option value="Rejected">Rejected</option>
          </select>

          <button
            className="bg-white border rounded-md p-2 text-gray-700 hover:bg-gray-50"
            onClick={() => {
              setSearchTerm("")
              setFilters({
                department: "All",
                leaveType: "All",
                status: "All",
              })
            }}
          >
            <Filter className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Leave table */}
      <LeaveTable data={filteredLeaves} />

      {filteredLeaves.length === 0 && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">No leave records found matching your criteria.</p>
        </div>
      )}
    </div>
  )
}

export default AllLeaves
