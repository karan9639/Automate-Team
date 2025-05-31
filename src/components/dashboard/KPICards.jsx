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
        const response = await totalTaskCounting();
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

      // Calculate totals for each status
      const pendingTasks = (createdByMe.counts.Pending || 0) + (assignedToMe.counts.Pending || 0)
      const completedTasks = (createdByMe.counts.Completed || 0) + (assignedToMe.counts.Completed || 0)
      const inProgressTasks =
        (createdByMe.counts["In Progress"] || createdByMe.counts["in-progress"] || 0) +
        (assignedToMe.counts["In Progress"] || assignedToMe.counts["in-progress"] || 0)
      const overdueTasks = (createdByMe.counts.Overdue || 0) + (assignedToMe.counts.Overdue || 0)

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
          icon: <List className="h-5 w-5 text-blue-600" />,
          description: "Total number of tasks",
          color: "bg-blue-50 text-blue-600 border-blue-200",
          breakdown: {
            assigned: assignedToMe.totalCount,
            myTasks: createdByMe.totalCount,
          },
        },
        {
          title: "Completed",
          value: completedTasks,
          percentage: totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0,
          icon: <CheckCircle className="h-5 w-5 text-green-600" />,
          description: "Tasks marked as done",
          color: "bg-green-50 text-green-600 border-green-200",
          breakdown: {
            assigned: assignedToMe.counts.Completed || 0,
            myTasks: createdByMe.counts.Completed || 0,
          },
        },
        {
          title: "In Progress",
          value: inProgressTasks,
          percentage: totalTasks ? Math.round((inProgressTasks / totalTasks) * 100) : 0,
          icon: <Clock className="h-5 w-5 text-yellow-600" />,
          description: "Tasks currently in progress",
          color: "bg-yellow-50 text-yellow-600 border-yellow-200",
          breakdown: {
            assigned: assignedToMe.counts["In Progress"] || assignedToMe.counts["in-progress"] || 0,
            myTasks: createdByMe.counts["In Progress"] || createdByMe.counts["in-progress"] || 0,
          },
        },
        {
          title: "Pending",
          value: pendingTasks,
          percentage: totalTasks ? Math.round((pendingTasks / totalTasks) * 100) : 0,
          icon: <AlertCircle className="h-5 w-5 text-orange-600" />,
          description: "Tasks awaiting action",
          color: "bg-orange-50 text-orange-600 border-orange-200",
          breakdown: {
            assigned: assignedToMe.counts.Pending || 0,
            myTasks: createdByMe.counts.Pending || 0,
          },
        },
        {
          title: "Overdue",
          value: overdueTasks,
          percentage: totalTasks ? Math.round((overdueTasks / totalTasks) * 100) : 0,
          icon: <AlertCircle className="h-5 w-5 text-red-600" />,
          description: "Tasks past due date",
          color: "bg-red-50 text-red-600 border-red-200",
          breakdown: {
            assigned: assignedToMe.counts.Overdue || 0,
            myTasks: createdByMe.counts.Overdue || 0,
          },
        },
      ]
    }

    // Fallback to props data if no API data
    return [
      {
        title: "Total Tasks",
        value: kpis.totalTasks,
        icon: <List className="h-5 w-5 text-blue-600" />,
        description: "Total number of tasks",
        color: "bg-blue-50 text-blue-600 border-blue-200",
      },
      {
        title: "Completed",
        value: kpis.completedTasks,
        percentage: kpis.totalTasks ? Math.round((kpis.completedTasks / kpis.totalTasks) * 100) : 0,
        icon: <CheckCircle className="h-5 w-5 text-green-600" />,
        description: "Tasks marked as done",
        color: "bg-green-50 text-green-600 border-green-200",
      },
      {
        title: "In Progress",
        value: kpis.inProgressTasks,
        percentage: kpis.totalTasks ? Math.round((kpis.inProgressTasks / kpis.totalTasks) * 100) : 0,
        icon: <Clock className="h-5 w-5 text-yellow-600" />,
        description: "Tasks currently in progress",
        color: "bg-yellow-50 text-yellow-600 border-yellow-200",
      },
      {
        title: "Pending",
        value: kpis.pendingTasks || 0,
        percentage: kpis.totalTasks ? Math.round(((kpis.pendingTasks || 0) / kpis.totalTasks) * 100) : 0,
        icon: <AlertCircle className="h-5 w-5 text-orange-600" />,
        description: "Tasks awaiting action",
        color: "bg-orange-50 text-orange-600 border-orange-200",
      },
      {
        title: "Overdue",
        value: kpis.overdueTasks,
        percentage: kpis.totalTasks ? Math.round((kpis.overdueTasks / kpis.totalTasks) * 100) : 0,
        icon: <AlertCircle className="h-5 w-5 text-red-600" />,
        description: "Tasks past due date",
        color: "bg-red-50 text-red-600 border-red-200",
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
                    <h3 className="text-2xl font-bold">{card.value}</h3>
                    {card.percentage !== undefined && (
                      <span className="ml-2 text-sm text-gray-500">{card.percentage}%</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{card.description}</p>

                  {/* Breakdown section for assigned vs my tasks */}
                  {card.breakdown && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-500">Assigned:</span>{" "}
                          <span className="font-medium">{card.breakdown.assigned}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">My tasks:</span>{" "}
                          <span className="font-medium">{card.breakdown.myTasks}</span>
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
