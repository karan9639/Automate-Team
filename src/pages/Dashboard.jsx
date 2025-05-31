"use client";

import { useState, useEffect } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  TrendingUp,
  Calendar,
  Search,
  Plus,
  Filter,
  RefreshCw,
} from "lucide-react";
import KPICards from "../components/dashboard/KPICards";
import TaskDistributionChart from "../components/dashboard/TaskDistributionChart";
import TaskList from "../components/dashboard/TaskList";
import UserActivityFeed from "../components/dashboard/UserActivityFeed";
import TaskComments from "../components/dashboard/TaskComments";
import DateFilterModal from "../components/dashboard/DateFilterModal";
import GenerateReportModal from "../components/dashboard/GenerateReportModal";
import ConfirmDeleteModal from "../components/dashboard/ConfirmDeleteModal";
import TaskFilters from "../components/dashboard/TaskFilters";
import AssignTaskModal from "../components/modals/AssignTaskModal";
import { userApi } from "../api/userApi";
import toast from "react-hot-toast";

// Dummy data for dashboard (Tasks and Users)
const DUMMY_TASKS = [
  {
    id: 1,
    name: "Implement user authentication",
    description: "Set up login and registration functionality with JWT tokens",
    dueDate: "2024-02-15",
    assignedUser: "John Doe",
    assignedUserId: "user1",
    status: "In Progress",
    priority: "High",
    createdAt: "2024-01-20",
    completedAt: null,
    category: "Development",
    frequency: "One-time",
    comments: [
      {
        id: 1,
        user: "John Doe",
        text: "Started working on the authentication flow",
        timestamp: "2024-01-21T10:30:00Z",
      },
      {
        id: 2,
        user: "Jane Smith",
        text: "Please make sure to implement password reset functionality",
        timestamp: "2024-01-22T14:15:00Z",
      },
    ],
  },
  {
    id: 2,
    name: "Design dashboard UI",
    description: "Create wireframes and mockups for the main dashboard",
    dueDate: "2024-02-10",
    assignedUser: "Jane Smith",
    assignedUserId: "user2",
    status: "Done",
    priority: "Medium",
    createdAt: "2024-01-15",
    completedAt: "2024-01-25",
    category: "Design",
    frequency: "One-time",
    comments: [
      {
        id: 3,
        user: "Jane Smith",
        text: "Completed the initial design mockups",
        timestamp: "2024-01-25T09:00:00Z",
      },
    ],
  },
  {
    id: 3,
    name: "Database optimization",
    description: "Optimize database queries for better performance",
    dueDate: "2024-02-20",
    assignedUser: "Mike Johnson",
    assignedUserId: "user3",
    status: "To Do",
    priority: "Low",
    createdAt: "2024-01-25",
    completedAt: null,
    category: "Backend",
    frequency: "Monthly",
    comments: [],
  },
  {
    id: 4,
    name: "API documentation",
    description: "Write comprehensive API documentation for all endpoints",
    dueDate: "2024-02-12",
    assignedUser: "Sarah Wilson",
    assignedUserId: "user4",
    status: "In Progress",
    priority: "Medium",
    createdAt: "2024-01-18",
    completedAt: null,
    category: "Documentation",
    frequency: "One-time",
    comments: [
      {
        id: 4,
        user: "Sarah Wilson",
        text: "Working on the authentication endpoints documentation",
        timestamp: "2024-01-26T11:45:00Z",
      },
    ],
  },
  {
    id: 5,
    name: "Mobile app testing",
    description: "Conduct thorough testing of the mobile application",
    dueDate: "2024-02-08",
    assignedUser: "Alex Brown",
    assignedUserId: "user5",
    status: "Overdue",
    priority: "High",
    createdAt: "2024-01-10",
    completedAt: null,
    category: "Testing",
    frequency: "Weekly",
    comments: [
      {
        id: 5,
        user: "Alex Brown",
        text: "Found several bugs in the iOS version",
        timestamp: "2024-01-27T16:20:00Z",
      },
    ],
  },
  {
    id: 6,
    name: "Weekly team meeting",
    description: "Conduct weekly team sync-up meeting",
    dueDate: "2024-02-05",
    assignedUser: "John Doe",
    assignedUserId: "user1",
    status: "To Do",
    priority: "Medium",
    createdAt: "2024-01-22",
    completedAt: null,
    category: "Meetings",
    frequency: "Weekly",
    comments: [],
  },
  {
    id: 7,
    name: "Monthly performance review",
    description: "Review team performance metrics and set goals",
    dueDate: "2024-02-28",
    assignedUser: "Jane Smith",
    assignedUserId: "user2",
    status: "To Do",
    priority: "High",
    createdAt: "2024-01-15",
    completedAt: null,
    category: "Management",
    frequency: "Monthly",
    comments: [],
  },
];

const DUMMY_USERS = [
  { id: "user1", name: "John Doe", email: "john@example.com" },
  { id: "user2", name: "Jane Smith", email: "jane@example.com" },
  { id: "user3", name: "Mike Johnson", email: "mike@example.com" },
  { id: "user4", name: "Sarah Wilson", email: "sarah@example.com" },
  { id: "user5", name: "Alex Brown", email: "alex@example.com" },
];

const Dashboard = () => {
  const [tasks, setTasks] = useState(DUMMY_TASKS);
  const [users, setUsers] = useState(DUMMY_USERS); // Keep this if needed for other parts
  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [activitiesError, setActivitiesError] = useState(null);
  const [filteredTasks, setFilteredTasks] = useState(DUMMY_TASKS);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [userFilter, setUserFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [frequencyFilter, setFrequencyFilter] = useState("All");
  const [selectedTask, setSelectedTask] = useState(null);
  const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);
  const [isGenerateReportOpen, setIsGenerateReportOpen] = useState(false);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [dateFilter, setDateFilter] = useState({
    startDate: null,
    endDate: null,
    filterType: "dueDate",
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Generate unique ID for new tasks
  const generateTaskId = () => {
    return Math.max(...tasks.map((t) => t.id), 0) + 1;
  };

  // Calculate KPIs from filtered data
  const calculateKPIs = (taskList) => {
    const now = new Date();
    const overdueTasks = taskList.filter((task) => {
      const dueDate = new Date(task.dueDate);
      return dueDate < now && task.status !== "Done";
    });

    return {
      totalTasks: taskList.length,
      completedTasks: taskList.filter((task) => task.status === "Done").length,
      pendingTasks: taskList.filter((task) => task.status === "To Do").length,
      inProgressTasks: taskList.filter((task) => task.status === "In Progress")
        .length,
      overdueTasks: overdueTasks.length,
      activeUsers: [...new Set(taskList.map((task) => task.assignedUser))]
        .length,
    };
  };

  const kpis = calculateKPIs(filteredTasks);

  // Task distribution data for chart
  const taskDistribution = {
    "To Do": filteredTasks.filter((task) => task.status === "To Do").length,
    "In Progress": filteredTasks.filter((task) => task.status === "In Progress")
      .length,
    Done: filteredTasks.filter((task) => task.status === "Done").length,
    Overdue: filteredTasks.filter((task) => {
      const dueDate = new Date(task.dueDate);
      const now = new Date();
      return dueDate < now && task.status !== "Done";
    }).length,
  };

  // Apply date filter to tasks
  const applyDateFilter = (taskList, filter) => {
    if (!filter.startDate && !filter.endDate) return taskList;

    return taskList.filter((task) => {
      let taskDate;
      switch (filter.filterType) {
        case "dueDate":
          taskDate = new Date(task.dueDate);
          break;
        case "createdDate":
          taskDate = new Date(task.createdAt);
          break;
        case "completedDate":
          if (!task.completedAt) return false;
          taskDate = new Date(task.completedAt);
          break;
        default:
          taskDate = new Date(task.dueDate);
      }

      const startDate = filter.startDate ? new Date(filter.startDate) : null;
      const endDate = filter.endDate ? new Date(filter.endDate) : null;

      if (startDate && endDate) {
        return taskDate >= startDate && taskDate <= endDate;
      } else if (startDate) {
        return taskDate >= startDate;
      } else if (endDate) {
        return taskDate <= endDate;
      }
      return true;
    });
  };

  // Fetch activities from API
  useEffect(() => {
    const fetchActivitiesData = async () => {
      setActivitiesLoading(true);
      setActivitiesError(null);
      try {
        const response = await userApi.fetchActivities();
        if (
          response.data &&
          response.data.success &&
          Array.isArray(response.data.data)
        ) {
          const fetchedActivities = response.data.data.map((activity) => {
            const fullMessage = activity.message; // e.g., "Prashant created task: Machine no. 50 Repair"
            const messageType = activity.messageType; // e.g., "task_created"

            const userNameMatch = fullMessage.match(/^([^\s]+)/);
            // Use the name from the message, or "User" if parsing fails.
            // Ideally, resolve activity.user (ID) to a name if a user store is available.
            const userName = userNameMatch ? userNameMatch[0] : "User";

            let actionDescription = messageType.replace(/_/g, " "); // Fallback e.g. "task created"
            let targetName = null;

            let actionAndTargetDetails = fullMessage;
            if (fullMessage.toLowerCase().startsWith(userName.toLowerCase())) {
              actionAndTargetDetails = fullMessage
                .substring(userName.length)
                .trim();
            }

            const colonIndex = actionAndTargetDetails.indexOf(":");
            if (colonIndex > -1) {
              actionDescription = actionAndTargetDetails
                .substring(0, colonIndex)
                .trim();
              targetName = actionAndTargetDetails
                .substring(colonIndex + 1)
                .trim();
            } else {
              actionDescription = actionAndTargetDetails.trim();
            }
            if (!actionDescription && messageType) {
              actionDescription = messageType.replace(/_/g, " ");
            }

            return {
              id: activity._id,
              user: userName,
              action: actionDescription,
              task: targetName, // This will be used as the target/task name in UserActivityFeed
              timestamp: activity.createdAt,
              messageType: messageType,
            };
          });
          setActivities(fetchedActivities);
        } else {
          const errorMsg =
            response.data?.message || "Failed to fetch activities structure.";
          setActivitiesError(errorMsg);
          toast.error(errorMsg);
          setActivities([]);
        }
      } catch (error) {
        console.error("Error fetching activities:", error);
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "An error occurred while fetching activities.";
        setActivitiesError(errorMessage);
        toast.error(errorMessage);
        setActivities([]);
      } finally {
        setActivitiesLoading(false);
        if (isRefreshing) setIsRefreshing(false);
      }
    };

    fetchActivitiesData();
  }, [isRefreshing]);

  // Filter tasks based on all criteria
  useEffect(() => {
    let filtered = tasks;
    filtered = applyDateFilter(filtered, dateFilter);
    if (searchQuery) {
      filtered = filtered.filter(
        (task) =>
          task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.assignedUser.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (statusFilter !== "All") {
      if (statusFilter === "Overdue") {
        const now = new Date();
        filtered = filtered.filter((task) => {
          const dueDate = new Date(task.dueDate);
          return dueDate < now && task.status !== "Done";
        });
      } else if (statusFilter === "Pending") {
        filtered = filtered.filter((task) => task.status === "To Do");
      } else if (statusFilter === "In Progress") {
        filtered = filtered.filter((task) => task.status === "In Progress");
      } else if (statusFilter === "Completed") {
        filtered = filtered.filter((task) => task.status === "Done");
      } else {
        filtered = filtered.filter((task) => task.status === statusFilter);
      }
    }
    if (userFilter !== "All") {
      filtered = filtered.filter((task) => task.assignedUser === userFilter);
    }
    if (priorityFilter !== "All") {
      filtered = filtered.filter((task) => task.priority === priorityFilter);
    }
    if (categoryFilter !== "All") {
      filtered = filtered.filter((task) => task.category === categoryFilter);
    }
    if (frequencyFilter !== "All") {
      filtered = filtered.filter((task) => task.frequency === frequencyFilter);
    }
    setFilteredTasks(filtered);
  }, [
    searchQuery,
    statusFilter,
    userFilter,
    priorityFilter,
    categoryFilter,
    frequencyFilter,
    dateFilter,
    tasks,
  ]);

  const uniqueUsers = [...new Set(tasks.map((task) => task.assignedUser))];
  const uniqueCategories = [...new Set(tasks.map((task) => task.category))];
  const uniqueFrequencies = [...new Set(tasks.map((task) => task.frequency))];

  const handleCreateTask = () => {
    setEditingTask(null);
    setIsTaskFormOpen(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setIsTaskFormOpen(true);
  };

  const handleTaskSubmit = async (taskData) => {
    try {
      let activityAction = "";
      let taskNameForActivity = "";
      let messageType = "";

      if (editingTask) {
        const updatedTask = {
          ...editingTask,
          ...taskData,
          assignedUser:
            users.find((u) => u.id === taskData.assignedUserId)?.name ||
            taskData.assignedUser,
        };
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === editingTask.id ? updatedTask : task
          )
        );
        activityAction = "updated task";
        taskNameForActivity = updatedTask.name;
        messageType = "task_edited";
        if (selectedTask?.id === editingTask.id) setSelectedTask(updatedTask);
      } else {
        const newTask = {
          id: generateTaskId(),
          ...taskData,
          assignedUser:
            users.find((u) => u.id === taskData.assignedUserId)?.name ||
            taskData.assignedUser,
          createdAt: new Date().toISOString(),
          completedAt: null,
          comments: [],
        };
        setTasks((prevTasks) => [...prevTasks, newTask]);
        activityAction = "created task";
        taskNameForActivity = newTask.name;
        messageType = "task_created";
      }

      const newActivity = {
        id: Date.now().toString(),
        user: "Current User", // Replace with actual logged-in user
        action: activityAction,
        task: taskNameForActivity,
        timestamp: new Date().toISOString(),
        messageType: messageType,
      };
      setActivities((prev) => [newActivity, ...prev]);
      setIsTaskFormOpen(false);
      setEditingTask(null);
      return { success: true };
    } catch (error) {
      console.error("Error saving task:", error);
      return { success: false, error: error.message };
    }
  };

  const handleDeleteTask = (task) => {
    setTaskToDelete(task);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      if (taskToDelete) {
        setTasks((prevTasks) =>
          prevTasks.filter((task) => task.id !== taskToDelete.id)
        );
        const newActivity = {
          id: Date.now().toString(),
          user: "Current User",
          action: "deleted task",
          task: taskToDelete.name,
          timestamp: new Date().toISOString(),
          messageType: "task_deleted",
        };
        setActivities((prev) => [newActivity, ...prev]);
        if (selectedTask?.id === taskToDelete.id) setSelectedTask(null);
      }
      setIsDeleteModalOpen(false);
      setTaskToDelete(null);
      return { success: true };
    } catch (error) {
      console.error("Error deleting task:", error);
      return { success: false, error: error.message };
    }
  };

  const handleTaskStatusChange = async (taskId, newStatus) => {
    try {
      const updatedTask = tasks.find((task) => task.id === taskId);
      if (!updatedTask) return { success: false, error: "Task not found" };

      const taskUpdate = {
        ...updatedTask,
        status: newStatus,
        completedAt: newStatus === "Done" ? new Date().toISOString() : null,
      };
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === taskId ? taskUpdate : task))
      );
      const newActivity = {
        id: Date.now().toString(),
        user: "Current User",
        action: `marked task as ${newStatus.toLowerCase()}`,
        task: updatedTask.name,
        timestamp: new Date().toISOString(),
        messageType: "task_edited", // Or a more specific "task_status_changed"
      };
      setActivities((prev) => [newActivity, ...prev]);
      if (selectedTask?.id === taskId) setSelectedTask(taskUpdate);
      return { success: true };
    } catch (error) {
      console.error("Error updating task status:", error);
      return { success: false, error: error.message };
    }
  };

  const handleDateFilterApply = (filter) => {
    setDateFilter(filter);
    setIsDateFilterOpen(false);
  };

  const handleDateFilterClear = () => {
    setDateFilter({ startDate: null, endDate: null, filterType: "dueDate" });
    setIsDateFilterOpen(false);
  };

  const handleGenerateReport = async (reportConfig) => {
    try {
      // ... report generation logic ...
      const dataStr = JSON.stringify(
        { ...reportConfig, tasks: filteredTasks, kpis, activities },
        null,
        2
      );
      const dataUri =
        "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
      const exportFileDefaultName = `dashboard-report-${
        new Date().toISOString().split("T")[0]
      }.json`;
      const linkElement = document.createElement("a");
      linkElement.setAttribute("href", dataUri);
      linkElement.setAttribute("download", exportFileDefaultName);
      linkElement.click();
      setIsGenerateReportOpen(false);

      const newActivity = {
        id: Date.now().toString(),
        user: "Current User",
        action: "generated report",
        task: null,
        timestamp: new Date().toISOString(),
        messageType: "report_generated", // Custom type
      };
      setActivities((prev) => [newActivity, ...prev]);
      return { success: true };
    } catch (error) {
      console.error("Error generating report:", error);
      return { success: false, error: error.message };
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    toast.success("Refreshing dashboard data...");
  };

  const handleAddComment = async (taskId, commentText) => {
    try {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return { success: false, error: "Task not found" };

      const newComment = {
        id: Date.now(),
        user: "Current User",
        text: commentText,
        timestamp: new Date().toISOString(),
      };
      setTasks((prevTasks) =>
        prevTasks.map((t) =>
          t.id === taskId
            ? { ...t, comments: [...(t.comments || []), newComment] }
            : t
        )
      );
      const newActivity = {
        id: Date.now().toString(),
        user: "Current User",
        action: "commented on task",
        task: task.name,
        timestamp: new Date().toISOString(),
        messageType: "comment_added",
      };
      setActivities((prev) => [newActivity, ...prev]);
      if (selectedTask?.id === taskId) {
        setSelectedTask((prev) => ({
          ...prev,
          comments: [...(prev.comments || []), newComment],
        }));
      }
      return { success: true };
    } catch (error) {
      console.error("Error adding comment:", error);
      return { success: false, error: error.message };
    }
  };

  const getDateRangeDisplay = () => {
    if (!dateFilter.startDate && !dateFilter.endDate) return "All Time";
    const formatDate = (date) =>
      new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    if (dateFilter.startDate && dateFilter.endDate)
      return `${formatDate(dateFilter.startDate)} - ${formatDate(
        dateFilter.endDate
      )}`;
    if (dateFilter.startDate) return `From ${formatDate(dateFilter.startDate)}`;
    if (dateFilter.endDate) return `Until ${formatDate(dateFilter.endDate)}`;
    return "All Time";
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setStatusFilter("All");
    setUserFilter("All");
    setPriorityFilter("All");
    setCategoryFilter("All");
    setFrequencyFilter("All");
    setDateFilter({ startDate: null, endDate: null, filterType: "dueDate" });
  };

  const hasActiveFilters = () =>
    searchQuery ||
    statusFilter !== "All" ||
    userFilter !== "All" ||
    priorityFilter !== "All" ||
    categoryFilter !== "All" ||
    frequencyFilter !== "All" ||
    dateFilter.startDate ||
    dateFilter.endDate;

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Welcome back! Here's what's happening with your Automate Tasks.
          </p>
          {(dateFilter.startDate || dateFilter.endDate) && (
            <p className="text-sm text-blue-600 mt-1">
              Filtered by {dateFilter.filterType}: {getDateRangeDisplay()}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            onClick={() => setIsDateFilterOpen(true)}
          >
            <Calendar className="h-4 w-4" />
            {getDateRangeDisplay()}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            onClick={handleRefresh}
            disabled={isRefreshing || activitiesLoading}
          >
            <RefreshCw
              className={`h-4 w-4 ${
                isRefreshing || activitiesLoading ? "animate-spin" : ""
              }`}
            />
            Refresh
          </Button>
          <Button
            size="sm"
            className="flex items-center gap-2"
            onClick={() => setIsGenerateReportOpen(true)}
          >
            <TrendingUp className="h-4 w-4" />
            Generate Report
          </Button>
        </div>
      </div>

      {hasActiveFilters() && (
        <div className="flex items-center gap-2 flex-wrap p-4 bg-blue-50 rounded-lg border border-blue-200">
          <Filter className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-900">
            Active Filters:
          </span>
          {searchQuery && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
              Search: "{searchQuery}"
            </span>
          )}
          {statusFilter !== "All" && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
              Status: {statusFilter}
            </span>
          )}
          {userFilter !== "All" && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
              Assigned to: {userFilter}
            </span>
          )}
          {priorityFilter !== "All" && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
              Priority: {priorityFilter}
            </span>
          )}
          {categoryFilter !== "All" && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
              Category: {categoryFilter}
            </span>
          )}
          {frequencyFilter !== "All" && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
              Frequency: {frequencyFilter}
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:text-blue-800"
            onClick={clearAllFilters}
          >
            Clear All
          </Button>
        </div>
      )}

      <KPICards kpis={kpis} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3">
          <TaskDistributionChart tasks={filteredTasks} />
        </div>
        <div className="lg:col-span-3">
          <UserActivityFeed
            activities={activities}
            isLoading={activitiesLoading}
            error={activitiesError}
          />
        </div>
      </div>

      {/* <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Task Management
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Showing {filteredTasks.length} of {tasks.length} tasks
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                >
                  <Filter className="h-4 w-4" />
                  {isFiltersOpen ? "Hide Filters" : "Show Filters"}
                </Button>
                <Button
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={handleCreateTask}
                >
                  <Plus className="h-4 w-4" /> New Task
                </Button>
              </div>
            </div>
            <div className="flex flex-col gap-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search tasks by name, description, or assignee..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              {isFiltersOpen && (
                <TaskFilters
                  statusFilter={statusFilter}
                  setStatusFilter={setStatusFilter}
                  userFilter={userFilter}
                  setUserFilter={setUserFilter}
                  priorityFilter={priorityFilter}
                  setPriorityFilter={setPriorityFilter}
                  categoryFilter={categoryFilter}
                  setCategoryFilter={setCategoryFilter}
                  frequencyFilter={frequencyFilter}
                  setFrequencyFilter={setFrequencyFilter}
                  uniqueUsers={uniqueUsers}
                  uniqueCategories={uniqueCategories}
                  uniqueFrequencies={uniqueFrequencies}
                  clearAllFilters={clearAllFilters}
                />
              )}
            </div>
            <TaskList
              tasks={filteredTasks}
              onTaskSelect={setSelectedTask}
              selectedTask={selectedTask}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              onStatusChange={handleTaskStatusChange}
            />
          </Card>
        </div>
        <div className="xl:col-span-1">
          <TaskComments task={selectedTask} onAddComment={handleAddComment} />
        </div>
      </div> */}

      <DateFilterModal
        isOpen={isDateFilterOpen}
        onClose={() => setIsDateFilterOpen(false)}
        onApply={handleDateFilterApply}
        onClear={handleDateFilterClear}
        currentFilter={dateFilter}
      />
      <GenerateReportModal
        isOpen={isGenerateReportOpen}
        onClose={() => setIsGenerateReportOpen(false)}
        onGenerate={handleGenerateReport}
        tasksCount={filteredTasks.length}
        kpis={kpis}
      />
      <AssignTaskModal
        isOpen={isTaskFormOpen}
        onClose={() => {
          setIsTaskFormOpen(false);
          setEditingTask(null);
        }}
        task={editingTask}
      />
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setTaskToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        task={taskToDelete}
      />
    </div>
  );
};

export default Dashboard;
