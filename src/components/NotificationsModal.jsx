"use client"

import { useState } from "react"
import { X } from "lucide-react"
import ChevronRight from "./icons/ChevronRight"
import Clock from "./icons/Clock"

const NotificationsModal = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState({
    whatsapp: true,
    email: true,
    timezone: "Select Timezone...",
    dailyReminder: "",
    whatsappReminders: false,
    emailReminders: false,
    dailyTaskReport: false,
    weeklyOffs: {
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false,
    },
  })

  const handleToggle = (field) => {
    setNotifications((prev) => ({
      ...prev,
      [field]: !prev[field],
    }))
  }

  const handleWeeklyOffToggle = (day) => {
    setNotifications((prev) => ({
      ...prev,
      weeklyOffs: {
        ...prev.weeklyOffs,
        [day]: !prev.weeklyOffs[day],
      },
    }))
  }

  const handleSave = () => {
    // TODO: Replace with real API call
    console.log("Saving notification settings:", notifications)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg w-full max-w-lg">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Notifications</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-white">Whatsapp Notifications</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.whatsapp}
                  onChange={() => handleToggle("whatsapp")}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-white">Email Notifications</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.email}
                  onChange={() => handleToggle("email")}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
              </label>
            </div>

            <div>
              <label className="block text-white mb-2">Timezone</label>
              <div className="relative">
                <select
                  value={notifications.timezone}
                  onChange={(e) => setNotifications({ ...notifications, timezone: e.target.value })}
                  className="appearance-none w-full bg-gray-700 border border-gray-600 rounded p-2 pr-8 text-white"
                >
                  <option>Select Timezone...</option>
                  <option value="Asia/Kolkata">(GMT+5:30) India Standard Time</option>
                  <option value="America/New_York">(GMT-4:00) Eastern Time</option>
                  <option value="America/Los_Angeles">(GMT-7:00) Pacific Time</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <ChevronRight className="h-4 w-4 text-gray-400 transform rotate-90" />
                </div>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-white pt-4">Reminders</h3>

            <div>
              <label className="block text-white mb-2">Daily Reminder Time</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Please select time"
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2 pl-10 text-white"
                  value={notifications.dailyReminder}
                  onChange={(e) => setNotifications({ ...notifications, dailyReminder: e.target.value })}
                />
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-white">Whatsapp Reminders</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.whatsappReminders}
                  onChange={() => handleToggle("whatsappReminders")}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-white">Email Reminders</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.emailReminders}
                  onChange={() => handleToggle("emailReminders")}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-white">Daily Task Report</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.dailyTaskReport}
                  onChange={() => handleToggle("dailyTaskReport")}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
              </label>
            </div>

            <div>
              <h3 className="text-white mb-2">
                Weekly Offs <span className="text-sm text-gray-400">Select non-working days</span>
              </h3>
              <div className="flex justify-between">
                {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <input
                      type="checkbox"
                      id={`day-${index}`}
                      className="hidden"
                      checked={Object.values(notifications.weeklyOffs)[index]}
                      onChange={() => handleWeeklyOffToggle(Object.keys(notifications.weeklyOffs)[index])}
                    />
                    <label
                      htmlFor={`day-${index}`}
                      className={`w-8 h-8 flex items-center justify-center rounded-md cursor-pointer ${
                        Object.values(notifications.weeklyOffs)[index]
                          ? "bg-green-500 text-white"
                          : "bg-gray-700 text-white"
                      }`}
                    >
                      {day}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleSave}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotificationsModal
