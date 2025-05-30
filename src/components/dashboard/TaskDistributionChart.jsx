"use client";

import PropTypes from "prop-types";
import { useState } from "react";

const TaskDistributionChart = ({ tasks = [] }) => {
  const [hoveredSegment, setHoveredSegment] = useState(null);

  const taskCounts = {
    "In Progress": tasks.filter((task) => task.status === "In Progress").length,
    Completed: tasks.filter(
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

  const totalTasks = Object.values(taskCounts).reduce(
    (sum, count) => sum + count,
    0
  );

  const statusColors = {
    "In Progress": "#3b82f6", // blue-500
    Completed: "#10b981", // emerald-500
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

  const segments = Object.entries(taskCounts)
    .filter(([, count]) => count > 0)
    .map(([status, count]) => ({
      status,
      count,
      percentage: (count / totalTasks) * 100,
      angle: (count / totalTasks) * 360,
      color: statusColors[status],
    }));

  const createPieSegment = (
    startAngle,
    endAngle,
    radius = 80,
    innerRadius = 25
  ) => {
    const centerX = 100;
    const centerY = 100;
    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (endAngle - 90) * (Math.PI / 180);

    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);

    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

    const x3 = centerX + innerRadius * Math.cos(endRad);
    const y3 = centerY + innerRadius * Math.sin(endRad);
    const x4 = centerX + innerRadius * Math.cos(startRad);
    const y4 = centerY + innerRadius * Math.sin(startRad);

    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4} Z`;
  };

  let currentAngle = 0;

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 h-full w-full">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Task Distribution
      </h3>

      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Pie Chart */}
        <div className="relative w-full md:w-1/2 flex justify-center">
          <svg
            width="200"
            height="200"
            viewBox="0 0 200 200"
            className="transform -rotate-90"
          >
            {segments.map((segment) => {
              const path = createPieSegment(
                currentAngle,
                currentAngle + segment.angle,
                80,
                25
              );
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
                        ? "opacity-80 scale-[1.02]"
                        : ""
                    }`}
                    onMouseEnter={() => setHoveredSegment(segment.status)}
                    onMouseLeave={() => setHoveredSegment(null)}
                  />
                </g>
              );
            })}
          </svg>

          {/* Hover Tooltip */}
          {hoveredSegment && (
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full bg-gray-900 text-white px-2 py-1 rounded text-sm whitespace-nowrap z-10">
              {hoveredSegment}: {taskCounts[hoveredSegment]} (
              {Math.round((taskCounts[hoveredSegment] / totalTasks) * 100)}%)
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full md:w-1/2">
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
