// FILE: src/components/layout/Footer.jsx
// Footer component (compact wrapper shown under the left sidebar)
// - Lightweight presentational component used in the sidebar/footer area
// - Uses Bootstrap utility classes so it respects the theme (bg-body, border, rounded)
// - No props required (static links), keep markup simple for reusability

import React from "react";

export default function Footer() {
  return (
    <div className="footer-box bg-body border rounded p-3 small" aria-label="Application footer">
      {/* Brand / copyright */}
      <div className="fw-semibold">Quora Clone • © 2025 QClone</div>

      {/* Helpful links (client-side navigation could be used later) */}
      <div className="mt-2 d-flex flex-wrap gap-3">
        <a href="/about" className="footer-link" aria-label="About page">About</a>
        <a href="/terms" className="footer-link" aria-label="Terms and conditions">Terms</a>
        <a href="/privacy" className="footer-link" aria-label="Privacy policy">Privacy</a>
        <a href="/contact" className="footer-link" aria-label="Contact us">Contact</a>
      </div>
    </div>
  );
}
