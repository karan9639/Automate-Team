"use client"

import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { X, Link, FileText, Download } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const schema = yup
  .object({
    title: yup.string().required("Title is required"),
    description: yup.string().required("Description is required"),
    category: yup.string().required("Category is required"),
    priority: yup.string().required("Priority is required"),
    repeat: yup.boolean(),
  })
  .required()

const TaskTemplateModal = ({ isOpen, onClose, onSubmit, template }) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: template || {
      title: "",
      description: "",
      category: "",
      priority: "High",
      repeat: false,
    },
  })

  const priority = watch("priority")
  const repeat = watch("repeat")

  const onFormSubmit = (data) => {
    onSubmit(data)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-gray-800 rounded-lg shadow-lg w-full max-w-lg mx-4"
          >
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
              <h2 className="text-xl font-semibold text-white">Create Task Template</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onFormSubmit)} className="p-4 space-y-4">
              <div>
                <input
                  type="text"
                  {...register("title")}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                  placeholder="Task Title"
                />
                {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>}
              </div>

              <div>
                <textarea
                  {...register("description")}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white h-24"
                  placeholder="Short description of the task"
                ></textarea>
                {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>}
              </div>

              <div>
                <button
                  type="button"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-left flex items-center gap-2"
                >
                  <span className="bg-gray-600 p-1 rounded">
                    <FileText size={16} />
                  </span>
                  Select Category
                </button>
                {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <span className="bg-gray-600 p-1 rounded">
                    <FileText size={16} />
                  </span>
                  Priority
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className={`px-4 py-1 rounded-md ${
                      priority === "High" ? "bg-green-500 text-white" : "bg-gray-700 text-gray-300"
                    }`}
                    onClick={() => setValue("priority", "High")}
                  >
                    High
                  </button>
                  <button
                    type="button"
                    className={`px-4 py-1 rounded-md ${
                      priority === "Medium" ? "bg-green-500 text-white" : "bg-gray-700 text-gray-300"
                    }`}
                    onClick={() => setValue("priority", "Medium")}
                  >
                    Medium
                  </button>
                  <button
                    type="button"
                    className={`px-4 py-1 rounded-md ${
                      priority === "Low" ? "bg-green-500 text-white" : "bg-gray-700 text-gray-300"
                    }`}
                    onClick={() => setValue("priority", "Low")}
                  >
                    Low
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 text-gray-300">
                  <input
                    type="checkbox"
                    {...register("repeat")}
                    className="form-checkbox h-4 w-4 text-green-500 rounded"
                  />
                  <span className="bg-gray-600 p-1 rounded">
                    <FileText size={16} />
                  </span>
                  Repeat
                </label>
              </div>

              <div className="flex gap-3">
                <button type="button" className="p-2 bg-gray-700 rounded-md text-gray-300 hover:bg-gray-600">
                  <Link size={20} />
                </button>
                <button type="button" className="p-2 bg-gray-700 rounded-md text-gray-300 hover:bg-gray-600">
                  <FileText size={20} />
                </button>
                <button type="button" className="p-2 bg-gray-700 rounded-md text-gray-300 hover:bg-gray-600">
                  <Download size={20} />
                </button>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full py-3 bg-green-500 rounded-md text-white hover:bg-green-600 flex items-center justify-center gap-2"
                >
                  <FileText size={18} />
                  Create Task Template
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default TaskTemplateModal
