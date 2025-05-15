"use client"

import { motion } from "framer-motion"

const DateFilterTabs = ({ options, activeFilter, onFilterChange }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onFilterChange(option)}
          className={`relative px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeFilter === option ? "bg-green-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          {activeFilter === option && (
            <motion.span
              layoutId="activeTab"
              className="absolute inset-0 bg-green-500 rounded-full"
              initial={false}
              transition={{ type: "spring", duration: 0.5 }}
            />
          )}
          <span className="relative z-10">{option}</span>
        </button>
      ))}
    </div>
  )
}

export default DateFilterTabs
