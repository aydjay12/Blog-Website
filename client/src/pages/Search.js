import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "../styles/Search.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { usePostsStore } from "../store/usePostsStore";
import BlogPost from "../components/blogpost/Blogpost";
import Loading from "../components/loading/Loading";

// Utility functions
const stripHtml = (html, maxLength = 150) => {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;
  const text = tempDiv.textContent || tempDiv.innerText || "";
  return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now - date;
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  if (diffInDays === 0) return "Today";
  if (diffInDays === 1) return "1 day ago";
  if (diffInDays < 7) return `${diffInDays} days ago`;
  const diffInWeeks = Math.floor(diffInDays / 7);
  return diffInWeeks === 1 ? "1 week ago" : `${diffInWeeks} weeks ago`;
};

// Animation variants
const animations = {
  container: { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } },
  item: { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } },
};

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [tags, setTags] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [filteredTags, setFilteredTags] = useState([]);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterSearchActive, setIsFilterSearchActive] = useState(false);
  const searchResultsRef = useRef(null);
  const postsPerPage = 9;

  const [searchParams, setSearchParams] = useState({
    text: "",
    usingCategories: false,
    usingTags: false,
  });

  const { posts, loadingPost, error, fetchPosts } = usePostsStore();
  const location = useLocation();
  const navigate = useNavigate();

  const categoryOptions = useMemo(() => ["All", "Technology", "Travel", "Lifestyle", "Health", "Business", "Creativity"], []);
  const availableTags = useMemo(() => [...new Set(posts.flatMap((post) => post.tags || []))], [posts]);
  const sortedAvailableTags = useMemo(() => [...availableTags].sort((a, b) => a.localeCompare(b)), [availableTags]);

  // Scroll functions
  const scrollToResults = () => {
    if (searchResultsRef.current) {
      const elementPosition = searchResultsRef.current.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - 6 * 16; // 6rem offset
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  };

  const scrollToAdvancedFilterResults = () => {
    if (searchResultsRef.current) {
      // Get the height of the filters section dynamically
      const filtersHeight = document.querySelector('.advanced-filter-content')?.offsetHeight || 0;
      const elementPosition = searchResultsRef.current.getBoundingClientRect().top + window.pageYOffset;
      // Add a small buffer (2rem converted to px using current font size)
      const fontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
      const buffer = 5 * fontSize;
      const offsetPosition = elementPosition - (filtersHeight + buffer);
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  };

  // Effects
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) setRecentSearches(JSON.parse(saved));
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const queryFromUrl = searchParams.get("query");
    if (queryFromUrl) {
      const decoded = decodeURIComponent(queryFromUrl);
      setQuery(decoded);
      search(decoded, false, true);
      setTimeout(() => scrollToResults(), 100);
      setTimeout(() => scrollToAdvancedFilterResults(), 100);
    }
  }, [location.search, posts]);

  useEffect(() => {
    if (results.length > 0 && searchResultsRef.current && hasSearched) {
      if (isFilterSearchActive) {
        scrollToAdvancedFilterResults();
      } else {
        scrollToResults();
      }
    }
  }, [results, hasSearched, isFilterSearchActive]);

  useEffect(() => {
    if (showTagDropdown) {
      setFilteredTags(
        tagInput.trim()
          ? sortedAvailableTags.filter(tag => tag.toLowerCase().includes(tagInput.toLowerCase()) && !tags.includes(tag))
          : sortedAvailableTags.filter(tag => !tags.includes(tag))
      );
    }
  }, [tagInput, sortedAvailableTags, tags, showTagDropdown]);

  useEffect(() => {
    window.scrollTo({ top: 460, behavior: "smooth" });
  }, [currentPage]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const tagContainer = document.querySelector(".tag-input-container");
      if (tagContainer && !tagContainer.contains(event.target)) setShowTagDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search function
  const search = (searchText = query, resetFilters = false, skipRecentUpdate = false, isFilterSearch = false) => {
    setIsFilterSearchActive(isFilterSearch);
    setCurrentPage(1);
    setHasSearched(true);
  
    const searchQuery = isFilterSearch ? "" : searchText;
    setSearchParams({
      text: searchQuery,
      usingCategories: !categories.includes("All") || categories.length > 1,
      usingTags: tags.length > 0,
    });
  
    const filteredResults = posts.filter(post => {
      const queryLower = searchText.toLowerCase();
      const matchesQuery = post.title?.toLowerCase().includes(queryLower) ||
        stripHtml(post.content || "").toLowerCase().includes(queryLower) ||
        post.author?.toLowerCase().includes(queryLower) ||
        (post.tags || []).some(tag => tag.toLowerCase().includes(queryLower)) ||
        (post.categories || []).some(category => category.toLowerCase().includes(queryLower));
      const matchesCategory = categories.includes("All") || (post.categories || []).some(category => categories.includes(category));
      const matchesTags = tags.length === 0 || tags.every(tag => (post.tags || []).includes(tag));
      return matchesQuery && matchesCategory && matchesTags;
    });
  
    setResults(filteredResults);
  
    // Update recent searches only if the search text is not empty and not already in the list
    if (searchText.trim() && !recentSearches.includes(searchText)) {
      setRecentSearches(prevSearches => {
        const updated = [searchText, ...prevSearches.filter(term => term !== searchText).slice(0, 4)];
        localStorage.setItem("recentSearches", JSON.stringify(updated));
        return updated;
      });
    }
  
    navigate("/search", { replace: true });
    setQuery("");
    if (resetFilters) {
      setCategories(["All"]);
      setTags([]);
    }
  
    if (isFilterSearch) {
      scrollToAdvancedFilterResults();
    } else {
      scrollToResults();
    }
  };

  // Event handlers
  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) search();
  };

  const toggleCategory = (category) => {
    if (category === "All") {
      setCategories(["All"]);
    } else {
      let newCategories = categories.filter(c => c !== "All");
      newCategories = newCategories.includes(category)
        ? newCategories.filter(c => c !== category) || ["All"]
        : [...newCategories, category];
      setCategories(newCategories.length === 0 ? ["All"] : newCategories);
    }
  };

  const handleTagInputChange = (e) => setTagInput(e.target.value);

  const handleTagSelect = (tag) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
      setTagInput("");
      setFilteredTags(sortedAvailableTags.filter(t => !tags.includes(t) && t !== tag));
    }
  };

  const handleTagInputKeyDown = (e) => {
    if (e.key === "Enter" && e.preventDefault) {
      e.preventDefault();
      if (tagInput.trim() && filteredTags.length > 0) handleTagSelect(filteredTags[0]);
    } else if (e.key === "Backspace" && tagInput === "" && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  const removeTag = (tagToRemove) => setTags(tags.filter(tag => tag !== tagToRemove));

  const clearFilters = () => {
    setTags([]);
    setCategories(["All"]);
  };

  // Render
  return (
    <motion.div className="search-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
      <motion.div className="search-header" variants={animations.container} initial="hidden" animate="visible">
        <motion.h1 variants={animations.item}>Search Our Blog</motion.h1>
        <motion.p variants={animations.item}>Find articles, stories and resources that matter to you</motion.p>
      </motion.div>

      <div className="search-content">
        <div className="search-form-container">
          <form onSubmit={handleSubmit} className="search-form">
            <div className="search-input-wrapper">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by title, tags, categories..."
                className="search-input"
              />
              <button type="submit" className="search-btn">
                <i className="fas fa-search"></i>
              </button>
            </div>
          </form>

          <div className="advanced-filter-section">
            <div className="advanced-filter-header" onClick={() => setShowFilters(!showFilters)}>
              <span>Advanced Filters</span>
              <i className={`fas fa-chevron-${showFilters ? "up" : "down"}`}></i>
            </div>

            <AnimatePresence>
              {showFilters && (
                <motion.div className="advanced-filter-content" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}>
                  <div className="filter-section">
                    <h4 className="filter-section-category-header">Categories</h4>
                    <motion.div className="category-filter" variants={animations.container} initial="hidden" animate="visible">
                      {categoryOptions.map(category => (
                        <motion.button
                          key={category}
                          className={`category-btn ${categories.includes(category) ? "active" : ""}`}
                          onClick={() => toggleCategory(category)}
                          variants={animations.item}
                        >
                          {category}
                        </motion.button>
                      ))}
                    </motion.div>
                  </div>

                  <div className="filter-section">
                    <h4>Tags</h4>
                    <div className="tag-input-container">
                      <div className="selected-tags" onClick={() => document.querySelector(".tag-search-input").focus()}>
                        {tags.map(tag => (
                          <span key={tag} className="selected-tag">
                            #{tag}
                            <button onClick={(e) => { e.stopPropagation(); removeTag(tag); }} className="remove-tag">×</button>
                          </span>
                        ))}
                        <input
                          type="text"
                          value={tagInput}
                          onChange={handleTagInputChange}
                          onKeyDown={handleTagInputKeyDown}
                          placeholder={tags.length > 0 ? "" : "Type to search tags..."}
                          className="tag-search-input"
                          onFocus={() => { setShowTagDropdown(true); setFilteredTags(sortedAvailableTags.filter(tag => !tags.includes(tag))); }}
                        />
                      </div>
                      <AnimatePresence>
                        {showTagDropdown && (
                          <motion.div className="tag-dropdown" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                            {filteredTags.length > 0 ? filteredTags.map(tag => (
                              <div key={tag} className="tag-dropdown-item" onClick={() => handleTagSelect(tag)}>#{tag}</div>
                            )) : <div className="tag-dropdown-empty">No matching tags</div>}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {((categories.length > 0 && !categories.includes("All")) || tags.length > 0) && (
                    <div className="applied-filters">
                      <h4>Applied Filters</h4>
                      <div className="filter-tags">
                        {categories.map(category => category !== "All" && (
                          <span key={category} className="filter-tag category-filter-tag">
                            {category}
                            <button onClick={() => toggleCategory(category)} className="remove-filter">×</button>
                          </span>
                        ))}
                        {tags.map(tag => (
                          <span key={tag} className="filter-tag tag-filter-tag">
                            #{tag}
                            <button onClick={() => removeTag(tag)} className="remove-filter">×</button>
                          </span>
                        ))}
                        <button className="clear-filters-btn" onClick={clearFilters}>Clear All Filters</button>
                      </div>
                    </div>
                  )}

                  <div className="filter-actions">
                    <button className="apply-filters-btn" onClick={() => { setHasSearched(true); setShowFilters(false); search(query, true, false, true); }}>
                      Apply Filters
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {recentSearches.length > 0 && (
            <div className="recent-searches">
              <h3>Recent Searches</h3>
              <motion.div className="recent-search-tags" variants={animations.container} initial="hidden" animate="visible">
                {recentSearches.map((term, index) => (
                  <motion.button key={index} className="recent-search-tag" onClick={() => search(term)} variants={animations.item}>
                    {term}
                  </motion.button>
                ))}
                <motion.button className="clear-searches-btn" onClick={() => { setRecentSearches([]); localStorage.removeItem("recentSearches"); }} variants={animations.item}>
                  Clear All
                </motion.button>
              </motion.div>
            </div>
          )}
        </div>

        <div className="search-results" ref={searchResultsRef}>
          {loadingPost ? (
            <Loading />
          ) : error ? (
            <div className="error-message"><p>Failed to load posts: {error}</p></div>
          ) : hasSearched && results.length === 0 ? (
            <div className="no-results">
              <i className="fas fa-search-minus no-results-icon"></i>
              <h2>No results found</h2>
              <p>We couldn't find any posts matching your search.</p>
              <div className="search-suggestions">
                <h3>Suggestions:</h3>
                <ul>
                  <li>Check your spelling</li>
                  <li>Try more general keywords</li>
                  <li>Try different tags or categories</li>
                  <li>Try all categories</li>
                </ul>
              </div>
            </div>
          ) : results.length > 0 ? (
            <>
              <div className="results-count">
                <p>{`Found ${results.length} result${results.length !== 1 ? "s" : ""}${searchParams.text.trim() ? ` for '${searchParams.text}'` : ""} in all posts`}</p>
              </div>
              {(() => {
                const indexOfLastPost = currentPage * postsPerPage;
                const indexOfFirstPost = indexOfLastPost - postsPerPage;
                const currentResults = results.slice(indexOfFirstPost, indexOfLastPost);
                const totalPages = Math.ceil(results.length / postsPerPage);

                return (
                  <>
                    <motion.div className="blogs-grid" variants={animations.container} initial="hidden" animate="visible" key={currentPage}>
                      {currentResults.map(post => <BlogPost post={post} key={post._id || post.id} />)}
                    </motion.div>
                    {results.length > postsPerPage && (
                      <motion.div className="pagination" variants={animations.container} initial="hidden" animate="visible">
                        {currentPage > 1 && (
                          <motion.button className="pagination-btn prev" onClick={() => setCurrentPage(prev => prev - 1)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            ← Prev
                          </motion.button>
                        )}
                        {Array.from({ length: totalPages }, (_, i) => (
                          <motion.button
                            key={i + 1}
                            className={`pagination-btn ${currentPage === i + 1 ? "active" : ""}`}
                            onClick={() => setCurrentPage(i + 1)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {i + 1}
                          </motion.button>
                        ))}
                        {currentPage < totalPages && (
                          <motion.button className="pagination-btn" onClick={() => setCurrentPage(prev => prev + 1)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
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
            <div className="search-placeholder">
              <i className="fas fa-search search-placeholder-icon"></i>
              <h2>Search for something</h2>
              <p>Enter keywords, tags, or categories to find articles</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}