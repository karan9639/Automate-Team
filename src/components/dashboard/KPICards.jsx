import { Card, CardContent } from "../../components/ui/card";
import { CheckCircle, Clock, AlertCircle, Users, List } from "lucide-react";

const KPICards = ({ kpis }) => {
  const cards = [
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
      percentage: kpis.totalTasks
        ? Math.round((kpis.completedTasks / kpis.totalTasks) * 100)
        : 0,
      icon: <CheckCircle className="h-5 w-5 text-green-600" />,
      description: "Tasks marked as done",
      color: "bg-green-50 text-green-600 border-green-200",
    },
    {
      title: "In Progress",
      value: kpis.inProgressTasks,
      percentage: kpis.totalTasks
        ? Math.round((kpis.inProgressTasks / kpis.totalTasks) * 100)
        : 0,
      icon: <Clock className="h-5 w-5 text-yellow-600" />,
      description: "Tasks currently in progress",
      color: "bg-yellow-50 text-yellow-600 border-yellow-200",
    },
    {
      title: "Overdue",
      value: kpis.overdueTasks,
      percentage: kpis.totalTasks
        ? Math.round((kpis.overdueTasks / kpis.totalTasks) * 100)
        : 0,
      icon: <AlertCircle className="h-5 w-5 text-red-600" />,
      description: "Tasks past due date",
      color: "bg-red-50 text-red-600 border-red-200",
    },
    {
      title: "Active Users",
      value: kpis.activeUsers,
      icon: <Users className="h-5 w-5 text-purple-600" />,
      description: "Team members with tasks",
      color: "bg-purple-50 text-purple-600 border-purple-200",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card, index) => (
        <Card
          key={index}
          className={`border ${
            card.color.includes("border") ? card.color.split(" ").pop() : ""
          }`}
        >
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  {card.title}
                </p>
                <div className="flex items-baseline mt-1">
                  <h3 className="text-2xl font-bold">{card.value}</h3>
                  {card.percentage !== undefined && (
                    <span className="ml-2 text-sm text-gray-500">
                      {card.percentage}%
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">{card.description}</p>
              </div>
              <div className={`p-2 rounded-full ${card.color}`}>
                {card.icon}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default KPICards;
