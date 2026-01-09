// FILE: src/components/modals/SpaceModal.jsx
// Production-ready SpaceModal (hooks order fixed)
// - Hooks are declared unconditionally at the top
// - useEffect early-returns when `isOpen` is false
// - Locks background scroll, restores focus, supports ESC, toasts, validation

import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import "../../styles/SpaceModal.css";

export default function SpaceModal({ isOpen, onClose, onCreate }) {
  // state hooks (always run)
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // refs (always run)
  const cardRef = useRef(null);
  const prevFocus = useRef(null);

  // side-effects (always declared, but will early-return if not open)
  useEffect(() => {
    if (!isOpen) return;

    prevFocus.current = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // focus modal for keyboard users
    const timer = setTimeout(() =>{
      cardRef.current?.focus?.();
    }, 60);
    
    const handleKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", handleKey);

    return () => {
      clearTimeout(timer)
      document.body.style.overflow = prevOverflow || "";
      document.removeEventListener("keydown", handleKey);
      try { 
        prevFocus.current?.focus?.();
       } catch (err) {
        void err; // safely ignore
      }
    };
  }, [isOpen, onClose]);

  // If closed, render nothing (safe because all hooks were already called above)
  if (!isOpen) return null;

  const handleCreate = (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      toast.error("Please enter a space name");
      return;
    }

    try {
      onCreate?.({ name: name.trim(), description: description.trim() });
      toast.success(`Space "${name}" created 🎉`);

      // Reset state and close
      setName("");
      setDescription("");
      setError("");
      onClose?.();
    } catch (err) {
      void err;
      toast.error("Failed to create space");
    }
  };

  return (
    <div className="sm-overlay" role="dialog" aria-modal="true">
      <div className="sm-modal" ref={cardRef} tabIndex={-1}>
        <header className="sm-header">
          <h4>Create New Space</h4>
          <button
            className="sm-close"
            onClick={onClose}
            aria-label="Close"
            type="button"
          >
            ×
          </button>
        </header>

        <form className="sm-body" onSubmit={handleCreate}>
          <label className="sm-label">Space Name</label>
          <input
            className="sm-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. React Devs"
            autoFocus
          />

          <label className="sm-label">Description</label>
          <textarea
            className="sm-textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your space..."
            rows={4}
          />


          <footer className="sm-footer">
            <button
              type="button"
              className="sm-btn sm-btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>

            <button type="submit" className="sm-btn sm-btn-primary">
              Create
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
