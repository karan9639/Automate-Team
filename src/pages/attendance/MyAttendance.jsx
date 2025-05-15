"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Calendar, Download, Filter, ChevronDown } from "lucide-react"

// Mock data for attendance
const attendanceData = [
  {
    id: 1,
    date: "2023-06-01",
    dayOfWeek: "Thursday",
    checkIn: "09:05 AM",
    checkOut: "06:10 PM",
    workHours: "9h 5m",
    status: "Present",
  },
  {
    id: 2,
    date: "2023-06-02",
    dayOfWeek: "Friday",
    checkIn: "08:55 AM",
    checkOut: "05:45 PM",
    workHours: "8h 50m",
    status: "Present",
  },
  {
    id: 3,
    date: "2023-06-03",
    dayOfWeek: "Saturday",
    checkIn: "-",
    checkOut: "-",
    workHours: "-",
    status: "Weekend",
  },
  {
    id: 4,
    date: "2023-06-04",
    dayOfWeek: "Sunday",
    checkIn: "-",
    checkOut: "-",
    workHours: "-",
    status: "Weekend",
  },
  {
    id: 5,
    date: "2023-06-05",
    dayOfWeek: "Monday",
    checkIn: "09:30 AM",
    checkOut: "06:45 PM",
    workHours: "9h 15m",
    status: "Present",
  },
]

// Status card component
const StatusCard = ({ title, value, icon: Icon, bgColor, textColor }) => {
  return (
    <div className={`${bgColor} rounded-lg shadow p-4`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <h3 className={`mt-1 text-2xl font-semibold ${textColor}`}>{value}</h3>
        </div>
        <div className={`p-2 rounded-lg ${bgColor}`}>
          <Icon className={`w-6 h-6 ${textColor}`} />
        </div>
      </div>
    </div>
  )
}

// Attendance table component
const AttendanceTable = ({ data }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "Present":
        return "bg-green-100 text-green-800"
      case "Weekend":
        return "bg-gray-100 text-gray-800"
      case "Late":
        return "bg-yellow-100 text-yellow-800"
      case "Absent":
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
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check In</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Check Out
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Work Hours
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row) => (
            <tr key={row.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.date}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.dayOfWeek}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.checkIn}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.checkOut}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.workHours}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                    row.status,
                  )}`}
                >
                  {row.status}
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
const MyAttendance = () => {
  const [dateRange, setDateRange] = useState("This Month")
  const [filterOpen, setFilterOpen] = useState(false)

  // Summary stats
  const summary = {
    present: 20,
    absent: 2,
    late: 3,
    leaves: 1,
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Attendance</h1>

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
            <Filter className="h-5 w-5" />
          </button>

          <button className="bg-white border rounded-md p-2 text-gray-700 hover:bg-gray-50">
            <Download className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <StatusCard
            title="Present Days"
            value={summary.present}
            icon={Calendar}
            bgColor="bg-green-50"
            textColor="text-green-600"
          />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <StatusCard
            title="Absent Days"
            value={summary.absent}
            icon={Calendar}
            bgColor="bg-red-50"
            textColor="text-red-600"
          />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <StatusCard
            title="Late Marks"
            value={summary.late}
            icon={Calendar}
            bgColor="bg-yellow-50"
            textColor="text-yellow-600"
          />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <StatusCard
            title="Leaves Taken"
            value={summary.leaves}
            icon={Calendar}
            bgColor="bg-blue-50"
            textColor="text-blue-600"
          />
        </motion.div>
      </div>

      {/* Attendance table */}
      <AttendanceTable data={attendanceData} />
    </div>
  )
}

export default MyAttendance
