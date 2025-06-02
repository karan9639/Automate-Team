"use client"

import PropTypes from "prop-types"
import { useState, useEffect } from "react"
import { totalTaskCounting } from "@/api/dashboardApi"

/**
 * Component to display task distribution by status as a pie chart
 */
const TaskDistributionChart = ({ tasks = [] }) => {
  const [hoveredSegment, setHoveredSegment] = useState(null)
  const [taskStats, setTaskStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchTaskStats = async () => {
      try {
        setLoading(true)
        const response = await totalTaskCounting()
        console.log("📊 Task Distribution Chart - API response:", response.data)
        setTaskStats(response.data.data || response.data)
        setError(null)
      } catch (err) {
        console.error("Error fetching task distribution data:", err)
        setError("Failed to load task distribution")
        // Use fallback data if API fails
        setTaskStats(null)
      } finally {
        setLoading(false)
      }
    }

    fetchTaskStats()
  }, [])

  // Process task data from API or use fallback data
  const processTaskData = () => {
    // If we have API data, use it
    if (taskStats) {
      const createdByMe = taskStats.tasksCreatedByMe || { counts: {}, totalCount: 0 }
      const assignedToMe = taskStats.tasksAssignedToMe || { counts: {}, totalCount: 0 }

      // Helper function to get status counts across different possible field names
      const getStatusCount = (counts, statusNames) => {
        return statusNames.reduce((total, name) => total + (counts[name] || 0), 0)
      }

      // Calculate task counts by status
      const completedTasks =
        getStatusCount(createdByMe.counts, ["Completed", "completed", "Done", "done"]) +
        getStatusCount(assignedToMe.counts, ["Completed", "completed", "Done", "done"])

      const inProgressTasks =
        getStatusCount(createdByMe.counts, ["In Progress", "in progress", "InProgress", "in_progress"]) +
        getStatusCount(assignedToMe.counts, ["In Progress", "in progress", "InProgress", "in_progress"])

      const pendingTasks =
        getStatusCount(createdByMe.counts, ["Pending", "pending", "To Do", "to-do", "todo"]) +
        getStatusCount(assignedToMe.counts, ["Pending", "pending", "To Do", "to-do", "todo"])

      const overdueTasks =
        getStatusCount(createdByMe.counts, ["Overdue", "overdue"]) +
        getStatusCount(assignedToMe.counts, ["Overdue", "overdue"])

      // Log the extracted data for debugging
      console.log("📊 Task Distribution - Processed data:", {
        completedTasks,
        inProgressTasks,
        pendingTasks,
        overdueTasks,
        rawCreatedByMe: createdByMe.counts,
        rawAssignedToMe: assignedToMe.counts,
      })

      return {
        Completed: completedTasks,
        "In Progress": inProgressTasks,
        Pending: pendingTasks,
        Overdue: overdueTasks,
      }
    }

    // Fallback to the data shown in the KPI cards from the screenshot
    return {
      Completed: 4, // 40%
      "In Progress": 2, // 20%
      Pending: 3, // 30%
      Overdue: 1, // 10%
    }
  }

  const taskCounts = processTaskData()

  // Calculate total tasks
  const totalTasks = Object.values(taskCounts).reduce((sum, count) => sum + count, 0)

  // Status colors - matching the KPICards colors
  const statusColors = {
    Completed: "#16a34a", // green-600
    "In Progress": "#ca8a04", // yellow-600
    Pending: "#ea580c", // orange-600
    Overdue: "#dc2626", // red-600
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 h-full w-full">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Distribution</h3>
        <div className="flex items-center justify-center h-48">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-violet-500 rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 h-full w-full">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Distribution</h3>
        <div className="flex items-center justify-center h-48 text-red-500">
          <p>{error}</p>
        </div>
      </div>
    )
  }

  if (totalTasks === 0) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 h-full w-full">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Distribution</h3>
        <div className="flex items-center justify-center h-48">
          <p className="text-gray-500">No task data available</p>
        </div>
      </div>
    )
  }

  // Calculate angles for pie chart
  const segments = Object.entries(taskCounts)
    .filter(([, count]) => count > 0) // Only include segments with count > 0
    .map(([status, count]) => ({
      status,
      count,
      percentage: totalTasks > 0 ? (count / totalTasks) * 100 : 0,
      angle: totalTasks > 0 ? (count / totalTasks) * 360 : 0,
      color: statusColors[status],
    }))

  const createPieSegment = (startAngle, endAngle, radius = 80, innerRadius = 25) => {
    const centerX = 100
    const centerY = 100

    const startAngleRad = (startAngle - 90) * (Math.PI / 180)
    const endAngleRad = (endAngle - 90) * (Math.PI / 180)

    const x1 = centerX + radius * Math.cos(startAngleRad)
    const y1 = centerY + radius * Math.sin(startAngleRad)
    const x2 = centerX + radius * Math.cos(endAngleRad)
    const y2 = centerY + radius * Math.sin(endAngleRad)

    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0

    const x3 = centerX + innerRadius * Math.cos(endAngleRad)
    const y3 = centerY + innerRadius * Math.sin(endAngleRad)
    const x4 = centerX + innerRadius * Math.cos(startAngleRad)
    const y4 = centerY + innerRadius * Math.sin(startAngleRad)

    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4} Z`
  }

  let currentAngle = 0

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 h-full w-full">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Distribution</h3>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        {/* Pie Chart Section */}
        <div className="relative w-full md:w-1/2 flex justify-center items-center py-4 md:py-0">
          <svg
            width="200"
            height="200"
            viewBox="0 0 200 200"
            className="transform -rotate-90" // SVG itself maintains fixed size based on its attributes
          >
            {segments.map((segment) => {
              const path = createPieSegment(currentAngle, currentAngle + segment.angle)
              // const segmentAngle = currentAngle; // This variable was unused
              currentAngle += segment.angle

              return (
                <g key={segment.status}>
                  <path
                    d={path}
                    fill={segment.color}
                    stroke="white"
                    strokeWidth="2"
                    className={`transition-all duration-200 cursor-pointer ${
                      hoveredSegment === segment.status ? "opacity-80 scale-[1.03]" : ""
                    }`}
                    onMouseEnter={() => setHoveredSegment(segment.status)}
                    onMouseLeave={() => setHoveredSegment(null)}
                  />
                </g>
              )
            })}
          </svg>

          {/* Tooltip */}
          {hoveredSegment && taskCounts[hoveredSegment] !== undefined && (
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full bg-gray-900 text-white px-2 py-1 rounded text-sm whitespace-nowrap z-10">
              {hoveredSegment}: {taskCounts[hoveredSegment]} (
              {totalTasks > 0 ? Math.round((taskCounts[hoveredSegment] / totalTasks) * 100) : 0}
              %)
            </div>
          )}
        </div>

        {/* Legend Section */}
        <div className="w-full md:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
          {segments.map((segment) => (
            <div
              key={segment.status}
              className={`flex items-center p-2 rounded transition-colors duration-200 cursor-pointer ${
                hoveredSegment === segment.status ? "bg-gray-50" : ""
              }`}
              onMouseEnter={() => setHoveredSegment(segment.status)}
              onMouseLeave={() => setHoveredSegment(null)}
            >
              <div className="w-3 h-3 rounded-full mr-2 flex-shrink-0" style={{ backgroundColor: segment.color }} />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-gray-900 truncate">{segment.status}</div>
                <div className="text-xs text-gray-500">
                  {segment.count} ({totalTasks > 0 ? Math.round(segment.percentage) : 0}%)
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

TaskDistributionChart.propTypes = {
  tasks: PropTypes.array,
}

export default TaskDistributionChart
