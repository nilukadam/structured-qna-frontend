// FILE: src/components/layout/AskBox.jsx
import React from "react";
import PropTypes from "prop-types";
import { FaQuestionCircle, FaPlusCircle } from "react-icons/fa";
import { useAuth } from "../../hooks/useAuth";
import "../../styles/AskBox.css";

/**
 * AskBox
 *
 * - Shows avatar and quick entry to ask/post
 * - Delegates auth gating to App via provided handlers or legacy events
 *
 * Props (optional):
 *  - onAskClick?: () => void
 *  - onTryPost?: () => void
 *  - onProfileClick?: () => void
 *
 * Note: App.jsx should handle requireAuth and open modals. If handlers are not
 * provided, this component emits legacy CustomEvents (qc:openQuestion).
 */

/* inline SVG placeholder (data URI) — used as final fallback for avatars */
const placeholderSvg = encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 24 24' fill='none'>
     <rect rx='12' width='24' height='24' fill='%23e9ecef'/>
     <path d='M12 12a3 3 0 100-6 3 3 0 000 6zm0 2c-3 0-6 1.5-6 3v1h12v-1c0-1.5-3-3-6-3z' fill='%23999'/>
   </svg>`
);
const placeholderDataUri = `data:image/svg+xml;utf8,${placeholderSvg}`;

export default function AskBox({ onAskClick, onTryPost, onProfileClick } = {}) {
  const { isAuthenticated, user } = useAuth();

  // prefer injected handlers; else dispatch legacy events that App listens to
  const openQuestion = () => {
    if (typeof onAskClick === "function") return onAskClick();
    return window.dispatchEvent(new CustomEvent("qc:openQuestion"));
  };

  const tryPost = () => {
    if (typeof onTryPost === "function") return onTryPost();
    return window.dispatchEvent(new CustomEvent("qc:openQuestion"));
  };

  const openProfile = () => {
    if (typeof onProfileClick === "function") return onProfileClick();
    return window.dispatchEvent(new CustomEvent("qc:openProfile"));
  };

  // Avatar: use user avatar if provided, otherwise inline placeholder
  const avatarSrc = user?.avatar || placeholderDataUri;

  return (
    <div className="askbox card p-3 mb-3 shadow-sm" role="region" aria-label="Ask box">
      <div className="askbox-top d-flex align-items-center">
        <button
          type="button"
          className="askbox-avatar btn-reset me-3"
          onClick={openProfile}
          aria-label={isAuthenticated ? `Open profile for ${user?.name || "you"}` : "Login or register"}
          title={isAuthenticated ? user?.name || "Profile" : "Login / Register"}
        >
          <img
            src={avatarSrc}
            alt={isAuthenticated ? user?.name || "You" : "Profile"}
            className="rounded-circle"
            width={40}
            height={40}
            style={{ objectFit: "cover" }}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = placeholderDataUri;
            }}
          />
        </button>

        {/* Primary input-like button that opens question modal */}
        <button
          className="askbox-input btn btn-light text-start flex-grow-1"
          onClick={openQuestion}
          aria-label="Have a question or something to share? Open editor"
          type="button"
        >
          Have a question or something to share?
        </button>

        <div className="askbox-actions d-flex gap-2 ms-3">
          <button
            className="btn btn-outline-secondary d-flex align-items-center gap-1"
            onClick={openQuestion}
            aria-label="Ask a question"
            title="Ask a question"
            type="button"
          >
            <FaQuestionCircle aria-hidden="true" /> <span className="d-none d-sm-inline">Ask</span>
          </button>

          <button
            className="btn btn-primary d-flex align-items-center gap-1"
            onClick={tryPost}
            aria-label="Create a post"
            title="Create a post"
            type="button"
          >
            <FaPlusCircle aria-hidden="true" /> <span className="d-none d-sm-inline">Post</span>
          </button>
        </div>
      </div>

      <div className="askbox-helper small text-muted mt-2" aria-hidden="false">
        Tip: Click the input to open the editor. Search is available at the top.
      </div>
    </div>
  );
}

AskBox.propTypes = {
  onAskClick: PropTypes.func,
  onTryPost: PropTypes.func,
  onProfileClick: PropTypes.func,
};
