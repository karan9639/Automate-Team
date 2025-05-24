import { Card } from "../../components/ui/card";

const TaskDistributionChart = ({ data }) => {
  const total = Object.values(data).reduce((sum, count) => sum + count, 0);

  // Define colors for each status
  const statusColors = {
    "To Do": "#e5e7eb", // gray-200
    "In Progress": "#93c5fd", // blue-300
    Done: "#86efac", // green-300
    Overdue: "#fca5a5", // red-300
  };

  // Calculate percentages
  const chartData = Object.entries(data).map(([status, count]) => ({
    status,
    count,
    percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    color: statusColors[status] || "#e5e7eb",
  }));

  return (
    <Card className="p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Task Distribution
      </h3>

      {total === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No tasks available</p>
        </div>
      ) : (
        <>
          {/* Simple CSS-based chart */}
          <div className="h-8 w-full rounded-full overflow-hidden bg-gray-100 mb-6">
            {chartData.map((item, index) => (
              <div
                key={item.status}
                className="h-full float-left"
                style={{
                  width: `${item.percentage}%`,
                  backgroundColor: item.color,
                }}
                title={`${item.status}: ${item.count} (${item.percentage}%)`}
              />
            ))}
          </div>

          {/* Legend */}
          <div className="space-y-2">
            {chartData.map((item) => (
              <div
                key={item.status}
                className="flex items-center justify-between"
              >
                <div className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-gray-700">{item.status}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm font-medium">{item.count}</span>
                  <span className="text-xs text-gray-500 ml-1">
                    ({item.percentage}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
};

export default TaskDistributionChart;
