"use client"
import { X } from "lucide-react"

const WhatsAppConnectionModal = ({ isOpen, onClose }) => {
  const handleConnect = () => {
    // TODO: Replace with real API call
    console.log("Connecting WhatsApp")
  }

  const handleSaveAndNext = () => {
    // TODO: Replace with real API call
    console.log("Saving WhatsApp connection")
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg w-full max-w-lg">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">WhatsApp API Connection</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <label className="block text-white mb-2">WA Channel ID</label>
            <input
              type="text"
              className="w-full bg-gray-700 border border-gray-600 rounded p-3 text-white"
              placeholder="Enter your WhatsApp Channel ID"
            />
            <p className="text-gray-400 mt-2 text-sm">
              Get your Channel Id from here -{" "}
              <a href="https://app.automatebusiness.com/products/crm/channel" className="text-blue-400 hover:underline">
                https://app.automatebusiness.com/products/crm/channel
              </a>
            </p>
          </div>

          <button
            onClick={handleConnect}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded mb-4 transition-colors"
          >
            Connect WABA
          </button>

          <div className="flex justify-end">
            <button
              onClick={handleSaveAndNext}
              className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded transition-colors"
            >
              Save & Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WhatsAppConnectionModal
