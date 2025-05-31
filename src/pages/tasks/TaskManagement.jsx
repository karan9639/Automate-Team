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
  const [isAssignTaskModalOpen, setIsAssignTaskModalOpen] = useState(false);

  // View Task Modal State
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [selectedTaskData, setSelectedTaskData] = useState(null);
  const [isViewTaskModalOpen, setIsViewTaskModalOpen] = useState(false);
  const [viewTaskLoading, setViewTaskLoading] = useState(false);
  const [viewError, setViewError] = useState(null);

  // Store a mapping of task titles to their correct IDs from allTasks
  const [taskIdMapping, setTaskIdMapping] = useState({});
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Helper function to extract tasks from different API response structures
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
  };

  // Extract task ID from All Tasks format (this is the correct ID format)
  const extractAllTaskId = (task) => {
    if (!task) return null;

    // Direct _id field (string format)
    if (task._id && typeof task._id === "string") {
      return task._id;
    }

    // _id in $oid format
    if (task._id && typeof task._id === "object" && task._id.$oid) {
      return task._id.$oid;
    }

    return null;
  };

  // Create a unique key for a task that can be used to match across tabs
  const createTaskMatchKey = (task) => {
    // Use a combination of fields that should be unique and present in both APIs
    const title = task.title || task.taskTitle || task.name || "";
    const dueDate = task.dueDate || task.due_date || task.deadline || "";
    const assignedTo = task.assignedTo?.name || task.assigned_to?.name || "";

    return `${title}|${dueDate}|${assignedTo}`.toLowerCase().trim();
  };

  // Build a mapping of task match keys to their correct IDs from allTasks
  const buildTaskIdMapping = (allTasksData) => {
    const mapping = {};
    const titleMapping = {}; // Additional mapping by title only
    const idMapping = {}; // Direct ID mapping

    allTasksData.forEach((task, index) => {
      const id = extractAllTaskId(task);
      if (id) {
        // Primary mapping using full match key
        const matchKey = createTaskMatchKey(task);
        mapping[matchKey] = id;

        // Secondary mapping using just title (fallback)
        const title = (task.title || task.taskTitle || task.name || "")
          .toLowerCase()
          .trim();
        if (title) {
          titleMapping[title] = id;
        }

        // Tertiary mapping using any existing ID fields
        if (task._id) {
          if (typeof task._id === "string") {
            idMapping[task._id] = id;
          } else if (task._id.$oid) {
            idMapping[task._id.$oid] = id;
          }
        }
      }
    });

    // Store all mappings in a single object
    const enhancedMapping = {
      ...mapping,
      titleMapping,
      idMapping,
    };

    return enhancedMapping;
  };

  // Get the correct ID for a task using enhanced mapping
  const getCorrectTaskId = (task) => {
    // Method 1: Try full match key
    const matchKey = createTaskMatchKey(task);
    let correctId = taskIdMapping[matchKey];

    if (correctId) {
      return correctId;
    }

    // Method 2: Try title-only mapping
    const title = (task.title || task.taskTitle || task.name || "")
      .toLowerCase()
      .trim();
    if (title && taskIdMapping.titleMapping) {
      correctId = taskIdMapping.titleMapping[title];
      if (correctId) {
        return correctId;
      }
    }

    // Method 3: Try direct ID mapping
    if (taskIdMapping.idMapping) {
      // Check current _id
      if (task._id) {
        const currentId =
          typeof task._id === "string" ? task._id : task._id.$oid;
        correctId = taskIdMapping.idMapping[currentId];
        if (correctId) {
          return correctId;
        }
      }

      // Check other ID fields
      const idFields = ["id", "taskId", "task_id"];
      for (const field of idFields) {
        if (task[field]) {
          const fieldValue =
            typeof task[field] === "object"
              ? task[field].$oid
              : String(task[field]);
          correctId = taskIdMapping.idMapping[fieldValue];
          if (correctId) {
            return correctId;
          }
        }
      }
    }

    // Method 4: Fallback to original extraction
    if (task._id && typeof task._id === "string") {
      return task._id;
    }

    if (task._id && typeof task._id === "object" && task._id.$oid) {
      return task._id.$oid;
    }

    // Check other common ID fields
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
  };

  // Normalize task with correct ID
  const normalizeTask = (task) => {
    const correctId = getCorrectTaskId(task);

    if (correctId) {
      return {
        ...task,
        _id: correctId,
      };
    }

    return task;
  };

  // Normalize all tasks
  const normalizeAllTasks = (tasks) => {
    return tasks.map((task) => normalizeTask(task));
  };

  // Extract task ID
  const extractTaskId = (task) => {
    if (task._id && typeof task._id === "string") {
      return task._id;
    }
    return null;
  };

  // API CALL: Use extracted ID to call view API
  const fetchTaskDetails = async (taskId, task, tabName) => {
    try {
      setViewTaskLoading(true);
      setViewError(null);

      if (!taskId) {
        setSelectedTaskData(task);
        setViewError("No task ID found - showing local data");
        return;
      }

      const response = await viewTask(taskId);

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
  };

  // Handle task card click
  const handleTaskClick = (task, taskIndex) => {
    const taskId = extractTaskId(task);

    setSelectedTaskId(taskId);
    setSelectedTaskData(null);
    setIsViewTaskModalOpen(true);
    setViewError(null);

    if (taskId) {
      setSearchParams({ id: taskId });
      fetchTaskDetails(taskId, task, activeTab);
    } else {
      setSelectedTaskData(task);
      setViewError("No task ID found");
      setViewTaskLoading(false);
    }
  };

  // Handle modal close
  const handleViewTaskModalClose = () => {
    setIsViewTaskModalOpen(false);
    setSelectedTaskId(null);
    setSelectedTaskData(null);
    setViewError(null);
    setViewTaskLoading(false);
    setSearchParams({});
  };

  // Handle task update from modal
  const handleTaskUpdate = (taskId, updatedData) => {
    // Trigger a refresh to get the latest data
    setRefreshTrigger((prev) => prev + 1);
  };

  // Handle refresh
  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);

    if (isViewTaskModalOpen) {
      handleViewTaskModalClose();
    }
  };

  // Get the appropriate tasks based on active tab
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

  // USEEFFECT: Fetch All Tasks (for ID mapping) - runs on mount and refresh
  useEffect(() => {
    const fetchAllTasksData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await allTask();
        const taskData =
          response?.data?.data?.tasks || extractTasksFromResponse(response);

        // Build the mapping of task match keys to correct IDs
        const mapping = buildTaskIdMapping(taskData);
        setTaskIdMapping(mapping);

        // Store the normalized all tasks
        //    const normalizedAllTasks = taskData.map((task) => {
        //      const id = extractAllTaskId(task)
        //      if (id) {
        //        return { ...task, _id: id }
        //      }
        //      return task
        //    })
        //    setAllTasks(normalizedAllTasks)
        const processedAllTasks = [];
        const seenAllTaskIds = new Set();
        taskData.forEach((task) => {
          const id = extractAllTaskId(task); // Get the ID that will be used as _id
          if (id) {
            if (!seenAllTaskIds.has(id)) {
              processedAllTasks.push({ ...task, _id: id }); // Store with string _id
              seenAllTaskIds.add(id);
            } else {
              console.warn(
                `[fetchAllTasksData] Duplicate task ID ${id} found in source data from allTask API. Skipping.`
              );
            }
          } else {
            console.warn(
              "[fetchAllTasksData] Task from allTask API without a valid ID, skipping:",
              task
            );
          }
        });
        setAllTasks(processedAllTasks);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllTasksData();
  }, [refreshTrigger]);

  // USEEFFECT: Fetch My Tasks - runs when tab is active, mapping is ready, or refresh
  useEffect(() => {
    if (activeTab !== "my-tasks" || Object.keys(taskIdMapping).length === 0)
      return;

    const fetchMyTasksData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await myTask();
        const taskData = extractTasksFromResponse(response);
        //    const normalizedTasks = normalizeAllTasks(taskData)
        //    setTasks(normalizedTasks)
        const processedMyTasks = [];
        const seenMyTaskIds = new Set();
        taskData.forEach((originalTask) => {
          const normalizedTask = normalizeTask(originalTask); // Applies mapping, sets _id
          const id = normalizedTask._id; // Should be a string if normalization worked

          if (id && typeof id === "string") {
            if (!seenMyTaskIds.has(id)) {
              processedMyTasks.push(normalizedTask);
              seenMyTaskIds.add(id);
            } else {
              console.warn(
                `[fetchMyTasksData] Duplicate task ID ${id} after normalization. Skipping.`
              );
            }
          } else {
            // Task couldn't be normalized to a string ID.
            // It will use index-based key. Add it but log.
            processedMyTasks.push(normalizedTask);
            console.warn(
              "[fetchMyTasksData] Task without a proper string _id after normalization:",
              normalizedTask
            );
          }
        });
        setTasks(processedMyTasks);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyTasksData();
  }, [activeTab, taskIdMapping, refreshTrigger]);

  // USEEFFECT: Fetch Delegated Tasks - runs when tab is active, mapping is ready, or refresh
  useEffect(() => {
    if (
      activeTab !== "delegated-tasks" ||
      Object.keys(taskIdMapping).length === 0
    )
      return;

    const fetchDelegatedTasksData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await deligatedTask();
        const taskData = extractTasksFromResponse(response);
        //    const normalizedTasks = normalizeAllTasks(taskData)
        //    setDelegatedTasks(normalizedTasks)
        const processedDelegatedTasks = [];
        const seenDelegatedTaskIds = new Set();
        taskData.forEach((originalTask) => {
          const normalizedTask = normalizeTask(originalTask); // Applies mapping, sets _id
          const id = normalizedTask._id; // Should be a string if normalization worked

          if (id && typeof id === "string") {
            if (!seenDelegatedTaskIds.has(id)) {
              processedDelegatedTasks.push(normalizedTask);
              seenDelegatedTaskIds.add(id);
            } else {
              console.warn(
                `[fetchDelegatedTasksData] Duplicate task ID ${id} after normalization. Skipping.`
              );
            }
          } else {
            processedDelegatedTasks.push(normalizedTask);
            console.warn(
              "[fetchDelegatedTasksData] Task without a proper string _id after normalization:",
              normalizedTask
            );
          }
        });
        setDelegatedTasks(processedDelegatedTasks);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDelegatedTasksData();
  }, [activeTab, taskIdMapping, refreshTrigger]);

  // USEEFFECT: Refresh All Tasks when tab is active - runs when tab is active or refresh
  useEffect(() => {
    if (activeTab !== "all-tasks") return;

    const refreshAllTasksData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await allTask();
        const taskData =
          response?.data?.data?.tasks || extractTasksFromResponse(response);

        // Update mapping if needed
        const mapping = buildTaskIdMapping(taskData);
        setTaskIdMapping(mapping);

        // Normalize all tasks
        //    const normalizedAllTasks = taskData.map((task) => {
        //      const id = extractAllTaskId(task)
        //      if (id) {
        //        return { ...task, _id: id }
        //      }
        //      return task
        //    })
        //    setAllTasks(normalizedAllTasks)
        const processedRefreshedAllTasks = [];
        const seenRefreshedAllTaskIds = new Set();
        taskData.forEach((task) => {
          const id = extractAllTaskId(task);
          if (id) {
            if (!seenRefreshedAllTaskIds.has(id)) {
              processedRefreshedAllTasks.push({ ...task, _id: id });
              seenRefreshedAllTaskIds.add(id);
            } else {
              console.warn(
                `[refreshAllTasksData] Duplicate task ID ${id} found in source data from allTask API. Skipping.`
              );
            }
          } else {
            console.warn(
              "[refreshAllTasksData] Task from allTask API without a valid ID, skipping:",
              task
            );
          }
        });
        setAllTasks(processedRefreshedAllTasks);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    refreshAllTasksData();
  }, [activeTab, refreshTrigger]);

  // USEEFFECT: Check for task ID in URL
  useEffect(() => {
    const taskId = searchParams.get("id");
    if (taskId && taskId !== selectedTaskId) {
      setSelectedTaskId(taskId);
      setIsViewTaskModalOpen(true);

      const currentTasks = getCurrentTasks();
      const foundTask = currentTasks.find((t) => extractTaskId(t) === taskId);

      fetchTaskDetails(taskId, foundTask, activeTab);
    }
  }, [searchParams, selectedTaskId, tasks, delegatedTasks, allTasks]);

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
            className="flex items-center gap-2 bg-[#10b981] hover:bg-[#059669] text-white"
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
                        Loading{" "}
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
          handleRefresh();
        }}
      />
           {" "}
      <ViewTaskModal
        isOpen={isViewTaskModalOpen}
        onClose={handleViewTaskModalClose}
        task={selectedTaskData}
        loading={viewTaskLoading}
        error={viewError}
        isFromDelegatedTab={activeTab === "delegated-tasks"}
        onTaskUpdate={handleTaskUpdate}
      />
         {" "}
    </div>
  );
};

export default TaskManagement;
