"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  Filter,
  PlusCircle,
  Loader2,
  AlertTriangle,
  Users,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import EmptyState from "../../components/common/EmptyState";
import AssignTaskModal from "../../components/modals/AssignTaskModal";
import TaskCard from "../../components/tasks/TaskCard";
import { taskApi } from "../../api/taskApi";
import toast from "react-hot-toast";
import TaskDetailModal from "../../components/tasks/TaskDetailModal";

const DelegatedTasksTab = () => {
  const [isAssignTaskModalOpen, setIsAssignTaskModalOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const fetchDelegatedTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await taskApi.getDelegatedTasks();
      const tasksData =
        response.data?.data || response.data?.tasks || response.data || [];

      const uniqueTasks = [];
      const taskIds = new Set();
      if (Array.isArray(tasksData)) {
        tasksData.forEach((task) => {
          const taskId = task._id || task.id;
          if (taskId && !taskIds.has(taskId)) {
            uniqueTasks.push(task);
            taskIds.add(taskId);
          } else if (!taskId) {
            console.warn(
              "Task without a valid ID found in DelegatedTasks:",
              task
            );
          }
        });
      }
      setTasks(uniqueTasks);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to load delegated tasks.";
      setError(errorMessage);
      toast.error(errorMessage);
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDelegatedTasks();
  }, [fetchDelegatedTasks]);

  const handleTaskCreated = () => {
    fetchDelegatedTasks();
  };

  const handleTaskStatusChanged = (taskId, updatedTaskData) => {
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
  };

  const handleTaskDeleted = (deletedTaskId) => {
    setTasks((prevTasks) =>
      prevTasks.filter((task) => (task._id || task.id) !== deletedTaskId)
    );
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setIsDetailModalOpen(true);
  };

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <h2 className="text-xl font-semibold flex items-center">
          <Users className="mr-2 h-6 w-6 text-emerald-500" />
          Tasks You've Delegated
        </h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="hidden sm:flex">
            <Filter className="h-4 w-4 mr-2" /> Filter
          </Button>
          <Button
            onClick={() => setIsAssignTaskModalOpen(true)}
            className="bg-emerald-500 hover:bg-emerald-600 text-white"
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Delegate New Task
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          <p className="ml-2">Loading delegated tasks...</p>
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
              key={task._id || task.id}
              task={task}
              onClick={() => handleTaskClick(task)}
              onStatusChange={handleTaskStatusChanged}
              onTaskDeleted={handleTaskDeleted}
            />
          ))}
        </div>
      )}

      {!isLoading && !error && tasks.length === 0 && (
        <EmptyState
          icon={<Calendar className="h-16 w-16 text-gray-400" />}
          title="No Delegated Tasks"
          description="You haven't delegated any tasks yet, or all delegated tasks are completed and filtered out."
          className="py-16"
        />
      )}

      <AssignTaskModal
        isOpen={isAssignTaskModalOpen}
        onClose={() => setIsAssignTaskModalOpen(false)}
        onTaskCreated={handleTaskCreated}
        // Potentially pass a prop to pre-fill delegator if needed
      />
      {selectedTask && (
        <TaskDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedTask(null);
          }}
          task={selectedTask}
          onTaskUpdated={() => {
            fetchDelegatedTasks(); // Refetch tasks if updated from detail modal
            handleTaskStatusChanged(selectedTask._id || selectedTask.id, {
              data: selectedTask,
            });
          }}
        />
      )}
    </div>
  );
};

export default DelegatedTasksTab;
