"use client";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  AlertCircle,
  Clock,
  PlayCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";

const TaskTable = ({ view, dateFilter, searchQuery, filters }) => {
  // Get team members from Redux store
  const { members } = useSelector((state) => state.team);

  // Get tasks from Redux store
  const { tasks } = useSelector((state) => state.tasks);

  // Group tasks by employee
  const tasksByEmployee = members.map((member) => {
    const employeeTasks = tasks.filter((task) => task.assigneeId === member.id);

    // Count tasks by status
    const overdue = employeeTasks.filter(
      (task) => task.status === "overdue"
    ).length;
    const pending = employeeTasks.filter(
      (task) => task.status === "pending"
    ).length;
    const inProgress = employeeTasks.filter(
      (task) => task.status === "in-progress"
    ).length;
    const completed = employeeTasks.filter(
      (task) => task.status === "completed"
    ).length;
    const inTime = employeeTasks.filter(
      (task) => task.status === "in-time"
    ).length;
    const delayed = employeeTasks.filter(
      (task) => task.status === "delayed"
    ).length;

    // Calculate completion percentage
    const total = employeeTasks.length;
    const completedPercentage =
      total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      employee: member,
      tasks: employeeTasks,
      total,
      overdue,
      pending,
      inProgress,
      completed,
      inTime,
      delayed,
      completedPercentage,
    };
  });

  // Filter by search query and filters
  const filteredData = tasksByEmployee.filter((data) => {
    // Filter by search query
    if (
      searchQuery &&
      !data.employee.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    // Filter by assignee
    if (filters.assignedTo && data.employee.id !== filters.assignedTo) {
      return false;
    }

    return true;
  });

  // Render employee-wise view
  if (view === "Employee Wise") {
    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Employee Name
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Total
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-100"
                colSpan={3}
              >
                Not Completed
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-100"
                colSpan={2}
              >
                Completed
              </th>
            </tr>
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                &nbsp;
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                &nbsp;
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                <div className="flex items-center">
                  <AlertCircle size={14} className="text-red-500 mr-1" />
                  Overdue
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                <div className="flex items-center">
                  <Clock size={14} className="text-orange-500 mr-1" />
                  Pending
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                <div className="flex items-center">
                  <PlayCircle size={14} className="text-amber-500 mr-1" />
                  In-Progress
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                <div className="flex items-center">
                  <CheckCircle size={14} className="text-green-500 mr-1" />
                  In Time
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                <div className="flex items-center">
                  <XCircle size={14} className="text-red-500 mr-1" />
                  Delayed
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredData.map((data) => (
              <motion.tr
                key={data.employee.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="hover:bg-gray-50"
              >
                <td className="px-3 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 relative">
                      <div className="absolute inset-0 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-800 font-medium">
                          {data.employee.name.charAt(0)}
                        </span>
                      </div>
                      <svg viewBox="0 0 36 36" className="h-10 w-10">
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#4ADE80"
                          strokeWidth="3"
                          strokeDasharray={`${data.completedPercentage}, 100`}
                          className="stroke-current text-green-400"
                        />
                      </svg>
                    </div>
                    <div className="ml-2 sm:ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {data.employee.name}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-900">
                  {data.total}
                </td>
                <td className="px-3 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-900">
                  {data.overdue} (
                  {data.total > 0
                    ? Math.round((data.overdue / data.total) * 100)
                    : 0}
                  %)
                </td>
                <td className="px-3 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-900">
                  {data.pending} (
                  {data.total > 0
                    ? Math.round((data.pending / data.total) * 100)
                    : 0}
                  %)
                </td>
                <td className="px-3 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-900">
                  {data.inProgress} (
                  {data.total > 0
                    ? Math.round((data.inProgress / data.total) * 100)
                    : 0}
                  %)
                </td>
                <td className="px-3 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-900">
                  {data.inTime} (
                  {data.total > 0
                    ? Math.round((data.inTime / data.total) * 100)
                    : 0}
                  %)
                </td>
                <td className="px-3 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-900">
                  {data.delayed} (
                  {data.total > 0
                    ? Math.round((data.delayed / data.total) * 100)
                    : 0}
                  %)
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // For other views, show a placeholder
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 text-center text-gray-500">
      {view} view is not implemented in this demo
    </div>
  );
};

export default TaskTable;
