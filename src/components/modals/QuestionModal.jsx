// FILE: src/components/modals/QuestionModal.jsx
import React, { useEffect, useRef, useState } from "react";
import "../../styles/QuestionModal.css";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "react-hot-toast";

/**
 * QuestionModal (production-ready)
 *
 * Props:
 * - isOpen: boolean
 * - onClose: () => void
 * - onSubmit: (payload) => Promise|void   // payload: { type: 'question'|'post', title?, content, font, image }
 * - initialDraft?: { type?, title?, content?, details?, font?, image? }
 *
 * Behavior:
 * - If initialDraft is provided when opening, fields are prefilled and the tab is selected accordingly.
 * - Image is read as data URL (base64) and returned in payload.image.
 * - Prevents background scroll while open. Closes on Escape.
 */

const FONT_OPTIONS = [
  { id: "system", label: "System", css: "inherit" },
  { id: "serif", label: "Serif", css: "serif" },
  { id: "sans", label: "Sans-serif", css: "Arial, Helvetica, sans-serif" },
  { id: "mono", label: "Monospace", css: "monospace" },
  { id: "cursive", label: "Cursive", css: "cursive" },
];
 
export default function QuestionModal({ isOpen, onClose, onSubmit, initialDraft }) {
  const { isAuthenticated } = useAuth();

  // Tab: 'ask' or 'post'
  const [tab, setTab] = useState("ask");

  // Ask fields
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");

  // Post fields
  const [postContent, setPostContent] = useState("");

  // Shared
  const [font, setFont] = useState(FONT_OPTIONS[0].css);
  const [imageDataUrl, setImageDataUrl] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const firstRef = useRef(null);
  const fileInputRef = useRef(null);

  // Focus first input when modal opens; handle initialDraft, tab selection
  useEffect(() => {
    if (!isOpen) {
      // Reset when closed
      setTab("ask");
      setTitle("");
      setDetails("");
      setPostContent("");
      setFont(FONT_OPTIONS[0].css);
      setImageDataUrl(null);
      setError("");
      setSubmitting(false);
      return;
    }

    // When opening
    // Prevent background scrolling
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // focus first input shortly after open for smoothness
    setTimeout(() => firstRef.current?.focus?.(), 80);

    // Prefill from initialDraft (if provided)
    if (initialDraft) {
      const draftType = initialDraft.type === "post" ? "post" : "ask";
      setTab(draftType);
      if (initialDraft.title) setTitle(String(initialDraft.title));
      if (initialDraft.details) setDetails(String(initialDraft.details));
      if (initialDraft.content) setPostContent(String(initialDraft.content));
      if (initialDraft.font) setFont(initialDraft.font);
      if (initialDraft.image) setImageDataUrl(initialDraft.image);
    }

    // Cleanup: restore scroll when modal closes/unmounts
    return () => {
      document.body.style.overflow = prevOverflow || "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]); // intentionally not including initialDraft to avoid overwriting user edits mid-open

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // File handling
  const handleFile = (file) => {
    if (!file) return;
    const maxMB = 4;
    if (file.size > maxMB * 1024 * 1024) {
      setError(`Image too large — max ${maxMB} MB.`);
      toast.error(`Image too large — max ${maxMB} MB.`);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => setImageDataUrl(e.target.result);
    reader.onerror = () => {
      setError(" Failed to read image file.");
      toast.error(" Failed to read image file.");
    }
    reader.readAsDataURL(file);
  };

  const onChooseFile = (e) => {
    setError("");
    const f = e.target.files?.[0];
    handleFile(f);
    // Reset input value so same file can be chosen again later
    e.target.value = "";
  };

  const removeImage = () => {
    setImageDataUrl(null);
    // reset file input as well
    try {
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch {
      // ignore
    }
  };

  // Validation & payload build
  const validateAndBuild = () => {
    const payload = { font: font || FONT_OPTIONS[0].css, image: imageDataUrl || null };
    if (tab === "ask") {
      if (!title.trim()) {
        setError("Please enter a question title.");
        toast.error("Please enter a question title")
        return null;
      }
      payload.type = "question";
      payload.title = title.trim();
      payload.content = details.trim() || "";
    } else {
      // post
      if (!postContent.trim() && !imageDataUrl) {
        setError("Please write something or add an image.");
        toast.error("Please write something or add an image.");
        return null;
      }
      payload.type = "post";
      payload.content = postContent.trim();
    }
    return payload;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    setError("");

    if (!isAuthenticated) {
      setError("You must be logged in to post. Please login first.");
      toast("Please login to continue.")
      return;
    }

    const payload = validateAndBuild();
    if (!payload) return;

    setSubmitting(true);
    try {
      await onSubmit?.(payload);
      // success -> close modal
      onClose?.();
    } catch (err) {
      setError(err?.message || "Failed to submit. Try again.");
      toast.error(err?.message || "Failed to submit.");
    } finally {
      setSubmitting(false);
    }
  };

  const triggerFileInput = () => fileInputRef.current?.click?.();

  return (
    <div className="qm-backdrop" role="dialog" aria-modal="true" aria-labelledby="qm-title">
      <form className="qm-card" onSubmit={handleSubmit} role="document">
        <button className="qm-close" type="button" onClick={onClose} aria-label="Close">
          ×
        </button>

        <div className="qm-tabs" role="tablist" aria-label="Choose type">
          <button
            type="button"
            role="tab"
            aria-selected={tab === "ask"}
            className={`qm-tab ${tab === "ask" ? "active" : ""}`}
            onClick={() => setTab("ask")}
          >
            Ask Question
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={tab === "post"}
            className={`qm-tab ${tab === "post" ? "active" : ""}`}
            onClick={() => setTab("post")}
          >
            Create Post
          </button>
        </div>

        <div className="qm-body">
          {error && (
            <div className="qm-error" role="alert" aria-live="assertive">
              {error}
            </div>
          )}

          {tab === "ask" ? (
            <>
              <label className="qm-label">
                Title
                <input
                  ref={firstRef}
                  className="qm-input"
                  type="text"
                  placeholder="e.g. How does X work?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  aria-label="Question title"
                />
              </label>

              <label className="qm-label">
                Details (optional)
                <textarea
                  className="qm-textarea"
                  rows={5}
                  placeholder="Add more context, what you tried, links..."
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  style={{ fontFamily: font }}
                  aria-label="Question details"
                />
              </label>
            </>
          ) : (
            <>
              <label className="qm-label">
                Post content
                <textarea
                  ref={firstRef}
                  className="qm-textarea"
                  rows={6}
                  placeholder="Share something with the community..."
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  style={{ fontFamily: font }}
                  aria-label="Post content"
                />
              </label>
            </>
          )}

          {/* Font + Image toolbar */}
          <div className="qm-toolbar">
            <div className="qm-fonts" aria-hidden>
              <label className="qm-font-label">Font</label>
              <select
                value={FONT_OPTIONS.find((f) => f.css === font)?.id || "system"}
                onChange={(e) => {
                  const selected = FONT_OPTIONS.find((f) => f.id === e.target.value);
                  setFont(selected?.css || FONT_OPTIONS[0].css);
                }}
                aria-label="Select font style"
              >
                {FONT_OPTIONS.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="qm-image-controls">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={onChooseFile}
                style={{ display: "none" }}
                aria-hidden="true"
              />

              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={triggerFileInput}
                aria-label="Add image"
              >
                Add image
              </button>

              {imageDataUrl && (
                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm ms-2"
                  onClick={removeImage}
                  aria-label="Remove image"
                >
                  Remove image
                </button>
              )}
            </div>
          </div>

          {/* Image preview */}
          {imageDataUrl && (
            <div className="qm-image-preview" aria-live="polite">
              <img src={imageDataUrl} alt="Preview" />
            </div>
          )}

          {/* Live preview (applies font style) */}
          <div className="qm-preview" aria-hidden>
            <strong style={{ fontFamily: font }}>
              {tab === "ask" ? (title || "Question preview") : "Post preview"}
            </strong>
            <div style={{ fontFamily: font, marginTop: 6 }}>
              {tab === "ask" ? (details || "Details preview") : (postContent || "Write something...")}
            </div>
          </div>
        </div>

        <div className="qm-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
            aria-disabled={submitting}
          >
            {submitting ? "Submitting…" : tab === "ask" ? "Publish question" : "Publish post"}
          </button>
        </div>
      </form>
    </div>
  );
}
 