"use client";

import { useState } from "react";
import { PlusIcon, SearchIcon, XIcon } from "lucide-react";

const ChecklistItem = ({ item, onToggle }) => {
  return (
    <div className="flex items-center p-3 border-b border-gray-200 hover:bg-gray-50 transition-colors">
      <input
        type="checkbox"
        checked={item.completed}
        onChange={() => onToggle(item.id)}
        className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
      />
      <div className="ml-3 flex-1">
        <p
          className={`text-sm font-medium ${
            item.completed ? "line-through text-gray-400" : "text-gray-700"
          }`}
        >
          {item.title}
        </p>
        {item.description && (
          <p
            className={`text-xs mt-1 ${
              item.completed ? "text-gray-400" : "text-gray-500"
            }`}
          >
            {item.description}
          </p>
        )}
      </div>
      <span
        className={`text-xs px-2 py-1 rounded-full ${
          item.priority === "high"
            ? "bg-red-100 text-red-800"
            : item.priority === "medium"
            ? "bg-yellow-100 text-yellow-800"
            : "bg-green-100 text-green-800"
        }`}
      >
        {item.priority}
      </span>
    </div>
  );
};

const Checklist = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");

  // Sample checklist data
  const [items, setItems] = useState([
    {
      id: 1,
      title: "Review project requirements",
      description: "Go through all project requirements and make notes",
      completed: true,
      priority: "high",
      category: "work",
    },
    {
      id: 2,
      title: "Set up development environment",
      description: "Install all necessary tools and dependencies",
      completed: false,
      priority: "high",
      category: "work",
    },
    {
      id: 3,
      title: "Create project structure",
      description: "Set up folders and initial files",
      completed: false,
      priority: "medium",
      category: "work",
    },
    {
      id: 4,
      title: "Implement authentication",
      description: "Add login and registration functionality",
      completed: false,
      priority: "high",
      category: "work",
    },
    {
      id: 5,
      title: "Design database schema",
      description: "Create tables and relationships",
      completed: false,
      priority: "medium",
      category: "work",
    },
    {
      id: 6,
      title: "Buy groceries",
      description: "Milk, eggs, bread, vegetables",
      completed: false,
      priority: "low",
      category: "personal",
    },
  ]);

  const toggleItem = (id) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const filteredItems = items.filter((item) => {
    // Filter by search term
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description &&
        item.description.toLowerCase().includes(searchTerm.toLowerCase()));

    // Filter by completion status
    const matchesFilter =
      filter === "all" ||
      (filter === "completed" && item.completed) ||
      (filter === "active" && !item.completed);

    return matchesSearch && matchesFilter;
  });

  const completedCount = items.filter((item) => item.completed).length;
  const progress = (completedCount / items.length) * 100;

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">
              Checklist
            </h1>
            <div className="flex space-x-2">
              <div className="relative flex-1 min-w-0">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setSearchTerm("")}
                  >
                    <XIcon className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                  </button>
                )}
              </div>
              <select
                className="block w-32 py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                <span className="hidden sm:inline">Add Task</span>
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-gray-700">
                Progress
              </span>
              <span className="text-sm font-medium text-gray-700">
                {completedCount} of {items.length} tasks completed
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Checklist items */}
        <div className="divide-y divide-gray-200">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <ChecklistItem key={item.id} item={item} onToggle={toggleItem} />
            ))
          ) : (
            <div className="p-6 text-center">
              <p className="text-gray-500">
                No tasks found. {searchTerm && "Try a different search term."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Checklist;
