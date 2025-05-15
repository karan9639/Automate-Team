"use client"

import { useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { motion } from "framer-motion"
import { Plus, Search, Filter } from "lucide-react"
import MainLayout from "../layouts/MainLayout"
import LeaveFormModal from "../components/LeaveFormModal"
import { Button } from "../components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs"
import LeaveBalanceCard from "../components/LeaveBalanceCard"
import LeaveApplicationsTable from "../components/LeaveApplicationsTable"
import DateFilterTabs from "../components/DateFilterTabs"
import FAB from "../components/FAB"

const MyLeaves = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { leaves } = useSelector((state) => state.leaves)

  // State for active tab
  const [activeTab, setActiveTab] = useState("leave-balance")

  // State for date filter
  const [dateFilter, setDateFilter] = useState("This Month")

  // State for leave form modal
  const [isLeaveFormOpen, setIsLeaveFormOpen] = useState(false)

  // Filter user's leaves
  const userLeaves = leaves.filter((leave) => leave.employeeId === user.id)

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

  // Leave types and balances (dummy data)
  const leaveBalances = [
    { type: "Casual Leave", total: 12, used: 5, balance: 7 },
    { type: "Sick Leave", total: 10, used: 2, balance: 8 },
    { type: "Earned Leave", total: 15, used: 0, balance: 15 },
    { type: "Unpaid Leave", total: null, used: 1, balance: null },
  ]

  // Handle apply for leave
  const handleApplyLeave = () => {
    setIsLeaveFormOpen(true)
  }

  return (
    <MainLayout>
      <div className="p-4 md:p-6">
        {/* Date Filter Tabs */}
        <DateFilterTabs options={dateFilterOptions} activeFilter={dateFilter} onFilterChange={setDateFilter} />

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="bg-gray-800 text-white">
            <TabsTrigger
              value="leave-balance"
              className="data-[state=active]:bg-green-500 data-[state=active]:text-white"
            >
              Leave Balance
            </TabsTrigger>
            <TabsTrigger
              value="leave-applications"
              className="data-[state=active]:bg-green-500 data-[state=active]:text-white"
            >
              All Leave Applications
            </TabsTrigger>
          </TabsList>

          {/* Leave Balance Tab Content */}
          <TabsContent value="leave-balance" className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {leaveBalances.map((leave, index) => (
                <motion.div
                  key={leave.type}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <LeaveBalanceCard type={leave.type} total={leave.total} used={leave.used} balance={leave.balance} />
                </motion.div>
              ))}
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Recent Leave Applications</h2>
              <LeaveApplicationsTable leaves={userLeaves.slice(0, 5)} showActions={false} />
            </div>
          </TabsContent>

          {/* Leave Applications Tab Content */}
          <TabsContent value="leave-applications" className="mt-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex items-center gap-2">
                <div className="relative w-full sm:w-auto">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <input
                    type="search"
                    placeholder="Search leaves..."
                    className="w-full sm:w-[250px] pl-8 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <Button variant="outline" className="gap-1">
                  <Filter size={16} />
                  <span>Filter</span>
                </Button>
              </div>
              <Button onClick={handleApplyLeave} className="gap-1 bg-green-500 hover:bg-green-600">
                <Plus size={16} />
                <span>Apply for Leave</span>
              </Button>
            </div>

            <LeaveApplicationsTable leaves={userLeaves} showActions={true} />
          </TabsContent>
        </Tabs>

        {/* Leave Form Modal */}
        <LeaveFormModal isOpen={isLeaveFormOpen} onClose={() => setIsLeaveFormOpen(false)} />

        {/* Floating Action Button */}
        <FAB onClick={handleApplyLeave} />
      </div>
    </MainLayout>
  )
}

export default MyLeaves
