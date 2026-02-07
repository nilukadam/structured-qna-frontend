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
import { useAuth } from "../../hooks/useAuth";
import { useFeed } from "../../hooks/useFeed";
import { FaUserMinus, FaUserPlus, FaSearch } from "react-icons/fa";
import "../../styles/Following.css";

export default function FollowingPage() { 
  const { user, isAuthenticated } = useAuth();
  const { following = [], toggleFollowAuthor, addNotification } = useFeed();
  const [search, setSearch] = useState("");
      useEffect(() => {
      setSearch("");
      }, []);
  const isFollowing = (id) => following.some((u) => u.id === id);

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

  const handleFollowClick = (userToFollow) => {
    if (!isAuthenticated) {
      // existing auth flow only
      alert("Please login to follow users");
      return;
    }

    const alreadyFollowing = isFollowing(userToFollow.id);

    // Triger follow/unfollow in feed
    toggleFollowAuthor(userToFollow);

    // Trigger Notification
    addNotification({
      type: "system",
      text: alreadyFollowing
      ? `You unfollowed ${userToFollow.name}.`
      : `You started following ${userToFollow.name}`,
      from: { name: "You", avatar: user?.avatar },
    });
  };
  
  return (
    <div className="container mt-4 following-page">
      
      {/* ================= HEADER ================= */}
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-3">
        <h3 className="m-0 following-title">Following</h3>

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
            placeholder="Search people you follow"
            value={search}
            onChange={(e) => {
              const value = e.target.value;
              setSearch(value);
            }}
            aria-label="Search following list"
          />
        </div>
      </div>

      {/* ================= EMPTY STATE ================= */}
      {filtered.length === 0 && (
        <div className="following-empty text-muted">
          No people match your search.
        </div>
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

              {/*Unfollow */}
               <button
               className="btn btn-sm btn-outline-secondary"
               onClick={() => handleFollowClick(u)}
               >
                <FaUserMinus className="me-1"/> Unfollow
               </button>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
