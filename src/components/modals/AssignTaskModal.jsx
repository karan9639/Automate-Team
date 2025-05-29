"use client";

import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Modal } from "../../components/ui/modal";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Switch } from "../../components/ui/switch";
import { updateTaskLocal, addTaskLocal } from "../../store/slices/taskSlice";
import { taskApi } from "../../apiService/apiService"; // Updated import
import {
  Check,
  Link,
  FileText,
  ImageIcon,
  Clock,
  Mic,
  AlertCircle,
} from "lucide-react";
import { generateId } from "../../utils/helpers";
import { toast } from "react-hot-toast";
import { createSelector } from "@reduxjs/toolkit";

// Memoized selectors
const selectUsers = createSelector(
  [(state) => state.team?.users || []],
  (users) => users
);

const selectCategories = createSelector(
  [(state) => state.tasks?.categories || []],
  (categories) => categories
);

// Validation schema (remains the same)
const validateTaskForm = (formData) => {
  const errors = {};

  if (!formData.taskTitle || !formData.taskTitle.trim()) {
    errors.taskTitle = "Task title is required";
  } else if (formData.taskTitle.trim().length < 3) {
    errors.taskTitle = "Task title must be at least 3 characters long";
  } else if (formData.taskTitle.trim().length > 100) {
    errors.taskTitle = "Task title must not exceed 100 characters";
  }

  if (formData.taskDescription && formData.taskDescription.trim().length > 0) {
    if (formData.taskDescription.trim().length < 10) {
      errors.taskDescription =
        "Description must be at least 10 characters long";
    } else if (formData.taskDescription.trim().length > 500) {
      errors.taskDescription = "Description must not exceed 500 characters";
    }
  }

  if (!formData.taskAssignedTo || formData.taskAssignedTo.length === 0) {
    errors.taskAssignedTo = "At least one user must be assigned";
  }

  if (!formData.taskCategory || !formData.taskCategory.trim()) {
    errors.taskCategory = "Task category is required";
  }

  if (!formData.taskDueDate) {
    errors.taskDueDate = "Due date is required";
  } else {
    const selectedDate = new Date(formData.taskDueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      errors.taskDueDate = "Due date cannot be in the past";
    }
  }

  const validPriorities = ["low", "medium", "high"];
  if (
    !formData.taskPriority ||
    !validPriorities.includes(formData.taskPriority.toLowerCase())
  ) {
    errors.taskPriority = "Please select a valid priority";
  }

  const validFrequencies = [
    "one-time",
    "daily",
    "weekly",
    "monthly",
    "quarterly",
    "yearly",
  ];
  if (
    !formData.taskFrequency ||
    !validFrequencies.includes(formData.taskFrequency.toLowerCase())
  ) {
    errors.taskFrequency = "Please select a valid frequency";
  }

  return errors;
};

const AssignTaskModal = ({ isOpen, onClose, task = null }) => {
  const dispatch = useDispatch();
  // Use memoized selectors
  const users = useSelector(selectUsers);
  const categories = useSelector(selectCategories);

  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskAssignedTo, setTaskAssignedTo] = useState([]);
  const [taskCategory, setTaskCategory] = useState("");
  const [usersInLoop, setUsersInLoop] = useState([]); // This field is not in your API spec for create/edit task
  const [taskPriority, setTaskPriority] = useState("medium");
  const [taskFrequency, setTaskFrequency] = useState("one-time");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [assignMoreTasks, setAssignMoreTasks] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showLoopDropdown, setShowLoopDropdown] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (task) {
        setTaskTitle(task.taskTitle || "");
        setTaskDescription(task.taskDescription || "");
        setTaskAssignedTo(task.taskAssignedTo || []);
        setTaskCategory(task.taskCategory || "");
        setTaskPriority(task.taskPriority?.toLowerCase() || "medium");
        setTaskFrequency(task.taskFrequency?.toLowerCase() || "one-time");
        setTaskDueDate(task.taskDueDate ? task.taskDueDate.split("T")[0] : "");
        // setUsersInLoop(task.usersInLoop || []); // If you keep this UI element
      } else {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setTaskDueDate(tomorrow.toISOString().split("T")[0]);
        setTaskFrequency("one-time");
        setTaskPriority("medium");
        setTaskTitle("");
        setTaskDescription("");
        setTaskAssignedTo([]);
        setTaskCategory("");
        setUsersInLoop([]);
      }
      setErrors({});
    } else {
      resetForm();
    }
  }, [isOpen, task]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const currentFormData = {
      taskTitle: taskTitle.trim(),
      taskDescription: taskDescription.trim(),
      taskAssignedTo, // Ensure this is an array of user IDs
      taskCategory: taskCategory.trim(),
      taskDueDate,
      taskPriority: taskPriority.toLowerCase(),
      taskFrequency: taskFrequency.toLowerCase(),
    };

    const validationErrors = validateTaskForm(currentFormData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Please fix the validation errors.");
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      let response;
      if (task && task.id) {
        // Editing existing task
        response = await taskApi.editTask(task.id, currentFormData);
        // Assuming response.data contains the updated task
        dispatch(updateTaskLocal({ id: task.id, ...response.data.task })); // Adjust based on actual API response structure
        toast.success(response.data.message || "Task updated successfully!");
      } else {
        // Creating new task
        response = await taskApi.createTask(currentFormData);
        // Assuming response.data contains the new task
        dispatch(
          addTaskLocal({
            id: response.data.task?.id || generateId(),
            ...response.data.task,
          })
        ); // Adjust
        toast.success(response.data.message || "Task created successfully!");
      }

      if (!assignMoreTasks) {
        onClose();
      } else {
        resetForm(true); // Pass true to keep due date for next task
      }
    } catch (error) {
      console.error("Error saving task:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to save task. Please try again.";
      setErrors({ submit: errorMessage });
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = (keepDueDate = false) => {
    setTaskTitle("");
    setTaskDescription("");
    setTaskAssignedTo([]);
    setTaskCategory("");
    setUsersInLoop([]);
    setTaskPriority("medium");
    setTaskFrequency("one-time");
    if (!keepDueDate) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setTaskDueDate(tomorrow.toISOString().split("T")[0]);
    }
    setErrors({});
    // setAssignMoreTasks(false); // Decide if this should reset
  };

  const handleUserSelect = (userId) => {
    setTaskAssignedTo((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
    if (errors.taskAssignedTo)
      setErrors((prev) => ({ ...prev, taskAssignedTo: "" }));
  };

  const handleCategorySelect = (categoryName) => {
    setTaskCategory(categoryName);
    setShowCategoryDropdown(false);
    if (errors.taskCategory)
      setErrors((prev) => ({ ...prev, taskCategory: "" }));
  };

  const handleLoopUserSelect = (userId) => {
    setUsersInLoop((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleInputChange = (field, value) => {
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
    if (field === "taskTitle") setTaskTitle(value);
    if (field === "taskDescription") setTaskDescription(value);
    if (field === "taskDueDate") setTaskDueDate(value);
  };

  // Mock data for dropdowns - use memoized values to prevent unnecessary rerenders
  const mockUsers = useMemo(
    () => [
      {
        id: "1",
        name: "John Doe",
        avatar: "/placeholder.svg?height=32&width=32",
      },
      {
        id: "2",
        name: "Jane Smith",
        avatar: "/placeholder.svg?height=32&width=32",
      },
      {
        id: "3",
        name: "Alex Johnson",
        avatar: "/placeholder.svg?height=32&width=32",
      },
    ],
    []
  );

  const mockCategories = useMemo(
    () => [
      { id: "1", name: "Development" },
      { id: "2", name: "Design" },
      { id: "3", name: "Marketing" },
      { id: "4", name: "Operations" },
    ],
    []
  );

  const frequencyOptions = useMemo(
    () => [
      { value: "one-time", label: "One-time" },
      { value: "daily", label: "Daily" },
      { value: "weekly", label: "Weekly" },
      { value: "monthly", label: "Monthly" },
      { value: "quarterly", label: "Quarterly" },
      { value: "yearly", label: "Yearly" },
    ],
    []
  );

  // JSX remains largely the same, ensure field names in form match state variables
  // ... (rest of the JSX from your previous AssignTaskModal)
  // Ensure that the 'value' and 'onChange' for inputs, textareas, selects, etc.,
  // correctly map to the state variables (taskTitle, taskDescription, taskAssignedTo, etc.)
  // and their respective handlers.

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={task ? "Edit Task" : "Assign New Task"}
      className="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="px-1 py-2 md:px-2">
        <div className="space-y-6">
          {/* Task Title */}
          <div className="space-y-2">
            <label
              htmlFor="taskTitle"
              className="block text-sm font-medium text-gray-700"
            >
              Task Title <span className="text-red-500">*</span>
            </label>
            <Input
              id="taskTitle"
              value={taskTitle}
              onChange={(e) => handleInputChange("taskTitle", e.target.value)}
              placeholder="Enter task title"
              aria-invalid={errors.taskTitle ? "true" : "false"}
              aria-describedby={
                errors.taskTitle ? "taskTitle-error" : undefined
              }
              className={`h-10 ${
                errors.taskTitle ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.taskTitle && (
              <p
                id="taskTitle-error"
                className="mt-1 text-sm text-red-500 flex items-center"
              >
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.taskTitle}
              </p>
            )}
          </div>

          {/* Task Description */}
          <div className="space-y-2">
            <label
              htmlFor="taskDescription"
              className="block text-sm font-medium text-gray-700"
            >
              Task Description
            </label>
            <Textarea
              id="taskDescription"
              value={taskDescription}
              onChange={(e) =>
                handleInputChange("taskDescription", e.target.value)
              }
              placeholder="Short description of the task..."
              className={`min-h-[100px] bg-gray-50 rounded-md ${
                errors.taskDescription ? "border-red-500" : "border-gray-300"
              }`}
              rows={4}
            />
            {errors.taskDescription && (
              <p className="mt-1 text-sm text-red-500 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.taskDescription}
              </p>
            )}
          </div>

          {/* Two-column layout for Users and Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Assign To */}
            <div className="space-y-2">
              <label
                htmlFor="taskAssignedTo"
                className="block text-sm font-medium text-gray-700"
              >
                Assign To <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <button
                  type="button"
                  id="taskAssignedToButton" // Changed ID to avoid conflict with state variable
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className={`w-full flex justify-between items-center px-3 py-2 h-10 border rounded-md bg-white ${
                    errors.taskAssignedTo ? "border-red-500" : "border-gray-300"
                  }`}
                  aria-expanded={showUserDropdown}
                  aria-haspopup="listbox"
                >
                  <span className="text-gray-700 truncate">
                    {taskAssignedTo.length > 0
                      ? `${taskAssignedTo.length} user(s) selected`
                      : "Select Users"}
                  </span>
                  <span className="ml-1">▼</span>
                </button>
                {errors.taskAssignedTo && (
                  <p className="mt-1 text-sm text-red-500 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.taskAssignedTo}
                  </p>
                )}

                {showUserDropdown && (
                  <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-300 max-h-60 overflow-auto">
                    <ul role="listbox" className="py-1">
                      {mockUsers.length > 0 ? (
                        mockUsers.map((user) => (
                          <li
                            key={user.id}
                            role="option"
                            aria-selected={taskAssignedTo.includes(user.id)}
                            className={`px-3 py-2 cursor-pointer flex items-center ${
                              taskAssignedTo.includes(user.id)
                                ? "bg-blue-50"
                                : "hover:bg-gray-100"
                            }`}
                            onClick={() => handleUserSelect(user.id)}
                          >
                            <div className="mr-2 h-4 w-4 border rounded flex items-center justify-center bg-white">
                              {taskAssignedTo.includes(user.id) && (
                                <Check className="h-3 w-3 text-blue-500" />
                              )}
                            </div>
                            <img
                              src={user.avatar || "/placeholder.svg"}
                              alt={user.name}
                              className="w-6 h-6 rounded-full mr-2"
                            />
                            <span className="truncate">{user.name}</span>
                          </li>
                        ))
                      ) : (
                        <li className="px-3 py-2 text-gray-500">
                          No users available
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label
                htmlFor="taskCategory"
                className="block text-sm font-medium text-gray-700"
              >
                Category <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <button
                  type="button"
                  id="taskCategoryButton" // Changed ID
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  className={`w-full flex justify-between items-center px-3 py-2 h-10 border rounded-md bg-white ${
                    errors.taskCategory ? "border-red-500" : "border-gray-300"
                  }`}
                  aria-expanded={showCategoryDropdown}
                  aria-haspopup="listbox"
                >
                  <span className="text-gray-700 truncate">
                    {taskCategory || "Select Category"}
                  </span>
                  <span className="ml-1">▼</span>
                </button>
                {errors.taskCategory && (
                  <p className="mt-1 text-sm text-red-500 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.taskCategory}
                  </p>
                )}

                {showCategoryDropdown && (
                  <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-300 max-h-60 overflow-auto">
                    <ul role="listbox" className="py-1">
                      {mockCategories.length > 0 ? (
                        mockCategories.map((category) => (
                          <li
                            key={category.id}
                            role="option"
                            aria-selected={taskCategory === category.name}
                            className={`px-3 py-2 cursor-pointer ${
                              taskCategory === category.name
                                ? "bg-blue-50"
                                : "hover:bg-gray-100"
                            }`}
                            onClick={() => handleCategorySelect(category.name)}
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
            </div>
          </div>

          {/* Keep in Loop - This field is not in your API spec for create/edit task. Consider removing or clarifying its purpose. */}
          {/* If kept, ensure it's handled appropriately or omitted from API payload if not needed by backend. */}
          <div className="space-y-2">
            <label
              htmlFor="keepInLoop"
              className="block text-sm font-medium text-gray-700"
            >
              Keep in Loop (Optional)
            </label>
            <div className="relative">
              <button
                type="button"
                id="keepInLoopButton"
                onClick={() => setShowLoopDropdown(!showLoopDropdown)}
                className="w-full flex justify-between items-center px-3 py-2 h-10 border border-gray-300 rounded-md bg-white"
                aria-expanded={showLoopDropdown}
                aria-haspopup="listbox"
              >
                <span className="text-gray-700 truncate">
                  {usersInLoop.length > 0
                    ? `${usersInLoop.length} user(s) in loop`
                    : "Select Users to Keep in Loop"}
                </span>
                <span className="ml-1">▼</span>
              </button>
              {showLoopDropdown && (
                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-300 max-h-60 overflow-auto">
                  <ul role="listbox" className="py-1">
                    {mockUsers.length > 0 ? (
                      mockUsers.map((user) => (
                        <li
                          key={user.id}
                          role="option"
                          aria-selected={usersInLoop.includes(user.id)}
                          className={`px-3 py-2 cursor-pointer flex items-center ${
                            usersInLoop.includes(user.id)
                              ? "bg-blue-50"
                              : "hover:bg-gray-100"
                          }`}
                          onClick={() => handleLoopUserSelect(user.id)}
                        >
                          <div className="mr-2 h-4 w-4 border rounded flex items-center justify-center bg-white">
                            {usersInLoop.includes(user.id) && (
                              <Check className="h-3 w-3 text-blue-500" />
                            )}
                          </div>
                          <img
                            src={user.avatar || "/placeholder.svg"}
                            alt={user.name}
                            className="w-6 h-6 rounded-full mr-2"
                          />
                          <span className="truncate">{user.name}</span>
                        </li>
                      ))
                    ) : (
                      <li className="px-3 py-2 text-gray-500">
                        No users available
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Priority */}
          <div className="bg-gray-50 p-4 rounded-md shadow-sm border border-gray-100">
            <div className="flex items-center mb-3">
              <span className="mr-2 text-lg">🚩</span>
              <span className="font-medium">
                Priority <span className="text-red-500">*</span>
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {["high", "medium", "low"].map((priority) => (
                <Button
                  key={priority}
                  type="button"
                  onClick={() => {
                    setTaskPriority(priority);
                    if (errors.taskPriority)
                      setErrors((prev) => ({ ...prev, taskPriority: "" }));
                  }}
                  variant={taskPriority === priority ? "green" : "outline"}
                  className={`flex items-center px-4 py-2 ${
                    taskPriority === priority
                      ? "bg-emerald-500 text-white"
                      : "bg-white"
                  }`}
                >
                  {taskPriority === priority && (
                    <Check className="h-4 w-4 mr-1" />
                  )}
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                </Button>
              ))}
            </div>
            {errors.taskPriority && (
              <p className="mt-2 text-sm text-red-500 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.taskPriority}
              </p>
            )}
          </div>

          {/* Frequency */}
          <div className="bg-gray-50 p-4 rounded-md shadow-sm border border-gray-100">
            <div className="flex items-center mb-3">
              <span className="mr-2 text-lg">🔄</span>
              <span className="font-medium">
                Frequency <span className="text-red-500">*</span>
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {frequencyOptions.map((freq) => (
                <Button
                  key={freq.value}
                  type="button"
                  onClick={() => {
                    setTaskFrequency(freq.value);
                    if (errors.taskFrequency)
                      setErrors((prev) => ({ ...prev, taskFrequency: "" }));
                  }}
                  variant={taskFrequency === freq.value ? "green" : "outline"}
                  className={`flex items-center px-3 py-2 text-sm ${
                    taskFrequency === freq.value
                      ? "bg-emerald-500 text-white"
                      : "bg-white"
                  }`}
                >
                  {taskFrequency === freq.value && (
                    <Check className="h-3 w-3 mr-1" />
                  )}
                  {freq.label}
                </Button>
              ))}
            </div>
            {errors.taskFrequency && (
              <p className="mt-2 text-sm text-red-500 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.taskFrequency}
              </p>
            )}
          </div>

          {/* Due Date */}
          <div className="bg-gray-50 p-4 rounded-md shadow-sm border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center">
              <div className="flex items-center mb-2 sm:mb-0 sm:mr-4 sm:w-auto">
                {" "}
                {/* Adjusted width */}
                <span className="mr-2 text-lg">📅</span>
                <span className="font-medium">
                  Due Date <span className="text-red-500">*</span>
                </span>
              </div>
              <div className="flex-1">
                <Input
                  type="date"
                  value={taskDueDate}
                  onChange={(e) =>
                    handleInputChange("taskDueDate", e.target.value)
                  }
                  className={`h-10 border ${
                    errors.taskDueDate ? "border-red-500" : "border-gray-300"
                  } rounded-md bg-white px-3 py-2 w-full`}
                  aria-invalid={errors.taskDueDate ? "true" : "false"}
                  aria-describedby={
                    errors.taskDueDate ? "taskDueDate-error" : undefined
                  }
                />
                {errors.taskDueDate && (
                  <p
                    id="taskDueDate-error"
                    className="mt-1 text-sm text-red-500 flex items-center"
                  >
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.taskDueDate}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Attachment Options (UI only, no API integration yet) */}
          <div className="flex flex-wrap gap-3 pt-2 justify-center sm:justify-start">
            <Button
              type="button"
              variant="outline"
              className="rounded-full p-2 h-10 w-10"
              size="icon"
              title="Add link"
            >
              <Link className="h-5 w-5" />
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-full p-2 h-10 w-10"
              size="icon"
              title="Attach file"
            >
              <FileText className="h-5 w-5" />
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-full p-2 h-10 w-10"
              size="icon"
              title="Attach image"
            >
              <ImageIcon className="h-5 w-5" />
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-full p-2 h-10 w-10"
              size="icon"
              title="Set reminder"
            >
              <Clock className="h-5 w-5" />
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-full p-2 h-10 w-10"
              size="icon"
              title="Record audio"
            >
              <Mic className="h-5 w-5" />
            </Button>
          </div>

          {/* General Error Message */}
          {errors.submit && (
            <div className="bg-red-50 p-4 rounded-md text-red-600 flex items-center border border-red-200">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <span>{errors.submit}</span>
            </div>
          )}

          {/* Form Footer */}
          <div className="pt-4 mt-6 border-t border-gray-200">
            <div className="flex justify-end items-center gap-3 mb-4">
              <span className="text-sm font-medium">Assign More Tasks</span>
              <Switch
                checked={assignMoreTasks}
                onCheckedChange={setAssignMoreTasks}
                className="data-[state=checked]:bg-emerald-500"
              />
            </div>

            <Button
              type="submit"
              variant="green"
              className="w-full h-11 text-base font-medium bg-emerald-500 hover:bg-emerald-600"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {task ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Check className="mr-2 h-5 w-5" />
                  {task ? "Update Task" : "Create Task"}
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default AssignTaskModal;
