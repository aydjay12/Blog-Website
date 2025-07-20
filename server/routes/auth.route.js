import express from "express";
import {
  checkAuth,
  forgotPassword,
  getProfile,
  getUserByDisplayName,
  login,
  logout,
  register,
  resendResetLink,
  resendVerification,
  resetPassword,
  updateProfile,
  uploadProfileImage,
  verifyEmail,
  toggleFavorite,  // Add this
  getFavorites,    // Add this
} from "../controllers/auth.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// Export as a function that accepts upload
export const authRoute = (upload) => {
  router.get("/check-auth", verifyToken, checkAuth);
  router.post("/register", register);
  router.post("/login", login);
  router.post("/logout", logout);
  router.post("/verify-email", verifyEmail);
  router.post("/resend-verification", resendVerification);
  router.post("/forgot-password", forgotPassword);
  router.post("/reset-password/", resetPassword);
  router.post("/resend-reset-link", resendResetLink);
  router.get("/display/:displayName", getUserByDisplayName);
  router.get("/profile", verifyToken, getProfile);
  router.put("/profile", verifyToken, updateProfile);
  router.post("/profile/upload-image", verifyToken, upload.single("image"), uploadProfileImage);
  router.post("/toggle-favorite", verifyToken, toggleFavorite);
  router.get("/favorites", verifyToken, getFavorites);

  return router;
};