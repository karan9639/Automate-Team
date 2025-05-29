"use client";

import { useState, useEffect, useMemo } from "react";
import { useDispatch } from "react-redux";
import { Modal } from "../../components/ui/modal";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Switch } from "../../components/ui/switch";
import { addTaskLocal } from "../../store/slices/taskSlice";
import { taskApi, userApi } from "../../apiService/apiService";
import {
  Check,
  Link,
  FileText,
  ImageIcon,
  Clock,
  Mic,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { generateId } from "../../utils/helpers";
import { toast } from "react-hot-toast";

const validateTaskForm = (formData, backendSchema) => {
  const errors = {};

  if (!formData.taskTitle || !formData.taskTitle.trim()) {
    errors.taskTitle = "Task title is required";
  } else if (formData.taskTitle.trim().length < 3) {
    errors.taskTitle = "Task title must be at least 3 characters long";
  } else if (formData.taskTitle.trim().length > 100) {
    errors.taskTitle = "Task title must not exceed 100 characters";
  }

  if (!formData.taskDescription || !formData.taskDescription.trim()) {
    errors.taskDescription = "Task description is required";
  } else if (formData.taskDescription.trim().length < 10) {
    errors.taskDescription = "Description must be at least 10 characters long";
  } else if (formData.taskDescription.trim().length > 500) {
    errors.taskDescription = "Description must not exceed 500 characters";
  }

  // taskAssignedTo is now a single ID string
  if (!formData.taskAssignedTo || !formData.taskAssignedTo.trim()) {
    errors.taskAssignedTo = "A user must be assigned"; // Updated message
  }

  if (!formData.taskCategory || !formData.taskCategory.trim()) {
    errors.taskCategory = "Task category is required";
  }

  if (!formData.taskDueDate) {
    // Due date is optional in backend schema (has default: Date.now)
  } else {
    const selectedDate = new Date(formData.taskDueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      errors.taskDueDate = "Due date cannot be in the past";
    }
  }

  const validPriorities = backendSchema.taskPriority.enum;
  if (
    !formData.taskPriority ||
    !validPriorities.includes(formData.taskPriority)
  ) {
    errors.taskPriority = `Please select a valid priority (${validPriorities.join(
      ", "
    )})`;
  }

  const validFrequenciesUI = [
    "one-time",
    "daily",
    "weekly",
    "monthly",
    "yearly",
  ];
  if (
    !formData.taskFrequency ||
    !validFrequenciesUI.includes(formData.taskFrequency.type)
  ) {
    errors.taskFrequency = "Please select a valid frequency type";
  }

  return errors;
};

const backendTaskSchema = {
  taskPriority: { enum: ["High", "Medium", "Low"], default: "Low" },
  taskFrequency: {
    type: { enum: ["daily", "weekly", "monthly", "yearly", "periodically"] },
  },
};

const AssignTaskModal = ({ isOpen, onClose, task = null }) => {
  const dispatch = useDispatch();

  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskAssignedTo, setTaskAssignedTo] = useState(""); // Stores a single user ID
  const [taskCategory, setTaskCategory] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskPriority, setTaskPriority] = useState(
    backendTaskSchema.taskPriority.default
  );
  const [taskFrequencyType, setTaskFrequencyType] = useState("one-time");

  const [assignMoreTasks, setAssignMoreTasks] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [allUsers, setAllUsers] = useState([]);
  const [isFetchingUsers, setIsFetchingUsers] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const mockCategories = useMemo(
    () => [
      { id: "cat1", name: "Development" },
      { id: "cat2", name: "Design" },
      { id: "cat3", name: "Marketing" },
      { id: "cat4", name: "Operations" },
    ],
    []
  );
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchUsersForDropdown();
      if (task) {
        setTaskTitle(task.taskTitle || "");
        setTaskDescription(task.taskDescription || "");
        // task.taskAssignedTo should be a single ID string from backend
        setTaskAssignedTo(
          typeof task.taskAssignedTo === "string"
            ? task.taskAssignedTo
            : task.taskAssignedTo?._id || ""
        );
        setTaskCategory(task.taskCategory || "");
        setTaskDueDate(
          task.taskDueDate
            ? new Date(task.taskDueDate).toISOString().split("T")[0]
            : ""
        );
        setTaskPriority(
          task.taskPriority || backendTaskSchema.taskPriority.default
        );
        setTaskFrequencyType(task.taskFrequency?.type || "one-time");
      } else {
        resetFormFields();
      }
      setErrors({});
    }
  }, [isOpen, task]);

  const resetFormFields = (keepDueDate = false) => {
    setTaskTitle("");
    setTaskDescription("");
    setTaskAssignedTo(""); // Reset to empty string
    setTaskCategory("");
    if (!keepDueDate) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setTaskDueDate(tomorrow.toISOString().split("T")[0]);
    }
    setTaskPriority(backendTaskSchema.taskPriority.default);
    setTaskFrequencyType("one-time");
    setErrors({});
  };

  const fetchUsersForDropdown = async () => {
    if (allUsers.length > 0 && !isFetchingUsers) return;
    setIsFetchingUsers(true);
    try {
      const response = await userApi.fetchAllTeamMembers();
      const fetchedUsers =
        response.data?.data?.map((item) => item.newMember) || [];
      setAllUsers(
        fetchedUsers.map((u) => ({
          id: u._id, // Ensure this is the MongoDB ObjectId string
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      taskTitle: taskTitle.trim(),
      taskDescription: taskDescription.trim(),
      taskAssignedTo: taskAssignedTo, // Now a single ID string
      taskCategory: taskCategory.trim(),
      taskDueDate: taskDueDate
        ? new Date(taskDueDate).toISOString()
        : undefined,
      taskPriority: taskPriority,
      taskFrequency: { type: taskFrequencyType },
    };

    const validationErrors = validateTaskForm(payload, backendTaskSchema);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Please fix the validation errors.");
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      let response;
      if (task && task._id) {
        // response = await taskApi.editTask(task._id, payload);
        // dispatch(updateTaskLocal(response.data.data));
        toast.success("Task editing not implemented yet.");
        if (!assignMoreTasks) onClose();
        else resetFormFields(true);
      } else {
        response = await taskApi.createTask(payload);
        dispatch(
          addTaskLocal(
            response.data.data || {
              ...payload,
              _id: generateId(),
              createdAt: new Date().toISOString(),
            }
          )
        );
        toast.success(response.data.message || "Task created successfully!");
        if (!assignMoreTasks) onClose();
        else resetFormFields(true);
      }
    } catch (error) {
      console.error("Error saving task:", error);
      const apiErrorMessage = error.response?.data?.message || error.message;
      const errorMessage = apiErrorMessage || "Failed to save task.";
      setErrors({ submit: errorMessage });
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUserSelect = (userId) => {
    setTaskAssignedTo(userId); // Set the single selected user ID
    setShowUserDropdown(false); // Close dropdown after selection
    if (errors.taskAssignedTo)
      setErrors((prev) => ({ ...prev, taskAssignedTo: "" }));
  };

  const handleCategorySelect = (categoryName) => {
    setTaskCategory(categoryName);
    setShowCategoryDropdown(false);
    if (errors.taskCategory)
      setErrors((prev) => ({ ...prev, taskCategory: "" }));
  };

  const handleInputChange = (field, value) => {
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
    if (field === "taskTitle") setTaskTitle(value);
    if (field === "taskDescription") setTaskDescription(value);
    if (field === "taskDueDate") setTaskDueDate(value);
  };

  const priorityOptions = backendTaskSchema.taskPriority.enum;
  const frequencyOptionsUI = useMemo(
    () => [
      { value: "one-time", label: "One-time" },
      { value: "daily", label: "Daily" },
      { value: "weekly", label: "Weekly" },
      { value: "monthly", label: "Monthly" },
      { value: "yearly", label: "Yearly" },
    ],
    []
  );

  const selectedUserName = useMemo(() => {
    if (!taskAssignedTo) return "Select User";
    const user = allUsers.find((u) => u.id === taskAssignedTo);
    return user ? user.name : "Select User";
  }, [taskAssignedTo, allUsers]);

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
              className={`h-10 ${
                errors.taskTitle ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.taskTitle && (
              <p className="mt-1 text-sm text-red-500 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" /> {errors.taskTitle}
              </p>
            )}
          </div>

          {/* Task Description */}
          <div className="space-y-2">
            <label
              htmlFor="taskDescription"
              className="block text-sm font-medium text-gray-700"
            >
              Task Description <span className="text-red-500">*</span>
            </label>
            <Textarea
              id="taskDescription"
              value={taskDescription}
              onChange={(e) =>
                handleInputChange("taskDescription", e.target.value)
              }
              placeholder="Short description of the task..."
              className={`min-h-[100px] ${
                errors.taskDescription ? "border-red-500" : "border-gray-300"
              }`}
              rows={4}
            />
            {errors.taskDescription && (
              <p className="mt-1 text-sm text-red-500 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />{" "}
                {errors.taskDescription}
              </p>
            )}
          </div>

          {/* Two-column layout for Users and Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Assign To (Single Select) */}
            <div className="space-y-2">
              <label
                htmlFor="taskAssignedToButton"
                className="block text-sm font-medium text-gray-700"
              >
                Assign To <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <button
                  type="button"
                  id="taskAssignedToButton"
                  onClick={() => {
                    if (allUsers.length === 0) fetchUsersForDropdown();
                    setShowUserDropdown(!showUserDropdown);
                  }}
                  className={`w-full flex justify-between items-center px-3 py-2 h-10 border rounded-md bg-white ${
                    errors.taskAssignedTo ? "border-red-500" : "border-gray-300"
                  }`}
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
                {errors.taskAssignedTo && (
                  <p className="mt-1 text-sm text-red-500 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />{" "}
                    {errors.taskAssignedTo}
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
                            aria-selected={taskAssignedTo === user.id}
                            className={`px-3 py-2 cursor-pointer flex items-center ${
                              taskAssignedTo === user.id
                                ? "bg-blue-100 font-semibold"
                                : "hover:bg-gray-100"
                            }`}
                            onClick={() => handleUserSelect(user.id)}
                          >
                            {/* Optional: Add a checkmark or other indicator for selected user */}
                            {taskAssignedTo === user.id && (
                              <Check className="h-4 w-4 mr-2 text-blue-600" />
                            )}
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
                          No users available or failed to load.
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
                htmlFor="taskCategoryButton"
                className="block text-sm font-medium text-gray-700"
              >
                Category <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <button
                  type="button"
                  id="taskCategoryButton"
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  className={`w-full flex justify-between items-center px-3 py-2 h-10 border rounded-md bg-white ${
                    errors.taskCategory ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <span className="text-gray-700 truncate">
                    {taskCategory || "Select Category"}
                  </span>
                  <span className="ml-1">▼</span>
                </button>
                {errors.taskCategory && (
                  <p className="mt-1 text-sm text-red-500 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />{" "}
                    {errors.taskCategory}
                  </p>
                )}
                {showCategoryDropdown && (
                  <div className="absolute z-20 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-300 max-h-60 overflow-auto">
                    <ul role="listbox" className="py-1">
                      {mockCategories.map((category) => (
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
                      ))}
                    </ul>
                  </div>
                )}
              </div>
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
              {priorityOptions.map((priorityValue) => (
                <Button
                  key={priorityValue}
                  type="button"
                  onClick={() => {
                    setTaskPriority(priorityValue);
                    if (errors.taskPriority)
                      setErrors((prev) => ({ ...prev, taskPriority: "" }));
                  }}
                  variant={taskPriority === priorityValue ? "green" : "outline"}
                  className={`flex items-center px-4 py-2 ${
                    taskPriority === priorityValue
                      ? "bg-emerald-500 text-white"
                      : "bg-white"
                  }`}
                >
                  {taskPriority === priorityValue && (
                    <Check className="h-4 w-4 mr-1" />
                  )}
                  {priorityValue}
                </Button>
              ))}
            </div>
            {errors.taskPriority && (
              <p className="mt-2 text-sm text-red-500 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" /> {errors.taskPriority}
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
              {frequencyOptionsUI.map((freq) => (
                <Button
                  key={freq.value}
                  type="button"
                  onClick={() => {
                    setTaskFrequencyType(freq.value);
                    if (errors.taskFrequency)
                      setErrors((prev) => ({ ...prev, taskFrequency: "" }));
                  }}
                  variant={
                    taskFrequencyType === freq.value ? "green" : "outline"
                  }
                  className={`flex items-center px-3 py-2 text-sm ${
                    taskFrequencyType === freq.value
                      ? "bg-emerald-500 text-white"
                      : "bg-white"
                  }`}
                >
                  {taskFrequencyType === freq.value && (
                    <Check className="h-3 w-3 mr-1" />
                  )}
                  {freq.label}
                </Button>
              ))}
            </div>
            {errors.taskFrequency && (
              <p className="mt-2 text-sm text-red-500 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" /> {errors.taskFrequency}
              </p>
            )}
          </div>

          {/* Due Date */}
          <div className="bg-gray-50 p-4 rounded-md shadow-sm border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center">
              <div className="flex items-center mb-2 sm:mb-0 sm:mr-4">
                <span className="mr-2 text-lg">📅</span>
                <span className="font-medium">Due Date</span>
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
                />
                {errors.taskDueDate && (
                  <p className="mt-1 text-sm text-red-500 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />{" "}
                    {errors.taskDueDate}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Attachment Options (UI only) */}
          <div className="flex flex-wrap gap-3 pt-2 justify-center sm:justify-start">
            {[
              { icon: Link, title: "Add link" },
              { icon: FileText, title: "Attach file" },
              { icon: ImageIcon, title: "Attach image" },
              { icon: Clock, title: "Set reminder" },
              { icon: Mic, title: "Record audio" },
            ].map((item, index) => (
              <Button
                key={index}
                type="button"
                variant="outline"
                className="rounded-full p-2 h-10 w-10"
                size="icon"
                title={item.title}
              >
                <item.icon className="h-5 w-5" />
              </Button>
            ))}
          </div>

          {errors.submit && (
            <div className="bg-red-50 p-4 rounded-md text-red-600 flex items-center border border-red-200">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <span>{errors.submit}</span>
            </div>
          )}

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
                  <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
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
