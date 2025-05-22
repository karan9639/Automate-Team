"use client"

import { useState } from "react"
import { Dialog } from "../ui/Dialog"
import { Button } from "../ui/Button"
import { X, Upload, Mic } from "lucide-react"

const RaiseTicketModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    category: "",
    subCategory: "",
    subject: "",
    description: "",
    attachments: [],
  })

  // Mock data for categories and subcategories
  const categories = [
    { id: 1, name: "Authentication" },
    { id: 2, name: "Tasks" },
    { id: 3, name: "Billing" },
    { id: 4, name: "Technical" },
  ]

  const subCategories = {
    Authentication: ["Login", "Registration", "Password Reset"],
    Tasks: ["Creation", "Assignment", "Deletion"],
    Billing: ["Subscription", "Payment", "Invoice"],
    Technical: ["Error", "Performance", "Feature Request"],
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    setFormData((prev) => ({
      ...prev,
      attachments: [...prev.attachments, ...files],
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
    setFormData({
      category: "",
      subCategory: "",
      subject: "",
      description: "",
      attachments: [],
    })
  }

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Raise a Ticket</h2>
        <button onClick={onClose} className="text-white hover:text-gray-300">
          <X className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-4">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Sub Category</label>
          <select
            name="subCategory"
            value={formData.subCategory}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={!formData.category}
          >
            <option value="">Select Sub Category</option>
            {formData.category &&
              subCategories[formData.category]?.map((subCat, index) => (
                <option key={index} value={subCat}>
                  {subCat}
                </option>
              ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={5}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          ></textarea>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Upload Image/Videos showing your Issue</label>
          <div className="flex items-center gap-2">
            <label className="cursor-pointer">
              <div className="flex items-center justify-center w-10 h-10 bg-gray-200 rounded-md hover:bg-gray-300">
                <Upload className="h-5 w-5 text-gray-600" />
              </div>
              <input type="file" multiple onChange={handleFileChange} className="hidden" accept="image/*,video/*" />
            </label>
            <label className="cursor-pointer">
              <div className="flex items-center justify-center w-10 h-10 bg-gray-200 rounded-md hover:bg-gray-300">
                <Mic className="h-5 w-5 text-gray-600" />
              </div>
              <input type="file" onChange={handleFileChange} className="hidden" accept="audio/*" />
            </label>
          </div>
          {formData.attachments.length > 0 && (
            <div className="mt-2">
              <p className="text-sm text-gray-600">{formData.attachments.length} file(s) selected</p>
              <ul className="text-xs text-gray-500">
                {formData.attachments.map((file, index) => (
                  <li key={index}>{file.name}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="mt-6">
          <Button type="submit" className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md">
            Submit
          </Button>
        </div>
      </form>
    </Dialog>
  )
}

export default RaiseTicketModal
