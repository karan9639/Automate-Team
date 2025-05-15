"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Calendar, Plus, Download, Upload, Search, Trash2 } from "lucide-react"

// Mock data for holidays
const holidaysData = [
  {
    id: 1,
    name: "New Year's Day",
    date: "2023-01-01",
    day: "Sunday",
    type: "National",
    description: "Public holiday to mark the first day of the year",
  },
  {
    id: 2,
    name: "Martin Luther King Jr. Day",
    date: "2023-01-16",
    day: "Monday",
    type: "National",
    description: "Honors the life and achievements of Martin Luther King Jr.",
  },
  {
    id: 3,
    name: "President's Day",
    date: "2023-02-20",
    day: "Monday",
    type: "National",
    description: "Honors all persons who served in the office of president of the United States",
  },
  {
    id: 4,
    name: "Memorial Day",
    date: "2023-05-29",
    day: "Monday",
    type: "National",
    description: "Honors the men and women who died while serving in the U.S. military",
  },
  {
    id: 5,
    name: "Independence Day",
    date: "2023-07-04",
    day: "Tuesday",
    type: "National",
    description: "Commemorates the Declaration of Independence of the United States",
  },
  {
    id: 6,
    name: "Labor Day",
    date: "2023-09-04",
    day: "Monday",
    type: "National",
    description: "Honors the American labor movement",
  },
  {
    id: 7,
    name: "Columbus Day",
    date: "2023-10-09",
    day: "Monday",
    type: "National",
    description: "Commemorates the arrival of Christopher Columbus in the Americas",
  },
  {
    id: 8,
    name: "Veterans Day",
    date: "2023-11-11",
    day: "Saturday",
    type: "National",
    description: "Honors military veterans who served in the United States Armed Forces",
  },
  {
    id: 9,
    name: "Thanksgiving Day",
    date: "2023-11-23",
    day: "Thursday",
    type: "National",
    description: "Day of giving thanks for the blessing of the harvest and of the preceding year",
  },
  {
    id: 10,
    name: "Christmas Day",
    date: "2023-12-25",
    day: "Monday",
    type: "National",
    description: "Annual festival commemorating the birth of Jesus Christ",
  },
  {
    id: 11,
    name: "Company Foundation Day",
    date: "2023-08-15",
    day: "Tuesday",
    type: "Company",
    description: "Anniversary of the company's founding",
  },
  {
    id: 12,
    name: "Annual Team Retreat",
    date: "2023-10-20",
    day: "Friday",
    type: "Company",
    description: "Day off for annual team-building retreat",
  },
]

// Holiday table component
const HolidayTable = ({ data, onDelete }) => {
  const getTypeColor = (type) => {
    switch (type) {
      case "National":
        return "bg-blue-100 text-blue-800"
      case "Company":
        return "bg-green-100 text-green-800"
      case "Regional":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Holiday Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Description
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((holiday) => (
            <tr key={holiday.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{holiday.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{holiday.date}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{holiday.day}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeColor(
                    holiday.type,
                  )}`}
                >
                  {holiday.type}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{holiday.description}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => onDelete(holiday.id)}
                  className="text-red-600 hover:text-red-900 flex items-center ml-auto"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Empty state component
const EmptyState = () => {
  return (
    <div className="text-center py-12">
      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-1">No holidays found</h3>
      <p className="text-gray-500 mb-4">There are no holidays matching your criteria</p>
      <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
        <Plus className="h-4 w-4 mr-1" /> Add Holiday
      </button>
    </div>
  )
}

// Main component
const Holidays = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [holidayType, setHolidayType] = useState("All")
  const [holidays, setHolidays] = useState(holidaysData)

  // Filter holidays based on search term and type
  const filteredHolidays = holidays.filter(
    (holiday) =>
      (holiday.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        holiday.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (holidayType === "All" || holiday.type === holidayType),
  )

  // Handle add holiday
  const handleAddHoliday = () => {
    alert("Open holiday creation form")
  }

  // Handle delete holiday
  const handleDeleteHoliday = (id) => {
    if (window.confirm("Are you sure you want to delete this holiday?")) {
      setHolidays(holidays.filter((holiday) => holiday.id !== id))
    }
  }

  // Handle import
  const handleImport = () => {
    alert("Import holidays from CSV/Excel")
  }

  // Handle export
  const handleExport = () => {
    alert("Export holidays to CSV/Excel")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Holidays</h1>
        <div className="flex space-x-2">
          <button
            onClick={handleAddHoliday}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
          >
            <Plus className="h-4 w-4 mr-1" /> Add Holiday
          </button>
          <button
            onClick={handleImport}
            className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 flex items-center"
          >
            <Upload className="h-4 w-4 mr-1" /> Import
          </button>
          <button
            onClick={handleExport}
            className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 flex items-center"
          >
            <Download className="h-4 w-4 mr-1" /> Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search holidays..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <select
          value={holidayType}
          onChange={(e) => setHolidayType(e.target.value)}
          className="block w-full md:w-40 pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="All">All Types</option>
          <option value="National">National</option>
          <option value="Company">Company</option>
          <option value="Regional">Regional</option>
        </select>
      </div>

      {/* Holiday table or empty state */}
      {filteredHolidays.length > 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <HolidayTable data={filteredHolidays} onDelete={handleDeleteHoliday} />
        </motion.div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          <EmptyState />
        </div>
      )}

      {/* Holiday count */}
      <div className="mt-4 text-sm text-gray-500">
        Showing {filteredHolidays.length} of {holidays.length} holidays
      </div>
    </div>
  )
}

export default Holidays
