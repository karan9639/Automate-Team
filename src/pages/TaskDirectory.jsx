"use client"

import { useState } from "react"
import MainLayout from "../layouts/MainLayout"
import { Search, X } from "lucide-react"

const TaskDirectory = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedIndustry, setSelectedIndustry] = useState(null)

  // Dummy data for industries and templates
  const industries = [
    "Construction",
    "E-commerce",
    "Education/EdTech",
    "Health and Wellness",
    "Hospitality",
    "IT",
    "Logistics",
    "Manufacturing",
    "Service Provider",
    "Trading",
    "Travel/Tourism",
    "Financial Services",
  ]

  const templates = [
    { category: "Sales", count: 25 },
    { category: "HR", count: 22 },
    { category: "Research & Development", count: 11 },
    { category: "Design and Prototyping", count: 10 },
    { category: "Food Safety & Hygiene", count: 10 },
    { category: "IT", count: 10 },
    { category: "Marketing", count: 10 },
    { category: "Operations", count: 10 },
    { category: "Packaging & Labeling", count: 10 },
    { category: "Purchase", count: 10 },
    { category: "Social Media", count: 10 },
    { category: "Admin", count: 10 },
    { category: "Customer Support", count: 10 },
    { category: "Accounts", count: 10 },
    { category: "Event Management", count: 9 },
  ]

  const handleReset = () => {
    setSearchTerm("")
    setSelectedIndustry(null)
  }

  const filteredTemplates = templates.filter((template) =>
    template.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <MainLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-white mb-4">
            List of Department wise Tasks curated by Automate Business
          </h1>

          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search Template"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded p-2 pl-10 text-white"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>

            <button
              onClick={handleReset}
              className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded transition-colors"
            >
              <X size={16} />
              Reset
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {industries.map((industry, index) => (
              <button
                key={index}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedIndustry === industry ? "bg-green-500 text-white" : "bg-gray-700 text-white hover:bg-gray-600"
                }`}
                onClick={() => setSelectedIndustry(industry === selectedIndustry ? null : industry)}
              >
                {industry}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template, index) => (
            <div key={index} className="bg-gray-800 rounded-lg p-6 cursor-pointer hover:bg-gray-750 transition-colors">
              <h3 className="text-lg font-medium text-white mb-1">{template.category}</h3>
              <p className="text-gray-400">{template.count} Templates</p>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  )
}

export default TaskDirectory
