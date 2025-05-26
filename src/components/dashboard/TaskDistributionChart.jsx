import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";

const TaskDistributionChart = ({ tasks = [] }) => {
  // Calculate task distribution by status
  const statusCounts = {
    "To Do": tasks.filter((task) => task.status === "To Do").length,
    "In Progress": tasks.filter((task) => task.status === "In Progress").length,
    Completed: tasks.filter(
      (task) => task.status === "Completed" || task.status === "Done"
    ).length,
    Overdue: tasks.filter(
      (task) =>
        task.status !== "Completed" &&
        task.status !== "Done" &&
        new Date(task.dueDate) < new Date()
    ).length,
  };

  const total = tasks.length;

  // Calculate percentages
  const percentages = {
    "To Do": total > 0 ? Math.round((statusCounts["To Do"] / total) * 100) : 0,
    "In Progress":
      total > 0 ? Math.round((statusCounts["In Progress"] / total) * 100) : 0,
    Completed:
      total > 0 ? Math.round((statusCounts.Completed / total) * 100) : 0,
    Overdue: total > 0 ? Math.round((statusCounts.Overdue / total) * 100) : 0,
  };

  // Status colors
  const colors = {
    "To Do": "bg-blue-500",
    "In Progress": "bg-yellow-500",
    Completed: "bg-green-500",
    Overdue: "bg-red-500",
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Task Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        {total > 0 ? (
          <>
            <div className="mb-4">
              <div className="flex h-4 rounded-full overflow-hidden">
                {Object.entries(percentages).map(
                  ([status, percentage]) =>
                    percentage > 0 && (
                      <div
                        key={status}
                        className={colors[status]}
                        style={{ width: `${percentage}%` }}
                        title={`${status}: ${percentage}%`}
                      />
                    )
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {Object.entries(statusCounts).map(([status, count]) => (
                <div key={status} className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <div
                      className={`h-3 w-3 ${colors[status]} rounded-full`}
                    ></div>
                    <span className="text-sm font-medium">{status}</span>
                  </div>
                  <p className="text-2xl font-bold mt-1">{count}</p>
                  <p className="text-xs text-gray-500">
                    {percentages[status]}%
                  </p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="h-[200px] flex items-center justify-center">
            <p className="text-gray-500">No task data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TaskDistributionChart;
