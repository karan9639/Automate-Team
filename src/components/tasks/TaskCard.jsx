"use client";

import { useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  MoreHorizontal,
  Clock,
  CheckCircle,
  AlertCircle,
  Trash2,
  Loader2,
} from "lucide-react";
import { formatDate } from "../../utils/helpers";
import { changeTaskStatus, deleteTask } from "../../api/tasksApi"; // Updated import
import toast from "react-hot-toast";

const TaskCard = ({ task, onClick, onStatusChange, onTaskDeleted }) => {
  // Added onTaskDeleted prop
  const [showActions, setShowActions] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false); // State for delete loading
  const [currentTask, setCurrentTask] = useState(task);
  const [originalTask, setOriginalTask] = useState(null);

  const extractTaskId = (taskToExtract) => {
    const possibleIds = [
      taskToExtract._id,
      taskToExtract.id,
      taskToExtract.taskId,
      taskToExtract.task_id,
    ];
    const taskId = possibleIds.find((id) => id !== undefined && id !== null);
    if (taskId && typeof taskId === "object" && taskId.$oid) {
      return taskId.$oid;
    }
    return taskId;
  };

  const taskId = extractTaskId(currentTask); // Extract taskId once

  const handleStatusChange = async (newStatus) => {
    setShowActions(false);
    if (!taskId) {
      toast.error("Task ID not found. Cannot update status.");
      return;
    }

    let optimisticToastId = null;
    setOriginalTask({ ...currentTask });
    setCurrentTask((prev) => ({
      ...prev,
      taskStatus: newStatus,
      status: newStatus,
    }));
    optimisticToastId = toast.success("Task status updated optimistically");
    setIsUpdatingStatus(true);

    try {
      const response = await changeTaskStatus(taskId, newStatus);
      if (response.data && response.data.data) {
        setCurrentTask((prev) => ({
          ...prev,
          ...response.data.data,
          taskStatus: response.data.data.taskStatus || newStatus,
        }));
      }
      setOriginalTask(null);
      if (optimisticToastId) toast.dismiss(optimisticToastId); // Dismiss optimistic
      toast.success("Task status updated successfully!"); // Show final success
      if (onStatusChange) {
        onStatusChange(taskId, response.data);
      }
    } catch (error) {
      if (optimisticToastId) toast.dismiss(optimisticToastId);
      if (originalTask) {
        setCurrentTask(originalTask);
        setOriginalTask(null);
      }
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to update task status";
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDeleteTask = async () => {
    setShowActions(false);
    if (!taskId) {
      toast.error("Task ID not found. Cannot delete task.");
      return;
    }

    // Optional: Add a confirmation dialog here
    // if (!confirm("Are you sure you want to delete this task?")) {
    //   return;
    // }

    setIsDeleting(true);
    const toastId = toast.loading("Deleting task...");

    try {
      await deleteTask(taskId);
      toast.success("Task deleted successfully!", { id: toastId });
      if (onTaskDeleted) {
        onTaskDeleted(taskId); // Notify parent component
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to delete task";
      toast.error(`Error: ${errorMessage}`, { id: toastId });
      console.error("Error deleting task:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const taskTitle =
    currentTask.taskTitle || currentTask.title || "Untitled Task";
  const taskDescription =
    currentTask.taskDescription || currentTask.description || "";
  const taskStatus = currentTask.status || currentTask.taskStatus || "pending";
  const taskPriority =
    currentTask.taskPriority || currentTask.priority || "medium";
  const taskCategory = currentTask.taskCategory || currentTask.category || "";
  const taskDueDate =
    currentTask.taskDueDate || currentTask.dueDate || currentTask.due_date;
  const taskAssignees =
    currentTask.taskAssignedTo ||
    currentTask.assignees ||
    currentTask.assigned_to ||
    [];

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in-progress":
      case "in progress":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return <CheckCircle className="h-4 w-4 mr-1" />;
      case "in-progress":
      case "in progress":
        return <Clock className="h-4 w-4 mr-1" />;
      case "pending":
        return <Clock className="h-4 w-4 mr-1" />;
      case "overdue":
        return <AlertCircle className="h-4 w-4 mr-1" />;
      default:
        return null;
    }
  };

  const getStatusDisplayText = (status) => {
    switch (status?.toLowerCase()) {
      case "in-progress":
        return "In Progress";
      case "completed":
        return "Completed";
      case "pending":
        return "Pending";
      case "overdue":
        return "Overdue";
      default:
        return status?.charAt(0).toUpperCase() + status?.slice(1) || "Unknown";
    }
  };

  return (
    <Card
      className="p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={(e) => {
        if (!e.target.closest(".actions-dropdown")) {
          if (onClick) onClick();
        }
      }}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-medium text-lg">{taskTitle}</h3>
        <div className="relative actions-dropdown">
          <Button
            variant="ghost"
            size="sm"
            className="p-1 h-auto"
            onClick={(e) => {
              e.stopPropagation();
              setShowActions(!showActions);
            }}
            disabled={isUpdatingStatus || isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <MoreHorizontal className="h-5 w-5" />
            )}
          </Button>

          {showActions && (
            <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
              <div className="py-1">
                <button
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusChange("in-progress");
                  }}
                  disabled={isUpdatingStatus || isDeleting}
                >
                  {isUpdatingStatus ? "Updating..." : "Mark as In Progress"}
                </button>
                <button
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusChange("completed");
                  }}
                  disabled={isUpdatingStatus || isDeleting}
                >
                  {isUpdatingStatus ? "Updating..." : "Mark as Completed"}
                </button>
                <button
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusChange("pending");
                  }}
                  disabled={isUpdatingStatus || isDeleting}
                >
                  {isUpdatingStatus ? "Updating..." : "Mark as Pending"}
                </button>
                <div className="border-t border-gray-200 my-1"></div>
                <button
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteTask();
                  }}
                  disabled={isDeleting || isUpdatingStatus}
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  {isDeleting ? "Deleting..." : "Delete Task"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {taskDescription && (
        <p className="text-gray-600 text-sm mb-3">{taskDescription}</p>
      )}

      <div className="flex flex-wrap gap-2 mb-3">
        <Badge variant="outline" className={getPriorityColor(taskPriority)}>
          {taskPriority.charAt(0).toUpperCase() + taskPriority.slice(1)}{" "}
          Priority
        </Badge>
        <Badge
          variant="outline"
          className={`${getStatusColor(taskStatus)} ${
            isUpdatingStatus ? "opacity-75" : ""
          }`}
        >
          <span className="flex items-center">
            {getStatusIcon(taskStatus)}
            {getStatusDisplayText(taskStatus)}
          </span>
        </Badge>
        {taskCategory && (
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            {taskCategory}
          </Badge>
        )}
      </div>

      <div className="flex justify-between items-center text-sm text-gray-500">
        <div className="flex items-center">
          <Clock className="h-4 w-4 mr-1" />
          <span>
            Due: {taskDueDate ? formatDate(taskDueDate) : "No due date"}
          </span>
        </div>
        <div className="flex -space-x-2">
          {taskAssignees &&
            (Array.isArray(taskAssignees)
              ? taskAssignees
              : [taskAssignees]
            ).map((assignee, index) => (
              <div
                key={index}
                className="h-6 w-6 rounded-full bg-gray-300 border border-white flex items-center justify-center text-xs"
                title={
                  typeof assignee === "object"
                    ? assignee.name || `Assignee ${index + 1}`
                    : assignee
                }
              >
                {typeof assignee === "object" && assignee.name
                  ? assignee.name.charAt(0).toUpperCase()
                  : typeof assignee === "string"
                  ? assignee.charAt(0).toUpperCase()
                  : "A"}
              </div>
            ))}
        </div>
      </div>
    </Card>
  );
};

export default TaskCard;
