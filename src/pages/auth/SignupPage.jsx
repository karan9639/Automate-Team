"use client";

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import IndiaFlag from "@/components/IndiaFlag";
import AutomateLogo from "@/components/common/AutomateLogo";
import { useAuth } from "@/contexts/AuthContext";
import { ROUTES } from "@/constants/routes";
import { userApi } from "@/api/userApi"; // Updated import path
import { toast } from "react-hot-toast";
import {
  Eye,
  EyeOff,
  AlertCircle,
  ArrowLeft,
  Mail,
  CheckCircle,
} from "lucide-react";
import OtpInput from "@/components/OtpInput";

// Validation schema
const validateSignupForm = (formData) => {
  const errors = {};
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[6-9]\d{9}$/; // Indian mobile number

  if (!formData.fullname.trim()) errors.fullname = "Full name is required";
  else if (formData.fullname.trim().length < 3)
    errors.fullname = "Full name must be at least 3 characters";

  if (!formData.email.trim()) errors.email = "Email is required";
  else if (!emailRegex.test(formData.email.trim()))
    errors.email = "Invalid email format";

  if (!formData.whatsappNumber.trim())
    errors.whatsappNumber = "WhatsApp number is required";
  else if (!phoneRegex.test(formData.whatsappNumber.trim()))
    errors.whatsappNumber =
      "Invalid WhatsApp number (must be 10 digits starting with 6-9)";

  if (!formData.password) errors.password = "Password is required";
  else if (formData.password.length < 6)
    errors.password = "Password must be at least 6 characters";

  if (!formData.confirmPassword)
    errors.confirmPassword = "Confirm password is required";
  else if (formData.password !== formData.confirmPassword)
    errors.confirmPassword = "Passwords do not match";

  return errors;
};

export default function SignupPage() {
  const navigate = useNavigate();
  const { login: authLogin, isAuthenticated } = useAuth();

  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

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

  useEffect(() => {
    if (isAuthenticated) {
      navigate(ROUTES.DASHBOARD.HOME);
    }
  }, [isAuthenticated, navigate]);

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

  const validateForm = () => {
    const formData = {
      fullname,
      email,
      whatsappNumber,
      password,
      confirmPassword,
    };
    const validationErrors = validateSignupForm(formData);
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleSendOtp = async () => {
    if (!validateForm()) {
      toast.error(
        "Please correct the errors in the form before requesting OTP."
      );
      return;
    }

    setOtpSending(true);
    setOtpError("");

    try {
      const response = await userApi.sendOtp({ email });

      if (response.data.success) {
        setOtpSent(true);
        setShowOtpSection(true);
        toast.success(
          response.data.message || "OTP sent successfully to your email."
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
      const response = await userApi.verifyOtp({ email, otp: otpValue });

      if (response.data.success) {
        setOtpVerified(true);
        toast.success(response.data.message || "OTP verified successfully.");

        // Proceed with registration after OTP verification
        handleSubmitAfterOtp();
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

  const handleSubmitAfterOtp = async () => {
    setIsLoading(true);

    try {
      const formData = {
        fullname,
        email,
        whatsappNumber,
        password,
        confirmPassword,
      };
      const response = await userApi.register(formData);

      if (response.data.success) {
        toast.success(
          response.data.message || "Registration successful! Please login."
        );
        navigate(ROUTES.AUTH.LOGIN);
      } else {
        toast.error(response.data.message || "Registration failed.");
        if (response.data.errors) {
          setErrors(response.data.errors);
        }
      }
    } catch (error) {
      console.error("Signup error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "An unexpected error occurred.";
      toast.error(errorMessage);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please correct the errors in the form.");
      return;
    }

    if (!otpVerified) {
      setShowOtpSection(true);
      if (!otpSent) {
        handleSendOtp();
      }
      return;
    }

    handleSubmitAfterOtp();
  };

  const handleInputChange = (setter, fieldName) => (e) => {
    setter(e.target.value);
    if (errors[fieldName]) {
      setErrors((prev) => ({ ...prev, [fieldName]: "" }));
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

  return (
    <div className="w-full min-h-screen lg:grid lg:grid-cols-2">
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto grid w-[380px] gap-8">
          <div className="grid gap-2 text-center">
            <Link to="/" className="inline-block mx-auto">
              <AutomateLogo />
            </Link>
            <h1 className="text-3xl font-bold">
              {showOtpSection ? "Verify Your Email" : "Create an Account"}
            </h1>
            <p className="text-balance text-muted-foreground">
              {showOtpSection
                ? "Enter the 4-digit code sent to your email"
                : "Enter your information to get started"}
            </p>
          </div>

          {showOtpSection ? (
            <div className="grid gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">
                  We've sent a verification code to
                </p>
                <p className="font-medium">{email}</p>
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
                  <Button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={
                      otpVerifying || !otpValue || otpValue.length !== 4
                    }
                    className="w-full"
                  >
                    {otpVerifying ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Verifying...
                      </>
                    ) : (
                      "Verify OTP"
                    )}
                  </Button>

                  <div className="flex justify-between items-center">
                    <button
                      type="button"
                      onClick={handleBackToForm}
                      className="text-sm text-gray-600 hover:text-gray-900 flex items-center"
                    >
                      <ArrowLeft className="w-4 h-4 mr-1" />
                      Back to form
                    </button>

                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={otpSending || resendDisabled}
                      className={`text-sm ${
                        resendDisabled
                          ? "text-gray-400"
                          : "text-green-600 hover:text-green-700"
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
                <Button
                  type="button"
                  onClick={handleSubmitAfterOtp}
                  disabled={isLoading}
                  className="w-full mt-2"
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Creating Account...
                    </>
                  ) : (
                    "Complete Registration"
                  )}
                </Button>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid gap-4">
              {/* Full Name */}
              <div className="grid gap-2">
                <Label htmlFor="fullname">Full Name</Label>
                <Input
                  id="fullname"
                  type="text"
                  placeholder="John Doe"
                  value={fullname}
                  onChange={handleInputChange(setFullname, "fullname")}
                  className={errors.fullname ? "border-red-500" : ""}
                  required
                />
                {errors.fullname && (
                  <p className="text-xs text-red-500 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {errors.fullname}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={handleInputChange(setEmail, "email")}
                  className={errors.email ? "border-red-500" : ""}
                  required
                />
                {errors.email && (
                  <p className="text-xs text-red-500 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* WhatsApp Number */}
              <div className="grid gap-2">
                <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <IndiaFlag className="h-5 w-5" />
                    <span className="ml-2 text-sm text-gray-500">+91</span>
                  </div>
                  <Input
                    id="whatsappNumber"
                    type="tel"
                    placeholder="9876543210"
                    value={whatsappNumber}
                    onChange={handleInputChange(
                      setWhatsappNumber,
                      "whatsappNumber"
                    )}
                    className={`pl-[70px] ${
                      errors.whatsappNumber ? "border-red-500" : ""
                    }`}
                    required
                    maxLength={10}
                  />
                </div>
                {errors.whatsappNumber && (
                  <p className="text-xs text-red-500 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {errors.whatsappNumber}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={handleInputChange(setPassword, "password")}
                    className={errors.password ? "border-red-500" : ""}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-500 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={handleInputChange(
                      setConfirmPassword,
                      "confirmPassword"
                    )}
                    className={errors.confirmPassword ? "border-red-500" : ""}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </Button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-red-500 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || otpSending}
              >
                {isLoading || otpSending ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    {otpSending ? "Sending OTP..." : "Creating Account..."}
                  </>
                ) : otpVerified ? (
                  "Create Account"
                ) : (
                  "Continue with Email Verification"
                )}
              </Button>
            </form>
          )}

          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link to={ROUTES.AUTH.LOGIN} className="underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
      <div className="hidden bg-muted lg:block">
        <img
          src="/placeholder.svg?height=1080&width=1920"
          alt="Modern office collaboration"
          className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}
