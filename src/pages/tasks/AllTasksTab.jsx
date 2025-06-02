"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  PlusCircle,
  Loader2,
  AlertTriangle,
  Search,
  ListFilter,
  LayoutGrid,
  LayoutList,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import EmptyState from "../../components/common/EmptyState";
import TaskCard from "../../components/tasks/TaskCard";
import TaskTable from "../../components/TaskTable"; // Assuming you have this
import AssignTaskModal from "../../components/modals/AssignTaskModal";
import { taskApi } from "../../api/taskApi";
import toast from "react-hot-toast";
import TaskDetailModal from "../../components/tasks/TaskDetailModal"; // Import TaskDetailModal

const AllTasksTab = () => {
  const [isAssignTaskModalOpen, setIsAssignTaskModalOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTask, setSelectedTask] = useState(null); // For TaskDetailModal
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false); // For TaskDetailModal
  // Add this state for tracking task selection
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  const fetchAllTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    // Create an AbortController for cleanup
    const abortController = new AbortController();
    const signal = abortController.signal;

    try {
      const response = await taskApi.getAllTasks(signal); // Pass signal to API call if your API supports it

      // Check if component is still mounted (signal not aborted)
      if (signal.aborted) return;

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
            console.warn("Task without a valid ID found in AllTasks:", task);
          }
        });
      }

      setTasks(uniqueTasks);
    } catch (err) {
      // Don't update state if the request was aborted
      if (err.name === "AbortError") return;

      const errorMessage =
        err.response?.data?.message || err.message || "Failed to load tasks.";
      setError(errorMessage);
      toast.error(errorMessage);
      setTasks([]);
    } finally {
      // Only update loading state if not aborted
      if (!signal.aborted) {
        setIsLoading(false);
      }
    }

    // Return the abort controller for cleanup
    return abortController;
  }, []);

  useEffect(() => {
    const abortController = fetchAllTasks();

    // Cleanup function to abort any in-flight requests when unmounting
    // or when dependencies change
    return () => {
      abortController?.abort();
    };
  }, [fetchAllTasks]);

  const handleTaskCreated = () => {
    fetchAllTasks();
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

  // Replace the handleTaskClick function with this:
  const handleTaskClick = (task) => {
    setSelectedTaskId(task._id || task.id);
  };

  // Add this useEffect to handle modal opening after state update
  useEffect(() => {
    if (selectedTaskId) {
      // Find the selected task
      const task = tasks.find(
        (task) => (task._id || task.id) === selectedTaskId
      );
      if (task) {
        setSelectedTask(task);
        setIsDetailModalOpen(true);
      }
    }
  }, [selectedTaskId, tasks]);

  // Add this function to reset modal state
  const handleCloseModal = () => {
    setIsDetailModalOpen(false);
    setSelectedTask(null);
    setSelectedTaskId(null);
  };

  const filteredTasks = tasks.filter(
    (task) =>
      (task.taskTitle || task.title || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (task.taskDescription || task.description || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div className="flex items-center gap-2 flex-grow sm:flex-grow-0">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Search tasks..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="hidden sm:flex">
            <ListFilter className="h-4 w-4 mr-2" /> Filters
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewMode("grid")}
            aria-label="Grid view"
          >
            <LayoutGrid className="h-5 w-5" />
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewMode("list")}
            aria-label="List view"
          >
            <LayoutList className="h-5 w-5" />
          </Button>
          <Button
            onClick={() => setIsAssignTaskModalOpen(true)}
            className="bg-emerald-500 hover:bg-emerald-600 text-white"
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Create Task
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          <p className="ml-2">Loading all tasks...</p>
        </div>
      )}

      {!isLoading && error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2" />
          <p>Error: {error}</p>
        </div>
      )}

      {!isLoading && !error && filteredTasks.length > 0 && (
        <>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task._id || task.id}
                  task={task}
                  onClick={() => handleTaskClick(task)}
                  onStatusChange={handleTaskStatusChanged}
                  onTaskDeleted={handleTaskDeleted}
                />
              ))}
            </div>
          ) : (
            <TaskTable
              tasks={filteredTasks}
              onTaskClick={handleTaskClick}
              onStatusChange={handleTaskStatusChanged}
              onTaskDeleted={handleTaskDeleted}
            />
          )}
        </>
      )}

      {!isLoading && !error && filteredTasks.length === 0 && (
        <EmptyState
          icon={<Calendar className="h-16 w-16 text-gray-400" />}
          title="No Tasks Found"
          description={
            searchTerm
              ? "No tasks match your search criteria."
              : "There are no tasks in the system yet. Try creating one!"
          }
          className="py-16"
        />
      )}

      <AssignTaskModal
        isOpen={isAssignTaskModalOpen}
        onClose={() => setIsAssignTaskModalOpen(false)}
        onTaskCreated={handleTaskCreated}
      />
      {selectedTask && (
        <TaskDetailModal
          isOpen={isDetailModalOpen}
          onClose={handleCloseModal}
          task={selectedTask}
          onTaskUpdated={() => {
            fetchAllTasks();
            handleTaskStatusChanged(selectedTask._id || selectedTask.id, {
              data: selectedTask,
            });
          }}
        />
      )}
    </div>
  );
};

export default AllTasksTab;
