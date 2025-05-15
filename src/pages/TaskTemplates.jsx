"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Search, FileText, Plus } from "lucide-react"
import MainLayout from "../layouts/MainLayout"
import TaskTemplateModal from "../components/TaskTemplateModal"

const TaskTemplates = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [templates, setTemplates] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState({
    createdBy: "",
    category: "",
  })

  const handleAddTemplate = (template) => {
    const newTemplate = {
      ...template,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }
    setTemplates([...templates, newTemplate])
    setIsModalOpen(false)
  }

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value })
  }

  return (
    <MainLayout>
      <div className="p-4 md:p-6">
        <h1 className="text-xl font-semibold mb-6 text-gray-200">List of Tasks Templates Saved by You & Your Team</h1>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search Here..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md bg-transparent text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="px-4 py-2 border border-gray-300 rounded-md bg-transparent text-white"
            value={filters.createdBy}
            onChange={(e) => handleFilterChange("createdBy", e.target.value)}
          >
            <option value="">Created By</option>
            <option value="me">Me</option>
            <option value="team">Team</option>
          </select>

          <select
            className="px-4 py-2 border border-gray-300 rounded-md bg-transparent text-white"
            value={filters.category}
            onChange={(e) => handleFilterChange("category", e.target.value)}
          >
            <option value="">Category</option>
            <option value="sales">Sales</option>
            <option value="marketing">Marketing</option>
            <option value="hr">HR</option>
          </select>

          <button className="px-4 py-2 border border-gray-300 rounded-md bg-transparent text-white flex items-center gap-2">
            <Search size={18} />
            Reset
          </button>

          <motion.button
            className="px-4 py-2 bg-green-500 text-white rounded-md flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={18} />
            Create
          </motion.button>
        </div>

        {/* Empty State */}
        {templates.length === 0 && (
          <div className="text-center py-20">
            <div className="flex justify-center mb-4">
              <FileText size={64} className="text-gray-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-300 mb-2">No Templates Found</h2>
            <p className="text-gray-400 mb-6">Create your first task template to get started</p>
            <motion.button
              className="px-6 py-2 bg-green-500 text-white rounded-md inline-flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsModalOpen(true)}
            >
              <Plus size={18} />
              Create Template
            </motion.button>
          </div>
        )}

        {/* Task Template Modal */}
        <TaskTemplateModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleAddTemplate} />
      </div>
    </MainLayout>
  )
}

export default TaskTemplates
