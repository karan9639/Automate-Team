import { Card, CardContent } from "../../components/ui/card";
import { CheckCircle, Clock, AlertCircle, List } from "lucide-react";

const KPICards = ({ kpis }) => {
  const cards = [
    {
      title: "Total Tasks",
      value: kpis.totalTasks,
      icon: <List className="h-5 w-5 text-blue-600" />,
      description: "Total number of tasks",
      color: "bg-blue-50 text-blue-600 border-blue-200",
      delegated: kpis.totalDelegatedTasks,
      mine: kpis.totalMyTasks,
    },
    {
      title: "Completed",
      value: kpis.completedTasks,
      icon: <CheckCircle className="h-5 w-5 text-green-600" />,
      description: "Tasks marked as done",
      color: "bg-green-50 text-green-600 border-green-200",
      delegated: kpis.completedDelegatedTasks,
      mine: kpis.completedMyTasks,
    },
    {
      title: "In Progress",
      value: kpis.inProgressTasks,
      icon: <Clock className="h-5 w-5 text-yellow-600" />,
      description: "Tasks currently in progress",
      color: "bg-yellow-50 text-yellow-600 border-yellow-200",
      delegated: kpis.inProgressDelegatedTasks,
      mine: kpis.inProgressMyTasks,
    },
    {
      title: "Overdue",
      value: kpis.overdueTasks,
      icon: <AlertCircle className="h-5 w-5 text-red-600" />,
      description: "Tasks past due date",
      color: "bg-red-50 text-red-600 border-red-200",
      delegated: kpis.overdueDelegatedTasks,
      mine: kpis.overdueMyTasks,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                <h3 className="text-2xl font-bold mt-1">{card.value}</h3>
                <p className="text-xs text-gray-500 mt-1">{card.description}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Assigned :{" "}
                  <span className="font-medium">{card.delegated ?? 0}</span>
                </p>
                <p className="text-xs text-gray-500">
                  My tasks :{" "}
                  <span className="font-medium">{card.mine ?? 0}</span>
                </p>
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
