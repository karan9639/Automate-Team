"use client"

import { motion } from "framer-motion"

const StatusCard = ({ title, count, icon: Icon, bgColor, textColor }) => {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={`rounded-lg ${bgColor} ${textColor} p-4 flex flex-col items-center justify-center shadow-sm`}
    >
      <div className="flex items-center justify-center mb-2">
        <Icon size={24} />
      </div>
      <h3 className="text-sm font-medium">{title}</h3>
      <p className="text-2xl font-bold">{count}</p>
    </motion.div>
  )
}

export default StatusCard
