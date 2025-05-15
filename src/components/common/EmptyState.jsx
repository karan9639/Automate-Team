"use client";
import PropTypes from "prop-types";
import { motion } from "framer-motion";

/**
 * Empty state component for displaying when no data is available
 */
const EmptyState = ({ icon, title, description, className = "" }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center justify-center text-center ${className}`}
    >
      {icon && <div className="mb-4">{icon}</div>}
      {title && (
        <h3 className="text-xl font-medium text-white mb-2">{title}</h3>
      )}
      {description && <p className="text-gray-400 max-w-md">{description}</p>}
    </motion.div>
  );
};

EmptyState.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  icon: PropTypes.node,
  className: PropTypes.string,
};

export default EmptyState;
