import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import "../styles/NotFound.css";

const NotFound = () => {
  // Animation variants
  const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.5 } },
    exit: { opacity: 0, transition: { duration: 0.3 } }
  };

  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        delay: 0.2,
        duration: 0.5 
      }
    }
  };

  return (
    <motion.div
      className="not-found-container"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
    >
      <div className="not-found-content">
        <motion.div
          className="not-found-card"
          variants={contentVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="error-code">404</div>
          <h1>Page Not Found</h1>
          <p>
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="not-found-actions">
            <Link to="/" className="primary-btn">
              Return Home
            </Link>
            <Link to="/blogs" className="secondary-btn">
              Browse Blogs
            </Link>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default NotFound;