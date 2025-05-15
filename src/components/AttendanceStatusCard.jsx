"use client"

import { motion } from "framer-motion"
import { cn } from "../utils/helpers"

const AttendanceStatusCard = ({ label, count, color, textColor }) => {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={cn("rounded-lg p-4 flex flex-col items-center justify-center", color)}
    >
      <p className={cn("text-sm font-medium", textColor)}>{label}</p>
      <p className={cn("text-2xl font-bold", textColor)}>{count}</p>
    </motion.div>
  )
}

export default AttendanceStatusCard
