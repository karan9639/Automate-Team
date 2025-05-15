"use client"

import PropTypes from "prop-types"
import { motion } from "framer-motion"

/**
 * Status card component for displaying metrics
 */
const StatusCard = ({ title, count, icon: Icon, color }) => {
  const colorVariants = {
    green: {
      bg: "bg-green-50",
      text: "text-green-700",
      iconBg: "bg-green-100",
      iconColor: "text-green-500",
    },
    red: {
      bg: "bg-red-50",
      text: "text-red-700",
      iconBg: "bg-red-100",
      iconColor: "text-red-500",
    },
    blue: {
      bg: "bg-blue-50",
      text: "text-blue-700",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-500",
    },
    amber: {
      bg: "bg-amber-50",
      text: "text-amber-700",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-500",
    },
    purple: {
      bg: "bg-purple-50",
      text: "text-purple-700",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-500",
    },
  }

  const variant = colorVariants[color] || colorVariants.blue

  return (
    <motion.div
      whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
      className={`${variant.bg} rounded-lg p-4 shadow-sm`}
    >
      <div className="flex items-center">
        <div className={`${variant.iconBg} p-3 rounded-full`}>
          <Icon className={`h-6 w-6 ${variant.iconColor}`} />
        </div>
        <div className="ml-4">
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <p className={`text-2xl font-bold ${variant.text}`}>{count}</p>
        </div>
      </div>
    </motion.div>
  )
}

StatusCard.propTypes = {
  title: PropTypes.string.isRequired,
  count: PropTypes.number.isRequired,
  icon: PropTypes.elementType.isRequired,
  color: PropTypes.oneOf(["green", "red", "blue", "amber", "purple"]).isRequired,
}

export default StatusCard
