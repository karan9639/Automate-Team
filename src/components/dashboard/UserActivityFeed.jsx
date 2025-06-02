import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { Loader2, AlertTriangle } from "lucide-react";

const UserActivityFeed = ({ activities, isLoading, error }) => {
  console.log("UserActivityFeed activities:", activities);
  const getActionColor = (messageType) => {
    if (!messageType) return "text-gray-500";
    switch (messageType) {
      case "task_created":
        return "text-green-500";
      case "comment_added":
        return "text-purple-500";
      case "task_deleted":
        return "text-red-500";
      case "task_edited":
      case "tasks_re-assigned": // API uses "tasks_re-assigned"
      case "task_status_changed": // A possible local one
        return "text-yellow-500";
      // Custom local types
      case "tasks_overdue":
        return "text-red-600";
      // case "dashboard_refreshed":
      //
      default:
        // Fallback for any other messageTypes or local actions not explicitly listed
        if (messageType.includes("create") || messageType.includes("add"))
          return "text-green-500";
        if (
          messageType.includes("complete") ||
          messageType.includes("done") ||
          messageType.includes("mark")
        )
          return "text-blue-500";
        if (
          messageType.includes("update") ||
          messageType.includes("edit") ||
          messageType.includes("re-assign")
        )
          return "text-yellow-500";
        if (messageType.includes("delete") || messageType.includes("remove"))
          return "text-red-500";
        if (messageType.includes("comment")) return "text-purple-500";
        return "text-gray-500";
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "Invalid date";
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (e) {
      console.warn("Error formatting timestamp:", timestamp, e);
      return "Invalid date";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="ml-2 text-gray-600">Loading activities...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <AlertTriangle className="h-8 w-8 text-red-500 mb-2" />
          <p className="text-red-600">Error loading activities:</p>
          <p className="text-sm text-gray-700">
            {typeof error === "string" ? error : JSON.stringify(error)}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {activities && activities.length > 0 ? (
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start space-x-3 pb-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center bg-opacity-10 ${getActionColor(
                    activity.messageType // Use messageType for color
                  )}`}
                >
                  <span className="text-xs font-bold">
                    {activity.user
                      ? activity.user.charAt(0).toUpperCase()
                      : "S"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    <span className="font-semibold">
                      {activity.user || "System"}
                    </span>{" "}
                    <span className={getActionColor(activity.messageType)}>
                      {activity.messageType.replace(/_/g, " ")}
                    </span>{" "}
                    {activity.task && (
                      <span className="font-medium">"{activity.task}"</span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatTimestamp(activity.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              No recent activity
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserActivityFeed;
