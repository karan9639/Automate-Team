"use client";

import { useState, useEffect } from "react";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  MoreHorizontal,
  Clock,
  CheckCircle,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { formatDate } from "../../utils/helpers";
import {
  changeTaskStatus,
  deleteTask as deleteTaskApi,
} from "../../api/tasksApi";
import toast from "react-hot-toast";

const TaskCard = ({ task, onClick, onStatusChange, onDelete, activeTab }) => {
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isRequestingDelete, setIsRequestingDelete] = useState(false);
  const [taskIdToDelete, setTaskIdToDelete] = useState(null);
  const [currentTask, setCurrentTask] = useState(task);
  const [originalTask, setOriginalTask] = useState(null);

  useEffect(() => {
    setCurrentTask(task);
  }, [task]);

  const extractTaskId = (taskToExtract) => {
    const possibleIds = [
      taskToExtract._id,
      taskToExtract.id,
      taskToExtract.taskId,
      taskToExtract.task_id,
    ];
    const id = possibleIds.find((val) => val !== undefined && val !== null);
    if (id && typeof id === "object" && id.$oid) {
      return id.$oid;
    }
    return id;
  };

  useEffect(() => {
    if (!taskIdToDelete) {
      return;
    }
    let deleteToastId = null;
    const performDelete = async () => {
      deleteToastId = toast.loading("Deleting task...");
      setIsRequestingDelete(true);
      try {
        await deleteTaskApi(taskIdToDelete);
        toast.success("Task deleted successfully!", { id: deleteToastId });
        if (onDelete) {
          onDelete(taskIdToDelete);
        }
      } catch (error) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Failed to delete task";
        toast.error(`Failed to delete task: ${errorMessage}`, {
          id: deleteToastId,
        });
      } finally {
        setIsRequestingDelete(false);
        setTaskIdToDelete(null);
      }
    };
    performDelete();
  }, [taskIdToDelete, onDelete]);

  const handleStatusChange = async (newStatus) => {
    let optimisticToastId = null;
    try {
      const id = extractTaskId(currentTask);
      if (!id) throw new Error("Task ID not found");
      setOriginalTask({ ...currentTask });
      setCurrentTask((prev) => ({
        ...prev,
        taskStatus: newStatus,
        status: newStatus,
      }));
      optimisticToastId = toast.success("Task status updated successfully");
      setIsUpdatingStatus(true);
      const response = await changeTaskStatus(id, newStatus);
      if (response.data && response.data.data) {
        setCurrentTask((prev) => ({
          ...prev,
          ...response.data.data,
          taskStatus: response.data.data.taskStatus || newStatus,
        }));
      }
      setOriginalTask(null);
      if (onStatusChange) onStatusChange(id, response.data);
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
      toast.error(`Failed to update task status: ${errorMessage}`);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleInitiateDelete = () => {
    const id = extractTaskId(currentTask);
    if (!id) {
      toast.error("Task ID not found, cannot delete.");
      return;
    }
    setTaskIdToDelete(id);
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

  const getPreviewDescription = (description) => {
    if (!description) return "";

    const lines = description.split("\n").filter((line) => line.trim());
    const numberedLines = lines.filter((line) => /^\d+\.\s/.test(line.trim()));

    if (numberedLines.length === 0) {
      // If no numbered list, show truncated text
      return description.length > 120
        ? description.substring(0, 120) + "..."
        : description;
    }

    // Show first 3 numbered items
    const previewLines = numberedLines.slice(0, 3);
    const hasMore = numberedLines.length > 3;

    return {
      preview: previewLines.join("\n"),
      hasMore,
      totalCount: numberedLines.length,
    };
  };

  const descriptionData = getPreviewDescription(taskDescription);
  const isNumberedList = typeof descriptionData === "object";

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300";
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300";
      case "in progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300";
      case "overdue":
        return "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };
  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return <CheckCircle className="h-4 w-4 mr-1" />;
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
      case "in progress":
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
      className="p-3 sm:p-4 hover:shadow-lg transition-shadow duration-200 ease-out cursor-pointer bg-card text-card-foreground border-border"
      onClick={(e) => {
        if (
          !e.target.closest("[data-radix-dropdown-menu-trigger]") &&
          !e.target.closest("[data-radix-dropdown-menu-content]")
        ) {
          if (onClick) onClick();
        }
      }}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-base sm:text-lg text-card-foreground">
          {taskTitle}
        </h3>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger
            asChild
            disabled={isUpdatingStatus || isRequestingDelete}
          >
            <button
              aria-label="Task actions"
              className="p-1 rounded-md hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-50"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-48"
            align="end"
            onClick={(e) => e.stopPropagation()}
            onCloseAutoFocus={(e) => e.preventDefault()}
          >
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                handleStatusChange("in progress");
              }}
              disabled={
                isUpdatingStatus ||
                isRequestingDelete ||
                taskStatus === "in progress"
              }
            >
              {isUpdatingStatus && taskStatus !== "in progress"
                ? "Updating..."
                : "Mark as In Progress"}
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                handleStatusChange("completed");
              }}
              disabled={
                isUpdatingStatus ||
                isRequestingDelete ||
                taskStatus === "completed"
              }
            >
              {isUpdatingStatus && taskStatus !== "completed"
                ? "Updating..."
                : "Mark as Completed"}
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                handleStatusChange("pending");
              }}
              disabled={
                isUpdatingStatus ||
                isRequestingDelete ||
                taskStatus === "pending"
              }
            >
              {isUpdatingStatus && taskStatus !== "pending"
                ? "Updating..."
                : "Mark as Pending"}
            </DropdownMenuItem>
            {(activeTab === "delegated-tasks" ||
              activeTab === "self-tasks") && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    handleInitiateDelete();
                  }}
                  disabled={isUpdatingStatus || isRequestingDelete}
                  className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {isRequestingDelete ? "Deleting..." : "Delete Task"}
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {taskDescription && (
        <div className="mb-3">
          {isNumberedList ? (
            <div className="space-y-2">
              <div className="text-muted-foreground text-sm whitespace-pre-wrap leading-relaxed">
                {descriptionData.preview}
              </div>
              {descriptionData.hasMore && (
                <div className="flex items-center gap-2 text-xs text-primary/70 font-medium">
                  <div className="flex gap-0.5">
                    <div className="w-1 h-1 rounded-full bg-primary/50"></div>
                    <div className="w-1 h-1 rounded-full bg-primary/50"></div>
                    <div className="w-1 h-1 rounded-full bg-primary/50"></div>
                  </div>
                  <span>+{descriptionData.totalCount - 3} more items</span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-muted-foreground text-sm leading-relaxed">
              {descriptionData}
            </div>
          )}
        </div>
      )}
      <div className="flex flex-wrap gap-2 mb-3">
        <Badge
          variant="outline"
          className={`${getPriorityColor(taskPriority)} border`}
        >
          {taskPriority.charAt(0).toUpperCase() + taskPriority.slice(1)}{" "}
          Priority
        </Badge>
        <Badge
          variant="outline"
          className={`${getStatusColor(taskStatus)} ${
            isUpdatingStatus ? "opacity-75" : ""
          } border`}
        >
          <span className="flex items-center">
            {getStatusIcon(taskStatus)}
            {getStatusDisplayText(taskStatus)}
          </span>
        </Badge>
        {taskCategory && (
          <Badge
            variant="outline"
            className="bg-accent text-accent-foreground border"
          >
            {taskCategory}
          </Badge>
        )}
      </div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-xs sm:text-sm text-muted-foreground gap-2 sm:gap-0">
        <div className="flex items-center">
          <Clock className="h-4 w-4 mr-1" />
          <span>
            Due: {taskDueDate ? formatDate(taskDueDate) : "No due date"}
          </span>
        </div>
      </div>
    </Card>
  );
};
export default TaskCard;
