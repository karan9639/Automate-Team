"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "../../components/ui/button";
import { PlusCircle, AlertCircle, RefreshCw } from "lucide-react";
import TaskCard from "../../components/tasks/TaskCard";
import TaskDetailModal from "../../components/tasks/TaskDetailModal";
import TaskSearchAndFilter from "../../components/tasks/TaskSearchAndFilter";
import AssignTaskModal from "../../components/modals/AssignTaskModal";
import EmptyState from "../../components/common/EmptyState";
import {
  fetchMyTasks,
  selectMyTasks,
  selectTaskLoading,
  selectTaskErrors,
  clearErrors,
} from "../../store/slices/taskSlice";

const MyTasks = () => {
  const dispatch = useDispatch();
  const myTasks = useSelector(selectMyTasks);
  const loading = useSelector(selectTaskLoading);
  const errors = useSelector(selectTaskErrors);

  const [isAssignTaskModalOpen, setIsAssignTaskModalOpen] = useState(false);
  const [isTaskDetailModalOpen, setIsTaskDetailModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [isFiltered, setIsFiltered] = useState(false);

  useEffect(() => {
    dispatch(fetchMyTasks());
  }, [dispatch]);

  useEffect(() => {
    if (!isFiltered) {
      setFilteredTasks(myTasks);
    }
  }, [myTasks, isFiltered]);

  const handleRefresh = () => {
    dispatch(clearErrors());
    dispatch(fetchMyTasks());
  };

  const handleViewTask = (task) => {
    setSelectedTaskId(task._id);
    setIsTaskDetailModalOpen(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setIsAssignTaskModalOpen(true);
  };

  const handleDeleteTask = (task) => {
    // Delete confirmation is handled in TaskCard component
    console.log("Delete task:", task._id);
  };

  const handleSearchFilterResults = (results, type) => {
    if (type === "clear") {
      setFilteredTasks(myTasks);
      setIsFiltered(false);
    } else {
      setFilteredTasks(results);
      setIsFiltered(true);
    }
  };

  const getTaskCountByStatus = (status) => {
    const tasks = isFiltered ? filteredTasks : myTasks;
    return tasks.filter(
      (task) => task.taskStatus?.toLowerCase() === status.toLowerCase()
    ).length;
  };

  const getOverdueCount = () => {
    const tasks = isFiltered ? filteredTasks : myTasks;
    return tasks.filter((task) => {
      if (!task.taskDueDate || task.taskStatus?.toLowerCase() === "completed")
        return false;
      return new Date(task.taskDueDate) < new Date();
    }).length;
  };

  const displayTasks = isFiltered ? filteredTasks : myTasks;

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
          <p className="text-gray-600">Tasks assigned to you</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={loading.myTasks}
            className="flex items-center gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${loading.myTasks ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button
            onClick={() => setIsAssignTaskModalOpen(true)}
            className="bg-emerald-500 hover:bg-emerald-600 text-white flex items-center gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            New Task
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-gray-900">
            {displayTasks.length}
          </div>
          <div className="text-sm text-gray-600">Total Tasks</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-red-600">
            {getOverdueCount()}
          </div>
          <div className="text-sm text-gray-600">Overdue</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-yellow-600">
            {getTaskCountByStatus("Pending")}
          </div>
          <div className="text-sm text-gray-600">Pending</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-blue-600">
            {getTaskCountByStatus("In Progress")}
          </div>
          <div className="text-sm text-gray-600">In Progress</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-green-600">
            {getTaskCountByStatus("Completed")}
          </div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mb-6">
        <TaskSearchAndFilter onResultsChange={handleSearchFilterResults} />
      </div>

      {/* Error Display */}
      {errors.myTasks && (
        <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-md flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>Error loading tasks: {errors.myTasks}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            className="ml-auto"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Tasks List */}
      {loading.myTasks ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
      ) : displayTasks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayTasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onView={handleViewTask}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
              showAssignee={false}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          }
          title={isFiltered ? "No Tasks Found" : "No Tasks Assigned"}
          description={
            isFiltered
              ? "No tasks match your search or filter criteria."
              : "You don't have any tasks assigned to you yet."
          }
          className="py-16"
        />
      )}

      {/* Modals */}
      <AssignTaskModal
        isOpen={isAssignTaskModalOpen}
        onClose={() => {
          setIsAssignTaskModalOpen(false);
          setEditingTask(null);
        }}
        task={editingTask}
      />

      <TaskDetailModal
        isOpen={isTaskDetailModalOpen}
        onClose={() => {
          setIsTaskDetailModalOpen(false);
          setSelectedTaskId(null);
        }}
        taskId={selectedTaskId}
        onEdit={handleEditTask}
        onDelete={handleDeleteTask}
      />
    </div>
  );
};

export default MyTasks;
