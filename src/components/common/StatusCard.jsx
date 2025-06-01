"use client";
import { motion } from "framer-motion";

const StatusCard = ({
  title,
  count,
  trend,
  Icon,
  bgColor,
  textColor,
  trendColor,
  countColor,
  iconColor,
  iconBgColor,
}) => {
  return (
    <motion.div
      whileHover={{ y: -5, boxShadow: "0 10px 20px -5px rgba(0,0,0,0.1)" }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`rounded-xl p-4 sm:p-6 shadow-lg transition-all duration-300 ease-out ${bgColor} ${textColor} flex flex-col items-start text-left`}
    >
      <div
        className={`p-2 sm:p-3 rounded-full ${
          iconBgColor || "bg-foreground/5"
        } mb-3 self-start`}
      >
        <Icon
          size={20}
          sm:size={24}
          className={iconColor || "text-foreground"}
        />
      </div>
      <h3 className="text-sm sm:text-base font-medium text-muted-foreground mb-1">
        {title}
      </h3>
      <p
        className={`text-2xl sm:text-3xl font-bold ${
          countColor || "text-foreground"
        }`}
      >
        {count}
      </p>
      {trend && (
        <p className={`text-xs mt-1 ${trendColor || "text-muted-foreground"}`}>
          {trend}
        </p>
      )}
    </motion.div>
  );
};

export default StatusCard;
