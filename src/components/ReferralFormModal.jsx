"use client"

import { useState } from "react"
import { X } from "lucide-react"
import IndiaFlag from "./IndiaFlag"

const ReferralFormModal = ({ isOpen, onClose }) => {
  const [referrals, setReferrals] = useState(
    Array(10).fill({
      name: "",
      country: "India",
      whatsappNumber: "",
      email: "",
    }),
  )

  const handleSave = () => {
    // TODO: Replace with real API call
    console.log("Saving referrals:", referrals)
    onClose()
  }

  const handleInputChange = (index, field, value) => {
    const updatedReferrals = [...referrals]
    updatedReferrals[index] = {
      ...updatedReferrals[index],
      [field]: value,
    }
    setReferrals(updatedReferrals)
  }

  if (!isOpen) return null

  const ordinals = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th"]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Referral Form</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          {ordinals.map((ordinal, index) => (
            <div key={index} className="mb-4 grid grid-cols-4 gap-4">
              <div className="flex items-center">
                <span className="text-white mr-2">{ordinal}</span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Person Name"
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                  value={referrals[index].name}
                  onChange={(e) => handleInputChange(index, "name", e.target.value)}
                />
              </div>
              <div className="relative flex items-center">
                <div className="flex items-center bg-gray-700 border border-gray-600 rounded p-2 w-full">
                  <div className="mr-2">
                    <IndiaFlag />
                  </div>
                  <span className="text-white">India</span>
                </div>
              </div>
              <div className="relative">
                <div className="flex">
                  <span className="bg-gray-700 border border-gray-600 rounded-l p-2 text-white">+91</span>
                  <input
                    type="text"
                    placeholder="WhatsApp Number"
                    className="w-full bg-gray-700 border border-gray-600 rounded-r p-2 text-white"
                    value={referrals[index].whatsappNumber}
                    onChange={(e) => handleInputChange(index, "whatsappNumber", e.target.value)}
                  />
                </div>
              </div>
              <div className="col-start-4">
                <input
                  type="email"
                  placeholder="Email ID"
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                  value={referrals[index].email}
                  onChange={(e) => handleInputChange(index, "email", e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="p-4">
          <button
            onClick={handleSave}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

export default ReferralFormModal
