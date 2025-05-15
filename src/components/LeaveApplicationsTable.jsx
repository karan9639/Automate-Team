"use client"

import { useState } from "react"
import { useDispatch } from "react-redux"
import { motion } from "framer-motion"
import { Edit, Trash2, FileText } from "lucide-react"
import { format } from "date-fns"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { dateDiffInDays } from "../utils/helpers"
import ConfirmModal from "./ConfirmModal"

const LeaveApplicationsTable = ({ leaves, showActions = true }) => {
  const dispatch = useDispatch()
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedLeave, setSelectedLeave] = useState(null)

  // Handle delete leave
  const handleDeleteLeave = (leave) => {
    setSelectedLeave(leave)
    setIsDeleteModalOpen(true)
  }

  // Handle confirm delete
  const handleConfirmDelete = () => {
    // TODO: Implement delete leave action
    console.log("Delete leave:", selectedLeave)
    setIsDeleteModalOpen(false)
  }

  // Handle view leave details
  const handleViewLeave = (leave) => {
    // TODO: Implement view leave details
    console.log("View leave details:", leave)
  }

  // Status badge colors
  const getStatusBadge = (status) => {
    const statusColors = {
      pending: "bg-amber-100 text-amber-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    }

    const statusLabels = {
      pending: "Pending",
      approved: "Approved",
      rejected: "Rejected",
    }

    return <Badge className={statusColors[status]}>{statusLabels[status]}</Badge>
  }

  // Leave type badge colors
  const getTypeBadge = (type) => {
    const typeColors = {
      sick: "bg-blue-100 text-blue-800",
      vacation: "bg-purple-100 text-purple-800",
      personal: "bg-orange-100 text-orange-800",
      other: "bg-gray-100 text-gray-800",
    }

    return <Badge className={typeColors[type]}>{type.charAt(0).toUpperCase() + type.slice(1)}</Badge>
  }

  if (leaves.length === 0) {
    return (
      <div className="bg-white rounded-lg border p-8 text-center">
        <div className="flex justify-center mb-4">
          <img src="/placeholder.svg?key=wxode" alt="No leaves" className="h-30 w-30" />
        </div>
        <h3 className="text-xl font-medium text-gray-900">No Leave Applications</h3>
        <p className="mt-2 text-gray-500">You haven't applied for any leaves yet.</p>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
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
                  Status
                </th>
                {showActions && (
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leaves.map((leave, index) => (
                <motion.tr
                  key={leave.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleViewLeave(leave)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">{getTypeBadge(leave.type)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {format(new Date(leave.startDate), "MMM dd, yyyy")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {format(new Date(leave.endDate), "MMM dd, yyyy")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {dateDiffInDays(leave.startDate, leave.endDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(leave.status)}</td>
                  {showActions && (
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
                              className="text-amber-600 hover:text-amber-900"
                              onClick={() => console.log("Edit leave:", leave)}
                            >
                              <Edit size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-900"
                              onClick={() => handleDeleteLeave(leave)}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  )}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Cancel Leave Application"
        description="Are you sure you want to cancel this leave application? This action cannot be undone."
        confirmText="Cancel Leave"
        cancelText="Keep"
        variant="destructive"
      />
    </>
  )
}

export default LeaveApplicationsTable
