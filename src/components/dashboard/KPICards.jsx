"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card"; // Changed import path
import { CheckCircle, Clock, AlertCircle, List } from "lucide-react";
import { totalTaskCounting } from "@/api/dashboardApi"; // Assuming this path

const KPICards = ({ kpis }) => {
  const [taskStats, setTaskStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTaskStats = async () => {
      try {
        setLoading(true);
        const response = await totalTaskCounting();
        console.log("📊 Dashboard task stats API response:", response.data);
        // Handle potential nesting: response.data.data or response.data
        setTaskStats(response.data?.data || response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching dashboard task statistics:", err);
        setError("Failed to load task statistics. Displaying fallback data.");
        setTaskStats(null); // Ensure fallback to props if API fails
      } finally {
        setLoading(false);
      }
    };

    fetchTaskStats();
  }, []);

  const prepareCardData = () => {
    if (taskStats) {
      const createdByMe = taskStats.tasksCreatedByMe || {
        counts: {},
        totalCount: 0,
      };
      const assignedToMe = taskStats.tasksAssignedToMe || {
        counts: {},
        totalCount: 0,
      };

      const getStatusCount = (counts, statusNames) => {
        return statusNames.reduce(
          (total, name) => total + (counts[name] || 0),
          0
        );
      };

      const pendingTasks =
        getStatusCount(createdByMe.counts, ["Pending", "pending"]) +
        getStatusCount(assignedToMe.counts, ["Pending", "pending"]);

      const completedTasks =
        getStatusCount(createdByMe.counts, ["Completed", "completed"]) +
        getStatusCount(assignedToMe.counts, ["Completed", "completed"]);

      const inProgressTasks =
        getStatusCount(createdByMe.counts, [
          "In Progress",
          "in progress",
          "InProgress",
          "in_progress",
        ]) +
        getStatusCount(assignedToMe.counts, [
          "In Progress",
          "in progress",
          "InProgress",
          "in_progress",
        ]);

      const overdueTasks =
        getStatusCount(createdByMe.counts, ["Overdue", "overdue"]) +
        getStatusCount(assignedToMe.counts, ["Overdue", "overdue"]);

      const totalTasks = createdByMe.totalCount + assignedToMe.totalCount;

      console.log("📊 Processed API task data:", {
        createdByMe,
        assignedToMe,
        totals: {
          totalTasks,
          pendingTasks,
          completedTasks,
          inProgressTasks,
          overdueTasks,
        },
      });

      return [
        {
          title: "Total Tasks",
          value: totalTasks,
          icon: <List className="h-5 w-5 text-violet-600" />,
          description: "Total number of tasks",
          colorClasses: "bg-violet-50 text-violet-600 border-violet-200",
          valueColor: "text-violet-600",
          iconBgColor: "bg-violet-100", // Specific for icon background
          borderColor: "border-violet-200",
          breakdown: {
            assignedToMe: assignedToMe.totalCount,
            createdByMe: createdByMe.totalCount,
          },
        },
        {
          title: "Completed",
          value: completedTasks,
          percentage: totalTasks
            ? Math.round((completedTasks / totalTasks) * 100)
            : 0,
          icon: <CheckCircle className="h-5 w-5 text-green-600" />,
          description: "Tasks marked as done",
          colorClasses: "bg-green-50 text-green-600 border-green-200",
          valueColor: "text-green-600",
          percentageColor: "text-green-400",
          iconBgColor: "bg-green-100",
          borderColor: "border-green-200",
          breakdown: {
            assignedToMe: getStatusCount(assignedToMe.counts, [
              "Completed",
              "completed",
            ]),
            createdByMe: getStatusCount(createdByMe.counts, [
              "Completed",
              "completed",
            ]),
          },
        },
        {
          title: "In Progress",
          value: inProgressTasks,
          percentage: totalTasks
            ? Math.round((inProgressTasks / totalTasks) * 100)
            : 0,
          icon: <Clock className="h-5 w-5 text-yellow-600" />,
          description: "Tasks currently in progress",
          colorClasses: "bg-yellow-50 text-yellow-600 border-yellow-200",
          valueColor: "text-yellow-600",
          percentageColor: "text-yellow-400",
          iconBgColor: "bg-yellow-100",
          borderColor: "border-yellow-200",
          breakdown: {
            assignedToMe: getStatusCount(assignedToMe.counts, [
              "In Progress",
              "in progress",
              "InProgress",
              "in progress",
            ]),
            createdByMe: getStatusCount(createdByMe.counts, [
              "In Progress",
              "in progress",
              "InProgress",
              "in progress",
            ]),
          },
        },
        {
          title: "Pending",
          value: pendingTasks,
          percentage: totalTasks
            ? Math.round((pendingTasks / totalTasks) * 100)
            : 0,
          icon: <AlertCircle className="h-5 w-5 text-orange-600" />,
          description: "Tasks awaiting action",
          colorClasses: "bg-orange-50 text-orange-600 border-orange-200",
          valueColor: "text-orange-600",
          percentageColor: "text-orange-400",
          iconBgColor: "bg-orange-100",
          borderColor: "border-orange-200",
          breakdown: {
            assignedToMe: getStatusCount(assignedToMe.counts, [
              "Pending",
              "pending",
            ]),
            createdByMe: getStatusCount(createdByMe.counts, [
              "Pending",
              "pending",
            ]),
          },
        },
        {
          title: "Overdue",
          value: overdueTasks,
          percentage: totalTasks
            ? Math.round((overdueTasks / totalTasks) * 100)
            : 0,
          icon: <AlertCircle className="h-5 w-5 text-red-600" />,
          description: "Tasks past due date",
          colorClasses: "bg-red-50 text-red-600 border-red-200",
          valueColor: "text-red-600",
          percentageColor: "text-red-400",
          iconBgColor: "bg-red-100",
          borderColor: "border-red-200",
          breakdown: {
            assignedToMe: getStatusCount(assignedToMe.counts, [
              "Overdue",
              "overdue",
            ]),
            createdByMe: getStatusCount(createdByMe.counts, [
              "Overdue",
              "overdue",
            ]),
          },
        },
      ];
    }

    // Fallback to props data if no API data or if kpis prop is explicitly provided and taskStats is null
    console.log("📊 Using fallback props data for KPIs:", kpis);
    return [
      {
        title: "Total Tasks",
        value: kpis.totalTasks,
        icon: <List className="h-5 w-5 text-violet-600" />,
        description: "Total number of tasks",
        colorClasses: "bg-violet-50 text-violet-600 border-violet-200",
        valueColor: "text-violet-600",
        iconBgColor: "bg-violet-100",
        borderColor: "border-violet-200",
      },
      {
        title: "Completed",
        value: kpis.completedTasks,
        percentage: kpis.totalTasks
          ? Math.round((kpis.completedTasks / kpis.totalTasks) * 100)
          : 0,
        icon: <CheckCircle className="h-5 w-5 text-green-600" />,
        description: "Tasks marked as done",
        colorClasses: "bg-green-50 text-green-600 border-green-200",
        valueColor: "text-green-600",
        percentageColor: "text-green-400",
        iconBgColor: "bg-green-100",
        borderColor: "border-green-200",
      },
      {
        title: "In Progress",
        value: kpis.inProgressTasks,
        percentage: kpis.totalTasks
          ? Math.round((kpis.inProgressTasks / kpis.totalTasks) * 100)
          : 0,
        icon: <Clock className="h-5 w-5 text-yellow-600" />,
        description: "Tasks currently in progress",
        colorClasses: "bg-yellow-50 text-yellow-600 border-yellow-200",
        valueColor: "text-yellow-600",
        percentageColor: "text-yellow-400",
        iconBgColor: "bg-yellow-100",
        borderColor: "border-yellow-200",
      },
      {
        title: "Pending",
        value: kpis.pendingTasks || 0,
        percentage: kpis.totalTasks
          ? Math.round(((kpis.pendingTasks || 0) / kpis.totalTasks) * 100)
          : 0,
        icon: <AlertCircle className="h-5 w-5 text-orange-600" />,
        description: "Tasks awaiting action",
        colorClasses: "bg-orange-50 text-orange-600 border-orange-200",
        valueColor: "text-orange-600",
        percentageColor: "text-orange-400",
        iconBgColor: "bg-orange-100",
        borderColor: "border-orange-200",
      },
      {
        title: "Overdue",
        value: kpis.overdueTasks,
        percentage: kpis.totalTasks
          ? Math.round((kpis.overdueTasks / kpis.totalTasks) * 100)
          : 0,
        icon: <AlertCircle className="h-5 w-5 text-red-600" />,
        description: "Tasks past due date",
        colorClasses: "bg-red-50 text-red-600 border-red-200",
        valueColor: "text-red-600",
        percentageColor: "text-red-400",
        iconBgColor: "bg-red-100",
        borderColor: "border-red-200",
      },
    ];
  };

  const cardsData = prepareCardData();

  return (
    // Updated responsive grid classes
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4">
      {loading ? (
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
                    <div className="h-5 w-5"></div> {/* Placeholder for icon */}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
      ) : error ? (
        <div className="col-span-full">
          {" "}
          {/* Ensure error message spans all columns */}
          <Card className="border border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center text-red-600">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                <p className="flex-grow">{error}</p>
                <button
                  onClick={() => window.location.reload()} // Consider a more React-way to refetch if possible
                  className="ml-auto text-sm bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded-md font-medium"
                >
                  Retry
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        cardsData.map((card, index) => (
          <Card
            key={index}
            className={`border pt-3 ${card.borderColor} ${
              card.colorClasses.split(" ")[0]
            }`}
          >
            {" "}
            {/* Use specific border and bg color */}
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  {" "}
                  {/* Allow text content to take available space */}
                  <p className="text-sm font-medium text-gray-500">
                    {card.title}
                  </p>
                  <div className="flex items-baseline mt-1">
                    <h3 className={`text-2xl font-bold ${card.valueColor}`}>
                      {card.value}
                    </h3>
                    {card.percentage !== undefined && (
                      <span
                        className={`ml-2 text-sm font-semibold ${
                          card.percentageColor || "text-gray-500"
                        }`}
                      >
                        {card.percentage}%
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {card.description}
                  </p>
                  {card.breakdown && (
                    <div className="mt-3 pt-2 border-t border-gray-200">
                      {" "}
                      {/* Adjusted border color */}
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-xs mt-2">
                        <div className="flex items-center gap-1">
                          <span className="text-gray-500">Assigned:</span>
                          <span className={`font-medium ${card.valueColor}`}>
                            {card.breakdown.assignedToMe}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-gray-500">Created:</span>
                          <span className={`font-medium ${card.valueColor}`}>
                            {card.breakdown.createdByMe}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className={`p-2.5 rounded-full ${card.iconBgColor} ml-2`}>
                  {" "}
                  {/* Ensure icon has its own bg and some margin */}
                  {card.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

// Default props for fallback
KPICards.defaultProps = {
  kpis: {
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    pendingTasks: 0,
    overdueTasks: 0,
  },
};

export default KPICards;
