"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { userApi } from "@/api/userApi";
import { Modal } from "@/components/ui/modal.jsx"; // Corrected import
import { Button } from "@/components/ui/button.jsx";
import OtpInput from "@/components/OtpInput.jsx"; // Assuming OtpInput.jsx exists
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert.jsx";
import { Loader2, ShieldAlert } from "lucide-react";
import { ROUTES } from "@/constants/routes";

const DeleteAccountModal = ({ isOpen, onClose }) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState("confirm"); // 'confirm', 'otp', 'deleting'
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep("confirm");
        setOtp("");
        setError(null);
        setIsLoading(false);
        setCountdown(0);
      }, 300);
    }
  }, [isOpen]);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSendOtp = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!currentUser || !currentUser.email) {
        throw new Error(
          "User information is not available. Please log in again."
        );
      }
      const response = await userApi.sendOtp({ email: currentUser.email });
      if (response.data && response.data.success) {
        toast.success(response.data.message || "OTP sent to your email.");
        setStep("otp");
        setCountdown(60);
      } else {
        throw new Error(response.data.message || "Failed to send OTP.");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "An error occurred.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setStep("deleting");

    try {
      const response = await userApi.deleteMyAccount(otp);
      if (response.data && response.data.success) {
        toast.success(
          "Account deleted successfully. You are being logged out."
        );
        await logout();
        navigate(ROUTES.LOGIN, { replace: true });
        if (onClose) onClose(); // Ensure onClose is called
      } else {
        throw new Error(response.data.message || "Failed to delete account.");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "An error occurred.";
      setError(errorMessage);
      toast.error(errorMessage);
      setStep("otp");
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    switch (step) {
      case "otp":
        return (
          <div>
            <p className="text-center text-gray-600 dark:text-gray-300 mb-4">
              An OTP has been sent to <strong>{currentUser?.email}</strong>.
              Please enter it below to confirm account deletion.
            </p>
            <OtpInput length={6} onComplete={setOtp} disabled={isLoading} />
            {error && (
              <p className="text-red-500 text-sm text-center mt-2">{error}</p>
            )}
            <div className="mt-6 flex flex-col gap-3">
              <Button
                onClick={handleDeleteAccount}
                disabled={isLoading || otp.length !== 6}
                variant="destructive"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Verify OTP & Delete Account
              </Button>
              <Button
                variant="link"
                onClick={handleSendOtp}
                disabled={countdown > 0 || isLoading}
                className="text-sm"
              >
                {countdown > 0 ? `Resend OTP in ${countdown}s` : "Resend OTP"}
              </Button>
            </div>
          </div>
        );
      case "deleting":
        return (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-destructive mb-4" />
            <h3 className="text-lg font-semibold dark:text-white">
              Deleting Your Account...
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Please wait. This action is irreversible.
            </p>
          </div>
        );
      case "confirm":
      default:
        return (
          <div>
            <Alert variant="destructive" className="mb-6">
              <ShieldAlert className="h-4 w-4" />
              <AlertTitle>This action is irreversible.</AlertTitle>
              <AlertDescription>
                Deleting your account will permanently remove all your data,
                including tasks, team information, and personal settings. This
                cannot be undone.
              </AlertDescription>
            </Alert>
            {error && (
              <p className="text-red-500 text-sm text-center mb-4">{error}</p>
            )}
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              To confirm, we will send a One-Time Password (OTP) to your
              registered email: <strong>{currentUser?.email}</strong>.
            </p>
            <Button
              onClick={handleSendOtp}
              disabled={isLoading}
              className="w-full"
              variant="destructive"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Send OTP and Continue
            </Button>
          </div>
        );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Your Account"
      className="max-w-md"
    >
      {renderContent()}
    </Modal>
  );
};

export default DeleteAccountModal;
