"use client"

import { useState } from "react"
import PropTypes from "prop-types"
import { X, Upload, Download, FileText, Check, AlertCircle } from "lucide-react"
import { motion } from "framer-motion"

/**
 * Modal for uploading multiple users via CSV
 */
const UploadUsersModal = ({ isOpen, onClose, onDownloadTemplate }) => {
  const [file, setFile] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [uploadStatus, setUploadStatus] = useState(null) // null, 'validating', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState("")

  if (!isOpen) return null

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)

    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && droppedFile.type === "text/csv") {
      setFile(droppedFile)
      setUploadStatus("validating")

      // Simulate validation
      setTimeout(() => {
        setUploadStatus("success")
      }, 1500)
    } else {
      setErrorMessage("Please upload a CSV file")
      setUploadStatus("error")
    }
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      setFile(selectedFile)
      setUploadStatus("validating")

      // Simulate validation
      setTimeout(() => {
        if (selectedFile.type === "text/csv" || selectedFile.name.endsWith(".csv")) {
          setUploadStatus("success")
        } else {
          setErrorMessage("Please upload a CSV file")
          setUploadStatus("error")
        }
      }, 1500)
    }
  }

  const handleUpload = () => {
    if (!file) {
      setErrorMessage("Please select a file first")
      setUploadStatus("error")
      return
    }

    // In a real app, you would upload the file to the server here
    alert(`Uploading ${file.name}. In a real app, this would send the file to the server.`)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md"
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Upload Users</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              Upload a CSV file with user details. Make sure to follow the template format.
            </p>
            <button
              onClick={onDownloadTemplate}
              className="flex items-center text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              <Download size={16} className="mr-1" />
              Download template
            </button>
          </div>

          {/* File upload area */}
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center ${
              isDragging ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-300 dark:border-gray-600"
            } ${uploadStatus === "error" ? "border-red-500 bg-red-50 dark:bg-red-900/20" : ""} ${
              uploadStatus === "success" ? "border-green-500 bg-green-50 dark:bg-green-900/20" : ""
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {!file ? (
              <>
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  Drag and drop your CSV file here, or{" "}
                  <label className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer">
                    browse
                    <input type="file" className="hidden" accept=".csv" onChange={handleFileChange} />
                  </label>
                </p>
              </>
            ) : (
              <div className="flex flex-col items-center">
                {uploadStatus === "validating" ? (
                  <>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Validating file...</p>
                  </>
                ) : uploadStatus === "error" ? (
                  <>
                    <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
                    <button
                      className="mt-2 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      onClick={() => {
                        setFile(null)
                        setUploadStatus(null)
                        setErrorMessage("")
                      }}
                    >
                      Try again
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex items-center">
                      <FileText className="h-8 w-8 text-gray-600 dark:text-gray-300" />
                      {uploadStatus === "success" && (
                        <Check className="ml-2 h-5 w-5 text-green-600 dark:text-green-400" />
                      )}
                    </div>
                    <p className="mt-2 text-sm text-gray-900 dark:text-white font-medium">{file.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{(file.size / 1024).toFixed(2)} KB</p>
                    <button
                      className="mt-2 text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      onClick={() => {
                        setFile(null)
                        setUploadStatus(null)
                      }}
                    >
                      Remove
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {uploadStatus === "error" && (
            <p className="mt-2 text-xs text-red-600 dark:text-red-400">
              Please make sure your CSV file follows the required format.
            </p>
          )}

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleUpload}
              disabled={!file || uploadStatus !== "success"}
              className={`px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors ${
                !file || uploadStatus !== "success" ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Upload
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

UploadUsersModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onDownloadTemplate: PropTypes.func.isRequired,
}

export default UploadUsersModal
