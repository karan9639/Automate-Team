import { Card, CardContent } from "../../components/ui/card";
import { CheckCircle, Clock, AlertCircle, List, Hourglass } from "lucide-react"; // Added Hourglass
import PropTypes from "prop-types";

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
      title: "Pending", // Added Pending card
      value: kpis.pendingTasks, // Assumes kpis.pendingTasks is provided
      icon: <Hourglass className="h-5 w-5 text-amber-600" />,
      description: "Tasks awaiting action",
      color: "bg-amber-50 text-amber-600 border-amber-200",
      delegated: kpis.pendingDelegatedTasks, // Assumes kpis.pendingDelegatedTasks is provided
      mine: kpis.pendingMyTasks, // Assumes kpis.pendingMyTasks is provided
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
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {cards.map((card, index) => (
        <Card
          key={index}
          className={`border ${
            card.color.includes("border")
              ? card.color.split(" ").find((cls) => cls.startsWith("border-"))
              : "border-gray-200"
          }`}
        >
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  {card.title}
                </p>
                <h3 className="text-2xl font-bold mt-1">{card.value ?? 0}</h3>
                <p className="text-xs text-gray-500 mt-1">{card.description}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Assigned:{" "}
                  <span className="font-medium">{card.delegated ?? 0}</span>
                </p>
                <p className="text-xs text-gray-500">
                  My tasks:{" "}
                  <span className="font-medium">{card.mine ?? 0}</span>
                </p>
              </div>
              <div
                className={`p-2 rounded-full ${card.color
                  .split(" ")
                  .filter(
                    (cls) => cls.startsWith("bg-") || cls.startsWith("text-")
                  )
                  .join(" ")}`}
              >
                {card.icon}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

KPICards.propTypes = {
  kpis: PropTypes.shape({
    totalTasks: PropTypes.number,
    totalDelegatedTasks: PropTypes.number,
    totalMyTasks: PropTypes.number,
    completedTasks: PropTypes.number,
    completedDelegatedTasks: PropTypes.number,
    completedMyTasks: PropTypes.number,
    inProgressTasks: PropTypes.number,
    inProgressDelegatedTasks: PropTypes.number,
    inProgressMyTasks: PropTypes.number,
    pendingTasks: PropTypes.number, // Added prop type
    pendingDelegatedTasks: PropTypes.number, // Added prop type
    pendingMyTasks: PropTypes.number, // Added prop type
    overdueTasks: PropTypes.number,
    overdueDelegatedTasks: PropTypes.number,
    overdueMyTasks: PropTypes.number,
  }).isRequired,
};

// Provide default kpis for preview
KPICards.defaultProps = {
  kpis: {
    totalTasks: 120,
    totalDelegatedTasks: 70,
    totalMyTasks: 50,
    completedTasks: 60,
    completedDelegatedTasks: 30,
    completedMyTasks: 30,
    inProgressTasks: 30,
    inProgressDelegatedTasks: 20,
    inProgressMyTasks: 10,
    pendingTasks: 20,
    pendingDelegatedTasks: 15,
    pendingMyTasks: 5,
    overdueTasks: 10,
    overdueDelegatedTasks: 5,
    overdueMyTasks: 5,
  },
};

export default KPICards;
