// FILE: src/components/skeletons/FeedSkeleton.jsx
// -----------------------------------------------------------------------------
// FeedSkeleton
// -----------------------------------------------------------------------------
// A lightweight loading placeholder used while post feed data is loading.
// - count: number of skeleton cards to render (default = 3)
// - Uses simple div-based skeleton shapes (avatar, lines, rectangles)
// - CSS-driven shimmer animation is defined in FeedSkeleton.css
// -----------------------------------------------------------------------------

import React from "react";
import "../../styles/FeedSkeleton.css"; // ensure styles are applied

export default function FeedSkeleton({ count = 3 }) {
  return (
    <div>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card p-3 mb-3 skeleton-card">
          
          {/* Header skeleton (avatar + user info lines) */}
          <div className="d-flex align-items-center gap-2 mb-2">
            <div className="skeleton avatar" />
            <div className="flex-grow-1">
              <div className="skeleton line w-50" />
              <div className="skeleton line w-25 mt-1" />
            </div>
          </div>

          {/* Body skeleton (text lines) */}
          <div className="skeleton line w-100" />
          <div className="skeleton line w-75 mt-2" />

          {/* Image block skeleton */}
          <div className="skeleton rect mt-3" style={{ height: 120 }} />
        </div>
      ))}
    </div>
  );
}
