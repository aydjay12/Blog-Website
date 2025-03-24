import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import "../styles/NewPassword.css";
import LockIcon from "@mui/icons-material/Lock";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { FaAngleLeft } from "react-icons/fa";
import { useAuthStore } from "../store/useAuthStore";

export default function NewPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { resetPassword, isLoading, error, clearError } = useAuthStore(); // Add clearError
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [localError, setLocalError] = useState(""); // Add local error state
  const [isSuccess, setIsSuccess] = useState(false);
  const token = searchParams.get("token");

  // Password validation criteria
  const [validations, setValidations] = useState({
    hasLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecial: false,
  });

  // Clear global error on mount to avoid stale errors
  useEffect(() => {
    clearError(); // Reset error state when entering the page
  }, [clearError]);

  // Check password strength
  useEffect(() => {
    if (password) {
      const newValidations = {
        hasLength: password.length >= 8,
        hasUppercase: /[A-Z]/.test(password),
        hasLowercase: /[a-z]/.test(password),
        hasNumber: /[0-9]/.test(password),
        hasSpecial: /[^A-Za-z0-9]/.test(password),
      };
      setValidations(newValidations);
      const strength = Object.values(newValidations).filter(Boolean).length;
      setPasswordStrength(strength);
    } else {
      setPasswordStrength(0);
      setValidations({
        hasLength: false,
        hasUppercase: false,
        hasLowercase: false,
        hasNumber: false,
        hasSpecial: false,
      });
    }
  }, [password]);

  // Check if passwords match
  useEffect(() => {
    if (confirmPassword) {
      setPasswordMatch(password === confirmPassword);
    } else {
      setPasswordMatch(true);
    }
  }, [password, confirmPassword]);

  // Scroll to top when success state changes
  useEffect(() => {
    if (isSuccess) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [isSuccess]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handlePasswordChange = (e) => {
    // Clear errors when typing starts
    if (localError || error) {
      setLocalError("");
      clearError();
    }
    setPassword(e.target.value);
  };

  const handleConfirmPasswordChange = (e) => {
    // Clear errors when typing starts
    if (localError || error) {
      setLocalError("");
      clearError();
    }
    setConfirmPassword(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      Object.values(validations).every(Boolean) &&
      passwordMatch &&
      password === confirmPassword
    ) {
      try {
        await resetPassword(token, password);
        setLocalError(""); // Clear local error on success
        setIsSuccess(true);
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } catch (err) {
        setLocalError(
          err.response?.data?.message ||
            "Failed to reset password. Please try again."
        );
      }
    } else {
      setLocalError(
        "Please ensure all password requirements are met and passwords match."
      );
    }
  };

  return (
    <motion.div
      className="new-password-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <FaAngleLeft className="back-arrow" onClick={() => navigate(-1)} />
      <div className="new-password-card">
        {!isSuccess ? (
          <>
            <div className="new-password-header">
              <h1>Create New Password</h1>
              <p>Your new password must be different from previous passwords</p>
            </div>

            <form className="new-password-form" onSubmit={handleSubmit}>
              <div className="new-password-icon">
                <LockIcon className="icon" />
              </div>

              <div className="form-group">
                <label htmlFor="new-password">New Password</label>
                <div className="password-input-container">
                  <input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={password}
                    onChange={handlePasswordChange}
                    className={
                      password && passwordStrength < 3 ? "weak-password" : ""
                    }
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={togglePasswordVisibility}
                    disabled={isLoading}
                  >
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </button>
                </div>

                {password && (
                  <div className="password-strength-meter">
                    <div className="strength-bars">
                      <div
                        className={`strength-bar ${
                          passwordStrength >= 1 ? "active" : ""
                        }`}
                      ></div>
                      <div
                        className={`strength-bar ${
                          passwordStrength >= 2 ? "active" : ""
                        }`}
                      ></div>
                      <div
                        className={`strength-bar ${
                          passwordStrength >= 3 ? "active" : ""
                        }`}
                      ></div>
                      <div
                        className={`strength-bar ${
                          passwordStrength >= 4 ? "active" : ""
                        }`}
                      ></div>
                      <div
                        className={`strength-bar ${
                          passwordStrength >= 5 ? "active" : ""
                        }`}
                      ></div>
                    </div>
                    <span
                      className={`strength-text strength-${passwordStrength}`}
                    >
                      {passwordStrength === 0 && "Very Weak"}
                      {passwordStrength === 1 && "Weak"}
                      {passwordStrength === 2 && "Medium"}
                      {passwordStrength === 3 && "Strong"}
                      {passwordStrength >= 4 && "Very Strong"}
                    </span>
                  </div>
                )}

                <div className="password-requirements">
                  <p>Your password must contain:</p>
                  <ul>
                    <li className={validations.hasLength ? "valid" : ""}>
                      At least 8 characters
                    </li>
                    <li className={validations.hasUppercase ? "valid" : ""}>
                      At least one uppercase letter (A-Z)
                    </li>
                    <li className={validations.hasLowercase ? "valid" : ""}>
                      At least one lowercase letter (a-z)
                    </li>
                    <li className={validations.hasNumber ? "valid" : ""}>
                      At least one number (0-9)
                    </li>
                    <li className={validations.hasSpecial ? "valid" : ""}>
                      At least one special character (!@#$%^&*)
                    </li>
                  </ul>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirm-password">Confirm Password</label>
                <div className="password-input-container">
                  <input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    className={
                      !passwordMatch && confirmPassword
                        ? "password-mismatch"
                        : ""
                    }
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={toggleConfirmPasswordVisibility}
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? (
                      <VisibilityOffIcon />
                    ) : (
                      <VisibilityIcon />
                    )}
                  </button>
                </div>
                {!passwordMatch && confirmPassword && (
                  <div className="password-error-message">
                    Passwords do not match
                  </div>
                )}
              </div>

              {localError && <div className="error-message">{localError}</div>}

              <button
                type="submit"
                className="new-password-submit-btn"
                disabled={!passwordMatch || passwordStrength < 3 || isLoading}
              >
                {isLoading ? "Resetting..." : "Set New Password"}
              </button>

              <div className="new-password-footer">
                <p>
                  Remember your password?{" "}
                  <Link to="/login" className="login-link">
                    Sign In
                  </Link>
                </p>
              </div>
            </form>
          </>
        ) : (
          <div className="password-success">
            <div className="success-icon">
              <CheckCircleIcon style={{ fontSize: 60, color: "#4CAF50" }} />
            </div>
            <h2>Password Updated Successfully!</h2>
            <p>
              Your password has been changed. You will be redirected to the
              login page shortly.
            </p>
            <Link to="/login" className="login-now-btn">
              Login Now
            </Link>
          </div>
        )}
      </div>
    </motion.div>
  );
}
