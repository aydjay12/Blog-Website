// comments.route.js
import express from "express";
import {
  createComment,
  createReply,
  getComments,
  updateComment,
  deleteComment,
  likeComment,
  likeReply,
  deleteReply,
  updateReply,
} from "../controllers/comments.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// Public route
router.get("/:postId", getComments);

// Protected routes
router.post("/:postId", verifyToken, createComment);
router.post("/:postId/:commentId/reply", verifyToken, createReply);
router.put("/:postId/:commentId", verifyToken, updateComment);
router.put("/:postId/:commentId/:replyId", verifyToken, updateReply);
router.delete("/:postId/:commentId", verifyToken, deleteComment);
router.delete("/:postId/:commentId/:replyId", verifyToken, deleteReply);
router.post("/:postId/:commentId/like", verifyToken, likeComment);
router.post("/:postId/:commentId/:replyId/like", verifyToken, likeReply);

export const commentsRoute = router;