// FILE: src/components/FilterSidebar.jsx
// FilterSidebar — shows top spaces + Create Space CTA
// - Uses FeedContext (defensive access in case provider is missing)
// - Navigates client-side to /spaces with topic query
// - Delegates create-space action to provided handler or fires legacy event

import React from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { useFeed } from "../hooks/useFeed";
import "../styles/FilterSidebar.css";

export default function FilterSidebar({ onCreateSpaceClick }) {
  const navigate = useNavigate();

  // Defensive consumption of FeedContext: avoid throwing if used outside provider
  let spaces = [];
  try {
    const ctx = useFeed();
    spaces = Array.isArray(ctx?.spaces) ? ctx.spaces : [];
  } catch {
    spaces = [];
  }

  // Compute top spaces:
  // - prefer explicit `followers` (or `members`), sort descending
  // - tie-breaker: newer createdAt first
  // - final tie-break: alphabetic name asc
  const topSpaces = [...spaces]
    .sort((a, b) => {
      const fa = Number(a?.followers ?? a?.members ?? 0);
      const fb = Number(b?.followers ?? b?.members ?? 0);
      if (fb !== fa) return fb - fa; // more followers first

      const ta = Date.parse(a?.createdAt) || 0;
      const tb = Date.parse(b?.createdAt) || 0;
      if (tb !== ta) return tb - ta; // newer first

      const na = String(a?.name || "").toLowerCase();
      const nb = String(b?.name || "").toLowerCase();
      return na.localeCompare(nb);
    })
    .slice(0, 6);

  const openCreateSpace = (prefill = "") => {
    if (typeof onCreateSpaceClick === "function") {
      onCreateSpaceClick(prefill);
      return;
    }
    // legacy fallback event — App.jsx listens and will gate auth/profile
    window.dispatchEvent(new CustomEvent("qc:openSpaceModal", { detail: { prefill } }));
  };

  const handleSpaceClick = (space) => {
    if (!space || !space.name) return;
    navigate(`/spaces?topic=${encodeURIComponent(space.name)}`);
  };

  return (
    <aside
      className="filter-sidebar card p-3 position-sticky"
      style={{ top: 76 }} /* keep in sync with navbar height */
      aria-label="Spaces sidebar"
    >
      <h6 className="mb-3">Spaces</h6>

      <ul className="spaces-list list-unstyled mb-3" role="list">
        {topSpaces.length === 0 ? (
          <li className="text-muted small">No spaces yet.</li>
        ) : (
          topSpaces.map((s) => (
            <li
              key={s.id || s.name}
              className="space-item d-flex align-items-start mb-2"
              role="listitem"
            >
              <button
                type="button"
                className="space-link flex-grow-1 text-start btn-reset"
                onClick={() => handleSpaceClick(s)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleSpaceClick(s);
                  }
                }}
                aria-label={`Open space ${s.name}`}
                title={s.description || s.name}
              >
                <div className="d-flex align-items-center">
                  <div
                    className="space-color"
                    style={{
                      background: s.color || "#ddd",
                      minWidth: 12,
                      minHeight: 12,
                      borderRadius: 4,
                    }}
                    aria-hidden="true"
                  />
                  <div className="ms-2">
                    <div className="space-name">{s.name}</div>
                    <div className="space-desc text-muted small">
                      {s.description}
                    </div>
                  </div>
                </div>
              </button>

              <div className="ms-2 d-flex align-items-center">
                <span
                  className="badge followers-badge"
                  aria-label={`${s.followers ?? s.members ?? 0} followers`}
                >
                  {s.followers ?? s.members ?? 0}
                </span>
              </div>
            </li>
          ))
        )}
      </ul>

      <button
        className="btn btn-danger w-100 mb-3"
        onClick={() => openCreateSpace()}
        aria-label="Create a new space"
      >
        + Create Space
      </button>

      <hr />

      <div className="small text-muted">
        Explore more spaces on the{" "}
        <button
          type="button"
          onClick={() => navigate("/spaces")}
          className="btn-reset text-decoration-underline"
          aria-label="Go to Spaces page"
        >
          Spaces page
        </button>
        .
      </div>
    </aside>
  );
}

FilterSidebar.propTypes = {
  onCreateSpaceClick: PropTypes.func,
};
