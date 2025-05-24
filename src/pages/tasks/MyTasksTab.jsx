"use client"

import { useState } from "react"
import { Calendar, CheckCircle, Circle, Clock, Filter, PlusCircle } from "lucide-react"
import { Button } from "../../components/ui/button"
import EmptyState from "../../components/common/EmptyState"
import AssignTaskModal from "../../components/modals/AssignTaskModal"

const MyTasksTab = ({ tasks = [] }) => {
  const [isAssignTaskModalOpen, setIsAssignTaskModalOpen] = useState(false)
  const [activeFilter, setActiveFilter] = useState("this-week")

  const dateFilters = [
    { id: "today", label: "Today" },
    { id: "yesterday", label: "Yesterday" },
    { id: "this-week", label: "This Week" },
    { id: "this-month", label: "This Month" },
    { id: "next-week", label: "Next Week" },
    { id: "all-time", label: "All Time" },
    { id: "custom", label: "Custom" },
  ]

  const statusFilters = [
    { id: "overdue", label: "OverDue", color: "text-red-500", icon: Clock, count: 0 },
    { id: "pending", label: "Pending", color: "text-orange-500", icon: Circle, count: 0 },
    { id: "in-progress", label: "In Progress", color: "text-yellow-500", icon: PlusCircle, count: 0 },
    { id: "completed", label: "Completed", color: "text-green-500", icon: CheckCircle, count: 0 },
  ]

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() => setIsAssignTaskModalOpen(true)}
            className="bg-emerald-500 hover:bg-emerald-600 text-white flex items-center"
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Assign Task
          </Button>

          <div className="flex flex-wrap gap-2 ml-4">
            {dateFilters.map((filter) => (
              <Button
                key={filter.id}
                variant={activeFilter === filter.id ? "default" : "outline"}
                className={`rounded-full ${activeFilter === filter.id ? "bg-emerald-500 hover:bg-emerald-600" : ""}`}
                onClick={() => setActiveFilter(filter.id)}
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>

        <Button variant="outline" className="flex items-center">
          <Filter className="h-4 w-4 mr-2" /> Filter
        </Button>
      </div>

      <div className="mb-6">
        <div className="flex flex-wrap gap-4">
          {statusFilters.map((filter) => (
            <div
              key={filter.id}
              className="flex items-center gap-2 px-4 py-2 border-b-2 border-transparent hover:border-emerald-500 cursor-pointer"
            >
              <filter.icon className={`h-5 w-5 ${filter.color}`} />
              <span>{filter.label}</span>
              <span className="text-gray-500">- {filter.count}</span>
            </div>
          ))}
        </div>
      </div>

      {tasks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{/* Task cards would go here */}</div>
      ) : (
        <EmptyState
          icon={<Calendar className="h-16 w-16 text-gray-400" />}
          title="No Tasks Here"
          description="It seems that you don't have any tasks in this list"
          className="py-16"
        />
      )}

      <AssignTaskModal isOpen={isAssignTaskModalOpen} onClose={() => setIsAssignTaskModalOpen(false)} />
    </div>
  )
}

export default MyTasksTab
