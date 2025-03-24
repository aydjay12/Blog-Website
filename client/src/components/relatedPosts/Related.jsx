import React, { useEffect } from "react";
import { motion } from "framer-motion";
import "../../styles/Single.css";
import { Link, useParams } from "react-router-dom";
import { usePostsStore } from "../../store/usePostsStore";
import Loading from "../../components/loading/Loading";

const Related = () => {
  const { slug } = useParams(); // Get the slug from the URL
  const { relatedPosts, loadingRelated, fetchRelatedPosts } = usePostsStore();

  // Fetch related posts when the component mounts or slug changes
  useEffect(() => {
    if (slug) {
      fetchRelatedPosts(slug);
    }
  }, [slug, fetchRelatedPosts]);

  if (loadingRelated) {
    return <Loading />;
  }

  if (!relatedPosts.length) {
    return null; // Or display a message like "No related posts found"
  }

  return (
    <motion.div
      className="related-posts-section"
      initial={{ y: 30, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.7 }}
    >
      <h2 className="related-posts-title">You might also like</h2>
      <div className="related-posts-grid">
        {relatedPosts.map((post, index) => {
          // Limit categories to the first 2
          const displayedCategories = post.categories.slice(0, 2);

          return (
            <motion.div
              className="related-post-card"
              key={post._id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
              whileHover={{
                y: -10,
                boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
              }}
            >
              <Link to={`/post/${post.slug}`} className="related-post-link">
                <div className="related-post-image-container">
                  <motion.img
                    src={post.img || "/default-image.jpg"}
                    alt={post.title}
                    className="related-post-image"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <div className="related-post-info">
                  <div className="related-post-categories">
                    {displayedCategories.map((category, idx) => (
                      <span key={idx} className="related-post-category">
                        {category}
                      </span>
                    ))}
                  </div>
                  <h3 className="related-post-title">{post.title}</h3>
                  <div className="related-post-meta">
                    <span className="related-post-author">By {post.author}</span>
                    <span className="related-post-date">
                      {new Date(post.publishedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default Related;