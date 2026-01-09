// FILE: src/components/modals/AuthRequiredPopup.jsx
// --------------------------------------------------
// AuthRequiredPopup
// Lightweight modal that appears when a user tries to
// access a feature requiring authentication.
//
// Props:
// - show: boolean → controls visibility
// - onClose: () => void
// - onOpenLogin: () => void → triggers LoginModal
//
// Notes:
// - No hooks (safe + fast)
// - Uses global modal styling from AuthRequiredPopup.css
// - Accessible: ARIA roles applied
// --------------------------------------------------

import React from "react";
import "../../styles/AuthRequiredPopup.css";

export default function AuthRequiredPopup({ show, onClose, onOpenLogin }) {
  if (!show) return null; // clean conditional render

  return (
    <div
      className="auth-popup-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-popup-title"
    >
      <div className="auth-popup-card">
        <h5 id="auth-popup-title" className="mb-2">
          Login Required
        </h5>

        <p className="text-muted mb-3">
          You need to log in to use this feature.
        </p>

        {/* Action buttons */}
        <div className="auth-popup-actions">
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>

          <button
            className="btn btn-primary btn-sm"
            onClick={onOpenLogin}
            type="button"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
}
