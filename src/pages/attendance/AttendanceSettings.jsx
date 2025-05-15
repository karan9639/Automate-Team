"use client"

import { useState } from "react"
import { Save, Clock, MapPin, Camera, Bell } from "lucide-react"

const AttendanceSettings = () => {
  // Office timing settings
  const [officeTimings, setOfficeTimings] = useState({
    startTime: "09:00",
    endTime: "18:00",
    graceTime: 15,
    workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  })

  // Location settings
  const [locationSettings, setLocationSettings] = useState({
    trackLocation: true,
    officeLocation: "123 Business Park, Main Street",
    radius: 100,
  })

  // Face recognition settings
  const [faceRecognition, setFaceRecognition] = useState({
    enabled: true,
    requiredForLogin: true,
    requiredForLogout: false,
  })

  // Reminder settings
  const [reminderSettings, setReminderSettings] = useState({
    loginReminder: true,
    logoutReminder: true,
    reminderTime: 15,
  })

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault()
    // In a real application, we would save these settings to the backend
    alert("Settings saved successfully!")
  }

  // Handle working days change
  const handleWorkingDayChange = (day) => {
    if (officeTimings.workingDays.includes(day)) {
      setOfficeTimings({
        ...officeTimings,
        workingDays: officeTimings.workingDays.filter((d) => d !== day),
      })
    } else {
      setOfficeTimings({
        ...officeTimings,
        workingDays: [...officeTimings.workingDays, day],
      })
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Attendance Settings</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Office Timings Section */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 bg-gray-50 border-b flex items-center">
            <Clock className="h-5 w-5 text-gray-500 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">Office Timings</h2>
          </div>
          <div className="p-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
                Start Time
              </label>
              <input
                type="time"
                id="startTime"
                value={officeTimings.startTime}
                onChange={(e) => setOfficeTimings({ ...officeTimings, startTime: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
                End Time
              </label>
              <input
                type="time"
                id="endTime"
                value={officeTimings.endTime}
                onChange={(e) => setOfficeTimings({ ...officeTimings, endTime: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="graceTime" className="block text-sm font-medium text-gray-700">
                Grace Period (minutes)
              </label>
              <input
                type="number"
                id="graceTime"
                min="0"
                max="60"
                value={officeTimings.graceTime}
                onChange={(e) => setOfficeTimings({ ...officeTimings, graceTime: Number.parseInt(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Working Days</label>
              <div className="flex flex-wrap gap-2">
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleWorkingDayChange(day)}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      officeTimings.workingDays.includes(day)
                        ? "bg-blue-100 text-blue-800 border border-blue-300"
                        : "bg-gray-100 text-gray-800 border border-gray-300"
                    }`}
                  >
                    {day.substring(0, 3)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Location Settings */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 bg-gray-50 border-b flex items-center">
            <MapPin className="h-5 w-5 text-gray-500 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">Location Settings</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Track Location</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={locationSettings.trackLocation}
                  onChange={() =>
                    setLocationSettings({ ...locationSettings, trackLocation: !locationSettings.trackLocation })
                  }
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div>
              <label htmlFor="officeLocation" className="block text-sm font-medium text-gray-700">
                Office Location
              </label>
              <input
                type="text"
                id="officeLocation"
                value={locationSettings.officeLocation}
                onChange={(e) => setLocationSettings({ ...locationSettings, officeLocation: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="radius" className="block text-sm font-medium text-gray-700">
                Allowed Radius (meters)
              </label>
              <input
                type="number"
                id="radius"
                min="10"
                max="1000"
                value={locationSettings.radius}
                onChange={(e) => setLocationSettings({ ...locationSettings, radius: Number.parseInt(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>
        </div>

        {/* Face Recognition Settings */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 bg-gray-50 border-b flex items-center">
            <Camera className="h-5 w-5 text-gray-500 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">Face Recognition</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Enable Face Recognition</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={faceRecognition.enabled}
                  onChange={() => setFaceRecognition({ ...faceRecognition, enabled: !faceRecognition.enabled })}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Required for Login</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={faceRecognition.requiredForLogin}
                  onChange={() =>
                    setFaceRecognition({ ...faceRecognition, requiredForLogin: !faceRecognition.requiredForLogin })
                  }
                  disabled={!faceRecognition.enabled}
                />
                <div
                  className={`w-11 h-6 ${
                    faceRecognition.enabled ? "bg-gray-200" : "bg-gray-100"
                  } peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600`}
                ></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Required for Logout</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={faceRecognition.requiredForLogout}
                  onChange={() =>
                    setFaceRecognition({ ...faceRecognition, requiredForLogout: !faceRecognition.requiredForLogout })
                  }
                  disabled={!faceRecognition.enabled}
                />
                <div
                  className={`w-11 h-6 ${
                    faceRecognition.enabled ? "bg-gray-200" : "bg-gray-100"
                  } peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600`}
                ></div>
              </label>
            </div>
          </div>
        </div>

        {/* Reminder Settings */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 bg-gray-50 border-b flex items-center">
            <Bell className="h-5 w-5 text-gray-500 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">Reminders</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Login Reminder</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={reminderSettings.loginReminder}
                  onChange={() =>
                    setReminderSettings({ ...reminderSettings, loginReminder: !reminderSettings.loginReminder })
                  }
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Logout Reminder</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={reminderSettings.logoutReminder}
                  onChange={() =>
                    setReminderSettings({ ...reminderSettings, logoutReminder: !reminderSettings.logoutReminder })
                  }
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div>
              <label htmlFor="reminderTime" className="block text-sm font-medium text-gray-700">
                Reminder Time (minutes before)
              </label>
              <input
                type="number"
                id="reminderTime"
                min="5"
                max="60"
                value={reminderSettings.reminderTime}
                onChange={(e) =>
                  setReminderSettings({ ...reminderSettings, reminderTime: Number.parseInt(e.target.value) })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                disabled={!reminderSettings.loginReminder && !reminderSettings.logoutReminder}
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </button>
        </div>
      </form>
    </div>
  )
}

export default AttendanceSettings
