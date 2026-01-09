// FILE: src/features/profiles/ProfilePage.jsx
// -----------------------------------------------------------------------------
// ProfilePage (production-ready)
// - Shows the current user's profile (sourced from AuthContext)
// - Allows editing via ProfileModal (updates persisted auth user)
// - Lists posts authored by the current user (sourced from FeedContext)
// - Defensive: tolerates missing contexts, empty data, and works offline
// - Accessibility-friendly and well-commented for maintainability
// -----------------------------------------------------------------------------

import React, { useMemo, useState } from "react";
import { useFeed } from "../../hooks/useFeed";
import { useAuth } from "../../hooks/useAuth";
import ProfileModal from "../../components/modals/ProfileModal";
import AnswerPostCard from "../../components/cards/AnswerPostCard";
import { toast } from "react-hot-toast";
import "../../styles/Profile.css";

// small neutral avatar fallback (data URI SVG)
const DEFAULT_AVATAR =
  "data:image/svg+xml;base64,PHN2ZyBmaWxsPSJub25lIiBoZWlnaHQ9IjMyIiBzdHJva2U9IiM3YTc3NzciIHN0cm9rZS13aWR0aD0iMS41IiB2aWV3Qm94PSIwIDAgMjQgMjQiIHdpZHRoPSIzMiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjgiIHI9IjMiLz48cGF0aCBkPSJNNC4xOCAxOS4yMkE4IDggMCAwIDEgMTIgMTZhOCA4IDAgMCAxIDcuODIgMy4yMiIvPjwvc3ZnPg==";

export default function ProfilePage() {
  // Auth: authoritative profile + update function
  const { user: profile, updateProfile } = useAuth();

  // Feed: posts list (may be empty if FeedProvider not present)
  const { posts = [] } = useFeed() || {};

  // Local UI
  const [editOpen, setEditOpen] = useState(false);

  // Determine avatar to display (prefer profile.avatar, else neutral SVG)
  const avatarSrc = profile?.avatar?.trim() ? profile.avatar : DEFAULT_AVATAR;

  // Derive posts that belong to current user. Prefer matching by author id/email
  const myPosts = useMemo(() => {
    if (!profile) return [];
    const id = String(profile.id || profile.email || "").toLowerCase();
    return (Array.isArray(posts) ? posts : []).filter((p) => {
      const author = p?.author || {};
      // prefer id match, fallback to email or name
      const aId = String(author.id || author.email || "").toLowerCase();
      const aName = String(author.name || author.username || "").toLowerCase();
      if (aId && id && aId === id) return true;
      if (profile.name && aName && aName === String(profile.name).toLowerCase()) return true;
      return false;
    });
  }, [posts, profile]);

  const handleSave = (patch) => {
    try {
      // updateProfile comes from AuthContext (persists to localStorage)
      updateProfile?.(patch);
      toast.success("Profile updated");
      setEditOpen(false);
    } catch (err) {
      console.error("Profile save failed", err);
      toast.error("Failed to save profile");
    }
  };

  return (
    <div className="container mt-4 profile-page">
      {/* PROFILE HEADER */}
      <section className="card p-4 shadow-sm mb-4 profile-header" aria-labelledby="profile-heading">
        <div className="d-flex align-items-center gap-3 flex-wrap">
          <img
            src={avatarSrc}
            alt={profile?.name ? `${profile.name} avatar` : "User avatar"}
            width={96}
            height={96}
            className="rounded-circle profile-avatar border"
            style={{ objectFit: "cover" }}
          />

          <div className="flex-grow-1 min-w-0">
            <h2 id="profile-heading" className="mb-1">
              {profile?.name || "Your name"}
            </h2>
            <div className="text-muted mb-2">{profile?.email || "—"}</div>

            <p className="mb-1 text-muted">
              {profile?.bio || "Add a short bio so others know who you are."}
            </p>
            {profile?.location && (
              <div className="small text-muted">{profile.location}</div>
            )}
          </div>

          <div className="ms-auto d-flex flex-column gap-2">
            <button
              className="btn btn-outline-danger"
              onClick={() => setEditOpen(true)}
              aria-haspopup="dialog"
            >
              Edit profile
            </button>
          </div>
        </div>
      </section>

      {/* POSTS LIST */}
      <section className="profile-posts">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h4 className="m-0">Your Posts <span className="text-muted small">({myPosts.length})</span></h4>
        </div>

        {myPosts.length === 0 ? (
          <div className="alert alert-info">You haven't published any posts yet. Try creating a question or a post.</div>
        ) : (
          myPosts.map((post) => <AnswerPostCard key={post.id || post._id} post={post} />)
        )}
      </section>

      {/* PROFILE EDIT MODAL */}
      <ProfileModal
        isOpen={editOpen}
        editMode={true}
        onClose={() => setEditOpen(false)}
        onSave={handleSave}
        initialProfile={{
          name: profile?.name || "",
          email: profile?.email || "",
          bio: profile?.bio || "",
          location: profile?.location || "",
          avatar: profile?.avatar || "",
        }}
      />
    </div>
  );
}
