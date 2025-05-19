"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ROUTES } from "../constants/routes"
import { motion } from "framer-motion"

const NotFound = () => {
  const navigate = useNavigate()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Trigger animations after component mounts
    setIsVisible(true)
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 overflow-hidden">
      {/* Background animated elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-gray-200"
            initial={{
              x: Math.random() * window.innerWidth,
              y: -20,
              opacity: 0.3,
              width: Math.random() * 40 + 10,
              height: Math.random() * 40 + 10,
            }}
            animate={{
              y: window.innerHeight + 20,
              opacity: [0.3, 0.6, 0.3],
              rotate: Math.random() * 360,
            }}
            transition={{
              duration: Math.random() * 20 + 15,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          />
        ))}
      </div>

      <motion.div
        className="max-w-md w-full text-center bg-white p-8 rounded-lg shadow-lg relative z-10"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{
          scale: isVisible ? 1 : 0.8,
          opacity: isVisible ? 1 : 0,
        }}
        transition={{
          duration: 0.5,
          type: "spring",
          stiffness: 100,
        }}
      >
        <motion.div
          className="inline-block p-4 rounded-full bg-red-100 mb-4"
          initial={{ rotate: 0 }}
          animate={{ rotate: isVisible ? [0, -10, 10, -10, 10, 0] : 0 }}
          transition={{
            delay: 0.3,
            duration: 0.6,
            type: "spring",
          }}
        >
          <motion.svg
            className="w-12 h-12 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{
              scale: isVisible ? [0.5, 1.2, 1] : 0.5,
              opacity: isVisible ? 1 : 0,
            }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <motion.path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: isVisible ? 1 : 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            />
          </motion.svg>
        </motion.div>

        <motion.h1
          className="text-6xl font-bold text-gray-800 mb-2"
          initial={{ y: -50, opacity: 0 }}
          animate={{
            y: isVisible ? 0 : -50,
            opacity: isVisible ? 1 : 0,
          }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          404
        </motion.h1>

        <motion.h2
          className="text-2xl font-semibold text-gray-600 mb-4"
          initial={{ y: -20, opacity: 0 }}
          animate={{
            y: isVisible ? 0 : -20,
            opacity: isVisible ? 1 : 0,
          }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          Page Not Found
        </motion.h2>

        <motion.p
          className="text-gray-500 mb-6"
          initial={{ y: -10, opacity: 0 }}
          animate={{
            y: isVisible ? 0 : -10,
            opacity: isVisible ? 1 : 0,
          }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          The page you are looking for doesn't exist or has been moved.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-3 justify-center"
          initial={{ y: 20, opacity: 0 }}
          animate={{
            y: isVisible ? 0 : 20,
            opacity: isVisible ? 1 : 0,
          }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <motion.button
            onClick={() => navigate(-1)}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            whileHover={{ scale: 1.05, backgroundColor: "#f3f4f6" }}
            whileTap={{ scale: 0.95 }}
          >
            Go Back
          </motion.button>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to={ROUTES.DASHBOARD}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors inline-block w-full sm:w-auto"
            >
              Go to Dashboard
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default NotFound
