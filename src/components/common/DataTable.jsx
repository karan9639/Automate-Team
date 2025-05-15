"use client"

import { useState } from "react"
import PropTypes from "prop-types"
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "../../utils/helpers"

/**
 * Reusable data table component with sorting and pagination
 */
const DataTable = ({
  data = [],
  columns = [],
  onRowClick,
  isLoading = false,
  pagination = { page: 1, limit: 10, total: 0 },
  onPageChange,
  className,
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null })

  const handleSort = (key) => {
    let direction = "asc"
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc"
    }
    setSortConfig({ key, direction })
  }

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <ChevronsUpDown size={16} />
    return sortConfig.direction === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />
  }

  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig.key) return 0

    const aValue = a[sortConfig.key]
    const bValue = b[sortConfig.key]

    if (aValue < bValue) {
      return sortConfig.direction === "asc" ? -1 : 1
    }
    if (aValue > bValue) {
      return sortConfig.direction === "asc" ? 1 : -1
    }
    return 0
  })

  const totalPages = Math.ceil(pagination.total / pagination.limit)

  if (isLoading) {
    return (
      <div className="w-full overflow-hidden rounded-lg border">
        <div className="h-12 border-b bg-gray-50 px-4 flex items-center">
          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="divide-y">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="px-4 py-3 flex items-center gap-4">
              {Array.from({ length: columns.length }).map((_, colIndex) => (
                <div
                  key={colIndex}
                  className="h-4 bg-gray-100 rounded animate-pulse"
                  style={{ width: `${Math.random() * 100 + 50}px` }}
                ></div>
              ))}
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="w-full overflow-hidden rounded-lg border">
        <div className="h-12 border-b bg-gray-50 px-4 flex items-center">
          <div className="font-medium">No data available</div>
        </div>
        <div className="p-8 text-center text-gray-500">No records found</div>
      </div>
    )
  }

  return (
    <div className={cn("w-full", className)}>
      <div className="w-full overflow-x-auto rounded-lg border">
        <table className="w-full min-w-full divide-y">
          <thead>
            <tr className="bg-gray-50">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    "px-4 py-3 text-left text-sm font-medium text-gray-500 tracking-wider whitespace-nowrap",
                    column.sortable && "cursor-pointer hover:bg-gray-100",
                  )}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-1">
                    {column.header}
                    {column.sortable && <span className="text-gray-400">{getSortIcon(column.key)}</span>}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y">
            {sortedData.map((row, rowIndex) => (
              <motion.tr
                key={row.id || rowIndex}
                className={cn("hover:bg-gray-50", onRowClick && "cursor-pointer")}
                onClick={() => onRowClick && onRowClick(row)}
                whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
                transition={{ duration: 0.1 }}
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-3 text-sm">
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-500">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} entries
          </div>
          <div className="flex gap-1">
            <button
              className="px-3 py-1 rounded border text-sm disabled:opacity-50"
              disabled={pagination.page === 1}
              onClick={() => onPageChange(pagination.page - 1)}
            >
              Previous
            </button>
            {Array.from({ length: Math.min(5, totalPages) }).map((_, index) => {
              const pageNumber = pagination.page <= 3 ? index + 1 : pagination.page + index - 2

              if (pageNumber > totalPages) return null

              return (
                <button
                  key={pageNumber}
                  className={cn(
                    "px-3 py-1 rounded border text-sm",
                    pagination.page === pageNumber ? "bg-green-100 border-green-300" : "",
                  )}
                  onClick={() => onPageChange(pageNumber)}
                >
                  {pageNumber}
                </button>
              )
            })}
            <button
              className="px-3 py-1 rounded border text-sm disabled:opacity-50"
              disabled={pagination.page === totalPages}
              onClick={() => onPageChange(pagination.page + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

DataTable.propTypes = {
  data: PropTypes.array,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      header: PropTypes.node.isRequired,
      sortable: PropTypes.bool,
      render: PropTypes.func,
    }),
  ),
  onRowClick: PropTypes.func,
  isLoading: PropTypes.bool,
  pagination: PropTypes.shape({
    page: PropTypes.number,
    limit: PropTypes.number,
    total: PropTypes.number,
  }),
  onPageChange: PropTypes.func,
  className: PropTypes.string,
}

export default DataTable
