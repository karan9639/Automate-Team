"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import PropTypes from "prop-types"
import { X } from "lucide-react"
import { motion } from "framer-motion"

// Form validation schema
const schema = yup.object({
  name: yup.string().required("Name is required"),
  email: yup.string().email("Invalid email format").required("Email is required"),
  mobile: yup
    .string()
    .required("Mobile number is required")
    .matches(/^[0-9]{10}$/, "Mobile number must be 10 digits"),
  role: yup.string().required("Role is required"),
  reportsTo: yup.string().nullable(),
  accessType: yup.string().required("Access type is required"),
})

/**
 * Modal for adding or editing team members
 */
const AddMemberModal = ({ isOpen, onClose, member, onSave }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      mobile: "",
      role: "Member",
      reportsTo: "",
      accessType: "Limited",
    },
  })

  // Reset form when member changes
  useEffect(() => {
    if (member) {
      reset({
        name: member.name,
        email: member.email,
        mobile: member.mobile,
        role: member.role,
        reportsTo: member.reportsTo || "",
        accessType: member.accessType || "Limited",
      })
    } else {
      reset({
        name: "",
        email: "",
        mobile: "",
        role: "Member",
        reportsTo: "",
        accessType: "Limited",
      })
    }
  }, [member, reset])

  // Handle form submission
  const onSubmit = (data) => {
    onSave({
      id: member?.id || Date.now().toString(),
      ...data,
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-gray-800 rounded-lg shadow-lg w-full max-w-md"
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">{member ? "Edit Team Member" : "Add Team Member"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-4">
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                Name
              </label>
              <input
                id="name"
                type="text"
                {...register("name")}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                {...register("email")}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
            </div>

            {/* Mobile */}
            <div>
              <label htmlFor="mobile" className="block text-sm font-medium text-gray-300 mb-1">
                Mobile
              </label>
              <input
                id="mobile"
                type="text"
                {...register("mobile")}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              {errors.mobile && <p className="mt-1 text-sm text-red-500">{errors.mobile.message}</p>}
            </div>

            {/* Role */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-300 mb-1">
                Role
              </label>
              <select
                id="role"
                {...register("role")}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="Admin">Admin</option>
                <option value="Manager">Manager</option>
                <option value="Member">Member</option>
              </select>
              {errors.role && <p className="mt-1 text-sm text-red-500">{errors.role.message}</p>}
            </div>

            {/* Reports To */}
            <div>
              <label htmlFor="reportsTo" className="block text-sm font-medium text-gray-300 mb-1">
                Reports To
              </label>
              <select
                id="reportsTo"
                {...register("reportsTo")}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">None</option>
                <option value="Karan">Karan</option>
                <option value="Prashant">Prashant</option>
              </select>
              {errors.reportsTo && <p className="mt-1 text-sm text-red-500">{errors.reportsTo.message}</p>}
            </div>

            {/* Access Type */}
            <div>
              <label htmlFor="accessType" className="block text-sm font-medium text-gray-300 mb-1">
                Access Type
              </label>
              <select
                id="accessType"
                {...register("accessType")}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="Full">Full</option>
                <option value="Limited">Limited</option>
                <option value="Read-only">Read-only</option>
              </select>
              {errors.accessType && <p className="mt-1 text-sm text-red-500">{errors.accessType.message}</p>}
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
            >
              {member ? "Update" : "Add"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

AddMemberModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  member: PropTypes.object,
  onSave: PropTypes.func.isRequired,
}

export default AddMemberModal
