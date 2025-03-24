import React from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import ProfilePic from "../../assets/ProfilePic.svg";
import "./post.css";

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
      return diffInHours === 1 ? "1 hour ago" : `${diffInHours} hours ago`;
    }
  }

  // If 24 hours or more
  if (diffInDays === 1) return "1 day ago";
  if (diffInDays < 7) return `${diffInDays} days ago`;
  const diffInWeeks = Math.floor(diffInDays / 7);
  return diffInWeeks === 1 ? "1 week ago" : `${diffInWeeks} weeks ago`;
};

export default function Post({ post }) {
  const {
    img,
    title,
    content,
    publishedAt,
    author,
    authorImg,
    categories,
    slug,
  } = post;
  const navigate = useNavigate();

  // Limit categories to the first 2
  const displayedCategories = categories.slice(0, 2);

  const handleCategoryClick = (category, e) => {
    e.preventDefault();
    navigate(`/blogs?category=${category}`);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="post"
      variants={cardVariants}
      whileInView="visible"
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
    >
      <div className="post-image-container">
        <img
          className="postImg"
          src={img || "https://via.placeholder.com/500"}
          alt="Post thumbnail"
        />
        <div className="post-overlay">
          <Link to={`/post/${slug}`} className="post-read-more">
            Read Article
          </Link>
        </div>
      </div>
      <div className="postInfo">
        <motion.div
          className="postCats"
          variants={cardVariants}
          transition={{ delay: 0.1 }}
        >
          {displayedCategories.map((category, index) => (
            <span className="postCat" key={index}>
              <Link
                className="link"
                to={`/blogs?category=${category}`}
                onClick={(e) => handleCategoryClick(category, e)}
              >
                {category}
              </Link>
            </span>
          ))}
        </motion.div>
        <span className="postTitle">
          <Link to={`/post/${slug}`} className="link">
            {title}
          </Link>
        </span>
        <div className="post-meta">
          <div className="post-author">
            <img
              src={authorImg || ProfilePic}
              alt={author}
              className="author-img"
            />
            <span>By {author}</span>
          </div>
          <span className="postDate">{formatDate(publishedAt)}</span>
        </div>
        <p className="postDesc">{stripHtml(content)}</p>
      </div>
    </motion.div>
  );
}
