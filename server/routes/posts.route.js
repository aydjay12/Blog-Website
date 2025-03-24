import express from "express";
import {
  createPost,
  uploadPostImage,
  getPosts,
  getPostBySlug,
  updatePost,
  deletePost,
  checkPostAuthor,
  getRelatedPosts, // Import the new controller
} from "../controllers/posts.controller.js";
import { verifyToken, verifyBlogger, verifyOwnership } from "../middleware/verifyToken.js";
import multer from "multer";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Public routes
router.get("/", getPosts);
router.get("/:slug", getPostBySlug);
router.get("/:slug/related", getRelatedPosts); // New route for related posts

// Protected routes (bloggers only)
router.post("/", verifyToken, verifyBlogger, createPost);
router.post("/upload-image", verifyToken, verifyBlogger, upload.single("image"), uploadPostImage);
router.put("/:id", verifyToken, verifyBlogger, verifyOwnership("Post"), updatePost);
router.delete("/:id", verifyToken, verifyBlogger, verifyOwnership("Post"), deletePost);

// New route to check if user is the author
router.get("/:id/is-author", verifyToken, checkPostAuthor);

export const postsRoute = router;