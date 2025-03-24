// posts.model.js
import mongoose from "mongoose";

const replySchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    author: {
      type: String, // Stores the username or displayName of the commenter
      required: true,
    },
    userImg: {
      type: String, // URL to the commenter's profile image
      default: "",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: []
    }], // Array of user IDs who liked the reply
  },
  { timestamps: true }
);

const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    author: {
      type: String, // Stores the username or displayName of the commenter
      required: true,
    },
    userImg: {
      type: String, // URL to the commenter's profile image
      default: "",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    replies: [replySchema],
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: []
    }], // Array of user IDs who liked the comment
  },
  { timestamps: true }
);

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    img: {
      type: String, // URL to the post's featured image
      default: "",
    },
    author: {
      type: String, // Stores the blogger's displayName
      required: true,
    },
    authorImg: {
      type: String, // URL to the blogger's profileImage
      default: "",
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    categories: {
      type: [String],
      enum: ["Technology", "Travel", "Lifestyle", "Health", "Business", "Creativity"],
      required: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    comments: [commentSchema],
    publishedAt: {
      type: Date,
      default: Date.now,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
  },
  { timestamps: true }
);

// Pre-save middleware to generate slug if not provided
postSchema.pre("save", function (next) {
  if (!this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
  next();
});

// Method to check if a user can edit the post
postSchema.methods.canEdit = function (userId) {
  return this.authorId.toString() === userId.toString();
};

export const Post = mongoose.model("Post", postSchema);