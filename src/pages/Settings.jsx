"use client"

import { useState } from "react"
import { ChevronRight } from "lucide-react"
import MainLayout from "../layouts/MainLayout"
import WhatsAppConnectionModal from "../components/WhatsAppConnectionModal"
import NotificationsModal from "../components/NotificationsModal"
import ExportTasksModal from "../components/ExportTasksModal"
import RolePermissionsModal from "../components/RolePermissionsModal"

const Settings = () => {
  const [companyName, setCompanyName] = useState("Jasmine")
  const [industry, setIndustry] = useState("Real Estate/")
  const [companySize, setCompanySize] = useState("51 & Above")

  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false)
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false)
  const [isExportTasksModalOpen, setIsExportTasksModalOpen] = useState(false)
  const [isRolePermissionsModalOpen, setIsRolePermissionsModalOpen] = useState(false)

  const handleUpdate = () => {
    // TODO: Replace with real API call
    console.log("Updating company settings:", { companyName, industry, companySize })
  }

  return (
    <MainLayout>
      <div className="p-6">
        <div className="mb-8 flex items-center gap-4">
          <div className="flex-1">
            <div className="mb-4 flex items-center gap-4">
              <div>
                <label className="block text-gray-400 mb-1">Company Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Industry</label>
                <div className="relative">
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="appearance-none w-full bg-gray-700 border border-gray-600 rounded p-2 pr-8 text-white"
                  >
                    <option value="Real Estate/">Real Estate/</option>
                    <option value="Technology">Technology</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Finance">Finance</option>
                    <option value="Education">Education</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <ChevronRight className="h-4 w-4 text-gray-400 transform rotate-90" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Company Size</label>
                <div className="relative">
                  <select
                    value={companySize}
                    onChange={(e) => setCompanySize(e.target.value)}
                    className="appearance-none w-full bg-gray-700 border border-gray-600 rounded p-2 pr-8 text-white"
                  >
                    <option value="1-10">1-10</option>
                    <option value="11-50">11-50</option>
                    <option value="51 & Above">51 & Above</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <ChevronRight className="h-4 w-4 text-gray-400 transform rotate-90" />
                  </div>
                </div>
              </div>

              <button
                onClick={handleUpdate}
                className="mt-6 bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded transition-colors"
              >
                Update
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-white font-medium mb-4">WhatsApp Integration</h3>
            <div
              className="flex justify-between items-center p-4 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-650"
              onClick={() => setIsWhatsAppModalOpen(true)}
            >
              <span className="text-white">Connect your WABA Number</span>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-white font-medium mb-4">Task App Settings</h3>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <div
              className="flex justify-between items-center p-4 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-650"
              onClick={() => setIsNotificationsModalOpen(true)}
            >
              <span className="text-white">Notifications & Reminders</span>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <div
              className="flex justify-between items-center p-4 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-650"
              onClick={() => setIsExportTasksModalOpen(true)}
            >
              <span className="text-white">Export Tasks</span>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex justify-between items-center p-4 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-650">
              <span className="text-white">Import Tasks</span>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <div
              className="flex justify-between items-center p-4 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-650"
              onClick={() => setIsRolePermissionsModalOpen(true)}
            >
              <span className="text-white">Role and Permission</span>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {isWhatsAppModalOpen && (
        <WhatsAppConnectionModal isOpen={isWhatsAppModalOpen} onClose={() => setIsWhatsAppModalOpen(false)} />
      )}

      {isNotificationsModalOpen && (
        <NotificationsModal isOpen={isNotificationsModalOpen} onClose={() => setIsNotificationsModalOpen(false)} />
      )}

      {isExportTasksModalOpen && (
        <ExportTasksModal isOpen={isExportTasksModalOpen} onClose={() => setIsExportTasksModalOpen(false)} />
      )}

      {isRolePermissionsModalOpen && (
        <RolePermissionsModal
          isOpen={isRolePermissionsModalOpen}
          onClose={() => setIsRolePermissionsModalOpen(false)}
        />
      )}
    </MainLayout>
  )
}

export default Settings
