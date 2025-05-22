"use client"

import { useState } from "react"
import { Calendar, Filter } from "lucide-react"
import { Button } from "../../components/ui/button"
import EmptyState from "../../components/common/EmptyState"

const DelegatedTasksTab = ({ tasks = [] }) => {
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

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-2">
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

      {tasks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{/* Task cards would go here */}</div>
      ) : (
        <EmptyState
          icon={<Calendar className="h-16 w-16 text-gray-400" />}
          title="No Delegated Tasks"
          description="You haven't delegated any tasks yet"
          className="py-16"
        />
      )}
    </div>
  )
}

export default DelegatedTasksTab
