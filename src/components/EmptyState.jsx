"use client"

import { motion } from "framer-motion"
import { cn } from "../utils/helpers"

const EmptyState = ({ icon, title, description, action, className }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn("flex flex-col items-center justify-center text-center", className)}
    >
      <div className="bg-gray-700/20 rounded-full p-6 mb-4">{icon}</div>
      <h3 className="text-xl font-medium text-white mb-2">{title}</h3>
      {description && <p className="text-gray-400 max-w-md">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </motion.div>
  )
}

export default EmptyState
