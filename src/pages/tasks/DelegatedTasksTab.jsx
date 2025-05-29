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
  fetchDelegatedTasks,
  selectDelegatedTasks,
  selectTaskLoading,
  selectTaskErrors,
  clearErrors,
} from "../../store/slices/taskSlice";

const DelegatedTasksTab = () => {
  const dispatch = useDispatch();
  const delegatedTasks = useSelector(selectDelegatedTasks);
  const loading = useSelector(selectTaskLoading);
  const errors = useSelector(selectTaskErrors);

  const [isAssignTaskModalOpen, setIsAssignTaskModalOpen] = useState(false);
  const [isTaskDetailModalOpen, setIsTaskDetailModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [isFiltered, setIsFiltered] = useState(false);

  useEffect(() => {
    dispatch(fetchDelegatedTasks());
  }, [dispatch]);

  useEffect(() => {
    if (!isFiltered) {
      setFilteredTasks(delegatedTasks);
    }
  }, [delegatedTasks, isFiltered]);

  const handleRefresh = () => {
    dispatch(clearErrors());
    dispatch(fetchDelegatedTasks());
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
    console.log("Delete task:", task._id);
  };

  const handleSearchFilterResults = (results, type) => {
    if (type === "clear") {
      setFilteredTasks(delegatedTasks);
      setIsFiltered(false);
    } else {
      setFilteredTasks(results);
      setIsFiltered(true);
    }
  };

  const getTaskCountByStatus = (status) => {
    const tasks = isFiltered ? filteredTasks : delegatedTasks;
    return tasks.filter(
      (task) => task.taskStatus?.toLowerCase() === status.toLowerCase()
    ).length;
  };

  const displayTasks = isFiltered ? filteredTasks : delegatedTasks;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Delegated Tasks
          </h2>
          <p className="text-gray-600">Tasks you have assigned to others</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={loading.delegatedTasks}
            className="flex items-center gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                loading.delegatedTasks ? "animate-spin" : ""
              }`}
            />
            Refresh
          </Button>
          <Button
            onClick={() => setIsAssignTaskModalOpen(true)}
            className="bg-emerald-500 hover:bg-emerald-600 text-white flex items-center gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Assign Task
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-gray-900">
            {displayTasks.length}
          </div>
          <div className="text-sm text-gray-600">Total Delegated</div>
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
      <TaskSearchAndFilter onResultsChange={handleSearchFilterResults} />

      {/* Error Display */}
      {errors.delegatedTasks && (
        <div className="p-4 bg-red-50 text-red-600 rounded-md flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>Error loading delegated tasks: {errors.delegatedTasks}</span>
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
      {loading.delegatedTasks ? (
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
              showAssignee={true}
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          }
          title={isFiltered ? "No Tasks Found" : "No Delegated Tasks"}
          description={
            isFiltered
              ? "No tasks match your search or filter criteria."
              : "You haven't delegated any tasks yet."
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

export default DelegatedTasksTab;
