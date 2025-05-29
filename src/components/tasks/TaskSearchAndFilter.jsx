"use client"

import { useState } from "react"
import { useDispatch } from "react-redux"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { Search, Filter, X, ChevronDown, SortAsc, SortDesc } from "lucide-react"
import { searchTasks, filterTasks, clearSearchResults, clearFilterResults } from "../../store/slices/taskSlice"

const TaskSearchAndFilter = ({ onResultsChange }) => {
  const dispatch = useDispatch()

  const [searchQuery, setSearchQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [activeFilters, setActiveFilters] = useState({
    taskCategory: "",
    taskPriority: "",
    taskStatus: "",
  })
  const [sortBy, setSortBy] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState("desc")

  const categories = ["Development", "Design", "Marketing", "Operations"]
  const priorities = ["High", "Medium", "Low"]
  const statuses = ["Pending", "In Progress", "Completed", "Overdue"]

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      const searchParams = {
        query: searchQuery.trim(),
        // You can add more search fields based on your API
        taskTitle: searchQuery.trim(),
        taskDescription: searchQuery.trim(),
        taskCategory: searchQuery.trim(),
      }

      try {
        const result = await dispatch(searchTasks(searchParams)).unwrap()
        onResultsChange?.(result.data || result, "search")
      } catch (error) {
        console.error("Search failed:", error)
      }
    }
  }

  const handleFilter = async () => {
    const filterParams = Object.entries(activeFilters)
      .filter(([key, value]) => value !== "")
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})

    if (Object.keys(filterParams).length > 0) {
      try {
        const result = await dispatch(filterTasks(filterParams)).unwrap()
        onResultsChange?.(result.data || result, "filter")
      } catch (error) {
        console.error("Filter failed:", error)
      }
    }
  }

  const clearSearch = () => {
    setSearchQuery("")
    dispatch(clearSearchResults())
    onResultsChange?.([], "clear")
  }

  const clearFilters = () => {
    setActiveFilters({
      taskCategory: "",
      taskPriority: "",
      taskStatus: "",
    })
    dispatch(clearFilterResults())
    onResultsChange?.([], "clear")
  }

  const updateFilter = (key, value) => {
    setActiveFilters((prev) => ({
      ...prev,
      [key]: value === prev[key] ? "" : value,
    }))
  }

  const getActiveFilterCount = () => {
    return Object.values(activeFilters).filter((value) => value !== "").length
  }

  const toggleSort = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search tasks by title, description, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            className="pl-10"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button onClick={handleSearch} disabled={!searchQuery.trim()}>
          Search
        </Button>
      </div>

      {/* Filter and Sort Controls */}
      <div className="flex flex-wrap gap-2 items-center">
        <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filters
          {getActiveFilterCount() > 0 && (
            <Badge variant="secondary" className="ml-1">
              {getActiveFilterCount()}
            </Badge>
          )}
          <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
        </Button>

        <Button variant="outline" onClick={toggleSort} className="flex items-center gap-2">
          {sortOrder === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
          Sort by Date
        </Button>

        {(searchQuery || getActiveFilterCount() > 0) && (
          <Button
            variant="ghost"
            onClick={() => {
              clearSearch()
              clearFilters()
            }}
            className="text-red-600 hover:text-red-700"
          >
            Clear All
          </Button>
        )}
      </div>

      {/* Filter Options */}
      {showFilters && (
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <div className="flex flex-wrap gap-1">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={activeFilters.taskCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateFilter("taskCategory", category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <div className="flex flex-wrap gap-1">
                {priorities.map((priority) => (
                  <Button
                    key={priority}
                    variant={activeFilters.taskPriority === priority ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateFilter("taskPriority", priority)}
                  >
                    {priority}
                  </Button>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <div className="flex flex-wrap gap-1">
                {statuses.map((status) => (
                  <Button
                    key={status}
                    variant={activeFilters.taskStatus === status ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateFilter("taskStatus", status)}
                  >
                    {status}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
            <Button onClick={handleFilter} disabled={getActiveFilterCount() === 0}>
              Apply Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default TaskSearchAndFilter
