"use client"

import { useState, useRef, useEffect } from "react"
import PropTypes from "prop-types"

const OtpInput = ({ length = 4, onComplete, disabled = false }) => {
  const [otp, setOtp] = useState(new Array(length).fill(""))
  const inputRefs = useRef([])

  useEffect(() => {
    // Focus the first input when the component mounts
    if (inputRefs.current[0] && !disabled) {
      inputRefs.current[0].focus()
    }
  }, [disabled])

  const handleChange = (e, index) => {
    const value = e.target.value

    // Allow only numbers
    if (!/^\d*$/.test(value)) return

    // Take only the last character if multiple characters are pasted
    const digit = value.substring(value.length - 1)

    // Update the OTP array
    const newOtp = [...otp]
    newOtp[index] = digit
    setOtp(newOtp)

    // If a digit was entered and we're not at the last input, focus the next input
    if (digit && index < length - 1) {
      inputRefs.current[index + 1].focus()
    }

    // Check if OTP is complete
    const otpValue = newOtp.join("")
    if (otpValue.length === length) {
      onComplete(otpValue)
    }
  }

  const handleKeyDown = (e, index) => {
    // Handle backspace
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        // If current input is empty and backspace is pressed, focus previous input
        const newOtp = [...otp]
        newOtp[index - 1] = ""
        setOtp(newOtp)
        inputRefs.current[index - 1].focus()
      } else if (otp[index]) {
        // If current input has a value, clear it
        const newOtp = [...otp]
        newOtp[index] = ""
        setOtp(newOtp)
      }
    }

    // Handle left arrow
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1].focus()
    }

    // Handle right arrow
    if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1].focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text/plain").trim()

    // Check if pasted content is all digits and of correct length
    if (!/^\d+$/.test(pastedData)) return

    const digits = pastedData.split("").slice(0, length)
    const newOtp = [...otp]

    digits.forEach((digit, idx) => {
      if (idx < length) {
        newOtp[idx] = digit
      }
    })

    setOtp(newOtp)

    // Focus the input after the last pasted digit
    const focusIndex = Math.min(digits.length, length - 1)
    inputRefs.current[focusIndex].focus()

    // Check if OTP is complete
    const otpValue = newOtp.join("")
    if (otpValue.length === length) {
      onComplete(otpValue)
    }
  }

  return (
    <div className="flex justify-center gap-2 my-4">
      {otp.map((digit, index) => (
        <input
          key={index}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={index === 0 ? handlePaste : null}
          ref={(ref) => (inputRefs.current[index] = ref)}
          disabled={disabled}
          className="w-12 h-12 text-center text-xl font-bold border rounded-md focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none disabled:bg-gray-100 disabled:text-gray-400"
          aria-label={`Digit ${index + 1} of OTP`}
        />
      ))}
    </div>
  )
}

OtpInput.propTypes = {
  length: PropTypes.number,
  onComplete: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
}

export default OtpInput
