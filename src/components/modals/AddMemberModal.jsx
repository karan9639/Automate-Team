"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import PropTypes from "prop-types";
import {
  X,
  Eye,
  EyeOff,
  AlertCircle,
  Mail,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";
import { motion } from "framer-motion";
import OtpInput from "@/components/OtpInput";
import { userApi } from "@/api/userApi";
import { toast } from "react-hot-toast";

// Form validation schema
const schema = yup.object({
  fullname: yup.string().required("Full name is required"),
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),
  whatsappNumber: yup
    .string()
    .required("WhatsApp number is required")
    .matches(/^[0-9]{10}$/, "WhatsApp number must be 10 digits"),
  accountType: yup.string().required("Account type is required"),
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
});

/**
 * Modal for adding team members with OTP verification
 */
const AddMemberModal = ({ isOpen, onClose, onSave, teamMembers = [] }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // OTP related states
  const [showOtpSection, setShowOtpSection] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [memberEmail, setMemberEmail] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      fullname: "",
      email: "",
      whatsappNumber: "",
      accountType: "Team Member", // Changed default to "Team Member"
      password: "",
    },
  });

  // Watch email field for OTP sending
  const watchedEmail = watch("email");

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0 && resendDisabled) {
      setResendDisabled(false);
    }
    return () => clearTimeout(timer);
  }, [countdown, resendDisabled]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      reset();
      setShowPassword(false);
      setShowOtpSection(false);
      setOtpSent(false);
      setOtpVerified(false);
      setOtpValue("");
      setOtpError("");
      setResendDisabled(false);
      setCountdown(0);
    }
  }, [isOpen, reset]);

  const handleSendOtp = async (email) => {
    if (!email) {
      toast.error("Email is required to send OTP.");
      return;
    }

    setOtpSending(true);
    setOtpError("");
    setMemberEmail(email);

    try {
      const response = await userApi.sendOtp({ email });

      if (response.data.success) {
        setOtpSent(true);
        setShowOtpSection(true);
        toast.success(
          response.data.message ||
            "OTP sent successfully to the member's email."
        );

        // Start countdown for resend (60 seconds)
        setResendDisabled(true);
        setCountdown(60);
      } else {
        toast.error(response.data.message || "Failed to send OTP.");
        setOtpError(response.data.message || "Failed to send OTP.");
      }
    } catch (error) {
      console.error("Send OTP error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to send OTP. Please try again.";
      toast.error(errorMessage);
      setOtpError(errorMessage);
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpValue || otpValue.length !== 4) {
      setOtpError("Please enter a valid 4-digit OTP.");
      return;
    }

    setOtpVerifying(true);
    setOtpError("");

    try {
      const response = await userApi.verifyOtp({
        email: memberEmail,
        otp: otpValue,
      });

      if (response.data.success) {
        setOtpVerified(true);
        toast.success(response.data.message || "OTP verified successfully.");
      } else {
        toast.error(response.data.message || "Invalid OTP.");
        setOtpError(response.data.message || "Invalid OTP.");
      }
    } catch (error) {
      console.error("Verify OTP error object:", error);
      let detailedMessage = "Failed to verify OTP. Please try again.";
      if (error.response && error.response.data) {
        console.error("Verify OTP error response data:", error.response.data);
        const data = error.response.data;
        if (typeof data.message === "string" && data.message.trim()) {
          detailedMessage = data.message;
        } else if (typeof data.error === "string" && data.error.trim()) {
          detailedMessage = data.error;
        } else if (typeof data.detail === "string" && data.detail.trim()) {
          detailedMessage = data.detail;
        } else if (typeof data === "string" && data.trim()) {
          detailedMessage = data;
        }

        if (typeof data.errors === "object" && data.errors !== null) {
          const fieldErrors = Object.entries(data.errors)
            .map(
              ([key, value]) =>
                `${key}: ${Array.isArray(value) ? value.join(", ") : value}`
            )
            .join("; ");
          if (fieldErrors) {
            detailedMessage += ` (${fieldErrors})`;
          }
        } else if (
          Array.isArray(data) &&
          data.every((item) => typeof item === "string")
        ) {
          detailedMessage = data.join("; ");
        }
      } else if (error.message) {
        detailedMessage = error.message;
      }

      toast.error(detailedMessage);
      setOtpError(detailedMessage);
    } finally {
      setOtpVerifying(false);
    }
  };

  const onSubmit = async (data) => {
    // If OTP verification is not done, initiate OTP flow
    if (!otpVerified) {
      setShowOtpSection(true);
      if (!otpSent) {
        handleSendOtp(data.email);
      }
      return;
    }

    // If OTP is verified, proceed with member addition
    setIsSubmitting(true);
    try {
      await onSave(data);
      reset();
      onClose();
    } catch (error) {
      // Error is handled in parent component
      console.error("Error adding member:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToForm = () => {
    setShowOtpSection(false);
    setOtpError("");
  };

  const handleOtpComplete = (otp) => {
    setOtpValue(otp);
    setOtpError("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md"
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {showOtpSection ? "Verify Email" : "Add Team Member"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {showOtpSection ? (
          <div className="p-4 space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                We've sent a verification code to
              </p>
              <p className="font-medium">{memberEmail}</p>
            </div>

            <OtpInput
              length={4}
              onComplete={handleOtpComplete}
              disabled={otpVerifying || otpVerified}
            />

            {otpError && (
              <p className="text-sm text-red-500 flex items-center justify-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {otpError}
              </p>
            )}

            {otpVerified ? (
              <div className="flex items-center justify-center text-green-600 gap-2">
                <CheckCircle className="w-5 h-5" />
                <span>Email verified successfully!</span>
              </div>
            ) : (
              <div className="grid gap-3">
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={otpVerifying || !otpValue || otpValue.length !== 4}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {otpVerifying ? "Verifying..." : "Verify OTP"}
                </button>

                <div className="flex justify-between items-center">
                  <button
                    type="button"
                    onClick={handleBackToForm}
                    className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 flex items-center"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back to form
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSendOtp(memberEmail)}
                    disabled={otpSending || resendDisabled}
                    className={`text-sm ${
                      resendDisabled
                        ? "text-gray-400 dark:text-gray-500"
                        : "text-green-600 hover:text-green-700 dark:text-green-500 dark:hover:text-green-400"
                    } flex items-center`}
                  >
                    <Mail className="w-4 h-4 mr-1" />
                    {resendDisabled
                      ? `Resend in ${countdown}s`
                      : otpSending
                      ? "Sending..."
                      : "Resend OTP"}
                  </button>
                </div>
              </div>
            )}

            {otpVerified && (
              <form onSubmit={handleSubmit(onSubmit)}>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Adding..." : "Add Member"}
                </button>
              </form>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="p-4">
            <div className="space-y-4">
              {/* Full Name */}
              <div>
                <label
                  htmlFor="fullname"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Full Name
                </label>
                <input
                  id="fullname"
                  type="text"
                  {...register("fullname")}
                  className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter full name"
                />
                {errors.fullname && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {errors.fullname.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  {...register("email")}
                  className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter email address"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* WhatsApp Number */}
              <div>
                <label
                  htmlFor="whatsappNumber"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  WhatsApp Number
                </label>
                <input
                  id="whatsappNumber"
                  type="tel"
                  {...register("whatsappNumber")}
                  className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter 10-digit number"
                />
                {errors.whatsappNumber && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {errors.whatsappNumber.message}
                  </p>
                )}
              </div>

              {/* Account Type */}
              <div>
                <label
                  htmlFor="accountType"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Account Type
                </label>
                <select
                  id="accountType"
                  {...register("accountType")}
                  className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="Admin">Admin</option>
                  <option value="Manager">Manager</option>
                  <option value="Team Member">Team Member</option>
                </select>
                {errors.accountType && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {errors.accountType.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 pr-10 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {errors.password.message}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 transition-colors"
                disabled={isSubmitting || otpSending}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || otpSending}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting || otpSending
                  ? otpSending
                    ? "Sending OTP..."
                    : "Adding..."
                  : otpVerified
                  ? "Add Member"
                  : "Continue with Email Verification"}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};

AddMemberModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  teamMembers: PropTypes.array,
};

export default AddMemberModal;
