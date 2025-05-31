"use client";
import {
  X,
  Calendar,
  User,
  Tag,
  AlertCircle,
  Clock,
  FileText,
  Edit3,
  Save,
  XCircle,
  Check,
  Loader2,
} from "lucide-react";
import { formatDate } from "../../utils/helpers";
import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { editTask } from "../../store/slices/taskSlice";
import { userApi } from "../../apiService/apiService";
import { toast } from "react-hot-toast";
import { Send, MessageSquare, UserCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { createTaskComment } from "../../store/slices/taskSlice"; // Ensure this path is correct

const ViewTaskModal = ({
  isOpen,
  onClose,
  task,
  loading,
  error,
  isFromDelegatedTab = false,
  onTaskUpdate,
}) => {
  const dispatch = useDispatch();
  const { loading: taskLoading, error: taskErrors } = useSelector(
    (state) => state.tasks
  );

  const [isEditMode, setIsEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [taskId, setTaskId] = useState(null);

  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const { user: loggedInUser } = useSelector((state) => state.auth); // Assuming you have loggedInUser in auth state

  // User API integration from AssignTaskModal
  const [allUsers, setAllUsers] = useState([]);
  const [isFetchingUsers, setIsFetchingUsers] = useState(false);

  // Mock categories - replace with actual API if available
  const mockCategories = useMemo(
    () => [
      { id: "cat1", name: "Development" },
      { id: "cat2", name: "Design" },
      { id: "cat3", name: "Marketing" },
      { id: "cat4", name: "Operations" },
    ],
    []
  );

  const selectedUserName = editFormData.taskAssignedTo
    ? allUsers.find((u) => u.id === editFormData.taskAssignedTo)?.name ||
      "Select User"
    : "Select User";

  const fetchUsersForDropdown = async () => {
    if (allUsers.length > 0 && !isFetchingUsers) return;
    setIsFetchingUsers(true);
    try {
      const response = await userApi.fetchAllTeamMembers();
      const fetchedUsers =
        response.data?.data?.map((item) => item.newMember) || [];
      setAllUsers(
        fetchedUsers.map((u) => ({
          id: u._id,
          name: u.fullname,
          avatar:
            u.avatarUrl ||
            `/placeholder.svg?height=32&width=32&query=${u.fullname}`,
        }))
      );
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users for assignment.");
      setAllUsers([]);
    } finally {
      setIsFetchingUsers(false);
    }
  };

  // Extract and store task ID when task changes
  useEffect(() => {
    if (task) {
      // Fetch users when modal opens
      fetchUsersForDropdown();

      // First try to extract ID from URL
      const urlId = extractTaskIdFromUrl();
      // Then try to extract from task object as fallback
      const taskObjectId = extractTaskId(task);

      // Prioritize URL ID over task object ID
      const extractedId = urlId || taskObjectId;
      setTaskId(extractedId);

      setEditFormData({
        taskTitle: task?.taskTitle || task?.title || "",
        taskDescription: task?.taskDescription || task?.description || "",
        taskStatus: task?.status || task?.taskStatus || "pending",
        taskPriority: task?.taskPriority || task?.priority || "medium",
        taskCategory: task?.taskCategory || task?.category || "",
        taskDueDate: task?.taskDueDate || task?.dueDate || task?.due_date || "",
        // Fix: ensure taskAssignedTo is properly extracted as a string ID
        taskAssignedTo:
          typeof task?.taskAssignedTo === "string"
            ? task.taskAssignedTo
            : task?.taskAssignedTo?._id || task?.assignedTo?._id || "",
        taskFrequency:
          task?.taskFrequency?.type || task?.frequency?.type || "one-time",
      });
      setFormErrors({});
      setIsEditMode(false);
    }
  }, [task, isOpen]);

  // Helper function to extract task ID from various formats
  const extractTaskId = (task) => {
    if (!task) return null;

    // Method 1: Direct _id field (string format)
    if (task._id) {
      if (typeof task._id === "string") {
        return task._id;
      }
      // MongoDB ObjectId format with $oid
      if (typeof task._id === "object" && task._id.$oid) {
        return task._id.$oid;
      }
    }

    // Method 2: Check other common ID fields
    const idFields = ["id", "taskId", "task_id"];
    for (const field of idFields) {
      if (task[field]) {
        if (typeof task[field] === "object" && task[field].$oid) {
          return task[field].$oid;
        }
        if (typeof task[field] === "string") {
          return task[field];
        }
        if (typeof task[field] === "number") {
          return String(task[field]);
        }
      }
    }

    console.warn("❌ No valid ID found in task object");
    return null;
  };

  // Helper function to extract task ID from URL
  const extractTaskIdFromUrl = () => {
    try {
      // Get current URL
      const currentUrl = window.location.href;

      // Try different URL patterns to extract task ID
      const urlPatterns = [
        /\/tasks?\/view\/([a-fA-F0-9]{24})/, // /task/view/id or /tasks/view/id
        /\/view\/([a-fA-F0-9]{24})/, // /view/id
        /taskId=([a-fA-F0-9]{24})/, // ?taskId=id
        /id=([a-fA-F0-9]{24})/, // ?id=id
        /\/([a-fA-F0-9]{24})(?:\/|$|\?)/, // /id/ or /id at end
      ];

      for (const pattern of urlPatterns) {
        const match = currentUrl.match(pattern);
        if (match && match[1]) {
          return match[1];
        }
      }

      // Try URL search params
      const urlParams = new URLSearchParams(window.location.search);
      const paramId = urlParams.get("taskId") || urlParams.get("id");
      if (paramId && /^[a-fA-F0-9]{24}$/.test(paramId)) {
        return paramId;
      }

      return null;
    } catch (error) {
      console.error("❌ Error extracting ID from URL:", error);
      return null;
    }
  };

  const handleUserSelect = (userId) => {
    setEditFormData((prev) => ({
      ...prev,
      taskAssignedTo: userId, // Store as single user ID, not array
    }));
    setShowUserDropdown(false);
    if (formErrors.taskAssignedTo)
      setFormErrors((prev) => ({ ...prev, taskAssignedTo: "" }));
  };

  const handleCategorySelect = (categoryName) => {
    setEditFormData((prev) => ({
      ...prev,
      taskCategory: categoryName,
    }));
    setShowCategoryDropdown(false);
    if (formErrors.taskCategory)
      setFormErrors((prev) => ({ ...prev, taskCategory: "" }));
  };

  if (!isOpen) return null;

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !taskId || !loggedInUser) return;

    setIsSubmittingComment(true);
    try {
      // Assuming commentData needs 'text' and 'user' (or backend gets user from token)
      // Adjust payload based on your API requirements for /create-comment
      const commentData = {
        text: newComment.trim(),
        // If your backend automatically associates the logged-in user, you might not need to send 'user'
        // user: loggedInUser._id, // or loggedInUser.id, or loggedInUser.fullname
      };
      await dispatch(createTaskComment({ taskId, commentData }));
      setNewComment("");
    } catch (error) {
      console.error("Failed to submit comment:", error);
      toast.error("Failed to post comment.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const formatCommentTimestamp = (timestamp) => {
    if (!timestamp) return "Just now";
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      return "Invalid date";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "in-progress":
      case "in progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "overdue":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getFrequencyDisplay = (frequency) => {
    if (!frequency) return "One-time";

    if (
      frequency.type === "weekly" &&
      frequency.details?.daysOfWeek?.length > 0
    ) {
      const days = frequency.details.daysOfWeek.map((d) => d.day).join(", ");
      return `Weekly (${days})`;
    }

    return frequency.type || "One-time";
  };

  // Handle different API response field names
  const taskTitle = isEditMode
    ? editFormData.taskTitle
    : task?.taskTitle || task?.title || "Untitled Task";
  const taskDescription = isEditMode
    ? editFormData.taskDescription
    : task?.taskDescription || task?.description || "";
  const taskStatus = isEditMode
    ? editFormData.taskStatus
    : task?.status || task?.taskStatus || "pending";
  const taskPriority = isEditMode
    ? editFormData.taskPriority
    : task?.taskPriority || task?.priority || "medium";
  const taskCategory = isEditMode
    ? editFormData.taskCategory
    : task?.taskCategory || task?.category || "";
  const taskDueDate = isEditMode
    ? editFormData.taskDueDate
    : task?.taskDueDate || task?.dueDate || task?.due_date;
  const taskAssignedTo = isEditMode
    ? editFormData.taskAssignedTo
    : task?.taskAssignedTo?.fullname ||
      task?.assignedTo?.fullname ||
      task?.taskAssignedTo ||
      task?.assignedTo ||
      "Not assigned";
  const taskCreatedBy =
    task?.taskCreatedBy?.fullname ||
    task?.createdBy?.fullname ||
    task?.taskCreatedBy ||
    task?.createdBy ||
    "Unknown";
  const taskFrequency = task?.taskFrequency || task?.frequency;

  // Form validation
  const validateForm = () => {
    const errors = {};

    // Trim and check for actual content
    const trimmedTitle = (editFormData.taskTitle || "").trim();
    const trimmedDescription = (editFormData.taskDescription || "").trim();

    if (!trimmedTitle) {
      errors.taskTitle = "Task title is required and cannot be empty";
    }

    if (!trimmedDescription) {
      errors.taskDescription =
        "Task description is required and cannot be empty";
    }

    // Fix: Check for single user assignment, not array
    if (!editFormData.taskAssignedTo) {
      errors.taskAssignedTo = "A user must be assigned";
    }

    if (
      !editFormData.taskFrequency ||
      editFormData.taskFrequency.trim() === ""
    ) {
      errors.taskFrequency = "Task frequency is required";
    }

    if (!editFormData.taskPriority || editFormData.taskPriority.trim() === "") {
      errors.taskPriority = "Task priority is required";
    }

    if (editFormData.taskDueDate) {
      const dueDate = new Date(editFormData.taskDueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (isNaN(dueDate.getTime())) {
        errors.taskDueDate = "Please enter a valid date";
      } else if (dueDate < today) {
        errors.taskDueDate = "Due date cannot be in the past";
      }
    }

    // Validate task ID
    if (!taskId) {
      errors.taskId = "Task ID is missing";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setEditFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field when user starts typing
    if (formErrors[field]) {
      setFormErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleEditClick = () => {
    setIsEditMode(true);
    setFormErrors({});
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setFormErrors({});
    // Reset form data to original task data
    setEditFormData({
      taskTitle: task?.taskTitle || task?.title || "",
      taskDescription: task?.taskDescription || task?.description || "",
      taskStatus: task?.status || task?.taskStatus || "pending",
      taskPriority: task?.taskPriority || task?.priority || "medium",
      taskCategory: task?.taskCategory || task?.category || "",
      taskDueDate: task?.taskDueDate || task?.dueDate || task?.due_date || "",
      taskAssignedTo:
        typeof task?.taskAssignedTo === "string"
          ? task.taskAssignedTo
          : task?.taskAssignedTo?._id || task?.assignedTo?._id || "",
      taskFrequency:
        task?.taskFrequency?.type || task?.frequency?.type || "one-time",
    });
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      console.error("❌ Form validation failed:", formErrors);
      return;
    }

    // Double-check task ID before submission
    if (!taskId) {
      console.error("❌ Cannot submit: Task ID is missing");
      setFormErrors((prev) => ({ ...prev, taskId: "Task ID is missing" }));
      return;
    }

    try {
      // Prepare API payload matching AssignTaskModal structure
      const payload = {
        taskTitle: editFormData.taskTitle.trim(),
        taskDescription: editFormData.taskDescription.trim(),
        taskAssignedTo: editFormData.taskAssignedTo, // Single user ID
        taskCategory: editFormData.taskCategory.trim(),
        taskDueDate: editFormData.taskDueDate
          ? new Date(editFormData.taskDueDate).toISOString()
          : undefined,
        taskPriority: editFormData.taskPriority,
        taskFrequency: { type: editFormData.taskFrequency },
      };

      // Remove any undefined values
      Object.keys(payload).forEach((key) => {
        if (
          payload[key] === undefined ||
          payload[key] === null ||
          payload[key] === ""
        ) {
          delete payload[key];
        }
      });

      // Dispatch Redux action to update task
      const result = await dispatch(editTask({ taskId, taskData: payload }));

      if (editTask.fulfilled.match(result)) {
        toast.success("Task updated successfully!");

        // Call parent update handler if provided
        if (onTaskUpdate) {
          onTaskUpdate(taskId, result.payload?.data || payload);
        }

        // Exit edit mode on success
        setIsEditMode(false);
        setFormErrors({});

        // Close modal after successful update with a slight delay to show success
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        console.error("❌ Task update failed:", result.payload);
        const errorMessage =
          typeof result.payload === "string"
            ? result.payload
            : result.payload?.message || "Failed to update task.";
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("❌ Error in handleSubmit:", error);
      const errorMessage =
        typeof error === "string"
          ? error
          : error.message || "Failed to update task.";
      toast.error(errorMessage);
    }
  };

  const priorityOptions = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
  ];

  const frequencyOptions = [
    { value: "one-time", label: "One-time" },
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "yearly", label: "Yearly" },
  ];

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center ${
        isOpen ? "" : "hidden"
      }`}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative z-10 m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">
              {isEditMode ? "Edit Task" : "Task Details"}
            </h2>
            {isEditMode && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                Edit Mode
              </span>
            )}
            {isFromDelegatedTab && (
              <span className="px-2 py-1 bg-emerald-100 text-emerald-800 text-xs font-medium rounded-full">
                Delegated Task
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
              <p className="ml-3 text-gray-600">Loading task details...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600 mb-4">
                <AlertCircle className="h-8 w-8" />
              </div>
              <p className="text-red-600 font-medium">
                Error loading task details
              </p>
              <p className="text-gray-500 mt-2">{error}</p>
              <button
                onClick={onClose}
                className="mt-4 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          ) : task ? (
            <div className="space-y-6">
              {/* Task ID Debug Info (only in development) */}

              {/* Task Header */}
              <div className="border-b pb-4">
                {isEditMode ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Task Title *
                      </label>
                      <input
                        type="text"
                        value={editFormData.taskTitle}
                        onChange={(e) =>
                          handleInputChange("taskTitle", e.target.value)
                        }
                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 ${
                          formErrors.taskTitle
                            ? "border-red-300"
                            : "border-gray-300"
                        }`}
                        placeholder="Enter task title"
                      />
                      {formErrors.taskTitle && (
                        <p className="mt-1 text-sm text-red-600">
                          {formErrors.taskTitle}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {taskTitle}
                  </h1>
                )}

                <div className="flex flex-wrap gap-2 mt-2">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(
                      taskPriority
                    )}`}
                  >
                    <span className="flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {taskPriority.charAt(0).toUpperCase() +
                        taskPriority.slice(1)}{" "}
                      Priority
                    </span>
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      taskStatus
                    )}`}
                  >
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {taskStatus.charAt(0).toUpperCase() + taskStatus.slice(1)}
                    </span>
                  </span>
                  {taskCategory && (
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700">
                      <span className="flex items-center">
                        <Tag className="h-3 w-3 mr-1" />
                        {taskCategory}
                      </span>
                    </span>
                  )}
                </div>
              </div>

              {/* Task Description */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="flex items-center text-lg font-medium mb-2">
                  <FileText className="h-5 w-5 mr-2" />
                  Description
                </h3>
                {isEditMode ? (
                  <div>
                    <textarea
                      value={editFormData.taskDescription}
                      onChange={(e) =>
                        handleInputChange("taskDescription", e.target.value)
                      }
                      rows={4}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 ${
                        formErrors.taskDescription
                          ? "border-red-300"
                          : "border-gray-300"
                      }`}
                      placeholder="Enter task description"
                    />
                    {formErrors.taskDescription && (
                      <p className="mt-1 text-sm text-red-600">
                        {formErrors.taskDescription}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-700 leading-relaxed">
                    {taskDescription || "No description provided"}
                  </p>
                )}
              </div>

              {/* Task Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Assignment Details */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="flex items-center text-lg font-medium mb-4">
                    <User className="h-5 w-5 mr-2" />
                    Assignment Details
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Assigned To *
                      </label>
                      {isEditMode ? (
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => {
                              if (allUsers.length === 0)
                                fetchUsersForDropdown();
                              setShowUserDropdown(!showUserDropdown);
                            }}
                            className={`w-full flex justify-between items-center px-3 py-2 h-10 border rounded-md bg-white ${
                              formErrors.taskAssignedTo
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                            aria-expanded={showUserDropdown}
                            aria-haspopup="listbox"
                          >
                            <span className="text-gray-700 truncate">
                              {selectedUserName}
                            </span>
                            {isFetchingUsers ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <span className="ml-1">▼</span>
                            )}
                          </button>
                          {formErrors.taskAssignedTo && (
                            <p className="mt-1 text-sm text-red-500 flex items-center">
                              <AlertCircle className="h-4 w-4 mr-1" />
                              {formErrors.taskAssignedTo}
                            </p>
                          )}

                          {showUserDropdown && !isFetchingUsers && (
                            <div className="absolute z-20 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-300 max-h-60 overflow-auto">
                              <ul role="listbox" className="py-1">
                                {allUsers.length > 0 ? (
                                  allUsers.map((user) => (
                                    <li
                                      key={user.id}
                                      role="option"
                                      aria-selected={
                                        editFormData.taskAssignedTo === user.id
                                      }
                                      className={`px-3 py-2 cursor-pointer flex items-center ${
                                        editFormData.taskAssignedTo === user.id
                                          ? "bg-blue-100 font-semibold"
                                          : "hover:bg-gray-100"
                                      }`}
                                      onClick={() => handleUserSelect(user.id)}
                                    >
                                      {editFormData.taskAssignedTo ===
                                        user.id && (
                                        <Check className="h-4 w-4 mr-2 text-blue-600" />
                                      )}
                                      <img
                                        src={user.avatar || "/placeholder.svg"}
                                        alt={user.name}
                                        className="w-6 h-6 rounded-full mr-2"
                                      />
                                      <span className="truncate">
                                        {user.name}
                                      </span>
                                    </li>
                                  ))
                                ) : (
                                  <li className="px-3 py-2 text-gray-500">
                                    No users available or failed to load.
                                  </li>
                                )}
                              </ul>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-900">
                          {task?.taskAssignedTo?.fullname ||
                            task?.assignedTo?.fullname ||
                            task?.taskAssignedTo ||
                            task?.assignedTo ||
                            "Not assigned"}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Status
                      </label>
                      <p className="text-gray-900">
                        {taskStatus.charAt(0).toUpperCase() +
                          taskStatus.slice(1)}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Priority *
                      </label>
                      {isEditMode ? (
                        <div>
                          <select
                            value={editFormData.taskPriority}
                            onChange={(e) =>
                              handleInputChange("taskPriority", e.target.value)
                            }
                            className={`mt-1 w-full px-3 py-2 border rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 ${
                              formErrors.taskPriority
                                ? "border-red-300"
                                : "border-gray-300"
                            }`}
                          >
                            {priorityOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          {formErrors.taskPriority && (
                            <p className="mt-1 text-sm text-red-600">
                              {formErrors.taskPriority}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-900">
                          {taskPriority.charAt(0).toUpperCase() +
                            taskPriority.slice(1)}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Category
                      </label>
                      {isEditMode ? (
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() =>
                              setShowCategoryDropdown(!showCategoryDropdown)
                            }
                            className="w-full flex justify-between items-center px-3 py-2 h-10 border border-gray-300 rounded-md bg-white"
                            aria-expanded={showCategoryDropdown}
                            aria-haspopup="listbox"
                          >
                            <span className="text-gray-700 truncate">
                              {editFormData.taskCategory || "Select Category"}
                            </span>
                            <span className="ml-1">▼</span>
                          </button>

                          {showCategoryDropdown && (
                            <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-300 max-h-60 overflow-auto">
                              <ul role="listbox" className="py-1">
                                {mockCategories.length > 0 ? (
                                  mockCategories.map((category) => (
                                    <li
                                      key={category.id}
                                      role="option"
                                      aria-selected={
                                        editFormData.taskCategory ===
                                        category.name
                                      }
                                      className={`px-3 py-2 cursor-pointer ${
                                        editFormData.taskCategory ===
                                        category.name
                                          ? "bg-blue-50"
                                          : "hover:bg-gray-100"
                                      }`}
                                      onClick={() =>
                                        handleCategorySelect(category.name)
                                      }
                                    >
                                      {category.name}
                                    </li>
                                  ))
                                ) : (
                                  <li className="px-3 py-2 text-gray-500">
                                    No categories available
                                  </li>
                                )}
                              </ul>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-900">
                          {taskCategory || "No category"}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Created By
                      </label>
                      <p className="text-gray-900">{taskCreatedBy}</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Frequency *
                      </label>
                      {isEditMode ? (
                        <div>
                          <select
                            value={editFormData.taskFrequency}
                            onChange={(e) =>
                              handleInputChange("taskFrequency", e.target.value)
                            }
                            className={`mt-1 w-full px-3 py-2 border rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 ${
                              formErrors.taskFrequency
                                ? "border-red-300"
                                : "border-gray-300"
                            }`}
                          >
                            <option value="one-time">One-time</option>
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly</option>
                          </select>
                          {formErrors.taskFrequency && (
                            <p className="mt-1 text-sm text-red-600">
                              {formErrors.taskFrequency}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-900">
                          {getFrequencyDisplay(taskFrequency)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Timeline Details */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="flex items-center text-lg font-medium mb-4">
                    <Calendar className="h-5 w-5 mr-2" />
                    Timeline
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Due Date
                      </label>
                      {isEditMode ? (
                        <div>
                          <input
                            type="date"
                            value={editFormData.taskDueDate}
                            onChange={(e) =>
                              handleInputChange("taskDueDate", e.target.value)
                            }
                            className={`mt-1 w-full px-3 py-2 border rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 ${
                              formErrors.taskDueDate
                                ? "border-red-300"
                                : "border-gray-300"
                            }`}
                          />
                          {formErrors.taskDueDate && (
                            <p className="mt-1 text-sm text-red-600">
                              {formErrors.taskDueDate}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-900">
                          {taskDueDate
                            ? formatDate(taskDueDate)
                            : "No due date"}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Created
                      </label>
                      <p className="text-gray-900">
                        {task.createdAt
                          ? formatDate(task.createdAt)
                          : "Unknown"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Last Updated
                      </label>
                      <p className="text-gray-900">
                        {task.updatedAt
                          ? formatDate(task.updatedAt)
                          : "Unknown"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comments Section */}
              <div className="border-t pt-6">
                <h3 className="flex items-center text-lg font-semibold text-gray-900 mb-3">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Comments
                </h3>
                <div className="space-y-4 max-h-60 overflow-y-auto mb-4 pr-2 bg-gray-50 p-4 rounded-md">
                  {task?.comments && task.comments.length > 0 ? (
                    task.comments.map((comment, index) => (
                      <div
                        key={comment._id || `comment-${index}`}
                        className="flex space-x-3 pb-3 border-b border-gray-200 last:border-b-0"
                      >
                        <UserCircle className="h-8 w-8 text-gray-400 mt-1" />
                        <div className="flex-1">
                          <div className="flex items-baseline">
                            <p className="text-sm font-medium text-gray-800">
                              {/* Adjust based on how user info is stored in comment object */}
                              {comment.user?.fullname ||
                                comment.user?.name ||
                                comment.user ||
                                "User"}
                            </p>
                            <span className="ml-2 text-xs text-gray-500">
                              {formatCommentTimestamp(
                                comment.createdAt || comment.timestamp
                              )}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
                            {comment.text}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-4 text-center">
                      <p className="text-gray-500">
                        No comments yet. Be the first to comment!
                      </p>
                    </div>
                  )}
                </div>

                {!isEditMode && (
                  <form onSubmit={handleCommentSubmit} className="mt-4">
                    <div className="flex items-start space-x-2">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="flex-1 min-h-[60px] p-2 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                        rows={2}
                      />
                      <button
                        type="submit"
                        disabled={
                          !newComment.trim() ||
                          isSubmittingComment ||
                          taskLoading.createComment
                        }
                        className="px-4 py-2 h-[60px] bg-emerald-500 text-white rounded-md hover:bg-emerald-600 disabled:opacity-50 flex items-center justify-center"
                      >
                        {isSubmittingComment || taskLoading.createComment ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {taskErrors.createComment && (
                      <p className="mt-1 text-sm text-red-600">
                        {taskErrors.createComment}
                      </p>
                    )}
                  </form>
                )}
              </div>

              {/* Task ID Error */}
              {formErrors.taskId && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                  <p className="text-sm">
                    <strong>Error:</strong> {formErrors.taskId} - Cannot update
                    task without a valid ID.
                  </p>
                </div>
              )}

              {/* Redux Error Display */}
              {taskErrors.edit && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                  <p className="text-sm">
                    <strong>Update Error:</strong> {taskErrors.edit}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                {isFromDelegatedTab && !isEditMode && (
                  <button
                    onClick={handleEditClick}
                    className="flex items-center gap-2 px-6 py-2 bg-[#10b981] text-white rounded-md hover:bg-[#059669] transition-colors"
                  >
                    <Edit3 className="h-4 w-4" />
                    Edit Task
                  </button>
                )}

                {isEditMode && (
                  <>
                    <button
                      onClick={handleCancelEdit}
                      disabled={taskLoading.edit}
                      className="flex items-center gap-2 px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      <XCircle className="h-4 w-4" />
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={taskLoading.edit || !taskId}
                      className="flex items-center gap-2 px-6 py-2 bg-[#10b981] text-white rounded-md hover:bg-[#059669] transition-colors disabled:opacity-50"
                    >
                      {taskLoading.edit ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                          Updating Task...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Submit Changes
                        </>
                      )}
                    </button>
                  </>
                )}

                {!isEditMode && (
                  <button
                    onClick={onClose}
                    className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">Task not found</p>
              <button
                onClick={onClose}
                className="mt-4 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewTaskModal;
