import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ProfilePic from "../assets/ProfilePic.svg";
import {
  FaEdit,
  FaTrashAlt,
  FaHeart,
  FaRegHeart,
  FaShare,
  FaCopy,
  FaExclamationTriangle,
} from "react-icons/fa";
import "../styles/Single.css";
import CommentsSection from "../components/comments/Comments";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import { Modal, Text, Button as MantineButton } from "@mantine/core";
import Related from "../components/relatedPosts/Related";
import { usePostsStore } from "../store/usePostsStore";
import { useAuthStore } from "../store/useAuthStore";
import Loading from "../components/loading/Loading";
import { CircularProgress } from "@mui/material";

const formatPostDate = (dateString) => {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateString).toLocaleDateString("en-US", options);
};

export default function Single() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const { favorites, toggleFavorite, favoritesLoading, isAuthenticated } =
    useAuthStore();

  const {
    currentPost,
    loadingPost,
    loadingAuthorCheck,
    error,
    fetchPostBySlug,
    deletePost,
    checkIsAuthor,
    isAuthor,
  } = usePostsStore();

  const liked = favorites.some(
    (fav) => fav.id === (currentPost?._id || currentPost?.id)
  );
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasFetchedPost, setHasFetchedPost] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  // Fetch post
  useEffect(() => {
    const fetchData = async () => {
      // Immediately scroll to top when navigating to a new post
      window.scrollTo({ top: 0, behavior: "instant" });
      setHasFetchedPost(false);
      await fetchPostBySlug(slug);
      setHasFetchedPost(true);
    };
    fetchData();
  }, [slug, fetchPostBySlug]);

  // Check authorship only once after post is fetched
  useEffect(() => {
    if (isAuthenticated && hasFetchedPost && currentPost?._id) {
      checkIsAuthor(currentPost._id);
    } else if (!isAuthenticated) {
      usePostsStore.setState({ isAuthor: false });
    }
  }, [isAuthenticated, hasFetchedPost, currentPost?._id, checkIsAuthor]);

  // Scroll to top after post has loaded
  useEffect(() => {
    if (hasFetchedPost && currentPost) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [hasFetchedPost, currentPost]);

  useEffect(() => {
    if (deleteSuccess) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [deleteSuccess]);

  const handleLike = async () => {
    if (!isAuthenticated) {
      showSaveMessage("Please log in to favorite this post!", 2000);
      return;
    }
    try {
      const wasLiked = liked;
      await toggleFavorite(currentPost?._id || currentPost?.id);
      if (!wasLiked) {
        showSaveMessage("Added to Favourites", 2000);
      } else {
        showSaveMessage("Removed from Favourites", 2000);
      }
    } catch (error) {
      showSaveMessage("Failed to update favorite status", 2000);
    }
  };

  const handleShare = () => {
    setShareModalOpen(true);
  };

  const closeShareModal = () => {
    setShareModalOpen(false);
  };

  const handleDeleteClick = () => {
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setIsDeleting(false);
  };

  const confirmDelete = async () => {
    if (!currentPost) return;
    setIsDeleting(true);
    try {
      await deletePost(currentPost._id || currentPost.id);
      setDeleteSuccess(true);
      showSaveMessage("Post has been Deleted", 2000);
      setTimeout(() => {
        navigate("/blogs");
      }, 2000);
    } catch (err) {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      showSaveMessage("Failed to delete post", 2000);
    }
  };

  const shareOnPlatform = (platform) => {
    const url = window.location.href;
    const title = currentPost?.title || "";
    let shareUrl;
    switch (platform) {
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
          url
        )}&text=${encodeURIComponent(title)}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          url
        )}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
          url
        )}`;
        break;
      case "whatsapp":
        shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
          title + " " + url
        )}`;
        break;
      default:
        return;
    }
    window.open(shareUrl, "_blank", "width=600,height=400");
    closeShareModal();
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        showSaveMessage("Link copied to clipboard!", 2000);
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  };

  const showSaveMessage = (message, duration) => {
    setSaveMessage(message);
    setTimeout(() => {
      setSaveMessage("");
    }, duration);
  };

  const handleAuthorClick = () => {
    if (currentPost) {
      navigate(`/author/${encodeURIComponent(currentPost.author)}`);
    }
  };

  const handleTagClick = (tag) => {
    navigate(`/search?query=${encodeURIComponent(tag)}`);
  };

  // Show loading only on initial fetch, not during delete
  if (loadingPost || !hasFetchedPost) {
    return <Loading />;
  }

  if (deleteSuccess) {
    return <Loading />;
  }

  // Show error only after fetch is complete and no post is found
  if (hasFetchedPost && (error || !currentPost)) {
    return (
      <div className="single-page">
        <div className="single-content">
          <p>{error || "Post not found"}</p>
          <Link to="/blogs">Back to Blogs</Link>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="single-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="single-content">
        <article className="single-post">
          <motion.div
            className="single-post-hero"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="single-post-image-container">
              <motion.img
                className="single-post-image"
                src={
                  currentPost.img ||
                  currentPost.imageUrl ||
                  "/default-blog-image.jpg"
                }
                alt={currentPost.title}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.8 }}
              />
            </div>

            <div className="single-post-hero-overlay">
              <motion.div
                className="single-post-categories"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                {(currentPost.categories || []).map((category, index) => (
                  <Link
                    key={index}
                    to={`/blogs?category=${category}`}
                    className="single-post-category"
                  >
                    {category}
                  </Link>
                ))}
              </motion.div>

              <motion.h1
                className="single-post-title"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                {currentPost.title}
              </motion.h1>

              <motion.div
                className="single-post-meta"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <div className="single-post-author">
                  {currentPost.authorImg ? (
                    <motion.img
                      src={currentPost.authorImg}
                      alt={currentPost.author}
                      className="author-avatar"
                      whileHover={{ scale: 1.1 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 10,
                      }}
                      onClick={handleAuthorClick}
                      style={{ cursor: "pointer" }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = ProfilePic;
                      }}
                    />
                  ) : (
                    <motion.img
                      src={ProfilePic}
                      className="author-avatar default-avatar"
                      whileHover={{ scale: 1.1 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 10,
                      }}
                      onClick={handleAuthorClick}
                      style={{ cursor: "pointer" }}
                    />
                  )}
                  <div className="author-info">
                    <span
                      className="author-name"
                      onClick={handleAuthorClick}
                      style={{ cursor: "pointer" }}
                    >
                      {currentPost.author}
                    </span>
                    <div className="post-details">
                      <span className="post-date">
                        {formatPostDate(
                          currentPost.publishedAt || currentPost.date
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {isAuthor && !loadingAuthorCheck && (
                  <div className="single-post-actions">
                    <motion.button
                      className="action-button edit-button"
                      onClick={() => navigate(`/edit/${currentPost.slug}`)}
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 17,
                      }}
                    >
                      <FaEdit />
                    </motion.button>
                    <motion.button
                      className="action-button delete-button"
                      onClick={handleDeleteClick}
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 17,
                      }}
                    >
                      <FaTrashAlt />
                    </motion.button>
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            className="single-post-content"
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div
              className="article-post-content"
              dangerouslySetInnerHTML={{ __html: currentPost.content }}
            />

            <motion.div
              className="engagement-section"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="engagement-actions">
                <motion.button
                  className={`engagement-button ${liked ? "active" : ""}`}
                  onClick={handleLike}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  disabled={favoritesLoading}
                >
                  <motion.div
                    animate={{ scale: liked ? [1, 1.5, 1] : 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {liked ? <FaHeart /> : <FaRegHeart />}
                  </motion.div>
                  <span>{liked ? "Favorited" : "Favorite"}</span>
                </motion.button>
                <motion.button
                  className="engagement-button"
                  onClick={handleShare}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FaShare />
                  <span>Share</span>
                </motion.button>
                <motion.button
                  className="engagement-button"
                  onClick={handleCopyLink}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FaCopy />
                  <span>Copy</span>
                </motion.button>
              </div>

              <div className="post-tags">
                <span className="tag-label">Tags:</span>
                <div className="tags-list">
                  {(currentPost.tags || []).map((tag, index) => (
                    <motion.div key={index} whileHover={{ scale: 1.05 }}>
                      <span
                        className="post-tag"
                        onClick={() => handleTagClick(tag)}
                        style={{ cursor: "pointer" }}
                      >
                        {tag}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {saveMessage && <div className="save-message">{saveMessage}</div>}

            {/* Mantine Share Modal */}
            <Modal
              opened={shareModalOpen}
              onClose={closeShareModal}
              title={<Text size="lg" fw={500}>Share this post</Text>}
              centered
              className="share-modal"
              overlayProps={{ color: "rgba(0, 0, 0, 0.6)", blur: 4 }}
              styles={{
                content: {
                  borderRadius: "10px",
                  maxWidth: "500px",
                  width: "90%",
                  boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
                  overflow: "hidden",
                },
                header: { padding: "1rem 1.5rem", borderBottom: "1px solid #eee" },
                title: { color: "#333" },
                body: { padding: "1.5rem" },
              }}
            >
              <div className="share-modal-content">
                <div className="share-buttons">
                  <MantineButton
                    className="share-button twitter"
                    onClick={() => shareOnPlatform("twitter")}
                    component={motion.button}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    styles={{
                      root: {
                        backgroundColor: "#1DA1F2",
                        color: "white",
                        padding: "0.8rem 1rem",
                        borderRadius: "5px",
                        fontWeight: 500,
                        transition: "all 0.3s ease",
                        "&:hover": {
                          backgroundColor: "#1DA1F2",
                          opacity: 0.9,
                          transform: "translateY(-2px)",
                        },
                      },
                    }}
                  >
                    Twitter
                  </MantineButton>
                  <MantineButton
                    className="share-button facebook"
                    onClick={() => shareOnPlatform("facebook")}
                    component={motion.button}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    styles={{
                      root: {
                        backgroundColor: "#4267B2",
                        color: "white",
                        padding: "0.8rem 1rem",
                        borderRadius: "5px",
                        fontWeight: 500,
                        transition: "all 0.3s ease",
                        "&:hover": {
                          backgroundColor: "#4267B2",
                          opacity: 0.9,
                          transform: "translateY(-2px)",
                        },
                      },
                    }}
                  >
                    Facebook
                  </MantineButton>
                  <MantineButton
                    className="share-button linkedin"
                    onClick={() => shareOnPlatform("linkedin")}
                    component={motion.button}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    styles={{
                      root: {
                        backgroundColor: "#0077B5",
                        color: "white",
                        padding: "0.8rem 1rem",
                        borderRadius: "5px",
                        fontWeight: 500,
                        transition: "all 0.3s ease",
                        "&:hover": {
                          backgroundColor: "#0077B5",
                          opacity: 0.9,
                          transform: "translateY(-2px)",
                        },
                      },
                    }}
                  >
                    LinkedIn
                  </MantineButton>
                  <MantineButton
                    className="share-button whatsapp"
                    onClick={() => shareOnPlatform("whatsapp")}
                    component={motion.button}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    styles={{
                      root: {
                        backgroundColor: "#25D366",
                        color: "white",
                        padding: "0.8rem 1rem",
                        borderRadius: "5px",
                        fontWeight: 500,
                        transition: "all 0.3s ease",
                        "&:hover": {
                          backgroundColor: "#25D366",
                          opacity: 0.9,
                          transform: "translateY(-2px)",
                        },
                      },
                    }}
                  >
                    WhatsApp
                  </MantineButton>
                </div>
              </div>
            </Modal>
            <AnimatePresence>
              {shareModalOpen && (
                <motion.div
                  className="share-modal-overlay"
                  onClick={closeShareModal}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.div
                    className="share-modal"
                    onClick={(e) => e.stopPropagation()}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  >
                    <div className="share-modal-header">
                      <h3>Share this post</h3>
                      <button
                        className="share-modal-close"
                        onClick={closeShareModal}
                      >
                        ×
                      </button>
                    </div>
                    <div className="share-modal-content">
                      <div className="share-buttons">
                        <motion.button
                          className="share-button twitter"
                          onClick={() => shareOnPlatform("twitter")}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Twitter
                        </motion.button>
                        <motion.button
                          className="share-button facebook"
                          onClick={() => shareOnPlatform("facebook")}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Facebook
                        </motion.button>
                        <motion.button
                          className="share-button linkedin"
                          onClick={() => shareOnPlatform("linkedin")}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          LinkedIn
                        </motion.button>
                        <motion.button
                          className="share-button whatsapp"
                          onClick={() => shareOnPlatform("whatsapp")}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          WhatsApp
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {deleteModalOpen && (
                <Dialog
                  open={deleteModalOpen}
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
                  <DialogTitle id="delete-dialog-title" sx={{ pb: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <FaExclamationTriangle color="#f44336" />
                      <span>Delete Post</span>
                    </div>
                  </DialogTitle>
                  <DialogContent>
                    <DialogContentText
                      sx={{ fontFamily: "inherit" }}
                      id="delete-dialog-description"
                    >
                      Are you sure you want to delete "
                      <strong>{currentPost.title}</strong>"? This action cannot
                      be undone.
                    </DialogContentText>
                  </DialogContent>
                  <DialogActions sx={{ padding: "1rem", paddingTop: "0.5rem" }}>
                    <Button
                      onClick={closeDeleteModal}
                      color="inherit"
                      variant="outlined"
                      disabled={isDeleting}
                      sx={{
                        textTransform: "none",
                        borderRadius: "6px",
                        fontFamily: "inherit",
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={confirmDelete}
                      color="error"
                      variant="contained"
                      disabled={isDeleting}
                      startIcon={
                        isDeleting ? (
                          <CircularProgress size={16} color="inherit" />
                        ) : null
                      }
                      sx={{
                        textTransform: "none",
                        borderRadius: "6px",
                        fontFamily: "inherit",
                        backgroundColor: "#f44336",
                      }}
                    >
                      {isDeleting ? "Deleting..." : "Delete"}
                    </Button>
                  </DialogActions>
                </Dialog>
              )}
            </AnimatePresence>

            <motion.div
              className="author-bio"
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {currentPost.authorImg ? (
                <motion.img
                  style={{ cursor: "pointer" }}
                  onClick={handleAuthorClick}
                  src={currentPost.authorImg}
                  alt={currentPost.author}
                  className="author-bio-avatar"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = ProfilePic;
                  }}
                />
              ) : (
                <motion.img
                  style={{ cursor: "pointer" }}
                  onClick={handleAuthorClick}
                  src={ProfilePic}
                  className="author-bio-avatar default-avatar"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                />
              )}
              <div className="author-bio-content">
                <h3
                  style={{ cursor: "pointer" }}
                  onClick={handleAuthorClick}
                  className="author-bio-name"
                >
                  {currentPost.author}
                </h3>
                <p className="author-bio-description">
                  {currentPost.authorBio || "No bio available"}
                </p>
                <div className="author-social-links">
                  <motion.a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noreferrer"
                    className="author-social-link"
                    whileHover={{ scale: 1.1, y: -2 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    Twitter
                  </motion.a>
                  <motion.a
                    href="https://github.com"
                    target="_blank"
                    rel="noreferrer"
                    className="author-social-link"
                    whileHover={{ scale: 1.1, y: -2 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    GitHub
                  </motion.a>
                  <motion.a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noreferrer"
                    className="author-social-link"
                    whileHover={{ scale: 1.1, y: -2 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    LinkedIn
                  </motion.a>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <CommentsSection postId={currentPost._id} />
            </motion.div>

            <Related />
          </motion.div>
        </article>
      </div>
    </motion.div>
  );
}