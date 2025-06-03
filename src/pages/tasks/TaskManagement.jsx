"use client";

import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { PlusCircle, RefreshCw, Filter, X } from "lucide-react";
import AssignTaskModal from "../../components/modals/AssignTaskModal";
import ViewTaskModal from "../../components/modals/ViewTaskModal";
import TaskCard from "../../components/tasks/TaskCard";
import EmptyState from "../../components/common/EmptyState";
import {
  myTask,
  delegatedTask,
  allTask,
  viewTask,
  filterTask,
} from "../../api/tasksApi";

const TaskManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [tasks, setTasks] = useState([]);
  const [delegatedTasks, setDelegatedTasks] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState("my-tasks");
  const [isAssignTaskModalOpen, setIsAssignTaskModalOpen] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    taskCategory: "",
    taskPriority: "",
    taskStatus: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [isFilterLoading, setIsFilterLoading] = useState(false);

  // View Task Modal State
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [selectedTaskData, setSelectedTaskData] = useState(null);
  const [isViewTaskModalOpen, setIsViewTaskModalOpen] = useState(false);
  const [viewTaskLoading, setViewTaskLoading] = useState(false);
  const [viewError, setViewError] = useState(null);

  // Store a mapping of task titles to their correct IDs from allTasks
  const [taskIdMapping, setTaskIdMapping] = useState({});
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Filter options
  const filterOptions = {
    taskCategory: [
      { value: "", label: "All Categories" },
      { value: "Development", label: "Development" },
      { value: "Design", label: "Design" },
      { value: "Marketing", label: "Marketing" },
      { value: "Operations", label: "Operations" },
    ],
    taskPriority: [
      { value: "", label: "All Priorities" },
      { value: "Low", label: "Low" },
      { value: "Medium", label: "Medium" },
      { value: "High", label: "High" },
    ],
    taskStatus: [
      { value: "", label: "All Status" },
      { value: "Overdue", label: "Overdue" },
      { value: "In Progress", label: "In Progress" },
      { value: "Pending", label: "Pending" },
      { value: "Completed", label: "Completed" },
    ],
  };

  // Helper function to extract tasks from different API response structures
  const extractTasksFromResponse = (response) => {
    // Handle the specific response structure from your backend
    if (
      response?.data?.data?.filteredTasks &&
      Array.isArray(response.data.data.filteredTasks)
    ) {
      return response.data.data.filteredTasks;
    }

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

  // Apply local filters to tasks
  const applyLocalFilters = (taskList) => {
    let filtered = [...taskList];

    // Apply category filter
    if (filters.taskCategory) {
      filtered = filtered.filter((task) => {
        const category = task.taskCategory || task.category || "";
        return category.toLowerCase() === filters.taskCategory.toLowerCase();
      });
    }

    // Apply priority filter
    if (filters.taskPriority) {
      filtered = filtered.filter((task) => {
        const priority = task.taskPriority || task.priority || "";
        return priority.toLowerCase() === filters.taskPriority.toLowerCase();
      });
    }

    // Apply status filter
    if (filters.taskStatus) {
      filtered = filtered.filter((task) => {
        const status = task.taskStatus || task.status || "";
        // Handle different status formats
        const normalizedStatus = status.toLowerCase();
        const filterStatus = filters.taskStatus.toLowerCase();

        // Map status variations
        if (
          filterStatus === "pending" &&
          (normalizedStatus === "to do" || normalizedStatus === "todo")
        ) {
          return true;
        }
        if (
          filterStatus === "completed" &&
          (normalizedStatus === "done" || normalizedStatus === "finished")
        ) {
          return true;
        }
        if (
          filterStatus === "in progress" &&
          normalizedStatus === "in progress"
        ) {
          return true;
        }

        return normalizedStatus === filterStatus;
      });
    }

    return filtered;
  };

  // Handle filter change
  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      taskCategory: "",
      taskPriority: "",
      taskStatus: "",
    });
  };

  // Check if any filters are active
  const hasActiveFilters = () => {
    return (
      !!filters.taskCategory || !!filters.taskPriority || !!filters.taskStatus
    );
  };

  // Apply filters with API integration
  const applyFiltersWithAPI = async () => {
    try {
      setIsFilterLoading(true);

      // Prepare filter parameters for API - use correct field names that match backend
      const filterParams = {};
      if (filters.taskCategory !== "all")
        filterParams.taskCategory = filters.taskCategory;
      if (filters.taskPriority !== "all")
        filterParams.taskPriority = filters.taskPriority;
      if (filters.taskStatus !== "all")
        filterParams.taskStatus = filters.taskStatus;

      // If no filters are active, use local data
      if (Object.keys(filterParams).length === 0) {
        setFilteredTasks(getCurrentTasks());
        return;
      }

      console.log("Sending filter params:", filterParams); // Debug log

      // Call filter API
      const response = await filterTask(filterParams);
      const filteredData = extractTasksFromResponse(response);

      // Normalize the filtered tasks
      const normalizedFilteredTasks = filteredData.map((task) =>
        normalizeTask(task)
      );
      setFilteredTasks(normalizedFilteredTasks);
    } catch (error) {
      console.error("Error applying filters:", error);
      // Fallback to local filtering if API fails
      const currentTasks = getCurrentTasks();
      const locallyFiltered = applyLocalFilters(currentTasks);
      setFilteredTasks(locallyFiltered);
    } finally {
      setIsFilterLoading(false);
    }
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

  // Get display tasks (filtered or current)
  const getDisplayTasks = () => {
    return hasActiveFilters() ? filteredTasks : getCurrentTasks();
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

        const processedAllTasks = [];
        const seenAllTaskIds = new Set();
        taskData.forEach((task) => {
          const id = extractAllTaskId(task);
          if (id) {
            if (!seenAllTaskIds.has(id)) {
              processedAllTasks.push({ ...task, _id: id });
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
  }, [refreshTrigger, dispatch]);

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
        const processedMyTasks = [];
        const seenMyTaskIds = new Set();
        taskData.forEach((originalTask) => {
          const normalizedTask = normalizeTask(originalTask);
          const id = normalizedTask._id;

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

        const response = await delegatedTask();
        const taskData = extractTasksFromResponse(response);
        const processedDelegatedTasks = [];
        const seenDelegatedTaskIds = new Set();
        taskData.forEach((originalTask) => {
          const normalizedTask = normalizeTask(originalTask);
          const id = normalizedTask._id;

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

  // USEEFFECT: Apply filters when filters change or tasks change
  useEffect(() => {
    if (hasActiveFilters()) {
      applyFiltersWithAPI();
    } else {
      setFilteredTasks([]);
    }
  }, [filters, tasks, delegatedTasks, allTasks, activeTab]);

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

  const displayTasks = getDisplayTasks();

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Task Management</h1>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            size="sm"
            className={`flex items-center gap-2 ${
              hasActiveFilters() ? "bg-blue-50 border-blue-200" : ""
            }`}
          >
            <Filter className="h-4 w-4" />
            Filters
            {hasActiveFilters() && (
              <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-0.5 ml-1">
                {Object.values(filters).filter((f) => f !== "").length}
              </span>
            )}
          </Button>
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            onClick={() => setIsAssignTaskModalOpen(true)}
            className="flex items-center gap-2 bg-[#10b981] hover:bg-[#059669] text-white"
          >
            <PlusCircle className="h-4 w-4" />
            Assign Task
          </Button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <h3 className="font-medium text-gray-700">Filter Tasks:</h3>

            {/* Category Filter */}
            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">Category</label>
              <select
                value={filters.taskCategory}
                onChange={(e) =>
                  handleFilterChange("taskCategory", e.target.value)
                }
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {filterOptions.taskCategory.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Filter */}
            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">Priority</label>
              <select
                value={filters.taskPriority}
                onChange={(e) =>
                  handleFilterChange("taskPriority", e.target.value)
                }
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {filterOptions.taskPriority.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">Status</label>
              <select
                value={filters.taskStatus}
                onChange={(e) =>
                  handleFilterChange("taskStatus", e.target.value)
                }
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {filterOptions.taskStatus.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters() && (
              <Button
                onClick={clearAllFilters}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 mt-6"
              >
                <X className="h-4 w-4" />
                Clear Filters
              </Button>
            )}
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters() && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-600">Active filters:</span>
              {filters.taskCategory && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  Category: {filters.taskCategory}
                </span>
              )}
              {filters.taskPriority && (
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  Priority: {filters.taskPriority}
                </span>
              )}
              {filters.taskStatus && (
                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                  Status: {filters.taskStatus}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      <div className="mb-6">
        <div className="border-b">
          <nav className="flex space-x-8">
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
                {tab.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Results Summary */}
      {hasActiveFilters() && (
        <div className="mb-4 text-sm text-gray-600">
          {isFilterLoading ? (
            <span className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Applying filters...
            </span>
          ) : (
            <span>
              Showing {displayTasks.length} filtered result
              {displayTasks.length !== 1 ? "s" : ""}
              {displayTasks.length > 0 &&
                ` out of ${getCurrentTasks().length} total tasks`}
            </span>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
          <div className="flex items-start">
            <div className="flex-1">
              <h3 className="font-medium">
                Error loading {activeTab.replace("-", " ")}
              </h3>
              <p className="text-sm mt-1">
                {error.response?.data?.message ||
                  error.message ||
                  "Unknown error occurred"}
              </p>
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                className="mt-2"
                disabled={loading}
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mb-4"></div>
          <p className="text-gray-600">
            Loading{" "}
            {activeTab === "my-tasks"
              ? "your tasks"
              : activeTab === "delegated-tasks"
              ? "delegated tasks"
              : "all tasks"}
            ...
          </p>
        </div>
      ) : displayTasks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayTasks.map((task, index) => {
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
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          }
          title={`No ${hasActiveFilters() ? "Filtered " : ""}${
            activeTab === "my-tasks"
              ? "Tasks"
              : activeTab === "delegated-tasks"
              ? "Delegated Tasks"
              : "Tasks"
          } Found`}
          description={
            hasActiveFilters()
              ? "No tasks match your current filter criteria. Try adjusting your filters."
              : activeTab === "my-tasks"
              ? "You don't have any tasks assigned to you."
              : activeTab === "delegated-tasks"
              ? "You haven't delegated any tasks yet."
              : "There are no tasks in the system."
          }
          className="py-16"
        />
      )}

      {/* Modals */}
      <AssignTaskModal
        isOpen={isAssignTaskModalOpen}
        onClose={() => setIsAssignTaskModalOpen(false)}
        task={null}
        onSuccess={() => {
          setIsAssignTaskModalOpen(false);
          handleRefresh();
        }}
      />
      <ViewTaskModal
        isOpen={isViewTaskModalOpen}
        onClose={handleViewTaskModalClose}
        task={selectedTaskData}
        loading={viewTaskLoading}
        error={viewError}
        isFromDelegatedTab={activeTab === "delegated-tasks"}
        onTaskUpdate={handleTaskUpdate}
      />
    </div>
  );
};

export default TaskManagement;
