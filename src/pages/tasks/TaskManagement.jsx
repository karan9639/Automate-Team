"use client";

import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { PlusCircle, RefreshCw } from "lucide-react";
import AssignTaskModal from "../../components/modals/AssignTaskModal";
import ViewTaskModal from "../../components/modals/ViewTaskModal";
import TaskCard from "../../components/tasks/TaskCard";
import EmptyState from "../../components/common/EmptyState";
import { myTask, deligatedTask, allTask, viewTask } from "../../api/tasksApi";

const TaskManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [tasks, setTasks] = useState([]);
  const [delegatedTasks, setDelegatedTasks] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState("my-tasks");
  const [isAssignTaskModalOpen, setIsAssignTaskModalOpen] = useState(false); // View Task Modal State

  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [selectedTaskData, setSelectedTaskData] = useState(null);
  const [isViewTaskModalOpen, setIsViewTaskModalOpen] = useState(false);
  const [viewTaskLoading, setViewTaskLoading] = useState(false);
  const [viewError, setViewError] = useState(null); // Store a mapping of task titles to their correct IDs from allTasks

  const [taskIdMapping, setTaskIdMapping] = useState({}); // Helper function to extract tasks from different API response structures

  const extractTasksFromResponse = (response) => {
    if (
      response?.data?.data?.tasks &&
      Array.isArray(response.data.data.tasks)
    ) {
      return response.data.data.tasks;
    }

    if (response?.data?.tasks && Array.isArray(response.data.tasks)) {
      return response.data.tasks;
    }

    if (response?.data?.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }

    if (response?.data && Array.isArray(response.data)) {
      return response.data;
    }

    return [];
  }; // Check if a string looks like a MongoDB ObjectId

  const isValidObjectId = (id) => {
    if (!id || typeof id !== "string") return false;
    return /^[0-9a-fA-F]{24}$/.test(id);
  }; // Extract task ID from All Tasks format (this is the correct ID format)

  const extractAllTaskId = (task) => {
    if (!task) return null; // Direct _id field (string format)

    if (task._id && typeof task._id === "string") {
      return task._id;
    } // _id in $oid format

    if (task._id && typeof task._id === "object" && task._id.$oid) {
      return task._id.$oid;
    }

    return null;
  }; // Create a unique key for a task that can be used to match across tabs

  const createTaskMatchKey = (task) => {
    // Use a combination of fields that should be unique and present in both APIs
    const title = task.title || task.taskTitle || task.name || "";
    const dueDate = task.dueDate || task.due_date || task.deadline || "";
    const assignedTo = task.assignedTo?.name || task.assigned_to?.name || "";

    return `${title}|${dueDate}|${assignedTo}`.toLowerCase().trim();
  }; // Build a mapping of task match keys to their correct IDs from allTasks

  const buildTaskIdMapping = (allTasksData) => {
    const mapping = {};

    allTasksData.forEach((task) => {
      const id = extractAllTaskId(task);
      if (id) {
        const matchKey = createTaskMatchKey(task);
        mapping[matchKey] = id;
      }
    });

    return mapping;
  }; // Get the correct ID for a task using the mapping

  const getCorrectTaskId = (task) => {
    const matchKey = createTaskMatchKey(task);
    const correctId = taskIdMapping[matchKey];

    if (correctId) {
      return correctId;
    } // Fallback to whatever ID we can find in the task // Direct _id field (string format)

    if (task._id && typeof task._id === "string") {
      return task._id;
    } // _id in $oid format

    if (task._id && typeof task._id === "object" && task._id.$oid) {
      return task._id.$oid;
    } // Check other common ID fields

    const idFields = ["id", "taskId", "task_id"];
    for (const field of idFields) {
      if (task[field]) {
        if (typeof task[field] === "object" && task[field].$oid) {
          return task[field].$oid;
        }
        if (
          typeof task[field] === "string" ||
          typeof task[field] === "number"
        ) {
          return String(task[field]);
        }
      }
    }

    return null;
  }; // NORMALIZE TASK: Ensure task._id is always the correct string ID

  const normalizeTask = (task) => {
    const correctId = getCorrectTaskId(task);

    if (correctId) {
      return {
        ...task,
        _id: correctId, // Set the correct ID as string
      };
    }

    return task;
  }; // NORMALIZE ALL TASKS: Ensure all tasks have task._id as the correct string ID

  const normalizeAllTasks = (tasks) => {
    const normalizedTasks = tasks.map((task) => {
      return normalizeTask(task);
    });

    return normalizedTasks;
  }; // SIMPLE ID EXTRACTION: Now task._id is always a string

  const extractTaskId = (task) => {
    if (task._id && typeof task._id === "string") {
      return task._id;
    }

    return null;
  }; // API CALL: Use extracted ID to call view API

  const fetchTaskDetails = async (taskId, task, tabName) => {
    try {
      setViewTaskLoading(true);
      setViewError(null);

      if (!taskId) {
        setSelectedTaskData(task);
        setViewError("No task ID found - showing local data");
        return;
      }

      const response = await viewTask(taskId); // Extract task data from response

      let taskData = null;

      if (response?.data?.data) {
        taskData = response.data.data;
      } else if (response?.data?.task) {
        taskData = response.data.task;
      } else if (response?.data) {
        taskData = response.data;
      }

      if (taskData) {
        setSelectedTaskData(taskData);
        setViewError(null);
      } else {
        setSelectedTaskData(task);
        setViewError("API returned no data - showing local data");
      }
    } catch (err) {
      setSelectedTaskData(task);
      setViewError(`API Error: ${err.response?.data?.message || err.message}`);
    } finally {
      setViewTaskLoading(false);
    }
  }; // TASK CLICK: Handle task card click for all tabs

  const handleTaskClick = (task, taskIndex) => {
    // Extract task ID (should always be string now)
    const taskId = extractTaskId(task); // Always open modal

    setSelectedTaskId(taskId);
    setSelectedTaskData(null);
    setIsViewTaskModalOpen(true);
    setViewError(null); // Update URL with ID

    if (taskId) {
      setSearchParams({ id: taskId });
    } // Call API with extracted ID

    if (taskId) {
      fetchTaskDetails(taskId, task, activeTab);
    } else {
      setSelectedTaskData(task);
      setViewError("No task ID found");
      setViewTaskLoading(false);
    }
  }; // Handle modal close

  const handleViewTaskModalClose = () => {
    setIsViewTaskModalOpen(false);
    setSelectedTaskId(null);
    setSelectedTaskData(null);
    setViewError(null);
    setViewTaskLoading(false);
    setSearchParams({});
  }; // Check for task ID in URL on component mount and URL changes

  useEffect(() => {
    const taskId = searchParams.get("id");
    if (taskId && taskId !== selectedTaskId) {
      setSelectedTaskId(taskId);
      setIsViewTaskModalOpen(true);

      const currentTasks = getCurrentTasks();
      const foundTask = currentTasks.find((t) => extractTaskId(t) === taskId);

      fetchTaskDetails(taskId, foundTask, activeTab);
    }
  }, [searchParams, selectedTaskId]); // First, fetch All Tasks to build the ID mapping

  const fetchAllTasksFirst = async () => {
    try {
      const response = await allTask();

      const taskData =
        response?.data?.data?.tasks || extractTasksFromResponse(response); // Build the mapping of task match keys to correct IDs

      const mapping = buildTaskIdMapping(taskData);
      setTaskIdMapping(mapping); // Store the normalized all tasks

      const normalizedAllTasks = taskData.map((task) => {
        const id = extractAllTaskId(task);
        if (id) {
          return { ...task, _id: id };
        }
        return task;
      });

      setAllTasks(normalizedAllTasks); // Now fetch the tasks for the active tab

      fetchTasksForTab(activeTab);
    } catch (err) {
      // Still try to fetch the active tab tasks
      fetchTasksForTab(activeTab);
    }
  }; // Fetch My Tasks and NORMALIZE with correct IDs

  const fetchMyTasks = async () => {
    if (loading) return;

    try {
      setLoading(true);
      setError(null);

      const response = await myTask();

      const taskData = extractTasksFromResponse(response); // NORMALIZE: Make task._id the correct string ID from All Tasks

      const normalizedTasks = normalizeAllTasks(taskData);

      setTasks(normalizedTasks);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }; // Fetch Delegated Tasks and NORMALIZE with correct IDs

  const fetchDelegatedTasks = async () => {
    if (loading) return;

    try {
      setLoading(true);
      setError(null);

      const response = await deligatedTask();

      const taskData = extractTasksFromResponse(response); // NORMALIZE: Make task._id the correct string ID from All Tasks

      const normalizedTasks = normalizeAllTasks(taskData);

      setDelegatedTasks(normalizedTasks);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }; // Fetch All Tasks (when switching to All Tasks tab)

  const fetchAllTasksForTab = async () => {
    if (loading) return;

    try {
      setLoading(true);
      setError(null); // Always fetch All Tasks when switching to the tab (not just when empty)

      const response = await allTask();

      const taskData =
        response?.data?.data?.tasks || extractTasksFromResponse(response); // Normalize all tasks (should already have correct IDs)

      const normalizedAllTasks = taskData.map((task) => {
        const id = extractAllTaskId(task);
        if (id) {
          return { ...task, _id: id };
        }
        return task;
      });

      setAllTasks(normalizedAllTasks);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }; // Fetch tasks based on active tab

  const fetchTasksForTab = (tab) => {
    if (tab === "my-tasks") {
      fetchMyTasks();
    } else if (tab === "delegated-tasks") {
      fetchDelegatedTasks();
    } else if (tab === "all-tasks") {
      fetchAllTasksForTab();
    }
  }; // Initial fetch on component mount - first get All Tasks for ID mapping

  useEffect(() => {
    fetchAllTasksFirst();
  }, []); // When tab changes, fetch the appropriate tasks

  useEffect(() => {
    if (Object.keys(taskIdMapping).length > 0) {
      fetchTasksForTab(activeTab);
    }
  }, [activeTab, taskIdMapping]);

  const handleRefresh = () => {
    if (activeTab === "all-tasks") {
      // If refreshing All Tasks, rebuild the ID mapping
      fetchAllTasksFirst();
    } else {
      // Otherwise just refresh the current tab
      fetchTasksForTab(activeTab);
    }
  }; // Handle tab change

  const handleTabChange = (tab) => {
    setActiveTab(tab);

    if (isViewTaskModalOpen) {
      handleViewTaskModalClose();
    }
  }; // Get the appropriate tasks based on active tab

  const getCurrentTasks = () => {
    switch (activeTab) {
      case "my-tasks":
        return tasks;
      case "delegated-tasks":
        return delegatedTasks;
      case "all-tasks":
        return allTasks;
      default:
        return [];
    }
  };

  const currentTasks = getCurrentTasks();

  return (
    <div className="container mx-auto px-4 py-6">
           {" "}
      <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Task Management</h1>       {" "}
        <div className="flex items-center gap-3">
                   {" "}
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={loading}
            className="flex items-center gap-2"
          >
                       {" "}
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                        Refresh          {" "}
          </Button>
                   {" "}
          <Button
            onClick={() => setIsAssignTaskModalOpen(true)}
            variant="green"
            className="flex items-center gap-2"
          >
                        <PlusCircle className="h-4 w-4" />            Assign
            Task          {" "}
          </Button>
                 {" "}
        </div>
             {" "}
      </div>
           {" "}
      <div className="mb-6">
               {" "}
        <div className="border-b">
                   {" "}
          <nav className="flex space-x-8">
                       {" "}
            {["my-tasks", "delegated-tasks", "all-tasks"].map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? "border-emerald-500 text-emerald-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                               {" "}
                {tab.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                             {" "}
              </button>
            ))}
                     {" "}
          </nav>
                 {" "}
        </div>
             {" "}
      </div>
            {/* Error Display */}     {" "}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
                   {" "}
          <div className="flex items-start">
                       {" "}
            <div className="flex-1">
                           {" "}
              <h3 className="font-medium">
                Error loading {activeTab.replace("-", " ")}
              </h3>
                           {" "}
              <p className="text-sm mt-1">
                               {" "}
                {error.response?.data?.message ||
                  error.message ||
                  "Unknown error occurred"}
                             {" "}
              </p>
                           {" "}
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                className="mt-2"
                disabled={loading}
              >
                                Try Again              {" "}
              </Button>
                         {" "}
            </div>
                     {" "}
          </div>
                 {" "}
        </div>
      )}
           {" "}
      {loading ? (
        <div className="flex flex-col justify-center items-center py-12">
                   {" "}
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mb-4"></div>
                   {" "}
          <p className="text-gray-600">
                        Loading            {" "}
            {activeTab === "my-tasks"
              ? "your tasks"
              : activeTab === "delegated-tasks"
              ? "delegated tasks"
              : "all tasks"}
                        ...          {" "}
          </p>
                 {" "}
        </div>
      ) : currentTasks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                   {" "}
          {currentTasks.map((task, index) => {
            const taskId = extractTaskId(task);
            return (
              <TaskCard
                key={taskId || `task-${index}`}
                task={task}
                onClick={() => {
                  handleTaskClick(task, index);
                }}
              />
            );
          })}
                 {" "}
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
                           {" "}
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
                         {" "}
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
            {/* Modals */}     {" "}
      <AssignTaskModal
        isOpen={isAssignTaskModalOpen}
        onClose={() => setIsAssignTaskModalOpen(false)}
        task={null}
        onSuccess={() => {
          setIsAssignTaskModalOpen(false);
          fetchTasksForTab(activeTab);
        }}
      />
           {" "}
      <ViewTaskModal
        isOpen={isViewTaskModalOpen}
        onClose={handleViewTaskModalClose}
        task={selectedTaskData}
        loading={viewTaskLoading}
        error={viewError}
      />
         {" "}
    </div>
  );
};

export default TaskManagement;
