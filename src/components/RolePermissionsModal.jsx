"use client"

import { useState } from "react"
import { ChevronLeft, Check } from "lucide-react"

const RolePermissionsModal = ({ isOpen, onClose }) => {
  const [permissions, setPermissions] = useState({
    intranet: {
      admin: {
        add: true,
        edit: true,
        view: true,
        delete: true,
      },
      manager: {
        add: true,
        edit: true,
        view: true,
        delete: true,
      },
      teamMember: {
        add: true,
        edit: true,
        view: true,
        delete: true,
      },
    },
    myTeam: {
      admin: {
        add: true,
        edit: true,
        view: true,
        delete: true,
      },
      manager: {
        add: false,
        edit: "myTeam",
        view: "all",
        delete: "none",
      },
      teamMember: {
        add: false,
        edit: "none",
        view: "all",
        delete: "none",
      },
    },
    task: {
      admin: {
        create: true,
        edit: "all",
        view: "all",
      },
      manager: {
        create: true,
        edit: "myTeamPlusAssigned",
        view: "all",
      },
      teamMember: {
        create: true,
        edit: "assigned",
        view: "all",
      },
    },
  })

  const handleTogglePermission = (module, role, action) => {
    setPermissions((prev) => ({
      ...prev,
      [module]: {
        ...prev[module],
        [role]: {
          ...prev[module][role],
          [action]:
            typeof prev[module][role][action] === "boolean" ? !prev[module][role][action] : prev[module][role][action],
        },
      },
    }))
  }

  const handleSelectChange = (module, role, action, value) => {
    setPermissions((prev) => ({
      ...prev,
      [module]: {
        ...prev[module],
        [role]: {
          ...prev[module][role],
          [action]: value,
        },
      },
    }))
  }

  const handleSave = () => {
    // TODO: Replace with real API call
    console.log("Saving permissions:", permissions)
    onClose()
  }

  const handleReset = () => {
    // Reset to default permissions
    // This is just a placeholder, you would define your default permissions
    console.log("Resetting permissions")
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg w-full max-w-6xl max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <div className="flex items-center">
            <button className="mr-2 text-gray-400 hover:text-white">
              <ChevronLeft size={20} />
            </button>
            <h2 className="text-xl font-semibold text-white">Role and Permission</h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleReset}
              className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded transition-colors"
            >
              Reset
            </button>
            <button
              onClick={handleSave}
              className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded transition-colors"
            >
              Save
            </button>
          </div>
        </div>

        <div className="p-4">
          {/* Intranet Module */}
          <div className="mb-8">
            <div className="bg-green-500 text-white p-2 rounded-t-md grid grid-cols-4">
              <div className="font-medium">Intranet</div>
              <div className="font-medium text-center">Admin</div>
              <div className="font-medium text-center">Manager</div>
              <div className="font-medium text-center">Team Member</div>
            </div>

            {["add", "edit", "view", "delete"].map((action) => (
              <div key={action} className="grid grid-cols-4 border-b border-gray-700 py-3">
                <div className="text-white capitalize">{action}</div>
                <div className="flex justify-center">
                  <div
                    className={`w-6 h-6 rounded-md flex items-center justify-center cursor-pointer ${
                      permissions.intranet.admin[action] ? "bg-green-500" : "bg-gray-700"
                    }`}
                    onClick={() => handleTogglePermission("intranet", "admin", action)}
                  >
                    {permissions.intranet.admin[action] && <Check size={16} className="text-white" />}
                  </div>
                </div>
                <div className="flex justify-center">
                  <div
                    className={`w-6 h-6 rounded-md flex items-center justify-center cursor-pointer ${
                      permissions.intranet.manager[action] ? "bg-green-500" : "bg-gray-700"
                    }`}
                    onClick={() => handleTogglePermission("intranet", "manager", action)}
                  >
                    {permissions.intranet.manager[action] && <Check size={16} className="text-white" />}
                  </div>
                </div>
                <div className="flex justify-center">
                  <div
                    className={`w-6 h-6 rounded-md flex items-center justify-center cursor-pointer ${
                      permissions.intranet.teamMember[action] ? "bg-green-500" : "bg-gray-700"
                    }`}
                    onClick={() => handleTogglePermission("intranet", "teamMember", action)}
                  >
                    {permissions.intranet.teamMember[action] && <Check size={16} className="text-white" />}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* My Team Module */}
          <div className="mb-8">
            <div className="bg-green-500 text-white p-2 rounded-t-md grid grid-cols-4">
              <div className="font-medium">My Team</div>
              <div className="font-medium text-center">Admin</div>
              <div className="font-medium text-center">Manager</div>
              <div className="font-medium text-center">Team Member</div>
            </div>

            {/* Add permission */}
            <div className="grid grid-cols-4 border-b border-gray-700 py-3">
              <div className="text-white">Add</div>
              <div className="flex justify-center">
                <div
                  className={`w-6 h-6 rounded-md flex items-center justify-center cursor-pointer ${
                    permissions.myTeam.admin.add ? "bg-green-500" : "bg-gray-700"
                  }`}
                  onClick={() => handleTogglePermission("myTeam", "admin", "add")}
                >
                  {permissions.myTeam.admin.add && <Check size={16} className="text-white" />}
                </div>
              </div>
              <div className="flex justify-center">
                <div
                  className={`w-6 h-6 rounded-md flex items-center justify-center cursor-pointer ${
                    permissions.myTeam.manager.add ? "bg-green-500" : "bg-gray-700"
                  }`}
                  onClick={() => handleTogglePermission("myTeam", "manager", "add")}
                >
                  {permissions.myTeam.manager.add && <Check size={16} className="text-white" />}
                </div>
              </div>
              <div className="flex justify-center">
                <div
                  className={`w-6 h-6 rounded-md flex items-center justify-center cursor-pointer ${
                    permissions.myTeam.teamMember.add ? "bg-green-500" : "bg-gray-700"
                  }`}
                  onClick={() => handleTogglePermission("myTeam", "teamMember", "add")}
                >
                  {permissions.myTeam.teamMember.add && <Check size={16} className="text-white" />}
                </div>
              </div>
            </div>

            {/* Edit permission */}
            <div className="grid grid-cols-4 border-b border-gray-700 py-3">
              <div className="text-white">Edit</div>
              <div className="flex justify-center">
                <div
                  className={`w-6 h-6 rounded-md flex items-center justify-center cursor-pointer ${
                    permissions.myTeam.admin.edit === true ? "bg-green-500" : "bg-gray-700"
                  }`}
                  onClick={() => handleTogglePermission("myTeam", "admin", "edit")}
                >
                  {permissions.myTeam.admin.edit === true && <Check size={16} className="text-white" />}
                </div>
              </div>
              <div className="flex justify-center">
                <select
                  value={permissions.myTeam.manager.edit}
                  onChange={(e) => handleSelectChange("myTeam", "manager", "edit", e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded text-white text-sm p-1"
                >
                  <option value="all">All</option>
                  <option value="myTeam">My Team</option>
                  <option value="none">None</option>
                </select>
              </div>
              <div className="flex justify-center">
                <select
                  value={permissions.myTeam.teamMember.edit}
                  onChange={(e) => handleSelectChange("myTeam", "teamMember", "edit", e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded text-white text-sm p-1"
                >
                  <option value="all">All</option>
                  <option value="myTeam">My Team</option>
                  <option value="none">None</option>
                </select>
              </div>
            </div>

            {/* View and Delete permissions would follow the same pattern */}
            {/* ... */}
          </div>

          {/* Task Module */}
          <div className="mb-8">
            <div className="bg-green-500 text-white p-2 rounded-t-md grid grid-cols-4">
              <div className="font-medium">Task</div>
              <div className="font-medium text-center">Admin</div>
              <div className="font-medium text-center">Manager</div>
              <div className="font-medium text-center">Team Member</div>
            </div>

            {/* Create permission */}
            <div className="grid grid-cols-4 border-b border-gray-700 py-3">
              <div className="text-white">Create</div>
              <div className="flex justify-center">
                <div
                  className={`w-6 h-6 rounded-md flex items-center justify-center cursor-pointer ${
                    permissions.task.admin.create ? "bg-green-500" : "bg-gray-700"
                  }`}
                  onClick={() => handleTogglePermission("task", "admin", "create")}
                >
                  {permissions.task.admin.create && <Check size={16} className="text-white" />}
                </div>
              </div>
              <div className="flex justify-center">
                <div
                  className={`w-6 h-6 rounded-md flex items-center justify-center cursor-pointer ${
                    permissions.task.manager.create ? "bg-green-500" : "bg-gray-700"
                  }`}
                  onClick={() => handleTogglePermission("task", "manager", "create")}
                >
                  {permissions.task.manager.create && <Check size={16} className="text-white" />}
                </div>
              </div>
              <div className="flex justify-center">
                <div
                  className={`w-6 h-6 rounded-md flex items-center justify-center cursor-pointer ${
                    permissions.task.teamMember.create ? "bg-green-500" : "bg-gray-700"
                  }`}
                  onClick={() => handleTogglePermission("task", "teamMember", "create")}
                >
                  {permissions.task.teamMember.create && <Check size={16} className="text-white" />}
                </div>
              </div>
            </div>

            {/* Edit permission */}
            <div className="grid grid-cols-4 border-b border-gray-700 py-3">
              <div className="text-white">Edit</div>
              <div className="flex justify-center">
                <select
                  value={permissions.task.admin.edit}
                  onChange={(e) => handleSelectChange("task", "admin", "edit", e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded text-white text-sm p-1"
                >
                  <option value="all">All</option>
                  <option value="myTeam">My Team</option>
                  <option value="assigned">Assigned</option>
                </select>
              </div>
              <div className="flex justify-center">
                <select
                  value={permissions.task.manager.edit}
                  onChange={(e) => handleSelectChange("task", "manager", "edit", e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded text-white text-sm p-1"
                >
                  <option value="all">All</option>
                  <option value="myTeamPlusAssigned">My Team + Assigned</option>
                  <option value="assigned">Assigned</option>
                </select>
              </div>
              <div className="flex justify-center">
                <select
                  value={permissions.task.teamMember.edit}
                  onChange={(e) => handleSelectChange("task", "teamMember", "edit", e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded text-white text-sm p-1"
                >
                  <option value="all">All</option>
                  <option value="myTeam">My Team</option>
                  <option value="assigned">Assigned</option>
                </select>
              </div>
            </div>

            {/* View permission */}
            <div className="grid grid-cols-4 border-b border-gray-700 py-3">
              <div className="text-white">View</div>
              <div className="flex justify-center">
                <select
                  value={permissions.task.admin.view}
                  onChange={(e) => handleSelectChange("task", "admin", "view", e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded text-white text-sm p-1"
                >
                  <option value="all">All</option>
                  <option value="myTeam">My Team</option>
                  <option value="assigned">Assigned</option>
                </select>
              </div>
              <div className="flex justify-center">
                <select
                  value={permissions.task.manager.view}
                  onChange={(e) => handleSelectChange("task", "manager", "view", e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded text-white text-sm p-1"
                >
                  <option value="all">All</option>
                  <option value="myTeam">My Team</option>
                  <option value="assigned">Assigned</option>
                </select>
              </div>
              <div className="flex justify-center">
                <select
                  value={permissions.task.teamMember.view}
                  onChange={(e) => handleSelectChange("task", "teamMember", "view", e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded text-white text-sm p-1"
                >
                  <option value="all">All</option>
                  <option value="myTeam">My Team</option>
                  <option value="assigned">Assigned</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RolePermissionsModal
