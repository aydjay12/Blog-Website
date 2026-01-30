// usePostsStore.js
import { create } from "zustand";
import axios from "axios";
import { toast } from "react-toastify";

const API_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8000/api/posts"
    : "https://blog-website-a1ux.onrender.com/api/posts";

axios.defaults.withCredentials = true;

export const usePostsStore = create((set, get) => ({
  posts: [],
  currentPost: null,
  loading: false,
  relatedPosts: [],
  loadingPost: false,
  loadingUpdate: false,
  loadingAuthorCheck: false,
  loadingRelated: false,
  loadingDelete: false,
  error: null,
  isAuthor: false,
  lastPostsFetch: null, // Add timestamp for caching

  // Fetch all posts
  fetchPosts: async () => {
    const state = get();

    // Check if we've recently fetched posts (within last 2 minutes)
    if (state.lastPostsFetch && Date.now() - state.lastPostsFetch < 2 * 60 * 1000 && state.posts.length > 0) {
      return; // Skip if recently fetched and we have posts
    }

    set({ loadingPost: true, error: null });
    try {
      const response = await axios.get(API_URL);
      if (response.data.success) {
        set({
          posts: response.data.posts,
          loadingPost: false,
          lastPostsFetch: Date.now()
        });
      } else {
        throw new Error(response.data.message || "Failed to fetch posts");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Error fetching posts";
      set({ error: errorMessage, loadingPost: false });
      toast.error(errorMessage);
    }
  },

  // Fetch a single post by slug
  fetchPostBySlug: async (slug) => {
    set({ loadingPost: true, error: null, currentPost: null });
    try {
      const response = await axios.get(`${API_URL}/${slug}`);
      if (response.data.success) {
        set({ currentPost: response.data.post, loadingPost: false });
      } else {
        throw new Error(response.data.message || "Failed to fetch post");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Error fetching post";
      set({ error: errorMessage, loadingPost: false, currentPost: null });
      toast.error(errorMessage);
    }
  },

  // Fetch related posts by slug
  fetchRelatedPosts: async (slug) => {
    set({ loadingRelated: true, error: null, relatedPosts: [] });
    try {
      const response = await axios.get(`${API_URL}/${slug}/related`);
      if (response.data.success) {
        set({ relatedPosts: response.data.relatedPosts, loadingRelated: false });
      } else {
        throw new Error(response.data.message || "Failed to fetch related posts");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Error fetching related posts";
      set({ error: errorMessage, loadingRelated: false, relatedPosts: [] });
      toast.error(errorMessage);
    }
  },

  // Check if the current user is the author of a post
  checkIsAuthor: async (postId) => {
    set({ loadingAuthorCheck: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/${postId}/is-author`);
      if (response.data.success) {
        set({ isAuthor: response.data.isAuthor, loadingAuthorCheck: false });
      } else {
        throw new Error(response.data.message || "Failed to check authorship");
      }
    } catch (error) {
      set({ isAuthor: false, loadingAuthorCheck: false });
      console.error("Error checking authorship:", error);
    }
  },

  // Create a new post
  createPost: async (postData) => {
    set({ loadingPost: true, error: null });
    try {
      const response = await axios.post(API_URL, postData);
      if (response.data.success) {
        set((state) => ({
          posts: [response.data.post, ...state.posts],
          loadingPost: false,
        }));
        toast.success(response.data.message || "Post created successfully");
        return response.data.post;
      } else {
        throw new Error(response.data.message || "Failed to create post");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Error creating post";
      set({ error: errorMessage, loadingPost: false });
      toast.error(errorMessage);
      throw error;
    }
  },

  // Update an existing post
  updatePost: async (id, postData) => {
    set({ loadingUpdate: true, error: null });
    try {
      const response = await axios.put(`${API_URL}/${id}`, postData);
      if (response.data.success) {
        set((state) => ({
          posts: state.posts.map((post) =>
            post._id === id ? response.data.post : post
          ),
          currentPost: state.currentPost?._id === id ? response.data.post : state.currentPost,
          loadingUpdate: false,
        }));
        toast.success(response.data.message || "Post updated successfully");
      } else {
        throw new Error(response.data.message || "Failed to update post");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Error updating post";
      set({ error: errorMessage, loadingUpdate: false });
      toast.error(errorMessage);
      throw error;
    }
  },

  // Delete a post
  deletePost: async (id) => {
    set({ loadingDelete: true, error: null });
    try {
      const response = await axios.delete(`${API_URL}/${id}`);
      if (response.data.success) {
        set((state) => ({
          posts: state.posts.filter((post) => post._id !== id),
          currentPost: state.currentPost?._id === id ? null : state.currentPost,
          loadingDelete: false,
        }));
        toast.success(response.data.message || "Post deleted successfully");
      } else {
        throw new Error(response.data.message || "Failed to delete post");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Error deleting post";
      set({ error: errorMessage, loadingDelete: false });
      toast.error(errorMessage);
      throw error;
    }
  },

  // Upload post image
  uploadPostImage: async (file, options = {}) => {
    const { isUpdate = false } = options; // Default to false (create context)
    set({ [isUpdate ? "loadingUpdate" : "loadingPost"]: true, error: null });
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await axios.post(`${API_URL}/upload-image`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        set({ [isUpdate ? "loadingUpdate" : "loadingPost"]: false });
        toast.success(response.data.message || "Image uploaded successfully");
        return response.data.imageUrl;
      } else {
        throw new Error(response.data.message || "Failed to upload image");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Error uploading image";
      set({ error: errorMessage, [isUpdate ? "loadingUpdate" : "loadingPost"]: false });
      toast.error(errorMessage);
      throw error;
    }
  },

  // Clear error state
  clearError: () => set({ error: null }),
}));