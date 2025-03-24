import React, { useEffect } from "react";
import { motion } from "framer-motion";
import "../styles/About.css";
import { Link } from "react-router-dom";

const About = () => {
  // Team member data
  const teamMembers = [
    {
      name: "Sarah Johnson",
      role: "Founder & Editor",
      bio: "Former journalist with a passion for storytelling and digital media. Founded this blog to create a space for diverse voices and perspectives.",
      image:
        "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=500",
    },
    {
      name: "David Chen",
      role: "Tech Editor",
      bio: "Software engineer turned writer with expertise in emerging technologies and digital trends. Passionate about explaining complex topics in accessible ways.",
      image:
        "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=500",
    },
    {
      name: "Maya Patel",
      role: "Lifestyle Writer",
      bio: "Certified life coach and travel enthusiast who believes in mindful living. Writes about personal development, travel, and wellness.",
      image:
        "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=500",
    },
    {
      name: "James Wilson",
      role: "Creative Director",
      bio: "Visual storyteller with background in design and photography. Oversees the aesthetic and user experience of our platform.",
      image:
        "https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=500",
    },
  ];

  // Animation variants for framer motion
  const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.5 } },
    exit: { opacity: 0, transition: { duration: 0.3 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
      },
    }),
  };

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  return (
    <motion.div
      className="about-container"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
    >
      {/* Hero Section */}
      <div className="about-hero">
        <div className="about-hero-content">
          <h1>About Our Blog</h1>
          <p>
            Discover our story, mission, and the passionate team behind the
            content
          </p>
        </div>
      </div>

      {/* Mission Section */}
      <section className="about-section">
        <div className="about-section-inner">
          <motion.div
            className="about-card mission-card"
            custom={0}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={itemVariants}
          >
            <h2>Our Mission</h2>
            <p>
              We believe in the power of words to inform, inspire, and connect.
              Our mission is to create a platform where diverse voices can share
              meaningful stories, practical insights, and thought-provoking
              perspectives on topics that matter.
            </p>
            <p>
              In a world overloaded with information, we strive to deliver
              content that is authentic, well-researched, and adds genuine value
              to our readers' lives. Whether you're looking for practical
              advice, creative inspiration, or deeper understanding, we aim to
              be your trusted companion in exploration and growth.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="about-section values-section">
        <div className="about-section-inner">
          <h2 className="section-title">Our Values</h2>
          <div className="values-grid">
            <motion.div
              className="value-card"
              custom={0}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={itemVariants}
            >
              <div className="value-icon">
                <span>🔍</span>
              </div>
              <h3>Authenticity</h3>
              <p>
                We value honest, transparent content that reflects real
                experiences and genuine perspectives.
              </p>
            </motion.div>

            <motion.div
              className="value-card"
              custom={1}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={itemVariants}
            >
              <div className="value-icon">
                <span>🌍</span>
              </div>
              <h3>Inclusivity</h3>
              <p>
                We embrace diverse voices and perspectives that enrich our
                understanding of the world.
              </p>
            </motion.div>

            <motion.div
              className="value-card"
              custom={2}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={itemVariants}
            >
              <div className="value-icon">
                <span>💡</span>
              </div>
              <h3>Creativity</h3>
              <p>
                We believe in the power of creative thinking to solve problems
                and explore new possibilities.
              </p>
            </motion.div>

            <motion.div
              className="value-card"
              custom={3}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={itemVariants}
            >
              <div className="value-icon">
                <span>🤝</span>
              </div>
              <h3>Community</h3>
              <p>
                We foster meaningful connections between writers and readers who
                share common interests.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="about-section team-section">
        <div className="about-section-inner">
          <h2 className="section-title">Meet Our Team</h2>
          <div className="team-grid">
            {teamMembers.map((member, index) => (
              <motion.div
                className="team-card"
                key={index}
                custom={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={itemVariants}
              >
                <div className="team-image">
                  <img src={member.image} alt={member.name} />
                </div>
                <div className="team-info">
                  <h3>{member.name}</h3>
                  <h4>{member.role}</h4>
                  <p>{member.bio}</p>
                  <div className="social-links">
                    <a
                      href="https://twitter.com"
                      target="_blank"
                      rel="noreferrer"
                      aria-label="Twitter"
                    >
                      <i className="fab fa-twitter"></i>
                    </a>
                    <a
                      href="https://linkedin.com"
                      target="_blank"
                      rel="noreferrer"
                      aria-label="LinkedIn"
                    >
                      <i className="fab fa-linkedin-in"></i>
                    </a>
                    <a
                      href="https://gmail.com"
                      target="_blank"
                      rel="noreferrer"
                      aria-label="Email"
                    >
                      <i className="far fa-envelope"></i>
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="about-section story-section">
        <div className="about-section-inner">
          <div className="story-content">
            <motion.div
              className="story-text"
              custom={0}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={itemVariants}
            >
              <h2>Our Story</h2>
              <p>
                Founded in 2022, our blog began as a small passion project
                fueled by a desire to create meaningful content in an
                increasingly noisy digital landscape.
              </p>
              <p>
                What started as a personal creative outlet quickly evolved into
                a collaborative platform as we connected with other writers,
                creatives, and experts who shared our vision. Today, we're proud
                to host diverse voices covering topics from technology and
                business to wellness and creativity.
              </p>
              <p>
                Through the years, we've remained committed to our core belief:
                that thoughtful content has the power to inform, inspire, and
                foster genuine connection. As we continue to grow, we remain
                dedicated to maintaining the authenticity and quality that our
                community has come to expect.
              </p>
            </motion.div>
            <motion.div
              className="story-image"
              custom={1}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={itemVariants}
            >
              <img
                src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260"
                alt="Team working together"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Join Us Section */}
      <section className="about-section join-section">
        <div className="about-section-inner">
          <motion.div
            className="join-card"
            custom={0}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={itemVariants}
          >
            <h2>Join Our Community</h2>
            <p>
              We're always looking for passionate writers, thinkers, and
              creators to join our community. Whether you're interested in
              contributing content, collaborating on projects, or simply
              connecting with like-minded individuals, we'd love to hear from
              you.
            </p>
            <div className="cta-buttons">
              <Link to="/contact" className="primary-btn">
                Contact Us
              </Link>
              <Link to="/blogs" className="secondary-btn">
                See Blogs
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
};

export default About;
