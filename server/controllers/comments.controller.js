// comments.controller.js
import { Post } from "../models/posts.model.js";
import { User } from "../models/user.model.js";
import { verifyToken } from "../middleware/verifyToken.js";

/**
 * Create a new comment on a post
 * @route POST /api/comments/:postId
 * @access Private
 */
export const createComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ success: false, message: "Comment content is required" });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    const newComment = {
      content,
      author: user.username,
      userImg: user.profileImage || "",
      userId: user._id,
      likes: [],
    };

    post.comments.push(newComment);
    await post.save();

    res.status(201).json({
      success: true,
      message: "Comment created successfully",
      comment: post.comments[post.comments.length - 1],
    });
  } catch (error) {
    console.error("Error in createComment:", error);
    res.status(500).json({ success: false, message: "Failed to create comment" });
  }
};

/**
 * Create a reply to a comment
 * @route POST /api/comments/:postId/:commentId/reply
 * @access Private
 */
export const createReply = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ success: false, message: "Reply content is required" });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    const newReply = {
      content,
      author: user.username,
      userImg: user.profileImage || "",
      userId: user._id,
      likes: [],
    };

    comment.replies.push(newReply);
    await post.save();

    res.status(201).json({
      success: true,
      message: "Reply created successfully",
      reply: comment.replies[comment.replies.length - 1],
    });
  } catch (error) {
    console.error("Error in createReply:", error);
    res.status(500).json({ success: false, message: "Failed to create reply" });
  }
};

/**
 * Get all comments for a post
 * @route GET /api/comments/:postId
 * @access Public
 */
export const getComments = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId).select("comments");
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    res.status(200).json({
      success: true,
      comments: post.comments,
    });
  } catch (error) {
    console.error("Error in getComments:", error);
    res.status(500).json({ success: false, message: "Failed to fetch comments" });
  }
};

/**
 * Update a comment
 * @route PUT /api/comments/:postId/:commentId
 * @access Private (Comment author only)
 */
export const updateComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ success: false, message: "Comment content is required" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    if (comment.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({ success: false, message: "You can only edit your own comments" });
    }

    comment.content = content;
    await post.save();

    res.status(200).json({
      success: true,
      message: "Comment updated successfully",
      comment,
    });
  } catch (error) {
    console.error("Error in updateComment:", error);
    res.status(500).json({ success: false, message: "Failed to update comment" });
  }
};

/**
 * Update a reply
 * @route PUT /api/comments/:postId/:commentId/:replyId
 * @access Private (Reply author only)
 */
export const updateReply = async (req, res) => {
  try {
    const { postId, commentId, replyId } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ success: false, message: "Reply content is required" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    const reply = comment.replies.id(replyId);
    if (!reply) {
      return res.status(404).json({ success: false, message: "Reply not found" });
    }

    if (reply.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({ success: false, message: "You can only edit your own replies" });
    }

    reply.content = content;
    reply.date = new Date(); // Optional: update timestamp
    await post.save();

    res.status(200).json({
      success: true,
      message: "Reply updated successfully",
      reply,
    });
  } catch (error) {
    console.error("Error in updateReply:", error);
    res.status(500).json({ success: false, message: "Failed to update reply" });
  }
};

/**
 * Delete a comment
 * @route DELETE /api/comments/:postId/:commentId
 * @access Private (Comment author only)
 */
export const deleteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    if (comment.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({ success: false, message: "You can only delete your own comments" });
    }

    post.comments.pull(commentId);
    await post.save();

    res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteComment:", error);
    res.status(500).json({ success: false, message: "Failed to delete comment" });
  }
};

/**
 * Delete a reply
 * @route DELETE /api/comments/:postId/:commentId/:replyId
 * @access Private (Reply author only)
 */
export const deleteReply = async (req, res) => {
  try {
    const { postId, commentId, replyId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    const reply = comment.replies.id(replyId);
    if (!reply) {
      return res.status(404).json({ success: false, message: "Reply not found" });
    }

    if (reply.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({ success: false, message: "You can only delete your own replies" });
    }

    comment.replies.pull(replyId);
    await post.save();

    res.status(200).json({
      success: true,
      message: "Reply deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteReply:", error);
    res.status(500).json({ success: false, message: "Failed to delete reply" });
  }
};

/**
 * Like or unlike a comment
 * @route POST /api/comments/:postId/:commentId/like
 * @access Private
 */
export const likeComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    const userId = req.userId;
    const hasLiked = comment.likes.some(id => id.toString() === userId.toString());

    if (hasLiked) {
      comment.likes = comment.likes.filter(id => id.toString() !== userId.toString());
    } else {
      comment.likes.push(userId);
    }

    await post.save();

    res.status(200).json({
      success: true,
      message: hasLiked ? "Comment unliked successfully" : "Comment liked successfully",
      likes: comment.likes, // Return the array of user IDs
    });
  } catch (error) {
    console.error("Error in likeComment:", error);
    res.status(500).json({ success: false, message: "Failed to like/unlike comment" });
  }
};

/**
 * Like or unlike a reply
 * @route POST /api/comments/:postId/:commentId/:replyId/like
 * @access Private
 */
export const likeReply = async (req, res) => {
  try {
    const { postId, commentId, replyId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    const reply = comment.replies.id(replyId);
    if (!reply) {
      return res.status(404).json({ success: false, message: "Reply not found" });
    }

    const userId = req.userId;
    const hasLiked = reply.likes.some(id => id.toString() === userId.toString());

    if (hasLiked) {
      reply.likes = reply.likes.filter(id => id.toString() !== userId.toString());
    } else {
      reply.likes.push(userId);
    }

    await post.save();

    res.status(200).json({
      success: true,
      message: hasLiked ? "Reply unliked successfully" : "Reply liked successfully",
      likes: reply.likes, // Return the array of user IDs
    });
  } catch (error) {
    console.error("Error in likeReply:", error);
    res.status(500).json({ success: false, message: "Failed to like/unlike reply" });
  }
};