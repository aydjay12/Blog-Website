import React, { useEffect } from "react";
import { motion } from "framer-motion";
import "../styles/Terms.css";
import { Link } from "react-router-dom";

const Terms = () => {
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
      className="terms-container"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
    >
      {/* Hero Section */}
      <div className="terms-hero">
        <div className="terms-hero-content">
          <h1>Terms of Service</h1>
          <p>Please read these terms carefully before using our platform</p>
        </div>
      </div>

      {/* Terms of Service Content */}
      <section className="terms-section">
        <div className="terms-section-inner">
          <motion.div
            className="terms-card introduction-card"
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
              Welcome to our blog. These Terms of Service ("Terms") govern your
              access to and use of our website, including any content,
              functionality, and services offered on or through our website.
            </p>
            <p>
              By accessing or using our website, you agree to be bound by these
              Terms. If you do not agree to these Terms, you must not access or
              use our website.
            </p>
          </motion.div>

          <div className="terms-policy-grid">
            <motion.div
              className="terms-policy-section"
              custom={1}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={sectionVariants}
            >
              <h2>1. Acceptance of Terms</h2>
              <div className="policy-content">
                <p>
                  By accessing or using our website, you acknowledge that you
                  have read, understood, and agree to be bound by these Terms.
                  We may revise these Terms at any time by updating this page.
                  Your continued use of the website following the posting of
                  revised Terms means that you accept and agree to the changes.
                </p>
              </div>
            </motion.div>

            <motion.div
              className="terms-policy-section"
              custom={2}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={sectionVariants}
            >
              <h2>2. User Accounts</h2>
              <div className="policy-content">
                <h3>2.1 Account Creation</h3>
                <p>
                  When you create an account with us, you must provide
                  information that is accurate, complete, and current at all
                  times. Failure to do so constitutes a breach of the Terms,
                  which may result in immediate termination of your account on
                  our website.
                </p>

                <h3>2.2 Account Security</h3>
                <p>
                  You are responsible for safeguarding the password that you use
                  to access our website and for any activities or actions under
                  your password. We encourage you to use "strong" passwords
                  (passwords that use a combination of upper and lower case
                  letters, numbers, and symbols) with your account.
                </p>

                <h3>2.3 Account Termination</h3>
                <p>
                  We reserve the right to terminate or suspend your account
                  immediately, without prior notice or liability, for any reason
                  whatsoever, including without limitation if you breach the
                  Terms.
                </p>
              </div>
            </motion.div>

            <motion.div
              className="terms-policy-section"
              custom={3}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={sectionVariants}
            >
              <h2>3. Intellectual Property</h2>
              <div className="policy-content">
                <h3>3.1 Our Content</h3>
                <p>
                  The website and its original content, features, and
                  functionality are and will remain the exclusive property of
                  our blog and its licensors. The website is protected by
                  copyright, trademark, and other laws of both the United States
                  and foreign countries.
                </p>

                <h3>3.2 Your Use of Our Content</h3>
                <p>
                  Our content may not be downloaded, copied, reproduced,
                  distributed, transmitted, broadcast, displayed, sold,
                  licensed, or otherwise exploited for any other purposes
                  without our prior written consent.
                </p>

                <h3>3.3 Your Content</h3>
                <p>
                  By posting content on our website, you grant us a
                  non-exclusive, worldwide, royalty-free license to use,
                  reproduce, adapt, publish, translate, and distribute your
                  content in any existing or future media. You represent and
                  warrant that you own or have the necessary rights to post the
                  content and that the content does not violate any third
                  party's rights.
                </p>
              </div>
            </motion.div>

            <motion.div
              className="terms-policy-section"
              custom={4}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={sectionVariants}
            >
              <h2>4. User Conduct</h2>
              <div className="policy-content">
                <p>You agree that you will not:</p>
                <ul>
                  <li>
                    Use the website in any way that violates any applicable
                    local, state, national, or international law or regulation
                  </li>
                  <li>
                    Post any content that is unlawful, abusive, harassing,
                    threatening, defamatory, obscene, vulgar, pornographic, or
                    invasive of another's privacy
                  </li>
                  <li>
                    Impersonate any person or entity, or falsely state or
                    otherwise misrepresent your affiliation with a person or
                    entity
                  </li>
                  <li>
                    Interfere with or disrupt the website or servers or networks
                    connected to the website
                  </li>
                  <li>
                    Transmit any material that contains software viruses or any
                    other computer code, files, or programs designed to
                    interrupt, destroy, or limit the functionality of any
                    computer software or hardware
                  </li>
                  <li>
                    Collect or store personal data about other users without
                    their express permission
                  </li>
                </ul>
              </div>
            </motion.div>

            <motion.div
              className="terms-policy-section"
              custom={5}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={sectionVariants}
            >
              <h2>5. Comments and Interaction</h2>
              <div className="policy-content">
                <p>
                  Our blog may include areas where users can post comments or
                  interact with other users. When you post comments, you are
                  responsible for the content of those comments.
                </p>
                <p>
                  We reserve the right to remove any comments or content that
                  violates these Terms or that we find objectionable for any
                  reason, without prior notice. We may also restrict, suspend,
                  or terminate your access to these features if we believe you
                  are in violation of these Terms.
                </p>
              </div>
            </motion.div>

            <motion.div
              className="terms-policy-section"
              custom={6}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={sectionVariants}
            >
              <h2>6. Third-Party Links</h2>
              <div className="policy-content">
                <p>
                  Our website may contain links to third-party websites or
                  services that are not owned or controlled by us. We have no
                  control over, and assume no responsibility for, the content,
                  privacy policies, or practices of any third-party websites or
                  services.
                </p>
                <p>
                  You acknowledge and agree that we shall not be responsible or
                  liable, directly or indirectly, for any damage or loss caused
                  or alleged to be caused by or in connection with the use of or
                  reliance on any such content, goods, or services available on
                  or through any such websites or services.
                </p>
              </div>
            </motion.div>

            <motion.div
              className="terms-policy-section"
              custom={7}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={sectionVariants}
            >
              <h2>7. Disclaimer of Warranties</h2>
              <div className="policy-content">
                <p>
                  Our website is provided on an "as is" and "as available"
                  basis. We make no warranties, expressed or implied, and hereby
                  disclaim and negate all other warranties, including without
                  limitation, implied warranties or conditions of
                  merchantability, fitness for a particular purpose, or
                  non-infringement of intellectual property or other violation
                  of rights.
                </p>
                <p>
                  We do not warrant or make any representations concerning the
                  accuracy, likely results, or reliability of the use of the
                  materials on our website or otherwise relating to such
                  materials or on any websites linked to this website.
                </p>
              </div>
            </motion.div>

            <motion.div
              className="terms-policy-section"
              custom={8}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={sectionVariants}
            >
              <h2>8. Limitation of Liability</h2>
              <div className="policy-content">
                <p>
                  In no event shall we be liable for any direct, indirect,
                  incidental, special, consequential damages or any damages
                  whatsoever, including, without limitation, damages for loss of
                  use, data, or profits arising out of or in any way connected
                  with:
                </p>
                <ul>
                  <li>The use or performance of our website</li>
                  <li>The delay or inability to use our website</li>
                  <li>The provision of or failure to provide services</li>
                  <li>
                    Any information, software, products, services, and related
                    graphics obtained through our website
                  </li>
                </ul>
                <p>
                  Whether based on contract, tort, negligence, strict liability,
                  or otherwise, even if we have been advised of the possibility
                  of such damages.
                </p>
              </div>
            </motion.div>

            <motion.div
              className="terms-policy-section"
              custom={9}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={sectionVariants}
            >
              <h2>9. Indemnification</h2>
              <div className="policy-content">
                <p>
                  You agree to defend, indemnify, and hold us harmless from and
                  against any claims, liabilities, damages, losses, and
                  expenses, including, without limitation, reasonable legal and
                  accounting fees, arising out of or in any way connected with:
                </p>
                <ul>
                  <li>Your access to or use of our website</li>
                  <li>Your violation of these Terms</li>
                  <li>
                    Your violation of any third party right, including without
                    limitation any copyright, property, or privacy right
                  </li>
                </ul>
              </div>
            </motion.div>

            <motion.div
              className="terms-policy-section"
              custom={10}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={sectionVariants}
            >
              <h2>10. Termination</h2>
              <div className="policy-content">
                <p>
                  We may terminate or suspend your access to our website
                  immediately, without prior notice or liability, for any reason
                  whatsoever, including without limitation if you breach the
                  Terms.
                </p>
                <p>
                  All provisions of the Terms which by their nature should
                  survive termination shall survive termination, including,
                  without limitation, ownership provisions, warranty
                  disclaimers, indemnity, and limitations of liability.
                </p>
              </div>
            </motion.div>

            <motion.div
              className="terms-policy-section"
              custom={11}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={sectionVariants}
            >
              <h2>11. Governing Law</h2>
              <div className="policy-content">
                <p>
                  These Terms shall be governed and construed in accordance with
                  the laws of the United States, without regard to its conflict
                  of law provisions.
                </p>
                <p>
                  Our failure to enforce any right or provision of these Terms
                  will not be considered a waiver of those rights. If any
                  provision of these Terms is held to be invalid or
                  unenforceable by a court, the remaining provisions of these
                  Terms will remain in effect.
                </p>
              </div>
            </motion.div>

            <motion.div
              className="terms-policy-section"
              custom={12}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={sectionVariants}
            >
              <h2>12. Changes to Terms</h2>
              <div className="policy-content">
                <p>
                  We reserve the right, at our sole discretion, to modify or
                  replace these Terms at any time. If a revision is material, we
                  will try to provide at least 30 days' notice prior to any new
                  terms taking effect.
                </p>
                <p>
                  By continuing to access or use our website after those
                  revisions become effective, you agree to be bound by the
                  revised terms. If you do not agree to the new terms, please
                  stop using the website.
                </p>
              </div>
            </motion.div>

            <motion.div
              className="terms-policy-section"
              custom={13}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={sectionVariants}
            >
              <h2>13. Contact Us</h2>
              <div className="policy-content">
                <p>
                  If you have any questions about these Terms, please contact
                  us:
                </p>
                <ul className="contact-info">
                  <li>
                    <strong>Email:</strong> terms@yourblogname.com
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
      <section className="terms-contact-section">
        <div className="about-section-inner">
          <motion.div
            className="terms-contact-card"
            custom={14}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={sectionVariants}
          >
            <h2>Have Questions?</h2>
            <p>
              We want to make sure you understand our terms. If you have any
              questions about these Terms of Service, please don't hesitate to
              reach out to us.
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

export default Terms;
