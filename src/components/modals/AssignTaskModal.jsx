"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useDispatch } from "react-redux";
import { Modal } from "../../components/ui/modal.jsx"; // Added .jsx
import { Button } from "../../components/ui/button.jsx"; // Added .jsx
import { Input } from "../../components/ui/input.jsx"; // Added .jsx
import { Textarea } from "../../components/ui/textarea.jsx"; // Added .jsx
import { Switch } from "../../components/ui/switch.jsx"; // Added .jsx
import { createTask, editTask } from "../../store/slices/taskSlice";
import { userApi } from "../../apiService/apiService";
import { Check, FileText, AlertCircle, Loader2, X, Search } from "lucide-react";

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

  if (!formData.taskAssignedTo || !formData.taskAssignedTo.trim()) {
    errors.taskAssignedTo = "A user must be assigned";
  }

  if (!formData.taskCategory || !formData.taskCategory.trim()) {
    errors.taskCategory = "Task category is required";
  }

  if (formData.taskDueDate) {
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
  const fileInputRef = useRef(null);
  const userSearchInputRef = useRef(null);

  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskAssignedTo, setTaskAssignedTo] = useState("");
  const [taskCategory, setTaskCategory] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskPriority, setTaskPriority] = useState(
    backendTaskSchema.taskPriority.default
  );
  const [taskFrequencyType, setTaskFrequencyType] = useState("one-time");
  const [taskImage, setTaskImage] = useState(null);


  const [assignMoreTasks, setAssignMoreTasks] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [allUsers, setAllUsers] = useState([]);
  const [isFetchingUsers, setIsFetchingUsers] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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
  
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (allUsers.length === 0 && !isFetchingUsers) {
        fetchUsersForDropdown();
      }
      if (task) {
        setTaskTitle(task.taskTitle || "");
        setTaskDescription(task.taskDescription || "");
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
        setTaskImage(task.taskImage || null);
      } else {
        resetFormFields();
      }
      setErrors({});
      setUserSearchTerm("");
    }
  }, [isOpen, task]);

  useEffect(() => {
    if (showUserDropdown && userSearchInputRef.current) {
      setTimeout(() => {
        userSearchInputRef.current.focus();
      }, 100);
    }
  }, [showUserDropdown]);

  const resetFormFields = (keepDueDate = false) => {
    setTaskTitle("");
    setTaskDescription("");
    setTaskAssignedTo("");
    setTaskCategory("");
    setTaskImage(null);
    if (!keepDueDate) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setTaskDueDate(tomorrow.toISOString().split("T")[0]);
    }
    setTaskPriority(backendTaskSchema.taskPriority.default);
    setTaskFrequencyType("one-time");
    setErrors({});
    setUserSearchTerm("");
  };

  const fetchUsersForDropdown = async () => {
    setIsFetchingUsers(true);
    try {
      const response = await userApi.fetchAllTeamMembers();
      const fetchedUsers =
        response.data?.data?.map((item) => item.newMember) || [];
      setAllUsers(
        fetchedUsers.map((u) => ({
          id: u._id,
          name: u.fullname,
          email: u.email, // Assuming 'email' is available in the fetched user object
          avatar:
            u.avatarUrl ||
            `/placeholder.svg?height=32&width=32&query=${encodeURIComponent(
              u.fullname
            )}`,
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

  const handleFileSelect = (event) => {
    const file = event.target.files[0]; // only take the first file
    if (file) {
      const newFile = {
        id: Date.now() + Math.random(),
        name: file.name,
        size: file.size,
        type: file.type,
        file: file,
      };
      setTaskImage(newFile); // set a single file object
      toast.success(`1 file attached successfully`);
    }
    event.target.value = ""; // reset input
  };
  

  const handleFileRemove = () => {
    setTaskImage(null);
    toast.success("File removed successfully");
  };
  

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split(".").pop()?.toLowerCase();
    // ... (rest of getFileIcon function remains the same)
    switch (extension) {
      case "pdf":
        return "📄";
      case "doc":
      case "docx":
        return "📝";
      case "xls":
      case "xlsx":
        return "📊";
      case "ppt":
      case "pptx":
        return "📋";
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return "🖼️";
      case "zip":
      case "rar":
        return "🗜️";
      default:
        return "📎";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      taskTitle: taskTitle.trim(),
      taskDescription: taskDescription.trim(),
      taskAssignedTo,
      taskCategory: taskCategory.trim(),
      taskDueDate: taskDueDate
        ? new Date(taskDueDate).toISOString()
        : undefined,
      taskPriority,
      taskFrequency: { type: taskFrequencyType },
    };

    const validationErrors = validateTaskForm(payload, backendTaskSchema);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Please fix the validation errors.");
      return;
    }

    const file = taskImage?.file; // direct access, no array indexing
    if (file) {
      if (!(file instanceof File)) {
        toast.error("Invalid image file.");
        return;
      }
      if (file.size > 1024 * 1024) {
        toast.error("Image must be less than 1MB.");
        return;
      }
    }
    

    setIsSubmitting(true);
    setErrors({});
    try {
      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(
            key,
            typeof value === "object" ? JSON.stringify(value) : value
          );
        }
      });

      if (file) {
        formData.append("taskImage", file);
      }

      // ✅ Now sending multipart/form-data correctly
      if (task && task._id) {
        await dispatch(
          editTask({ taskId: task._id, taskData: formData })
        ).unwrap();
      } else {
        await dispatch(createTask(formData)).unwrap();
      }

      setRefreshTrigger(Date.now());
      toast.success(
        task ? "Task updated successfully!" : "Task created successfully!"
      );
      if (!assignMoreTasks) {
        onClose();
      } else {
        resetFormFields(true);
      }
    } catch (error) {
      console.error("Error saving task:", error);
      const errorMessage =
        typeof error === "string"
          ? error
          : error?.response?.data?.message ||
            error.message ||
            "Unexpected error during task submission";
      setErrors({ submit: errorMessage });
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
  

  const handleUserSelect = (userId) => {
    setTaskAssignedTo(userId);
    setShowUserDropdown(false);
    setUserSearchTerm("");
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

  const filteredUsers = useMemo(() => {
    if (!userSearchTerm.trim()) {
      return allUsers;
    }
    return allUsers.filter((user) =>
      user.name.toLowerCase().includes(userSearchTerm.toLowerCase())
    );
  }, [allUsers, userSearchTerm]);

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
                    if (allUsers.length === 0 && !isFetchingUsers)
                      fetchUsersForDropdown();
                    setShowUserDropdown(!showUserDropdown);
                  }}
                  className={`w-full flex justify-between items-center px-3 py-2 h-10 border rounded-md bg-white text-sm ${
                    errors.taskAssignedTo ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <span className="text-gray-700 truncate">
                    {selectedUserName}
                  </span>
                  {isFetchingUsers ? (
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                  ) : (
                    <span
                      className={`ml-1 transition-transform duration-200 ${
                        showUserDropdown ? "rotate-180" : ""
                      }`}
                    >
                      ▼
                    </span>
                  )}
                </button>
                {errors.taskAssignedTo && (
                  <p className="mt-1 text-sm text-red-500 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />{" "}
                    {errors.taskAssignedTo}
                  </p>
                )}
                {showUserDropdown && (
                  <div className="absolute z-20 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-300 flex flex-col max-h-72">
                    <div className="p-2 border-b border-gray-200 flex-shrink-0">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <Input
                          ref={userSearchInputRef}
                          type="text"
                          placeholder="Search users..."
                          value={userSearchTerm}
                          onChange={(e) => setUserSearchTerm(e.target.value)}
                          className="h-9 text-sm w-full pl-9"
                        />
                      </div>
                    </div>
                    <ul
                      role="listbox"
                      className="py-1 overflow-y-auto flex-grow"
                    >
                      {isFetchingUsers ? (
                        <li className="px-3 py-2 text-gray-500 text-sm text-center flex items-center justify-center">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />{" "}
                          Loading users...
                        </li>
                      ) : filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                          <li
                            key={user.id}
                            role="option"
                            aria-selected={taskAssignedTo === user.id}
                            className={`px-3 py-2 cursor-pointer flex items-center text-sm ${
                              taskAssignedTo === user.id
                                ? "bg-blue-100 font-semibold text-blue-700"
                                : "hover:bg-gray-100"
                            }`}
                            onClick={() => handleUserSelect(user.id)}
                          >
                            {taskAssignedTo === user.id && (
                              <Check className="h-4 w-4 mr-2 text-blue-600 flex-shrink-0" />
                            )}
                            <img
                              src={user.avatar || "/placeholder.svg"}
                              alt={user.name}
                              className="w-6 h-6 rounded-full mr-2 flex-shrink-0 object-cover"
                              onError={(e) =>
                                (e.target.src = `/placeholder.svg?height=24&width=24&query=${encodeURIComponent(
                                  user.name
                                )}`)
                              }
                            />
                            <div className="flex-1 min-w-0">
                              <span className="block truncate font-medium">
                                {user.name}
                              </span>
                              {user.email && (
                                <span className="block truncate text-xs text-gray-500">
                                  {user.email}
                                </span>
                              )}
                            </div>
                          </li>
                        ))
                      ) : (
                        <li className="px-3 py-2 text-gray-500 text-sm text-center">
                          {allUsers.length === 0
                            ? "No users available."
                            : "No users match your search."}
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
                  className={`w-full flex justify-between items-center px-3 py-2 h-10 border rounded-md bg-white text-sm ${
                    errors.taskCategory ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <span className="text-gray-700 truncate">
                    {taskCategory || "Select Category"}
                  </span>
                  <span
                    className={`ml-1 transition-transform duration-200 ${
                      showCategoryDropdown ? "rotate-180" : ""
                    }`}
                  >
                    ▼
                  </span>
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
                          className={`px-3 py-2 cursor-pointer text-sm ${
                            taskCategory === category.name
                              ? "bg-blue-50 font-semibold"
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

          {/* Priority, Frequency, Due Date, Attachments, Submit sections remain the same */}
          {/* ... (rest of the form) ... */}
          {/* Priority */}
          <div className="bg-gray-50 p-4 rounded-md shadow-sm border border-gray-100">
            <div className="flex items-center mb-3">
              <span className="mr-2 text-lg">🚩</span>
              <span className="font-medium text-gray-700">
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
                  variant={taskPriority === priorityValue ? "solid" : "outline"}
                  className={`flex items-center px-4 py-2 text-sm rounded-md ${
                    taskPriority === priorityValue
                      ? "bg-emerald-500 text-white hover:bg-emerald-600"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {taskPriority === priorityValue && (
                    <Check className="h-4 w-4 mr-1.5" />
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
              <span className="font-medium text-gray-700">
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
                    taskFrequencyType === freq.value ? "solid" : "outline"
                  }
                  className={`flex items-center px-3 py-2 text-sm rounded-md ${
                    taskFrequencyType === freq.value
                      ? "bg-emerald-500 text-white hover:bg-emerald-600"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {taskFrequencyType === freq.value && (
                    <Check className="h-3 w-3 mr-1.5" />
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
                <span className="font-medium text-gray-700">Due Date</span>
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
                  } rounded-md bg-white px-3 py-2 w-full text-sm`}
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

          <div className="space-y-4">
            {/* Upload button (always visible) */}
            <div className="flex flex-wrap gap-3 pt-2 justify-center sm:justify-start">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                accept="image/*"
              />
              <Button
                type="button"
                variant="outline"
                className="rounded-full p-2 h-10 w-10 border-gray-300 hover:bg-gray-50"
                size="icon"
                title="Attach image"
                onClick={() => fileInputRef.current?.click()}
              >
                <FileText className="h-5 w-5 text-gray-600" />
              </Button>
              <p>
              Supported formats: Only Images (Max 1MB)
              </p>
            </div>

            {/* Show attached file if any */}
            {taskImage && (
              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-medium text-gray-700">
                  Replace File
                </h4>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md border border-gray-200">
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <span className="text-lg flex-shrink-0">
                      {getFileIcon(taskImage.name)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {taskImage.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(taskImage.size)}
                      </p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="p-1 h-6 w-6 text-gray-700 hover:text-red-600 hover:bg-red-100 dark:text-gray-300 dark:hover:text-red-400 dark:hover:bg-red-800/10"
                    onClick={() => {
                      setTaskImage(null);
                      toast.success("File removed successfully");
                    }}
                    title="Remove file"
                  >
                    ❌
                  </Button>
                </div>
              </div>
            )}
          </div>

          {errors.submit && (
            <div className="bg-red-50 p-4 rounded-md text-red-600 flex items-center border border-red-200">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <span>{errors.submit}</span>
            </div>
          )}

          <div className="pt-4 mt-6 border-t border-gray-200">
            <div className="flex justify-end items-center gap-3 mb-4">
              <span className="text-sm font-medium text-gray-700">
                Assign More Tasks
              </span>
              <Switch
                checked={assignMoreTasks}
                onCheckedChange={setAssignMoreTasks}
                className="data-[state=checked]:bg-emerald-500"
              />
            </div>
            <Button
              type="submit"
              variant="solid"
              className="w-full h-11 text-base font-medium bg-emerald-500 hover:bg-emerald-600 text-white rounded-md"
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
