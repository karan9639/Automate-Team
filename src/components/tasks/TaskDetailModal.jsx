"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Modal } from "../ui/modal";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Calendar,
  User,
  Flag,
  Clock,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  Repeat,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import {
  fetchTaskById,
  changeTaskStatus,
  selectCurrentTask,
  selectTaskLoading,
} from "../../store/slices/taskSlice";

const TaskDetailModal = ({ isOpen, onClose, taskId, onEdit, onDelete }) => {
  const dispatch = useDispatch();
  const task = useSelector(selectCurrentTask);
  const loading = useSelector(selectTaskLoading);

  useEffect(() => {
    if (isOpen && taskId) {
      dispatch(fetchTaskById(taskId));
    }
  }, [isOpen, taskId, dispatch]);

  const handleStatusChange = (newStatus) => {
    if (task) {
      dispatch(changeTaskStatus({ taskId: task._id, status: newStatus }));
    }
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

  const isOverdue = () => {
    if (!task?.taskDueDate || task.taskStatus?.toLowerCase() === "completed")
      return false;
    return new Date(task.taskDueDate) < new Date();
  };

  if (loading.currentTask) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Task Details"
        className="max-w-2xl"
      >
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
      </Modal>
    );
  }

  if (!task) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Task Details"
        className="max-w-2xl"
      >
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Task not found or failed to load.</p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Task Details"
      className="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Header with actions */}
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {task.taskTitle}
            </h2>
            <div className="flex flex-wrap gap-2">
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
                {isOverdue() ? (
                  <AlertCircle className="h-3 w-3 mr-1" />
                ) : (
                  <CheckCircle className="h-3 w-3 mr-1" />
                )}
                {isOverdue() ? "Overdue" : task.taskStatus}
              </Badge>
              {task.taskCategory && (
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-blue-700 border-blue-200"
                >
                  {task.taskCategory}
                </Badge>
              )}
            </div>
          </div>

          <div className="flex gap-2 ml-4">
            <Button variant="outline" size="sm" onClick={() => onEdit(task)}>
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(task)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>

        {/* Description */}
        {task.taskDescription && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <div className="w-1 h-6 bg-emerald-500 rounded-full"></div>
              Description
            </h3>
            <div className="text-gray-700 bg-gradient-to-br from-gray-50 to-gray-100/50 p-5 rounded-lg border border-gray-200 shadow-sm">
              <div className="whitespace-pre-wrap leading-7 space-y-1">
                {task.taskDescription.split("\n").map((line, index) => {
                  const isNumberedItem = /^\d+\.\s/.test(line.trim());
                  return (
                    <div
                      key={index}
                      className={`${
                        isNumberedItem
                          ? "flex items-start gap-3 py-1.5"
                          : line.trim()
                          ? "py-1"
                          : ""
                      }`}
                    >
                      {isNumberedItem ? (
                        <>
                          <span className="inline-flex items-center justify-center min-w-[24px] h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
                            {line.match(/^(\d+)\./)[1]}
                          </span>
                          <span className="flex-1 pt-0.5">
                            {line.replace(/^\d+\.\s/, "")}
                          </span>
                        </>
                      ) : (
                        <span>{line}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Task Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center">
              <User className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-500">Assigned To</p>
                <p className="text-gray-900">
                  {typeof task.taskAssignedTo === "object"
                    ? task.taskAssignedTo.fullname || task.taskAssignedTo.name
                    : "Assigned User"}
                </p>
              </div>
            </div>

            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-500">Due Date</p>
                <p
                  className={`text-gray-900 ${
                    isOverdue() ? "text-red-600 font-medium" : ""
                  }`}
                >
                  {task.taskDueDate
                    ? format(new Date(task.taskDueDate), "PPP")
                    : "No due date set"}
                </p>
                {task.taskDueDate && (
                  <p className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(task.taskDueDate), {
                      addSuffix: true,
                    })}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-500">Created</p>
                <p className="text-gray-900">
                  {format(new Date(task.createdAt), "PPP")}
                </p>
                <p className="text-sm text-gray-500">
                  {formatDistanceToNow(new Date(task.createdAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>

            {task.taskFrequency?.type && (
              <div className="flex items-center">
                <Repeat className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Frequency</p>
                  <p className="text-gray-900 capitalize">
                    {task.taskFrequency.type}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Status Change Actions */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Change Status
          </h3>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={task.taskStatus === "Pending" ? "default" : "outline"}
              size="sm"
              onClick={() => handleStatusChange("Pending")}
              disabled={task.taskStatus === "Pending"}
            >
              Pending
            </Button>
            <Button
              variant={
                task.taskStatus === "In Progress" ? "default" : "outline"
              }
              size="sm"
              onClick={() => handleStatusChange("In Progress")}
              disabled={task.taskStatus === "In Progress"}
            >
              In Progress
            </Button>
            <Button
              variant={task.taskStatus === "Completed" ? "default" : "outline"}
              size="sm"
              onClick={() => handleStatusChange("Completed")}
              disabled={task.taskStatus === "Completed"}
            >
              Completed
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default TaskDetailModal;
