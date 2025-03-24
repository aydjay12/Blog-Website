import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaCamera, FaSave, FaEdit } from "react-icons/fa";
import { CircleUserRound, Loader } from "lucide-react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import { FaSignOutAlt } from "react-icons/fa";
import "../styles/Settings.css";
import ProfilePic from "../assets/ProfilePic.svg";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const navigate = useNavigate();
  const {
    user,
    isAuthenticated,
    getProfile,
    updateProfile,
    uploadProfileImage,
    logout,
    isLoading: storeLoading, // Rename to avoid confusion
    error,
  } = useAuthStore();

  const [isEditing, setIsEditing] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(false); // New state for profile operations
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    gender: "",
    role: "",
    displayName: "",
    bio: "",
    categories: [],
    profileImage: null,
  });
  const [imageFile, setImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorNotification, setErrorNotification] = useState({
    isOpen: false,
    message: "",
  });

  const availableCategories = [
    "Technology",
    "Travel",
    "Lifestyle",
    "Health",
    "Business",
    "Creativity",
  ];

  // Fetch profile and handle error notification
  useEffect(() => {
    const fetchProfile = async () => {
      if (isAuthenticated) {
        try {
          setIsProfileLoading(true);
          await getProfile(); // Fetch latest profile data on mount
        } catch (err) {
          console.error("Failed to fetch profile:", err);
          showErrorNotification("Failed to fetch profile");
        } finally {
          setIsProfileLoading(false);
        }
      }
    };
    fetchProfile();
  }, [isAuthenticated, getProfile]);

  // Sync form data and show error notification when error changes
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        email: user.email || "",
        phone: user.phone || "", // Ensure this reflects the latest value
        gender: user.gender || "", // Ensure this reflects the latest value
        role: user.role || "",
        displayName: user.displayName || "",
        bio: user.bio || "",
        categories: user.categories || [],
        profileImage: user.profileImage || null,
      });
      setPreviewImage(user.profileImage || null);
    }
    if (error) {
      showErrorNotification(error);
    }
  }, [user, error]);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      const cleanedValue = value.replace(/[^0-9-()+ ]/g, "");
      setFormData({ ...formData, [name]: cleanedValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCategoryToggle = (category) => {
    const updatedCategories = [...formData.categories];
    if (updatedCategories.includes(category)) {
      updatedCategories.splice(updatedCategories.indexOf(category), 1);
    } else {
      updatedCategories.push(category);
    }
    setFormData({ ...formData, categories: updatedCategories });
  };

  const showErrorNotification = (message) => {
    setErrorNotification({ isOpen: true, message });
    setTimeout(
      () => setErrorNotification({ isOpen: false, message: "" }),
      3000
    );
  };

  const handleSave = async () => {
    try {
      setIsProfileLoading(true);
      if (imageFile) {
        await uploadProfileImage(imageFile);
        setImageFile(null);
      }

      // Always send all editable fields to ensure consistency
      const profileData = {
        username: formData.username,
        email: formData.email,
        phone: formData.phone || "", // Ensure empty string is sent if unset
        gender: formData.gender || "", // Ensure empty string is sent if unset
      };

      if (formData.role === "blogger") {
        profileData.displayName = formData.displayName;
        profileData.bio = formData.bio;
        profileData.categories = formData.categories;
      }

      await updateProfile(profileData);
      await getProfile(); // Fetch latest profile data after update

      setSuccessMessage("Profile updated successfully!");
      setIsEditing(false);
      setTimeout(() => setSuccessMessage(""), 3000);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Error saving profile:", err);
      showErrorNotification("Failed to save profile changes");
      setSuccessMessage("");
    } finally {
      setIsProfileLoading(false);
    }
  };

  const handleLogout = () => {
    setShowLogoutDialog(true);
  };

  const confirmLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      setShowLogoutDialog(false);
      setIsLoggingOut(false);
      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err);
      showErrorNotification("Failed to log out");
      setIsLoggingOut(false);
    }
  };

  const logoutDialog = (
    <Dialog
      open={showLogoutDialog}
      onClose={() => setShowLogoutDialog(false)}
      aria-labelledby="logout-dialog-title"
      aria-describedby="logout-dialog-description"
      PaperProps={{
        style: {
          borderRadius: "10px",
          padding: "0.5rem 0",
          minWidth: "350px",
        },
      }}
    >
      <DialogTitle id="logout-dialog-title">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          Confirm Logout
        </motion.div>
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="logout-dialog-description">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            Are you sure you want to log out of your account?
          </motion.div>
        </DialogContentText>
      </DialogContent>
      <DialogActions style={{ paddingBottom: "25px", paddingRight: "24px" }}>
        <Button
          onClick={() => setShowLogoutDialog(false)}
          color="primary"
          variant="outlined"
          component={motion.button}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          sx={{
            textTransform: "none",
            borderRadius: "6px",
            fontFamily: "inherit",
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={confirmLogout}
          color="error"
          variant="contained"
          component={motion.button}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          sx={{
            textTransform: "none",
            borderRadius: "6px",
            fontFamily: "inherit",
            backgroundColor: "#f44336",
          }}
          disabled={isLoggingOut}
        >
          <AnimatePresence mode="wait">
            {isLoggingOut ? (
              <motion.span
                key="logging-out"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                Logging out
              </motion.span>
            ) : (
              <motion.span
                key="logout"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <motion.div
      className="settings-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      layout
    >
      <motion.div
        className="settings-header"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h1>Account Settings</h1>
        <p>Manage your profile information and account preferences</p>
      </motion.div>
      <motion.div
        className="settings-content"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="settings-wrapper">
          <div className="settings-title">
            <h2>Update Your Account</h2>
            <button
              className="settings-delete-btn"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="button-content"
              >
                <FaSignOutAlt className="delete-icon" />
                <span>Logout</span>
              </motion.div>
            </button>
          </div>

          {successMessage && (
            <motion.div
              className="settings-success-message"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              {successMessage}
            </motion.div>
          )}

          <div className="settings-form">
            <div className="form-section avatar-section">
              <motion.div
                className="settings-profile-picture"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4 }}
                key={previewImage || "default-avatar"}
              >
                {previewImage ? (
                  <motion.img
                    src={previewImage}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    alt="Profile"
                  />
                ) : (
                  <motion.img
                    src={ProfilePic}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    alt="Profile"
                  />
                )}
                <AnimatePresence>
                  {isEditing && (
                    <motion.label
                      htmlFor="fileInput"
                      className="upload-icon-wrapper"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.3 }}
                      whileHover={{ scale: 1.1 }}
                    >
                      <FaCamera />
                      <input
                        id="fileInput"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        style={{ display: "none" }}
                        disabled={isProfileLoading}
                      />
                    </motion.label>
                  )}
                </AnimatePresence>
              </motion.div>
              <div
                className="user-role"
                style={{ textTransform: "capitalize" }}
              >
                {formData.role}
              </div>
            </div>

            <div className="form-section info-section">
              <div className="info-grid">
                <div className="form-group">
                  <label>Username</label>
                  <AnimatePresence mode="wait">
                    {isEditing ? (
                      <motion.input
                        key="username-input"
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="Enter username"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        disabled={isProfileLoading}
                      />
                    ) : (
                      <motion.div
                        key="username-value"
                        className="info-value"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        {formData.username || "Not set"}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <motion.input
                    key="email-input"
                    type="email"
                    name="email"
                    value={formData.email || "No User"}
                    readOnly
                    className="readonly-input"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  />
                </div>

                <div className="form-group">
                  <label>Phone</label>
                  <AnimatePresence mode="wait">
                    {isEditing ? (
                      <motion.input
                        key="phone-input"
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Enter phone number (e.g., 123-456-7890)"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        disabled={isProfileLoading}
                      />
                    ) : (
                      <motion.div
                        key="phone-value"
                        className="info-value"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        {formData.phone || "Not set"}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="form-group">
                  <label>Gender</label>
                  <AnimatePresence mode="wait">
                    {isEditing ? (
                      <motion.select
                        key="gender-select"
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        disabled={isProfileLoading}
                      >
                        <option value="">Not specified</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </motion.select>
                    ) : (
                      <motion.div
                        key="gender-value"
                        className="info-value"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        {formData.gender || "Not set"}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {formData.role === "blogger" && (
                <div className="blogger-fields">
                  <div className="form-group">
                    <label>Display Name</label>
                    <AnimatePresence mode="wait">
                      {isEditing ? (
                        <motion.input
                          key="displayName-input"
                          type="text"
                          name="displayName"
                          value={formData.displayName}
                          onChange={handleChange}
                          placeholder="Name shown on your articles"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          disabled={isProfileLoading}
                        />
                      ) : (
                        <motion.div
                          key="displayName-value"
                          className="info-value"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                        >
                          {formData.displayName || "Not set"}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="form-group">
                    <label>Short Bio</label>
                    <AnimatePresence mode="wait">
                      {isEditing ? (
                        <motion.textarea
                          key="bio-textarea"
                          name="bio"
                          value={formData.bio}
                          onChange={handleChange}
                          placeholder="Tell readers about yourself"
                          rows="4"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          disabled={isProfileLoading}
                        />
                      ) : (
                        <motion.div
                          key="bio-value"
                          className="info-value bio-text"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                        >
                          {formData.bio || "Not set"}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="form-group">
                    <label>Writing Categories</label>
                    <AnimatePresence mode="wait">
                      {isEditing ? (
                        <motion.div
                          key="categories-selection"
                          className="categories-selection"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                        >
                          {availableCategories.map((category) => (
                            <div
                              key={category}
                              className={`category-chip ${
                                formData.categories.includes(category)
                                  ? "selected"
                                  : ""
                              }`}
                              onClick={() =>
                                !isProfileLoading &&
                                handleCategoryToggle(category)
                              }
                            >
                              {category}
                            </div>
                          ))}
                        </motion.div>
                      ) : (
                        <motion.div
                          key="categories-value"
                          className="info-value categories-display"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                        >
                          {formData.categories.length > 0
                            ? formData.categories.join(", ")
                            : "Not set"}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              <div className="action-buttons">
                <motion.button
                  className="settings-submit-btn"
                  onClick={() =>
                    isEditing ? handleSave() : setIsEditing(true)
                  }
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={isProfileLoading} // Use profile-specific loading state
                >
                  <AnimatePresence mode="wait">
                    {isProfileLoading ? (
                      <motion.span
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Loader className="loader-icon" />
                      </motion.span>
                    ) : isEditing ? (
                      <motion.span
                        key="save"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <FaSave /> Save Changes
                      </motion.span>
                    ) : (
                      <motion.span
                        key="edit"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <FaEdit /> Edit Profile
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      {logoutDialog}

      {/* Error Notification */}
      {errorNotification.isOpen && (
        <motion.div className="settings-error-notification">
          {errorNotification.message}
        </motion.div>
      )}
    </motion.div>
  );
}
