"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Calendar, Plus } from "lucide-react"
import MainLayout from "../layouts/MainLayout"
import { Button } from "../components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs"
import EmptyState from "../components/EmptyState"
import EventModal from "../components/EventModal"

const Events = () => {
  const [activeTab, setActiveTab] = useState("upcoming")
  const [isEventModalOpen, setIsEventModalOpen] = useState(false)

  // Dummy data for events (empty for now)
  const [events, setEvents] = useState([])

  // Handle tab change
  const handleTabChange = (value) => {
    setActiveTab(value)
  }

  // Handle create event
  const handleCreateEvent = () => {
    setIsEventModalOpen(true)
  }

  // Handle save event
  const handleSaveEvent = (eventData) => {
    // TODO: Implement API call to save event
    console.log("Save event:", eventData)

    // For now, just add to local state
    setEvents([...events, { id: Date.now(), ...eventData }])
    setIsEventModalOpen(false)
  }

  return (
    <MainLayout>
      <div className="p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-white">Events</h1>
          <Button onClick={handleCreateEvent} className="gap-1 bg-green-500 hover:bg-green-600 text-white">
            <Plus size={16} />
            <span>Holiday</span>
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-6">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full max-w-md">
            <TabsList className="grid grid-cols-3 bg-gray-800">
              <TabsTrigger value="upcoming" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
                Upcoming
              </TabsTrigger>
              <TabsTrigger value="past" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
                Past
              </TabsTrigger>
              <TabsTrigger value="all" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
                All
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Content */}
        <div className="mt-8">
          {events.length === 0 ? (
            <EmptyState
              icon={<Calendar size={48} className="text-green-500" />}
              title="No Events Found"
              description=""
              className="py-16"
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-800 rounded-lg p-4 border border-gray-700"
                >
                  <h3 className="text-lg font-medium text-white">{event.title}</h3>
                  <p className="text-sm text-gray-400 mt-1">{event.date}</p>
                  <p className="text-sm text-gray-300 mt-2">{event.description}</p>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Event Modal */}
        <EventModal isOpen={isEventModalOpen} onClose={() => setIsEventModalOpen(false)} onSave={handleSaveEvent} />
      </div>
    </MainLayout>
  )
}

export default Events
