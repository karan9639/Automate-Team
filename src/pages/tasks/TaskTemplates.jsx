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

// Create Template Modal Component
const CreateTemplateModal = ({ isOpen, onClose, onCreateTemplate }) => {
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [tasks, setTasks] = useState([
    { id: Date.now(), title: "", assignee: "", duration: "" },
  ]);

  const handleAddTask = () => {
    setTasks([
      ...tasks,
      { id: Date.now(), title: "", assignee: "", duration: "" },
    ]);
  };

  const handleTaskChange = (id, field, value) => {
    setTasks(
      tasks.map((task) => {
        if (task.id === id) {
          return { ...task, [field]: value };
        }
        return task;
      })
    );
  };

  const handleRemoveTask = (id) => {
    if (tasks.length > 1) {
      setTasks(tasks.filter((task) => task.id !== id));
    }
  };

  const handleSubmit = () => {
    if (templateName.trim() === "") return;

    onCreateTemplate({
      id: Date.now(),
      name: templateName,
      description: templateDescription,
      tasks: tasks.filter((task) => task.title.trim() !== ""),
    });

    // Reset form
    setTemplateName("");
    setTemplateDescription("");
    setTasks([{ id: Date.now(), title: "", assignee: "", duration: "" }]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Template</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <Input
              placeholder="Template Name"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="border-emerald-500"
            />
          </div>

          <div>
            <Textarea
              placeholder="Template Description"
              value={templateDescription}
              onChange={(e) => setTemplateDescription(e.target.value)}
              className="min-h-[80px] bg-gray-50"
            />
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">Tasks</h3>
            {tasks.map((task, index) => (
              <div key={task.id} className="grid grid-cols-3 gap-2">
                <Input
                  placeholder="Task Title"
                  value={task.title}
                  onChange={(e) =>
                    handleTaskChange(task.id, "title", e.target.value)
                  }
                />
                <Input
                  placeholder="Assignee"
                  value={task.assignee}
                  onChange={(e) =>
                    handleTaskChange(task.id, "assignee", e.target.value)
                  }
                />
                <div className="flex gap-2">
                  <Input
                    placeholder="Duration"
                    value={task.duration}
                    onChange={(e) =>
                      handleTaskChange(task.id, "duration", e.target.value)
                    }
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handleRemoveTask(task.id)}
                    disabled={tasks.length === 1}
                    className="flex-shrink-0"
                  >
                    X
                  </Button>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={handleAddTask}
              className="w-full border-dashed"
            >
              + Add Task
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleSubmit}
            className="w-full bg-emerald-500 hover:bg-emerald-600"
          >
            Create Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

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
  const [templates, setTemplates] = useState(mockTemplates);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isCreateTemplateModalOpen, setIsCreateTemplateModalOpen] =
    useState(false);

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

  // Open create template modal
  const handleOpenCreateTemplateModal = () => {
    setIsCreateTemplateModalOpen(true);
  };

  // Close create template modal
  const handleCloseCreateTemplateModal = () => {
    setIsCreateTemplateModalOpen(false);
  };

  // Create new template
  const handleCreateTemplate = (newTemplate) => {
    setTemplates([...templates, newTemplate]);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Task Templates</h1>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          onClick={handleOpenCreateTemplateModal}
        >
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

      {/* Create Template Modal */}
      <CreateTemplateModal
        isOpen={isCreateTemplateModalOpen}
        onClose={handleCloseCreateTemplateModal}
        onCreateTemplate={handleCreateTemplate}
      />
    </div>
  );
};

export default TaskTemplates;
