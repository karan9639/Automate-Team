import { Card } from "../../components/ui/card";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";

const KPICards = ({ kpis }) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Tasks</p>
            <h3 className="text-2xl font-bold mt-1">{kpis.totalTasks}</h3>
          </div>
          <div className="p-2 bg-blue-100 rounded-full">
            <Clock className="h-5 w-5 text-blue-600" />
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center text-xs text-gray-600">
            <span>All active tasks</span>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Completed Tasks</p>
            <h3 className="text-2xl font-bold mt-1">{kpis.completedTasks}</h3>
          </div>
          <div className="p-2 bg-green-100 rounded-full">
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center text-xs text-green-600">
            <span className="mr-1">✓</span>
            <span>
              {kpis.totalTasks > 0
                ? `${Math.round(
                    (kpis.completedTasks / kpis.totalTasks) * 100
                  )}% completion rate`
                : "No tasks"}
            </span>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Pending Tasks</p>
            <h3 className="text-2xl font-bold mt-1">{kpis.pendingTasks}</h3>
          </div>
          <div className="p-2 bg-yellow-100 rounded-full">
            <Clock className="h-5 w-5 text-yellow-600" />
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center text-xs text-yellow-600">
            <span className="mr-1">⏱</span>
            <span>Awaiting completion</span>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Overdue Tasks</p>
            <h3 className="text-2xl font-bold mt-1">{kpis.overdueTasks}</h3>
          </div>
          <div className="p-2 bg-red-100 rounded-full">
            <AlertCircle className="h-5 w-5 text-red-600" />
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center text-xs text-red-600">
            <span className="mr-1">⚠️</span>
            <span>Requires immediate attention</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default KPICards;
