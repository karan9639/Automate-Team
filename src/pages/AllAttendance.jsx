"use client"

import { useState } from "react"
import { useSelector } from "react-redux"
import { Download, Search, Filter } from "lucide-react"
import MainLayout from "../layouts/MainLayout"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../components/ui/select"
import AttendanceStatusCard from "../components/AttendanceStatusCard"
import AttendanceTable from "../components/AttendanceTable"
import DateFilterTabs from "../components/DateFilterTabs"

const AllAttendance = () => {
  const { members } = useSelector((state) => state.team)
  const { attendance } = useSelector((state) => state.leaves)

  // State for active tab
  const [activeTab, setActiveTab] = useState("all-attendance")

  // State for filters
  const [dateFilter, setDateFilter] = useState("This Month")
  const [searchQuery, setSearchQuery] = useState("")

  // Date filter options
  const dateFilterOptions = [
    "Today",
    "Yesterday",
    "This Week",
    "Last Week",
    "This Month",
    "Last Month",
    "Next Week",
    "Next Month",
    "All Time",
    "Custom",
  ]

  // Handle search
  const handleSearch = (e) => {
    setSearchQuery(e.target.value)
  }

  // Handle download
  const handleDownload = () => {
    // TODO: Implement download functionality
    console.log("Download attendance report")
  }

  // Dummy data for attendance summary
  const attendanceSummary = {
    total: members.length,
    present: 2,
    onLeave: 1,
    absent: members.length - 3,
  }

  return (
    <MainLayout>
      <div className="p-4 md:p-6">
        {/* Date Filter Tabs */}
        <DateFilterTabs options={dateFilterOptions} activeFilter={dateFilter} onFilterChange={setDateFilter} />

        {/* Filters */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-6 mb-6">
          <div className="flex items-center gap-2">
            <Select defaultValue="manager">
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="View Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="employee">Employee</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search employees..."
                className="pl-8 pr-4 py-2"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
            <Button variant="outline" className="gap-1">
              <Filter size={16} />
              <span>Filter</span>
            </Button>
            <Button onClick={handleDownload} className="gap-1 bg-green-500 hover:bg-green-600 text-white">
              <Download size={16} />
              <span>Download</span>
            </Button>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-gray-800 text-white">
            <TabsTrigger
              value="all-attendance"
              className="data-[state=active]:bg-green-500 data-[state=active]:text-white"
            >
              All Attendance
            </TabsTrigger>
            <TabsTrigger
              value="all-regularizations"
              className="data-[state=active]:bg-green-500 data-[state=active]:text-white"
            >
              All Regularizations
            </TabsTrigger>
          </TabsList>

          {/* All Attendance Tab Content */}
          <TabsContent value="all-attendance" className="mt-6">
            {/* Status Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <AttendanceStatusCard
                label="Total"
                count={attendanceSummary.total}
                color="bg-gray-800"
                textColor="text-white"
              />
              <AttendanceStatusCard
                label="Present"
                count={attendanceSummary.present}
                color="bg-green-500/20"
                textColor="text-green-500"
              />
              <AttendanceStatusCard
                label="On Leave"
                count={attendanceSummary.onLeave}
                color="bg-amber-500/20"
                textColor="text-amber-500"
              />
              <AttendanceStatusCard
                label="Absent"
                count={attendanceSummary.absent}
                color="bg-red-500/20"
                textColor="text-red-500"
              />
            </div>

            {/* Attendance Table */}
            <div className="bg-white rounded-lg border overflow-hidden">
              <AttendanceTable
                columns={[
                  { key: "name", header: "Name" },
                  { key: "status", header: "Status" },
                  { key: "loginTime", header: "Login Time" },
                  { key: "logoutTime", header: "Logout Time" },
                  { key: "totalDuration", header: "Total Duration" },
                  { key: "location", header: "Location" },
                ]}
                data={members.map((member) => ({
                  id: member.id,
                  name: member.name,
                  status: Math.random() > 0.7 ? "present" : Math.random() > 0.5 ? "leave" : "absent",
                  loginTime: Math.random() > 0.7 ? "09:30 AM" : null,
                  logoutTime: Math.random() > 0.7 ? "06:30 PM" : null,
                  totalDuration: Math.random() > 0.7 ? "09:00:00" : null,
                  location: Math.random() > 0.7 ? "Office" : null,
                }))}
              />
            </div>
          </TabsContent>

          {/* All Regularizations Tab Content */}
          <TabsContent value="all-regularizations" className="mt-6">
            <div className="bg-white rounded-lg border p-8 text-center">
              <div className="flex justify-center mb-4">
                <img src="/empty-inbox.png" alt="No regularizations" className="h-30 w-30" />
              </div>
              <h3 className="text-xl font-medium text-gray-900">No regularization requests</h3>
              <p className="mt-2 text-gray-500">There are no pending regularization requests</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}

export default AllAttendance
