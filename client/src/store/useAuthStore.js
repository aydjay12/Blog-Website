import { create } from "zustand";
import axios from "axios";
import { toast } from "react-toastify";

const API_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8000/api/auth"
    : "https://blog-website-a1ux.onrender.com/api/auth";

axios.defaults.withCredentials = true;

export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isCheckingAuth: false,
  error: null,
  favorites: [],
  favoritesLoading: false,
  lastAuthCheck: null, // Add timestamp for caching

  // Register user
  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/register`, userData);
      toast.success(response.data.message);
      set({ isLoading: false });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Registration failed";
      set({ isLoading: false, error: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  },

  // Verify email
  verifyEmail: async (email, token) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/verify-email`, { email, token });
      set({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
      });
      toast.success(response.data.message);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Email verification failed";
      set({ isLoading: false, error: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  },

  // Resend verification email
  resendVerification: async (email) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/resend-verification`, { email });
      toast.success(response.data.message);
      set({ isLoading: false });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to resend verification email";
      set({ isLoading: false, error: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  },

  // Login user
  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/login`, credentials);
      set({
        user: { ...response.data.user, rememberMe: response.data.user.rememberMe },
        isAuthenticated: true,
        isLoading: false,
        lastAuthCheck: Date.now(),
      });
      await get().getProfile();
      await get().getFavorites();
      toast.success(response.data.message);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Login failed";
      set({ isLoading: false, error: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  },

  // Check authentication status
  checkAuth: async () => {
    const state = get();
    
    // Check if we've recently checked auth (within last 5 minutes)
    if (state.lastAuthCheck && Date.now() - state.lastAuthCheck < 5 * 60 * 1000) {
      return state.isAuthenticated ? { user: state.user } : null;
    }
    
    set({ isCheckingAuth: true, error: null });
    
    // Create a timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 8000); // 8 second timeout
    });
    
    try {
      const response = await Promise.race([
        axios.get(`${API_URL}/check-auth`),
        timeoutPromise
      ]);
      
      set({
        user: { ...response.data.user, rememberMe: response.data.user.rememberMe },
        isAuthenticated: true,
        isCheckingAuth: false,
        lastAuthCheck: Date.now(),
      });
      await get().getFavorites();
      return response.data;
    } catch (error) {
      console.log("Auth check failed:", error.message);
      set({ 
        user: null, 
        isAuthenticated: false, 
        isCheckingAuth: false, 
        error: null,
        lastAuthCheck: Date.now(),
      });
      return null;
    }
  },

  // Logout user
  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await axios.post(`${API_URL}/logout`);
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        favorites: [],
      });
      toast.success("Logout successful");
    } catch (error) {
      set({ isLoading: false, error: error.response?.data?.message || "Logout failed" });
      toast.error(error.response?.data?.message || "Logout failed");
      throw error;
    }
  },

  // Forgot Password
  forgotPassword: async (email) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/forgot-password`, { email });
      set({ isLoading: false });
      toast.success(response.data.message);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to send password reset email";
      set({ isLoading: false, error: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  },

  // Reset Password
  resetPassword: async (token, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/reset-password`, { token, password });
      set({ isLoading: false });
      toast.success(response.data.message);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Password reset failed";
      set({ isLoading: false, error: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  },

  // Resend Reset Link
  resendResetLink: async (email) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/resend-reset-link`, { email });
      set({ isLoading: false });
      toast.success(response.data.message);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to resend reset link";
      set({ isLoading: false, error: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  },

  // Fetch a user by displayName
  fetchUserByDisplayName: async (displayName) => {
    set({ loading: true, error: null, currentUser: null });
    try {
      const response = await axios.get(`${API_URL}/display/${encodeURIComponent(displayName)}`);
      if (response.data.success) {
        set({ currentUser: response.data.user, loading: false });
      } else {
        throw new Error(response.data.message || "Failed to fetch user");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Error fetching user";
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
    }
  },

  // Get user profile
  getProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/profile`);
      set({
        user: response.data.user,
        isLoading: false,
      });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to fetch profile";
      set({ isLoading: false, error: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (profileData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.put(`${API_URL}/profile`, profileData);
      set({
        user: response.data.user,
        isLoading: false,
      });
      toast.success(response.data.message);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to update profile";
      set({ isLoading: false, error: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  },

  // Upload profile image
  uploadProfileImage: async (file) => {
    set({ isLoading: true, error: null });
    const formData = new FormData();
    formData.append("image", file);
    try {
      const response = await axios.post(`${API_URL}/profile/upload-image`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      set((state) => ({
        user: { ...state.user, profileImage: response.data.imageUrl },
        isLoading: false,
      }));
      toast.success(response.data.message);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to upload image";
      set({ isLoading: false, error: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  },

  // Toggle favorite post
  toggleFavorite: async (postId) => {
    set({ favoritesLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/toggle-favorite`, { postId });
      set((state) => {
        const isFavorited = response.data.isFavorited;
        let updatedFavorites = [...state.favorites];
        if (isFavorited) {
          updatedFavorites = [...updatedFavorites, { id: postId }];
        } else {
          updatedFavorites = updatedFavorites.filter((fav) => fav.id !== postId);
        }
        return { favorites: updatedFavorites, favoritesLoading: false };
      });
      toast.success(response.data.message);
      await get().getFavorites();
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to toggle favorite";
      set({ favoritesLoading: false, error: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  },

  // Get all favorite posts
  getFavorites: async () => {
    set({ favoritesLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/favorites`);
      set({
        favorites: response.data.favorites,
        favoritesLoading: false,
      });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to fetch favorites";
      set({ favoritesLoading: false, error: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  },

  // Clear error
  clearError: () => set({ error: null }),
}));
