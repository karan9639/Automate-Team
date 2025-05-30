"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import OtpInput from "@/components/OtpInput";
import { userApi } from "@/api/userApi";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";
import {
  Eye,
  EyeOff,
  AlertCircle,
  Mail,
  ArrowLeft,
  KeyRound,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";

const validateChangePasswordForm = (formData) => {
  const errors = {};
  if (!formData.currentPassword)
    errors.currentPassword = "Current password is required.";

  if (!formData.newPassword) errors.newPassword = "New password is required.";
  else if (formData.newPassword.length < 6)
    errors.newPassword = "New password must be at least 6 characters.";

  if (!formData.confirmNewPassword)
    errors.confirmNewPassword = "Confirm new password is required.";
  else if (formData.newPassword !== formData.confirmNewPassword)
    errors.confirmNewPassword = "New passwords do not match.";

  return errors;
};

export default function ChangePasswordPage() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false); // Combined loading state
  const [otpSending, setOtpSending] = useState(false);
  const [passwordChanging, setPasswordChanging] = useState(false);

  const [showOtpSection, setShowOtpSection] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [otpError, setOtpError] = useState("");
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (!currentUser) {
      navigate(ROUTES.AUTH.LOGIN);
    }
  }, [currentUser, navigate]);

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
    const formData = { currentPassword, newPassword, confirmNewPassword };
    const validationErrors = validateChangePasswordForm(formData);
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
    setIsLoading(true);
    try {
      const response = await userApi.sendOtp({ email: currentUser.email });
      if (response.data.success) {
        toast.success(response.data.message || "OTP sent to your email.");
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
      setIsLoading(false);
    }
  };

  const handleChangePasswordWithOtp = async () => {
    if (!otpValue || otpValue.length !== 4) {
      setOtpError("Please enter a valid 4-digit OTP.");
      return;
    }
    setPasswordChanging(true);
    setOtpError("");
    setIsLoading(true);

    try {
      // Backend should verify OTP again with the change password request or use a sessionized OTP.
      // The flow implies OTP is part of the changePassword payload for verification.
      const changePasswordPayload = {
        email: currentUser.email,
        currentPassword,
        incomingPassword: newPassword, // Changed from newPassword to incomingPassword
        otp: otpValue,
      };
      const response = await userApi.changePassword(changePasswordPayload);

      if (response.data.success) {
        toast.success(
          response.data.message ||
            "Password changed successfully! Please log in again for security."
        );
        await logout(); // Log out user for security
        navigate(ROUTES.AUTH.LOGIN);
      } else {
        toast.error(
          response.data.message ||
            "Failed to change password. Check OTP or current password."
        );
        setOtpError(response.data.message || "Password change failed."); // Show error near OTP if relevant
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "An error occurred. Please try again.";
      toast.error(errorMessage);
      setOtpError(errorMessage);
    } finally {
      setPasswordChanging(false);
      setIsLoading(false);
    }
  };

  const handleOtpComplete = (otp) => {
    setOtpValue(otp);
    setOtpError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (showOtpSection) {
      handleChangePasswordWithOtp();
    } else {
      handleSendOtp();
    }
  };

  if (!currentUser) return <p>Loading user data...</p>; // Or a spinner

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center">
            <KeyRound className="w-6 h-6 mr-2 text-blue-600" />
            Change Password
          </CardTitle>
          <CardDescription>
            {showOtpSection
              ? `An OTP has been sent to ${currentUser.email}. Please enter it below.`
              : "Update your password below. An OTP will be sent to your email for verification."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {!showOtpSection && (
              <>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={currentUser.email}
                    disabled
                    className="mt-1 bg-gray-100"
                  />
                </div>
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative mt-1">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={handleInputChange(
                        setCurrentPassword,
                        "currentPassword"
                      )}
                      className={errors.currentPassword ? "border-red-500" : ""}
                      required
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground"
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                      disabled={isLoading}
                    >
                      {showCurrentPassword ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </Button>
                  </div>
                  {errors.currentPassword && (
                    <p className="text-xs text-red-500 mt-1 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {errors.currentPassword}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative mt-1">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={handleInputChange(
                        setNewPassword,
                        "newPassword"
                      )}
                      className={errors.newPassword ? "border-red-500" : ""}
                      required
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      disabled={isLoading}
                    >
                      {showNewPassword ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </Button>
                  </div>
                  {errors.newPassword && (
                    <p className="text-xs text-red-500 mt-1 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {errors.newPassword}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="confirmNewPassword">
                    Confirm New Password
                  </Label>
                  <div className="relative mt-1">
                    <Input
                      id="confirmNewPassword"
                      type={showConfirmNewPassword ? "text" : "password"}
                      value={confirmNewPassword}
                      onChange={handleInputChange(
                        setConfirmNewPassword,
                        "confirmNewPassword"
                      )}
                      className={
                        errors.confirmNewPassword ? "border-red-500" : ""
                      }
                      required
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground"
                      onClick={() =>
                        setShowConfirmNewPassword(!showConfirmNewPassword)
                      }
                      disabled={isLoading}
                    >
                      {showConfirmNewPassword ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </Button>
                  </div>
                  {errors.confirmNewPassword && (
                    <p className="text-xs text-red-500 mt-1 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
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
                <OtpInput
                  length={4}
                  onComplete={handleOtpComplete}
                  disabled={passwordChanging || isLoading}
                />
                {otpError && (
                  <p className="text-sm text-red-500 flex items-center justify-center mt-2">
                    <AlertCircle className="w-4 h-4 mr-1" /> {otpError}
                  </p>
                )}
                <Button
                  type="submit"
                  className="w-full mt-4"
                  disabled={
                    passwordChanging ||
                    isLoading ||
                    !otpValue ||
                    otpValue.length !== 4
                  }
                >
                  {passwordChanging
                    ? "Changing Password..."
                    : "Verify OTP & Change Password"}
                </Button>
                <div className="flex justify-between items-center mt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowOtpSection(false);
                      setOtpError("");
                      setOtpValue("");
                    }}
                    className="text-sm text-gray-600 hover:text-gray-900 flex items-center"
                    disabled={passwordChanging || isLoading}
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Edit Details
                  </button>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={
                      otpSending ||
                      resendDisabled ||
                      passwordChanging ||
                      isLoading
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
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
