"use client";

import { useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { MoreHorizontal, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { formatDate } from "../../utils/helpers";

const TaskCard = ({ task, onClick }) => {
  const [showActions, setShowActions] = useState(false);

  const handleStatusChange = (newStatus) => {
    setShowActions(false);
  };

  // Handle different API response field names
  const taskTitle = task.taskTitle || task.title || "Untitled Task";
  const taskDescription = task.taskDescription || task.description || "";
  const taskStatus = task.status || task.taskStatus || "pending";
  const taskPriority = task.taskPriority || task.priority || "medium";
  const taskCategory = task.taskCategory || task.category || "";
  const taskDueDate = task.taskDueDate || task.dueDate || task.due_date;
  const taskAssignees =
    task.taskAssignedTo || task.assignees || task.assigned_to || [];

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

  return (
    <Card
      className="p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={(e) => {
        // Don't trigger onClick if clicking on the actions dropdown
        if (!e.target.closest(".actions-dropdown")) {
          console.log("🎯 TaskCard clicked, calling onClick handler");
          if (onClick) {
            onClick();
          } else {
            console.log("❌ No onClick handler provided to TaskCard");
          }
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
          >
            <MoreHorizontal className="h-5 w-5" />
          </Button>

          {showActions && (
            <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
              <div className="py-1">
                <button
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusChange("in-progress");
                  }}
                >
                  Mark as In Progress
                </button>
                <button
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusChange("completed");
                  }}
                >
                  Mark as Completed
                </button>
                <button
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusChange("pending");
                  }}
                >
                  Mark as Pending
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

        <Badge variant="outline" className={getStatusColor(taskStatus)}>
          <span className="flex items-center">
            {getStatusIcon(taskStatus)}
            {taskStatus.charAt(0).toUpperCase() + taskStatus.slice(1)}
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
                title={`Assignee ${assignee}`}
              >
                {typeof assignee === "string"
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
