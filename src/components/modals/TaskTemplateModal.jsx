"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import PropTypes from "prop-types";
import { X, Link, FileText, Download } from "lucide-react";
import { motion } from "framer-motion";

// Form validation schema
const schema = yup.object({
  title: yup.string().required("Title is required"),
  description: yup.string().required("Description is required"),
  category: yup.string().required("Category is required"),
  priority: yup.string().required("Priority is required"),
  repeat: yup.boolean(),
});

/**
 * Modal for creating or editing task templates
 */
const TaskTemplateModal = ({ isOpen, onClose, template, onSave }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      priority: "Medium",
      repeat: false,
    },
  });

  // Reset form when template changes
  useEffect(() => {
    if (template) {
      reset({
        title: template.title,
        description: template.description,
        category: template.category,
        priority: template.priority,
        repeat: template.repeat || false,
      });
    } else {
      reset({
        title: "",
        description: "",
        category: "",
        priority: "Medium",
        repeat: false,
      });
    }
  }, [template, reset]);

  // Handle form submission
  const onSubmit = (data) => {
    onSave({
      id: template?.id || Date.now().toString(),
      ...data,
      createdAt: template?.createdAt || new Date().toISOString(),
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-gray-800 rounded-lg shadow-lg w-full max-w-md"
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">
            {template ? "Edit Task Template" : "Create Task Template"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-4">
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Task Title
              </label>
              <input
                id="title"
                type="text"
                {...register("title")}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter task title"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Description
              </label>
              <textarea
                id="description"
                {...register("description")}
                rows={4}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Short description of the task"
              ></textarea>
              {errors.description && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Category */}
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Category
              </label>
              <select
                id="category"
                {...register("category")}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select Category</option>
                <option value="Sampling">Sampling</option>
                <option value="PPC">PPC</option>
                <option value="Job Work">Job Work</option>
                <option value="Greige">Greige</option>
                <option value="Form Lamination">Form Lamination</option>
                <option value="Flat Knit">Flat Knit</option>
                <option value="Dyeing">Dyeing</option>
                <option value="Dyeing Lab">Dyeing Lab</option>
                <option value="Dispatch Dyeing">Dispatch Dyeing</option>
                <option value="Digital Printing">Digital Printing</option>
                <option value="Biling">Biling</option>
                <option value="Adhessive">Adhessive</option>
                <option value="Accounts">Accounts</option>
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.category.message}
                </p>
              )}
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Priority
              </label>
              <div className="flex space-x-2">
                <button
                  type="button"
                  className={`flex-1 py-2 rounded-md ${
                    register("priority").value === "High"
                      ? "bg-green-500 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                  onClick={() => reset({ ...register(), priority: "High" })}
                >
                  High
                </button>
                <button
                  type="button"
                  className={`flex-1 py-2 rounded-md ${
                    register("priority").value === "Medium"
                      ? "bg-green-500 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                  onClick={() => reset({ ...register(), priority: "Medium" })}
                >
                  Medium
                </button>
                <button
                  type="button"
                  className={`flex-1 py-2 rounded-md ${
                    register("priority").value === "Low"
                      ? "bg-green-500 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                  onClick={() => reset({ ...register(), priority: "Low" })}
                >
                  Low
                </button>
              </div>
              {errors.priority && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.priority.message}
                </p>
              )}
            </div>

            {/* Repeat */}
            <div className="flex items-center">
              <input
                id="repeat"
                type="checkbox"
                {...register("repeat")}
                className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-green-500 focus:ring-green-500"
              />
              <label
                htmlFor="repeat"
                className="ml-2 block text-sm text-gray-300"
              >
                Repeat
              </label>
            </div>

            {/* Attachment Buttons */}
            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                className="flex items-center px-3 py-2 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600 transition-colors"
              >
                <Link size={16} className="mr-1" />
                <span>Link</span>
              </button>
              <button
                type="button"
                className="flex items-center px-3 py-2 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600 transition-colors"
              >
                <FileText size={16} className="mr-1" />
                <span>File</span>
              </button>
              <button
                type="button"
                className="flex items-center px-3 py-2 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600 transition-colors"
              >
                <Download size={16} className="mr-1" />
                <span>Download</span>
              </button>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
            >
              {template ? "Update Template" : "Create Template"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

TaskTemplateModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  template: PropTypes.object,
  onSave: PropTypes.func.isRequired,
};

export default TaskTemplateModal;
