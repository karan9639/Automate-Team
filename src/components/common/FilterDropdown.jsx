"use client"

import { useState, useRef, useEffect } from "react"
import PropTypes from "prop-types"
import { Filter, Check } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

/**
 * Filter dropdown component for filtering data
 */
const FilterDropdown = ({ filters, activeFilters, onFilterChange }) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Handle filter change
  const handleFilterChange = (filterKey, value) => {
    onFilterChange({
      ...activeFilters,
      [filterKey]: value,
    })
  }

  // Count active filters
  const activeFilterCount = Object.values(activeFilters).filter(Boolean).length

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white border rounded-md hover:bg-gray-50"
      >
        <Filter size={16} />
        <span>Filters</span>
        {activeFilterCount > 0 && (
          <span className="flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-green-600 rounded-full">
            {activeFilterCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute right-0 z-10 mt-2 w-64 bg-white rounded-md shadow-lg overflow-hidden"
          >
            <div className="p-2">
              {filters.map((filter) => (
                <div key={filter.key} className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">{filter.label}</h3>
                  <div className="space-y-1">
                    {filter.options.map((option) => (
                      <button
                        key={option.value || "null"}
                        onClick={() => handleFilterChange(filter.key, option.value)}
                        className="flex items-center justify-between w-full px-3 py-2 text-sm text-left rounded-md hover:bg-gray-100"
                      >
                        <span>{option.label}</span>
                        {activeFilters[filter.key] === option.value && <Check size={16} className="text-green-600" />}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {activeFilterCount > 0 && (
                <div className="pt-2 border-t">
                  <button
                    onClick={() => {
                      const resetFilters = {}
                      Object.keys(activeFilters).forEach((key) => {
                        resetFilters[key] = null
                      })
                      onFilterChange(resetFilters)
                    }}
                    className="w-full px-3 py-2 text-sm text-center text-red-600 hover:bg-red-50 rounded-md"
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

FilterDropdown.propTypes = {
  filters: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      options: PropTypes.arrayOf(
        PropTypes.shape({
          label: PropTypes.string.isRequired,
          value: PropTypes.any,
        }),
      ).isRequired,
    }),
  ).isRequired,
  activeFilters: PropTypes.object.isRequired,
  onFilterChange: PropTypes.func.isRequired,
}

export default FilterDropdown
