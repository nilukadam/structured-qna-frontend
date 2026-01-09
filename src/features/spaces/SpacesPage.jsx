// FILE: src/features/spaces/SpacesPage.jsx
// -----------------------------------------------------------------------------
// SpacesPage (production-ready)
// - Lists spaces from FeedContext (defensive access)
// - Search + topic highlighting (via ?topic=)
// - Join / Leave (follow) action wired to FeedContext when possible
// - Accessible buttons, keyboard-friendly, responsive
// - Well-commented and easy to maintain
// -----------------------------------------------------------------------------

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useContext } from "react";
import { FeedContext } from "../../context/FeedContext";
import { FaSearch, FaUserPlus, FaUserCheck } from "react-icons/fa";
import "../../styles/Space.css";

export default function SpacesPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const topic = (params.get("topic") || "").trim();

  // Defensive: try to read from FeedContext but avoid throwing if not present
  const feedCtx = useContext(FeedContext);
  const ctxSpaces = Array.isArray(feedCtx?.spaces) ? feedCtx.spaces : [];
  const ctxToggleFollow = typeof feedCtx?.toggleFollowAuthor === "function" ? feedCtx.toggleFollowAuthor : null;
  const ctxFollowing = Array.isArray(feedCtx?.following) ? feedCtx.following : [];




  // Local UI state
  const [q, setQ] = useState("");
  // Local join state for optimistic UI when no context follow helper exists
  const [localJoined, setLocalJoined] = useState(() => ({}));

  // If the page was opened with ?topic=Name, prefill search (helpful UX)
  useEffect(() => {
    if (topic) setQ(topic);
  }, [topic]);

  // Derived list: filter by search term and prioritize exact topic match
  const ordered = useMemo(() => {
    const term = (q || "").trim().toLowerCase();
    let list = [...ctxSpaces];

    // Basic search (name or description)
    if (term) {
      list = list.filter((s) => {
        const name = String(s?.name || "").toLowerCase();
        const desc = String(s?.description || "").toLowerCase();
        return name.includes(term) || desc.includes(term);
      });
    }

    // If a topic is provided via URL, show exact-name matches at top
    if (topic) {
      const t = topic.toLowerCase();
      const top = list.filter((s) => String(s?.name || "").toLowerCase() === t);
      const rest = list.filter((s) => String(s?.name || "").toLowerCase() !== t);
      return [...top, ...rest];
    }

    // Default: sort by followers (desc) then name
    return list.sort((a, b) => {
      const fa = Number(a?.followers ?? a?.members ?? 0);
      const fb = Number(b?.followers ?? b?.members ?? 0);
      if (fb !== fa) return fb - fa;
      return String(a?.name || "").localeCompare(String(b?.name || ""));
    });
  }, [ctxSpaces, q, topic]);

  // Toggle join/leave (follow/unfollow). Prefer context helper; fallback to local state.
  const handleToggleJoin = (space) => {
    if (!space || !space.id) return;

    // If context provides a follow helper, prefer that so change is persisted in app state
    if (ctxToggleFollow) {
      try {
        ctxToggleFollow({ id: space.id, name: space.name, avatar: space.avatar });
        return;
      } catch (err) {
        // fall through to local state on error
        console.warn("toggleFollowAuthor failed", err);
      }
    }

    // Fallback: local optimistic toggle
    setLocalJoined((prev) => ({ ...prev, [space.id]: !prev[space.id] }));
  };

  // Helper to determine UI join state (context-driven if we can infer it, else local)
  const isJoined = (space) => {
    if (!space || !space.id) return false;
    // check context following list first (if present)
   if (Array.isArray(ctxFollowing) && ctxFollowing.length) {
     return !!ctxFollowing.find((f) => String(f.id) === String(space.id));
    }
    return !!localJoined[space.id];
  };


  return (
    <div className="container mt-4 spaces-page">
      <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3 mb-3">
        <div>
          <h3 className="mb-1">Spaces {topic ? <small className="text-muted">· {topic}</small> : null}</h3>
          <div className="text-muted small">Discover communities focused on specific topics.</div>
        </div>

        <div className="d-flex gap-2 align-items-center w-100 w-md-auto">
          <div className="position-relative" style={{ maxWidth: 340, width: "100%" }}>
            <FaSearch className="spaces-search-icon" aria-hidden="true" />
            <input
              type="search"
              className="form-control spaces-search-input"
              placeholder="Search spaces by name or description"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Search spaces"
            />
          </div>

          <button
            className="btn btn-primary"
            onClick={() => window.dispatchEvent(new CustomEvent("qc:openSpaceModal", { detail: { prefill: q } }))}
            aria-label="Create space"
            title="Create a new space"
          >
            + Create Space
          </button>
        </div>
      </div>

      <div className="row g-3">
        {ordered.length === 0 ? (
          <div className="col-12">
            <div className="alert alert-info mb-0">No spaces found.</div>
          </div>
        ) : (
          ordered.map((s) => (
            <div key={s.id || s.name} className="col-12 col-md-6 col-lg-4">
              <article className="card space-card h-100 shadow-sm" aria-labelledby={`space-${s.id}-title`}>
                {/* banner: uses background image if provided */}
                <div
                  className="space-banner rounded-top"
                  style={{ backgroundImage: `url(${s.image || "/assets/spaces/default.jpg"})` }}
                  aria-hidden="true"
                />

                <div className="p-3 d-flex flex-column justify-content-between flex-grow-1">
                  <div>
                    <h5 id={`space-${s.id}-title`} className="mb-1">{s.name}</h5>
                    <div className="text-muted small mb-2">{s.followers ?? s.members ?? 0} followers</div>
                    <p className="small text-muted mb-3">{s.description || "A community to share ideas."}</p>
                  </div>

                  <div>
                    <button
                      className={`btn btn-sm w-100 ${isJoined(s) ? "btn-success" : "btn-outline-danger"}`}
                      onClick={() => handleToggleJoin(s)}
                      aria-pressed={isJoined(s)}
                      aria-label={isJoined(s) ? `Leave ${s.name}` : `Join ${s.name}`}
                    >
                      {isJoined(s) ? (
                        <>
                          <FaUserCheck className="me-1" /> Joined
                        </>
                      ) : (
                        <>
                          <FaUserPlus className="me-1" /> Join
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      className="btn btn-link btn-sm mt-2 w-100"
                      onClick={() => navigate(`/spaces?topic=${encodeURIComponent(s.name)}`)}
                    >
                      View space
                    </button>
                  </div>
                </div>
              </article>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
