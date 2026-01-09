// FILE: src/features/following/FollowingPage.jsx
/**
 * FollowingPage — Production Ready (Final)
 * -------------------------------------------------------
 * - Displays all users the current profile is following.
 * - Uses FeedContext.following (dummy or real data).
 * - Supports follow/unfollow (frontend-only toggle).
 * - Includes search bar with live filtering.
 * - Fully responsive + Bootstrap-based + accessible.
 */

import React, { useState, useEffect, useMemo } from "react";
import { useFeed } from "../../hooks/useFeed";
import { FaUserMinus, FaUserPlus, FaSearch } from "react-icons/fa";
import "../../styles/Following.css";

export default function FollowingPage() {
  const { following = [] } = useFeed();
  const [search, setSearch] = useState("");
  const [followed, setFollowed] = useState({});

  /** Set initial follow mapping on mount */
  useEffect(() => {
    const map = {};
    following.forEach((u) => (map[u.id] = true));
    setFollowed(map);
  }, [following]);

  /** Filter by search query */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return following;

    return following.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        (u.profession && u.profession.toLowerCase().includes(q))
    );
  }, [following, search]);

  const toggleFollow = (id) =>
    setFollowed((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="container mt-4 following-page">
      
      {/* ================= HEADER ================= */}
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-3">
        <h4 className="m-0">Following</h4>

        {/* Search box */}
        <div className="position-relative" style={{ maxWidth: 280 }}>
          <FaSearch
            className="position-absolute"
            style={{
              top: "50%",
              left: 10,
              transform: "translateY(-50%)",
              color: "#888",
            }}
          />
          <input
            type="search"
            className="form-control ps-4"
            placeholder="Search people..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search following list"
          />
        </div>
      </div>

      {/* ================= EMPTY STATE ================= */}
      {filtered.length === 0 && (
        <div className="alert alert-info">No people found.</div>
      )}

      {/* ================= FOLLOWING GRID ================= */}
      <div className="row g-3">
        {filtered.map((u) => (
          <div
            key={u.id}
            className="col-12 col-md-6 col-lg-4"
            role="listitem"
          >
            <div className="card p-3 shadow-sm h-100 d-flex flex-row align-items-center gap-3 following-card">
              
              {/* Avatar */}
              <img
                src={u.avatar || "/assets/profiles/nilu.jpg"}
                alt={u.name}
                className="rounded-circle following-avatar"
                width={60}
                height={60}
                style={{ objectFit: "cover" }}
              />

              {/* Info */}
              <div className="flex-grow-1">
                <h6 className="mb-0">{u.name}</h6>
                <p className="small text-muted mb-1">
                  {u.profession || "Member"}
                </p>
              </div>

              {/* Follow/Unfollow */}
              <button
                className={`btn btn-sm ${
                  followed[u.id]
                    ? "btn-outline-secondary"
                    : "btn-outline-primary"
                }`}
                onClick={() => toggleFollow(u.id)}
                aria-pressed={!!followed[u.id]}
              >
                {followed[u.id] ? (
                  <>
                    <FaUserMinus className="me-1" /> Unfollow
                  </>
                ) : (
                  <>
                    <FaUserPlus className="me-1" /> Follow
                  </>
                )}
              </button>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
