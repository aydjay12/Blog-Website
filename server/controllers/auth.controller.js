import mongoose from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { User } from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js";
import { Post } from "../models/posts.model.js";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail, sendResetSuccessEmail } from "../nodemailer/emails.js";

/**
 * Register a new user (reader or blogger)
 * @route POST /api/auth/register
 * @access Public
 */
export const register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (userExists) {
      if (userExists.email === email) {
        return res.status(400).json({ 
          success: false, 
          message: "Email already registered" 
        });
      } else {
        return res.status(400).json({ 
          success: false, 
          message: "Username already taken" 
        });
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user based on role
    const userData = {
      username,
      email,
      password: hashedPassword,
      role: role || "reader", // Default to reader if not specified
    };

    // Add blogger-specific fields if role is blogger
    if (role === "blogger") {
      const { displayName, bio, categories } = req.body;
      
      // Validate blogger-specific fields
      if (!displayName) {
        return res.status(400).json({ 
          success: false, 
          message: "Display name is required for bloggers" 
        });
      }
      if (!bio) {
        return res.status(400).json({ 
          success: false, 
          message: "Bio is required for bloggers" 
        });
      }
      if (!categories || categories.length === 0) {
        return res.status(400).json({ 
          success: false, 
          message: "At least one category is required for bloggers" 
        });
      }

      // Add blogger fields
      userData.displayName = displayName;
      userData.bio = bio;
      userData.categories = categories;
    }

    // Generate verification token (6-digit code)
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set token expiry (1 hour)
    const verificationTokenExpiresAt = new Date();
    verificationTokenExpiresAt.setHours(verificationTokenExpiresAt.getHours() + 1);

    // Add verification data to user
    userData.verificationToken = verificationToken;
    userData.verificationTokenExpiresAt = verificationTokenExpiresAt;

    // Create user
    const newUser = new User(userData);
    await newUser.save();

    // Send verification email
    await sendVerificationEmail(email, verificationToken);

    // Return success response
    res.status(201).json({
      success: true,
      message: "Registration successful. Please check your email to verify your account.",
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Error in register controller:", error);
    res.status(500).json({ 
      success: false, 
      message: "Registration failed. Please try again later." 
    });
  }
};

/**
 * Verify user email with token
 * @route POST /api/auth/verify-email
 * @access Public
 */
export const verifyEmail = async (req, res) => {
  try {
    const { email, token } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if already verified
    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Email already verified",
      });
    }

    // Validate token
    if (
      user.verificationToken !== token ||
      !user.verificationTokenExpiresAt ||
      user.verificationTokenExpiresAt < new Date()
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code",
      });
    }

    // Mark as verified
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;
    await user.save();

    // Send welcome email
    const name = user.role === "blogger" ? user.displayName : user.username;
    await sendWelcomeEmail(user.email, name);

    // Generate authentication token
    const authToken = generateTokenAndSetCookie(res, user._id);

    // Return success response
    res.status(200).json({
      success: true,
      message: "Email verified successfully",
      token: authToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error("Error in verifyEmail controller:", error);
    res.status(500).json({
      success: false,
      message: "Email verification failed. Please try again later.",
    });
  }
};

/**
 * Resend verification email
 * @route POST /api/auth/resend-verification
 * @access Public
 */
export const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if already verified
    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Email already verified",
      });
    }

    // Generate new verification token
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set token expiry (1 hour)
    const verificationTokenExpiresAt = new Date();
    verificationTokenExpiresAt.setHours(verificationTokenExpiresAt.getHours() + 1);

    // Update user with new token
    user.verificationToken = verificationToken;
    user.verificationTokenExpiresAt = verificationTokenExpiresAt;
    await user.save();

    // Send verification email
    await sendVerificationEmail(email, verificationToken);

    // Return success response
    res.status(200).json({
      success: true,
      message: "Verification email resent successfully",
    });
  } catch (error) {
    console.error("Error in resendVerification controller:", error);
    res.status(500).json({
      success: false,
      message: "Failed to resend verification email. Please try again later.",
    });
  }
};

/**
 * Login user
 * @route POST /api/auth/login
 * @access Public
 */
export const login = async (req, res) => {
  try {
    const { email, password, rememberMe, role } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "No user found", // Changed from "Invalid email or password"
      });
    }

    // Check if role matches
    if (role && user.role !== role) {
      return res.status(401).json({
        success: false,
        message: "No user found", // Role mismatch error
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Update last login time and remember me preference
    user.lastLogin = Date.now();
    user.rememberMe = rememberMe || false;
    await user.save();

    // Generate token with appropriate expiry
    const token = generateTokenAndSetCookie(res, user._id, user.rememberMe);

    // Return success response
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        rememberMe: user.rememberMe,
        ...(user.role === "blogger" && {
          displayName: user.displayName,
          bio: user.bio,
          categories: user.categories,
        }),
      },
    });
  } catch (error) {
    console.error("Error in login controller:", error);
    res.status(500).json({
      success: false,
      message: "Login failed. Please try again later.",
    });
  }
};

/**
 * Check user authentication status
 * @route GET /api/auth/check
 * @access Private
 */
export const checkAuth = async (req, res) => {
  try {
    // User is already attached to req by the verifyToken middleware
    const user = req.user;

    // Return user data
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        profileImage: user.profileImage,
        ...(user.role === "blogger" && {
          displayName: user.displayName,
          bio: user.bio,
          categories: user.categories,
        }),
      },
    });
  } catch (error) {
    console.error("Error in checkAuth controller:", error);
    res.status(500).json({
      success: false,
      message: "Authentication check failed",
    });
  }
};

/**
 * Logout user
 * @route POST /api/auth/logout
 * @access Private
 */
export const logout = async (req, res) => {
  try {
    // Clear the token cookie
    res.cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Error in logout controller:", error);
    res.status(500).json({
      success: false,
      message: "Logout failed",
    });
  }
};

/**
 * Request password reset
 * @route POST /api/auth/forgot-password
 * @access Public
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with that email address"
      });
    }

    // Generate a random token
    const resetToken = crypto.randomBytes(32).toString("hex");
    
    // Hash the token before storing in DB
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Set token expiry (1 hour)
    const resetTokenExpiresAt = new Date();
    resetTokenExpiresAt.setHours(resetTokenExpiresAt.getHours() + 1);

    // Save token to user document
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpiresAt = resetTokenExpiresAt;
    await user.save();

    // Create reset URL
    const resetURL = `${process.env.CLIENT_URL}/new-password?token=${resetToken}`;

    // Send reset password email
    await sendPasswordResetEmail(email, resetURL);

    res.status(200).json({
      success: true,
      message: "Password reset link sent to your email"
    });
  } catch (error) {
    console.error("Error in forgotPassword controller:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send password reset email. Please try again later."
    });
  }
};

/**
 * Reset user password using token
 * @route POST /api/auth/reset-password
 * @access Public
 */
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    // Hash the token from URL to compare with stored token
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpiresAt: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired password reset token"
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update user's password and clear reset token fields
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();

    // Send confirmation email
    await sendResetSuccessEmail(user.email);

    res.status(200).json({
      success: true,
      message: "Password reset successful. You can now log in with your new password."
    });
  } catch (error) {
    console.error("Error in resetPassword controller:", error);
    res.status(500).json({
      success: false,
      message: "Password reset failed. Please try again later."
    });
  }
};

/**
 * Resend password reset link
 * @route POST /api/auth/resend-reset-link
 * @access Public
 */
export const resendResetLink = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with that email address"
      });
    }

    // Generate a new random token
    const resetToken = crypto.randomBytes(32).toString("hex");
    
    // Hash the token before storing in DB
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Set token expiry (1 hour)
    const resetTokenExpiresAt = new Date();
    resetTokenExpiresAt.setHours(resetTokenExpiresAt.getHours() + 1);

    // Update token in user document
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpiresAt = resetTokenExpiresAt;
    await user.save();

    // Create reset URL
    const resetURL = `${process.env.CLIENT_URL}/new-password?token=${resetToken}`;

    // Send reset password email
    await sendPasswordResetEmail(email, resetURL);

    res.status(200).json({
      success: true,
      message: "Password reset link resent successfully"
    });
  } catch (error) {
    console.error("Error in resendResetLink controller:", error);
    res.status(500).json({
      success: false,
      message: "Failed to resend password reset email. Please try again later."
    });
  }
};

/**
 * Get a user by displayName
 * @route GET /api/users/display/:displayName
 * @access Public
 */
export const getUserByDisplayName = async (req, res) => {
  try {
    const { displayName } = req.params;
    const user = await User.findOne({ displayName }).select("displayName bio profileImage");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user: {
        displayName: user.displayName,
        bio: user.bio,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error("Error in getUserByDisplayName controller:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user",
    });
  }
};

/**
 * Get user profile
 * @route GET /api/auth/profile
 * @access Private
 */
export const getProfile = async (req, res) => {
  try {
    // req.user is already populated by the verifyToken middleware
    // Return the user data without the password
    res.status(200).json({
      success: true,
      user: req.user
    });
  } catch (error) {
    console.error("Error in getProfile controller:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch profile. Please try again later." 
    });
  }
};

/**
 * Update user profile
 * @route PUT /api/auth/profile
 * @access Private
 */
// auth.controller.js - updateProfile
export const updateProfile = async (req, res) => {
  try {
    const { username, email, phone, gender } = req.body;

    // Check for existing username or email
    if (username) {
      const existingUsername = await User.findOne({
        username,
        _id: { $ne: req.userId },
      });
      if (existingUsername) {
        return res.status(400).json({
          success: false,
          message: "Username already taken",
        });
      }
    }

    if (email) {
      const existingEmail = await User.findOne({
        email,
        _id: { $ne: req.userId },
      });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: "Email already registered",
        });
      }
    }

    // Prepare update data
    const updateData = {};

    // Basic fields for all users
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    // Only update phone if explicitly provided and not undefined
    if (phone !== undefined && phone !== null) updateData.phone = phone;
    // Only update gender if explicitly provided and not undefined
    if (gender !== undefined && gender !== null) {
      const validGenders = ["Male", "Female", ""];
      if (!validGenders.includes(gender)) {
        return res.status(400).json({
          success: false,
          message: "Invalid gender value",
        });
      }
      updateData.gender = gender;
    }

    // Blogger-specific fields
    if (req.user.role === "blogger") {
      const { displayName, bio, categories } = req.body;
      if (displayName) updateData.displayName = displayName;
      if (bio) updateData.bio = bio;
      if (categories && categories.length > 0) updateData.categories = categories;
    }

    // Update user profile only if there are changes
    if (Object.keys(updateData).length === 0) {
      return res.status(200).json({
        success: true,
        message: "No changes to update",
        user: req.user,
      });
    }

    const updatedUser = await User.findByIdAndUpdate(req.userId, updateData, {
      new: true,
    }).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error in updateProfile controller:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile. Please try again later.",
    });
  }
};

/**
 * Upload profile image
 * @route POST /api/auth/profile/upload-image
 * @access Private
 */
export const uploadProfileImage = async (req, res) => {
  try {
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({ 
        success: false, 
        message: "No image file provided" 
      });
    }

    // Upload file buffer to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "blog_profile_images",
          resource_type: "image",
          transformation: [
            { width: 500, height: 500, crop: "limit" },
            { quality: "auto" }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      
      uploadStream.end(file.buffer);
    });

    // Update user's profileImage field
    await User.findByIdAndUpdate(req.userId, {
      profileImage: result.secure_url
    });

    res.status(200).json({
      success: true,
      message: "Profile image uploaded successfully",
      imageUrl: result.secure_url
    });
  } catch (error) {
    console.error("Error in uploadProfileImage controller:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to upload image. Please try again later." 
    });
  }
};

/**
 * Toggle favorite (like/unlike) a post
 * @route POST /api/auth/toggle-favorite
 * @access Private
 */
export const toggleFavorite = async (req, res) => {
  try {
    const { postId } = req.body;
    const userId = req.userId; // From verifyToken middleware

    // Validate postId
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid post ID",
      });
    }

    // Find the post
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if post is already favorited
    const isFavorited = user.likedPosts.includes(postId);
    
    if (isFavorited) {
      // Remove from favorites
      user.likedPosts = user.likedPosts.filter(
        (id) => id.toString() !== postId.toString()
      );
    } else {
      // Add to favorites
      user.likedPosts.push(postId);
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: isFavorited 
        ? "Post removed from favorites" 
        : "Post added to favorites",
      isFavorited: !isFavorited,
    });
  } catch (error) {
    console.error("Error in toggleFavorite controller:", error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle favorite. Please try again later.",
    });
  }
};

/**
 * Get all favorited posts
 * @route GET /api/auth/favorites
 * @access Private
 */
export const getFavorites = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId)
      .populate({
        path: "likedPosts",
        select: "title img author authorImg publishedAt slug categories content", // Add 'content'
        populate: {
          path: "authorId",
          select: "displayName profileImage",
        },
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const favorites = user.likedPosts.map(post => ({
      id: post._id,
      title: post.title,
      image: post.img,
      author: post.author,
      authorImg: post.authorImg,
      publishedAt: post.publishedAt,
      slug: post.slug,
      categories: post.categories,
      content: post.content, // Add content to the response
    }));

    res.status(200).json({
      success: true,
      favorites,
      total: favorites.length,
    });
  } catch (error) {
    console.error("Error in getFavorites controller:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch favorites. Please try again later.",
    });
  }
};