"use client";

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AutomateLogo from "@/components/common/AutomateLogo";
import OtpInput from "@/components/OtpInput";
import { userApi } from "@/api/userApi";
import toast from "react-hot-toast";
import { Eye, EyeOff, AlertCircle, ArrowLeft, Mail } from "lucide-react";
import { ROUTES } from "@/constants/routes";

// Validation schema
const validateForgotPasswordForm = (formData, step) => {
  const errors = {};
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (step === 1 || step === "all") {
    if (!formData.email.trim()) errors.email = "Email is required";
    else if (!emailRegex.test(formData.email.trim()))
      errors.email = "Invalid email format";

    if (!formData.newPassword) errors.newPassword = "New password is required";
    else if (formData.newPassword.length < 6)
      errors.newPassword = "Password must be at least 6 characters";

    if (!formData.confirmNewPassword)
      errors.confirmNewPassword = "Confirm new password is required";
    else if (formData.newPassword !== formData.confirmNewPassword)
      errors.confirmNewPassword = "Passwords do not match";
  }
  return errors;
};

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false); // General loading state
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [passwordChanging, setPasswordChanging] = useState(false);

  // OTP related states
  const [showOtpSection, setShowOtpSection] = useState(false);
  const [otpSent, setOtpSent] = useState(false); // To track if OTP has been sent for the current email
  const [otpValue, setOtpValue] = useState("");
  const [otpError, setOtpError] = useState("");
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0 && resendDisabled) {
      setResendDisabled(false);
    }
    return () => clearTimeout(timer);
  }, [countdown, resendDisabled]);

  const handleInputChange = (setter, fieldName) => (e) => {
    setter(e.target.value);
    if (errors[fieldName]) {
      setErrors((prev) => ({ ...prev, [fieldName]: "" }));
    }
  };

  const validateForm = () => {
    const formData = { email, newPassword, confirmNewPassword };
    const validationErrors = validateForgotPasswordForm(formData, 1);
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleSendOtp = async () => {
    if (!validateForm()) {
      toast.error("Please correct the form errors before sending OTP.");
      return;
    }
    setOtpSending(true);
    setOtpError("");
    try {
      const response = await userApi.sendOtp({ email });
      if (response.data.success) {
        toast.success(response.data.message || "OTP sent to your email.");
        setOtpSent(true);
        setShowOtpSection(true);
        setResendDisabled(true);
        setCountdown(60);
      } else {
        toast.error(response.data.message || "Failed to send OTP.");
        setOtpError(response.data.message || "Failed to send OTP.");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to send OTP. Please try again.";
      toast.error(errorMessage);
      setOtpError(errorMessage);
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyAndChangePassword = async () => {
    if (!otpValue || otpValue.length !== 4) {
      setOtpError("Please enter a valid 4-digit OTP.");
      return;
    }
    setOtpVerifying(true); // Use otpVerifying for the combined process
    setPasswordChanging(true);
    setOtpError("");

    try {
      // Step 1: Verify OTP
      const verifyResponse = await userApi.verifyOtp({ email, otp: otpValue });
      if (!verifyResponse.data.success) {
        toast.error(verifyResponse.data.message || "Invalid OTP.");
        setOtpError(verifyResponse.data.message || "Invalid OTP.");
        setOtpVerifying(false);
        setPasswordChanging(false);
        return;
      }

      toast.success("OTP verified successfully. Changing password...");

      // Step 2: Change Password
      const changePasswordPayload = {
        email,
        incomingPassword: newPassword, // Changed from newPassword to incomingPassword
        // No currentPassword for forgot password
        otp: otpValue,
      };
      const changePasswordResponse = await userApi.changePassword(
        changePasswordPayload
      );

      if (changePasswordResponse.data.success) {
        toast.success(
          changePasswordResponse.data.message ||
          "Password changed successfully! Please login."
        );
        setShowOtpSection(false);
        setEmail("");
        setNewPassword("");
        setConfirmNewPassword("");
        setOtpValue("");
        navigate(ROUTES.AUTH.LOGIN);
      } else {
        toast.error(
          changePasswordResponse.data.message || "Failed to change password."
        );
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "An error occurred. Please try again.";
      toast.error(errorMessage);
      setOtpError(errorMessage); // Show error in OTP section if it's related, or a general toast
    } finally {
      setOtpVerifying(false);
      setPasswordChanging(false);
    }
  };

  const handleOtpComplete = (otp) => {
    setOtpValue(otp);
    setOtpError(""); // Clear OTP error when user types
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (showOtpSection) {
      handleVerifyAndChangePassword();
    } else {
      handleSendOtp();
    }
  };

  return (
    <div className="w-full min-h-screen lg:grid lg:grid-cols-2">
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 h-screen">
        <div className="mx-auto grid w-[380px] gap-8">
          <div className="grid gap-2 text-center">
            <Link to="/" className="inline-block mx-auto">
              <AutomateLogo />
            </Link>
            <h1 className="text-3xl font-bold">
              {showOtpSection ? "Verify & Reset Password" : "Forgot Password"}
            </h1>
            <p className="text-balance text-muted-foreground">
              {showOtpSection
                ? `Enter the OTP sent to ${email} and confirm reset.`
                : "Enter your email and new password to reset it."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-4">
            {!showOtpSection && (
              <>
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
                    disabled={otpSending}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" /> {errors.email}
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={handleInputChange(
                        setNewPassword,
                        "newPassword"
                      )}
                      className={errors.newPassword ? "border-red-500" : ""}
                      required
                      disabled={otpSending}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      disabled={otpSending}
                    >
                      {showNewPassword ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </Button>
                  </div>
                  {errors.newPassword && (
                    <p className="text-xs text-red-500 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />{" "}
                      {errors.newPassword}
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirmNewPassword">
                    Confirm New Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmNewPassword"
                      type={showConfirmNewPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmNewPassword}
                      onChange={handleInputChange(
                        setConfirmNewPassword,
                        "confirmNewPassword"
                      )}
                      className={
                        errors.confirmNewPassword ? "border-red-500" : ""
                      }
                      required
                      disabled={otpSending}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground"
                      onClick={() =>
                        setShowConfirmNewPassword(!showConfirmNewPassword)
                      }
                      disabled={otpSending}
                    >
                      {showConfirmNewPassword ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </Button>
                  </div>
                  {errors.confirmNewPassword && (
                    <p className="text-xs text-red-500 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />{" "}
                      {errors.confirmNewPassword}
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={otpSending || isLoading}
                >
                  {otpSending ? "Sending OTP..." : "Send OTP & Proceed"}
                </Button>
              </>
            )}

            {showOtpSection && (
              <>
                <div className="text-center mb-2">
                  <p className="text-sm">
                    An OTP has been sent to <strong>{email}</strong>.
                  </p>
                  <p className="text-sm">
                    Please enter it below to reset your password.
                  </p>
                </div>
                <OtpInput
                  length={4}
                  onComplete={handleOtpComplete}
                  disabled={otpVerifying || passwordChanging}
                />
                {otpError && (
                  <p className="text-sm text-red-500 flex items-center justify-center">
                    <AlertCircle className="w-4 h-4 mr-1" /> {otpError}
                  </p>
                )}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={
                    otpVerifying ||
                    passwordChanging ||
                    !otpValue ||
                    otpValue.length !== 4
                  }
                >
                  {otpVerifying || passwordChanging
                    ? "Verifying & Resetting..."
                    : "Verify OTP & Reset Password"}
                </Button>
                <div className="flex justify-between items-center mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowOtpSection(false);
                      setOtpSent(false);
                      setOtpError("");
                      setOtpValue("");
                    }}
                    className="text-sm text-gray-600 hover:text-gray-900 flex items-center"
                    disabled={otpVerifying || passwordChanging}
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back to form
                  </button>
                  <button
                    type="button"
                    onClick={handleSendOtp} // Resend OTP to the same email
                    disabled={
                      otpSending ||
                      resendDisabled ||
                      otpVerifying ||
                      passwordChanging
                    }
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
              </>
            )}
            <div className="mt-4 text-center text-sm">
              Remembered your password?{" "}
              <Link to={ROUTES.AUTH.LOGIN} className="underline">
                Sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
      <div className="hidden lg:flex items-center justify-center bg-muted">
        <img
          src="/forgot-password.svg?height=1080&width=1920"
          alt="Secure password reset"
          className="max-w-[500px] w-full h-auto object-contain p-6 dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}
