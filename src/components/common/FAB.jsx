"use client"

import PropTypes from "prop-types"
import { Plus } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "../../utils/helpers"

/**
 * Floating Action Button component
 */
const FAB = ({ onClick, icon = <Plus />, className }) => {
  return (
    <motion.button
      className={cn(
        "fixed bottom-6 right-6 z-10 flex h-14 w-14 items-center justify-center rounded-full bg-green-600 text-white shadow-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2",
        className,
      )}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {icon}
    </motion.button>
  )
}

FAB.propTypes = {
  onClick: PropTypes.func.isRequired,
  icon: PropTypes.node,
  className: PropTypes.string,
}

export default FAB
