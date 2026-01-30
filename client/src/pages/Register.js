import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import "../styles/Register.css";
import { FaAngleLeft } from "react-icons/fa";
import { useAuthStore } from "../store/useAuthStore"; // Adjust the path as needed

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const { register, isLoading, clearError } = useAuthStore();
  const [isReader, setIsReader] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Common form data
  const [commonData, setCommonData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Blogger-specific form data
  const [bloggerData, setBloggerData] = useState({
    displayName: "",
    bio: "",
    categories: [],
  });

  const [errors, setErrors] = useState({});

  // Available categories for bloggers
  const availableCategories = [
    "Technology",
    "Travel",
    "Lifestyle",
    "Health",
    "Business",
    "Creativity",
  ];

  useEffect(() => {
    clearError(); // Reset error state when entering the register page
  }, [clearError]);

  // Store the current path as the "previous page" before registration
  useEffect(() => {
    // Only store if not already on /register or /verify-otp to avoid overwriting
    if (location.pathname !== "/register" && location.pathname !== "/verify-otp") {
      localStorage.setItem("lastVisitedPage", location.pathname);
    }
  }, [location.pathname]);

  const handleSwitchToggle = () => {
    setIsReader(!isReader);
    setErrors({});
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleCommonInputChange = (e) => {
    const { name, value } = e.target;
    setCommonData({
      ...commonData,
      [name]: value,
    });

    if (errors[name] || errors.submit) {
      setErrors({
        ...errors,
        [name]: "",
        submit: "", // Clear submit error when user starts typing
      });
    }
  };

  const handleBloggerInputChange = (e) => {
    const { name, value } = e.target;
    setBloggerData({
      ...bloggerData,
      [name]: value,
    });

    if (errors[name] || errors.submit) {
      setErrors({
        ...errors,
        [name]: "",
        submit: "", // Clear submit error when user starts typing
      });
    }
  };

  const handleCategoryToggle = (category) => {
    const updatedCategories = [...bloggerData.categories];
    if (updatedCategories.includes(category)) {
      const index = updatedCategories.indexOf(category);
      updatedCategories.splice(index, 1);
    } else {
      updatedCategories.push(category);
    }
    setBloggerData({
      ...bloggerData,
      categories: updatedCategories,
    });

    if (errors.categories) {
      setErrors({
        ...errors,
        categories: "",
      });
    }
  };

  const validateReaderForm = () => {
    const newErrors = {};
    if (!commonData.username.trim())
      newErrors.username = "Username is required";
    if (!commonData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(commonData.email)) {
      newErrors.email = "Email address is invalid";
    }
    if (!commonData.password) {
      newErrors.password = "Password is required";
    } else if (!/^(?=.*[A-Z])(?=.*[\W_]).{8,}$/.test(commonData.password)) {
      newErrors.password =
        "Password must contain at least 8 characters, one uppercase letter, and one symbol";
    }
    if (commonData.password !== commonData.confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match";
    }
    return newErrors;
  };

  const validateBloggerForm = () => {
    const newErrors = validateReaderForm();
    if (!bloggerData.displayName.trim())
      newErrors.displayName = "Display name is required";
    if (!bloggerData.bio.trim()) newErrors.bio = "Short bio is required";
    if (bloggerData.categories.length === 0)
      newErrors.categories = "Select at least one category";
    return newErrors;
  };

  const handleReaderSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateReaderForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const userData = {
        username: commonData.username,
        email: commonData.email,
        password: commonData.password,
        role: "reader",
      };
      await register(userData);
      localStorage.setItem(
        "pendingUser",
        JSON.stringify({
          email: commonData.email,
          role: "reader",
          previousPage: localStorage.getItem("lastVisitedPage") || "/",
        })
      );
      navigate("/verify-otp");
    } catch (err) {
      setErrors({
        submit: err.response?.data?.message || "Failed to register. Please try again."
      });
    }
  };

  const handleBloggerSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateBloggerForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const userData = {
        username: commonData.username,
        email: commonData.email,
        password: commonData.password,
        role: "blogger",
        displayName: bloggerData.displayName,
        bio: bloggerData.bio,
        categories: bloggerData.categories,
      };
      await register(userData);
      localStorage.setItem(
        "pendingUser",
        JSON.stringify({
          email: commonData.email,
          role: "blogger",
          previousPage: localStorage.getItem("lastVisitedPage") || "/",
        })
      );
      navigate("/verify-otp");
    } catch (err) {
      setErrors({
        submit: err.response?.data?.message || "Failed to register. Please try again."
      });
    }
  };

  const renderCommonFormElements = () => (
    <>
      <div className="form-group">
        <label htmlFor="username">Username</label>
        <input
          type="text"
          id="username"
          name="username"
          placeholder="Choose a username"
          value={commonData.username}
          onChange={handleCommonInputChange}
          className={errors.username ? "error" : ""}
          disabled={isLoading}
        />
        {errors.username && (
          <span className="error-message">{errors.username}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          placeholder="Your email address"
          value={commonData.email}
          onChange={handleCommonInputChange}
          className={errors.email ? "error" : ""}
          disabled={isLoading}
        />
        {errors.email && <span className="error-message">{errors.email}</span>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <div className="password-input-container">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              placeholder="Create a password"
              value={commonData.password}
              onChange={handleCommonInputChange}
              className={errors.password ? "error" : ""}
              disabled={isLoading}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
            </button>
          </div>
          {errors.password && (
            <span className="error-message">{errors.password}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <div className="password-input-container">
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={commonData.confirmPassword}
              onChange={handleCommonInputChange}
              className={errors.confirmPassword ? "error" : ""}
              disabled={isLoading}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={toggleConfirmPasswordVisibility}
            >
              {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
            </button>
          </div>
          {errors.confirmPassword && (
            <span className="error-message">{errors.confirmPassword}</span>
          )}
        </div>
      </div>
    </>
  );

  const renderFormFooter = () => (
    <div className="form-footer">
      <button
        type="submit"
        className={`register-btn ${isLoading ? "loading" : ""}`}
        disabled={isLoading}
      >
        {isLoading ? "Creating Account..." : "Create Account"}
      </button>
      <p className="login-link">
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );

  return (
    <motion.div
      className="register-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <FaAngleLeft className="back-arrow" onClick={() => navigate(-1)} />
      <div className="register-card">
        <div className="register-header">
          <h2>Create an Account</h2>
          <p>Join our community today</p>

          <div className="account-type-switch">
            <span className={isReader ? "active" : ""}>Reader</span>
            <div className="toggle-switch">
              <input
                type="checkbox"
                id="switch"
                checked={!isReader}
                onChange={handleSwitchToggle}
              />
              <label htmlFor="switch"></label>
            </div>
            <span className={!isReader ? "active" : ""}>Blogger</span>
          </div>
        </div>

        {isReader && (
          <form className="register-form" onSubmit={handleReaderSubmit}>
            {renderCommonFormElements()}
            {errors.submit && (
              <div className="error-message form-error">{errors.submit}</div>
            )}
            {renderFormFooter()}
          </form>
        )}

        {!isReader && (
          <form className="register-form" onSubmit={handleBloggerSubmit}>
            {renderCommonFormElements()}

            <div className="blogger-fields">
              <div className="form-group">
                <label htmlFor="displayName">Display Name</label>
                <input
                  type="text"
                  id="displayName"
                  name="displayName"
                  placeholder="Name shown on your articles"
                  value={bloggerData.displayName}
                  onChange={handleBloggerInputChange}
                  className={errors.displayName ? "error" : ""}
                  disabled={isLoading}
                />
                {errors.displayName && (
                  <span className="error-message">{errors.displayName}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="bio">Short Bio</label>
                <textarea
                  id="bio"
                  name="bio"
                  placeholder="Tell readers a bit about yourself"
                  value={bloggerData.bio}
                  onChange={handleBloggerInputChange}
                  className={errors.bio ? "error" : ""}
                  rows="5"
                  disabled={isLoading}
                ></textarea>
                {errors.bio && (
                  <span className="error-message">{errors.bio}</span>
                )}
              </div>

              <div className="form-group">
                <label>Writing Categories</label>
                <div className="categories-selection">
                  {availableCategories.map((category) => (
                    <div
                      key={category}
                      className={`category-chip ${bloggerData.categories.includes(category)
                          ? "selected"
                          : ""
                        }`}
                      onClick={() =>
                        !isLoading && handleCategoryToggle(category)
                      }
                    >
                      {category}
                    </div>
                  ))}
                </div>
                {errors.categories && (
                  <span className="error-message">{errors.categories}</span>
                )}
              </div>
            </div>

            {errors.submit && (
              <div className="error-message form-error">{errors.submit}</div>
            )}
            {renderFormFooter()}
          </form>
        )}
      </div>
    </motion.div>
  );
}
