import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { formatDistanceToNow } from "date-fns";

const UserActivityFeed = ({ activities }) => {
  // Function to get the appropriate icon color based on action
  const getActionColor = (action) => {
    if (action.includes("created")) return "text-green-500";
    if (action.includes("completed") || action.includes("done"))
      return "text-blue-500";
    if (action.includes("updated") || action.includes("edited"))
      return "text-yellow-500";
    if (action.includes("deleted")) return "text-red-500";
    if (action.includes("commented")) return "text-purple-500";
    return "text-gray-500";
  };

  // Function to format the timestamp
  const formatTimestamp = (timestamp) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      return "Invalid date";
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length > 0 ? (
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start space-x-3 pb-3 border-b border-gray-100"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${getActionColor(
                    activity.action
                  )} bg-opacity-10`}
                >
                  <span className="text-xs font-bold">
                    {activity.user.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    <span className="font-semibold">{activity.user}</span>{" "}
                    <span className={getActionColor(activity.action)}>
                      {activity.action}
                    </span>{" "}
                    {activity.task && (
                      <span className="font-medium">"{activity.task}"</span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatTimestamp(activity.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="text-gray-500">No recent activity</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserActivityFeed;
