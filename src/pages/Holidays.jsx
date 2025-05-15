"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Plus, Edit, Trash2 } from "lucide-react"
import MainLayout from "../layouts/MainLayout"
import { Button } from "../components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Calendar } from "./ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "../utils/helpers"
import EmptyState from "../components/EmptyState"

const Holidays = () => {
  const [holidays, setHolidays] = useState([])
  const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [holidayName, setHolidayName] = useState("")
  const [editingHolidayId, setEditingHolidayId] = useState(null)

  // Handle add holiday
  const handleAddHoliday = () => {
    setHolidayName("")
    setSelectedDate(new Date())
    setEditingHolidayId(null)
    setIsHolidayModalOpen(true)
  }

  // Handle edit holiday
  const handleEditHoliday = (holiday) => {
    setHolidayName(holiday.name)
    setSelectedDate(new Date(holiday.date))
    setEditingHolidayId(holiday.id)
    setIsHolidayModalOpen(true)
  }

  // Handle delete holiday
  const handleDeleteHoliday = (id) => {
    setHolidays(holidays.filter((holiday) => holiday.id !== id))
  }

  // Handle save holiday
  const handleSaveHoliday = () => {
    if (!holidayName.trim()) return

    if (editingHolidayId) {
      // Update existing holiday
      setHolidays(
        holidays.map((holiday) =>
          holiday.id === editingHolidayId ? { ...holiday, name: holidayName, date: selectedDate } : holiday,
        ),
      )
    } else {
      // Add new holiday
      const newHoliday = {
        id: Date.now(),
        name: holidayName,
        date: selectedDate,
      }
      setHolidays([...holidays, newHoliday])
    }

    setIsHolidayModalOpen(false)
  }

  return (
    <MainLayout>
      <div className="p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-white">Holidays</h1>
          <Button onClick={handleAddHoliday} className="gap-1 bg-green-500 hover:bg-green-600 text-white">
            <Plus size={16} />
            <span>Holiday</span>
          </Button>
        </div>

        {holidays.length === 0 ? (
          <EmptyState
            icon={<Calendar size={48} className="text-green-500" />}
            title="No Holidays Added"
            description="Add company holidays to manage employee leave and attendance"
            className="py-16"
          />
        ) : (
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-700">
              <thead>
                <tr className="bg-gray-900">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Holiday
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {holidays.map((holiday, index) => (
                  <motion.tr
                    key={holiday.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="hover:bg-gray-700"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{holiday.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {format(new Date(holiday.date), "MMMM d, yyyy")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditHoliday(holiday)}
                        className="text-gray-400 hover:text-white"
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteHoliday(holiday.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Holiday Modal */}
        <Dialog open={isHolidayModalOpen} onOpenChange={setIsHolidayModalOpen}>
          <DialogContent className="sm:max-w-[425px] bg-gray-900 text-white">
            <DialogHeader>
              <DialogTitle>{editingHolidayId ? "Edit Holiday" : "Add Holiday"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="holiday-name">Holiday Name</Label>
                <Input
                  id="holiday-name"
                  value={holidayName}
                  onChange={(e) => setHolidayName(e.target.value)}
                  placeholder="Enter holiday name"
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal bg-gray-800 border-gray-700 text-white",
                        !selectedDate && "text-gray-400",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      initialFocus
                      className="bg-gray-800 text-white"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsHolidayModalOpen(false)}
                className="border-gray-700 text-white"
              >
                Cancel
              </Button>
              <Button onClick={handleSaveHoliday} className="bg-green-500 hover:bg-green-600 text-white">
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  )
}

export default Holidays
