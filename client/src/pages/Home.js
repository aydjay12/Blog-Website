import { useLocation } from "react-router";
import { motion } from "framer-motion";
import Header from "../components/header/Header";
import Posts from "../components/posts/Posts";
import Sidebar from "../components/sidebar/Sidebar";
import "../styles/Home.css";
import { useEffect } from "react";

export default function Homepage() {
  const location = useLocation();
  console.log(location);

  // Animation variants
  const titleVariants = {
    hidden: { opacity: 0, y: -30 },
    visible: { opacity: 1, y: 0 },
  };

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Header />
      <div className="home">
        <motion.h1
          variants={titleVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Recent Blogs
        </motion.h1>
        <Posts />
        {/* <Sidebar /> */}
      </div>
    </motion.div>
  );
}
