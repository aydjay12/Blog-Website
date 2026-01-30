import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useParams, Link } from "react-router-dom";
import "../styles/Search.css"; // Assuming this is suitable; adjust if needed
import ProfilePic from "../assets/ProfilePic.svg";
import { usePostsStore } from "../store/usePostsStore"; // Import the store
import { useAuthStore } from "../store/useAuthStore";
import Loading from "../components/loading/Loading"; // Assuming you have this component
import BlogPost from "../components/blogpost/Blogpost";

export default function Author() {
  const { authorName } = useParams();
  const [authorPosts, setAuthorPosts] = useState([]);
  const [imageFailed, setImageFailed] = useState(false);

  const { posts, loadingPost, error, fetchPosts } = usePostsStore();
  const { fetchUserByDisplayName, currentUser } = useAuthStore();
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 3;
  const postsSectionRef = useRef(null);

  // Fetch posts and user data on mount
  useEffect(() => {
    fetchPosts();
    if (authorName) {
      fetchUserByDisplayName(authorName);
    }
  }, [fetchPosts, fetchUserByDisplayName, authorName]);

  useEffect(() => {
    if (postsSectionRef.current) {
      const elementPosition =
        postsSectionRef.current.getBoundingClientRect().top +
        window.pageYOffset;
      const offsetPosition = elementPosition - 6 * 16; // 6rem offset (96px) above the section

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  }, [currentPage]);

  // Filter posts by author and set author data
  useEffect(() => {
    if (!loadingPost && posts.length > 0) {
      const decodedAuthorName = decodeURIComponent(authorName);
      const filteredPosts = posts.filter(
        (post) => post.author.toLowerCase() === decodedAuthorName.toLowerCase()
      );
      setAuthorPosts(filteredPosts);

      // Use currentUser from store if available, otherwise fallback
      if (
        currentUser &&
        currentUser.displayName.toLowerCase() ===
        decodedAuthorName.toLowerCase()
      ) {
        setAuthor({
          author: currentUser.displayName,
          authorImg: currentUser.profileImage || "",
          bio: currentUser.bio || "No bio available",
          socialLinks: {
            twitter: "https://twitter.com", // Static for now; enhance with real data if available
            github: "https://github.com",
            linkedin: "https://linkedin.com",
          },
          posts: filteredPosts.length,
        });
      } else {
        // Fallback if currentUser isn’t loaded yet
        const firstPost = filteredPosts[0];
        setAuthor({
          author: decodedAuthorName,
          authorImg: firstPost?.authorImg || "",
          bio: "No bio available",
          socialLinks: {
            twitter: "https://twitter.com",
            github: "https://github.com",
            linkedin: "https://linkedin.com",
          },
          posts: filteredPosts.length,
        });
      }
    }
  }, [loadingPost, posts, currentUser, authorName]);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  const [author, setAuthor] = useState(null);

  if (loadingPost) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="author-container">
        <div className="error-section">
          <p>{error}</p>
          <Link to="/blogs">Back to Blogs</Link>
        </div>
      </div>
    );
  }

  // Check if no author is found (no posts and author is set)
  if (!loadingPost && author && authorPosts.length === 0) {
    return (
      <motion.div
        className="author-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="no-author">
          <i className="fas fa-user-times no-author-icon"></i>
          <h2>No Author Found</h2>
          <p>
            We couldn't find an author named "{decodeURIComponent(authorName)}".
            They may not exist or haven't published any posts yet.
          </p>
          <Link to="/blogs" className="back-to-blogs-btn">
            Back to Blogs
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="author-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {author && (
        <>
          <div className="author-header">
            <div
              className="author-profile"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <motion.img
                src={
                  imageFailed || !author.authorImg
                    ? ProfilePic
                    : author.authorImg
                }
                alt={author.author}
                className="author-profile-image"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                onError={() => setImageFailed(true)}
              />
              <div className="author-details">
                <motion.h1
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  {author.author}
                </motion.h1>
                <motion.p
                  className="author-bio"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  {author.bio}
                </motion.p>
                <motion.div
                  className="author-social"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <a
                    href={author.socialLinks.twitter}
                    target="_blank"
                    rel="noreferrer"
                    className="social-link"
                  >
                    Twitter
                  </a>
                  <a
                    href={author.socialLinks.github}
                    target="_blank"
                    rel="noreferrer"
                    className="social-link"
                  >
                    GitHub
                  </a>
                  <a
                    href={author.socialLinks.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="social-link"
                  >
                    LinkedIn
                  </a>
                </motion.div>
              </div>
            </div>
          </div>

          <div className="author-content">
            <div className="author-posts-section" ref={postsSectionRef}>
              <div className="section-header">
                <h2>{author.author}'s Posts</h2>
                <span className="post-count">{authorPosts.length} posts</span>
              </div>

              {authorPosts.length > 0 ? (
                <>
                  {/* Paginated Posts */}
                  {(() => {
                    const indexOfLastPost = currentPage * postsPerPage;
                    const indexOfFirstPost = indexOfLastPost - postsPerPage;
                    const currentPosts = authorPosts.slice(
                      indexOfFirstPost,
                      indexOfLastPost
                    );
                    const totalPages = Math.ceil(
                      authorPosts.length / postsPerPage
                    );

                    return (
                      <>
                        <div className="blogs-grid">
                          {currentPosts.map((post) => (
                            <BlogPost
                              post={post}
                              key={post._id || post.id}
                              showAuthor={false}
                            />
                          ))}
                        </div>

                        {/* Pagination */}
                        {authorPosts.length > postsPerPage && (
                          <motion.div
                            className="pagination"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                          >
                            {currentPage > 1 && (
                              <motion.button
                                className="pagination-btn prev"
                                onClick={() =>
                                  setCurrentPage((prev) => prev - 1)
                                }
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
                                onClick={() =>
                                  setCurrentPage((prev) => prev + 1)
                                }
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
              ) : (
                <div className="no-posts">
                  <p>This author hasn't published any posts yet.</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}
