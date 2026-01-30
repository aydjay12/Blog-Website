import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FaCamera,
  FaTags,
  FaPlus,
  FaHeading,
  FaQuoteRight,
  FaListUl,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "../styles/Write.css";
import { usePostsStore } from "../store/usePostsStore";
import { useAuthStore } from "../store/useAuthStore";

export default function Write() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [formattedContent, setFormattedContent] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(
    "https://plus.unsplash.com/premium_photo-1725285937667-825eff7f1be8?q=80&w=1402&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  );
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState("");
  const [editorMode, setEditorMode] = useState("write");
  const [errorMessage, setErrorMessage] = useState("");
  const [draftSaved, setDraftSaved] = useState(false);
  const errorTimeoutRef = useRef(null);
  const draftTimeoutRef = useRef(null);
  const [validationErrors, setValidationErrors] = useState({
    categories: false,
    tags: false,
  });
  const [publishSuccess, setPublishSuccess] = useState(false);
  const publishTimeoutRef = useRef(null); // Ref to clear the timeout

  const navigate = useNavigate();
  const { createPost, uploadPostImage, loadingPost } = usePostsStore();
  const { isAuthenticated } = useAuthStore();

  const categories = [
    "Technology",
    "Travel",
    "Lifestyle",
    "Health",
    "Business",
    "Creativity",
  ];

  const loadSampleContent = () => {
    if (editorMode === "preview") {
      showError("Click on the Edit button to start editing");
      return;
    }

    const sampleContent = `
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl vel tincidunt luctus, nisl nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl.

# The Evolution of Frontend Development

"Good code is its own best documentation." — Steve McConnell

* React has transformed component-based architecture
* Vue offers simplicity and straightforward learning curve
* Angular provides a comprehensive solution for large applications
    `;
    setContent(sampleContent);
    setValidationErrors({ categories: false, tags: false });
    showError("Sample content loaded successfully");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setPreviewUrl(fileReader.result);
      };
      fileReader.readAsDataURL(file);
    }
  };

  const toggleCategory = (category) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== category));
      if (selectedCategories.length === 1) {
        setValidationErrors((prev) => ({ ...prev, categories: true }));
      }
    } else {
      setSelectedCategories([...selectedCategories, category]);
      setValidationErrors((prev) => ({ ...prev, categories: false }));
    }
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    if (newTag.trim() !== "" && !tags.includes(newTag.trim())) {
      const updatedTags = [...tags, newTag.trim()];
      setTags(updatedTags);
      setNewTag("");
      setValidationErrors((prev) => ({ ...prev, tags: false }));
    }
  };

  const removeTag = (tagToRemove) => {
    const updatedTags = tags.filter((tag) => tag !== tagToRemove);
    setTags(updatedTags);
    if (updatedTags.length === 0) {
      setValidationErrors((prev) => ({ ...prev, tags: true }));
    }
  };

  const convertToHTML = () => {
    let html = "";
    const paragraphs = content.split(/\n\s*\n/);
    paragraphs.forEach((paragraph) => {
      if (paragraph.trim().startsWith("# ")) {
        const headingText = paragraph.trim().substring(2);
        html += `<h2>${headingText}</h2>\n`;
      } else if (paragraph.trim().match(/^".*"[\s]*—.*$/)) {
        const parts = paragraph.trim().split(/^"(.*)"[\s]*—(.*)$/);
        if (parts.length >= 3) {
          html += `<blockquote>\n"${parts[1]}"\n<cite>— ${parts[2]}</cite>\n</blockquote>\n`;
        } else {
          html += `<p>${paragraph}</p>\n`;
        }
      } else if (
        paragraph
          .trim()
          .split("\n")
          .every((line) => line.trim().startsWith("*"))
      ) {
        const listItems = paragraph
          .trim()
          .split("\n")
          .map((line) => `<li>${line.trim().substring(1).trim()}</li>`)
          .join("\n");
        html += `<ul>\n${listItems}\n</ul>\n`;
      } else {
        html += `<p>${paragraph}</p>\n`;
      }
    });
    setFormattedContent(html);
    return html;
  };

  const showError = (message) => {
    setErrorMessage(message);
    if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
    errorTimeoutRef.current = setTimeout(() => setErrorMessage(""), 3000);
  };

  const showSuccess = (message, type) => {
    if (type === "draft") {
      setDraftSaved(true);
      if (draftTimeoutRef.current) clearTimeout(draftTimeoutRef.current);
      draftTimeoutRef.current = setTimeout(() => setDraftSaved(false), 3000);
    } else if (type === "publish") {
      setPublishSuccess(true);
      if (publishTimeoutRef.current) clearTimeout(publishTimeoutRef.current);
      publishTimeoutRef.current = setTimeout(
        () => setPublishSuccess(false),
        3000
      );
    }
  };

  const addFormatting = (type) => {
    if (editorMode === "preview") {
      showError("Click on the Edit button to start editing");
      return;
    }

    const textarea = document.querySelector(".content-textarea");
    if (!textarea) {
      showError("Editor not available");
      return;
    }

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
        formattedText = `\n\n* ${selection || "List item 1"
          }\n* List item 2\n* List item 3\n\n`;
        cursorOffset = selection ? 0 : -34;
        break;
      default:
        return;
    }

    const newContent =
      content.substring(0, start) + formattedText + content.substring(end);
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      const newCursorPosition = start + formattedText.length + cursorOffset;
      textarea.setSelectionRange(newCursorPosition, newCursorPosition);
      ensureCursorVisible(textarea);
    }, 0);
  };

  const ensureCursorVisible = (textarea) => {
    const cursorPosition = textarea.selectionStart;
    const temp = document.createElement("textarea");
    temp.style.visibility = "hidden";
    temp.style.position = "absolute";
    temp.style.height = "auto";
    temp.style.width = textarea.clientWidth + "px";
    temp.style.fontSize = window.getComputedStyle(textarea).fontSize;
    temp.style.lineHeight = window.getComputedStyle(textarea).lineHeight;
    temp.style.paddingTop = window.getComputedStyle(textarea).paddingTop;
    temp.style.paddingBottom = window.getComputedStyle(textarea).paddingBottom;
    temp.value = textarea.value.substring(0, cursorPosition);
    document.body.appendChild(temp);

    const cursorPixelPosition = temp.scrollHeight;
    document.body.removeChild(temp);

    const textareaVisibleHeight = textarea.clientHeight;
    const scrollTop = textarea.scrollTop;
    const scrollBottom = scrollTop + textareaVisibleHeight;
    const margin = 50;

    if (cursorPixelPosition > scrollBottom - margin) {
      textarea.scrollTop = cursorPixelPosition - textareaVisibleHeight + margin;
    } else if (cursorPixelPosition < scrollTop + margin) {
      textarea.scrollTop = Math.max(0, cursorPixelPosition - margin);
    }
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
      showError("Please log in to publish a post");
      navigate("/login");
      return;
    }

    if (!validateForm()) {
      if (selectedCategories.length === 0 && tags.length === 0) {
        showError(
          "Please select at least one category and add at least one tag"
        );
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

    usePostsStore.setState({ loadingPost: true });

    try {
      let imageUrl = "";
      if (selectedFile) {
        imageUrl = await uploadPostImage(selectedFile);
      }

      const htmlContent = convertToHTML();
      const postData = {
        title,
        content: htmlContent,
        img: imageUrl || "",
        categories: selectedCategories,
        tags,
      };

      const newPost = await createPost(postData);
      if (newPost) {
        localStorage.removeItem("blogDraft");
        showSuccess("Post published successfully!", "publish"); // Add success message
        setTimeout(() => {
          navigate(`/post/${newPost.slug}`);
        }, 1000); // Delay navigation slightly to show the message
      }
    } catch (error) {
      showError("Failed to publish post. Please try again.");
    } finally {
      usePostsStore.setState({ loadingPost: false });
    }
  };

  const saveDraft = () => {
    const htmlContent = convertToHTML();
    const draft = {
      title,
      content: htmlContent,
      rawContent: content,
      selectedFile: selectedFile ? previewUrl : null,
      categories: selectedCategories,
      tags,
      status: "draft",
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem("blogDraft", JSON.stringify(draft));
    showSuccess("Draft saved successfully!", "draft");
  };

  const loadDraft = React.useCallback(() => {
    const savedDraft = localStorage.getItem("blogDraft");
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        setTitle(draft.title || "");
        setContent(draft.rawContent || "");
        setFormattedContent(draft.content || "");
        setSelectedCategories(draft.categories || []);
        setTags(draft.tags || []);
        if (draft.selectedFile) {
          setPreviewUrl(draft.selectedFile);
        }
        setValidationErrors({ categories: false, tags: false });
        showError("Draft loaded successfully");
        return true;
      } catch (error) {
        showError("Error loading draft");
        return false;
      }
    } else {
      showError("No draft found");
      return false;
    }
  }, []);

  useEffect(() => {
    const checkForDraft = () => localStorage.getItem("blogDraft") !== null;
    if (checkForDraft() && title === "" && content === "") {
      loadDraft();
    }
  }, [title, content, loadDraft]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

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
          <h1>Create New Article</h1>
          <p>Share your knowledge, ideas, and stories with our community</p>
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
                    <span>Set Post Image</span>
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
                placeholder="Title of your article"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </motion.div>
          </motion.div>

          <motion.div
            className={`form-group category-section ${validationErrors.categories ? "validation-error" : ""
              }`}
            variants={sectionVariants}
          >
            <div className="category-label">
              <FaTags size={16} />
              <span>Select categories:</span>
              <span className="required-indicator">*</span>
            </div>
            <motion.div
              className="category-options"
              variants={containerVariants}
            >
              {categories.map((category, index) => (
                <motion.button
                  type="button"
                  key={index}
                  className={`category-tag ${selectedCategories.includes(category) ? "active" : ""
                    }`}
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
              <p className="validation-message">
                Please select at least one category
              </p>
            )}
          </motion.div>

          <motion.div
            className={`form-group tags-section ${validationErrors.tags ? "validation-error" : ""
              }`}
            variants={sectionVariants}
          >
            <div className="tags-label">
              <FaTags size={16} />
              <span>Add tag(s):</span>
              <span className="required-indicator">*</span>
            </div>
            <div className="tags-container">
              <motion.div className="tags-list" variants={containerVariants}>
                {tags.map((tag, index) => (
                  <motion.div
                    key={index}
                    className="tag-item"
                    variants={sectionVariants}
                  >
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
            <p className="tags-hint">
              Press Enter or click the plus icon to add a tag
            </p>
            {validationErrors.tags && (
              <p className="validation-message">Please add at least one tag</p>
            )}
          </motion.div>

          <motion.div className="form-group" variants={sectionVariants}>
            <div className="editor-toolbar">
              <motion.div
                className="editor-actions"
                variants={containerVariants}
              >
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
              <div className="editor-view-controls">
                <motion.button
                  type="button"
                  className="preview-toggle-btn"
                  onClick={loadSampleContent}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Load Sample
                </motion.button>
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
              Press # or click the H icon for Header, the quote icon for quotes
              and the list icon for listing
            </p>
          </motion.div>

          <motion.div className="form-actions" variants={containerVariants}>
            <motion.button
              type="button"
              className="save-draft-btn"
              onClick={saveDraft}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={loadingPost}
            >
              Save as Draft
            </motion.button>
            <motion.button
              type="submit"
              className="publish-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={loadingPost}
            >
              {loadingPost ? "Publishing..." : "Publish Article"}
            </motion.button>
          </motion.div>
        </motion.form>
      </div>

      {errorMessage && <div className="error-toast">{errorMessage}</div>}
      {draftSaved && (
        <div className="success-toast">Draft saved successfully!</div>
      )}
      {publishSuccess && (
        <div className="success-toast">Post published successfully!</div>
      )}
    </motion.div>
  );
}