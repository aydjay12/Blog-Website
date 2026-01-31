import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { FaHeart, FaRegHeart, FaReply, FaTrash, FaEdit } from "react-icons/fa";
import ProfilePic from "../../assets/ProfilePic.svg";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import { useCommentsStore } from "../../store/useCommentsStore"; // Adjust path
import { useAuthStore } from "../../store/useAuthStore"; // Adjust path
import "./comments.css";

// Utility function to format relative time
const formatRelativeTime = (date) => {
  const now = new Date();
  const diffMs = now - new Date(date);
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffSeconds < 60) return "Just now";
  if (diffMinutes < 60)
    return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`;
  if (diffHours < 24)
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
  if (diffWeeks < 4)
    return `${diffWeeks} week${diffWeeks === 1 ? "" : "s"} ago`;
  if (diffMonths < 12)
    return `${diffMonths} month${diffMonths === 1 ? "" : "s"} ago`;
  return `${diffYears} year${diffYears === 1 ? "" : "s"} ago`;
};

const CommentsSection = ({ postId }) => {
  const {
    comments,
    fetchComments,
    createComment,
    createReply,
    updateComment,
    updateReply,
    deleteComment,
    deleteReply,
    likeComment,
    likeReply,
    loading,
  } = useCommentsStore();

  const { user, isAuthenticated } = useAuthStore();
  const currentUser = user || { username: "Guest", profileImage: "" };
  const [isDeleting, setIsDeleting] = useState(false);

  const [newComment, setNewComment] = useState("");
  const [replyState, setReplyState] = useState({
    commentId: null,
    replyId: null,
    content: "",
    mention: null,
  });
  const [editState, setEditState] = useState({
    commentId: null,
    replyId: null,
    content: "",
  });
  const [sortBy, setSortBy] = useState("newest");
  const [expandedComments, setExpandedComments] = useState({});
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    itemType: null,
    commentId: null,
    replyId: null,
  });
  const [notification, setNotification] = useState({
    isOpen: false,
    message: "",
  });

  const replyInputRef = useRef(null);
  const editInputRef = useRef(null);

  useEffect(() => {
    if (postId) {
      fetchComments(postId);
    }
  }, [postId, fetchComments]);

  const showNotification = (message) => {
    setNotification({ isOpen: true, message });
    setTimeout(() => setNotification({ isOpen: false, message: "" }), 3000);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showNotification("You must be logged in to comment");
      return;
    }
    if (newComment.trim() === "" || loading) return;
    await createComment(postId, newComment);
    setNewComment("");
  };

  const handleReplySubmit = async () => {
    if (!isAuthenticated) {
      showNotification("You must be logged in to reply");
      return;
    }
    const { commentId, content, mention } = replyState;
    if (content.trim() === "" || loading) return;

    const replyContent = mention ? `@${mention} ${content}` : content;
    await createReply(postId, commentId, replyContent);

    resetReplyState();
    setExpandedComments((prev) => ({ ...prev, [commentId]: true }));
  };

  const resetReplyState = () => {
    setReplyState({
      commentId: null,
      replyId: null,
      content: "",
      mention: null,
    });
  };

  const handleEditSubmit = async () => {
    const { commentId, replyId, content } = editState;
    if (content.trim() === "" || loading) return;

    if (replyId) {
      await updateReply(postId, commentId, replyId, content);
      showNotification("Reply updated successfully");
    } else {
      await updateComment(postId, commentId, content);
      showNotification("Comment updated successfully");
    }
    resetEditState();
  };

  const resetEditState = () => {
    setEditState({ commentId: null, replyId: null, content: "" });
  };

  const openDeleteModal = (itemType, commentId, replyId = null) => {
    setDeleteModal({ isOpen: true, itemType, commentId, replyId });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      itemType: null,
      commentId: null,
      replyId: null,
    });
  };

  const confirmDeleteComment = async () => {
    const { itemType, commentId, replyId } = deleteModal;
    if (loading || isDeleting) return; // Prevent action if already deleting

    setIsDeleting(true); // Set deleting state
    try {
      if (itemType === "comment") {
        await deleteComment(postId, commentId);
        showNotification("Comment deleted successfully");
      } else if (itemType === "reply") {
        await deleteReply(postId, commentId, replyId);
        showNotification("Reply deleted successfully");
      }
      closeDeleteModal();
    } finally {
      setIsDeleting(false); // Reset deleting state
    }
  };

  // Mock function to update comment locally for "soft delete" visualization
  // This helps if the backend actually deletes it but we want to show "deleted" state UI
  // However, normally the backend should handle soft delete.
  // Assuming if backend deletes, we refetch. If we want to simulate soft delete UI here:
  /*
  const softDeleteUI = (id, type) => {
     // implementation to update local state logic
  }
  */

  const toggleLike = async (commentId, replyId = null) => {
    if (!isAuthenticated) {
      showNotification("You must be logged in to like");
      return;
    }
    if (loading) return;
    if (replyId) {
      await likeReply(postId, commentId, replyId);
    } else {
      await likeComment(postId, commentId);
    }
  };

  const toggleReplies = (commentId) => {
    setExpandedComments((prev) => ({ ...prev, [commentId]: !prev[commentId] }));
  };

  const isCurrentUserContent = (author) => author === currentUser.username;

  const handleReplyClick = (commentId, replyId = null, mentionUser = null) => {
    // Close any open edit form
    resetEditState();
    setReplyState({ commentId, replyId, content: "", mention: mentionUser });
    setTimeout(() => replyInputRef.current?.focus(), 10);
  };

  const handleEditClick = (commentId, replyId = null, content) => {
    // Close any open reply form
    resetReplyState();
    setEditState({ commentId, replyId, content });
    setTimeout(() => editInputRef.current?.focus(), 10);
  };

  const handleReplyKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleReplySubmit();
    }
  };

  const handleEditKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleEditSubmit();
    }
  };

  const handleRemoveMention = () => {
    setReplyState((prev) => ({ ...prev, mention: null }));
  };

  const sortedComments = [...comments]
    .filter(comment =>
      // Filter out comments that are marked as deleted AND have no replies
      !(comment.isDeleted && (!comment.replies || comment.replies.length === 0))
    )
    .sort((a, b) => {
      if (sortBy === "newest")
        return new Date(b.createdAt) - new Date(a.createdAt);
      else if (sortBy === "popular") return b.likes.length - a.likes.length;
      return 0;
    });

  const renderReplyForm = (commentId, replyId = null) => {
    const isVisible =
      replyState.commentId === commentId && replyState.replyId === replyId;
    if (!isVisible) return null;

    return (
      <motion.div
        className="reply-form-container"
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="reply-form-avatar">
          <img
            src={currentUser.profileImage || ProfilePic}
            alt=""
            className="comment-avatar comment-avatar-small"
          />
        </div>
        <div className="reply-form">
          <div className="reply-input-container">
            {replyState.mention && (
              <div className="reply-mention-tag">
                @{replyState.mention}
                <button
                  className="remove-mention-btn"
                  onClick={handleRemoveMention}
                >
                  ×
                </button>
              </div>
            )}
            <input
              ref={replyInputRef}
              type="text"
              placeholder={`Reply${replyState.mention ? ` to @${replyState.mention}` : "..."}`}
              className={`reply-input ${replyState.mention ? "with-mention" : ""
                }`}
              value={replyState.content}
              onChange={(e) =>
                setReplyState((prev) => ({ ...prev, content: e.target.value }))
              }
              onKeyDown={handleReplyKeyPress}
            />
          </div>
          <motion.div
            className="reply-form-actions show"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.button
              type="button"
              className="reply-cancel-button"
              onClick={resetReplyState}
              variants={buttonVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Cancel
            </motion.button>
            <motion.button
              type="button"
              className="reply-submit-button"
              onClick={handleReplySubmit}
              disabled={!replyState.content.trim() || loading}
              variants={buttonVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Reply
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    );
  };

  const renderEditForm = (commentId, replyId = null, originalContent) => {
    const isVisible =
      editState.commentId === commentId && editState.replyId === replyId;
    if (!isVisible) return null;

    return (
      <motion.div
        className="edit-form-container"
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.3 }}
      >
        <input
          ref={editInputRef}
          type="text"
          className="edit-input"
          value={editState.content}
          onChange={(e) =>
            setEditState((prev) => ({ ...prev, content: e.target.value }))
          }
          onKeyDown={handleEditKeyPress}
        />
        <motion.div
          className="edit-form-actions show"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.button
            type="button"
            className="edit-cancel-button"
            onClick={resetEditState}
            variants={buttonVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Cancel
          </motion.button>
          <motion.button
            type="button"
            className="edit-submit-button"
            onClick={handleEditSubmit}
            disabled={!editState.content.trim() || loading}
            variants={buttonVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Save
          </motion.button>
        </motion.div>
      </motion.div>
    );
  };

  const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
  };

  const formVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  const commentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const replyVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const deleteDialog = (
    <Dialog
      open={deleteModal.isOpen}
      onClose={closeDeleteModal}
      aria-labelledby="delete-dialog-title"
      aria-describedby="delete-dialog-description"
      PaperProps={{
        style: {
          borderRadius: "10px",
          padding: "0.5rem 0",
          minWidth: "350px",
        },
      }}
    >
      <DialogTitle id="delete-dialog-title">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          Confirm Delete {deleteModal.itemType}
        </motion.div>
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="delete-dialog-description">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            Are you sure you want to delete this {deleteModal.itemType}? This
            action cannot be undone.
          </motion.div>
        </DialogContentText>
      </DialogContent>
      <DialogActions style={{ paddingBottom: "25px", paddingRight: "24px" }}>
        <Button
          onClick={closeDeleteModal}
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
          disabled={isDeleting} // Disable Cancel button while deleting
        >
          Cancel
        </Button>
        <Button
          onClick={confirmDeleteComment}
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
          disabled={isDeleting} // Disable Delete button while deleting
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <motion.div
      className="comments-section"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="comments-header"
        variants={headerVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.5 }}
      >
        <h2 className="comments-title">
          {sortedComments.reduce((acc, comment) => acc + 1 + (comment.replies?.length || 0), 0)} Comments
        </h2>
        <div className="comments-sort">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="comments-sort-select"
          >
            <option value="newest">Sort by: Newest</option>
            <option value="popular">Sort by: Top comments</option>
          </select>
        </div>
      </motion.div>

      <motion.div
        className="comment-form-container"
        variants={formVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="comment-form-avatar">
          <img
            src={currentUser.profileImage || ProfilePic}
            alt=""
            className="comment-avatar"
          />
        </div>
        <form className="comment-form" onSubmit={handleCommentSubmit}>
          <input
            type="text"
            placeholder="Add a comment..."
            className="comment-input"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={loading}
          />
          <motion.div
            className={`comment-form-actions ${newComment.trim() ? "show" : ""
              }`}
            variants={containerVariants}
            initial="hidden"
            animate={newComment.trim() ? "visible" : "hidden"}
          >
            <motion.button
              type="button"
              className="comment-cancel-button"
              onClick={() => setNewComment("")}
              variants={buttonVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              className="comment-submit-button"
              disabled={!newComment.trim() || loading}
              variants={buttonVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Comment
            </motion.button>
          </motion.div>
        </form>
      </motion.div>

      <div className="comments-list">
        {sortedComments.map((comment) => (
          <motion.div
            className="comment-thread"
            key={comment._id}
            variants={commentVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5 }}
          >
            <div className="comment">
              <div className="comment-avatar-container">
                <img
                  src={
                    comment.userImg || currentUser.profileImage || ProfilePic
                  }
                  alt=""
                  className="comment-avatar"
                />
              </div>

              <div className="comment-content">
                <div className="comment-header">
                  <span className="comment-author">{comment.author}</span>
                  <span className="comment-date">
                    {formatRelativeTime(comment.createdAt)}
                    {comment.isEdited && <span className="edited-tag">Edited</span>}
                  </span>
                </div>

                {editState.commentId === comment._id && !editState.replyId ? (
                  renderEditForm(comment._id, null, comment.content)
                ) : (
                  <>
                    <p className="comment-text">{comment.content}</p>
                    <motion.div
                      className="comment-actions"
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      {!comment.isDeleted && (
                        <>
                          <motion.button
                            className={`comment-action like-button ${comment.likes.includes(currentUser._id) ? "liked" : ""
                              }`}
                            onClick={() => toggleLike(comment._id)}
                            variants={buttonVariants}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            {comment.likes.includes(currentUser._id) ? (
                              <FaHeart />
                            ) : (
                              <FaRegHeart />
                            )}
                            <span>
                              {comment.likes.length > 0 ? comment.likes.length : ""}
                            </span>
                          </motion.button>

                          <motion.button
                            className="comment-action reply-button"
                            onClick={() => handleReplyClick(comment._id)}
                            variants={buttonVariants}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <FaReply />
                            <span>Reply</span>
                          </motion.button>
                        </>
                      )}

                      {isCurrentUserContent(comment.author) && (
                        <>
                          <motion.button
                            className="comment-action edit-button"
                            onClick={() =>
                              handleEditClick(
                                comment._id,
                                null,
                                comment.content
                              )
                            }
                            variants={buttonVariants}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <FaEdit />
                            <span>Edit</span>
                          </motion.button>
                          <motion.button
                            className="comment-action delete-button"
                            onClick={() =>
                              openDeleteModal("comment", comment._id)
                            }
                            variants={buttonVariants}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <FaTrash />
                            <span>Delete</span>
                          </motion.button>
                        </>
                      )}
                    </motion.div>
                  </>
                )}

                {renderReplyForm(comment._id)}
              </div>
            </div>

            {comment.replies.length > 0 && (
              <div className="comment-replies-container">
                {!expandedComments[comment._id] ? (
                  <motion.button
                    className="view-replies-button"
                    onClick={() => toggleReplies(comment._id)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    View {comment.replies.length}{" "}
                    {comment.replies.length === 1 ? "reply" : "replies"}
                  </motion.button>
                ) : (
                  <>
                    <motion.button
                      className="hide-replies-button"
                      onClick={() => toggleReplies(comment._id)}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      Hide replies
                    </motion.button>
                    <motion.div
                      className="comment-replies"
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      {comment.replies.map((reply) => (
                        <motion.div
                          className="reply-thread"
                          key={reply._id}
                          variants={replyVariants}
                        >
                          <div className="reply-container-body">
                            <div className="reply">
                              <div className="comment-avatar-container">
                                <img
                                  src={reply.userImg || ProfilePic}
                                  alt=""
                                  className="comment-avatar comment-avatar-small"
                                />
                              </div>

                              <div className="comment-content">
                                <div className="comment-header">
                                  <span className="comment-author">
                                    {reply.author}
                                  </span>
                                  <span className="comment-date">
                                    {formatRelativeTime(reply.createdAt)}
                                    {reply.isEdited && <span className="edited-tag">Edited</span>}
                                  </span>
                                </div>

                                {editState.commentId === comment._id &&
                                  editState.replyId === reply._id ? (
                                  renderEditForm(
                                    comment._id,
                                    reply._id,
                                    reply.content
                                  )
                                ) : (
                                  <>
                                    <p className="comment-text">
                                      {reply.content}
                                    </p>
                                    <motion.div
                                      className="comment-actions"
                                      variants={containerVariants}
                                      initial="hidden"
                                      animate="visible"
                                    >
                                      <motion.button
                                        className={`comment-action like-button ${reply.likes.includes(currentUser._id)
                                          ? "liked"
                                          : ""
                                          }`}
                                        onClick={() =>
                                          toggleLike(comment._id, reply._id)
                                        }
                                        variants={buttonVariants}
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                      >
                                        {reply.likes.includes(
                                          currentUser._id
                                        ) ? (
                                          <FaHeart />
                                        ) : (
                                          <FaRegHeart />
                                        )}
                                        <span>
                                          {reply.likes.length > 0
                                            ? reply.likes.length
                                            : ""}
                                        </span>
                                      </motion.button>

                                      <motion.button
                                        className="comment-action reply-button"
                                        onClick={() => {
                                          if (
                                            reply.author ===
                                            currentUser.username
                                          ) {
                                            handleReplyClick(
                                              comment._id,
                                              reply._id
                                            );
                                          } else {
                                            handleReplyClick(
                                              comment._id,
                                              reply._id,
                                              reply.author
                                            );
                                          }
                                        }}
                                        variants={buttonVariants}
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                      >
                                        <FaReply />
                                        <span>Reply</span>
                                      </motion.button>

                                      {isCurrentUserContent(reply.author) && (
                                        <>
                                          <motion.button
                                            className="comment-action edit-button"
                                            onClick={() =>
                                              handleEditClick(
                                                comment._id,
                                                reply._id,
                                                reply.content
                                              )
                                            }
                                            variants={buttonVariants}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                          >
                                            <FaEdit />
                                            <span>Edit</span>
                                          </motion.button>
                                          <motion.button
                                            className="comment-action delete-button"
                                            onClick={() =>
                                              openDeleteModal(
                                                "reply",
                                                comment._id,
                                                reply._id
                                              )
                                            }
                                            variants={buttonVariants}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                          >
                                            <FaTrash />
                                            <span>Delete</span>
                                          </motion.button>
                                        </>
                                      )}
                                    </motion.div>
                                  </>
                                )}
                              </div>
                            </div>
                            {renderReplyForm(comment._id, reply._id)}
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  </>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {deleteDialog}

      {notification.isOpen && (
        <motion.div
          className="notification"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, ease: "easeInOut" }}
        >
          {notification.message}
        </motion.div>
      )}
    </motion.div>
  );
};

export default CommentsSection;
