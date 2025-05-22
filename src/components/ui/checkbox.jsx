"use client"

import { forwardRef, useEffect, useState } from "react"

export const Checkbox = forwardRef(
  ({ className = "", checked = false, onCheckedChange, disabled = false, ...props }, ref) => {
    const [isChecked, setIsChecked] = useState(checked)

    // Update internal state when the checked prop changes
    useEffect(() => {
      setIsChecked(checked)
    }, [checked])

    const handleChange = (e) => {
      if (disabled) return

      const newChecked = e.target.checked
      setIsChecked(newChecked)

      // Only call the callback if it exists
      if (typeof onCheckedChange === "function") {
        onCheckedChange(newChecked)
      }
    }

    return (
      <label
        className={`inline-flex items-center ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"} ${className}`}
      >
        <input
          type="checkbox"
          className="sr-only"
          checked={isChecked}
          onChange={handleChange}
          disabled={disabled}
          ref={ref}
          {...props}
        />
        <div
          className={`h-4 w-4 rounded-sm border flex items-center justify-center ${
            isChecked ? "bg-emerald-500 border-emerald-500" : "bg-white border-gray-300"
          }`}
        >
          {isChecked && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3 text-white"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>
      </label>
    )
  },
)

Checkbox.displayName = "Checkbox"
