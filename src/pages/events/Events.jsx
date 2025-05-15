"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Calendar, Plus, Clock, Users, MapPin, Search, Filter } from "lucide-react"

// Mock data for events
const eventsData = [
  {
    id: 1,
    title: "Team Building Workshop",
    description: "A workshop focused on team collaboration and problem-solving",
    date: "2023-07-15",
    time: "10:00 AM - 4:00 PM",
    location: "Conference Room A",
    organizer: "HR Department",
    attendees: 25,
    type: "Workshop",
  },
  {
    id: 2,
    title: "Product Launch Meeting",
    description: "Discussion about the upcoming product launch",
    date: "2023-07-20",
    time: "2:00 PM - 3:30 PM",
    location: "Main Conference Hall",
    organizer: "Marketing Team",
    attendees: 40,
    type: "Meeting",
  },
  {
    id: 3,
    title: "Monthly All Hands",
    description: "Monthly company-wide meeting to discuss updates and announcements",
    date: "2023-07-31",
    time: "9:00 AM - 10:00 AM",
    location: "Virtual (Zoom)",
    organizer: "Executive Team",
    attendees: 120,
    type: "Meeting",
  },
  {
    id: 4,
    title: "Customer Success Webinar",
    description: "Webinar to showcase successful customer implementations",
    date: "2023-08-05",
    time: "1:00 PM - 2:30 PM",
    location: "Virtual (Microsoft Teams)",
    organizer: "Customer Success Team",
    attendees: 80,
    type: "Webinar",
  },
  {
    id: 5,
    title: "Annual Company Picnic",
    description: "Annual get-together for employees and their families",
    date: "2023-08-12",
    time: "11:00 AM - 5:00 PM",
    location: "City Park",
    organizer: "Admin Team",
    attendees: 150,
    type: "Social",
  },
]

// Tab component
const Tab = ({ label, isActive, onClick }) => {
  return (
    <button
      className={`px-4 py-2 font-medium text-sm rounded-md ${
        isActive ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"
      }`}
      onClick={onClick}
    >
      {label}
    </button>
  )
}

// Event card component
const EventCard = ({ event }) => {
  const getEventTypeColor = (type) => {
    switch (type) {
      case "Workshop":
        return "bg-purple-100 text-purple-800"
      case "Meeting":
        return "bg-blue-100 text-blue-800"
      case "Webinar":
        return "bg-green-100 text-green-800"
      case "Social":
        return "bg-pink-100 text-pink-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{event.title}</h3>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEventTypeColor(event.type)}`}>
            {event.type}
          </span>
        </div>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>

        <div className="space-y-2">
          <div className="flex items-center text-gray-500 text-sm">
            <Calendar className="h-4 w-4 mr-2" />
            <span>{event.date}</span>
          </div>
          <div className="flex items-center text-gray-500 text-sm">
            <Clock className="h-4 w-4 mr-2" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-center text-gray-500 text-sm">
            <MapPin className="h-4 w-4 mr-2" />
            <span>{event.location}</span>
          </div>
          <div className="flex items-center text-gray-500 text-sm">
            <Users className="h-4 w-4 mr-2" />
            <span>{event.attendees} attendees</span>
          </div>
        </div>
      </div>

      <div className="border-t px-4 py-3 bg-gray-50 flex justify-between">
        <span className="text-sm text-gray-600">Organized by: {event.organizer}</span>
        <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">View Details</button>
      </div>
    </motion.div>
  )
}

// Empty state component
const EmptyState = () => {
  return (
    <div className="text-center py-12">
      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-1">No events found</h3>
      <p className="text-gray-500 mb-4">There are no events matching your criteria</p>
      <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
        <Plus className="h-4 w-4 mr-1" /> Create Event
      </button>
    </div>
  )
}

// Main component
const Events = () => {
  const [activeTab, setActiveTab] = useState("upcoming")
  const [searchTerm, setSearchTerm] = useState("")
  const [eventType, setEventType] = useState("All")

  // Filter events based on tab, search term, and event type
  const filteredEvents = eventsData.filter(
    (event) =>
      (activeTab === "upcoming" ? new Date(event.date) >= new Date() : true) &&
      (event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (eventType === "All" || event.type === eventType),
  )

  // Handle create event
  const handleCreateEvent = () => {
    alert("Open event creation form")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Events</h1>
        <button
          onClick={handleCreateEvent}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
        >
          <Plus className="h-4 w-4 mr-1" /> Create Event
        </button>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto space-x-2 mb-6">
        <Tab label="Upcoming Events" isActive={activeTab === "upcoming"} onClick={() => setActiveTab("upcoming")} />
        <Tab label="Past Events" isActive={activeTab === "past"} onClick={() => setActiveTab("past")} />
        <Tab label="My Events" isActive={activeTab === "my"} onClick={() => setActiveTab("my")} />
        <Tab label="Calendar View" isActive={activeTab === "calendar"} onClick={() => setActiveTab("calendar")} />
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <select
          value={eventType}
          onChange={(e) => setEventType(e.target.value)}
          className="block w-full md:w-40 pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="All">All Types</option>
          <option value="Workshop">Workshop</option>
          <option value="Meeting">Meeting</option>
          <option value="Webinar">Webinar</option>
          <option value="Social">Social</option>
        </select>

        <button className="md:w-40 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
          <Filter className="h-4 w-4" />
          <span>More Filters</span>
        </button>
      </div>

      {/* Events grid or empty state */}
      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          <EmptyState />
        </div>
      )}
    </div>
  )
}

export default Events
