import { useEffect } from "react";
import { motion } from "framer-motion";
import Post from "../post/Post";
import "./posts.css";
import { usePostsStore } from "../../store/usePostsStore"; // Adjust path to your store file
import Loading from "../loading/Loading";

export default function Posts() {
  // Get data and functions from the store
  const { posts, loadingPost, error, fetchPosts } = usePostsStore();

  // Fetch posts when the component mounts
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Animation variants for individual posts
  const postVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  // Handle loading state
  if (loadingPost) {
    return (
      <Loading />
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="posts">
        <p>Error: {error}</p>
      </div>
    );
  }

  // Sort posts by publishedAt (newest to oldest) and limit to 6
  const sortedPosts = [...posts]
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
    .slice(0, 6); // Take only the first 6 posts

  return (
    <div className="posts">
      {sortedPosts.map((post) => (
        <motion.div
          key={post._id} // Use _id from MongoDB instead of numeric id
          variants={postVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <Post post={post} />
        </motion.div>
      ))}
    </div>
  );
}