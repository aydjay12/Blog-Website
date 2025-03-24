import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Logo from "../assets/bloglogo.png";
import ProfilePic from "../assets/ProfilePic.svg"; // Import default profile pic
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import { FaBars, FaXmark } from "react-icons/fa6";
import { Menu } from "@mantine/core";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import "../styles/Navbar.css";
import { useAuthStore } from "../store/useAuthStore";

function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const [openLinks, setOpenLinks] = useState(false);
  const [openSearch, setOpenSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setOpenLinks(false);
    setOpenSearch(false);
  }, [location]);

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const confirmLogout = async () => {
    try {
      await logout();
      setShowLogoutDialog(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim() !== "") {
      navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      setOpenSearch(false);
    }
  };

  // Animation variants remain the same
  const navbarVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: { opacity: 1, y: 0 },
  };

  const linkVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const dropdownVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
  };

  // Logout confirmation dialog (unchanged)
  const logoutDialog = (
    <Dialog
      open={showLogoutDialog}
      onClose={() => setShowLogoutDialog(false)}
      aria-labelledby="logout-dialog-title"
      aria-describedby="logout-dialog-description"
      PaperProps={{
        style: {
          borderRadius: "10px",
          padding: "0.5rem 0",
          minWidth: "350px",
        },
      }}
    >
      <DialogTitle id="logout-dialog-title">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          Confirm Logout
        </motion.div>
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="logout-dialog-description">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            Are you sure you want to log out of your account?
          </motion.div>
        </DialogContentText>
      </DialogContent>
      <DialogActions style={{ paddingBottom: "25px", paddingRight: "24px" }}>
        <Button
          onClick={() => setShowLogoutDialog(false)}
          color="primary"
          variant="outlined"
          component={motion.button}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          sx={{
            textTransform: "none",
            borderRadius: "6px",
            fontFamily: "inherit",
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={confirmLogout}
          color="error"
          variant="contained"
          component={motion.button}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          sx={{
            textTransform: "none",
            borderRadius: "6px",
            fontFamily: "inherit",
            backgroundColor: "#f44336",
          }}
        >
          Logout
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Profile image with fallback
  const profileImage = user?.profileImage || ProfilePic;

  return (
    <motion.div
      className="navbar"
      variants={navbarVariants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.5 }}
    >
      <div className="leftSide">
        <Link to="/" className="logo-container">
          <motion.img
            className="logo"
            src={Logo}
            alt="Blog Logo"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          />
        </Link>
      </div>
      <div className="rightSide">
        <motion.div
          className="nav-links desktop-only"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={linkVariants}>
            <NavLink to="/" className={({ isActive }) => (isActive ? "active" : "")}>
              Home
            </NavLink>
          </motion.div>
          <motion.div variants={linkVariants}>
            <NavLink to="/blogs" className={({ isActive }) => (isActive ? "active" : "")}>
              Blogs
            </NavLink>
          </motion.div>
          <motion.div variants={linkVariants}>
            <NavLink to="/about" className={({ isActive }) => (isActive ? "active" : "")}>
              About
            </NavLink>
          </motion.div>
          <motion.div variants={linkVariants}>
            <NavLink to="/contact" className={({ isActive }) => (isActive ? "active" : "")}>
              Contact
            </NavLink>
          </motion.div>
        </motion.div>
        <motion.form
          onSubmit={handleSearch}
          className="search-form desktop-only"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input-nav"
          />
          <motion.button
            type="submit"
            className="search-button-nav"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <SearchIcon />
          </motion.button>
        </motion.form>
        <motion.div
          className="auth-section desktop-only"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {isAuthenticated ? (
            <>
              {user?.role === "blogger" && (
                <motion.div variants={linkVariants}>
                  <NavLink to="/write" className={({ isActive }) => (isActive ? "active" : "")}>
                    Write
                  </NavLink>
                </motion.div>
              )}
              <Menu shadow="md" width={200} position="bottom-end" offset={15}>
                <Menu.Target>
                  <motion.div
                    className="user-profile"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <img
                      className="topImg"
                      src={profileImage} // Use profileImage with fallback
                      alt="User profile"
                    />
                  </motion.div>
                </Menu.Target>
                <motion.div variants={dropdownVariants}>
                  <Menu.Dropdown className="profile-dropdown">
                    <Menu.Item component={NavLink} to="/settings">
                      Settings
                    </Menu.Item>
                    <Menu.Item component={NavLink} to="/favourites">
                      Favourites
                    </Menu.Item>
                    <Menu.Item component={NavLink} onClick={handleLogoutClick}>
                      Logout
                    </Menu.Item>
                  </Menu.Dropdown>
                </motion.div>
              </Menu>
            </>
          ) : (
            <>
              <motion.div variants={linkVariants}>
                <NavLink to="/login" className={({ isActive }) => (isActive ? "active" : "")}>
                  Login
                </NavLink>
              </motion.div>
              <motion.div variants={linkVariants} className="register-desktop-only">
                <NavLink to="/register" className={({ isActive }) => (isActive ? "active" : "")}>
                  Register
                </NavLink>
              </motion.div>
            </>
          )}
        </motion.div>

        {/* Mobile Controls */}
        <motion.div
          className="mobile-controls"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Menu
            shadow="md"
            width={200}
            opened={openSearch}
            onChange={setOpenSearch}
            position="bottom-end"
            offset={15}
          >
            <Menu.Target>
              <motion.div variants={linkVariants}>
                <Button variant="subtle" className="icon-button">
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <SearchIcon />
                  </motion.div>
                </Button>
              </motion.div>
            </Menu.Target>
            <motion.div
              variants={dropdownVariants}
              initial="hidden"
              animate={openSearch ? "visible" : "hidden"}
              transition={{ duration: 0.3 }}
            >
              <Menu.Dropdown className="search-dropdown">
                <div className="mobile-search-container">
                  <form onSubmit={handleSearch} className="mobile-search-form">
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="search-input-nav"
                      autoFocus
                    />
                    <motion.button
                      type="submit"
                      className="search-button-nav"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <SearchIcon />
                    </motion.button>
                  </form>
                </div>
              </Menu.Dropdown>
            </motion.div>
          </Menu>

          <Menu
            shadow="md"
            width={200}
            opened={openLinks}
            onChange={setOpenLinks}
            position="bottom-end"
            offset={15}
          >
            <Menu.Target>
              <motion.div variants={linkVariants}>
                <Button variant="subtle" className="menu-button">
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    {openLinks ? <FaXmark size={20} /> : <FaBars size={20} />}
                  </motion.div>
                </Button>
              </motion.div>
            </Menu.Target>
            <motion.div
              variants={dropdownVariants}
              initial="hidden"
              animate={openLinks ? "visible" : "hidden"}
              transition={{ duration: 0.3 }}
            >
              <Menu.Dropdown className="menu-dropdown">
                <Menu.Item component={NavLink} to="/">
                  Home
                </Menu.Item>
                <Menu.Item component={NavLink} to="/blogs">
                  Blogs
                </Menu.Item>
                <Menu.Item component={NavLink} to="/about">
                  About
                </Menu.Item>
                <Menu.Item component={NavLink} to="/contact">
                  Contact
                </Menu.Item>
                {isAuthenticated && user?.role === "blogger" && (
                  <Menu.Item component={NavLink} to="/write">
                    Write
                  </Menu.Item>
                )}
                {!isAuthenticated && (
                  <>
                    <Menu.Item component={NavLink} to="/login">
                      Login
                    </Menu.Item>
                    <Menu.Item component={NavLink} to="/register">
                      Register
                    </Menu.Item>
                  </>
                )}
              </Menu.Dropdown>
            </motion.div>
          </Menu>

          {isAuthenticated && (
            <Menu shadow="md" width={200} position="bottom-end" offset={15}>
              <Menu.Target>
                <motion.div
                  className="user-profile"
                  variants={linkVariants}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <img
                    className="topImg"
                    src={profileImage} // Use profileImage with fallback
                    alt="User profile"
                  />
                </motion.div>
              </Menu.Target>
              <motion.div variants={dropdownVariants}>
                <Menu.Dropdown className="profile-dropdown">
                  <Menu.Item component={NavLink} to="/settings">
                    Settings
                  </Menu.Item>
                  <Menu.Item component={NavLink} to="/favourites">
                      Favourites
                    </Menu.Item>
                  <Menu.Item component={NavLink} onClick={handleLogoutClick}>
                    Logout
                  </Menu.Item>
                </Menu.Dropdown>
              </motion.div>
            </Menu>
          )}
        </motion.div>
      </div>
      {logoutDialog}
    </motion.div>
  );
}

export default Navbar;