import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import InstagramIcon from "@mui/icons-material/Instagram";
import TwitterIcon from "@mui/icons-material/Twitter";
import FacebookIcon from "@mui/icons-material/Facebook";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import "../styles/Footer.css";
import { motion } from "framer-motion";

function Footer() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (email) {
      const subject = "Newsletter Subscription";
      const body = `I would like to subscribe to your newsletter. My email is: ${email}`;
      const mailtoLink = `mailto:aydjay12@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = mailtoLink;
    }
  };

  const handleCategoryClick = (category, e) => {
    e.preventDefault();
    navigate(`/blogs?category=${category}`);
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const socialIconVariants = {
    rest: { scale: 1 },
    hover: { 
      scale: 1.2, 
      rotate: 5, 
      transition: { duration: 0.3 } 
    }
  };

  const subscribeButtonVariants = {
    rest: { scale: 1 },
    hover: { 
      scale: 1.05, 
      transition: { duration: 0.3 } 
    },
    tap: { scale: 0.95 }
  };

  return (
    <motion.footer 
      className="footer"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
    >
      <motion.div 
        className="footer-content"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
      >
        <motion.div className="footer-section about" variants={itemVariants}>
          <h2 className="logo-text">MyBlog</h2>
          <p>
            A platform dedicated to sharing knowledge, experiences, and stories from 
            writers around the world. Join our community of passionate bloggers today.
          </p>
          <div className="contact">
            <motion.div 
              className="contact-item"
              whileHover={{ x: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <PhoneIcon className="contact-icon" />
              <span>+1 123 456 7890</span>
            </motion.div>
            <motion.div 
              className="contact-item"
              whileHover={{ x: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <EmailIcon className="contact-icon" />
              <span>info@myblog.com</span>
            </motion.div>
            <motion.div 
              className="contact-item"
              whileHover={{ x: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <LocationOnIcon className="contact-icon" />
              <span>123 Blog Street, Content City</span>
            </motion.div>
          </div>
        </motion.div>

        <motion.div className="footer-section links" variants={itemVariants}>
          <h2>Quick Links</h2>
          <ul>
            {[
              { text: "Home", path: "/" },
              { text: "Blogs", path: "/blogs" },
              { text: "About Us", path: "/about" },
              { text: "Contact", path: "/contact" },
              { text: "Privacy Policy", path: "/privacy" },
              { text: "Terms of Service", path: "/terms" }
            ].map((item, index) => (
              <motion.li 
                key={index}
                whileHover={{ x: 10, color: "#007bff" }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Link to={item.path}>
                  {item.text}
                </Link>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        <motion.div className="footer-section categories" variants={itemVariants}>
          <h2>Categories</h2>
          <ul>
            {[
              { name: "Technology", slug: "Technology" },
              { name: "Travel", slug: "Travel" },
              { name: "Lifestyle", slug: "Lifestyle" },
              { name: "Health & Wellness", slug: "Health" },
              { name: "Business", slug: "Business" },
              { name: "Creativity", slug: "Creativity" }
            ].map((category, index) => (
              <motion.li 
                key={index}
                whileHover={{ x: 10, color: "#007bff" }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <a 
                  href={`/blogs?category=${category.slug}`} 
                  onClick={(e) => handleCategoryClick(category.slug, e)}
                >
                  {category.name}
                </a>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        <motion.div className="footer-section subscribe" variants={itemVariants}>
          <h2>Stay Updated</h2>
          <p>Subscribe to our newsletter for the latest blog posts and updates.</p>
          <motion.form 
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <motion.input 
              type="email" 
              placeholder="Enter your email" 
              required 
              value={email}
              onChange={handleEmailChange}
              whileFocus={{ scale: 1.02 }}
            />
            <motion.button 
              className="btn-subscribe" 
              type="submit"
              variants={subscribeButtonVariants}
              initial="rest"
              whileHover="hover"
              whileTap="tap"
            >
              Subscribe
            </motion.button>
          </motion.form>
          <div className="social-media">
            {[
              { icon: <FacebookIcon className="social-icon" />, url: "https://facebook.com" },
              { icon: <TwitterIcon className="social-icon" />, url: "https://twitter.com" },
              { icon: <InstagramIcon className="social-icon" />, url: "https://instagram.com" },
              { icon: <LinkedInIcon className="social-icon" />, url: "https://linkedin.com" }
            ].map((social, index) => (
              <motion.a 
                key={index}
                href={social.url} 
                target="_blank" 
                rel="noreferrer"
                variants={socialIconVariants}
                initial="rest"
                whileHover="hover"
              >
                {social.icon}
              </motion.a>
            ))}
          </div>
        </motion.div>
      </motion.div>

      <motion.div 
        className="footer-bottom"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <p>© {currentYear} MyBlog. All rights reserved.</p>
      </motion.div>
    </motion.footer>
  );
}

export default Footer;