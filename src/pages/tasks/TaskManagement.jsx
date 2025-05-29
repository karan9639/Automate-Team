"use client";

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Button } from "../../components/ui/button";
import { PlusCircle, AlertCircle } from "lucide-react";
import AssignTaskModal from "../../components/modals/AssignTaskModal";
import TaskCard from "../../components/tasks/TaskCard";
import EmptyState from "../../components/common/EmptyState";
import { fetchAllTasks } from "../../store/slices/taskSlice"; // Corrected import

const TaskManagement = () => {
  const dispatch = useDispatch();
  const {
    allTasks: tasks, // Renamed for clarity in this component
    loading,
    error,
  } = useSelector(
    (state) =>
      state.tasks || {
        allTasks: [],
        loading: { allTasks: false },
        error: { allTasks: null },
      }
  );

  const [activeTab, setActiveTab] = useState("my-tasks"); // Default to 'my-tasks' or 'all-tasks'
  const [isAssignTaskModalOpen, setIsAssignTaskModalOpen] = useState(false);

  useEffect(() => {
    // Fetch all tasks initially, or fetch based on activeTab if preferred
    dispatch(fetchAllTasks());
  }, [dispatch]);

  // Log the tasks variable to inspect its structure right before filtering
  console.log("Tasks in TaskManagement before filter:", tasks);
  console.log("Is 'tasks' an array?", Array.isArray(tasks));

  // Ensure tasks is an array before filtering to prevent runtime errors
  const tasksToFilter = Array.isArray(tasks) ? tasks : [];

  // Filter tasks based on active tab
  // TODO: Update filtering logic based on actual user ID and task structure for 'my-tasks' and 'delegated-tasks'
  const filteredTasks = tasksToFilter.filter((task) => {
    if (activeTab === "my-tasks") {
      // Replace "currentUserActualId" with the actual ID of the logged-in user
      // And ensure task.taskAssignedTo stores the user ID directly or is an object with an _id field.
      const currentUserActualId = "1"; // Placeholder: Get this from auth state
      return task.taskAssignedTo === currentUserActualId;
    } else if (activeTab === "delegated-tasks") {
      // Replace "currentUserActualId" with the actual ID of the logged-in user
      const currentUserActualId = "1"; // Placeholder: Get this from auth state
      return (
        task.taskCreatedBy === currentUserActualId &&
        task.taskAssignedTo !== currentUserActualId
      );
    }
    // "all-tasks" tab or if no specific filter applies
    return true;
  });

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Task Management</h1>
        <Button
          onClick={() => setIsAssignTaskModalOpen(true)}
          variant="green"
          className="flex items-center gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          Assign Task
        </Button>
      </div>

      <div className="mb-6">
        <div className="border-b">
          <nav className="flex space-x-8">
            {["my-tasks", "delegated-tasks", "all-tasks"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? "border-emerald-500 text-emerald-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab
                  .split("-")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {error.allTasks && (
        <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-md flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>Error loading tasks: {error.allTasks}</span>
        </div>
      )}

      {loading.allTasks ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
      ) : filteredTasks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map((task) => (
            <TaskCard key={task._id} task={task} />
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
          title={`No ${
            activeTab === "my-tasks"
              ? "Tasks"
              : activeTab === "delegated-tasks"
              ? "Delegated Tasks"
              : "Tasks"
          } Found`}
          description={
            activeTab === "my-tasks"
              ? "You don't have any tasks assigned to you."
              : activeTab === "delegated-tasks"
              ? "You haven't delegated any tasks yet."
              : "There are no tasks in the system."
          }
          className="py-16"
        />
      )}

      <AssignTaskModal
        isOpen={isAssignTaskModalOpen}
        onClose={() => setIsAssignTaskModalOpen(false)}
        task={null}
      />
    </div>
  );
};

export default TaskManagement;
