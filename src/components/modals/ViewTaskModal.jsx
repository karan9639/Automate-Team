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
  MessageSquare,
  UserCircle,
  Send,
  ImageIcon,
} from "lucide-react";
import { formatDate } from "../../utils/helpers";
import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  editTask,
  fetchTaskComments,
  createTaskComment,
} from "../../store/slices/taskSlice";
import { userApi } from "../../apiService/apiService";
import { toast } from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";

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

  // Redux state - includes comments from ViewTaskModal1
  const {
    comments,
    loading: taskLoadingState,
    error: taskErrorState,
  } = useSelector((state) => state.tasks);
  const { user: loggedInUser } = useSelector((state) => state.auth);

  const [isEditMode, setIsEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [taskId, setTaskId] = useState(null);

  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  // Comment functionality from ViewTaskModal1
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // User API integration from AssignTaskModal
  const [allUsers, setAllUsers] = useState([]);
  const [isFetchingUsers, setIsFetchingUsers] = useState(false);

  // Mock categories - replace with actual API if available
  const mockCategories = useMemo(
    () => [
      { id: "cat1", name: "Sampling" },
      { id: "cat2", name: "PPC" },
      { id: "cat3", name: "Job Work" },
      { id: "cat4", name: "Greige" },
      { id: "cat5", name: "Form Lamination" },
      { id: "cat6", name: "Flat Knit" },
      { id: "cat7", name: "Dyeing" },
      { id: "cat8", name: "Dyeing Lab" },
      { id: "cat9", name: "Dispatch Dyeing" },
      { id: "cat10", name: "Digital Printing" },
      { id: "cat11", name: "Biling" },
      { id: "cat12", name: "Adhessive" },
      { id: "cat13", name: "Accounts" },
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

  // Fetch comments when modal opens and taskId is available
  useEffect(() => {
    if (isOpen && taskId) {
      console.log("ViewTaskModal: Fetching comments for task ID:", taskId);
      dispatch(fetchTaskComments(taskId));
    }
  }, [isOpen, taskId, dispatch]);

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

  // Comment functionality from ViewTaskModal1
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !taskId || !loggedInUser) return;
    setIsSubmittingComment(true);
    try {
      const commentData = { comment: newComment.trim() };
      await dispatch(createTaskComment({ taskId, commentData }));
      setNewComment("");
    } catch (error) {
      console.error("Failed to submit comment:", error);
      toast.error("Failed to post comment.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // UI Helper functions from ViewTaskModal1
  const formatCommentTimestamp = (timestamp) => {
    if (!timestamp) return "Just now";
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      return "Invalid date";
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

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700";
      case "low":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600";
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700";
      case "in progress":
        return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700";
      case "overdue":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600";
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

  // Loading and error states for specific operations
  const commentsLoading = taskLoadingState?.fetchComments;
  const commentsError = taskErrorState?.fetchComments;
  const createCommentLoading = taskLoadingState?.createComment;
  const createCommentError = taskErrorState?.createComment;
  const editTaskLoading = taskLoadingState?.edit;

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
        // Only show toast if the Redux action didn't already show one
        if (!result.payload?.message) {
          toast.success("Task updated successfully!");
        }

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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative z-10 m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {isEditMode ? "Edit Task" : "Task Details"}
            </h2>
            {isEditMode && (
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs font-medium rounded-full">
                Edit Mode
              </span>
            )}
            {isFromDelegatedTab && (
              <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 text-xs font-medium rounded-full">
                Delegated Task
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="animate-spin h-12 w-12 text-emerald-500" />
              <p className="ml-3 text-gray-600 dark:text-gray-400">
                Loading task details...
              </p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
              <p className="text-red-600 font-medium">
                Error loading task details
              </p>
              <p className="text-gray-500 dark:text-gray-400 mt-2">{error}</p>
              <button
                onClick={onClose}
                className="mt-4 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          ) : task ? (
            <div className="space-y-6">
              {/* Task Header */}
              <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                {isEditMode ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Task Title *
                      </label>
                      <input
                        type="text"
                        value={editFormData.taskTitle}
                        onChange={(e) =>
                          handleInputChange("taskTitle", e.target.value)
                        }
                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 break-words ${
                          formErrors.taskTitle
                            ? "border-red-300"
                            : "border-gray-300"
                        }`}
                        style={{
                          overflowWrap: "break-word",
                          wordBreak: "break-word",
                        }}
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
                  <h1
                    className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2 break-words line-clamp-2"
                    style={{
                      overflowWrap: "break-word",
                      wordBreak: "break-word",
                    }}
                  >
                    {taskTitle}
                  </h1>
                )}

                <div className="flex flex-wrap gap-2 mt-2">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(
                      taskPriority
                    )}`}
                  >
                    <span className="flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1 inline" />
                      {taskPriority.charAt(0).toUpperCase() +
                        taskPriority.slice(1)}{" "}
                      Priority
                    </span>
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                      taskStatus
                    )}`}
                  >
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1 inline" />
                      {taskStatus.charAt(0).toUpperCase() + taskStatus.slice(1)}
                    </span>
                  </span>
                  {taskCategory && (
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700">
                      <span className="flex items-center">
                        <Tag className="h-3 w-3 mr-1 inline" />
                        {taskCategory}
                      </span>
                    </span>
                  )}
                </div>
              </div>

              {/* Task Description */}
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                <h3 className="flex items-center text-lg font-medium mb-3 text-gray-900 dark:text-gray-100">
                  <FileText className="h-5 w-5 mr-2 text-emerald-600" />
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
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 break-words ${
                        formErrors.taskDescription
                          ? "border-red-300"
                          : "border-gray-300"
                      }`}
                      style={{
                        overflowWrap: "break-word",
                        wordBreak: "break-word",
                      }}
                      placeholder="Enter task description"
                    />
                    {formErrors.taskDescription && (
                      <p className="mt-1 text-sm text-red-600">
                        {formErrors.taskDescription}
                      </p>
                    )}
                  </div>
                ) : (
                  <div
                    className="text-gray-700 dark:text-gray-300 break-words"
                    style={{
                      overflowWrap: "break-word",
                      wordBreak: "break-word",
                    }}
                  >
                    <div className="space-y-1">
                      {(taskDescription || "No description provided")
                        .split("\n")
                        .map((line, index) => {
                          const isNumberedItem = /^\d+\.\s/.test(line.trim());
                          return (
                            <div
                              key={index}
                              className={`${
                                isNumberedItem
                                  ? "flex items-start gap-3 py-1.5"
                                  : line.trim()
                                  ? "py-1"
                                  : ""
                              }`}
                            >
                              {isNumberedItem ? (
                                <>
                                  <span className="inline-flex items-center justify-center min-w-[24px] h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                                    {line.match(/^(\d+)\./)[1]}
                                  </span>
                                  <span className="flex-1 pt-0.5 leading-relaxed">
                                    {line.replace(/^\d+\.\s/, "")}
                                  </span>
                                </>
                              ) : (
                                <span className="leading-relaxed">{line}</span>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>

              {/* Task Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Assignment Details */}
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                  <h3 className="flex items-center text-lg font-medium mb-4 text-gray-900 dark:text-gray-100">
                    <User className="h-5 w-5 mr-2" />
                    Assignment Details
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
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
                            className={`w-full flex justify-between items-center px-3 py-2 h-10 border rounded-md bg-white dark:bg-gray-700 ${
                              formErrors.taskAssignedTo
                                ? "border-red-500"
                                : "border-gray-300 dark:border-gray-600"
                            }`}
                            aria-expanded={showUserDropdown}
                            aria-haspopup="listbox"
                          >
                            <span className="text-gray-700 dark:text-gray-200 truncate">
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
                            <div className="absolute z-20 mt-1 w-full bg-white dark:bg-gray-700 shadow-lg rounded-md border border-gray-300 dark:border-gray-600 max-h-60 overflow-auto">
                              <ul role="listbox" className="py-1">
                                {allUsers.length > 0 ? (
                                  allUsers.map((user) => (
                                    <li
                                      key={user.id}
                                      role="option"
                                      aria-selected={
                                        editFormData.taskAssignedTo === user.id
                                      }
                                      className={`px-3 py-2 cursor-pointer flex items-center text-gray-900 dark:text-gray-100 ${
                                        editFormData.taskAssignedTo === user.id
                                          ? "bg-blue-100 dark:bg-blue-600 font-semibold"
                                          : "hover:bg-gray-100 dark:hover:bg-gray-600"
                                      }`}
                                      onClick={() => handleUserSelect(user.id)}
                                    >
                                      {editFormData.taskAssignedTo ===
                                        user.id && (
                                        <Check className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-300" />
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
                                  <li className="px-3 py-2 text-gray-500 dark:text-gray-400">
                                    No users available or failed to load.
                                  </li>
                                )}
                              </ul>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-900 dark:text-gray-100">
                          {taskAssignedTo}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Status
                      </label>
                      <p className="text-gray-900 dark:text-gray-100">
                        {taskStatus.charAt(0).toUpperCase() +
                          taskStatus.slice(1)}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Priority *
                      </label>
                      {isEditMode ? (
                        <div>
                          <select
                            value={editFormData.taskPriority}
                            onChange={(e) =>
                              handleInputChange("taskPriority", e.target.value)
                            }
                            className={`mt-1 w-full px-3 py-2 border rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 ${
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
                        <p className="text-gray-900 dark:text-gray-100">
                          {taskPriority.charAt(0).toUpperCase() +
                            taskPriority.slice(1)}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Category
                      </label>
                      {isEditMode ? (
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() =>
                              setShowCategoryDropdown(!showCategoryDropdown)
                            }
                            className="w-full flex justify-between items-center px-3 py-2 h-10 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                            aria-expanded={showCategoryDropdown}
                            aria-haspopup="listbox"
                          >
                            <span className="text-gray-700 dark:text-gray-200 truncate">
                              {editFormData.taskCategory || "Select Category"}
                            </span>
                            <span className="ml-1">▼</span>
                          </button>

                          {showCategoryDropdown && (
                            <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 shadow-lg rounded-md border border-gray-300 dark:border-gray-600 max-h-60 overflow-auto">
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
                                      className={`px-3 py-2 cursor-pointer text-gray-900 dark:text-gray-100 ${
                                        editFormData.taskCategory ===
                                        category.name
                                          ? "bg-blue-50 dark:bg-blue-600"
                                          : "hover:bg-gray-100 dark:hover:bg-gray-600"
                                      }`}
                                      onClick={() =>
                                        handleCategorySelect(category.name)
                                      }
                                    >
                                      {category.name}
                                    </li>
                                  ))
                                ) : (
                                  <li className="px-3 py-2 text-gray-500 dark:text-gray-400">
                                    No categories available
                                  </li>
                                )}
                              </ul>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-900 dark:text-gray-100">
                          {taskCategory || "No category"}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Created By
                      </label>
                      <p className="text-gray-900 dark:text-gray-100">
                        {taskCreatedBy}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Frequency *
                      </label>
                      {isEditMode ? (
                        <div>
                          <select
                            value={editFormData.taskFrequency}
                            onChange={(e) =>
                              handleInputChange("taskFrequency", e.target.value)
                            }
                            className={`mt-1 w-full px-3 py-2 border rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 ${
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
                        <p className="text-gray-900 dark:text-gray-100">
                          {getFrequencyDisplay(taskFrequency)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Timeline Details */}
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                  <h3 className="flex items-center text-lg font-medium mb-4 text-gray-900 dark:text-gray-100">
                    <Calendar className="h-5 w-5 mr-2" />
                    Timeline
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
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
                            className={`mt-1 w-full px-3 py-2 border rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 ${
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
                        <p className="text-gray-900 dark:text-gray-100">
                          {taskDueDate
                            ? formatDate(taskDueDate)
                            : "No due date"}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Created
                      </label>
                      <p className="text-gray-900 dark:text-gray-100">
                        {task.createdAt
                          ? formatDate(task.createdAt)
                          : "Unknown"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Last Updated
                      </label>
                      <p className="text-gray-900 dark:text-gray-100">
                        {task.updatedAt
                          ? formatDate(task.updatedAt)
                          : "Unknown"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              {task?.taskImage?.url && (
                <div className="mt-6">
                  <h3 className="flex items-center text-lg font-medium mb-3 text-gray-900 dark:text-gray-100">
                    <ImageIcon className="h-5 w-5 mr-2 text-gray-700 dark:text-gray-300" />
                    Attached Image
                  </h3>
                  <div className="p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700/50">
                    <img
                      src={task.taskImage.url || "/placeholder.svg"}
                      alt={`Attachment for ${taskTitle}`}
                      className="rounded-md max-w-full h-auto mx-auto block shadow-sm"
                      onError={(e) => {
                        e.target.style.display = "none";
                        const errorText = document.createElement("p");
                        errorText.textContent = "Image not available.";
                        errorText.className = "text-center text-red-500 py-4";
                        e.target.parentNode.appendChild(errorText);
                      }}
                    />
                    <div className="text-center mt-4">
                      <a
                        href={task.taskImage.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                      >
                        View Image
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Comments Section - Added from ViewTaskModal1 */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="flex items-center text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Comments
                </h3>
                <div className="space-y-4 max-h-60 overflow-y-auto mb-4 pr-2 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-md">
                  {commentsLoading ? (
                    <div className="flex justify-center items-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
                      <p className="ml-2 text-gray-500 dark:text-gray-400">
                        Loading comments...
                      </p>
                    </div>
                  ) : commentsError ? (
                    <div className="py-4 text-center text-red-600">
                      <AlertCircle className="h-6 w-6 mx-auto mb-2" />
                      <p>
                        Error:{" "}
                        {typeof commentsError === "string"
                          ? commentsError
                          : "Failed to load comments."}
                      </p>
                    </div>
                  ) : comments && comments.length > 0 ? (
                    comments.map((comment, index) => (
                      <div
                        key={comment.id || comment._id || `comment-${index}`}
                        className="flex space-x-3 pb-3 border-b border-gray-200 dark:border-gray-600 last:border-b-0"
                      >
                        <UserCircle className="h-8 w-8 text-gray-400 dark:text-gray-500 mt-1 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-baseline">
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                              {comment.commentedBy?.fullname ||
                                "Anonymous User"}
                            </p>
                            <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                              {formatCommentTimestamp(comment.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 whitespace-pre-wrap">
                            {comment.comment || (
                              <span className="italic text-gray-400 dark:text-gray-500">
                                No comment text provided.
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-4 text-center">
                      <p className="text-gray-500 dark:text-gray-400">
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
                        className="flex-1 min-h-[60px] p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-gray-100"
                        rows={2}
                      />
                      <button
                        type="submit"
                        disabled={
                          !newComment.trim() ||
                          isSubmittingComment ||
                          createCommentLoading
                        }
                        className="px-4 py-2 h-[60px] bg-emerald-500 text-white rounded-md hover:bg-emerald-600 disabled:opacity-50 flex items-center justify-center"
                      >
                        {isSubmittingComment || createCommentLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {createCommentError && (
                      <p className="mt-1 text-sm text-red-600">
                        {typeof createCommentError === "string"
                          ? createCommentError
                          : "Failed to post comment."}
                      </p>
                    )}
                  </form>
                )}
              </div>

              {/* Task ID Error */}
              {formErrors.taskId && (
                <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded-md">
                  <p className="text-sm">
                    <strong>Error:</strong> {formErrors.taskId} - Cannot update
                    task without a valid ID.
                  </p>
                </div>
              )}

              {/* Redux Error Display */}
              {taskErrorState?.edit && (
                <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded-md">
                  <p className="text-sm">
                    <strong>Update Error:</strong> {taskErrorState.edit}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                {isFromDelegatedTab && !isEditMode && (
                  <button
                    onClick={handleEditClick}
                    className="flex items-center gap-2 px-6 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition-colors"
                  >
                    <Edit3 className="h-4 w-4" />
                    Edit Task
                  </button>
                )}

                {isEditMode && (
                  <>
                    <button
                      onClick={handleCancelEdit}
                      disabled={editTaskLoading}
                      className="flex items-center gap-2 px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                    >
                      <XCircle className="h-4 w-4" />
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={editTaskLoading || !taskId}
                      className="flex items-center gap-2 px-6 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition-colors disabled:opacity-50"
                    >
                      {editTaskLoading ? (
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
                    className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Task not found</p>
              <button
                onClick={onClose}
                className="mt-4 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
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
