"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  MoreHorizontal,
  Clock,
  CheckCircle,
  AlertCircle,
  Edit,
  Trash2,
  Eye,
  User,
  Calendar,
  Flag,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { changeTaskStatus, deleteTask } from "../../store/slices/taskSlice";
import ConfirmModal from "../common/ConfirmModal";

const TaskCard = ({ task, onEdit, onView, showAssignee = false }) => {
  const dispatch = useDispatch();
  const [showActions, setShowActions] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleStatusChange = (newStatus) => {
    dispatch(changeTaskStatus({ taskId: task._id, status: newStatus }));
    setShowActions(false);
  };

  const handleDelete = () => {
    dispatch(deleteTask(task._id));
    setShowDeleteConfirm(false);
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "in progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "overdue":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "in progress":
        return <Clock className="h-4 w-4" />;
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "overdue":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const isOverdue = () => {
    if (!task.taskDueDate || task.taskStatus?.toLowerCase() === "completed")
      return false;
    return new Date(task.taskDueDate) < new Date();
  };

  const formatDueDate = (date) => {
    if (!date) return "No due date";
    const dueDate = new Date(date);
    const now = new Date();

    if (dueDate.toDateString() === now.toDateString()) {
      return "Due today";
    } else if (dueDate < now) {
      return `Overdue by ${formatDistanceToNow(dueDate)}`;
    } else {
      return `Due ${formatDistanceToNow(dueDate, { addSuffix: true })}`;
    }
  };

  return (
    <>
      <Card className="p-4 hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-gray-900 mb-1 line-clamp-2">
              {task.taskTitle}
            </h3>
            {task.taskDescription && (
              <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                {task.taskDescription}
              </p>
            )}
          </div>

          <div className="relative ml-2">
            <Button
              variant="ghost"
              size="sm"
              className="p-1 h-auto"
              onClick={() => setShowActions(!showActions)}
            >
              <MoreHorizontal className="h-5 w-5" />
            </Button>

            {showActions && (
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-20 border border-gray-200">
                <div className="py-1">
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    onClick={() => {
                      onView(task);
                      setShowActions(false);
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    onClick={() => {
                      onEdit(task);
                      setShowActions(false);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Task
                  </button>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => handleStatusChange("Pending")}
                  >
                    Mark as Pending
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => handleStatusChange("In Progress")}
                  >
                    Mark as In Progress
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => handleStatusChange("Completed")}
                  >
                    Mark as Completed
                  </button>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                    onClick={() => {
                      setShowDeleteConfirm(true);
                      setShowActions(false);
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Task
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          <Badge
            variant="outline"
            className={`${getPriorityColor(
              task.taskPriority
            )} flex items-center`}
          >
            <Flag className="h-3 w-3 mr-1" />
            {task.taskPriority} Priority
          </Badge>

          <Badge
            variant="outline"
            className={`${getStatusColor(
              isOverdue() ? "overdue" : task.taskStatus
            )} flex items-center`}
          >
            {getStatusIcon(isOverdue() ? "overdue" : task.taskStatus)}
            <span className="ml-1">
              {isOverdue() ? "Overdue" : task.taskStatus}
            </span>
          </Badge>

          {task.taskCategory && (
            <Badge
              variant="outline"
              className="bg-blue-50 text-blue-700 border-blue-200"
            >
              {task.taskCategory}
            </Badge>
          )}

          {task.taskFrequency?.type &&
            task.taskFrequency.type !== "one-time" && (
              <Badge
                variant="outline"
                className="bg-purple-50 text-purple-700 border-purple-200"
              >
                {task.taskFrequency.type}
              </Badge>
            )}
        </div>

        <div className="flex justify-between items-center text-sm text-gray-500">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            <span className={isOverdue() ? "text-red-600 font-medium" : ""}>
              {formatDueDate(task.taskDueDate)}
            </span>
          </div>

          {showAssignee && task.taskAssignedTo && (
            <div className="flex items-center">
              <User className="h-4 w-4 mr-1" />
              <span>
                {typeof task.taskAssignedTo === "object"
                  ? task.taskAssignedTo.fullname || task.taskAssignedTo.name
                  : "Assigned User"}
              </span>
            </div>
          )}

          <div className="text-xs text-gray-400">
            Created{" "}
            {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}
          </div>
        </div>
      </Card>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Task"
        description="Are you sure you want to delete this task? This action cannot be undone."
        confirmText="Delete"
        variant="destructive"
      />
    </>
  );
};

export default TaskCard;
