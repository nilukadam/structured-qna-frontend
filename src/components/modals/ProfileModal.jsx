// FILE: src/components/modals/ProfileModal.jsx
// Production-ready ProfileModal
// - View / Edit modes
// - Upload avatar (FileReader => dataURL)
// - Uses useOnClickOutside to close on outside clicks
// - Esc closes modal, body scroll is locked while open
// - Restores focus to previous element on close
// - Adds PropTypes + defaultProps
import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import useOnClickOutside from "../../hooks/useOnClickOutside";
import "../../styles/ProfileModal.css";
import { toast } from "react-hot-toast";

/* Inline default avatar (small, no network) */
const defaultAvatar =
  "data:image/svg+xml;base64,PHN2ZyBmaWxsPSJub25lIiBoZWlnaHQ9IjMyIiBzdHJva2U9IiM3YTc3NzciIHN0cm9rZS13aWR0aD0iMS41IiB2aWV3Qm94PSIwIDAgMjQgMjQiIHdpZHRoPSIzMiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjgiIHI9IjMiLz48cGF0aCBkPSJNNC4xOCAxOS4yMkE4IDggMCAwIDEgMTIgMTZhOCA4IDAgMCAxIDcuODIgMy4yMiIvPjwvc3ZnPg==";

export default function ProfileModal({
  isOpen,
  editMode = false,
  onClose,
  onSave,
  initialProfile = {},
}) {
  const modalRef = useRef(null);
  const fileInputRef = useRef(null);
  const prevActiveEl = useRef(null);

  useOnClickOutside(modalRef, () => {
    if (isOpen) onClose?.();
  });

  const [mode, setMode] = useState(editMode ? "edit" : "view");
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    bio: "",
    location: "",
    avatar: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // hydrate on open and when inputs change
  useEffect(() => {
    if (!isOpen) return;
    prevActiveEl.current = document.activeElement;
    // lock scroll
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    setMode(editMode ? "edit" : "view");
    setError("");
    setSaving(false);
    setProfile({
      name: initialProfile.name || "",
      email: initialProfile.email || "",
      bio: initialProfile.bio || "",
      location: initialProfile.location || "",
      avatar: initialProfile.avatar || "",
    });

    // cleanup on close: restore scroll & focus
    return () => {
      document.body.style.overflow = prevOverflow || "";
      try {
        prevActiveEl.current?.focus?.();
      } catch (err){
        void err  //ignore safely
      }
    };
  }, [isOpen, editMode, initialProfile]);

  // close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSave = async (e) => {
    e?.preventDefault?.();
    setError("");
    if (!profile.name.trim()) {
      setError("Please enter your name.");
      toast.error("Please enter your name.");
      return;
    }

    setSaving(true);
    try {
      // send minimal payload upwards
      await onSave?.({
        name: profile.name.trim(),
        bio: profile.bio.trim(),
        location: profile.location.trim(),
        avatar: profile.avatar || "",
      });
      setSaving(false);
      setMode("view");
      toast.success("Profile updated");
      onClose?.();
    } catch (err) {
      setError(err?.message || "Failed to save profile.");
      toast.error(err?.message || "Failed to save profile.");
      setSaving(false);
    }
  };

  // Read file -> dataUrl (single read, safe)
  const handleFileChange = (e) => {
    setError("");
    const file = e.target.files?.[0];
    if (!file) return;
    const maxMB = 4;
    if (file.size > maxMB * 1024 * 1024) {
      setError(`Image too large - max ${maxMB} MB`);
      toast.error(`Image too large - max ${maxMB} MB`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const reader = new FileReader();
    let handled = false;
    reader.onload = (ev) => {
      if (handled) return;
      handled = true;
      setProfile((p) => ({ ...p, avatar: ev.target.result }));
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.onerror = () => {
      toast.error("Failed to read image file.");
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsDataURL(file);
  };

  const removeAvatar = () => {
    setProfile((p) => ({ ...p, avatar: "" }));
    try {
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      void err // ignore safely
    }
  };

  const show = (val) => (val && String(val).trim() !== "" ? val : "NA");

  return (
    <div className="pm-overlay" role="dialog" aria-modal="true" aria-labelledby="pm-title">
      <div className="pm-modal" ref={modalRef}>
        <header className="pm-header">
          <h3 id="pm-title">{mode === "view" ? "My Profile" : "Edit Profile"}</h3>
          <button
            className="pm-close"
            onClick={() => onClose?.()}
            type="button"
            aria-label="Close profile dialog"
          >
            ✕
          </button>
        </header>

        {mode === "view" ? (
          <div className="pm-body pm-view" aria-live="polite">
            <div className="pm-avatar-preview-large" aria-hidden>
              <img
                src={profile.avatar || defaultAvatar}
                alt={profile.name ? `${profile.name} avatar` : "Default avatar"}
                style={{ objectFit: "cover" }}
              />
            </div>

            <div className="pm-view-info">
              <p>
                <strong>Name:</strong> {show(profile.name)}
              </p>
              <p>
                <strong>Email:</strong> {show(profile.email)}
              </p>
              {profile.location !== undefined && (
                <p>
                  <strong>Location:</strong> {show(profile.location)}
                </p>
              )}
              {profile.bio !== undefined && (
                <p>
                  <strong>Bio:</strong> {show(profile.bio)}
                </p>
              )}

              <div className="pm-footer" style={{ marginTop: 12 }}>
                <button
                  className="pm-btn pm-btn-primary"
                  onClick={() => setMode("edit")}
                  type="button"
                >
                  Edit Profile
                </button>

                <button
                  className="pm-btn pm-btn-secondary"
                  onClick={() => window.dispatchEvent(new CustomEvent("qc:logout"))}
                  type="button"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        ) : (
          <form className="pm-body pm-edit" onSubmit={handleSave}>
            <div className="pm-row">
              <div className="pm-avatar-col" aria-hidden>
                <div className="pm-avatar-preview">
                  <img
                    src={profile.avatar || defaultAvatar}
                    alt="Avatar preview"
                    style={{ objectFit: "cover" }}
                  />
                </div>

                <label className="pm-upload-btn" htmlFor="avatar-input">
                  Upload
                </label>
                <input
                  ref={fileInputRef}
                  id="avatar-input"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />

                {profile.avatar && (
                  <button
                    type="button"
                    className="pm-upload-btn"
                    onClick={removeAvatar}
                    aria-label="Remove avatar"
                    style={{ marginTop: 6 }}
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="pm-fields-col">
                <label className="pm-label">
                  Name
                  <input
                    autoFocus
                    type="text"
                    className="pm-input"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    aria-label="Full name"
                  />
                </label>

                <label className="pm-label">
                  Email (read-only)
                  <input
                    type="email"
                    className="pm-input"
                    value={profile.email}
                    readOnly
                    disabled
                    title="Email is set during registration/login"
                    aria-label="Email address (read-only)"
                  />
                </label>

                <label className="pm-label">
                  Location
                  <input
                    type="text"
                    className="pm-input"
                    value={profile.location}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    aria-label="Location"
                  />
                </label>

                <label className="pm-label">
                  Bio
                  <textarea
                    className="pm-textarea"
                    rows={3}
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    aria-label="Short bio"
                  />
                </label>

                {error && <div className="pm-error" role="alert">{error}</div>}

                <div className="pm-footer" style={{ marginTop: 8 }}>
                  <button
                    type="button"
                    className="pm-btn pm-btn-secondary"
                    onClick={() => setMode("view")}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="pm-btn pm-btn-primary"
                    disabled={saving}
                    aria-disabled={saving}
                  >
                    {saving ? "Saving..." : "Save Profile"}
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

ProfileModal.propTypes = {
  isOpen: PropTypes.bool,
  editMode: PropTypes.bool,
  onClose: PropTypes.func,
  onSave: PropTypes.func,
  initialProfile: PropTypes.object,
};

ProfileModal.defaultProps = {
  isOpen: false,
  editMode: false,
  onClose: () => {},
  onSave: () => {},
  initialProfile: {},
};
 