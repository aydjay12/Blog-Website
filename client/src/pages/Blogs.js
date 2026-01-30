import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import "../styles/Blogs.css";
import { useLocation, useNavigate } from "react-router-dom";
import Loading from "../components/loading/Loading";
import { usePostsStore } from "../store/usePostsStore";
import BlogPost from "../components/blogpost/Blogpost";

const categories = [
  "All",
  "Technology",
  "Travel",
  "Lifestyle",
  "Health",
  "Business",
  "Creativity",
];

export default function Blogs() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const categoryParam = searchParams.get("category");

  const [activeCategory, setActiveCategory] = useState(categoryParam || "All");
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 9;

  const { posts, loadingPost, error, fetchPosts } = usePostsStore();



  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    if (categoryParam && categories.includes(categoryParam)) {
      setActiveCategory(categoryParam);
    } else if (!categoryParam) {
      setActiveCategory("All");
    }
  }, [categoryParam]);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory]);

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    navigate(`/blogs?category=${category}`);
  };

  const headerVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: { opacity: 1, y: 0 },
  };

  const categoryVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
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

  const filteredPosts =
    activeCategory === "All"
      ? posts
      : posts.filter(
        (post) => post.categories && post.categories.includes(activeCategory)
      );

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);

  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };
  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <motion.div
      className="blogs-container"
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
        <h1>Explore Our Blog</h1>
        <p>
          Discover stories, insights, and knowledge from writers on any topic
        </p>

        <motion.div
          className="category-filter"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {categories.map((category, index) => (
            <motion.button
              key={index}
              className={`category-btn ${activeCategory === category ? "active" : ""
                }`}
              onClick={() => handleCategoryChange(category)}
              variants={categoryVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {category}
            </motion.button>
          ))}
        </motion.div>
      </motion.div>

      <div className="blogs-content">
        <div className="blogs-posts">
          {loadingPost ? (
            <Loading />
          ) : error ? (
            <div className="error-message">
              <p>Failed to load posts: {error}</p>
            </div>
          ) : currentPosts.length > 0 ? (
            <motion.div
              className="blogs-grid"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              key={currentPage}
            >
              {currentPosts.map((post) => (
                <BlogPost post={post} key={post._id || post.id} />
              ))}
            </motion.div>
          ) : (
            <div className="no-posts">
              <p>No posts found for this category. Try another filter.</p>
            </div>
          )}

          {filteredPosts.length > 0 && !error && !loadingPost && (
            <motion.div
              className="pagination"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {currentPage > 1 && (
                <motion.button
                  className="pagination-btn prev"
                  onClick={prevPage}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  ← Prev
                </motion.button>
              )}

              {Array.from({ length: totalPages }, (_, i) => (
                <motion.button
                  key={i + 1}
                  className={`pagination-btn ${currentPage === i + 1 ? "active" : ""
                    }`}
                  onClick={() => paginate(i + 1)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {i + 1}
                </motion.button>
              ))}

              {currentPage < totalPages && (
                <motion.button
                  className="pagination-btn"
                  onClick={nextPage}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Next →
                </motion.button>
              )}
            </motion.div>
          )}
        </div>

        {/* <Sidebar /> */}
      </div>
    </motion.div>
  );
}
