"use client"

import { motion } from "framer-motion"
import { Users, Tag, FileText, Send, Calendar, BarChart, AlertCircle } from "lucide-react"

const ViewTabs = ({ options, activeView, onViewChange }) => {
  // Map icon names to components
  const iconMap = {
    users: Users,
    tag: Tag,
    "file-text": FileText,
    send: Send,
    calendar: Calendar,
    "bar-chart": BarChart,
    "alert-circle": AlertCircle,
  }

  return (
    <div className="mt-6 border-b border-gray-200">
      <div className="flex overflow-x-auto hide-scrollbar">
        {options.map((option) => {
          const Icon = iconMap[option.icon] || FileText
          return (
            <button
              key={option.id}
              onClick={() => onViewChange(option.label)}
              className={`relative px-4 py-2 text-sm font-medium whitespace-nowrap ${
                activeView === option.label
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center">
                <Icon size={16} className="mr-2" />
                {option.label}
              </div>
              {activeView === option.label && (
                <motion.div
                  layoutId="activeViewIndicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                  initial={false}
                  transition={{ type: "spring", duration: 0.5 }}
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default ViewTabs
