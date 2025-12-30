"use client"

import { useState, useEffect } from "react"
import { useDispatch } from "react-redux"
import { useSearchParams } from "react-router-dom"
import { Button } from "../../components/ui/button"
import { PlusCircle, RefreshCw, Filter, X } from "lucide-react"
import AssignTaskModal from "../../components/modals/AssignTaskModal"
import ViewTaskModal from "../../components/modals/ViewTaskModal"
import TaskCard from "../../components/tasks/TaskCard"
import EmptyState from "../../components/common/EmptyState"
import {
  myTask,
  delegatedTask,
  allTask,
  personalTasks, // Imported personalTasks API
  viewTask,
  filterTask,
  myTaskFilter,
} from "../../api/tasksApi"

const TaskManagement = () => {
  const dispatch = useDispatch()
  const [searchParams, setSearchParams] = useSearchParams()

  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(9)
  const [totalPages, setTotalPages] = useState(1)
  const [totalTasks, setTotalTasks] = useState(0)

  const [tasks, setTasks] = useState([])
  const [delegatedTasks, setDelegatedTasks] = useState([])
  const [allTasks, setAllTasks] = useState([])
  const [selfTasks, setSelfTasks] = useState([]) // Now fetched from /personal-tasks API
  const [filteredTasks, setFilteredTasks] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("taskManagementActiveTab") || "my-tasks"
    }
    return "my-tasks"
  })

  const [isAssignTaskModalOpen, setIsAssignTaskModalOpen] = useState(false)

  // Filter states
  const [filters, setFilters] = useState({
    taskCategory: "",
    taskPriority: "",
    taskStatus: "",
  })
  const [showFilters, setShowFilters] = useState(false)
  const [isFilterLoading, setIsFilterLoading] = useState(false)

  // View Task Modal State
  const [selectedTaskId, setSelectedTaskId] = useState(null)
  const [selectedTaskData, setSelectedTaskData] = useState(null)
  const [isViewTaskModalOpen, setIsViewTaskModalOpen] = useState(false)
  const [viewTaskLoading, setViewTaskLoading] = useState(false)
  const [viewError, setViewError] = useState(null)

  // Store a mapping of task titles to their correct IDs from allTasks
  const [taskIdMapping, setTaskIdMapping] = useState({})
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Filter options
  const filterOptions = {
    taskCategory: [
      { value: "", label: "All Categories" },
      { value: "Sampling", label: "Sampling" },
      { value: "PPC", label: "PPC" },
      { value: "Job Work", label: "Job Work" },
      { value: "Greige", label: "Greige" },
      { value: "Form Lamination", label: "Form Lamination" },
      { value: "Flat Knit", label: "Flat Knit" },
      { value: "Dyeing", label: "Dyeing" },
      { value: "Dyeing Lab", label: "Dyeing Lab" },
      { value: "Dispatch Dyeing", label: "Dispatch Dyeing" },
      { value: "Digital Printing", label: "Digital Printing" },
      { value: "Biling", label: "Biling" },
      { value: "Adhessive", label: "Adhessive" },
      { value: "Accounts", label: "Accounts" },
    ],
    taskPriority: [
      { value: "", label: "All Priorities" },
      { value: "Low", label: "Low" },
      { value: "Medium", label: "Medium" },
      { value: "High", label: "High" },
    ],
    taskStatus: [
      { value: "", label: "All Status" },
      { value: "Overdue", label: "Overdue" },
      { value: "In Progress", label: "In Progress" },
      { value: "Pending", label: "Pending" },
      { value: "Completed", label: "Completed" },
    ],
  }

  // ----------------------------
  // Self Tasks (UI-only) helpers
  // ----------------------------
  const isSelfTask = (task) => {
    const flag = task?.assigningToYourself ?? task?.assignedToYourself ?? task?.isSelfTask ?? task?.assignToMyself
    return flag === true || flag === "true"
  }

  const splitSelfAndNonSelf = (taskList = []) => {
    const self = []
    const others = []
    taskList.forEach((t) => {
      if (isSelfTask(t)) self.push(t)
      else others.push(t)
    })
    return { self, others }
  }

  const mergeUniqueTasks = (existing = [], incoming = []) => {
    const map = new Map()
    const toKey = (t) => {
      const id =
        (typeof t?._id === "string" && t._id) ||
        (typeof t?._id === "object" && t._id?.$oid) ||
        (typeof t?.id === "string" && t.id) ||
        (typeof t?.taskId === "string" && t.taskId) ||
        (typeof t?.task_id === "string" && t.task_id)
      if (id) return `id:${id}`
      const title = (t?.title || t?.taskTitle || "").toLowerCase().trim()
      const due = (t?.dueDate || t?.due_date || t?.deadline || "").toString()
      const assignee = (t?.assignedTo?.name || t?.assigned_to?.name || "").toLowerCase().trim()
      return `k:${title}|${due}|${assignee}`
    }
    ;[...existing, ...incoming].forEach((t) => {
      map.set(toKey(t), t)
    })
    return Array.from(map.values())
  }

  const extractTasksFromResponse = (response) => {
    console.log("Extracting tasks from response:", response)

    if (response?.data?.data?.filteredTasks && Array.isArray(response.data.data.filteredTasks)) {
      return response.data.data.filteredTasks
    }

    if (response?.data?.data?.tasks && Array.isArray(response.data.data.tasks)) {
      return response.data.data.tasks
    }

    if (response?.data?.data?.allTasks && Array.isArray(response.data.data.allTasks)) {
      return response.data.data.allTasks
    }

    if (response?.data?.data?.myTasksAssignedByLeader && Array.isArray(response.data.data.myTasksAssignedByLeader)) {
      return response.data.data.myTasksAssignedByLeader
    }

    if (response?.data?.success && response?.data?.data && Array.isArray(response.data.data)) {
      return response.data.data
    }

    if (response?.data?.tasks && Array.isArray(response.data.tasks)) {
      return response.data.tasks
    }

    if (response?.data?.data && Array.isArray(response.data.data)) {
      return response.data.data
    }

    if (response?.data && Array.isArray(response.data)) {
      return response.data
    }

    if (response?.data?.data && typeof response.data.data === "object" && !Array.isArray(response.data.data)) {
      if (response.data.data.title || response.data.data.taskTitle || response.data.data._id) {
        return [response.data.data]
      }
    }

    console.warn("Could not extract tasks from response structure:", response)
    return []
  }

  const extractAllTaskId = (task) => {
    if (!task) return null
    if (task._id && typeof task._id === "string") return task._id
    if (task._id && typeof task._id === "object" && task._id.$oid) return task._id.$oid
    return null
  }

  const createTaskMatchKey = (task) => {
    const title = task.title || task.taskTitle || task.name || ""
    const dueDate = task.dueDate || task.due_date || task.deadline || ""
    const assignedTo = task.assignedTo?.name || task.assigned_to?.name || ""
    return `${title}|${dueDate}|${assignedTo}`.toLowerCase().trim()
  }

  const buildTaskIdMapping = (allTasksData) => {
    const mapping = {}
    const titleMapping = {}
    const idMapping = {}

    allTasksData.forEach((task) => {
      const id = extractAllTaskId(task)
      if (id) {
        const matchKey = createTaskMatchKey(task)
        mapping[matchKey] = id

        const title = (task.title || task.taskTitle || task.name || "").toLowerCase().trim()
        if (title) titleMapping[title] = id

        if (task._id) {
          if (typeof task._id === "string") idMapping[task._id] = id
          else if (task._id.$oid) idMapping[task._id.$oid] = id
        }
      }
    })

    return { ...mapping, titleMapping, idMapping }
  }

  const getCorrectTaskId = (task) => {
    const matchKey = createTaskMatchKey(task)
    let correctId = taskIdMapping[matchKey]
    if (correctId) return correctId

    const title = (task.title || task.taskTitle || task.name || "").toLowerCase().trim()
    if (title && taskIdMapping.titleMapping) {
      correctId = taskIdMapping.titleMapping[title]
      if (correctId) return correctId
    }

    if (taskIdMapping.idMapping) {
      if (task._id) {
        const currentId = typeof task._id === "string" ? task._id : task._id.$oid
        correctId = taskIdMapping.idMapping[currentId]
        if (correctId) return correctId
      }

      const idFields = ["id", "taskId", "task_id"]
      for (const field of idFields) {
        if (task[field]) {
          const fieldValue = typeof task[field] === "object" ? task[field].$oid : String(task[field])
          correctId = taskIdMapping.idMapping[fieldValue]
          if (correctId) return correctId
        }
      }
    }

    if (task._id && typeof task._id === "string") return task._id
    if (task._id && typeof task._id === "object" && task._id.$oid) return task._id.$oid

    const idFields = ["id", "taskId", "task_id"]
    for (const field of idFields) {
      if (task[field]) {
        if (typeof task[field] === "object" && task[field].$oid) return task[field].$oid
        if (typeof task[field] === "string" || typeof task[field] === "number") return String(task[field])
      }
    }

    return null
  }

  const normalizeTask = (task) => {
    const correctId = getCorrectTaskId(task)
    if (correctId) {
      return { ...task, _id: correctId }
    }
    return task
  }

  const normalizeAllTasks = (tasks) => tasks.map((task) => normalizeTask(task))

  const extractTaskId = (task) => {
    if (task._id && typeof task._id === "string") return task._id
    if (task._id && typeof task._id === "object" && task._id.$oid) return task._id.$oid

    const idFields = ["id", "taskId", "task_id"]
    for (const field of idFields) {
      if (task[field]) {
        if (typeof task[field] === "string") return task[field]
        if (typeof task[field] === "object" && task[field].$oid) return task[field].$oid
      }
    }

    if (task.task && task.task._id) return typeof task.task._id === "string" ? task.task._id : task.task._id.$oid
    if (task.taskDetails && task.taskDetails._id)
      return typeof task.taskDetails._id === "string" ? task.taskDetails._id : task.taskDetails._id.$oid

    return null
  }

  const applyLocalFilters = (taskList) => {
    let filtered = [...taskList]

    if (filters.taskCategory) {
      filtered = filtered.filter((task) => {
        const category = task.taskCategory || task.category || ""
        return category.toLowerCase() === filters.taskCategory.toLowerCase()
      })
    }

    if (filters.taskPriority) {
      filtered = filtered.filter((task) => {
        const priority = task.taskPriority || task.priority || ""
        return priority.toLowerCase() === filters.taskPriority.toLowerCase()
      })
    }

    if (filters.taskStatus) {
      filtered = filtered.filter((task) => {
        const status = task.taskStatus || task.status || ""
        const normalizedStatus = status.toLowerCase()
        const filterStatus = filters.taskStatus.toLowerCase()

        if (filterStatus === "pending" && (normalizedStatus === "to do" || normalizedStatus === "todo")) return true
        if (filterStatus === "completed" && (normalizedStatus === "done" || normalizedStatus === "finished"))
          return true
        if (filterStatus === "in progress" && normalizedStatus === "in progress") return true

        return normalizedStatus === filterStatus
      })
    }

    return filtered
  }

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({ ...prev, [filterType]: value }))
  }

  const clearAllFilters = () => {
    setFilters({
      taskCategory: "",
      taskPriority: "",
      taskStatus: "",
    })
  }

  const hasActiveFilters = () => !!filters.taskCategory || !!filters.taskPriority || !!filters.taskStatus

  const applyFilters = async () => {
    if (!hasActiveFilters()) {
      setFilteredTasks(getCurrentTasks())
      return
    }

    if (activeTab === "self-tasks") {
      const locallyFiltered = applyLocalFilters(getCurrentTasks())
      setFilteredTasks(locallyFiltered)
      return
    }

    setIsFilterLoading(true)
    try {
      let response
      let filteredData = []

      if (activeTab === "my-tasks") {
        response = await myTaskFilter(filters)
        console.log("My Task Filter Response:", response)

        if (response?.data?.success) filteredData = extractTasksFromResponse(response)
        else if (response?.data?.data) filteredData = Array.isArray(response.data.data) ? response.data.data : []
      } else if (activeTab === "delegated-tasks") {
        response = await filterTask(filters)
        console.log("Filter Task Response:", response)

        if (response?.data?.success) filteredData = extractTasksFromResponse(response)
        else if (response?.data?.data) filteredData = Array.isArray(response.data.data) ? response.data.data : []
      } else {
        const currentTasks = getCurrentTasks()
        filteredData = applyLocalFilters(currentTasks)
      }

      const normalizedFilteredTasks = filteredData.map((task) => normalizeTask(task))
      setFilteredTasks(normalizedFilteredTasks)
    } catch (err) {
      console.error("Filter error:", err)
      const currentTasks = getCurrentTasks()
      const locallyFiltered = applyLocalFilters(currentTasks)
      setFilteredTasks(locallyFiltered)
    } finally {
      setIsFilterLoading(false)
    }
  }

  useEffect(() => {
    applyFilters()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, activeTab])

  const fetchTaskDetails = async (taskId, task, tabName) => {
    try {
      setViewTaskLoading(true)
      setViewError(null)

      if (!taskId) {
        setSelectedTaskData(task)
        setViewError("No task ID found - showing local data")
        return
      }

      const response = await viewTask(taskId)

      let taskData = null
      if (response?.data?.data) taskData = response.data.data
      else if (response?.data?.task) taskData = response.data.task
      else if (response?.data) taskData = response.data

      if (taskData) {
        setSelectedTaskData(taskData)
        setViewError(null)
      } else {
        setSelectedTaskData(task)
        setViewError("API returned no data - showing local data")
      }
    } catch (err) {
      setSelectedTaskData(task)
      setViewError(`API Error: ${err.response?.data?.message || err.message}`)
    } finally {
      setViewTaskLoading(false)
    }
  }

  const handleTaskClick = (task, taskIndex) => {
    let taskId = null

    taskId = extractAllTaskId(task)

    if (!taskId) {
      taskId = getCorrectTaskId(task)
    }

    if (!taskId) {
      const idFields = ["id", "taskId", "task_id", "_id"]
      for (const field of idFields) {
        if (task[field]) {
          if (typeof task[field] === "string") {
            taskId = task[field]
            break
          } else if (typeof task[field] === "object" && task[field].$oid) {
            taskId = task[field].$oid
            break
          }
        }
      }
    }

    if (!taskId && (activeTab === "my-tasks" || activeTab === "delegated-tasks")) {
      if (task.task && task.task._id) taskId = typeof task.task._id === "string" ? task.task._id : task.task._id.$oid
      if (!taskId && task.taskDetails && task.taskDetails._id)
        taskId = typeof task.taskDetails._id === "string" ? task.taskDetails._id : task.taskDetails._id.$oid
    }

    setSelectedTaskId(taskId)
    setSelectedTaskData(null)
    setIsViewTaskModalOpen(true)
    setViewError(null)

    if (taskId) {
      setSearchParams({ id: taskId })
      fetchTaskDetails(taskId, task, activeTab)
    } else {
      setSelectedTaskData(task)
      setViewError("No task ID found")
      setViewTaskLoading(false)
    }
  }

  const handleViewTaskModalClose = () => {
    setIsViewTaskModalOpen(false)
    setSelectedTaskId(null)
    setSelectedTaskData(null)
    setViewError(null)
    setViewTaskLoading(false)
    setSearchParams({})
  }

  const handleTaskUpdate = (taskId, updatedData) => {
    setRefreshTrigger((prev) => prev + 1)
  }

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    if (typeof window !== "undefined") {
      localStorage.setItem("taskManagementActiveTab", tab)
    }

    if (isViewTaskModalOpen) {
      handleViewTaskModalClose()
    }
  }

  const getCurrentTasks = () => {
    switch (activeTab) {
      case "my-tasks":
        return tasks
      case "self-tasks":
        return selfTasks
      case "delegated-tasks":
        return delegatedTasks
      case "all-tasks":
        return allTasks
      default:
        return []
    }
  }

  const getDisplayTasks = () => {
    return hasActiveFilters() ? filteredTasks : getCurrentTasks()
  }

  /**
   * ✅ FIXED: Fetch All Tasks (pagination)
   * - DO NOT filter out self tasks from All Tasks list
   * - Always use allTask(page, limit) only
   */
  useEffect(() => {
    const fetchAllTasksData = async () => {
      try {
        setLoading(true)
        setError(null)

        const data = await allTask(page, limit)
        console.log("[v0] All Tasks API Response:", data)

        const tasksFromApi = extractTasksFromResponse({ data })
        console.log("[v0] Extracted tasks from allTask:", tasksFromApi)

        // Keep self tasks list updated (optional)
        const { self: selfFromAll } = splitSelfAndNonSelf(tasksFromApi)
        if (selfFromAll.length) {
          setSelfTasks((prev) => mergeUniqueTasks(prev, selfFromAll))
        }

        // mapping for view task correctness
        const mapping = buildTaskIdMapping(tasksFromApi)
        setTaskIdMapping(mapping)

        // Only set totalPages for the All Tasks tab (avoid clashes)
        if (activeTab === "all-tasks") {
          setTotalPages(data?.data?.totalPages || 1)
        }

        // ✅ IMPORTANT: show the full page list (up to limit)
        const seenIds = new Set()
        const cleanedTasks = []

        tasksFromApi.forEach((task, idx) => {
          let id = extractAllTaskId(task)

          // fallback id so we don't drop cards
          if (!id) {
            const ts = task?.createdAt || task?.updatedAt || new Date().toISOString()
            id = `all-task-${ts}-${idx}`
          }

          if (!seenIds.has(id)) {
            cleanedTasks.push({ ...task, _id: id })
            seenIds.add(id)
          }
        })

        console.log("[v0] Final cleaned all tasks:", cleanedTasks.length)
        setAllTasks(cleanedTasks)
      } catch (err) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    fetchAllTasksData()
  }, [page, limit, refreshTrigger, activeTab])

  // USEEFFECT: Fetch My Tasks
  useEffect(() => {
    if (activeTab !== "my-tasks" || Object.keys(taskIdMapping).length === 0) return

    const fetchMyTasksData = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await myTask(page, limit)
        setTotalPages(response?.totalPages || 1)
        const taskData = response.myTasksAssignedByLeader || []

        const { self: selfFromMy, others: nonSelfFromMy } = splitSelfAndNonSelf(taskData)
        if (selfFromMy.length) {
          setSelfTasks((prev) => mergeUniqueTasks(prev, selfFromMy))
        }

        console.log("My Tasks Data:", taskData)

        const processedMyTasks = nonSelfFromMy
          .filter((task) => /^[a-f\d]{24}$/i.test(task._id))
          .map((task) => ({
            ...task,
            _id: task._id,
          }))

        setTasks(processedMyTasks)
      } catch (err) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    fetchMyTasksData()
  }, [page, limit, activeTab, taskIdMapping, refreshTrigger])

  /**
   * ✅ FIXED: Fetch Delegated Tasks
   * - DO NOT filter out tasks using nonSelfFromDelegated
   * - Render full page list (up to limit)
   */
  useEffect(() => {
    if (activeTab !== "delegated-tasks") return

    const fetchDelegatedTasksData = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await delegatedTask(page, limit)
        console.log("[v0] Delegated Tasks API Response:", response)
        console.log("[v0] Delegated Tasks Full Response Structure:", JSON.stringify(response, null, 2))

        setTotalPages(response?.totalPages || 1)

        let taskData = []

        if (response?.allTasks && Array.isArray(response.allTasks)) taskData = response.allTasks
        else if (response?.data?.data?.allTasks && Array.isArray(response.data.data.allTasks)) taskData = response.data.data.allTasks
        else if (response?.data?.allTasks && Array.isArray(response.data.allTasks)) taskData = response.data.allTasks
        else if (response?.tasks && Array.isArray(response.tasks)) taskData = response.tasks
        else taskData = extractTasksFromResponse({ data: { data: response } })

        console.log("[v0] Extracted delegated tasks:", taskData.length, taskData)

        // Keep self tasks list updated (optional)
        const { self: selfFromDelegated } = splitSelfAndNonSelf(taskData)
        if (selfFromDelegated.length) {
          setSelfTasks((prev) => mergeUniqueTasks(prev, selfFromDelegated))
        }

        // ✅ IMPORTANT: show full page list (up to limit)
        const seen = new Set()
        const processedDelegatedTasks = []

        taskData.forEach((originalTask, index) => {
          let taskId = originalTask?._id

          if (!taskId || typeof taskId !== "string") {
            const timestamp = originalTask?.createdAt || originalTask?.updatedAt || new Date().toISOString()
            taskId = `delegated-task-${timestamp}-${index}`
          }

          if (!seen.has(taskId)) {
            processedDelegatedTasks.push({
              ...originalTask,
              _id: taskId,
            })
            seen.add(taskId)
          }
        })

        console.log("[v0] Final processed delegated tasks:", processedDelegatedTasks.length)
        setDelegatedTasks(processedDelegatedTasks)
      } catch (err) {
        console.error("[v0] Delegated tasks fetch error:", err)
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    fetchDelegatedTasksData()
  }, [page, limit, activeTab, refreshTrigger])

  // USEEFFECT: Fetch Personal Tasks (Self Tasks)
  useEffect(() => {
    const fetchPersonalTasksData = async () => {
      if (activeTab !== "self-tasks") return

      try {
        setLoading(true)
        setError(null)

        console.log("[v0] Fetching personal tasks...")
        const data = await personalTasks(page, limit)
        console.log("[v0] Personal Tasks Response:", data)

        let tasksFromApi = []
        if (data) {
          if (Array.isArray(data)) tasksFromApi = data
          else if (data.tasks && Array.isArray(data.tasks)) tasksFromApi = data.tasks
          else if (data.filteredTasks && Array.isArray(data.filteredTasks)) tasksFromApi = data.filteredTasks
          else tasksFromApi = extractTasksFromResponse({ data: { data } })
        }

        console.log("[v0] Extracted Personal Tasks:", tasksFromApi)

        if (Array.isArray(tasksFromApi) && tasksFromApi.length > 0) {
          const normalizedTasks = tasksFromApi.map((task) => normalizeTask(task))
          setSelfTasks(normalizedTasks)
          setTotalPages(data?.totalPages || Math.ceil((data?.total || tasksFromApi.length) / limit) || 1)
          setTotalTasks(data?.total || tasksFromApi.length)
        } else {
          setSelfTasks([])
          setTotalPages(1)
          setTotalTasks(0)
        }
      } catch (err) {
        console.error("[v0] Error fetching personal tasks:", err)
        setError(err)
        setSelfTasks([])
        setTotalPages(1)
        setTotalTasks(0)
      } finally {
        setLoading(false)
      }
    }

    fetchPersonalTasksData()
  }, [page, limit, activeTab, refreshTrigger])

  /**
   * ✅ REMOVED:
   * The old "Refresh All Tasks when tab is active" effect that called allTask() WITHOUT page/limit,
   * which was overwriting page-1 with default (3) tasks.
   */

  useEffect(() => {
    setTotalPages(1)
    setPage(1)
    setLimit(9)
  }, [activeTab])

  useEffect(() => {
    const taskId = searchParams.get("id")
    if (taskId && taskId !== selectedTaskId) {
      setSelectedTaskId(taskId)
      setIsViewTaskModalOpen(true)

      const currentTasks = getCurrentTasks()
      const foundTask = currentTasks.find((t) => extractTaskId(t) === taskId)

      fetchTaskDetails(taskId, foundTask, activeTab)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, selectedTaskId, tasks, delegatedTasks, allTasks])

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("taskManagementActiveTab", activeTab)
    }
  }, [activeTab])

  const displayTasks = getDisplayTasks()

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Task Management</h1>
        <div className="flex flex-wrap items-center self-start md:self-auto justify-start md:justify-end gap-2">
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            size="sm"
            className={`flex items-center gap-2 ${hasActiveFilters() ? "bg-blue-50 border-blue-200" : ""}`}
          >
            <Filter className="h-4 w-4" />
            Filters
            {hasActiveFilters() && (
              <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-0.5 ml-1">
                {Object.values(filters).filter((f) => f !== "").length}
              </span>
            )}
          </Button>
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={loading}
            className="flex items-center gap-2 bg-transparent"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            onClick={() => setIsAssignTaskModalOpen(true)}
            className="flex items-center gap-2 bg-[#10b981] hover:bg-[#059669] text-white"
          >
            <PlusCircle className="h-4 w-4" />
            Assign Task
          </Button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end mb-4">
            <div className="flex flex-col w-full">
              <label htmlFor="filter-category" className="text-sm text-gray-600 mb-1">
                Category
              </label>
              <select
                id="filter-category"
                value={filters.taskCategory}
                onChange={(e) => handleFilterChange("taskCategory", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {filterOptions.taskCategory.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col w-full">
              <label htmlFor="filter-priority" className="text-sm text-gray-600 mb-1">
                Priority
              </label>
              <select
                id="filter-priority"
                value={filters.taskPriority}
                onChange={(e) => handleFilterChange("taskPriority", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {filterOptions.taskPriority.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col w-full">
              <label htmlFor="filter-status" className="text-sm text-gray-600 mb-1">
                Status
              </label>
              <select
                id="filter-status"
                value={filters.taskStatus}
                onChange={(e) => handleFilterChange("taskStatus", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {filterOptions.taskStatus.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {hasActiveFilters() && (
              <div className="flex items-end h-full">
                <Button
                  onClick={clearAllFilters}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 w-full sm:w-auto bg-transparent"
                >
                  <X className="h-4 w-4" />
                  Clear Filters
                </Button>
              </div>
            )}
          </div>

          {hasActiveFilters() && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-600">Active filters:</span>
              {filters.taskCategory && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  Category: {filters.taskCategory}
                </span>
              )}
              {filters.taskPriority && (
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  Priority: {filters.taskPriority}
                </span>
              )}
              {filters.taskStatus && (
                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                  Status: {filters.taskStatus}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      <div className="mb-6">
        <div className="border-b">
          <nav className="flex space-x-4 sm:space-x-8 -mb-px overflow-x-auto scrollbar-hidden">
            {["my-tasks", "self-tasks", "delegated-tasks", "all-tasks"].map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? "border-emerald-500 text-emerald-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {hasActiveFilters() && (
        <div className="mb-4 text-sm text-gray-600">
          {isFilterLoading ? (
            <span className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Applying filters...
            </span>
          ) : (
            <span>
              Showing {displayTasks.length} filtered result{displayTasks.length !== 1 ? "s" : ""}
              {displayTasks.length > 0 && ` out of ${getCurrentTasks().length} total tasks`}
            </span>
          )}
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
          <div className="flex items-start">
            <div className="flex-1">
              <h3 className="font-medium">Error loading {activeTab.replace("-", " ")}</h3>
              <p className="text-sm mt-1">{error.response?.data?.message || error.message || "Unknown error occurred"}</p>
              <Button onClick={handleRefresh} variant="outline" size="sm" className="mt-2 bg-transparent" disabled={loading}>
                Try Again
              </Button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mb-4"></div>
          <p className="text-gray-600">
            Loading{" "}
            {activeTab === "my-tasks"
              ? "your tasks"
              : activeTab === "self-tasks"
              ? "self tasks"
              : activeTab === "delegated-tasks"
              ? "delegated tasks"
              : "all tasks"}
            ...
          </p>
        </div>
      ) : error ? (
        <div className="text-center text-red-500 py-12">
          <p>Something went wrong while fetching tasks. Please try again.</p>
        </div>
      ) : displayTasks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayTasks.map((task, index) => {
            const taskId = extractTaskId(task)
            return (
              <TaskCard
                key={taskId || `task-${index}`}
                task={task}
                onClick={() => handleTaskClick(task, index)}
                onDelete={(deletedTaskId) => {
                  console.log(`Task ${deletedTaskId} deleted, refreshing lists.`)
                  handleRefresh()
                }}
                onStatusChange={(changedTaskId, updatedData) => {
                  console.log(`Task ${changedTaskId} status changed, refreshing lists.`)
                  handleRefresh()
                }}
                activeTab={activeTab}
              />
            )
          })}
        </div>
      ) : (
        <EmptyState
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          }
          title={`No ${hasActiveFilters() ? "Filtered " : ""}${
            activeTab === "my-tasks"
              ? "Tasks"
              : activeTab === "self-tasks"
              ? "Self Tasks"
              : activeTab === "delegated-tasks"
              ? "Delegated Tasks"
              : "Tasks"
          } Found`}
          description={
            hasActiveFilters()
              ? "No tasks match your current filter criteria. Try adjusting your filters."
              : activeTab === "my-tasks"
              ? "You don't have any tasks assigned to you."
              : activeTab === "self-tasks"
              ? "You don't have any self-assigned tasks yet. Use Assign Task → Assign To → Myself to create one."
              : activeTab === "delegated-tasks"
              ? "You haven't delegated any tasks yet."
              : "There are no tasks in the system."
          }
          className="py-16"
        />
      )}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mt-8 bg-white p-4 rounded-xl shadow-sm border border-green-100">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 font-medium">Items per page:</label>
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number.parseInt(e.target.value))
              setPage(1)
            }}
            className="rounded-lg border border-green-300 text-sm px-3 py-1.5 bg-white text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            <option value={9}>9</option>
            <option value={15}>15</option>
            <option value={30}>30</option>
          </select>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
              page === 1
                ? "text-gray-400 border-green-200 bg-gray-100 cursor-not-allowed"
                : "text-white bg-green-600 border-green-600 hover:bg-green-700"
            }`}
          >
            Previous
          </button>

          <span className="text-sm text-gray-700">
            Page <strong>{page}</strong> of <strong>{totalPages}</strong>
          </span>

          <button
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={page === totalPages}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
              page === totalPages
                ? "text-gray-400 border-green-200 bg-gray-100 cursor-not-allowed"
                : "text-white bg-green-600 border-green-600 hover:bg-green-700"
            }`}
          >
            Next
          </button>
        </div>
      </div>

      <AssignTaskModal
        isOpen={isAssignTaskModalOpen}
        onClose={() => setIsAssignTaskModalOpen(false)}
        task={null}
        onSuccess={(createdTask) => {
          setIsAssignTaskModalOpen(false)

          if (createdTask && isSelfTask(createdTask)) {
            setSelfTasks((prev) => mergeUniqueTasks(prev, [createdTask]))
          }

          handleRefresh()
        }}
      />

      <ViewTaskModal
        isOpen={isViewTaskModalOpen}
        onClose={handleViewTaskModalClose}
        task={selectedTaskData}
        loading={viewTaskLoading}
        error={viewError}
        isFromDelegatedTab={activeTab === "delegated-tasks"}
        onTaskUpdate={handleTaskUpdate}
      />
    </div>
  )
}

export default TaskManagement

