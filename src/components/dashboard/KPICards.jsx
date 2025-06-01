"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "../../components/ui/card"
import { CheckCircle, Clock, AlertCircle, List } from "lucide-react"
import { totalTaskCounting } from "@/api/dashboardApi"

const KPICards = ({ kpis }) => {
  const [taskStats, setTaskStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchTaskStats = async () => {
      try {
        setLoading(true)
        const response = await totalTaskCounting()
        console.log("📊 Dashboard task stats API response:", response.data)
        setTaskStats(response.data.data || response.data)
        setError(null)
      } catch (err) {
        console.error("Error fetching dashboard task statistics:", err)
        setError("Failed to load task statistics")
        // Use fallback data from props if API fails
        setTaskStats(null)
      } finally {
        setLoading(false)
      }
    }

    fetchTaskStats()
  }, [])

  // Prepare card data based on API response or fallback to props
  const prepareCardData = () => {
    // If we have API data, use it
    if (taskStats) {
      // Extract data from the API response structure
      const createdByMe = taskStats.tasksCreatedByMe || { counts: {}, totalCount: 0 }
      const assignedToMe = taskStats.tasksAssignedToMe || { counts: {}, totalCount: 0 }

      // Calculate totals for each status - handle multiple possible field names
      const getStatusCount = (counts, statusNames) => {
        return statusNames.reduce((total, name) => total + (counts[name] || 0), 0)
      }

      const pendingTasks =
        getStatusCount(createdByMe.counts, ["Pending", "pending"]) +
        getStatusCount(assignedToMe.counts, ["Pending", "pending"])

      const completedTasks =
        getStatusCount(createdByMe.counts, ["Completed", "completed"]) +
        getStatusCount(assignedToMe.counts, ["Completed", "completed"])

      const inProgressTasks =
        getStatusCount(createdByMe.counts, ["In Progress", "in-progress", "InProgress", "in_progress"]) +
        getStatusCount(assignedToMe.counts, ["In Progress", "in-progress", "InProgress", "in_progress"])

      const overdueTasks =
        getStatusCount(createdByMe.counts, ["Overdue", "overdue"]) +
        getStatusCount(assignedToMe.counts, ["Overdue", "overdue"])

      // Add detailed logging to see what status fields are actually available
      console.log("📊 Available status fields in createdByMe:", Object.keys(createdByMe.counts || {}))
      console.log("📊 Available status fields in assignedToMe:", Object.keys(assignedToMe.counts || {}))
      console.log("📊 Raw counts - createdByMe:", createdByMe.counts)
      console.log("📊 Raw counts - assignedToMe:", assignedToMe.counts)

      // Calculate total tasks
      const totalTasks = createdByMe.totalCount + assignedToMe.totalCount

      console.log("📊 Processed task data:", {
        createdByMe,
        assignedToMe,
        totals: { totalTasks, pendingTasks, completedTasks, inProgressTasks, overdueTasks },
      })

      return [
        {
          title: "Total Tasks",
          value: totalTasks,
          icon: <List className="h-5 w-5 text-violet-600" />,
          description: "Total number of tasks",
          color: "bg-violet-50 text-violet-600 border-violet-200",
          valueColor: "text-violet-600",
          percentageColor: "text-violet-400",
          breakdown: {
            assignedToMe: assignedToMe.totalCount,
            createdByMe: createdByMe.totalCount,
          },
        },
        {
          title: "Completed",
          value: completedTasks,
          percentage: totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0,
          icon: <CheckCircle className="h-5 w-5 text-green-600" />,
          description: "Tasks marked as done",
          color: "bg-green-50 text-green-600 border-green-200",
          valueColor: "text-green-600",
          percentageColor: "text-green-400",
          breakdown: {
            assignedToMe: getStatusCount(assignedToMe.counts, ["Completed", "completed"]),
            createdByMe: getStatusCount(createdByMe.counts, ["Completed", "completed"]),
          },
        },
        {
          title: "In Progress",
          value: inProgressTasks,
          percentage: totalTasks ? Math.round((inProgressTasks / totalTasks) * 100) : 0,
          icon: <Clock className="h-5 w-5 text-yellow-600" />,
          description: "Tasks currently in progress",
          color: "bg-yellow-50 text-yellow-600 border-yellow-200",
          valueColor: "text-yellow-600",
          percentageColor: "text-yellow-400",
          breakdown: {
            assignedToMe: getStatusCount(assignedToMe.counts, [
              "In Progress",
              "in-progress",
              "InProgress",
              "in_progress",
            ]),
            createdByMe: getStatusCount(createdByMe.counts, [
              "In Progress",
              "in-progress",
              "InProgress",
              "in_progress",
            ]),
          },
        },
        {
          title: "Pending",
          value: pendingTasks,
          percentage: totalTasks ? Math.round((pendingTasks / totalTasks) * 100) : 0,
          icon: <AlertCircle className="h-5 w-5 text-orange-600" />,
          description: "Tasks awaiting action",
          color: "bg-orange-50 text-orange-600 border-orange-200",
          valueColor: "text-orange-600",
          percentageColor: "text-orange-400",
          breakdown: {
            assignedToMe: getStatusCount(assignedToMe.counts, ["Pending", "pending"]),
            createdByMe: getStatusCount(createdByMe.counts, ["Pending", "pending"]),
          },
        },
        {
          title: "Overdue",
          value: overdueTasks,
          percentage: totalTasks ? Math.round((overdueTasks / totalTasks) * 100) : 0,
          icon: <AlertCircle className="h-5 w-5 text-red-600" />,
          description: "Tasks past due date",
          color: "bg-red-50 text-red-600 border-red-200",
          valueColor: "text-red-600",
          percentageColor: "text-red-400",
          breakdown: {
            assignedToMe: getStatusCount(assignedToMe.counts, ["Overdue", "overdue"]),
            createdByMe: getStatusCount(createdByMe.counts, ["Overdue", "overdue"]),
          },
        },
      ]
    }

    // Fallback to props data if no API data
    return [
      {
        title: "Total Tasks",
        value: kpis.totalTasks,
        icon: <List className="h-5 w-5 text-violet-600" />,
        description: "Total number of tasks",
        color: "bg-violet-50 text-violet-600 border-violet-200",
        valueColor: "text-violet-600",
        percentageColor: "text-violet-400",
      },
      {
        title: "Completed",
        value: kpis.completedTasks,
        percentage: kpis.totalTasks ? Math.round((kpis.completedTasks / kpis.totalTasks) * 100) : 0,
        icon: <CheckCircle className="h-5 w-5 text-green-600" />,
        description: "Tasks marked as done",
        color: "bg-green-50 text-green-600 border-green-200",
        valueColor: "text-green-600",
        percentageColor: "text-green-400",
      },
      {
        title: "In Progress",
        value: kpis.inProgressTasks,
        percentage: kpis.totalTasks ? Math.round((kpis.inProgressTasks / kpis.totalTasks) * 100) : 0,
        icon: <Clock className="h-5 w-5 text-yellow-600" />,
        description: "Tasks currently in progress",
        color: "bg-yellow-50 text-yellow-600 border-yellow-200",
        valueColor: "text-yellow-600",
        percentageColor: "text-yellow-400",
      },
      {
        title: "Pending",
        value: kpis.pendingTasks || 0,
        percentage: kpis.totalTasks ? Math.round(((kpis.pendingTasks || 0) / kpis.totalTasks) * 100) : 0,
        icon: <AlertCircle className="h-5 w-5 text-orange-600" />,
        description: "Tasks awaiting action",
        color: "bg-orange-50 text-orange-600 border-orange-200",
        valueColor: "text-orange-600",
        percentageColor: "text-orange-400",
      },
      {
        title: "Overdue",
        value: kpis.overdueTasks,
        percentage: kpis.totalTasks ? Math.round((kpis.overdueTasks / kpis.totalTasks) * 100) : 0,
        icon: <AlertCircle className="h-5 w-5 text-red-600" />,
        description: "Tasks past due date",
        color: "bg-red-50 text-red-600 border-red-200",
        valueColor: "text-red-600",
        percentageColor: "text-red-400",
      },
    ]
  }

  const cards = prepareCardData()

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {loading ? (
        // Show skeleton loaders while loading
        Array(5)
          .fill(0)
          .map((_, index) => (
            <Card key={index} className="border border-gray-200">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="w-full">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded animate-pulse w-1/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3 mt-1"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2 mt-2"></div>
                  </div>
                  <div className="p-2 rounded-full bg-gray-100 animate-pulse">
                    <div className="h-5 w-5"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
      ) : error ? (
        // Show error state
        <div className="col-span-full">
          <Card className="border border-red-200">
            <CardContent className="p-4">
              <div className="flex items-center text-red-600">
                <AlertCircle className="h-5 w-5 mr-2" />
                <p>{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="ml-auto text-sm bg-red-50 hover:bg-red-100 px-2 py-1 rounded"
                >
                  Retry
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        // Show actual cards
        cards.map((card, index) => (
          <Card key={index} className={`border ${card.color.includes("border") ? card.color.split(" ").pop() : ""}`}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">{card.title}</p>
                  <div className="flex items-baseline mt-1">
                    <h3 className={`text-2xl font-bold ${card.valueColor}`}>{card.value}</h3>
                    {card.percentage !== undefined && (
                      <span className={`ml-2 text-sm ${card.percentageColor || "text-gray-500"}`}>
                        {card.percentage}%
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{card.description}</p>

                  {/* Breakdown section for assigned vs my tasks */}
                  {card.breakdown && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <div className="grid grid-cols-1 gap-2 text-xs">
                        <div>
                          <span className="text-gray-500">My Tasks:</span>{" "}
                          <span className="font-medium">{card.breakdown.assignedToMe}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Initiated Tasks:</span>{" "}
                          <span className="font-medium">{card.breakdown.createdByMe}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className={`p-2 rounded-full ${card.color}`}>{card.icon}</div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}

export default KPICards
