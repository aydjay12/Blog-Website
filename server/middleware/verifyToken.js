import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

/**
 * Middleware to verify authentication token
 * Extracts user information and attaches it to request object
 */
export const verifyToken = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ success: false, message: "Unauthorized - No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Check if token was revoked
    if (user.revokedAt && new Date(user.revokedAt) > new Date(decoded.iat * 1000)) {
      return res.status(401).json({ success: false, message: "Unauthorized - Token revoked" });
    }

    req.user = user;
    req.userId = user._id;
    next();
  } catch (error) {
    console.log("Error in verifyToken middleware:", error);
    return res.status(401).json({ success: false, message: "Unauthorized - Invalid token" });
  }
};

/**
 * Middleware to verify if the user is a blogger
 * Used to protect blogger-specific routes
 */
export const verifyBlogger = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.role !== "blogger") {
      return res
        .status(403)
        .json({ success: false, message: "Forbidden - Blogger access required" });
    }

    next();
  } catch (error) {
    console.log("Error in verifyBlogger middleware", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Middleware to verify user is the owner of a resource
 * @param {String} resourceModel - The mongoose model name to check ownership against
 * @param {String} resourceIdParam - The URL parameter name containing the resource ID
 */
export const verifyOwnership = (resourceModel, resourceIdParam = "id") => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[resourceIdParam];
      
      const { [resourceModel]: Model } = await import(`../models/posts.model.js`);
      
      const resource = await Model.findById(resourceId);
      
      if (!resource) {
        return res
          .status(404)
          .json({ success: false, message: "Resource not found" });
      }
      
      // Check ownership using authorId (ObjectId) instead of author (string)
      if (resource.authorId?.toString() !== req.userId.toString()) {
        console.log("Ownership check failed:", {
          resourceAuthorId: resource.authorId?.toString(),
          reqUserId: req.userId.toString(),
        });
        return res
          .status(403)
          .json({ success: false, message: "Forbidden - You do not have permission to modify this resource" });
      }
      
      next();
    } catch (error) {
      console.log(`Error in verifyOwnership middleware for ${resourceModel}`, error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  };
};

/**
 * Middleware to verify if the user account is verified
 * Used to protect routes that require email verification
 */
export const verifyAccountStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (!user.isVerified) {
      return res
        .status(403)
        .json({ success: false, message: "Account not verified. Please verify your email first." });
    }

    next();
  } catch (error) {
    console.log("Error in verifyAccountStatus middleware", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Middleware to check if the user can comment
 * Both readers and bloggers can comment, but their account must be verified
 */
export const verifyCommentEligibility = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (!user.isVerified) {
      return res
        .status(403)
        .json({ success: false, message: "Please verify your account before commenting" });
    }

    next();
  } catch (error) {
    console.log("Error in verifyCommentEligibility middleware", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
