"use client";

import PropTypes from "prop-types";
import { useState } from "react";

/**
 * Component to display task distribution by status as a pie chart
 */
const TaskDistributionChart = ({ tasks = [] }) => {
  const [hoveredSegment, setHoveredSegment] = useState(null);

  // Calculate task counts by status
  const taskCounts = {
    "To Do": tasks.filter((task) => task.status === "To Do").length,
    "In Progress": tasks.filter((task) => task.status === "In Progress").length,
    Done: tasks.filter(
      (task) => task.status === "Done" || task.status === "Completed"
    ).length,
    Overdue: tasks.filter((task) => {
      const dueDate = new Date(task.dueDate);
      const today = new Date();
      return (
        task.status !== "Done" && task.status !== "Completed" && dueDate < today
      );
    }).length,
  };

  // Calculate total tasks
  const totalTasks = Object.values(taskCounts).reduce(
    (sum, count) => sum + count,
    0
  );

  // Status colors
  const statusColors = {
    "To Do": "#f59e0b", // amber-500
    "In Progress": "#3b82f6", // blue-500
    Done: "#10b981", // emerald-500
    Overdue: "#ef4444", // red-500
  };

  if (totalTasks === 0) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 h-full">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Task Distribution
        </h3>
        <div className="flex items-center justify-center h-48">
          <p className="text-gray-500">No task data available</p>
        </div>
      </div>
    );
  }

  // Calculate angles for pie chart
  const segments = Object.entries(taskCounts)
    .filter(([, count]) => count > 0)
    .map(([status, count]) => ({
      status,
      count,
      percentage: (count / totalTasks) * 100,
      angle: (count / totalTasks) * 360,
      color: statusColors[status],
    }));

  // Create SVG path for pie segments
  const createPieSegment = (
    startAngle,
    endAngle,
    radius = 80,
    innerRadius = 0
  ) => {
    const centerX = 100;
    const centerY = 100;

    const startAngleRad = (startAngle - 90) * (Math.PI / 180);
    const endAngleRad = (endAngle - 90) * (Math.PI / 180);

    const x1 = centerX + radius * Math.cos(startAngleRad);
    const y1 = centerY + radius * Math.sin(startAngleRad);
    const x2 = centerX + radius * Math.cos(endAngleRad);
    const y2 = centerY + radius * Math.sin(endAngleRad);

    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

    if (innerRadius === 0) {
      return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
    } else {
      const x3 = centerX + innerRadius * Math.cos(endAngleRad);
      const y3 = centerY + innerRadius * Math.sin(endAngleRad);
      const x4 = centerX + innerRadius * Math.cos(startAngleRad);
      const y4 = centerY + innerRadius * Math.sin(startAngleRad);

      return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4} Z`;
    }
  };

  let currentAngle = 0;

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 h-full">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Task Distribution
      </h3>

      <div className="flex flex-col items-center">
        {/* Pie Chart */}
        <div className="relative mb-4">
          <svg
            width="200"
            height="200"
            viewBox="0 0 200 200"
            className="transform -rotate-90"
          >
            {segments.map((segment, index) => {
              const path = createPieSegment(
                currentAngle,
                currentAngle + segment.angle,
                80,
                25
              );
              const segmentAngle = currentAngle;
              currentAngle += segment.angle;

              return (
                <g key={segment.status}>
                  <path
                    d={path}
                    fill={segment.color}
                    stroke="white"
                    strokeWidth="2"
                    className={`transition-all duration-200 cursor-pointer ${
                      hoveredSegment === segment.status
                        ? "opacity-80 transform scale-105"
                        : ""
                    }`}
                    onMouseEnter={() => setHoveredSegment(segment.status)}
                    onMouseLeave={() => setHoveredSegment(null)}
                  />
                </g>
              );
            })}
          </svg>

          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-gray-900">
              {totalTasks}
            </span>
            <span className="text-sm text-gray-500">Total Tasks</span>
          </div>

          {/* Hover tooltip */}
          {hoveredSegment && (
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full bg-gray-900 text-white px-2 py-1 rounded text-sm whitespace-nowrap">
              {hoveredSegment}: {taskCounts[hoveredSegment]} (
              {Math.round((taskCounts[hoveredSegment] / totalTasks) * 100)}%)
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-2 w-full">
          {segments.map((segment) => (
            <div
              key={segment.status}
              className={`flex items-center p-2 rounded transition-colors duration-200 cursor-pointer ${
                hoveredSegment === segment.status ? "bg-gray-50" : ""
              }`}
              onMouseEnter={() => setHoveredSegment(segment.status)}
              onMouseLeave={() => setHoveredSegment(null)}
            >
              <div
                className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                style={{ backgroundColor: segment.color }}
              />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {segment.status}
                </div>
                <div className="text-xs text-gray-500">
                  {segment.count} ({Math.round(segment.percentage)}%)
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

TaskDistributionChart.propTypes = {
  tasks: PropTypes.array,
};

export default TaskDistributionChart;
