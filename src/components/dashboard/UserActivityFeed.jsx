import { Card } from "../../components/ui/card";
import {
  MessageSquare,
  CheckCircle,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  FileText,
} from "lucide-react";

const UserActivityFeed = ({ activities }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();

    // If today, show time only
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "numeric",
      });
    }

    // If this year, show month and day
    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }

    // Otherwise show full date
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getActionIcon = (action) => {
    switch (action) {
      case "commented on":
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case "completed task":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "created task":
        return <Plus className="h-4 w-4 text-purple-500" />;
      case "updated task":
        return <Edit className="h-4 w-4 text-yellow-500" />;
      case "deleted task":
        return <Trash2 className="h-4 w-4 text-red-500" />;
      case "refreshed dashboard":
        return <RefreshCw className="h-4 w-4 text-blue-500" />;
      case "generated report":
        return <FileText className="h-4 w-4 text-green-500" />;
      default:
        return <Edit className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Recent Activity
      </h3>

      {activities.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No recent activity</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-[400px] overflow-y-auto">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-3 pb-3 border-b last:border-0"
            >
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                {getActionIcon(activity.action)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <p className="text-sm">
                    <span className="font-medium">{activity.user}</span>{" "}
                    <span className="text-gray-600">{activity.action}</span>{" "}
                    {activity.task && (
                      <span className="font-medium text-gray-700">
                        {activity.task}
                      </span>
                    )}
                  </p>
                  <span className="text-xs text-gray-500">
                    {formatDate(activity.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default UserActivityFeed;
