"use client"

import { useState } from "react"
import { useSelector } from "react-redux"
import { Download, Calendar } from "lucide-react"
import MainLayout from "../layouts/MainLayout"
import { Button } from "../components/ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../components/ui/select"
import AttendanceStatusCard from "../components/AttendanceStatusCard"
import AttendanceTable from "../components/AttendanceTable"
import { format } from "date-fns"

const MyAttendance = () => {
  const { user } = useSelector((state) => state.auth)
  const { attendance } = useSelector((state) => state.leaves)

  // State for filters
  const [dateFilter, setDateFilter] = useState(format(new Date(), "EEE, MMM dd"))
  const [viewType, setViewType] = useState("employee")
  const [periodFilter, setPerioFilter] = useState("This Month")

  // Dummy data for daily report
  const dailyReport = {
    total: 1,
    present: 0,
    onLeave: 0,
    absent: 1,
    date: new Date(),
  }

  // Dummy data for cumulative report
  const cumulativeReport = {
    totalDays: 11,
    working: 11,
    weekOff: 0,
    holidays: 0,
  }

  // Handle download attendance
  const handleDownload = () => {
    // TODO: Implement download functionality
    console.log("Download attendance report")
  }

  return (
    <MainLayout>
      <div className="p-4 md:p-6">
        {/* Filters */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Select value={viewType} onValueChange={setViewType}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="View Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="employee">Employee</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Daily Report Section */}
        <div className="bg-gray-900 rounded-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold text-white">Daily Report</h2>
              <div className="flex items-center gap-2 bg-gray-800 rounded-md px-3 py-1.5">
                <Calendar size={16} className="text-gray-400" />
                <span className="text-sm text-white">{dateFilter}</span>
              </div>
            </div>
            <Button
              onClick={handleDownload}
              variant="outline"
              className="bg-green-500 hover:bg-green-600 text-white border-none"
            >
              <Download size={16} className="mr-2" />
              Download Attendance
            </Button>
          </div>

          {/* Status Cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <AttendanceStatusCard label="Total" count={dailyReport.total} color="bg-gray-800" textColor="text-white" />
            <AttendanceStatusCard
              label="Present"
              count={dailyReport.present}
              color="bg-green-500/20"
              textColor="text-green-500"
            />
            <AttendanceStatusCard
              label="On Leave"
              count={dailyReport.onLeave}
              color="bg-amber-500/20"
              textColor="text-amber-500"
            />
            <AttendanceStatusCard
              label="Absent"
              count={dailyReport.absent}
              color="bg-red-500/20"
              textColor="text-red-500"
            />
          </div>

          {/* Daily Attendance Table */}
          <AttendanceTable
            columns={[
              { key: "name", header: "Name" },
              { key: "status", header: "Status" },
              { key: "loginTime", header: "Login Time" },
              { key: "logoutTime", header: "Logout Time" },
              { key: "totalDuration", header: "Total Duration" },
            ]}
            data={[
              {
                id: "1",
                name: user.name,
                status: "absent",
                loginTime: null,
                logoutTime: null,
                totalDuration: null,
              },
            ]}
          />
        </div>

        {/* Cumulative Report Section */}
        <div className="bg-gray-900 rounded-lg p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold text-white">Cumulative Report</h2>
              <Select value={periodFilter} onValueChange={setPerioFilter}>
                <SelectTrigger className="w-[150px] bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="This Month">This Month</SelectItem>
                  <SelectItem value="Last Month">Last Month</SelectItem>
                  <SelectItem value="This Week">This Week</SelectItem>
                  <SelectItem value="Last Week">Last Week</SelectItem>
                  <SelectItem value="Custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleDownload}
              variant="outline"
              className="bg-green-500 hover:bg-green-600 text-white border-none"
            >
              <Download size={16} className="mr-2" />
              Download Attendance
            </Button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <AttendanceStatusCard
              label="Total Days"
              count={cumulativeReport.totalDays}
              color="bg-gray-800"
              textColor="text-white"
            />
            <AttendanceStatusCard
              label="Working"
              count={cumulativeReport.working}
              color="bg-green-500/20"
              textColor="text-green-500"
            />
            <AttendanceStatusCard
              label="Week Off"
              count={cumulativeReport.weekOff}
              color="bg-amber-500/20"
              textColor="text-amber-500"
            />
            <AttendanceStatusCard
              label="Holidays"
              count={cumulativeReport.holidays}
              color="bg-blue-500/20"
              textColor="text-blue-500"
            />
          </div>

          {/* Cumulative Attendance Table */}
          <AttendanceTable
            columns={[
              { key: "name", header: "Name" },
              { key: "present", header: "Present" },
              { key: "leave", header: "Leave" },
              { key: "absent", header: "Absent" },
              { key: "workDuration", header: "Work duration" },
              { key: "reportingManager", header: "Reporting Manager" },
            ]}
            data={[
              {
                id: "1",
                name: user.name,
                present: 0,
                leave: 0,
                absent: 11,
                workDuration: "00:00:00",
                reportingManager: "Not Assigned",
              },
            ]}
          />
        </div>
      </div>
    </MainLayout>
  )
}

export default MyAttendance
