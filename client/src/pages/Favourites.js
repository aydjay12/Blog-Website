import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import "../styles/Blogs.css"; // Reusing existing styles
import Loading from "../components/loading/Loading";
import { useAuthStore } from "../store/useAuthStore";
import BlogPost from "../components/blogpost/Blogpost";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import { FaExclamationTriangle } from "react-icons/fa";
import { CircularProgress } from "@mui/material";

// Utility function to strip HTML tags and truncate text
const stripHtml = (html, maxLength = 150) => {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;
  const text = tempDiv.textContent || tempDiv.innerText || "";
  return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
};

// Utility function to format date as "X days ago"
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now - date;
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return "Today";
  if (diffInDays === 1) return "1 day ago";
  if (diffInDays < 7) return `${diffInDays} days ago`;
  const diffInWeeks = Math.floor(diffInDays / 7);
  return diffInWeeks === 1 ? "1 week ago" : `${diffInWeeks} weeks ago`;
};

export default function Favourites() {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false); // Renamed from modalOpen
  const [selectedPost, setSelectedPost] = useState(null);
  const [notification, setNotification] = useState({
    visible: false,
    message: "",
  });
  const [isRemoving, setIsRemoving] = useState(false); // New state for removal in progress
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 9;

  const {
    favorites,
    favoritesLoading,
    isAuthenticated,
    toggleFavorite,
    getFavorites,
  } = useAuthStore();

  // Fetch favorites when component mounts if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      getFavorites();
    }
  }, [isAuthenticated, getFavorites]);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [currentPage]);

  // Animation variants
  const headerVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: { opacity: 1, y: 0 },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const handleOpenDeleteDialog = (post) => {
    setSelectedPost(post);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedPost(null);
    setIsRemoving(false);
  };

  const handleRemoveFavourite = async () => {
    if (selectedPost && isAuthenticated) {
      setIsRemoving(true);
      try {
        const postTitle = selectedPost.title;
        await toggleFavorite(selectedPost.id); // Remove from favorites

        handleCloseDeleteDialog();

        // Show notification
        setNotification({
          visible: true,
          message: `"${postTitle}" has been removed from your favourites`,
        });

        setTimeout(() => {
          setNotification({
            visible: false,
            message: "",
          });
        }, 3000);
      } catch (error) {
        console.error("Error removing favourite:", error);
        setIsRemoving(false);
        setDeleteDialogOpen(false);
      }
    }
  };

  return (
    <motion.div
      className="blogs-container favourites-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="blogs-header"
        variants={headerVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.5 }}
      >
        <h1>Your Favourites</h1>
        <p>Discover your saved articles all in one place</p>
      </motion.div>

      <div className="blogs-content">
        <div className="blogs-posts">
          {!isAuthenticated ? (
            <motion.div
              className="no-auth"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="empty-icon">
                <i className="fas fa-lock"></i>
              </div>
              <h2>Please Log In</h2>
              <p>You need to be logged in to view your favourites.</p>
              <Link to="/login">
                <motion.button
                  className="login-btn"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Log In
                </motion.button>
              </Link>
            </motion.div>
          ) : favorites.length > 0 ? ( // Remove favoritesLoading condition
            <>
              {(() => {
                const indexOfLastPost = currentPage * postsPerPage;
                const indexOfFirstPost = indexOfLastPost - postsPerPage;
                const currentFavourites = favorites.slice(
                  indexOfFirstPost,
                  indexOfLastPost
                );
                const totalPages = Math.ceil(favorites.length / postsPerPage);

                return (
                  <>
                    <motion.div
                      className="blogs-grid"
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      key={currentPage}
                    >
                      {currentFavourites.map((post) => (
                        <BlogPost
                          post={post}
                          key={post.id}
                          isFavourite={true}
                          onRemoveFavourite={handleOpenDeleteDialog}
                        />
                      ))}
                    </motion.div>

                    {/* Pagination */}
                    {favorites.length > postsPerPage && (
                      <motion.div
                        className="pagination"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                      >
                        {currentPage > 1 && (
                          <motion.button
                            className="pagination-btn prev"
                            onClick={() => setCurrentPage((prev) => prev - 1)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            ← Prev
                          </motion.button>
                        )}

                        {Array.from({ length: totalPages }, (_, i) => (
                          <motion.button
                            key={i + 1}
                            className={`pagination-btn ${
                              currentPage === i + 1 ? "active" : ""
                            }`}
                            onClick={() => setCurrentPage(i + 1)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {i + 1}
                          </motion.button>
                        ))}

                        {currentPage < totalPages && (
                          <motion.button
                            className="pagination-btn"
                            onClick={() => setCurrentPage((prev) => prev + 1)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Next →
                          </motion.button>
                        )}
                      </motion.div>
                    )}
                  </>
                );
              })()}
            </>
          ) : favoritesLoading ? ( // Move favoritesLoading check here
            <Loading />
          ) : (
            <motion.div
              className="no-favourites"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="empty-icon">
                <i className="fas fa-heart-broken"></i>
              </div>
              <h2>No Favourites Yet</h2>
              <p>You haven't added any articles to your favourites list.</p>
              <Link to="/blogs">
                <motion.button
                  className="browse-btn"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Browse Articles
                </motion.button>
              </Link>
            </motion.div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {deleteDialogOpen && (
          <Dialog
            open={deleteDialogOpen}
            onClose={handleCloseDeleteDialog}
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
            <DialogTitle id="delete-dialog-title" sx={{ pb: 1 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <span>Remove Favourite</span>
              </div>
            </DialogTitle>
            <DialogContent>
              <DialogContentText
                sx={{
                  fontFamily: "inherit",
                }}
                id="delete-dialog-description"
              >
                Are you sure you want to remove "
                <strong>{selectedPost?.title}</strong>" from your favourites?
                This action cannot be undone.
              </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ padding: "1rem 24px", paddingTop: "0.5rem" }}>
              <Button
                onClick={handleCloseDeleteDialog}
                color="inherit"
                variant="outlined"
                disabled={isRemoving}
                sx={{
                  textTransform: "none",
                  borderRadius: "6px",
                  fontFamily: "inherit",
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleRemoveFavourite}
                color="error"
                variant="contained"
                disabled={isRemoving}
                startIcon={
                  isRemoving ? <CircularProgress size={16} color="inherit" /> : null
                }
                sx={{
                  textTransform: "none",
                  borderRadius: "6px",
                  fontFamily: "inherit",
                  backgroundColor: "#f44336",
                }}
              >
                {isRemoving ? "Removing..." : "Remove"}
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </AnimatePresence>

      {notification.visible && (
        <div className="notification">
          <div className="notification-content">
            <i className="fas fa-check-circle"></i>
            <p>{notification.message}</p>
          </div>
        </div>
      )}
    </motion.div>
  );
}