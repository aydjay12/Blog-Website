import React from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/Blogs.css"; // Assuming this contains the blog-card styles; adjust if needed

// Utility function to strip HTML tags and truncate text
const stripHtml = (html, maxLength = 150) => {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;
  const text = tempDiv.textContent || tempDiv.innerText || "";
  return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
};

// Utility function to format date dynamically
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now - date;

  // Convert milliseconds to minutes and hours
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  // If less than 24 hours (today)
  if (diffInDays === 0) {
    if (diffInMinutes < 60) {
      return diffInMinutes === 1
        ? "1 minute ago"
        : `${diffInMinutes} minutes ago`;
    }
    if (diffInHours < 24) {
      return diffInHours === 1
        ? "1 hour ago"
        : `${diffInHours} hours ago`;
    }
  }

  // If 24 hours or more
  if (diffInDays === 1) return "1 day ago";
  if (diffInDays < 7) return `${diffInDays} days ago`;
  const diffInWeeks = Math.floor(diffInDays / 7);
  return diffInWeeks === 1 ? "1 week ago" : `${diffInWeeks} weeks ago`;
};

// Animation variants for the blog card
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function BlogPost({
  post,
  showAuthor = true, // Toggle author visibility (e.g., hidden in Author.js)
  onRemoveFavourite, // Optional callback for removing from favorites (Favourites.js)
  isFavourite = false, // Flag to indicate if it's a favourite card
}) {
  // Default post properties to avoid undefined errors
  const {
    _id,
    id,
    title = "Untitled",
    content = "",
    author = "Unknown Author",
    publishedAt,
    date,
    img,
    imageUrl,
    image,
    categories = [],
    slug,
  } = post || {};

  const postId = _id || id;
  const postImage = img || imageUrl || image || "/default-blog-image.jpg";
  const postDate = publishedAt || date;

  // Limit categories to the first 2
  const displayedCategories = categories.slice(0, 2);
  const navigate = useNavigate();

  const handleAuthorClick = (e) => {
    e.preventDefault(); // Prevent bubbling if necessary, though it's separate
    if (author) {
      navigate(`/author/${encodeURIComponent(author)}`);
    }
  };

  return (
    <motion.div
      className={`blog-card ${isFavourite ? "favourite-card" : ""}`}
      key={postId}
      variants={cardVariants}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      layout // For smooth transitions in Favourites.js when removing items
    >
      <div className="blog-image">
        <img src={postImage} alt={title} />
        {displayedCategories.map((cat, index) => (
          <span key={index} className="blog-category">
            {cat}
          </span>
        ))}
        {isFavourite && onRemoveFavourite && (
          <motion.button
            className="favourite-btn"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onRemoveFavourite(post)}
          >
            <i className="fas fa-heart-broken"></i>
          </motion.button>
        )}
      </div>
      <div className="blog-info">
        <h2 className="blog-title">{title}</h2>
        <div className="blog-meta">
          {showAuthor && (
            <span
              className="blog-author"
              onClick={handleAuthorClick}
            >
              By {author}
            </span>
          )}
          <span className="blog-date">{formatDate(postDate)}</span>
        </div>
        <p className="blog-desc">{stripHtml(content)}</p>
        <Link to={`/post/${slug}`} className="link">
          <motion.button
            className="read-more"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Read More
          </motion.button>
        </Link>
      </div>
    </motion.div>
  );
}