"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  CheckCircle,
  Circle,
  Clock,
  Filter,
  PlusCircle,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import EmptyState from "../../components/common/EmptyState";
import AssignTaskModal from "../../components/modals/AssignTaskModal";
import TaskCard from "../../components/tasks/TaskCard";
import { taskApi } from "../../api/taskApi"; // Ensure this is the correct path to your taskApi
import toast from "react-hot-toast";

const MyTasksTab = () => {
  const [isAssignTaskModalOpen, setIsAssignTaskModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("this-week"); // Example filter state

  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [statusFilters, setStatusFilters] = useState([
    {
      id: "overdue",
      label: "OverDue",
      color: "text-red-500",
      icon: Clock,
      count: 0,
    },
    {
      id: "pending",
      label: "Pending",
      color: "text-orange-500",
      icon: Circle,
      count: 0,
    },
    {
      id: "in progress",
      label: "In Progress",
      color: "text-yellow-500",
      icon: PlusCircle,
      count: 0,
    },
    {
      id: "completed",
      label: "Completed",
      color: "text-green-500",
      icon: CheckCircle,
      count: 0,
    },
  ]);

  const dateFilters = [
    { id: "today", label: "Today" },
    { id: "yesterday", label: "Yesterday" },
    { id: "this-week", label: "This Week" },
    { id: "this-month", label: "This Month" },
    { id: "next-week", label: "Next Week" },
    { id: "all-time", label: "All Time" },
    { id: "custom", label: "Custom" },
  ];

  const fetchMyTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await taskApi.getAssignedToMeTasks(); // Using the specific API endpoint
      const tasksData =
        response.data?.data || response.data?.tasks || response.data || [];

      // Ensure tasksData is always an array and has unique keys
      const uniqueTasks = [];
      const taskIds = new Set();
      if (Array.isArray(tasksData)) {
        tasksData.forEach((task) => {
          const taskId = task._id || task.id; // Prefer _id, fallback to id
          if (taskId && !taskIds.has(taskId)) {
            uniqueTasks.push(task);
            taskIds.add(taskId);
          } else if (!taskId) {
            // Handle tasks without a proper ID if necessary, or log a warning
            console.warn("Task without a valid ID found:", task);
            // For now, we'll add it with a temporary key if needed for rendering,
            // but ideally, all tasks should have a stable ID.
            // uniqueTasks.push({ ...task, tempKey: `temp-${uniqueTasks.length}` });
          }
        });
      }

      setTasks(uniqueTasks);

      const newStatusCounts = [...statusFilters];
      newStatusCounts.forEach((sf) => {
        sf.count = uniqueTasks.filter(
          (t) =>
            (t.taskStatus?.toLowerCase().replace(/\s+/g, "-") ||
              t.status?.toLowerCase().replace(/\s+/g, "-")) === sf.id
        ).length;
      });
      setStatusFilters(newStatusCounts);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to load your tasks.";
      setError(errorMessage);
      toast.error(errorMessage);
      setTasks([]); // Clear tasks on error
    } finally {
      setIsLoading(false);
    }
  }, [activeFilter]); // Re-fetch if activeFilter changes, if it's used in API call

  useEffect(() => {
    fetchMyTasks();
  }, [fetchMyTasks]);

  const handleTaskCreated = () => {
    fetchMyTasks(); // Refetch tasks when a new one is created
  };

  const handleTaskStatusChanged = (taskId, updatedTaskData) => {
    // Option 1: Refetch all tasks
    // fetchMyTasks();

    // Option 2: Update the specific task in the local state
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        (task._id || task.id) === taskId
          ? {
              ...task,
              ...updatedTaskData.data,
              taskStatus: updatedTaskData.data.taskStatus || task.taskStatus,
            }
          : task
      )
    );
    // Also, re-calculate status counts if not refetching
    const newStatusCounts = [...statusFilters];
    const currentTasks = tasks.map((task) =>
      (task._id || task.id) === taskId
        ? {
            ...task,
            ...updatedTaskData.data,
            taskStatus: updatedTaskData.data.taskStatus || task.taskStatus,
          }
        : task
    );
    newStatusCounts.forEach((sf) => {
      sf.count = currentTasks.filter(
        (t) =>
          (t.taskStatus?.toLowerCase().replace(/\s+/g, "-") ||
            t.status?.toLowerCase().replace(/\s+/g, "-")) === sf.id
      ).length;
    });
    setStatusFilters(newStatusCounts);
  };

  const handleTaskDeleted = (deletedTaskId) => {
    setTasks((prevTasks) =>
      prevTasks.filter((task) => (task._id || task.id) !== deletedTaskId)
    );
    // Also, re-calculate status counts
    const newStatusCounts = [...statusFilters];
    const remainingTasks = tasks.filter(
      (task) => (task._id || task.id) !== deletedTaskId
    );
    newStatusCounts.forEach((sf) => {
      sf.count = remainingTasks.filter(
        (t) =>
          (t.taskStatus?.toLowerCase().replace(/\s+/g, "-") ||
            t.status?.toLowerCase().replace(/\s+/g, "-")) === sf.id
      ).length;
    });
    setStatusFilters(newStatusCounts);
  };

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() => setIsAssignTaskModalOpen(true)}
            className="bg-emerald-500 hover:bg-emerald-600 text-white flex items-center"
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Assign Task
          </Button>
          <div className="flex flex-wrap gap-2 ml-0 sm:ml-4">
            {dateFilters.map((filter) => (
              <Button
                key={filter.id}
                variant={activeFilter === filter.id ? "default" : "outline"}
                className={`rounded-full px-3 py-1 text-sm h-auto ${
                  activeFilter === filter.id
                    ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                    : ""
                }`}
                onClick={() => setActiveFilter(filter.id)}
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>
        <Button variant="outline" className="flex items-center">
          <Filter className="h-4 w-4 mr-2" /> Filter
        </Button>
      </div>

      <div className="mb-6 border-b">
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {statusFilters.map((filter) => (
            <div
              key={filter.id}
              className="flex items-center gap-2 pb-2 border-b-2 border-transparent hover:border-emerald-500 cursor-pointer"
            >
              <filter.icon className={`h-5 w-5 ${filter.color}`} />
              <span>{filter.label}</span>
              <span className="text-gray-500">- {filter.count}</span>
            </div>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          <p className="ml-2">Loading tasks...</p>
        </div>
      )}

      {!isLoading && error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2" />
          <p>Error: {error}</p>
        </div>
      )}

      {!isLoading && !error && tasks.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => (
            <TaskCard
              key={task._id || task.id || `task-${task.tempKey}`} // Use _id or id, fallback for safety
              task={task}
              onStatusChange={handleTaskStatusChanged}
              onTaskDeleted={handleTaskDeleted} // Pass the delete handler
            />
          ))}
        </div>
      )}

      {!isLoading && !error && tasks.length === 0 && (
        <EmptyState
          icon={<Calendar className="h-16 w-16 text-gray-400" />}
          title="No Tasks Here"
          description="It seems that you don't have any tasks assigned to you for the selected filter."
          className="py-16"
        />
      )}

      <AssignTaskModal
        isOpen={isAssignTaskModalOpen}
        onClose={() => setIsAssignTaskModalOpen(false)}
        onTaskCreated={handleTaskCreated}
      />
    </div>
  );
};

export default MyTasksTab;
