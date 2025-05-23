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
import TaskFormModal from "../components/dashboard/TaskFormModal";
import ConfirmDeleteModal from "../components/dashboard/ConfirmDeleteModal";

// Dummy data for dashboard
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
    comments: [
      {
        id: 5,
        user: "Alex Brown",
        text: "Found several bugs in the iOS version",
        timestamp: "2024-01-27T16:20:00Z",
      },
    ],
  },
];

const DUMMY_USERS = [
  { id: "user1", name: "John Doe", email: "john@example.com" },
  { id: "user2", name: "Jane Smith", email: "jane@example.com" },
  { id: "user3", name: "Mike Johnson", email: "mike@example.com" },
  { id: "user4", name: "Sarah Wilson", email: "sarah@example.com" },
  { id: "user5", name: "Alex Brown", email: "alex@example.com" },
];

const DUMMY_ACTIVITIES = [
  {
    id: 1,
    user: "John Doe",
    action: "created task",
    task: "Implement user authentication",
    timestamp: "2024-01-27T10:30:00Z",
  },
  {
    id: 2,
    user: "Jane Smith",
    action: "completed task",
    task: "Design dashboard UI",
    timestamp: "2024-01-27T09:15:00Z",
  },
  {
    id: 3,
    user: "Mike Johnson",
    action: "commented on",
    task: "Database optimization",
    timestamp: "2024-01-27T08:45:00Z",
  },
  {
    id: 4,
    user: "Sarah Wilson",
    action: "updated task",
    task: "API documentation",
    timestamp: "2024-01-26T16:20:00Z",
  },
  {
    id: 5,
    user: "Alex Brown",
    action: "started task",
    task: "Mobile app testing",
    timestamp: "2024-01-26T14:10:00Z",
  },
];

const Dashboard = () => {
  const [tasks, setTasks] = useState(DUMMY_TASKS);
  const [users, setUsers] = useState(DUMMY_USERS);
  const [activities, setActivities] = useState(DUMMY_ACTIVITIES);
  const [filteredTasks, setFilteredTasks] = useState(DUMMY_TASKS);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [userFilter, setUserFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
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
      pendingTasks: taskList.filter(
        (task) => task.status === "In Progress" || task.status === "To Do"
      ).length,
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

  // Filter tasks based on all criteria
  useEffect(() => {
    let filtered = tasks;

    // Apply date filter first
    filtered = applyDateFilter(filtered, dateFilter);

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (task) =>
          task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.assignedUser.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "All") {
      if (statusFilter === "Overdue") {
        const now = new Date();
        filtered = filtered.filter((task) => {
          const dueDate = new Date(task.dueDate);
          return dueDate < now && task.status !== "Done";
        });
      } else {
        filtered = filtered.filter((task) => task.status === statusFilter);
      }
    }

    // Apply user filter
    if (userFilter !== "All") {
      filtered = filtered.filter((task) => task.assignedUser === userFilter);
    }

    // Apply priority filter
    if (priorityFilter !== "All") {
      filtered = filtered.filter((task) => task.priority === priorityFilter);
    }

    setFilteredTasks(filtered);
  }, [
    searchQuery,
    statusFilter,
    userFilter,
    priorityFilter,
    dateFilter,
    tasks,
  ]);

  // Get unique users for filter dropdown
  const uniqueUsers = [...new Set(tasks.map((task) => task.assignedUser))];

  // Handle creating new task
  const handleCreateTask = () => {
    setEditingTask(null);
    setIsTaskFormOpen(true);
  };

  // Handle editing task
  const handleEditTask = (task) => {
    setEditingTask(task);
    setIsTaskFormOpen(true);
  };

  // Handle task form submission
  const handleTaskSubmit = async (taskData) => {
    try {
      if (editingTask) {
        // Update existing task
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

        // Add activity for task update
        const newActivity = {
          id: Date.now(),
          user: "Current User",
          action: "updated task",
          task: updatedTask.name,
          timestamp: new Date().toISOString(),
        };
        setActivities((prev) => [newActivity, ...prev]);

        // Update selected task if it's the one being edited
        if (selectedTask?.id === editingTask.id) {
          setSelectedTask(updatedTask);
        }
      } else {
        // Create new task
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

        // Add activity for task creation
        const newActivity = {
          id: Date.now(),
          user: "Current User",
          action: "created task",
          task: newTask.name,
          timestamp: new Date().toISOString(),
        };
        setActivities((prev) => [newActivity, ...prev]);
      }

      setIsTaskFormOpen(false);
      setEditingTask(null);
      return { success: true };
    } catch (error) {
      console.error("Error saving task:", error);
      return { success: false, error: error.message };
    }
  };

  // Handle task deletion
  const handleDeleteTask = (task) => {
    setTaskToDelete(task);
    setIsDeleteModalOpen(true);
  };

  // Confirm task deletion
  const handleConfirmDelete = async () => {
    try {
      if (taskToDelete) {
        setTasks((prevTasks) =>
          prevTasks.filter((task) => task.id !== taskToDelete.id)
        );

        // Add activity for task deletion
        const newActivity = {
          id: Date.now(),
          user: "Current User",
          action: "deleted task",
          task: taskToDelete.name,
          timestamp: new Date().toISOString(),
        };
        setActivities((prev) => [newActivity, ...prev]);

        // Clear selected task if it's the one being deleted
        if (selectedTask?.id === taskToDelete.id) {
          setSelectedTask(null);
        }
      }

      setIsDeleteModalOpen(false);
      setTaskToDelete(null);
      return { success: true };
    } catch (error) {
      console.error("Error deleting task:", error);
      return { success: false, error: error.message };
    }
  };

  // Handle task status change
  const handleTaskStatusChange = async (taskId, newStatus) => {
    try {
      const updatedTask = tasks.find((task) => task.id === taskId);
      if (!updatedTask) return;

      const taskUpdate = {
        ...updatedTask,
        status: newStatus,
        completedAt: newStatus === "Done" ? new Date().toISOString() : null,
      };

      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === taskId ? taskUpdate : task))
      );

      // Add activity for status change
      const newActivity = {
        id: Date.now(),
        user: "Current User",
        action: `marked task as ${newStatus.toLowerCase()}`,
        task: updatedTask.name,
        timestamp: new Date().toISOString(),
      };
      setActivities((prev) => [newActivity, ...prev]);

      // Update selected task if it's the one being updated
      if (selectedTask?.id === taskId) {
        setSelectedTask(taskUpdate);
      }

      return { success: true };
    } catch (error) {
      console.error("Error updating task status:", error);
      return { success: false, error: error.message };
    }
  };

  // Handle date filter application
  const handleDateFilterApply = (filter) => {
    setDateFilter(filter);
    setIsDateFilterOpen(false);
  };

  // Handle date filter clear
  const handleDateFilterClear = () => {
    setDateFilter({
      startDate: null,
      endDate: null,
      filterType: "dueDate",
    });
    setIsDateFilterOpen(false);
  };

  // Handle report generation
  const handleGenerateReport = async (reportConfig) => {
    try {
      const reportData = {
        ...reportConfig,
        tasks: filteredTasks,
        kpis,
        taskDistribution,
        activities,
        generatedAt: new Date().toISOString(),
      };

      const dataStr = JSON.stringify(reportData, null, 2);
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
        id: Date.now(),
        user: "Current User",
        action: "generated report",
        task: null,
        timestamp: new Date().toISOString(),
      };

      setActivities((prev) => [newActivity, ...prev]);

      return { success: true };
    } catch (error) {
      console.error("Error generating report:", error);
      return { success: false, error: error.message };
    }
  };

  // Handle data refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const newActivity = {
        id: Date.now(),
        user: "Current User",
        action: "refreshed dashboard",
        task: null,
        timestamp: new Date().toISOString(),
      };

      setActivities((prev) => [newActivity, ...prev]);
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle adding new comment to a task
  const handleAddComment = async (taskId, commentText) => {
    try {
      const newComment = {
        id: Date.now(),
        user: "Current User",
        text: commentText,
        timestamp: new Date().toISOString(),
      };

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId
            ? { ...task, comments: [...task.comments, newComment] }
            : task
        )
      );

      const newActivity = {
        id: Date.now(),
        user: "Current User",
        action: "commented on",
        task: tasks.find((t) => t.id === taskId)?.name,
        timestamp: new Date().toISOString(),
      };

      setActivities((prev) => [newActivity, ...prev]);

      // Update selected task if it's the one being commented on
      if (selectedTask?.id === taskId) {
        setSelectedTask((prev) => ({
          ...prev,
          comments: [...prev.comments, newComment],
        }));
      }

      return { success: true };
    } catch (error) {
      console.error("Error adding comment:", error);
      return { success: false, error: error.message };
    }
  };

  // Format date range for display
  const getDateRangeDisplay = () => {
    if (!dateFilter.startDate && !dateFilter.endDate) {
      return "All Time";
    }

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    };

    if (dateFilter.startDate && dateFilter.endDate) {
      return `${formatDate(dateFilter.startDate)} - ${formatDate(
        dateFilter.endDate
      )}`;
    } else if (dateFilter.startDate) {
      return `From ${formatDate(dateFilter.startDate)}`;
    } else if (dateFilter.endDate) {
      return `Until ${formatDate(dateFilter.endDate)}`;
    }

    return "All Time";
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Welcome back! Here's what's happening with your projects.
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
            disabled={isRefreshing}
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
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

      {/* Active Filters Display */}
      {(searchQuery ||
        statusFilter !== "All" ||
        userFilter !== "All" ||
        priorityFilter !== "All") && (
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
              User: {userFilter}
            </span>
          )}
          {priorityFilter !== "All" && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
              Priority: {priorityFilter}
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:text-blue-800"
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("All");
              setUserFilter("All");
              setPriorityFilter("All");
            }}
          >
            Clear All
          </Button>
        </div>
      )}

      {/* KPI Cards Section */}
      <KPICards kpis={kpis} />

      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Task Distribution Chart */}
        <div className="lg:col-span-1">
          <TaskDistributionChart data={taskDistribution} />
        </div>

        {/* Right Column - User Activity Feed */}
        <div className="lg:col-span-2">
          <UserActivityFeed activities={activities} />
        </div>
      </div>

      {/* Task Management Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Task List */}
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
              <Button
                size="sm"
                className="flex items-center gap-2"
                onClick={handleCreateTask}
              >
                <Plus className="h-4 w-4" />
                New Task
              </Button>
            </div>

            {/* Search and Filter Controls */}
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
              <div className="flex flex-wrap gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="All">All Status</option>
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Done">Done</option>
                  <option value="Overdue">Overdue</option>
                </select>
                <select
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="All">All Users</option>
                  {uniqueUsers.map((user) => (
                    <option key={user} value={user}>
                      {user}
                    </option>
                  ))}
                </select>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="All">All Priority</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>

            {/* Task List Component */}
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

        {/* Task Comments Section */}
        <div className="xl:col-span-1">
          <TaskComments task={selectedTask} onAddComment={handleAddComment} />
        </div>
      </div>

      {/* Modals */}
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

      <TaskFormModal
        isOpen={isTaskFormOpen}
        onClose={() => {
          setIsTaskFormOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleTaskSubmit}
        task={editingTask}
        users={users}
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
