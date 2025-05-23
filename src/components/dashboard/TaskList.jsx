"use client";

import { useState } from "react";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";

const TaskList = ({
  tasks,
  onTaskSelect,
  selectedTask,
  onEditTask,
  onDeleteTask,
  onStatusChange,
}) => {
  const [hoveredTaskId, setHoveredTaskId] = useState(null);
  const [openActionMenu, setOpenActionMenu] = useState(null);

  const handleTaskClick = (task) => {
    onTaskSelect(task.id === selectedTask?.id ? null : task);
  };

  const handleActionClick = (e, taskId) => {
    e.stopPropagation();
    setOpenActionMenu(openActionMenu === taskId ? null : taskId);
  };

  const handleEditClick = (e, task) => {
    e.stopPropagation();
    setOpenActionMenu(null);
    onEditTask(task);
  };

  const handleDeleteClick = (e, task) => {
    e.stopPropagation();
    setOpenActionMenu(null);
    onDeleteTask(task);
  };

  const handleStatusChange = (e, taskId) => {
    e.stopPropagation();
    const newStatus = e.target.value;
    onStatusChange(taskId, newStatus);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No date";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "To Do":
        return "bg-gray-100 text-gray-800";
      case "In Progress":
        return "bg-blue-100 text-blue-800";
      case "Done":
        return "bg-green-100 text-green-800";
      case "Overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "Low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "To Do":
        return <Clock className="h-4 w-4 text-gray-600" />;
      case "In Progress":
        return <Clock className="h-4 w-4 text-blue-600" />;
      case "Done":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "Overdue":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">
          No tasks found. Try adjusting your filters or create a new task.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <div
          key={task.id}
          className={`border rounded-lg p-4 cursor-pointer transition-all ${
            selectedTask?.id === task.id
              ? "border-blue-500 bg-blue-50"
              : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
          }`}
          onClick={() => handleTaskClick(task)}
          onMouseEnter={() => setHoveredTaskId(task.id)}
          onMouseLeave={() => setHoveredTaskId(null)}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{task.name}</h3>
              <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                {task.description}
              </p>
            </div>
            <div className="relative">
              <button
                className={`p-1 rounded-full ${
                  openActionMenu === task.id
                    ? "bg-gray-200"
                    : "hover:bg-gray-100"
                }`}
                onClick={(e) => handleActionClick(e, task.id)}
              >
                <MoreHorizontal className="h-5 w-5 text-gray-500" />
              </button>
              {openActionMenu === task.id && (
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                  <div className="py-1">
                    <button
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={(e) => handleEditClick(e, task)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Task
                    </button>
                    <button
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      onClick={(e) => handleDeleteClick(e, task)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Task
                    </button>
                    <div className="px-4 py-2 border-t border-gray-100">
                      <label className="block text-xs text-gray-500 mb-1">
                        Change Status
                      </label>
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(e, task.id)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <option value="To Do">To Do</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Done">Done</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <div
              className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                task.status
              )} flex items-center gap-1`}
            >
              {getStatusIcon(task.status)}
              {task.status}
            </div>
            <div
              className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(
                task.priority
              )}`}
            >
              {task.priority}
            </div>
            {task.category && (
              <div className="px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                {task.category}
              </div>
            )}
          </div>
          <div className="flex justify-between items-center mt-3 text-xs text-gray-500">
            <div>Assigned to: {task.assignedUser}</div>
            <div className="flex items-center gap-3">
              <div>Due: {formatDate(task.dueDate)}</div>
              {task.comments.length > 0 && (
                <div>{task.comments.length} comments</div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TaskList;
