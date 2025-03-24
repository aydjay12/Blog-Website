import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import "./searchbar.css";

export default function SearchBar({ className, placeholder }) {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };
  
  return (
    <form className={`search-bar ${className || ""}`} onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder={placeholder || "Search..."}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="search-bar-input"
      />
      <button type="submit" className="search-bar-button" aria-label="Search">
        <FaSearch />
      </button>
    </form>
  );
}