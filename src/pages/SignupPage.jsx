"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { motion } from "framer-motion"
import { Eye, EyeOff } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import AutomateLogo from "../components/AutomateLogo"

// Form validation schema
const schema = yup
  .object({
    firstName: yup.string().required("First name is required"),
    lastName: yup.string().required("Last name is required"),
    country: yup.string().required("Country is required"),
    whatsappNumber: yup
      .string()
      .required("WhatsApp number is required")
      .matches(/^[0-9]+$/, "Must be only digits")
      .min(10, "Must be at least 10 digits"),
    email: yup.string().email("Invalid email format").required("Email is required"),
    password: yup.string().required("Password is required").min(8, "Password must be at least 8 characters"),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref("password"), null], "Passwords must match")
      .required("Confirm password is required"),
  })
  .required()

const SignupPage = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { register: registerUser, googleAuth, error: authError } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      country: "India",
    },
  })

  const onSubmit = async (data) => {
    try {
      await registerUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        country: data.country,
        whatsappNumber: data.whatsappNumber,
      })
      // Redirect to login after successful registration
      navigate("/login", {
        state: {
          message: "Registration successful! Please login with your credentials.",
        },
      })
    } catch (err) {
      setError("root", {
        type: "manual",
        message: err.message,
      })
    }
  }

  const handleGoogleSignup = () => {
    googleAuth()
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="flex justify-center mb-8">
          <AutomateLogo />
        </div>

        <div className="bg-gray-900 border border-green-500 rounded-lg p-8">
          <h1 className="text-3xl font-bold text-white text-center mb-6">Start Free Trial</h1>

          {/* Google Sign Up Button */}
          <button
            onClick={handleGoogleSignup}
            className="w-full bg-white text-gray-700 py-3 px-4 rounded-md flex items-center justify-center mb-6 hover:bg-gray-100 transition-colors"
          >
            <svg viewBox="0 0 24 24" width="24" height="24" className="mr-2">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign Up with Google
          </button>

          <div className="text-center text-gray-400 mb-6">Sign Up via Email by filling the form given below</div>

          {/* Show auth error if any */}
          {(authError || errors.root) && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-md mb-4">
              {authError || errors.root?.message}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* First Name */}
            <div>
              <input
                type="text"
                placeholder="First Name"
                {...register("firstName")}
                className={`w-full bg-gray-800 text-white px-4 py-3 rounded-md border ${
                  errors.firstName ? "border-red-500" : "border-green-500"
                }`}
              />
              {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>}
            </div>

            {/* Last Name */}
            <div>
              <input
                type="text"
                placeholder="Last Name"
                {...register("lastName")}
                className="w-full bg-gray-800 text-white px-4 py-3 rounded-md border border-gray-700"
              />
              {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>}
            </div>

            {/* Country */}
            <div className="relative">
              <div className="flex items-center bg-gray-800 text-white px-4 py-3 rounded-md border border-gray-700">
                <div className="flex items-center">
                  <div className="mr-2">
                    <img src="/india-flag.svg" alt="India Flag" className="w-6 h-6 rounded-full" />
                  </div>
                  <div className="text-sm text-gray-400">Country</div>
                </div>
                <div className="ml-2">India</div>
              </div>
              {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country.message}</p>}
            </div>

            {/* WhatsApp Number */}
            <div className="relative">
              <div className="flex bg-gray-800 text-white rounded-md border border-gray-700">
                <div className="flex items-center px-4 py-3 text-gray-400">+91</div>
                <input
                  type="text"
                  placeholder="WhatsApp Number"
                  {...register("whatsappNumber")}
                  className="w-full bg-gray-800 text-white px-4 py-3 rounded-md border-0"
                />
              </div>
              {errors.whatsappNumber && <p className="text-red-500 text-sm mt-1">{errors.whatsappNumber.message}</p>}
            </div>

            {/* Email */}
            <div>
              <input
                type="email"
                placeholder="Email"
                {...register("email")}
                className="w-full bg-gray-800 text-white px-4 py-3 rounded-md border border-gray-700"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                {...register("password")}
                className="w-full bg-gray-800 text-white px-4 py-3 rounded-md border border-gray-700 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                {...register("confirmPassword")}
                className="w-full bg-gray-800 text-white px-4 py-3 rounded-md border border-gray-700 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-green-500 text-white py-3 px-4 rounded-md font-medium hover:bg-green-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Creating Account..." : "Create Account"}
            </motion.button>
          </form>

          <div className="text-center mt-6">
            <span className="text-gray-400">Already have an account?</span>{" "}
            <Link to="/login" className="text-green-500 hover:underline">
              Login here
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default SignupPage
