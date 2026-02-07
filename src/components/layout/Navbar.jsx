// FILE: src/components/layout/Navbar.jsx
import React, { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaUserFriends,
  FaPen,
  FaLayerGroup,
  FaBell,
  FaPlus,
  FaSearch, 
  FaMoon,
  FaSun,
} from "react-icons/fa";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";

import "../../styles/Navbar.css";
import { trendingTopics } from "../../data/trendingTopics";

import { useFeed } from "../../hooks/useFeed";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";

/**
 * Navbar
 *
 * Props:
 * - onAddQuestionClick
 * - onProfileClick
 * - onCreateSpace
 * - onLoginClick
 *
 * Notes:
 * - Uses data-bs-theme via ThemeContext; theme toggle calls toggleTheme()
 * - Notification badge shows unread notifications count
 * - Accessible keyboard interactions for menus and suggestion list
 */

export default function Navbar({
  onAddQuestionClick,
  onProfileClick,
  // onCreateSpace,------ commented for temprary 
  onLoginClick,
}) {
  const navigate = useNavigate();

  // Contexts 
  const { isAuthenticated, user, logout } = useAuth();
  const { notifications } = useFeed();
  const { theme, toggleTheme } = useTheme();

  // ---------- Avatar placeholders ----------
  // Small inline SVG fallback used when no avatar is provided
  const placeholderSvg = encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 24 24' fill='none'>
       <rect rx='12' width='24' height='24' fill='%23e9ecef'/>
       <path d='M12 12a3 3 0 100-6 3 3 0 000 6zm0 2c-3 0-6 1.5-6 3v1h12v-1c0-1.5-3-3-6-3z' fill='%23999'/>
     </svg>`
    );
    const placeholderDataUri = `data:image/svg+xml;charset=UTF-8,${placeholderSvg}`;


  // Always use placeholder if user has no avatar
  const avatarSrc = user?.avatar || placeholderDataUri;

  // ---------- Unread notifications count (fixed calculation) ----------
  const unreadCount = (notifications || []).filter(
    (n) => n.unread === true).length;

  // ---------- Search state ----------
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Profile dropdown state
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const profileRef = useRef(null);
  const searchInputRef = useRef(null);

  // Filtered suggestions computed on render
  const filteredSuggestions = (searchQuery || "").trim()
    ? trendingTopics.filter((topic) =>
        topic.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // ---------- Handlers ----------
  const handleSearch = () => {
    const q = searchQuery.trim();
    if (!q) return;
    navigate(`/answers?q=${encodeURIComponent(q)}`);
    setSearchQuery("");
    setShowSuggestions(false);
    searchInputRef.current?.blur();
  };

  const handleSuggestionClick = (topic) => {
    setSearchQuery(topic);
    setShowSuggestions(false);
    searchInputRef.current?.focus();
    navigate(`/answers?q=${encodeURIComponent(topic)}`);
  };

  // Open login (via prop or legacy event)
  const openLogin = () => {
    if (typeof onLoginClick === "function") onLoginClick();
    else window.dispatchEvent(new CustomEvent("qc:openLogin"));
  };

  // Open profile (via prop or legacy event)
  const openProfile = (opts) => {
    if (typeof onProfileClick === "function") onProfileClick(opts);
    else window.dispatchEvent(new CustomEvent("qc:openProfile", { detail: opts || {} }));
  };

  const openEditProfile = () => openProfile({ edit: true });

  // ---------- Close dropdowns on outside click or ESC ----------
  useEffect(() => {
    const handleDocClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileDropdown(false);
      }
    };
    const handleKey = (e) => {
      if (e.key === "Escape" || e.key === "Esc") {
        setShowProfileDropdown(false);
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleDocClick);
    document.addEventListener("touchstart", handleDocClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleDocClick);
      document.removeEventListener("touchstart", handleDocClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  // ---------- Render ----------
  return (
    <nav className="qc-navbar fixed-top bg-body shadow-sm" role="navigation" aria-label="Main navigation">
      <div className="container-fluid d-flex align-items-center justify-content-between px-3">
        {/* Logo */}
        <button
          className="navbar-brand btn-reset qc-logo"
          onClick={() => navigate("/")}
          aria-label="Go to home"
        >
          Quora
        </button>

        {/* Center: links + search + add question */}
        <div className="qc-center d-flex align-items-center gap-3">
          {/* Links */}
          <div className="qc-links d-flex gap-2" role="menubar" aria-label="Main menu">
            <NavLink
              to="/"
              className={({ isActive }) => (isActive ? "qc-link active" : "qc-link")}
              data-tooltip-id="navbar-tooltip"
              data-tooltip-content="Home"
              aria-label="Home"
            >
              <FaHome />
            </NavLink>

            <NavLink
              to="/following"
              className={({ isActive }) => (isActive ? "qc-link active" : "qc-link")}
              data-tooltip-id="navbar-tooltip"
              data-tooltip-content="Following"
              aria-label="Following"
            >
              <FaUserFriends />
            </NavLink>

            <NavLink
              to="/answers"
              className={({ isActive }) => (isActive ? "qc-link active" : "qc-link")}
              data-tooltip-id="navbar-tooltip"
              data-tooltip-content="Answers"
              aria-label="Answers"
            >
              <FaPen />
            </NavLink>

            <NavLink
              to="/spaces"
              className={({ isActive }) => (isActive ? "qc-link active" : "qc-link")}
              data-tooltip-id="navbar-tooltip"
              data-tooltip-content="Spaces"
              aria-label="Spaces"
            >
              <FaLayerGroup />
            </NavLink>

            <NavLink
              to="/notifications"
              className={({ isActive }) => (isActive ? "qc-link active" : "qc-link")}
              data-tooltip-id="navbar-tooltip"
              data-tooltip-content="Notifications"
              aria-label="Notifications"
            >
              <FaBell />
              {unreadCount > 0 && (
                <span className="qc-badge" aria-label={`${unreadCount} unread`}>
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </NavLink>
          </div>

          {/* Search */}
          <div className="qc-search-wrapper position-relative" aria-haspopup="listbox">
            <FaSearch className="qc-search-icon" aria-hidden="true" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search topics, questions..."
              className="qc-search"
              value={searchQuery}
              aria-label="Search"
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 120)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />

            {showSuggestions && filteredSuggestions.length > 0 && (
              <div className="qc-suggestions" role="listbox" aria-label="Search suggestions">
                {filteredSuggestions.map((topic, i) => (
                  <div
                    key={i}
                    role="option"
                    tabIndex={0}
                    className="qc-suggestion-item"
                    onMouseDown={() => handleSuggestionClick(topic)}
                    onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleSuggestionClick(topic)}
                  >
                    {topic}
                  </div>
                ))}
              </div>
            )}

            {searchQuery.trim() !== "" && (
              <button type="button" className="qc-search-btn" onClick={handleSearch} aria-label="Search button">
                Search
              </button>
            )}
          </div>

          {/* Add Question */}
          <button
            className="qc-add-btn btn btn-outline-danger"
            onClick={() => {
              if (!isAuthenticated) {
                openLogin();
                return;
              }
              onAddQuestionClick();
            }}
            aria-label="Add question"
            title="Ask a question"
          >
            <FaPlus className="me-1" /> <span>Add Question</span>
          </button>
        </div>

        {/* Right: theme toggle + profile + auth */}
        <div className="qc-right d-flex align-items-center gap-2">
          {/* Theme toggle */}
          <button
            className="btn btn-outline-secondary px-2 py-1"
            type="button"
            onClick={() => toggleTheme()}
            aria-label={theme === "light" ? "Switch to dark theme" : "Switch to light theme"}
            title={theme === "light" ? "Switch to dark theme" : "Switch to light theme"}
          >
            {theme === "light" ? <FaMoon /> : <FaSun />}
          </button>

          {/* Profile avatar & dropdown */}
          <div className="qc-profile-wrapper position-relative" ref={profileRef}>
            <button
              className="qc-profile-btn btn-reset"
              aria-haspopup="true"
              aria-expanded={showProfileDropdown}
              aria-label={isAuthenticated ? "Open profile menu" : "Open login menu"}
              onClick={() => setShowProfileDropdown((p) => !p)}
            >
              <img
                src={avatarSrc}
                alt={isAuthenticated ? user?.name || "Profile" : "Login"}
                className="rounded-circle qc-profile"
                width={36}
                height={36}
                style={{ objectFit: "cover" }}
                 onError={(e) => {
                  e.currentTarget.src = placeholderDataUri;
               }}
              />

            </button>

            {showProfileDropdown && (
              <div className="qc-profile-dropdown" role="menu" aria-label="Profile menu">
                {isAuthenticated ? (
                  <>
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        setShowProfileDropdown(false);
                        openProfile();
                      }}
                      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (setShowProfileDropdown(false), openProfile())}
                    >
                      My Profile
                   </div>

                    <div
                      role="menuitem"
                      tabIndex={0}
                      onClick={() => {
                        setShowProfileDropdown(false);
                        openEditProfile();
                      }}
                      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (setShowProfileDropdown(false), openEditProfile())}
                    >
                      Edit Profile
                    </div>

                    <div
                      role="menuitem"
                      tabIndex={0}
                      onClick={() => {
                        setShowProfileDropdown(false);
                        logout();
                      }}
                      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (setShowProfileDropdown(false), logout())}
                    >
                      Logout
                    </div>
                  </>
                ) : (
                  <div
                    role="menuitem"
                    tabIndex={0}
                    onClick={() => {
                      setShowProfileDropdown(false);
                      openLogin();
                    }}
                    onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (setShowProfileDropdown(false), openLogin())}
                  >
                    Login / Register
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Explicit auth button */}
          <button
            className="btn btn-outline-primary px-3 py-1"
            onClick={isAuthenticated ? logout : openLogin}
            aria-label={isAuthenticated ? "Logout" : "Login"}
          >
            {isAuthenticated ? "Logout" : "Login"}
          </button>
        </div>

        <Tooltip id="navbar-tooltip" place="bottom" />
      </div>
    </nav>
  );
}
