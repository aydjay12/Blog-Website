import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // Basic user information
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["reader", "blogger"],
      required: true,
    },
    phone: {
      type: String,
      default: "",
    },
    gender: {
      type: String,
      enum: ["Male", "Female", ""],
      default: "",
    },
    
    // Authentication related fields
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,
    verificationTokenExpiresAt: Date,
    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    rememberMe: {
      type: Boolean,
      default: false,
    },
    revokedAt: { type: Date, default: null },
    
    // Blogger specific fields
    displayName: {
      type: String,
      // Only required if role is blogger
    },
    bio: {
      type: String,
      // Only required if role is blogger
    },
    categories: {
      type: [String],
      enum: ["Technology", "Travel", "Lifestyle", "Health", "Business", "Creativity"],
      // Only required if role is blogger
    },
    
    // Content related fields
    posts: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post"
    }],
    comments: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment"
    }],
    likedPosts: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post"
    }],
    profileImage: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

// Pre-save middleware to validate blogger-specific fields
userSchema.pre("save", function(next) {
  if (this.role === "blogger") {
    // Validate required blogger fields
    if (!this.displayName) {
      return next(new Error("Display name is required for bloggers"));
    }
    if (!this.bio) {
      return next(new Error("Bio is required for bloggers"));
    }
    if (!this.categories || this.categories.length === 0) {
      return next(new Error("At least one category is required for bloggers"));
    }
  }
  next();
});

// Virtual property to check if user is a blogger
userSchema.virtual("isBlogger").get(function() {
  return this.role === "blogger";
});

// Method to check if user can create posts
userSchema.methods.canCreatePosts = function() {
  return this.isVerified && this.role === "blogger";
};

// Method to get public profile
userSchema.methods.getPublicProfile = function() {
  const publicProfile = {
    id: this._id,
    username: this.username,
    role: this.role,
    profileImage: this.profileImage,
  };
  
  if (this.role === "blogger") {
    publicProfile.displayName = this.displayName;
    publicProfile.bio = this.bio;
    publicProfile.categories = this.categories;
  }
  
  return publicProfile;
};

export const User = mongoose.model("User", userSchema);
