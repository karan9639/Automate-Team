"use client"

import { useState } from "react"
import { Calendar, Download, Search, Filter, ChevronDown } from "lucide-react"

// Mock data for team attendance
const teamAttendance = [
  {
    id: 1,
    name: "Alex Johnson",
    department: "Engineering",
    presentDays: 22,
    absentDays: 0,
    lateDays: 2,
    workHours: "189h 15m",
    status: "Present",
  },
  {
    id: 2,
    name: "Sarah Williams",
    department: "Design",
    presentDays: 20,
    absentDays: 2,
    lateDays: 1,
    workHours: "172h 30m",
    status: "Present",
  },
  {
    id: 3,
    name: "Michael Brown",
    department: "Marketing",
    presentDays: 21,
    absentDays: 1,
    lateDays: 3,
    workHours: "178h 45m",
    status: "Absent",
  },
  {
    id: 4,
    name: "Emily Davis",
    department: "Product",
    presentDays: 18,
    absentDays: 4,
    lateDays: 0,
    workHours: "155h 20m",
    status: "Present",
  },
  {
    id: 5,
    name: "David Wilson",
    department: "Finance",
    presentDays: 22,
    absentDays: 0,
    lateDays: 0,
    workHours: "191h 10m",
    status: "Present",
  },
]

// Attendance table component
const AttendanceTable = ({ data }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "Present":
        return "bg-green-100 text-green-800"
      case "Absent":
        return "bg-red-100 text-red-800"
      case "Late":
        return "bg-yellow-100 text-yellow-800"
      case "On Leave":
        return "bg-blue-100 text-blue-800"
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
              Present Days
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Absent Days
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Late Marks
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Work Hours
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Today's Status
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((employee) => (
            <tr key={employee.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="h-10 w-10 flex-shrink-0">
                    <img
                      className="h-10 w-10 rounded-full"
                      src={`https://ui-avatars.com/api/?name=${employee.name}&background=random`}
                      alt={employee.name}
                    />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.department}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.presentDays}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.absentDays}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.lateDays}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.workHours}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                    employee.status,
                  )}`}
                >
                  {employee.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Main component
const AllAttendance = () => {
  const [dateRange, setDateRange] = useState("This Month")
  const [filterOpen, setFilterOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [department, setDepartment] = useState("All")

  // Filter data based on search term and department
  const filteredData = teamAttendance.filter(
    (employee) =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (department === "All" || employee.department === department),
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Team Attendance</h1>

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
            placeholder="Search employees"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex space-x-2">
          <select
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          >
            <option value="All">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Design">Design</option>
            <option value="Marketing">Marketing</option>
            <option value="Product">Product</option>
            <option value="Finance">Finance</option>
          </select>

          <button className="bg-white border rounded-md p-2 text-gray-700 hover:bg-gray-50">
            <Filter className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Attendance table */}
      <AttendanceTable data={filteredData} />

      {filteredData.length === 0 && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">No attendance records found matching your criteria.</p>
        </div>
      )}
    </div>
  )
}

export default AllAttendance
