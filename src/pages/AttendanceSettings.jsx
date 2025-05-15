"use client"

import { useState } from "react"
import { useDispatch } from "react-redux"
import { motion } from "framer-motion"
import { ChevronRight, MapPin } from "lucide-react"
import MainLayout from "../layouts/MainLayout"
import { Button } from "../components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog"

const AttendanceSettings = () => {
  const dispatch = useDispatch()
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false)
  const [location, setLocation] = useState({ lat: 37.7749, lng: -122.4194 }) // Default to San Francisco

  // Settings sections
  const settingsSections = [
    {
      title: "Leave Types",
      description: "Configure leave types for your organization",
      onClick: () => console.log("Navigate to Leave Types"),
    },
    {
      title: "Attendance Settings",
      description: "Configure attendance rules and policies",
      onClick: () => console.log("Navigate to Attendance Settings"),
    },
    {
      title: "Register Faces",
      description: "Set up face recognition for attendance",
      onClick: () => console.log("Navigate to Register Faces"),
    },
    {
      title: "Reminders",
      description: "Configure attendance reminders",
      onClick: () => console.log("Navigate to Reminders"),
    },
  ]

  const officeSettings = [
    {
      title: "Login-Logout time",
      description: "Set office hours and attendance rules",
      onClick: () => console.log("Navigate to Login-Logout time"),
    },
    {
      title: "Office Location",
      description: "Set your office location for geo-fencing",
      onClick: () => setIsLocationModalOpen(true),
    },
  ]

  // Handle save location
  const handleSaveLocation = () => {
    // TODO: Implement save location
    console.log("Save location:", location)
    setIsLocationModalOpen(false)
  }

  const SettingsCard = ({ title, description, onClick }) => (
    <motion.div
      whileHover={{ y: -2, backgroundColor: "rgba(255,255,255,0.03)" }}
      className="bg-gray-800 rounded-lg p-4 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-white">{title}</h3>
          <p className="text-sm text-gray-400">{description}</p>
        </div>
        <ChevronRight className="text-gray-400" />
      </div>
    </motion.div>
  )

  return (
    <MainLayout>
      <div className="p-4 md:p-6">
        <h1 className="text-2xl font-bold text-white mb-6">Attendance Settings</h1>

        {/* General Settings */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">General Settings</h2>
          <div className="grid gap-4">
            {settingsSections.map((section) => (
              <SettingsCard
                key={section.title}
                title={section.title}
                description={section.description}
                onClick={section.onClick}
              />
            ))}
          </div>
        </div>

        {/* Office Settings */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Office Settings</h2>
          <div className="grid gap-4">
            {officeSettings.map((section) => (
              <SettingsCard
                key={section.title}
                title={section.title}
                description={section.description}
                onClick={section.onClick}
              />
            ))}
          </div>
        </div>

        {/* Office Location Modal */}
        <Dialog open={isLocationModalOpen} onOpenChange={setIsLocationModalOpen}>
          <DialogContent className="sm:max-w-[600px] bg-gray-900 text-white">
            <DialogHeader>
              <DialogTitle>Office Location</DialogTitle>
            </DialogHeader>
            <div className="h-[400px] bg-blue-200 rounded-md relative">
              {/* This would be a Google Map in a real implementation */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <MapPin size={32} className="text-red-500 mx-auto" />
                  <p className="text-gray-800 mt-2">Map would be displayed here</p>
                  <p className="text-gray-600 text-sm">Using Google Maps API</p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSaveLocation} className="bg-green-500 hover:bg-green-600 text-white">
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  )
}

export default AttendanceSettings
