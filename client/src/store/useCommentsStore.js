// useCommentsStore.js
import { create } from "zustand";
import axios from "axios";
import { toast } from "react-toastify";

const API_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8000/api/comments"
    : "https://blog-api-ecru-seven.vercel.app/api/comments";

axios.defaults.withCredentials = true;

export const useCommentsStore = create((set) => ({
  comments: [],
  loading: false,
  error: null,

  // Fetch all comments for a post
  fetchComments: async (postId) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/${postId}`);
      set({ comments: response.data.comments, loading: false });
    } catch (error) {
      const message = error.response?.data?.message || "Failed to fetch comments";
      set({ error: message, loading: false });
      toast.error(message);
    }
  },

  // Create a new comment
  createComment: async (postId, content) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/${postId}`, { content });
      set((state) => ({
        comments: [...state.comments, response.data.comment],
        loading: false,
      }));
      toast.success(response.data.message);
    } catch (error) {
      const message = error.response?.data?.message || "Failed to create comment";
      set({ error: message, loading: false });
      toast.error(message);
    }
  },

  // Create a reply to a comment
  createReply: async (postId, commentId, content) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/${postId}/${commentId}/reply`, { content });
      set((state) => {
        const updatedComments = state.comments.map((comment) =>
          comment._id === commentId
            ? { ...comment, replies: [...comment.replies, response.data.reply] }
            : comment
        );
        return { comments: updatedComments, loading: false };
      });
      toast.success(response.data.message);
    } catch (error) {
      const message = error.response?.data?.message || "Failed to create reply";
      set({ error: message, loading: false });
      toast.error(message);
    }
  },

  // Update a comment
  updateComment: async (postId, commentId, content) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.put(`${API_URL}/${postId}/${commentId}`, { content });
      set((state) => {
        const updatedComments = state.comments.map((comment) =>
          comment._id === commentId ? { ...comment, content: response.data.comment.content, isEdited: true } : comment
        );
        return { comments: updatedComments, loading: false };
      });
      toast.success(response.data.message);
    } catch (error) {
      const message = error.response?.data?.message || "Failed to update comment";
      set({ error: message, loading: false });
      toast.error(message);
    }
  },

  // Update a reply
  updateReply: async (postId, commentId, replyId, content) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.put(`${API_URL}/${postId}/${commentId}/${replyId}`, { content });
      set((state) => {
        const updatedComments = state.comments.map((comment) =>
          comment._id === commentId
            ? {
              ...comment,
              replies: comment.replies.map((reply) =>
                reply._id === replyId
                  ? { ...reply, content: response.data.reply.content, isEdited: true }
                  : reply
              ),
            }
            : comment
        );
        return { comments: updatedComments, loading: false };
      });
      toast.success(response.data.message);
    } catch (error) {
      const message = error.response?.data?.message || "Failed to update reply";
      set({ error: message, loading: false });
      toast.error(message);
    }
  },

  // Delete a comment
  deleteComment: async (postId, commentId) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.delete(`${API_URL}/${postId}/${commentId}`);
      set((state) => {
        // Find existing comment to check for replies
        const existingComment = state.comments.find(c => c._id === commentId);

        let updatedComments;
        if (existingComment && existingComment.replies && existingComment.replies.length > 0) {
          // Soft delete: keep the comment but clear content/author
          updatedComments = state.comments.map((comment) =>
            comment._id === commentId ? {
              ...comment,
              content: "This comment has been deleted",
              author: "Deleted User",
              userImg: null, // removing profile image
              // You might want to also flag it as deleted if you have a property for it
              isDeleted: true
            } : comment
          );
        } else {
          // Hard delete if no replies
          updatedComments = state.comments.filter((comment) => comment._id !== commentId);
        }

        return {
          comments: updatedComments,
          loading: false,
        };
      });
      toast.success(response.data.message);
    } catch (error) {
      const message = error.response?.data?.message || "Failed to delete comment";
      set({ error: message, loading: false });
      toast.error(message);
    }
  },

  // Delete a reply
  deleteReply: async (postId, commentId, replyId) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.delete(`${API_URL}/${postId}/${commentId}/${replyId}`);
      set((state) => {
        const updatedComments = state.comments.map((comment) =>
          comment._id === commentId
            ? {
              ...comment,
              replies: comment.replies.filter((reply) => reply._id !== replyId),
            }
            : comment
        );
        return { comments: updatedComments, loading: false };
      });
      toast.success(response.data.message);
    } catch (error) {
      const message = error.response?.data?.message || "Failed to delete reply";
      set({ error: message, loading: false });
      toast.error(message);
    }
  },

  // Like or unlike a comment
  likeComment: async (postId, commentId) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/${postId}/${commentId}/like`);
      set((state) => {
        const updatedComments = state.comments.map((comment) =>
          comment._id === commentId
            ? {
              ...comment,
              likes: response.data.likes // Ensure backend returns updated likes array
            }
            : comment
        );
        return { comments: updatedComments, loading: false };
      });
      toast.success(response.data.message);
    } catch (error) {
      const message = error.response?.data?.message || "Failed to like/unlike comment";
      set({ error: message, loading: false });
      toast.error(message);
    }
  },

  // Like or unlike a reply
  likeReply: async (postId, commentId, replyId) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/${postId}/${commentId}/${replyId}/like`);
      set((state) => {
        const updatedComments = state.comments.map((comment) =>
          comment._id === commentId
            ? {
              ...comment,
              replies: comment.replies.map((reply) =>
                reply._id === replyId
                  ? { ...reply, likes: response.data.likes } // Ensure backend returns updated likes
                  : reply
              ),
            }
            : comment
        );
        return { comments: updatedComments, loading: false };
      });
      toast.success(response.data.message);
    } catch (error) {
      const message = error.response?.data?.message || "Failed to like/unlike reply";
      set({ error: message, loading: false });
      toast.error(message);
    }
  },

  // Clear error
  clearError: () => set({ error: null }),
}));