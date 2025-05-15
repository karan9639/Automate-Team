"use client"

import { useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { motion } from "framer-motion"
import { Check, X, FileText } from "lucide-react"
import MainLayout from "../layouts/MainLayout"
import { Button } from "../components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs"
import DateFilterTabs from "../components/DateFilterTabs"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../components/ui/select"
import { updateLeaveStatusLocal } from "../store/slices/leaveSlice"
import { Badge } from "../components/ui/badge"
import { dateDiffInDays } from "../utils/helpers"

const Approvals = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { leaves } = useSelector((state) => state.leaves)

  // State for active tab
  const [activeTab, setActiveTab] = useState("leave-applications")

  // State for date filter
  const [dateFilter, setDateFilter] = useState("This Month")

  // State for status filter
  const [statusFilter, setStatusFilter] = useState("all")

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

  // Filter pending leaves
  const pendingLeaves = leaves.filter((leave) => leave.status === "pending")

  // Filter leaves by status
  const filteredLeaves =
    statusFilter === "all" ? pendingLeaves : pendingLeaves.filter((leave) => leave.status === statusFilter)

  // Handle approve leave
  const handleApproveLeave = (leave) => {
    dispatch(
      updateLeaveStatusLocal({
        id: leave.id,
        status: "approved",
        approvedBy: user.name,
      }),
    )
  }

  // Handle reject leave
  const handleRejectLeave = (leave) => {
    dispatch(
      updateLeaveStatusLocal({
        id: leave.id,
        status: "rejected",
        approvedBy: user.name,
      }),
    )
  }

  // Handle view leave details
  const handleViewLeave = (leave) => {
    // TODO: Implement view leave details
    console.log("View leave details:", leave)
  }

  return (
    <MainLayout>
      <div className="p-4 md:p-6">
        {/* Date Filter Tabs */}
        <DateFilterTabs options={dateFilterOptions} activeFilter={dateFilter} onFilterChange={setDateFilter} />

        {/* Employee Filter */}
        <div className="mt-4">
          <Select defaultValue="employee">
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="employee">Employee</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="bg-gray-800 text-white">
            <TabsTrigger
              value="leave-applications"
              className="data-[state=active]:bg-green-500 data-[state=active]:text-white"
            >
              Leave Applications
            </TabsTrigger>
            <TabsTrigger
              value="regularization"
              className="data-[state=active]:bg-green-500 data-[state=active]:text-white"
            >
              Regularization
            </TabsTrigger>
          </TabsList>

          {/* Leave Applications Tab Content */}
          <TabsContent value="leave-applications" className="mt-6">
            {/* Status Filters */}
            <div className="flex space-x-2 mb-6">
              <Button
                variant={statusFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("all")}
                className={statusFilter === "all" ? "bg-gray-800 text-white" : ""}
              >
                All <Badge className="ml-2 bg-gray-200 text-gray-800">{pendingLeaves.length}</Badge>
              </Button>
              <Button
                variant={statusFilter === "pending" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("pending")}
                className={statusFilter === "pending" ? "bg-amber-500 text-white" : ""}
              >
                Pending{" "}
                <Badge className="ml-2 bg-amber-200 text-amber-800">
                  {pendingLeaves.filter((l) => l.status === "pending").length}
                </Badge>
              </Button>
              <Button
                variant={statusFilter === "approved" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("approved")}
                className={statusFilter === "approved" ? "bg-green-500 text-white" : ""}
              >
                Approved{" "}
                <Badge className="ml-2 bg-green-200 text-green-800">
                  {pendingLeaves.filter((l) => l.status === "approved").length}
                </Badge>
              </Button>
              <Button
                variant={statusFilter === "rejected" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("rejected")}
                className={statusFilter === "rejected" ? "bg-red-500 text-white" : ""}
              >
                Rejected{" "}
                <Badge className="ml-2 bg-red-200 text-red-800">
                  {pendingLeaves.filter((l) => l.status === "rejected").length}
                </Badge>
              </Button>
            </div>

            {/* Leave Applications Table */}
            {filteredLeaves.length === 0 ? (
              <div className="bg-white rounded-lg border p-8 text-center">
                <div className="flex justify-center mb-4">
                  <img src="/empty-inbox.png" alt="No requests" className="h-30 w-30" />
                </div>
                <h3 className="text-xl font-medium text-gray-900">No All requests</h3>
                <p className="mt-2 text-gray-500">You are all set! nothing to do here...</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg border overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Employee
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Type
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        From
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        To
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Days
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Reason
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredLeaves.map((leave, index) => (
                      <motion.tr
                        key={leave.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleViewLeave(leave)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8">
                              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-medium">
                                {leave.employeeName.charAt(0)}
                              </div>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">{leave.employeeName}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              leave.type === "sick"
                                ? "bg-blue-100 text-blue-800"
                                : leave.type === "vacation"
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-orange-100 text-orange-800"
                            }`}
                          >
                            {leave.type.charAt(0).toUpperCase() + leave.type.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(leave.startDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(leave.endDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {dateDiffInDays(leave.startDate, leave.endDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">
                          {leave.reason}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2" onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-blue-600 hover:text-blue-900"
                              onClick={() => handleViewLeave(leave)}
                            >
                              <FileText size={16} />
                            </Button>
                            {leave.status === "pending" && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-green-600 hover:text-green-900"
                                  onClick={() => handleApproveLeave(leave)}
                                >
                                  <Check size={16} />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-900"
                                  onClick={() => handleRejectLeave(leave)}
                                >
                                  <X size={16} />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>

          {/* Regularization Tab Content */}
          <TabsContent value="regularization" className="mt-6">
            <div className="bg-white rounded-lg border p-8 text-center">
              <div className="flex justify-center mb-4">
                <img src="/empty-inbox.png" alt="No regularization requests" className="h-30 w-30" />
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

export default Approvals
