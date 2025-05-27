import PropTypes from "prop-types";

/**
 * Component to display task distribution by status
 */
const TaskDistributionChart = ({ tasks = [] }) => {
  // Calculate task counts by status
  const taskCounts = {
    Pending: tasks.filter((task) => task.status === "Pending").length,
    "In Progress": tasks.filter((task) => task.status === "In Progress").length,
    Completed: tasks.filter(
      (task) => task.status === "Completed" || task.status === "Done"
    ).length,
    Overdue: tasks.filter((task) => {
      const dueDate = new Date(task.dueDate);
      const today = new Date();
      return (
        task.status !== "Completed" && task.status !== "Done" && dueDate < today
      );
    }).length,
  };

  // Calculate total tasks
  const totalTasks = Object.values(taskCounts).reduce(
    (sum, count) => sum + count,
    0
  );

  // Calculate percentages
  const getPercentage = (count) => {
    if (totalTasks === 0) return 0;
    return Math.round((count / totalTasks) * 100);
  };

  // Status colors
  const statusColors = {
    Pending: "bg-yellow-500",
    "In Progress": "bg-blue-500",
    Completed: "bg-green-500",
    Overdue: "bg-red-500",
  };

  if (totalTasks === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Task Distribution
        </h3>
        <div className="flex items-center justify-center h-40">
          <p className="text-gray-500 dark:text-gray-400">
            No task data available
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Task Distribution
      </h3>

      {/* Stacked bar chart */}
      <div className="h-8 flex rounded-full overflow-hidden mb-6">
        {Object.entries(taskCounts).map(([status, count]) => {
          const percentage = getPercentage(count);
          return percentage > 0 ? (
            <div
              key={status}
              className={`${statusColors[status]} relative group`}
              style={{ width: `${percentage}%` }}
            >
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {status}: {count} ({percentage}%)
              </div>
            </div>
          ) : null;
        })}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {Object.entries(taskCounts).map(([status, count]) => (
          <div key={status} className="flex items-center">
            <div
              className={`w-3 h-3 rounded-full ${statusColors[status]} mr-2`}
            ></div>
            <div className="text-sm">
              <span className="text-gray-700 dark:text-gray-300">{status}</span>
              <span className="text-gray-500 dark:text-gray-400 ml-1">
                ({count}, {getPercentage(count)}%)
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

TaskDistributionChart.propTypes = {
  tasks: PropTypes.array,
};

export default TaskDistributionChart;
