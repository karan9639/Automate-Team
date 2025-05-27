"use client";

import { useState } from "react";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  Repeat,
} from "lucide-react";
import { formatDistanceToNow, isPast, parseISO } from "date-fns";

const TaskList = ({
  tasks,
  onTaskSelect,
  selectedTask,
  onEditTask,
  onDeleteTask,
  onStatusChange,
}) => {
  const [expandedTaskId, setExpandedTaskId] = useState(null);

  // Function to toggle task expansion
  const toggleTaskExpansion = (taskId) => {
    setExpandedTaskId(expandedTaskId === taskId ? null : taskId);
  };

  // Function to get status badge color
  const getStatusColor = (status, dueDate) => {
    if (status === "Done")
      return "bg-green-100 text-green-800 border-green-200";
    if (status === "In Progress")
      return "bg-yellow-100 text-yellow-800 border-yellow-200";

    // Check if task is overdue
    const isDueDatePast =
      dueDate && isPast(parseISO(dueDate)) && status !== "Done";
    if (isDueDatePast) return "bg-red-100 text-red-800 border-red-200";

    return "bg-blue-100 text-blue-800 border-blue-200"; // Default for "To Do" or other statuses
  };

  // Function to get priority badge color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800 border-red-200";
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Function to format the due date
  const formatDueDate = (dueDate) => {
    try {
      const date = parseISO(dueDate);
      const isPastDue = isPast(date);
      const formattedDate = formatDistanceToNow(date, { addSuffix: true });
      return {
        text: formattedDate,
        isPastDue: isPastDue,
      };
    } catch (error) {
      return {
        text: "Invalid date",
        isPastDue: false,
      };
    }
  };

  // Function to get status icon
  const getStatusIcon = (status, dueDate) => {
    if (status === "Done")
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (status === "In Progress")
      return <Clock className="h-4 w-4 text-yellow-600" />;

    // Check if task is overdue
    const isDueDatePast =
      dueDate && isPast(parseISO(dueDate)) && status !== "Done";
    if (isDueDatePast) return <AlertCircle className="h-4 w-4 text-red-600" />;

    return <Clock className="h-4 w-4 text-blue-600" />; // Default for "To Do" or other statuses
  };

  return (
    <div className="space-y-4">
      {tasks.length > 0 ? (
        tasks.map((task) => {
          const dueDate = formatDueDate(task.dueDate);
          const isRecurring = task.frequency && task.frequency !== "One-time";

          return (
            <div
              key={task.id}
              className={`border rounded-lg overflow-hidden transition-all ${
                selectedTask?.id === task.id
                  ? "border-blue-500 shadow-sm"
                  : "border-gray-200"
              }`}
            >
              <div
                className={`p-4 cursor-pointer ${
                  expandedTaskId === task.id || selectedTask?.id === task.id
                    ? "bg-gray-50"
                    : "bg-white"
                }`}
                onClick={() => {
                  onTaskSelect(task);
                  toggleTaskExpansion(task.id);
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      {getStatusIcon(task.status, task.dueDate)}
                      <h3 className="ml-2 text-lg font-medium text-gray-900">
                        {task.name}
                      </h3>
                      {isRecurring && (
                        <Repeat
                          className="ml-2 h-4 w-4 text-purple-600"
                          title={`Recurring: ${task.frequency}`}
                        />
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                      {task.description}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Badge
                        variant="outline"
                        className={getStatusColor(task.status, task.dueDate)}
                      >
                        {task.status === "To Do" &&
                        isPast(parseISO(task.dueDate))
                          ? "Overdue"
                          : task.status}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={getPriorityColor(task.priority)}
                      >
                        {task.priority}
                      </Badge>
                      {task.category && (
                        <Badge
                          variant="outline"
                          className="bg-purple-100 text-purple-800 border-purple-200"
                        >
                          {task.category}
                        </Badge>
                      )}
                      {isRecurring && (
                        <Badge
                          variant="outline"
                          className="bg-indigo-100 text-indigo-800 border-indigo-200"
                        >
                          {task.frequency}
                        </Badge>
                      )}
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span
                          className={
                            dueDate.isPastDue && task.status !== "Done"
                              ? "text-red-600 font-medium"
                              : ""
                          }
                        >
                          {dueDate.text}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditTask(task);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteTask(task);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Expanded content */}
              {(expandedTaskId === task.id || selectedTask?.id === task.id) && (
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">
                        Assigned To
                      </h4>
                      <p className="mt-1">{task.assignedUser}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">
                        Due Date
                      </h4>
                      <p className="mt-1">
                        {new Date(task.dueDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    {task.category && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">
                          Category
                        </h4>
                        <p className="mt-1">{task.category}</p>
                      </div>
                    )}
                    {task.frequency && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">
                          Frequency
                        </h4>
                        <p className="mt-1">{task.frequency}</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-500">
                      Status
                    </h4>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant={
                          task.status === "To Do" ? "default" : "outline"
                        }
                        onClick={(e) => {
                          e.stopPropagation();
                          onStatusChange(task.id, "To Do");
                        }}
                      >
                        To Do
                      </Button>
                      <Button
                        size="sm"
                        variant={
                          task.status === "In Progress" ? "default" : "outline"
                        }
                        onClick={(e) => {
                          e.stopPropagation();
                          onStatusChange(task.id, "In Progress");
                        }}
                      >
                        In Progress
                      </Button>
                      <Button
                        size="sm"
                        variant={task.status === "Done" ? "default" : "outline"}
                        onClick={(e) => {
                          e.stopPropagation();
                          onStatusChange(task.id, "Done");
                        }}
                      >
                        Done
                      </Button>
                    </div>
                  </div>

                  {task.comments && task.comments.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-500">
                        Recent Comments
                      </h4>
                      <div className="mt-2 space-y-2">
                        {task.comments.slice(0, 2).map((comment) => (
                          <div
                            key={comment.id}
                            className="text-sm p-2 bg-white rounded border border-gray-200"
                          >
                            <div className="flex justify-between">
                              <span className="font-medium">
                                {comment.user}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatDistanceToNow(
                                  new Date(comment.timestamp),
                                  { addSuffix: true }
                                )}
                              </span>
                            </div>
                            <p className="mt-1">{comment.text}</p>
                          </div>
                        ))}
                        {task.comments.length > 2 && (
                          <p className="text-xs text-blue-600">
                            +{task.comments.length - 2} more{" "}
                            {task.comments.length - 2 === 1
                              ? "comment"
                              : "comments"}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })
      ) : (
        <div className="py-8 text-center">
          <p className="text-gray-500">No tasks found</p>
          <Button className="mt-4" onClick={() => onEditTask(null)}>
            Create New Task
          </Button>
        </div>
      )}
    </div>
  );
};

export default TaskList;
