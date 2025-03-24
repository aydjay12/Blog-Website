import React, { useEffect } from "react";
import { motion } from "framer-motion";
import "../styles/Privacy.css";
import { Link } from "react-router-dom";

const Privacy = () => {
  // Animation variants for framer motion
  const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.5 } },
    exit: { opacity: 0, transition: { duration: 0.3 } },
  };

  const sectionVariants = {
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

  // Last updated date
  const lastUpdated = "March 13, 2025";

  return (
    <motion.div
      className="privacy-container"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
    >
      {/* Hero Section */}
      <div className="privacy-hero">
        <div className="privacy-hero-content">
          <h1>Privacy Policy</h1>
          <p>
            We value your privacy and are committed to protecting your personal
            information
          </p>
        </div>
      </div>

      {/* Privacy Policy Content */}
      <section className="privacy-section">
        <div className="privacy-section-inner">
          <motion.div
            className="privacy-card introduction-card"
            custom={0}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={sectionVariants}
          >
            <div className="last-updated">
              <p>Last Updated: {lastUpdated}</p>
            </div>
            <p>
              Welcome to our blog. We respect your privacy and are committed to
              protecting your personal data. This privacy policy will inform you
              about how we look after your personal data when you visit our
              website and tell you about your privacy rights and how the law
              protects you.
            </p>
            <p>
              Please read this privacy policy carefully before using our
              services.
            </p>
          </motion.div>

          <div className="privacy-policy-grid">
            <motion.div
              className="privacy-policy-section"
              custom={1}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={sectionVariants}
            >
              <h2>1. Information We Collect</h2>
              <div className="policy-content">
                <h3>1.1 Personal Information</h3>
                <p>
                  We may collect the following types of personal information:
                </p>
                <ul>
                  <li>
                    <strong>Contact Information:</strong> Name, email address,
                    and other contact details when you subscribe to our
                    newsletter, comment on our blog posts, or contact us.
                  </li>
                  <li>
                    <strong>Account Information:</strong> Username, password,
                    and profile information if you create an account on our
                    website.
                  </li>
                  <li>
                    <strong>Communications:</strong> Content of emails,
                    comments, or messages you send us.
                  </li>
                </ul>

                <h3>1.2 Usage Information</h3>
                <p>
                  We automatically collect certain information about your
                  interaction with our website, including:
                </p>
                <ul>
                  <li>
                    <strong>Log Data:</strong> IP address, browser type,
                    operating system, referring web page, pages visited, and
                    time and date of visit.
                  </li>
                  <li>
                    <strong>Device Information:</strong> Information about the
                    device you use to access our website.
                  </li>
                  <li>
                    <strong>Cookies and Similar Technologies:</strong>{" "}
                    Information collected through cookies and similar tracking
                    technologies.
                  </li>
                </ul>
              </div>
            </motion.div>

            <motion.div
              className="privacy-policy-section"
              custom={2}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={sectionVariants}
            >
              <h2>2. How We Use Your Information</h2>
              <div className="policy-content">
                <p>
                  We use your personal information for the following purposes:
                </p>
                <ul>
                  <li>To provide and maintain our services</li>
                  <li>To notify you about changes to our services</li>
                  <li>
                    To allow you to participate in interactive features of our
                    website
                  </li>
                  <li>To provide customer support</li>
                  <li>
                    To gather analysis or valuable information so that we can
                    improve our services
                  </li>
                  <li>To monitor the usage of our services</li>
                  <li>To detect, prevent and address technical issues</li>
                  <li>
                    To send you newsletters, marketing or promotional materials,
                    and other information that may be of interest to you
                  </li>
                </ul>
              </div>
            </motion.div>

            <motion.div
              className="privacy-policy-section"
              custom={3}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={sectionVariants}
            >
              <h2>3. Cookies Policy</h2>
              <div className="policy-content">
                <p>
                  Our website uses cookies to enhance your browsing experience.
                  Cookies are small text files that are placed on your device
                  when you visit our website.
                </p>
                <p>We use the following types of cookies:</p>
                <ul>
                  <li>
                    <strong>Essential Cookies:</strong> These cookies are
                    necessary for the website to function and cannot be switched
                    off in our systems.
                  </li>
                  <li>
                    <strong>Performance Cookies:</strong> These cookies allow us
                    to count visits and traffic sources so we can measure and
                    improve the performance of our site.
                  </li>
                  <li>
                    <strong>Functionality Cookies:</strong> These cookies enable
                    the website to provide enhanced functionality and
                    personalization.
                  </li>
                  <li>
                    <strong>Advertising Cookies:</strong> These cookies may be
                    set through our site by our advertising partners to build a
                    profile of your interests.
                  </li>
                </ul>
                <p>
                  You can set your browser to refuse all or some browser
                  cookies, or to alert you when websites set or access cookies.
                  If you disable or refuse cookies, please note that some parts
                  of this website may become inaccessible or not function
                  properly.
                </p>
              </div>
            </motion.div>

            <motion.div
              className="privacy-policy-section"
              custom={4}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={sectionVariants}
            >
              <h2>4. Sharing Your Information</h2>
              <div className="policy-content">
                <p>
                  We may share your personal information with the following
                  third parties:
                </p>
                <ul>
                  <li>
                    <strong>Service Providers:</strong> We may share your
                    information with third-party service providers who help us
                    operate our website and provide services (e.g., hosting
                    providers, email service providers).
                  </li>
                  <li>
                    <strong>Analytics Providers:</strong> We may share your
                    information with analytics providers to help us understand
                    how users access and use our website.
                  </li>
                  <li>
                    <strong>Business Transfers:</strong> If we are involved in a
                    merger, acquisition, or sale of all or a portion of our
                    assets, your information may be transferred as part of that
                    transaction.
                  </li>
                  <li>
                    <strong>Legal Requirements:</strong> We may disclose your
                    information if required to do so by law or in response to
                    valid requests by public authorities.
                  </li>
                </ul>
                <p>
                  We do not sell, rent, or lease your personal information to
                  third parties.
                </p>
              </div>
            </motion.div>

            <motion.div
              className="privacy-policy-section"
              custom={5}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={sectionVariants}
            >
              <h2>5. Data Security</h2>
              <div className="policy-content">
                <p>
                  We implement appropriate technical and organizational measures
                  to protect your personal information against unauthorized
                  access, accidental loss, alteration, disclosure, or
                  destruction.
                </p>
                <p>
                  However, no method of transmission over the Internet or method
                  of electronic storage is 100% secure. While we strive to use
                  commercially acceptable means to protect your personal
                  information, we cannot guarantee its absolute security.
                </p>
              </div>
            </motion.div>

            <motion.div
              className="privacy-policy-section"
              custom={6}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={sectionVariants}
            >
              <h2>6. Your Rights</h2>
              <div className="policy-content">
                <p>
                  Depending on your location, you may have the following rights
                  regarding your personal information:
                </p>
                <ul>
                  <li>
                    The right to access, update, or delete your personal
                    information
                  </li>
                  <li>
                    The right to rectification (to correct incorrect data)
                  </li>
                  <li>The right to restrict processing of your data</li>
                  <li>The right to object to our processing of your data</li>
                  <li>The right to data portability</li>
                  <li>The right to withdraw consent</li>
                </ul>
                <p>
                  To exercise any of these rights, please contact us using the
                  contact information provided below.
                </p>
              </div>
            </motion.div>

            <motion.div
              className="privacy-policy-section"
              custom={7}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={sectionVariants}
            >
              <h2>7. Children's Privacy</h2>
              <div className="policy-content">
                <p>
                  Our website is not intended for children under the age of 16.
                  We do not knowingly collect personal information from children
                  under 16. If you are a parent or guardian and you are aware
                  that your child has provided us with personal information,
                  please contact us.
                </p>
              </div>
            </motion.div>

            <motion.div
              className="privacy-policy-section"
              custom={8}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={sectionVariants}
            >
              <h2>8. Changes to This Privacy Policy</h2>
              <div className="policy-content">
                <p>
                  We may update our privacy policy from time to time. We will
                  notify you of any changes by posting the new privacy policy on
                  this page and updating the "Last Updated" date.
                </p>
                <p>
                  You are advised to review this privacy policy periodically for
                  any changes. Changes to this privacy policy are effective when
                  they are posted on this page.
                </p>
              </div>
            </motion.div>

            <motion.div
              className="privacy-policy-section"
              custom={9}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={sectionVariants}
            >
              <h2>9. Contact Us</h2>
              <div className="policy-content">
                <p>
                  If you have any questions about this privacy policy or our
                  data practices, please contact us:
                </p>
                <ul className="contact-info">
                  <li>
                    <strong>Email:</strong> privacy@yourblogname.com
                  </li>
                  <li>
                    <strong>Address:</strong> 123 Blog Street, Web City,
                    Internet 12345
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="privacy-contact-section">
        <div className="about-section-inner">
          <motion.div
            className="privacy-contact-card"
            custom={10}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={sectionVariants}
          >
            <h2>Questions or Concerns?</h2>
            <p>
              We take your privacy seriously. If you have any questions,
              concerns, or would like to exercise your privacy rights, we're
              here to help.
            </p>
            <div className="cta-buttons">
              <Link to="/contact" className="primary-btn">
                Contact Us
              </Link>
              <Link to="/blogs" className="secondary-btn">
                Back to Blogs
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
};

export default Privacy;
