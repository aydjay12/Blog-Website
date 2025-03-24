import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaCamera,
  FaTags,
  FaPlus,
  FaHeading,
  FaQuoteRight,
  FaListUl,
  FaSave,
} from "react-icons/fa";
import "../styles/Write.css";
import Loading from "../components/loading/Loading";
import { usePostsStore } from "../store/usePostsStore";
import { useAuthStore } from "../store/useAuthStore";

export default function Edit() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [formattedContent, setFormattedContent] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState("");
  const [editorMode, setEditorMode] = useState("write");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const errorTimeoutRef = useRef(null);
  const successTimeoutRef = useRef(null);
  const [validationErrors, setValidationErrors] = useState({
    categories: false,
    tags: false,
  });
  const [hasFetchedPost, setHasFetchedPost] = useState(false);

  const { currentPost, loadingPost, loadingUpdate, error, fetchPostBySlug, updatePost, uploadPostImage } =
    usePostsStore();
  const { isAuthenticated } = useAuthStore();

  const categories = [
    "Technology",
    "Travel",
    "Lifestyle",
    "Health",
    "Business",
    "Creativity",
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  useEffect(() => {
    const fetchData = async () => {
      setHasFetchedPost(false);
      await fetchPostBySlug(slug);
      setHasFetchedPost(true);
    };
    fetchData();
  }, [slug, fetchPostBySlug]);

  useEffect(() => {
    if (currentPost && hasFetchedPost) {
      setTitle(currentPost.title);
      setPreviewUrl(currentPost.img || "");
      setSelectedCategories(currentPost.categories || []);
      setTags(currentPost.tags || []);
      const plainTextContent = convertFromHTML(currentPost.content);
      setContent(plainTextContent);
      setFormattedContent(currentPost.content);
      setValidationErrors({
        categories: (currentPost.categories || []).length === 0,
        tags: (currentPost.tags || []).length === 0,
      });
    }
  }, [currentPost, hasFetchedPost]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const convertFromHTML = (html) => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    let plainText = "";

    const processNode = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        plainText += node.textContent;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.tagName === "H2") {
          plainText += "\n\n# " + node.textContent.trim() + "\n\n";
        } else if (node.tagName === "P") {
          plainText += "\n\n" + node.textContent.trim() + "\n\n";
        } else if (node.tagName === "BLOCKQUOTE") {
          let quoteText = "";
          let citation = "";
          Array.from(node.childNodes).forEach((child) => {
            if (child.nodeType === Node.TEXT_NODE) {
              quoteText += child.textContent.replace(/\\"/g, "\"").trim();
            } else if (child.tagName === "CITE") {
              citation = child.textContent.replace(/^—\s*/, "").trim();
            }
          });
          const formattedQuote = quoteText.startsWith('"') && quoteText.endsWith('"') 
            ? quoteText 
            : `"${quoteText}"`;
          plainText += `\n\n${formattedQuote} — ${citation}\n\n`;
        } else if (node.tagName === "UL") {
          plainText += "\n\n";
          Array.from(node.children).forEach((li) => {
            plainText += "* " + li.textContent.trim() + "\n";
          });
          plainText += "\n";
        } else {
          Array.from(node.childNodes).forEach(processNode);
        }
      }
    };

    Array.from(tempDiv.childNodes).forEach(processNode);
    return plainText.replace(/\n{3,}/g, "\n\n").trim();
  };

  const convertToHTML = () => {
    let html = "";
    const paragraphs = content.split(/\n\s*\n/);
    paragraphs.forEach((paragraph) => {
      const trimmed = paragraph.trim();
      if (trimmed.startsWith("# ")) {
        const headingText = trimmed.substring(2);
        html += `<h2>${headingText}</h2>\n`;
      } else if (trimmed.match(/^".*"[\s]*—[\s]*.*$/)) {
        // Quoted text followed by " — " and citation
        const parts = trimmed.match(/^"(.*)"[\s]*—[\s]*(.*)$/);
        if (parts && parts.length >= 3) {
          const quote = parts[1].trim();
          const citation = parts[2].trim();
          html += `<blockquote>"${quote}"<cite>— ${citation}</cite></blockquote>\n`;
        } else {
          html += `<p>${trimmed}</p>\n`;
        }
      } else if (trimmed.match(/^[^"].*[^"]\s*—\s*.*$/)) {
        // Unquoted text followed by " — " and citation
        const parts = trimmed.split(/\s*—\s*/);
        if (parts.length >= 2) {
          const quote = parts[0].trim();
          const citation = parts.slice(1).join(" — ").trim();
          html += `<blockquote>"${quote}"<cite>— ${citation}</cite></blockquote>\n`;
        } else {
          html += `<p>${trimmed}</p>\n`;
        }
      } else if (
        trimmed.split("\n").every((line) => line.trim().startsWith("*"))
      ) {
        const listItems = trimmed
          .split("\n")
          .map((line) => `<li>${line.trim().substring(1).trim()}</li>`)
          .join("\n");
        html += `<ul>\n${listItems}\n</ul>\n`;
      } else if (trimmed) {
        html += `<p>${trimmed}</p>\n`;
      }
    });
    setFormattedContent(html);
    return html;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const fileReader = new FileReader();
      fileReader.onload = () => setPreviewUrl(fileReader.result);
      fileReader.readAsDataURL(file);
    }
  };

  const toggleCategory = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
    setValidationErrors((prev) => ({
      ...prev,
      categories: selectedCategories.length === 0 && !selectedCategories.includes(category),
    }));
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
      setValidationErrors((prev) => ({ ...prev, tags: false }));
    }
  };

  const removeTag = (tagToRemove) => {
    const updatedTags = tags.filter((tag) => tag !== tagToRemove);
    setTags(updatedTags);
    setValidationErrors((prev) => ({ ...prev, tags: updatedTags.length === 0 }));
  };

  const showError = (message) => {
    setErrorMessage(message);
    if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
    errorTimeoutRef.current = setTimeout(() => setErrorMessage(""), 3000);
  };

  const showSuccess = (message) => {
    setSuccessMessage(message);
    if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
    successTimeoutRef.current = setTimeout(() => setSuccessMessage(""), 3000);
  };

  const addFormatting = (type) => {
    if (editorMode === "preview") {
      showError("Click on the Edit button to start editing");
      return;
    }

    const textarea = document.querySelector(".content-textarea");
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selection = content.substring(start, end);
    let formattedText = "";
    let cursorOffset = 0;

    switch (type) {
      case "heading":
        formattedText = `\n\n# ${selection || "New Heading"}\n\n`;
        cursorOffset = selection ? 0 : -11;
        break;
      case "blockquote":
        formattedText = `\n\n"${selection || "Your quote here"}" — Author\n\n`;
        cursorOffset = selection ? -8 : -23;
        break;
      case "list":
        formattedText = `\n\n* ${selection || "List item 1"}\n* List item 2\n* List item 3\n\n`;
        cursorOffset = selection ? 0 : -34;
        break;
      default:
        return;
    }

    const newContent = content.substring(0, start) + formattedText + content.substring(end);
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      const newCursorPosition = start + formattedText.length + cursorOffset;
      textarea.setSelectionRange(newCursorPosition, newCursorPosition);
    }, 0);
  };

  const togglePreview = () => {
    if (editorMode === "write") {
      convertToHTML();
      setEditorMode("preview");
    } else {
      setEditorMode("write");
    }
  };

  const validateForm = () => {
    const errors = {
      categories: selectedCategories.length === 0,
      tags: tags.length === 0,
    };
    setValidationErrors(errors);
    return !Object.values(errors).some((error) => error);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      showError("Please log in to update this post");
      navigate("/login");
      return;
    }

    if (!validateForm()) {
      if (selectedCategories.length === 0 && tags.length === 0) {
        showError("Please select at least one category and add at least one tag");
      } else if (selectedCategories.length === 0) {
        showError("Please select at least one category");
      } else if (tags.length === 0) {
        showError("Please add at least one tag");
      }
      return;
    }

    if (!title || !content) {
      showError("Title and content are required");
      return;
    }

    // Set loadingUpdate to true immediately to show "Updating..." on the button
    usePostsStore.setState({ loadingUpdate: true });

    try {
      let imageUrl = currentPost?.img || "";
      if (selectedFile) {
        // Pass context to use loadingUpdate instead of loadingPost
        imageUrl = await uploadPostImage(selectedFile, { isUpdate: true });
      }

      const htmlContent = convertToHTML();
      const postData = {
        title,
        content: htmlContent,
        img: imageUrl,
        categories: selectedCategories,
        tags,
      };

      await updatePost(currentPost._id, postData);
      const updatedPost = usePostsStore.getState().currentPost;
      showSuccess("Post updated successfully!");
      setTimeout(() => navigate(`/post/${updatedPost.slug}`), 2000);
    } catch (error) {
      showError("Failed to update post. Please try again.");
    } finally {
      usePostsStore.setState({ loadingUpdate: false });
    }
  };

  const handleCancel = () => {
    navigate(`/post/${slug}`);
  };

  if (loadingPost || !hasFetchedPost) {
    return <Loading />;
  }

  if (error || !currentPost) {
    return (
      <div className="write-page">
        <div className="write-content">
          <p>{error || "Post not found"}</p>
          <Link to="/blogs">Back to Blogs</Link>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="write-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="write-content">
        <motion.div
          className="write-header"
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.5 }}
        >
          <h1>Edit Post</h1>
          <p>Update your post and publish the changes</p>
        </motion.div>

        <motion.form
          className="write-form"
          onSubmit={handleSubmit}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className="write-post-hero"
            variants={sectionVariants}
            transition={{ duration: 0.6 }}
          >
            <div className="write-post-image-container">
              <div
                className="image-preview"
                style={{ backgroundImage: `url(${previewUrl})` }}
              >
                <div className="image-overlay">
                  <label htmlFor="fileInput" className="upload-label">
                    <FaCamera size={20} />
                    <span>Change Cover</span>
                  </label>
                  <input
                    id="fileInput"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                  />
                </div>
              </div>
            </div>
            <motion.div className="form-group" variants={sectionVariants}>
              <input
                type="text"
                className="title-input"
                placeholder="Title of your Post"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </motion.div>
          </motion.div>

          <motion.div
            className={`form-group category-section ${validationErrors.categories ? "validation-error" : ""}`}
            variants={sectionVariants}
          >
            <div className="category-label">
              <FaTags size={16} />
              <span>Select categories:</span>
              <span className="required-indicator">*</span>
            </div>
            <motion.div className="category-options" variants={containerVariants}>
              {categories.map((category, index) => (
                <motion.button
                  type="button"
                  key={index}
                  className={`category-tag ${selectedCategories.includes(category) ? "active" : ""}`}
                  onClick={() => toggleCategory(category)}
                  variants={sectionVariants}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {category}
                </motion.button>
              ))}
            </motion.div>
            {validationErrors.categories && (
              <p className="validation-message">Please select at least one category</p>
            )}
          </motion.div>

          <motion.div
            className={`form-group tags-section ${validationErrors.tags ? "validation-error" : ""}`}
            variants={sectionVariants}
          >
            <div className="tags-label">
              <FaTags size={16} />
              <span>Edit tags:</span>
              <span className="required-indicator">*</span>
            </div>
            <div className="tags-container">
              <motion.div className="tags-list" variants={containerVariants}>
                {tags.map((tag, index) => (
                  <motion.div key={index} className="tag-item" variants={sectionVariants}>
                    <span className="tag-text">{tag}</span>
                    <button
                      type="button"
                      className="tag-remove-btn"
                      onClick={() => removeTag(tag)}
                    >
                      ×
                    </button>
                  </motion.div>
                ))}
              </motion.div>
              <div className="tag-input-container">
                <input
                  type="text"
                  className="tag-input"
                  placeholder="Add a tag (e.g., webdev, react)"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag(e);
                    }
                  }}
                />
                <motion.button
                  type="button"
                  className="tag-add-btn"
                  onClick={handleAddTag}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FaPlus size={12} />
                </motion.button>
              </div>
            </div>
            <p className="tags-hint">Press Enter or click the plus icon to add a tag</p>
            {validationErrors.tags && (
              <p className="validation-message">Please add at least one tag</p>
            )}
          </motion.div>

          <motion.div className="form-group" variants={sectionVariants}>
            <div className="editor-toolbar">
              <motion.div className="editor-actions" variants={containerVariants}>
                <motion.button
                  type="button"
                  className="toolbar-btn"
                  title="Add Heading"
                  onClick={() => addFormatting("heading")}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FaHeading />
                </motion.button>
                <motion.button
                  type="button"
                  className="toolbar-btn"
                  title="Add Blockquote"
                  onClick={() => addFormatting("blockquote")}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FaQuoteRight />
                </motion.button>
                <motion.button
                  type="button"
                  className="toolbar-btn"
                  title="Add List"
                  onClick={() => addFormatting("list")}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FaListUl />
                </motion.button>
              </motion.div>
              <motion.button
                type="button"
                className="preview-toggle-btn"
                onClick={togglePreview}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {editorMode === "write" ? "Preview" : "Edit"}
              </motion.button>
            </div>

            {editorMode === "write" ? (
              <textarea
                className="content-textarea"
                placeholder="Start writing your story..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            ) : (
              <div className="content-preview">
                <div dangerouslySetInnerHTML={{ __html: formattedContent }} />
              </div>
            )}
            <p className="tags-hint">
              Use # for Header, quotes for blockquotes, and * for list items
            </p>
          </motion.div>

          <motion.div className="form-actions" variants={containerVariants}>
            <motion.button
              type="button"
              className="save-draft-btn"
              onClick={handleCancel}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={loadingUpdate}
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              className="publish-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={loadingUpdate}
            >
              <FaSave /> {loadingUpdate ? "Updating..." : "Update Post"}
            </motion.button>
          </motion.div>
        </motion.form>
      </div>

      {errorMessage && <div className="error-toast">{errorMessage}</div>}
      {successMessage && <div className="success-toast">{successMessage}</div>}
    </motion.div>
  );
}