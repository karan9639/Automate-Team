"use client"

import { useState, useEffect } from "react"
import { useDispatch } from "react-redux"
import { useNavigate, useLocation, useSearchParams } from "react-router-dom"
import { Button } from "../../components/ui/button"
import { PlusCircle, RefreshCw } from "lucide-react"
import AssignTaskModal from "../../components/modals/AssignTaskModal"
import ViewTaskModal from "../../components/modals/ViewTaskModal"
import TaskCard from "../../components/tasks/TaskCard"
import EmptyState from "../../components/common/EmptyState"
import { myTask, deligatedTask, allTask, viewTask } from "../../api/tasksApi"

const TaskManagement = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()

  const [tasks, setTasks] = useState([])
  const [delegatedTasks, setDelegatedTasks] = useState([])
  const [allTasks, setAllTasks] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [activeTab, setActiveTab] = useState("my-tasks")
  const [isAssignTaskModalOpen, setIsAssignTaskModalOpen] = useState(false)

  // View Task Modal State
  const [selectedTaskId, setSelectedTaskId] = useState(null)
  const [selectedTaskData, setSelectedTaskData] = useState(null)
  const [isViewTaskModalOpen, setIsViewTaskModalOpen] = useState(false)
  const [viewTaskLoading, setViewTaskLoading] = useState(false)
  const [viewError, setViewError] = useState(null)

  // Helper function to extract tasks from different API response structures
  const extractTasksFromResponse = (response) => {
    if (response?.data?.data?.tasks && Array.isArray(response.data.data.tasks)) {
      return response.data.data.tasks
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

    console.warn("Could not find tasks array in response:", response)
    return []
  }

  // Check if a string looks like a MongoDB ObjectId
  const isValidObjectId = (id) => {
    if (!id || typeof id !== "string") return false
    return /^[0-9a-fA-F]{24}$/.test(id)
  }

  // FIND ID ANYWHERE in task object
  const findTaskIdAnywhere = (task) => {
    console.log("🔍 ===== FINDING ID ANYWHERE IN TASK =====")
    console.log("🔍 Task object:", JSON.stringify(task, null, 2))

    if (!task) {
      console.log("❌ No task object provided")
      return null
    }

    // METHOD 1: Check task._id
    if (task._id) {
      console.log("✅ Found task._id:", task._id)

      // Handle MongoDB $oid format: { "$oid": "68383bf39e3a62525931d838" }
      if (typeof task._id === "object" && task._id !== null && task._id.$oid) {
        const objectId = task._id.$oid
        console.log("✅ EXTRACTED from task._id.$oid:", objectId)
        return objectId
      }

      // Handle direct string format: "68383bf39e3a62525931d838"
      if (typeof task._id === "string") {
        console.log("✅ EXTRACTED from task._id string:", task._id)
        return task._id
      }
    }

    // METHOD 2: Check other common ID fields
    const idFields = ["id", "taskId", "task_id", "ID", "taskID", "Task_ID", "TASK_ID"]
    for (const field of idFields) {
      if (task[field]) {
        console.log(`🔍 Checking ${field}:`, task[field])

        // Handle $oid format
        if (typeof task[field] === "object" && task[field] !== null && task[field].$oid) {
          const objectId = task[field].$oid
          console.log(`✅ EXTRACTED from ${field}.$oid:`, objectId)
          return objectId
        }

        // Handle direct string
        if (typeof task[field] === "string") {
          console.log(`✅ EXTRACTED from ${field} string:`, task[field])
          return task[field]
        }
      }
    }

    // METHOD 3: Deep search through ALL properties
    const deepSearch = (obj, path = "", maxDepth = 3) => {
      if (path.split(".").length > maxDepth) return null

      for (const [key, value] of Object.entries(obj)) {
        const currentPath = path ? `${path}.${key}` : key

        // Skip known non-ID nested objects
        if (
          [
            "taskFrequency",
            "daysOfWeek",
            "datesOfMonth",
            "periodicDates",
            "details",
            "assignedTo",
            "createdBy",
          ].includes(key)
        ) {
          continue
        }

        // Check for $oid format at any level
        if (typeof value === "object" && value !== null && !Array.isArray(value)) {
          if (value.$oid) {
            console.log(`✅ FOUND $oid at ${currentPath}:`, value.$oid)
            return value.$oid
          }

          // Recursively search nested objects
          const nestedResult = deepSearch(value, currentPath, maxDepth)
          if (nestedResult) return nestedResult
        }

        // Check for ObjectId strings
        if (typeof value === "string" && isValidObjectId(value)) {
          console.log(`✅ FOUND ObjectId string at ${currentPath}:`, value)
          return value
        }
      }
      return null
    }

    const deepSearchResult = deepSearch(task)
    if (deepSearchResult) {
      console.log("✅ DEEP SEARCH SUCCESS:", deepSearchResult)
      return deepSearchResult
    }

    // METHOD 4: Search for ANY ObjectId pattern in entire object
    console.log("🔍 METHOD 4: Searching for ANY ObjectId pattern...")
    const taskString = JSON.stringify(task)
    const objectIdMatches = taskString.match(/[0-9a-fA-F]{24}/g)

    if (objectIdMatches && objectIdMatches.length > 0) {
      for (const match of objectIdMatches) {
        if (isValidObjectId(match)) {
          console.log("✅ FOUND ObjectId pattern:", match)
          return match
        }
      }
    }

    console.log("❌ NO ID FOUND ANYWHERE")
    return null
  }

  // NORMALIZE TASK: Ensure task._id is always a string WITHOUT changing the ID value
  const normalizeTask = (task) => {
    console.log("🔧 ===== NORMALIZING TASK - PRESERVING EXACT ID VALUE =====")
    console.log("🔧 Original task._id:", task._id, "Type:", typeof task._id)

    // If task._id already exists and is a string, keep it as-is
    if (task._id && typeof task._id === "string") {
      console.log("✅ task._id is already a string, keeping as-is:", task._id)
      return task
    }

    // If task._id exists but is an object with $oid, convert to string
    if (task._id && typeof task._id === "object" && task._id.$oid) {
      const stringId = task._id.$oid
      console.log("🔧 Converting task._id.$oid to string:", stringId)
      return {
        ...task,
        _id: stringId,
      }
    }

    // If task._id doesn't exist, try to find it in other common fields
    // Check common ID fields in order of preference
    const idFields = ["id", "taskId", "task_id"]

    for (const field of idFields) {
      if (task[field]) {
        console.log(`🔧 Found ID in ${field}:`, task[field], "Type:", typeof task[field])

        let idValue = null

        // Handle $oid format
        if (typeof task[field] === "object" && task[field].$oid) {
          idValue = task[field].$oid
          console.log(`🔧 Extracted from ${field}.$oid:`, idValue)
        }
        // Handle direct string/value
        else if (task[field]) {
          idValue = String(task[field]) // Convert to string preserving value
          console.log(`🔧 Converted ${field} to string:`, idValue)
        }

        if (idValue) {
          console.log("✅ PRESERVING EXACT ID VALUE as string:", idValue)
          return {
            ...task,
            _id: idValue, // Set as string, preserving exact value
          }
        }
      }
    }

    // If no ID found in common fields, do a careful search
    console.log("🔍 Searching for ID in nested objects...")

    // Look for any field that contains an ObjectId pattern
    for (const [key, value] of Object.entries(task)) {
      // Skip known non-ID fields
      if (
        ["taskFrequency", "daysOfWeek", "datesOfMonth", "periodicDates", "details", "assignedTo", "createdBy"].includes(
          key,
        )
      ) {
        continue
      }

      // Check for $oid in nested objects
      if (typeof value === "object" && value !== null && !Array.isArray(value) && value.$oid) {
        const idValue = value.$oid
        console.log(`🔧 Found $oid in ${key}:`, idValue)
        console.log("✅ PRESERVING EXACT ID VALUE as string:", idValue)
        return {
          ...task,
          _id: idValue,
        }
      }

      // Check for ObjectId string pattern
      if (typeof value === "string" && /^[0-9a-fA-F]{24}$/.test(value)) {
        console.log(`🔧 Found ObjectId string in ${key}:`, value)
        console.log("✅ PRESERVING EXACT ID VALUE as string:", value)
        return {
          ...task,
          _id: value,
        }
      }
    }

    console.log("⚠️ No ID found - keeping original task unchanged")
    return task
  }

  // NORMALIZE ALL TASKS: Ensure all tasks have task._id as string
  const normalizeAllTasks = (tasks) => {
    console.log("🔧 ===== NORMALIZING ALL TASKS =====")
    console.log("🔧 Original tasks count:", tasks.length)

    const normalizedTasks = tasks.map((task, index) => {
      console.log(`🔧 Normalizing task ${index + 1}...`)
      return normalizeTask(task)
    })

    console.log("✅ All tasks normalized - task._id is now string for all tasks")
    return normalizedTasks
  }

  // SIMPLE ID EXTRACTION: Now task._id is always a string
  const extractTaskId = (task) => {
    console.log("🔍 ===== SIMPLE ID EXTRACTION (task._id is string) =====")
    console.log("🔍 task._id:", task._id, "Type:", typeof task._id)

    if (task._id && typeof task._id === "string") {
      console.log("✅ EXTRACTED task._id as string:", task._id)
      return task._id
    }

    console.log("❌ task._id is not a string")
    return null
  }

  // API CALL: Use extracted ID to call view API
  const fetchTaskDetails = async (taskId, task, tabName) => {
    console.log("🚀 ===== API CALL FOR ALL TABS =====")
    console.log("🆔 Task ID:", taskId)
    console.log("📂 From tab:", tabName)

    try {
      setViewTaskLoading(true)
      setViewError(null)

      if (!taskId) {
        console.log("❌ No task ID provided, using local data")
        setSelectedTaskData(task)
        setViewError("No task ID found - showing local data")
        return
      }

      console.log(`🔍 CALLING VIEW API: task/view-task/${taskId}`)

      const response = await viewTask(taskId)
      console.log("📊 API RESPONSE SUCCESS:", response)

      // Extract task data from response
      let taskData = null

      if (response?.data?.data) {
        taskData = response.data.data
        console.log("✅ Extracted from response.data.data")
      } else if (response?.data?.task) {
        taskData = response.data.task
        console.log("✅ Extracted from response.data.task")
      } else if (response?.data) {
        taskData = response.data
        console.log("✅ Extracted from response.data")
      }

      if (taskData) {
        console.log("✅ API SUCCESS: Setting task data from API")
        setSelectedTaskData(taskData)
        setViewError(null)
      } else {
        console.log("⚠️ API returned no data, using local fallback")
        setSelectedTaskData(task)
        setViewError("API returned no data - showing local data")
      }
    } catch (err) {
      console.error("❌ API ERROR:", {
        message: err.message,
        status: err.response?.status,
        url: err.config?.url,
        data: err.response?.data,
      })
      console.log("🔄 Using local task data as fallback")
      setSelectedTaskData(task)
      setViewError(`API Error: ${err.response?.data?.message || err.message}`)
    } finally {
      setViewTaskLoading(false)
    }
  }

  // TASK CLICK: Handle task card click for all tabs
  const handleTaskClick = (task, taskIndex) => {
    console.log("🎯 ===== TASK CLICK - task._id IS STRING =====")
    console.log("🎯 Active tab:", activeTab)
    console.log("🎯 task._id:", task._id, "Type:", typeof task._id)

    // Extract task ID (should always be string now)
    const taskId = extractTaskId(task)
    console.log("🆔 EXTRACTED TASK ID:", taskId)

    // Always open modal
    setSelectedTaskId(taskId)
    setSelectedTaskData(null)
    setIsViewTaskModalOpen(true)
    setViewError(null)

    // Update URL with ID
    if (taskId) {
      console.log("🔗 SETTING URL PARAM:", taskId)
      setSearchParams({ id: taskId })
    }

    // Call API with extracted ID
    if (taskId) {
      console.log("🚀 CALLING API for tab:", activeTab, "with ID:", taskId)
      fetchTaskDetails(taskId, task, activeTab)
    } else {
      console.log("⚠️ NO ID FOUND - using local data")
      setSelectedTaskData(task)
      setViewError("No task ID found")
      setViewTaskLoading(false)
    }
  }

  // Handle modal close
  const handleViewTaskModalClose = () => {
    console.log("🔒 Closing modal")
    setIsViewTaskModalOpen(false)
    setSelectedTaskId(null)
    setSelectedTaskData(null)
    setViewError(null)
    setViewTaskLoading(false)
    setSearchParams({})
  }

  // Check for task ID in URL on component mount and URL changes
  useEffect(() => {
    const taskId = searchParams.get("id")
    if (taskId && taskId !== selectedTaskId) {
      console.log(`🔗 Deep link detected for task ID: ${taskId}`)
      setSelectedTaskId(taskId)
      setIsViewTaskModalOpen(true)

      const currentTasks = getCurrentTasks()
      const foundTask = currentTasks.find((t) => extractTaskId(t) === taskId)

      fetchTaskDetails(taskId, foundTask, activeTab)
    }
  }, [searchParams, selectedTaskId])

  // Fetch My Tasks and NORMALIZE
  const fetchMyTasks = async () => {
    if (loading) return

    try {
      setLoading(true)
      setError(null)

      console.log("📡 Fetching MY TASKS...")
      const response = await myTask()
      console.log("📡 MY TASKS RESPONSE:", response)

      const taskData = extractTasksFromResponse(response)

      // NORMALIZE: Make task._id a string for all tasks
      const normalizedTasks = normalizeAllTasks(taskData)

      if (normalizedTasks.length > 0) {
        console.log("📋 ===== MY TASKS - NORMALIZED (task._id is string) =====")
        console.log("📋 Total tasks:", normalizedTasks.length)

        // Test normalized tasks
        normalizedTasks.slice(0, 3).forEach((task, index) => {
          console.log(`📋 MY TASK ${index + 1} _id:`, task._id, "Type:", typeof task._id)
          const extractedId = extractTaskId(task)
          console.log(`📋 MY TASK ${index + 1} EXTRACTED ID:`, extractedId)
        })
      }

      setTasks(normalizedTasks)
      console.log(`✅ Loaded ${normalizedTasks.length} normalized my tasks`)
    } catch (err) {
      console.error("❌ Error fetching my tasks:", err)
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  // Fetch Delegated Tasks and NORMALIZE
  const fetchDelegatedTasks = async () => {
    if (loading) return

    try {
      setLoading(true)
      setError(null)

      console.log("📡 Fetching DELEGATED TASKS...")
      const response = await deligatedTask()
      console.log("📡 DELEGATED TASKS RESPONSE:", response)

      const taskData = extractTasksFromResponse(response)

      // NORMALIZE: Make task._id a string for all tasks
      const normalizedTasks = normalizeAllTasks(taskData)

      if (normalizedTasks.length > 0) {
        console.log("📋 ===== DELEGATED TASKS - NORMALIZED (task._id is string) =====")
        console.log("📋 Total tasks:", normalizedTasks.length)

        // Test normalized tasks
        normalizedTasks.slice(0, 3).forEach((task, index) => {
          console.log(`📋 DELEGATED TASK ${index + 1} _id:`, task._id, "Type:", typeof task._id)
          const extractedId = extractTaskId(task)
          console.log(`📋 DELEGATED TASK ${index + 1} EXTRACTED ID:`, extractedId)
        })
      }

      setDelegatedTasks(normalizedTasks)
      console.log(`✅ Loaded ${normalizedTasks.length} normalized delegated tasks`)
    } catch (err) {
      console.error("❌ Error fetching delegated tasks:", err)
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  // Fetch All Tasks and NORMALIZE
  const fetchAllTasks = async () => {
    if (loading) return

    try {
      setLoading(true)
      setError(null)

      console.log("📡 Fetching ALL TASKS...")
      const response = await allTask()
      console.log("📡 ALL TASKS RESPONSE:", response)

      const taskData = response?.data?.data?.tasks || extractTasksFromResponse(response)

      // NORMALIZE: Make task._id a string for all tasks
      const normalizedTasks = normalizeAllTasks(taskData)

      if (normalizedTasks.length > 0) {
        console.log("📋 ===== ALL TASKS - NORMALIZED (task._id is string) =====")
        console.log("📋 Total tasks:", normalizedTasks.length)

        // Test normalized tasks
        normalizedTasks.slice(0, 3).forEach((task, index) => {
          console.log(`📋 ALL TASK ${index + 1} _id:`, task._id, "Type:", typeof task._id)
          const extractedId = extractTaskId(task)
          console.log(`📋 ALL TASK ${index + 1} EXTRACTED ID:`, extractedId)
        })
      }

      setAllTasks(normalizedTasks)
      console.log(`✅ Loaded ${normalizedTasks.length} normalized all tasks`)
    } catch (err) {
      console.error("❌ Error fetching all tasks:", err)
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  // Fetch tasks based on active tab
  const fetchTasksForTab = (tab) => {
    console.log(`📂 Fetching tasks for tab: ${tab}`)
    if (tab === "my-tasks") {
      fetchMyTasks()
    } else if (tab === "delegated-tasks") {
      fetchDelegatedTasks()
    } else if (tab === "all-tasks") {
      fetchAllTasks()
    }
  }

  // Initial fetch on component mount
  useEffect(() => {
    fetchTasksForTab(activeTab)
  }, [activeTab])

  const handleRefresh = () => {
    fetchTasksForTab(activeTab)
  }

  // Handle tab change
  const handleTabChange = (tab) => {
    console.log(`📂 Switching to tab: ${tab}`)
    setActiveTab(tab)

    if (isViewTaskModalOpen) {
      handleViewTaskModalClose()
    }
  }

  // Get the appropriate tasks based on active tab
  const getCurrentTasks = () => {
    switch (activeTab) {
      case "my-tasks":
        return tasks
      case "delegated-tasks":
        return delegatedTasks
      case "all-tasks":
        return allTasks
      default:
        return []
    }
  }

  const currentTasks = getCurrentTasks()

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Task Management</h1>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={() => setIsAssignTaskModalOpen(true)} variant="green" className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            Assign Task
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <div className="border-b">
          <nav className="flex space-x-8">
            {["my-tasks", "delegated-tasks", "all-tasks"].map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
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

      {/* PRESERVED ID DEBUG - Shows exact ID values are maintained */}
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-sm">
        <strong>🔧 ID PRESERVATION - Exact Values Maintained as Strings:</strong>
        <br />
        Active Tab: <span className="font-mono bg-white px-1 rounded">{activeTab}</span>
        <br />
        Tasks Count: <span className="font-mono bg-white px-1 rounded">{currentTasks.length}</span>
        <br />
        Modal Open: <span className="font-mono bg-white px-1 rounded">{isViewTaskModalOpen ? "✅ YES" : "❌ NO"}</span>
        <br />
        Selected ID: <span className="font-mono bg-white px-1 rounded">{selectedTaskId || "None"}</span>
        <br />
        API Loading: <span className="font-mono bg-white px-1 rounded">{viewTaskLoading ? "🔄 YES" : "❌ NO"}</span>
        <br />
        API Error: <span className="font-mono bg-white px-1 rounded">{viewError || "None"}</span>
        <br />
        <br />
        <strong>📋 FIRST TASK - ID PRESERVATION CHECK:</strong>
        <br />
        {currentTasks.length > 0 && (
          <>
            task._id: <span className="font-mono bg-white px-1 rounded">"{currentTasks[0]._id}"</span>
            <br />
            _id Type: <span className="font-mono bg-white px-1 rounded">{typeof currentTasks[0]._id}</span>
            <br />
            Is String:{" "}
            <span className="font-mono bg-white px-1 rounded">
              {typeof currentTasks[0]._id === "string" ? "✅ YES" : "❌ NO"}
            </span>
            <br />
            ID Length: <span className="font-mono bg-white px-1 rounded">{currentTasks[0]._id?.length || "N/A"}</span>
            <br />
            Is ObjectId Format:{" "}
            <span className="font-mono bg-white px-1 rounded">
              {currentTasks[0]._id && /^[0-9a-fA-F]{24}$/.test(currentTasks[0]._id) ? "✅ YES" : "❌ NO"}
            </span>
            <br />
            Original Fields:{" "}
            <span className="font-mono bg-white px-1 rounded text-xs">
              {Object.keys(currentTasks[0])
                .filter((k) => k.includes("id") || k.includes("Id") || k.includes("ID"))
                .join(", ")}
            </span>
            <br />
            Will Call API:{" "}
            <span className="font-mono bg-white px-1 rounded">
              {extractTaskId(currentTasks[0]) ? "✅ YES" : "❌ NO"}
            </span>
            <br />
            Expected API:{" "}
            <span className="font-mono bg-white px-1 rounded">
              {extractTaskId(currentTasks[0]) ? `task/view-task/${extractTaskId(currentTasks[0])}` : "❌ No API"}
            </span>
            <br />
            <details className="mt-2">
              <summary className="cursor-pointer font-medium">📋 ID Fields in Task Object</summary>
              <pre className="text-xs bg-white p-2 rounded mt-1 overflow-auto max-h-40">
                {JSON.stringify(
                  Object.fromEntries(
                    Object.entries(currentTasks[0]).filter(
                      ([key]) => key.toLowerCase().includes("id") || key.includes("Id") || key.includes("ID"),
                    ),
                  ),
                  null,
                  2,
                )}
              </pre>
            </details>
          </>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
          <div className="flex items-start">
            <div className="flex-1">
              <h3 className="font-medium">Error loading {activeTab.replace("-", " ")}</h3>
              <p className="text-sm mt-1">
                {error.response?.data?.message || error.message || "Unknown error occurred"}
              </p>
              <Button onClick={handleRefresh} variant="outline" size="sm" className="mt-2" disabled={loading}>
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
              : activeTab === "delegated-tasks"
                ? "delegated tasks"
                : "all tasks"}
            ...
          </p>
        </div>
      ) : currentTasks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentTasks.map((task, index) => {
            const taskId = extractTaskId(task)
            return (
              <TaskCard
                key={taskId || `task-${index}`}
                task={task}
                onClick={() => {
                  console.log("🎯 ===== TASK CARD CLICK - NORMALIZED task._id =====")
                  console.log("🎯 Tab:", activeTab)
                  console.log("🎯 task._id:", task._id, "Type:", typeof task._id)
                  console.log("🎯 Is String:", typeof task._id === "string")
                  console.log("🎯 Extracted ID:", taskId)
                  console.log("🎯 Will call API:", taskId ? "✅ YES" : "❌ NO")
                  handleTaskClick(task, index)
                }}
              />
            )
          })}
        </div>
      ) : (
        <EmptyState
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          }
          title={`No ${
            activeTab === "my-tasks" ? "Tasks" : activeTab === "delegated-tasks" ? "Delegated Tasks" : "Tasks"
          } Found`}
          description={
            activeTab === "my-tasks"
              ? "You don't have any tasks assigned to you."
              : activeTab === "delegated-tasks"
                ? "You haven't delegated any tasks yet."
                : "There are no tasks in the system."
          }
          className="py-16"
        />
      )}

      {/* Modals */}
      <AssignTaskModal
        isOpen={isAssignTaskModalOpen}
        onClose={() => setIsAssignTaskModalOpen(false)}
        task={null}
        onSuccess={() => {
          setIsAssignTaskModalOpen(false)
          fetchTasksForTab(activeTab)
        }}
      />

      <ViewTaskModal
        isOpen={isViewTaskModalOpen}
        onClose={handleViewTaskModalClose}
        task={selectedTaskData}
        loading={viewTaskLoading}
        error={viewError}
      />
    </div>
  )
}

export default TaskManagement
