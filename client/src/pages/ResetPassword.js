import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Tick from "../assets/tick.svg";
import { motion } from "framer-motion";
import "../styles/ResetPassword.css";
import EmailIcon from "@mui/icons-material/Email";
import { FaAngleLeft } from "react-icons/fa";
import { useAuthStore } from "../store/useAuthStore";

export default function ResetPassword() {
  const navigate = useNavigate();
  const { forgotPassword, resendResetLink, isLoading, error, clearError } = useAuthStore(); // Add clearError
  const [resetStep, setResetStep] = useState("email"); // email, success
  const [email, setEmail] = useState("");
  const [localError, setLocalError] = useState(""); // Add local error state
  const [countdown, setCountdown] = useState(null);
  const [isCountdownActive, setIsCountdownActive] = useState(false);

  // Clear global error on mount to avoid stale errors
  useEffect(() => {
    clearError(); // Reset error state when entering the page
  }, [clearError]);

  // Check if there's a token in the URL (for direct reset link access)
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const token = queryParams.get("token");
    if (token) {
      navigate(`/new-password?token=${token}`);
    }
  }, [navigate]);

  // Scroll to top when resetStep changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [resetStep]);

  // Countdown effect
  useEffect(() => {
    let timer;
    if (isCountdownActive && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setIsCountdownActive(false);
      setCountdown(null);
    }
    return () => clearInterval(timer);
  }, [isCountdownActive, countdown]);

  const startCountdown = () => {
    setCountdown(60);
    setIsCountdownActive(true);
  };

  const handleEmailChange = (e) => {
    // Clear errors when typing starts
    if (localError || error) {
      setLocalError("");
      clearError();
    }
    setEmail(e.target.value);
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    try {
      await forgotPassword(email);
      setLocalError(""); // Clear local error on success
      setResetStep("success");
      startCountdown();
    } catch (err) {
      setLocalError(err.response?.data?.message || "Failed to send reset link. Please try again.");
    }
  };

  const handleResendLink = async () => {
    try {
      await resendResetLink(email);
      setLocalError(""); // Clear local error on success
      startCountdown();
    } catch (err) {
      setLocalError(err.response?.data?.message || "Failed to resend reset link. Please try again.");
    }
  };

  return (
    <motion.div
      className="reset-password-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <FaAngleLeft className="back-arrow" onClick={() => navigate(-1)} />
      <div className="reset-password-card">
        <div className="reset-password-header">
          <h1>Reset Your Password</h1>
          <p>
            {resetStep === "email"
              ? "Enter your email to receive a password reset link"
              : "Check your email for the password reset link"}
          </p>
        </div>

        {resetStep === "email" && (
          <form className="reset-password-form" onSubmit={handleEmailSubmit}>
            <div className="reset-password-icon">
              <EmailIcon className="icon" />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={handleEmailChange}
                required
                disabled={isLoading}
              />
            </div>

            {localError && <div className="error-message">{localError}</div>}

            <button
              type="submit"
              className="reset-password-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? "Sending..." : "Send Reset Link"}
            </button>

            <div className="reset-password-footer">
              <p>
                Remember your password?{" "}
                <Link to="/login" className="login-link">
                  Sign In
                </Link>
              </p>
            </div>
          </form>
        )}

        {resetStep === "success" && (
          <motion.div
            className="reset-password-form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="reset-password-icon">
              <img src={Tick} alt="Success" />
            </div>

            <div className="reset-success-message">
              <p>A password reset link has been sent to:</p>
              <p className="reset-email">{email}</p>
              <p>
                Please check your inbox and click on the link to reset your
                password.
              </p>
            </div>

            {localError && <div className="error-message">{localError}</div>}

            <div className="reset-password-options">
              <button
                type="button"
                className="resend-code-btn"
                onClick={handleResendLink}
                disabled={isLoading || isCountdownActive}
              >
                {isLoading
                  ? "Resending..."
                  : isCountdownActive
                  ? `Resend in ${countdown}s`
                  : "Resend Link"}
              </button>
              <button
                type="button"
                className="back-btn"
                onClick={() => setResetStep("email")}
                disabled={isLoading}
              >
                Change Email
              </button>
            </div>

            <div className="reset-password-footer">
              <p>
                Remember your password?{" "}
                <Link to="/login" className="login-link">
                  Sign In
                </Link>
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}