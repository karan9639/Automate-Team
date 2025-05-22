"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";

// Mock data for task directory
const mockTaskCategories = [
  {
    id: 1,
    name: "Marketing",
    description: "Tasks related to marketing campaigns and promotions",
    tasks: [
      { id: 101, title: "Create social media content", frequency: "Weekly" },
      { id: 102, title: "Analyze campaign performance", frequency: "Monthly" },
      { id: 103, title: "Update marketing materials", frequency: "Quarterly" },
    ],
  },
  {
    id: 2,
    name: "Development",
    description: "Software development and maintenance tasks",
    tasks: [
      { id: 201, title: "Code review", frequency: "Daily" },
      { id: 202, title: "Bug fixes", frequency: "Weekly" },
      { id: 203, title: "Feature implementation", frequency: "Bi-weekly" },
    ],
  },
  {
    id: 3,
    name: "HR",
    description: "Human resources and employee management tasks",
    tasks: [
      { id: 301, title: "Employee onboarding", frequency: "As needed" },
      { id: 302, title: "Performance reviews", frequency: "Quarterly" },
      { id: 303, title: "Team building activities", frequency: "Monthly" },
    ],
  },
];

// Add Category Modal Component
const AddCategoryModal = ({ isOpen, onClose, onAddCategory }) => {
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");

  const handleSubmit = () => {
    if (categoryName.trim() === "") return;

    onAddCategory({
      id: Date.now(),
      name: categoryName,
      description: categoryDescription,
      tasks: [],
    });

    setCategoryName("");
    setCategoryDescription("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Category</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <Input
              placeholder="Category Name"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className="border-emerald-500"
            />
          </div>

          <div>
            <Textarea
              placeholder="Category Description"
              value={categoryDescription}
              onChange={(e) => setCategoryDescription(e.target.value)}
              className="min-h-[100px] bg-gray-50"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleSubmit}
            className="w-full bg-emerald-500 hover:bg-emerald-600"
          >
            Add Category
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Add Task to Category Modal Component
const AddTaskModal = ({ isOpen, onClose, categoryId, onAddTask }) => {
  const [taskTitle, setTaskTitle] = useState("");
  const [taskFrequency, setTaskFrequency] = useState("");

  const handleSubmit = () => {
    if (taskTitle.trim() === "") return;

    onAddTask(categoryId, {
      id: Date.now(),
      title: taskTitle,
      frequency: taskFrequency,
    });

    setTaskTitle("");
    setTaskFrequency("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <Input
              placeholder="Task Title"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              className="border-emerald-500"
            />
          </div>

          <div>
            <Input
              placeholder="Frequency (e.g., Daily, Weekly)"
              value={taskFrequency}
              onChange={(e) => setTaskFrequency(e.target.value)}
              className="border-emerald-500"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleSubmit}
            className="w-full bg-emerald-500 hover:bg-emerald-600"
          >
            Add Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Task Directory Component
const TaskDirectory = () => {
  const [categories, setCategories] = useState(mockTaskCategories);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  // Filter categories based on search term
  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.tasks.some((task) =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  // Toggle category expansion
  const toggleCategory = (categoryId) => {
    if (expandedCategory === categoryId) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(categoryId);
    }
  };

  // Open add category modal
  const handleOpenAddCategoryModal = () => {
    setIsAddCategoryModalOpen(true);
  };

  // Close add category modal
  const handleCloseAddCategoryModal = () => {
    setIsAddCategoryModalOpen(false);
  };

  // Add new category
  const handleAddCategory = (newCategory) => {
    setCategories([...categories, newCategory]);
  };

  // Open add task modal
  const handleOpenAddTaskModal = (categoryId) => {
    setSelectedCategoryId(categoryId);
    setIsAddTaskModalOpen(true);
  };

  // Close add task modal
  const handleCloseAddTaskModal = () => {
    setIsAddTaskModalOpen(false);
    setSelectedCategoryId(null);
  };

  // Add new task to category
  const handleAddTask = (categoryId, newTask) => {
    setCategories(
      categories.map((category) => {
        if (category.id === categoryId) {
          return {
            ...category,
            tasks: [...category.tasks, newTask],
          };
        }
        return category;
      })
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Task Directory</h1>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          onClick={handleOpenAddCategoryModal}
        >
          Add Category
        </button>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search tasks or categories..."
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        {filteredCategories.length > 0 ? (
          filteredCategories.map((category) => (
            <div
              key={category.id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div
                className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => toggleCategory(category.id)}
              >
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    {category.name}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {category.description}
                  </p>
                </div>
                <svg
                  className={`w-5 h-5 text-gray-500 transform transition-transform ${
                    expandedCategory === category.id ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </div>

              {expandedCategory === category.id && (
                <div className="border-t border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Task
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Frequency
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {category.tasks.map((task) => (
                        <tr key={task.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {task.title}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {task.frequency}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button className="text-blue-600 hover:text-blue-900 mr-3">
                              Edit
                            </button>
                            <button className="text-red-600 hover:text-red-900">
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="p-4 bg-gray-50 border-t border-gray-200">
                    <button
                      className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                      onClick={() => handleOpenAddTaskModal(category.id)}
                    >
                      + Add Task to {category.name}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">
              No categories or tasks found matching your search.
            </p>
          </div>
        )}
      </div>

      {/* Add Category Modal */}
      <AddCategoryModal
        isOpen={isAddCategoryModalOpen}
        onClose={handleCloseAddCategoryModal}
        onAddCategory={handleAddCategory}
      />

      {/* Add Task Modal */}
      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={handleCloseAddTaskModal}
        categoryId={selectedCategoryId}
        onAddTask={handleAddTask}
      />
    </div>
  );
};

export default TaskDirectory;
