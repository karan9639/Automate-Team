"use client"

import { useState } from "react"
import { X, FilterIcon } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { RadioGroup, RadioGroupItem } from "./ui/radio-group"
import { Label } from "./ui/label"

const TaskFilters = ({ isOpen, onClose, onApplyFilters }) => {
  const [filters, setFilters] = useState({
    category: null,
    assignedBy: null,
    frequency: null,
    priority: null,
  })

  // Categories
  const categories = [
    { id: "sales", label: "Sales" },
    { id: "general", label: "General" },
    { id: "automation", label: "Automation" },
    { id: "marketing", label: "Marketing" },
    { id: "customer-support", label: "Customer Support" },
  ]

  // Handle filter change
  const handleFilterChange = (type, value) => {
    setFilters((prev) => ({
      ...prev,
      [type]: value,
    }))
  }

  // Handle clear filters
  const handleClearFilters = () => {
    setFilters({
      category: null,
      assignedBy: null,
      frequency: null,
      priority: null,
    })
  }

  // Handle apply filters
  const handleApplyFilters = () => {
    onApplyFilters(filters)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-gray-900 text-white border-gray-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FilterIcon size={18} />
            Task Filters
          </DialogTitle>
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Category */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white">Category</h3>
            <Input type="search" placeholder="Search Category" className="bg-gray-800 border-gray-700 text-white" />
            <RadioGroup
              value={filters.category}
              onValueChange={(value) => handleFilterChange("category", value)}
              className="space-y-2"
            >
              {categories.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={category.id}
                    id={`category-${category.id}`}
                    className="border-gray-600 text-green-500"
                  />
                  <Label htmlFor={`category-${category.id}`} className="text-white">
                    {category.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Assigned By */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white">Assigned By</h3>
            {/* Similar structure as Category */}
          </div>

          {/* Frequency */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white">Frequency</h3>
            {/* Similar structure as Category */}
          </div>

          {/* Priority */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white">Priority</h3>
            {/* Similar structure as Category */}
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={handleClearFilters} className="border-gray-700 text-white">
            <X size={16} className="mr-2" />
            Clear
          </Button>
          <Button onClick={handleApplyFilters} className="bg-green-500 hover:bg-green-600 text-white">
            <FilterIcon size={16} className="mr-2" />
            Filter Tasks
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default TaskFilters
