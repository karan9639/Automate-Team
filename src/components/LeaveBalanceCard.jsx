"use client"

import { motion } from "framer-motion"
import { cn } from "../utils/helpers"

const LeaveBalanceCard = ({ type, total, used, balance }) => {
  // Calculate percentage used
  const percentage = total ? Math.round((used / total) * 100) : 0

  // Determine color based on balance
  const getColor = () => {
    if (total === null) return "bg-gray-100 text-gray-800" // Unpaid leave

    if (balance / total > 0.7) return "bg-green-100 text-green-800"
    if (balance / total > 0.3) return "bg-amber-100 text-amber-800"
    return "bg-red-100 text-red-800"
  }

  return (
    <div className={cn("rounded-lg p-4 shadow-sm", getColor())}>
      <h3 className="text-sm font-medium mb-2">{type}</h3>

      <div className="flex justify-between items-center mb-2">
        <span className="text-2xl font-bold">{balance ?? "∞"}</span>
        <span className="text-sm opacity-80">{total !== null ? `of ${total}` : "Unlimited"}</span>
      </div>

      {total !== null && (
        <>
          <div className="h-2 bg-white/30 rounded-full overflow-hidden mb-1">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="h-full bg-current opacity-60"
            />
          </div>

          <div className="text-xs">
            {used} days used ({percentage}%)
          </div>
        </>
      )}
    </div>
  )
}

export default LeaveBalanceCard
