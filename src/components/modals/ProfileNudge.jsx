// Minimal profile nudge modal (prompt user to complete profile)
// Locks scroll, handles Escape, restores focus, focuses modal on open.

import React, { useEffect, useRef } from "react";
import "../../styles/QuestionModal.css";

export default function ProfileNudge({ show, onClose, onUpdateNow, onSkip }) {
  const cardRef = useRef(null);
  const prevFocus = useRef(null);

  // Effects: scroll lock, focus, ESC close
  useEffect(() => {
    if (!show) return;

    prevFocus.current = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const timer = setTimeout(() => {
      cardRef.current?.focus?.();
    }, 40);

    const handleKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", handleKey);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = prevOverflow || "";
      document.removeEventListener("keydown", handleKey);
      try {
        prevFocus.current?.focus?.();
      } catch (err) {
        void err;
      }
    };
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="qm-backdrop" role="dialog" aria-modal="true" aria-labelledby="pn-title">
      <div className="qm-card" style={{ maxWidth: 520 }} ref={cardRef} tabIndex={-1}>
        <button className="qm-close" onClick={onClose} aria-label="Close" type="button">
          ×
        </button>

        <h4 id="pn-title" className="mb-2">Complete your profile</h4>

        <p className="text-muted mb-3">
          Add your name and avatar so others can recognize you.
        </p>

        <div className="d-flex justify-content-end gap-2">
          <button className="btn btn-secondary" type="button" onClick={onSkip}>
            Skip
          </button>

          <button className="btn btn-primary" type="button" onClick={onUpdateNow}>
            Update Now
          </button>
        </div>
      </div>
    </div>
  );
}
