"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "../utils/helpers"; // Assuming this path is correct

const DataTable = ({
  data = [],
  columns = [],
  onRowClick,
  isLoading = false,
  pagination = { page: 1, limit: 10, total: 0 }, // Default pagination structure
  onPageChange,
  className,
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key)
      return <ChevronsUpDown size={14} className="ml-1" />; // Adjusted size
    return sortConfig.direction === "asc" ? (
      <ChevronUp size={14} className="ml-1" />
    ) : (
      <ChevronDown size={14} className="ml-1" />
    );
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  // Calculate current page's data if pagination is handled internally (example)
  // const paginatedData = sortedData.slice(
  //   (pagination.page - 1) * pagination.limit,
  //   pagination.page * pagination.limit
  // );
  // For this example, we assume sortedData is already the data for the current page
  // or pagination is handled by passing pre-paginated data.

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  if (isLoading) {
    return (
      <div
        className={cn(
          "w-full overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700",
          className
        )}
      >
        {/* Skeleton Loader */}
        <div className="h-12 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 flex items-center">
          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="px-4 py-3 flex items-center gap-4">
              {Array.from({ length: columns.length || 3 }).map(
                (_, colIndex) => (
                  <div
                    key={colIndex}
                    className="h-4 bg-gray-100 dark:bg-gray-700 rounded animate-pulse"
                    style={{ width: `${Math.random() * 80 + 40}px` }} // Adjusted width
                  ></div>
                )
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0 && !isLoading) {
    // Ensure not to show "No data" when loading
    return (
      <div
        className={cn(
          "w-full overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700",
          className
        )}
      >
        <div className="h-12 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 flex items-center">
          <div className="font-medium text-sm text-gray-700 dark:text-gray-300">
            Team Members
          </div>
        </div>
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          No records found.
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <div className="w-full overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <table className="w-full min-w-[600px] divide-y divide-gray-200 dark:divide-gray-700">
          {" "}
          {/* min-w-[600px] for a minimum scrollable width */}
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    "px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap", // Adjusted padding
                    column.sortable &&
                      "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                  )}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center">
                    {column.header}
                    {column.sortable && (
                      <span className="text-gray-400 dark:text-gray-500">
                        {getSortIcon(column.key)}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {sortedData.map(
              (
                row,
                rowIndex // Should use paginatedData if implementing client-side pagination here
              ) => (
                <motion.tr
                  key={row.id || rowIndex}
                  className={cn(
                    "hover:bg-gray-50 dark:hover:bg-gray-800/50",
                    onRowClick && "cursor-pointer"
                  )}
                  onClick={() => onRowClick && onRowClick(row)}
                  whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }} // This might need dark mode adjustment
                  transition={{ duration: 0.1 }}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="px-3 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap"
                    >
                      {" "}
                      {/* Adjusted padding */}
                      {column.render ? column.render(row) : row[column.key]}
                    </td>
                  ))}
                </motion.tr>
              )
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-3">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} entries
          </div>
          <div className="flex flex-wrap justify-center sm:justify-end gap-1">
            {" "}
            {/* Changed to sm:justify-end */}
            <button
              className="px-3 py-1.5 rounded border border-gray-300 dark:border-gray-600 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={pagination.page === 1}
              onClick={() => onPageChange(pagination.page - 1)}
            >
              Previous
            </button>
            {/* Simplified pagination buttons for brevity, can be expanded */}
            {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
              let pageNumber;
              if (totalPages <= 3) {
                pageNumber = i + 1;
              } else if (pagination.page <= 2) {
                pageNumber = i + 1;
              } else if (pagination.page >= totalPages - 1) {
                pageNumber = totalPages - 2 + i;
              } else {
                pageNumber = pagination.page - 1 + i;
              }
              if (pageNumber < 1 || pageNumber > totalPages) return null;
              return (
                <button
                  key={pageNumber}
                  className={cn(
                    "px-3 py-1.5 rounded border text-xs",
                    pagination.page === pageNumber
                      ? "bg-green-600 border-green-600 text-white dark:bg-green-700 dark:border-green-700"
                      : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  )}
                  onClick={() => onPageChange(pageNumber)}
                >
                  {pageNumber}
                </button>
              );
            })}
            <button
              className="px-3 py-1.5 rounded border border-gray-300 dark:border-gray-600 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={pagination.page === totalPages || totalPages === 0}
              onClick={() => onPageChange(pagination.page + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
