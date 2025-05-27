"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Modal } from "../../components/ui/modal";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Switch } from "../../components/ui/switch";
import { updateTaskLocal, addTaskLocal } from "../../store/slices/taskSlice";
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

const AssignTaskModal = ({ isOpen, onClose, task = null }) => {
  const dispatch = useDispatch();
  const { users } = useSelector((state) => state.team || { users: [] });
  const { categories } = useSelector(
    (state) => state.tasks || { categories: [] }
  );

  // Form state
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [usersInLoop, setUsersInLoop] = useState([]);
  const [selectedPriority, setSelectedPriority] = useState("high");
  const [isRepeating, setIsRepeating] = useState(false);
  const [dueDate, setDueDate] = useState("");
  const [assignMoreTasks, setAssignMoreTasks] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showLoopDropdown, setShowLoopDropdown] = useState(false);

  // Reset form when modal opens/closes or task changes
  useEffect(() => {
    if (isOpen) {
      if (task) {
        // Initialize form with task data for editing
        setTaskTitle(task.title || task.name || "");
        setTaskDescription(task.description || "");
        setSelectedUsers(
          task.assignees
            ? task.assignees.map((a) => (typeof a === "object" ? a.id : a))
            : task.assigneeId
            ? [task.assigneeId]
            : []
        );
        setSelectedCategory(task.category || "");
        setUsersInLoop(task.usersInLoop || []);
        setSelectedPriority(
          task.priority ? task.priority.toLowerCase() : "medium"
        );
        setIsRepeating(
          task.frequency
            ? task.frequency !== "One-time"
            : task.isRepeating || false
        );
        setDueDate(task.dueDate ? task.dueDate.split("T")[0] : "");
      } else {
        // Set default due date to tomorrow for new tasks
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setDueDate(tomorrow.toISOString().split("T")[0]);
      }
    } else {
      resetForm();
    }
  }, [isOpen, task]);

  const validateForm = () => {
    const newErrors = {};

    if (!taskTitle.trim()) {
      newErrors.taskTitle = "Task title is required";
    }

    if (!dueDate) {
      newErrors.dueDate = "Due date is required";
    }

    if (selectedUsers.length === 0) {
      newErrors.selectedUsers = "At least one user must be selected";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Create task object
      const taskData = {
        title: taskTitle,
        description: taskDescription,
        assignees: selectedUsers,
        category: selectedCategory,
        usersInLoop: usersInLoop,
        priority: selectedPriority,
        isRepeating,
        frequency: isRepeating ? "Weekly" : "One-time", // Default to weekly if repeating
        dueDate: dueDate,
        status: task?.status || "pending",
        createdBy: "currentUser", // Replace with actual current user ID
      };

      if (task) {
        // Update existing task
        const updatedTask = {
          ...task,
          ...taskData,
          id: task.id,
        };
        await dispatch(updateTaskLocal({ id: task.id, ...updatedTask }));
        console.log("Task updated successfully:", updatedTask);
      } else {
        // Create new task
        const newTask = {
          id: generateId(),
          ...taskData,
          createdAt: new Date().toISOString(),
          status: "pending",
        };
        await dispatch(addTaskLocal(newTask));
        console.log("Task created successfully:", newTask);
      }

      // Reset form if not assigning more tasks
      if (!assignMoreTasks) {
        onClose();
      } else {
        resetForm();
      }
    } catch (error) {
      console.error("Error saving task:", error);
      setErrors({ submit: "Failed to save task. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTaskTitle("");
    setTaskDescription("");
    setSelectedUsers([]);
    setSelectedCategory("");
    setUsersInLoop([]);
    setSelectedPriority("high");
    setIsRepeating(false);
    setDueDate("");
    setErrors({});
  };

  const handleUserSelect = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setShowCategoryDropdown(false);
  };

  const handleLoopUserSelect = (userId) => {
    if (usersInLoop.includes(userId)) {
      setUsersInLoop(usersInLoop.filter((id) => id !== userId));
    } else {
      setUsersInLoop([...usersInLoop, userId]);
    }
  };

  // Mock data for demonstration
  const mockUsers = [
    { id: "1", name: "John Doe", avatar: "/abstract-geometric-shapes.png" },
    { id: "2", name: "Jane Smith", avatar: "/abstract-geometric-shapes.png" },
    { id: "3", name: "Alex Johnson", avatar: "/abstract-geometric-shapes.png" },
  ];

  const mockCategories = [
    { id: "1", name: "Development" },
    { id: "2", name: "Design" },
    { id: "3", name: "Marketing" },
    { id: "4", name: "Operations" },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={task ? "Edit Task" : "Assign New Task"}
      className="max-w-2xl"
    >
      {/* Improved form container with better padding and spacing */}
      <form onSubmit={handleSubmit} className="px-1 py-2 md:px-2">
        <div className="space-y-6">
          {/* Task Title - Improved label and input alignment */}
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
              onChange={(e) => setTaskTitle(e.target.value)}
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

          {/* Task Description - Improved spacing */}
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
              onChange={(e) => setTaskDescription(e.target.value)}
              placeholder="Short description of the task..."
              className="min-h-[100px] bg-gray-50 border-gray-300 rounded-md"
              rows={4}
            />
          </div>

          {/* Two-column layout for Users and Category on larger screens */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Select Users - Improved dropdown styling */}
            <div className="space-y-2">
              <label
                htmlFor="selectUsers"
                className="block text-sm font-medium text-gray-700"
              >
                Assign To <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <button
                  type="button"
                  id="selectUsers"
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className={`w-full flex justify-between items-center px-3 py-2 h-10 border rounded-md bg-white ${
                    errors.selectedUsers ? "border-red-500" : "border-gray-300"
                  }`}
                  aria-expanded={showUserDropdown}
                  aria-haspopup="listbox"
                >
                  <span className="text-gray-700 truncate">
                    {selectedUsers.length > 0
                      ? `${selectedUsers.length} user(s) selected`
                      : "Select Users"}
                  </span>
                  <span className="ml-1">▼</span>
                </button>
                {errors.selectedUsers && (
                  <p className="mt-1 text-sm text-red-500 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.selectedUsers}
                  </p>
                )}

                {showUserDropdown && (
                  <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-300 max-h-60 overflow-auto">
                    <ul role="listbox" className="py-1">
                      {mockUsers.map((user) => (
                        <li
                          key={user.id}
                          role="option"
                          aria-selected={selectedUsers.includes(user.id)}
                          className={`px-3 py-2 cursor-pointer flex items-center ${
                            selectedUsers.includes(user.id)
                              ? "bg-blue-50"
                              : "hover:bg-gray-100"
                          }`}
                          onClick={() => handleUserSelect(user.id)}
                        >
                          {/* Custom checkbox with improved alignment */}
                          <div className="mr-2 h-4 w-4 border rounded flex items-center justify-center bg-white">
                            {selectedUsers.includes(user.id) && (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-3 w-3 text-blue-500"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                          </div>
                          <img
                            src={user.avatar || "/placeholder.svg"}
                            alt={user.name}
                            className="w-6 h-6 rounded-full mr-2"
                          />
                          <span className="truncate">{user.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Select Category - Improved dropdown styling */}
            <div className="space-y-2">
              <label
                htmlFor="selectCategory"
                className="block text-sm font-medium text-gray-700"
              >
                Category
              </label>
              <div className="relative">
                <button
                  type="button"
                  id="selectCategory"
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  className="w-full flex justify-between items-center px-3 py-2 h-10 border border-gray-300 rounded-md bg-white"
                  aria-expanded={showCategoryDropdown}
                  aria-haspopup="listbox"
                >
                  <span className="text-gray-700 truncate">
                    {selectedCategory || "Select Category"}
                  </span>
                  <span className="ml-1">▼</span>
                </button>

                {showCategoryDropdown && (
                  <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-300 max-h-60 overflow-auto">
                    <ul role="listbox" className="py-1">
                      {mockCategories.map((category) => (
                        <li
                          key={category.id}
                          role="option"
                          aria-selected={selectedCategory === category.name}
                          className={`px-3 py-2 cursor-pointer ${
                            selectedCategory === category.name
                              ? "bg-blue-50"
                              : "hover:bg-gray-100"
                          }`}
                          onClick={() => handleCategorySelect(category.name)}
                        >
                          {category.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Keep in Loop - Improved dropdown styling */}
          <div className="space-y-2">
            <label
              htmlFor="keepInLoop"
              className="block text-sm font-medium text-gray-700"
            >
              Keep in Loop
            </label>
            <div className="relative">
              <button
                type="button"
                id="keepInLoop"
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
                    {mockUsers.map((user) => (
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
                        {/* Custom checkbox with improved alignment */}
                        <div className="mr-2 h-4 w-4 border rounded flex items-center justify-center bg-white">
                          {usersInLoop.includes(user.id) && (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-3 w-3 text-blue-500"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                        <img
                          src={user.avatar || "/placeholder.svg"}
                          alt={user.name}
                          className="w-6 h-6 rounded-full mr-2"
                        />
                        <span className="truncate">{user.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Priority - Improved card styling */}
          <div className="bg-gray-50 p-4 rounded-md shadow-sm border border-gray-100">
            <div className="flex items-center mb-3">
              <span className="mr-2 text-lg">🚩</span>
              <span className="font-medium">Priority</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                onClick={() => setSelectedPriority("high")}
                variant={selectedPriority === "high" ? "green" : "outline"}
                className={`flex items-center px-4 py-2 ${
                  selectedPriority === "high"
                    ? "bg-emerald-500 text-white"
                    : "bg-white"
                }`}
              >
                {selectedPriority === "high" && (
                  <Check className="h-4 w-4 mr-1" />
                )}
                High
              </Button>
              <Button
                type="button"
                onClick={() => setSelectedPriority("medium")}
                variant={selectedPriority === "medium" ? "green" : "outline"}
                className={`flex items-center px-4 py-2 ${
                  selectedPriority === "medium"
                    ? "bg-emerald-500 text-white"
                    : "bg-white"
                }`}
              >
                {selectedPriority === "medium" && (
                  <Check className="h-4 w-4 mr-1" />
                )}
                Medium
              </Button>
              <Button
                type="button"
                onClick={() => setSelectedPriority("low")}
                variant={selectedPriority === "low" ? "green" : "outline"}
                className={`flex items-center px-4 py-2 ${
                  selectedPriority === "low"
                    ? "bg-emerald-500 text-white"
                    : "bg-white"
                }`}
              >
                {selectedPriority === "low" && (
                  <Check className="h-4 w-4 mr-1" />
                )}
                Low
              </Button>
            </div>
          </div>

          {/* Repeat - Improved toggle styling */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md shadow-sm border border-gray-100">
            <div className="flex items-center">
              <span className="mr-2 text-lg">🔄</span>
              <span className="font-medium">Repeat</span>
            </div>
            <Switch
              checked={isRepeating}
              onCheckedChange={setIsRepeating}
              className="data-[state=checked]:bg-emerald-500"
            />
          </div>

          {/* Due Date - Improved date picker styling */}
          <div className="bg-gray-50 p-4 rounded-md shadow-sm border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center">
              <div className="flex items-center mb-2 sm:mb-0 sm:mr-4 sm:w-1/4">
                <span className="mr-2 text-lg">📅</span>
                <span className="font-medium">
                  Due Date <span className="text-red-500">*</span>
                </span>
              </div>
              <div className="flex-1">
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className={`h-10 border ${
                    errors.dueDate ? "border-red-500" : "border-gray-300"
                  } rounded-md bg-white px-3 py-2 w-full`}
                  aria-invalid={errors.dueDate ? "true" : "false"}
                  aria-describedby={
                    errors.dueDate ? "dueDate-error" : undefined
                  }
                />
                {errors.dueDate && (
                  <p
                    id="dueDate-error"
                    className="mt-1 text-sm text-red-500 flex items-center"
                  >
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.dueDate}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Attachment Options - Improved button layout */}
          <div className="flex flex-wrap gap-3 pt-2 justify-center sm:justify-start">
            <Button
              type="button"
              variant="outline"
              className="rounded-full p-2 h-10 w-10"
              size="icon"
            >
              <Link className="h-5 w-5" />
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-full p-2 h-10 w-10"
              size="icon"
            >
              <FileText className="h-5 w-5" />
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-full p-2 h-10 w-10"
              size="icon"
            >
              <ImageIcon className="h-5 w-5" />
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-full p-2 h-10 w-10"
              size="icon"
            >
              <Clock className="h-5 w-5" />
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-full p-2 h-10 w-10"
              size="icon"
            >
              <Mic className="h-5 w-5" />
            </Button>
          </div>

          {/* General Error Message - Improved error styling */}
          {errors.submit && (
            <div className="bg-red-50 p-4 rounded-md text-red-600 flex items-center border border-red-200">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <span>{errors.submit}</span>
            </div>
          )}

          {/* Form Footer - Improved layout with divider */}
          <div className="pt-4 mt-6 border-t border-gray-200">
            {/* Assign More Tasks Toggle - Improved alignment */}
            <div className="flex justify-end items-center gap-3 mb-4">
              <span className="text-sm font-medium">Assign More Tasks</span>
              <Switch
                checked={assignMoreTasks}
                onCheckedChange={setAssignMoreTasks}
                className="data-[state=checked]:bg-emerald-500"
              />
            </div>

            {/* Submit Button - Improved styling */}
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
                  {task ? "Updating..." : "Assigning..."}
                </>
              ) : (
                <>
                  <Check className="mr-2 h-5 w-5" />{" "}
                  {task ? "Update Task" : "Assign Task"}
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
