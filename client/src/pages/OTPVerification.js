import React, { useEffect, useRef, useState } from "react";
import { FaAngleLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader } from "lucide-react";
import "../styles/Register.css";
import { useAuthStore } from "../store/useAuthStore";

const OTPVerification = () => {
  const { verifyEmail, resendVerification, isLoading, error, clearError } = useAuthStore(); // Add clearError
  const [otpResend, setOtpResend] = useState(false);
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [localError, setLocalError] = useState("");
  const inputRefs = useRef([]);
  const navigate = useNavigate();

  // Retrieve user data
  const [user, setUser] = useState(null);
  const [previousPage, setPreviousPage] = useState("/");

  // Custom countdown states
  const [countdown, setCountdown] = useState(60);
  const [isCountdownActive, setIsCountdownActive] = useState(true);

  // Clear global error on mount to avoid stale errors
  useEffect(() => {
    clearError(); // Reset error state when entering the OTP page
  }, [clearError]);

  useEffect(() => {
    const pendingUser = localStorage.getItem("pendingUser");
    if (pendingUser) {
      const parsedUser = JSON.parse(pendingUser);
      setUser(parsedUser);
      setPreviousPage(parsedUser.previousPage || "/");
    } else {
      navigate("/register");
    }
  }, [navigate]);

  // Countdown effect
  useEffect(() => {
    let timer;
    if (isCountdownActive && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setIsCountdownActive(false);
      setOtpResend(true);
    }
    return () => clearInterval(timer);
  }, [isCountdownActive, countdown]);

  const startCountdown = () => {
    setCountdown(60);
    setIsCountdownActive(true);
    setOtpResend(false);
  };

  const handleResendOTP = async () => {
    if (!user?.email) {
      setLocalError("User email not found. Please try again.");
      return;
    }

    try {
      await resendVerification(user.email);
      setLocalError(""); // Clear local error on success
      startCountdown();
    } catch (err) {
      setLocalError(err.response?.data?.message || "Failed to resend OTP. Please try again.");
    }
  };

  const handleChange = (index, value) => {
    // Clear errors when typing starts
    if (localError || error) {
      setLocalError("");
      clearError();
    }

    const newCode = [...code];
    if (value.length > 1) {
      const pastedCode = value.slice(0, 6).split("");
      for (let i = 0; i < 6; i++) {
        newCode[i] = pastedCode[i] || "";
      }
      setCode(newCode);
      const lastFilledIndex = newCode.findLastIndex((digit) => digit !== "");
      const focusIndex = lastFilledIndex < 5 ? lastFilledIndex + 1 : 5;
      inputRefs.current[focusIndex].focus();
    } else {
      newCode[index] = value;
      setCode(newCode);
      if (value && index < 5) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleSubmit = React.useCallback(async (e) => {
    if (e) e.preventDefault();

    if (!user?.email) {
      setLocalError("User email not found. Please try again.");
      return;
    }

    try {
      const verificationCode = code.join("");
      await verifyEmail(user.email, verificationCode);
      localStorage.removeItem("pendingUser");
      navigate(previousPage);
    } catch (err) {
      setLocalError(err.response?.data?.message || "Invalid verification code. Please try again.");
    }
  }, [user, code, verifyEmail, navigate, previousPage]);

  useEffect(() => {
    if (code.every((digit) => digit !== "")) {
      handleSubmit();
    }
  }, [code, handleSubmit]);

  return (
    <motion.div
      className="otp-verification-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <FaAngleLeft className="back-arrow" onClick={() => navigate(-1)} />
      <motion.div
        className="otp-verification-card"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h2>Verify Email</h2>
        <p className="otp-info">We have sent a one-time passcode to your email.</p>

        <motion.div
          className="otp-section"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h3>Kindly enter your one-time pass-code here.</h3>
          <div className="otp-input-section">
            <form onSubmit={handleSubmit} className="otp-form">
              <motion.div
                className="otp-input-container"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    maxLength="6"
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="otp-input-box"
                    disabled={isLoading}
                  />
                ))}
              </motion.div>

              {localError && (
                <p className="otp-error">{localError}</p>
              )}

              <div className="otp-button-container">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={isLoading || code.some((digit) => !digit)}
                  className="verify-button"
                >
                  {isLoading ? (
                    <Loader className="loading-spinner" />
                  ) : (
                    "Verify Email"
                  )}
                </motion.button>
              </div>
            </form>
          </div>

          <motion.a
            className="resend-otp-link"
            onClick={otpResend && !isLoading ? handleResendOTP : undefined}
            style={{ cursor: otpResend && !isLoading ? "pointer" : "default" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            Didn't get a code?{" "}
            {otpResend ? (
              <span className="resend-text">Resend OTP</span>
            ) : (
              <span>Resend in {countdown}s</span>
            )}
          </motion.a>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default OTPVerification;