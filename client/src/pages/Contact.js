import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import emailjs from "@emailjs/browser";
import "../styles/Contact.css";

export default function Contact() {
  const formRef = useRef(); // Add ref for the form

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [formStatus, setFormStatus] = useState({
    submitted: false,
    success: false,
    error: null,
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setFormStatus({ ...formStatus, submitted: true });

    // Send email using EmailJS
    emailjs
      .sendForm(
        "service_tlpt3lq", // Same service ID as ContactUs.js
        "template_nn1ajim", // Same template ID as ContactUs.js
        formRef.current, // Use the form ref
        "--gZTzItUaERWwh7S" // Same public key as ContactUs.js
      )
      .then(
        () => {
          setFormStatus({
            submitted: false,
            success: true,
            error: null,
          });
          setFormData({
            name: "",
            email: "",
            subject: "",
            message: "",
          });
          // Scroll to top on success
          window.scrollTo({ top: 0, behavior: "smooth" });
          setTimeout(() => {
            setFormStatus({
              submitted: false,
              success: false,
              error: null,
            });
          }, 5000);
        },
        (error) => {
          setFormStatus({
            submitted: false,
            success: false,
            error: "Error sending message",
          });
          console.error("EmailJS error:", error);
          window.scrollTo({ top: 0, behavior: "smooth" });
          setTimeout(() => {
            setFormStatus({
              submitted: false,
              success: false,
              error: null,
            });
          }, 5000);
        }
      );
  };

  // Animation variants
  const headerVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: { opacity: 1, y: 0 },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const formVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  const successVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  return (
    <motion.div
      className="contact-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="contact-header"
        variants={headerVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.5 }}
      >
        <h1>Contact Us</h1>
        <p>Have questions or suggestions? We'd love to hear from you!</p>
      </motion.div>

      <div className="contact-content">
        <motion.div
          className="contact-info"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="info-card" variants={cardVariants}>
            <div className="info-icon">
              <i className="fas fa-map-marker-alt"></i>
            </div>
            <h3>Our Location</h3>
            <p>123 Blog Street, Content City, BL 54321</p>
          </motion.div>

          <motion.div className="info-card" variants={cardVariants}>
            <div className="info-icon">
              <i className="fas fa-envelope"></i>
            </div>
            <h3>Email Us</h3>
            <p>contact@blogwebsite.com</p>
            <p>support@blogwebsite.com</p>
          </motion.div>

          <motion.div className="info-card" variants={cardVariants}>
            <div className="info-icon">
              <i className="fas fa-phone-alt"></i>
            </div>
            <h3>Call Us</h3>
            <p>+1 (555) 123-4567</p>
            <p>Mon-Fri: 9am to 5pm</p>
          </motion.div>

          <motion.div className="social-links" variants={cardVariants}>
            <h3>Connect With Us</h3>
            <div className="social-icons">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="social-icon"
              >
                <i className="fab fa-facebook-f"></i>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="social-icon"
              >
                <i className="fab fa-twitter"></i>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="social-icon"
              >
                <i className="fab fa-instagram"></i>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="social-icon"
              >
                <i className="fab fa-linkedin-in"></i>
              </a>
            </div>
          </motion.div>
        </motion.div>

        <div className="contact-form-container">
          <h2>Send Us a Message</h2>

          {formStatus.success && (
            <motion.div
              className="success-message"
              variants={successVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              transition={{ duration: 0.3 }}
            >
              <p>Thank you for your message! We'll get back to you soon.</p>
            </motion.div>
          )}

          {formStatus.error && (
            <motion.div
              className="error-message"
              variants={successVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              transition={{ duration: 0.3 }}
            >
              <p>{formStatus.error}</p>
            </motion.div>
          )}

          <motion.form
            ref={formRef} // Attach ref to the form
            className="contact-form"
            onSubmit={handleSubmit}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div className="form-group" variants={formVariants}>
              <label htmlFor="name">Your Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? "error" : ""}
              />
              {errors.name && (
                <span className="error-message">{errors.name}</span>
              )}
            </motion.div>

            <motion.div className="form-group" variants={formVariants}>
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? "error" : ""}
              />
              {errors.email && (
                <span className="error-message">{errors.email}</span>
              )}
            </motion.div>

            <motion.div className="form-group" variants={formVariants}>
              <label htmlFor="subject">Subject</label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className={errors.subject ? "error" : ""}
              />
              {errors.subject && (
                <span className="error-message">{errors.subject}</span>
              )}
            </motion.div>

            <motion.div className="form-group" variants={formVariants}>
              <label htmlFor="message">Your Message</label>
              <textarea
                id="message"
                name="message"
                rows="5"
                value={formData.message}
                onChange={handleChange}
                className={errors.message ? "error" : ""}
              ></textarea>
              {errors.message && (
                <span className="error-message">{errors.message}</span>
              )}
            </motion.div>

            <motion.button
              type="submit"
              className="submit-btn"
              disabled={formStatus.submitted}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {formStatus.submitted ? (
                <span className="btn-spinner">
                  <i className="fas fa-spinner fa-spin"></i> Sending...
                </span>
              ) : (
                "Send Message"
              )}
            </motion.button>
          </motion.form>
        </div>
      </div>

      <motion.div
        className="contact-faq"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
      >
        <h2>Frequently Asked Questions</h2>
        <motion.div className="faq-container" variants={containerVariants}>
          <motion.div className="faq-item" variants={cardVariants}>
            <h3>How do I create an account?</h3>
            <p>
              You can create an account by clicking on the "Register" button in
              the navigation bar and filling out the registration form with
              your details.
            </p>
          </motion.div>

          <motion.div className="faq-item" variants={cardVariants}>
            <h3>Can I contribute to the blog?</h3>
            <p>
              Yes! Once you have registered as a blogger, you can start
              contributing by clicking on the "Write" button in the navigation
              bar after logging in.
            </p>
          </motion.div>

          <motion.div className="faq-item" variants={cardVariants}>
            <h3>How long does it take to get a response?</h3>
            <p>
              We typically respond to inquiries within 24-48 business hours. For
              urgent matters, please contact us directly by phone.
            </p>
          </motion.div>

          <motion.div className="faq-item" variants={cardVariants}>
            <h3>Is my information secure?</h3>
            <p>
              Yes, we take data security seriously and implement
              industry-standard measures to protect your personal information.
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}