import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "../styles/Login.css";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import PersonIcon from "@mui/icons-material/Person";
import CreateIcon from "@mui/icons-material/Create";
import { FaAngleLeft } from "react-icons/fa";
import { useAuthStore } from "../store/useAuthStore";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, clearError } = useAuthStore(); // Add clearError
  const [userType, setUserType] = useState("reader");

  const [readerData, setReaderData] = useState({
    email: "",
    password: "",
    rememberMe: false,
    showPassword: false,
    error: null,
  });

  const [bloggerData, setBloggerData] = useState({
    email: "",
    password: "",
    rememberMe: false,
    showPassword: false,
    error: null,
  });

  const currentData = userType === "reader" ? readerData : bloggerData;
  const setCurrentData = userType === "reader" ? setReaderData : setBloggerData;

  // Clear global error on mount to avoid stale errors in useAuthStore
  useEffect(() => {
    clearError(); // Reset error state when entering the page
  }, [clearError]);

  // Store the current path as the "previous page" before login
  useEffect(() => {
    if (location.pathname !== "/login") {
      localStorage.setItem("lastVisitedPage", location.pathname);
    }
  }, [location.pathname]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const credentials = {
        email: currentData.email,
        password: currentData.password,
        rememberMe: currentData.rememberMe,
        role: userType,
      };

      await login(credentials);

      const previousPage = localStorage.getItem("lastVisitedPage") || "/";
      navigate(previousPage);
    } catch (err) {
      setCurrentData((prev) => ({
        ...prev,
        error: err.response?.data?.message || "Login failed. Please try again.",
      }));
      console.error("Login error:", err);
    }
  };

  const togglePasswordVisibility = () => {
    setCurrentData((prev) => ({
      ...prev,
      showPassword: !prev.showPassword,
    }));
  };

  const handleInputChange = (field) => (e) => {
    const value = field === "rememberMe" ? e.target.checked : e.target.value;
    setCurrentData((prev) => ({
      ...prev,
      [field]: value,
      error: null, // Clear error when typing starts
    }));
    if (field !== "rememberMe") {
      clearError(); // Clear global error from useAuthStore
    }
  };

  const switchUserType = (type) => {
    setUserType(type);
    // Clear error when switching user type
    setCurrentData((prev) => ({
      ...prev,
      error: null,
    }));
    clearError();
  };

  return (
    <div className="login-container">
      <FaAngleLeft className="back-arrow" onClick={() => navigate(-1)} />
      <div className="login-card">
        <div className="login-header">
          <h1>Welcome Back</h1>
          <p>Sign in to continue to MyBlog</p>
        </div>

        <div className="user-type-toggle">
          <button
            className={`toggle-btn ${userType === "reader" ? "active" : ""}`}
            onClick={() => switchUserType("reader")}
          >
            <PersonIcon className="toggle-icon" />
            Reader
          </button>
          <button
            className={`toggle-btn ${userType === "blogger" ? "active" : ""}`}
            onClick={() => switchUserType("blogger")}
          >
            <CreateIcon className="toggle-icon" />
            Blogger
          </button>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor={`${userType}-email`}>Email</label>
            <input
              id={`${userType}-email`}
              type="email"
              placeholder={`Enter your ${userType} email`}
              value={currentData.email}
              onChange={handleInputChange("email")}
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor={`${userType}-password`}>Password</label>
            <div className="password-input-container">
              <input
                id={`${userType}-password`}
                type={currentData.showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={currentData.password}
                onChange={handleInputChange("password")}
                required
                disabled={isLoading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={togglePasswordVisibility}
                disabled={isLoading}
              >
                {currentData.showPassword ? (
                  <VisibilityOffIcon />
                ) : (
                  <VisibilityIcon />
                )}
              </button>
            </div>
          </div>

          <div className="form-options">
            <div className="remember-me">
              <div>
                <input
                  type="checkbox"
                  id={`${userType}-rememberMe`}
                  checked={currentData.rememberMe}
                  onChange={handleInputChange("rememberMe")}
                  disabled={isLoading}
                />
                <label htmlFor={`${userType}-rememberMe`}>Remember Me</label>
              </div>
            </div>
            <Link to="/forgot-password" className="forgot-password">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            className="login-submit-btn"
            disabled={isLoading}
          >
            {isLoading ? "Signing In..." : "Sign In"}
          </button>

          {currentData.error && (
            <div className="error-message">{currentData.error}</div>
          )}

          <div className="login-footer">
            <p>
              Don't have an account?{" "}
              <Link to="/register" className="register-link">
                Sign Up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}