"use client"

import { motion } from "framer-motion"
import { X } from "lucide-react"

const AttendanceTable = ({ columns, data }) => {
  // Function to render cell content based on status
  const renderCellContent = (row, column) => {
    const value = row[column.key]

    // If the value is null and the column is not 'name', render an X
    if (value === null && column.key !== "name") {
      return (
        <div className="flex justify-center">
          <X size={18} className="text-red-500" />
        </div>
      )
    }

    // Special rendering for status column
    if (column.key === "status") {
      const statusColors = {
        present: "text-green-500",
        absent: "text-red-500",
        leave: "text-amber-500",
      }

      const statusLabels = {
        present: "Present",
        absent: "Absent",
        leave: "On Leave",
      }

      return <span className={statusColors[value]}>{statusLabels[value]}</span>
    }

    return value
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-700">
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {data.map((row, rowIndex) => (
            <motion.tr
              key={row.id || rowIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: rowIndex * 0.1 }}
              className="hover:bg-gray-800"
            >
              {columns.map((column) => (
                <td key={`${row.id}-${column.key}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {renderCellContent(row, column)}
                </td>
              ))}
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default AttendanceTable
