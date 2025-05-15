"use client";

import { useState } from "react";

// Mock data for task templates
const mockTemplates = [
  {
    id: 1,
    name: "New Employee Onboarding",
    description: "Tasks for onboarding new team members",
    tasks: [
      {
        id: 101,
        title: "Setup workstation",
        assignee: "IT Team",
        duration: "1 day",
      },
      {
        id: 102,
        title: "Complete paperwork",
        assignee: "HR",
        duration: "2 days",
      },
      {
        id: 103,
        title: "Team introduction",
        assignee: "Team Lead",
        duration: "1 day",
      },
    ],
  },
  {
    id: 2,
    name: "Monthly Reporting",
    description: "Tasks for monthly financial reporting",
    tasks: [
      {
        id: 201,
        title: "Collect department data",
        assignee: "Department Heads",
        duration: "3 days",
      },
      {
        id: 202,
        title: "Prepare financial statements",
        assignee: "Finance Team",
        duration: "2 days",
      },
      {
        id: 203,
        title: "Review and approval",
        assignee: "CFO",
        duration: "1 day",
      },
    ],
  },
  {
    id: 3,
    name: "Product Launch",
    description: "Tasks for launching a new product",
    tasks: [
      {
        id: 301,
        title: "Finalize marketing materials",
        assignee: "Marketing Team",
        duration: "5 days",
      },
      {
        id: 302,
        title: "Prepare sales documentation",
        assignee: "Sales Team",
        duration: "3 days",
      },
      {
        id: 303,
        title: "Customer communication",
        assignee: "Customer Success",
        duration: "2 days",
      },
    ],
  },
];

// Task Template Card Component
const TemplateCard = ({ template, onView }) => {
  return (
    <div className="bg-white p-5 rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <h3 className="font-semibold text-lg mb-2">{template.name}</h3>
      <p className="text-sm text-gray-600 mb-3">{template.description}</p>
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500">
          {template.tasks.length} tasks
        </span>
        <button
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          onClick={() => onView(template.id)}
        >
          View Details
        </button>
      </div>
    </div>
  );
};

// Template Details Modal Component
const TemplateDetailsModal = ({ template, onClose, onUse }) => {
  if (!template) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {template.name}
              </h2>
              <p className="text-gray-600">{template.description}</p>
            </div>
            <button
              className="text-gray-500 hover:text-gray-700"
              onClick={onClose}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Tasks</h3>
            <div className="bg-gray-50 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Task
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assignee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {template.tasks.map((task) => (
                    <tr key={task.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {task.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {task.assignee}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {task.duration}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              onClick={() => onUse(template.id)}
            >
              Use Template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Task Templates Component
const TaskTemplates = () => {
  const [templates] = useState(mockTemplates);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Filter templates based on search term
  const filteredTemplates = templates.filter(
    (template) =>
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // View template details
  const handleViewTemplate = (templateId) => {
    const template = templates.find((t) => t.id === templateId);
    setSelectedTemplate(template);
  };

  // Close template details modal
  const handleCloseModal = () => {
    setSelectedTemplate(null);
  };

  // Use template (placeholder function)
  const handleUseTemplate = (templateId) => {
    alert(`Template ${templateId} will be used to create tasks.`);
    setSelectedTemplate(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Task Templates</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
          Create Template
        </button>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search templates..."
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.length > 0 ? (
          filteredTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onView={handleViewTemplate}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-500">
              No templates found matching your search.
            </p>
          </div>
        )}
      </div>

      {selectedTemplate && (
        <TemplateDetailsModal
          template={selectedTemplate}
          onClose={handleCloseModal}
          onUse={handleUseTemplate}
        />
      )}
    </div>
  );
};

export default TaskTemplates;
