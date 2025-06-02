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
import { userApi } from "@/api/userApi";
import { toast } from "react-hot-toast";
import {
  Eye,
  EyeOff,
  AlertCircle,
  ArrowLeft,
  Mail,
  CheckCircle,
  Briefcase,
  Users,
  Zap,
} from "lucide-react";
import OtpInput from "@/components/OtpInput";

// Validation schema (remains the same)
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
  const { isAuthenticated } = useAuth(); // Removed unused 'login'

  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

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
        setResendDisabled(true);
        setCountdown(60);
      } else {
        toast.error(response.data.message || "Failed to send OTP.");
        setOtpError(response.data.message || "Failed to send OTP.");
      }
    } catch (error) {
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
        handleSubmitAfterOtp(); // Proceed to registration
      } else {
        toast.error(response.data.message || "Invalid OTP.");
        setOtpError(response.data.message || "Invalid OTP.");
      }
    } catch (error) {
      let detailedMessage = "Failed to verify OTP. Please try again.";
      if (error.response && error.response.data) {
        const data = error.response.data;
        detailedMessage =
          data.message ||
          data.error ||
          data.detail ||
          (typeof data === "string" ? data : detailedMessage);
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
        confirmPassword, // Backend might not need this if password is confirmed client-side
        otp: otpValue, // Send OTP along with registration data
      };
      const response = await userApi.register(formData); // Assuming register API handles OTP verification or uses pre-verified status
      if (response.data.success) {
        toast.success(
          response.data.message || "Registration successful! Please login."
        );
        navigate(ROUTES.AUTH.LOGIN);
      } else {
        toast.error(response.data.message || "Registration failed.");
        if (response.data.errors) setErrors(response.data.errors);
      }
    } catch (error) {
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
      // If OTP not yet verified, initiate OTP flow
      setShowOtpSection(true);
      if (!otpSent) {
        // If OTP not even sent, send it first
        handleSendOtp();
      }
      // If OTP sent but not verified, user needs to input OTP and click verify.
      // The form submission will be re-triggered by handleVerifyOtp -> handleSubmitAfterOtp
      return;
    }
    // If OTP is already verified (e.g., user clicked back and then submit again), proceed.
    handleSubmitAfterOtp();
  };

  const handlePhoneChange = (setter, field) => (e) => {
    let value = e.target.value;

    if (field === "whatsappNumber") {
      // Remove any non-digit characters as user types
      value = value.replace(/\D/g, "");
    }

    setter(value);
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
    // Do not reset otpVerified or otpSent, user might want to retry submitting with existing OTP
  };

  const handleOtpComplete = (otp) => {
    setOtpValue(otp);
    setOtpError("");
  };

  return (
    <div className="w-full min-h-screen lg:grid lg:grid-cols-2 font-sans">
      {/* Left Column - Descriptive Text */}
      <div className="hidden lg:flex flex-col items-center justify-center p-12 bg-gradient-to-br from-green-500 to-emerald-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative z-10 text-center space-y-8">
          <Link to="/" className="inline-block">
            <AutomateLogo className="h-16 w-auto text-white" />
          </Link>
          <h1 className="text-4xl font-bold tracking-tight">
            Elevate Your Workflow with KPS Automate Task
          </h1>
          <p className="text-lg leading-relaxed text-green-100">
            Transform your team's productivity with KPS Automate Task, the
            intelligent solution for seamless project management and workflow
            automation. Our platform offers intuitive task delegation, real-time
            progress tracking, and insightful analytics, all designed to
            simplify complexity and foster collaboration. Step into a more
            efficient future where every task is a step towards success. Join
            KPS Automate Task and redefine your team's potential.
          </p>
          <div className="flex justify-center space-x-6 pt-4">
            <div className="flex flex-col items-center">
              <Briefcase className="h-10 w-10 text-green-300 mb-2" />
              <span className="font-medium">Project Management</span>
            </div>
            <div className="flex flex-col items-center">
              <Users className="h-10 w-10 text-green-300 mb-2" />
              <span className="font-medium">Team Collaboration</span>
            </div>
            <div className="flex flex-col items-center">
              <Zap className="h-10 w-10 text-green-300 mb-2" />
              <span className="font-medium">Workflow Automation</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Signup Form */}
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 h-screen">
        <div className="mx-auto w-full max-w-md space-y-8">
          {/* Logo and Title for mobile */}
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="inline-block mx-auto">
              <AutomateLogo className="h-12 w-auto text-green-600" />
            </Link>
          </div>

          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              {showOtpSection ? "Verify Your Email" : "Create an Account"}
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              {showOtpSection
                ? `Enter the 4-digit code sent to ${email}`
                : "Join KPS Automate and elevate your business today."}
            </p>
          </div>

          {showOtpSection ? (
            // OTP Section
            <div className="space-y-6">
              <OtpInput
                length={4}
                onComplete={handleOtpComplete}
                disabled={otpVerifying || otpVerified}
              />

              {otpError && (
                <p className="text-sm text-red-600 flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 mr-1.5 flex-shrink-0" />
                  {otpError}
                </p>
              )}

              {otpVerified ? (
                <div className="flex items-center justify-center text-green-600 gap-2 p-3 bg-green-50 rounded-md">
                  <CheckCircle className="w-5 h-5" />
                  <span>Email verified successfully! Proceeding...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  <Button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={
                      otpVerifying || !otpValue || otpValue.length !== 4
                    }
                    className="w-full bg-green-600 hover:bg-green-700 text-white transition-colors duration-150"
                  >
                    {otpVerifying ? "Verifying..." : "Verify OTP"}
                  </Button>
                  <div className="flex justify-between items-center text-sm">
                    <button
                      type="button"
                      onClick={handleBackToForm}
                      className="text-slate-600 hover:text-slate-900 flex items-center group"
                    >
                      <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
                      Back to form
                    </button>
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={otpSending || resendDisabled}
                      className={`flex items-center ${
                        resendDisabled
                          ? "text-slate-400 cursor-not-allowed"
                          : "text-green-600 hover:text-green-700"
                      }`}
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
              {/* The "Complete Registration" button is removed from here as handleSubmitAfterOtp is called directly after successful OTP verification */}
            </div>
          ) : (
            // Signup Form Fields
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="fullname" className="text-slate-700">
                  Full Name
                </Label>
                <Input
                  id="fullname"
                  type="text"
                  placeholder="John Doe"
                  value={fullname}
                  onChange={handleInputChange(setFullname, "fullname")}
                  className={`mt-1 focus:ring-green-500 focus:border-green-500 ${
                    errors.fullname ? "border-red-500" : "border-slate-300"
                  }`}
                  required
                />
                {errors.fullname && (
                  <p className="mt-1 text-xs text-red-600 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {errors.fullname}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="email" className="text-slate-700">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={handleInputChange(setEmail, "email")}
                  className={`mt-1 focus:ring-green-500 focus:border-green-500 ${
                    errors.email ? "border-red-500" : "border-slate-300"
                  }`}
                  required
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {errors.email}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="whatsappNumber" className="text-slate-700">
                  WhatsApp Number
                </Label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <IndiaFlag className="h-5 w-5" />
                    <span className="ml-2 text-sm text-slate-500">+91</span>
                  </div>
                  <Input
                    id="whatsappNumber"
                    type="tel"
                    placeholder="9876543210"
                    value={whatsappNumber}
                    onChange={handlePhoneChange(
                      setWhatsappNumber,
                      "whatsappNumber"
                    )}
                    className={`pl-[70px] focus:ring-green-500 focus:border-green-500 ${
                      errors.whatsappNumber
                        ? "border-red-500"
                        : "border-slate-300"
                    }`}
                    required
                    maxLength={10}
                  />
                </div>
                {errors.whatsappNumber && (
                  <p className="mt-1 text-xs text-red-600 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {errors.whatsappNumber}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="password" className="text-slate-700">
                  Password
                </Label>
                <div className="relative mt-1">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={handleInputChange(setPassword, "password")}
                    className={`focus:ring-green-500 focus:border-green-500 ${
                      errors.password ? "border-red-500" : "border-slate-300"
                    }`}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-slate-400 hover:text-green-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-600 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {errors.password}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="confirmPassword" className="text-slate-700">
                  Confirm Password
                </Label>
                <div className="relative mt-1">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={handleInputChange(
                      setConfirmPassword,
                      "confirmPassword"
                    )}
                    className={`focus:ring-green-500 focus:border-green-500 ${
                      errors.confirmPassword
                        ? "border-red-500"
                        : "border-slate-300"
                    }`}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-slate-400 hover:text-green-600"
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
                  <p className="mt-1 text-xs text-red-600 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white transition-colors duration-150 py-2.5"
                disabled={isLoading || otpSending}
              >
                {isLoading || otpSending
                  ? otpSending
                    ? "Sending OTP..."
                    : "Processing..."
                  : "Continue"}
              </Button>
            </form>
          )}

          <div className="mt-6 text-center text-sm">
            <p className="text-slate-600">
              Already have an account?{" "}
              <Link
                to={ROUTES.AUTH.LOGIN}
                className="font-medium text-green-600 hover:text-green-500 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
