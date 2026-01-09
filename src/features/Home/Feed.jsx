// FILE: src/features/Home/Feed.jsx
import React, { useEffect, useMemo, useRef, useState, useContext } from "react";
import { useFeed } from "../../hooks/useFeed";
import { posts as seedPosts } from "../../data"; // fallback seed data
import AnswerPostCard from "../../components/cards/AnswerPostCard";
import FeedSkeleton from "../../components/skeletons/Feedskeleton";

/**
 * Feed
 * ----
 * - Uses posts from FeedContext when available, otherwise falls back to seedPosts.
 * - Newest-first ordering (tolerates missing/invalid createdAt).
 * - Infinite-scroll via IntersectionObserver (graceful fallback).
 *
 * Props (optional):
 * - onTryPost(draft) => void
 * - onCreateSpace(name) => void
 * - onProfileClick(opts) => void
 */
const PAGE_SIZE = 5;

export default function Feed({ onTryPost, onCreateSpace, onProfileClick } = {}) {
  // Attempt to read posts from FeedContext; if provider not present, fall back gracefully.
  const postsSource = useMemo(() => {
    let ctxPosts = [];
    try {
      const ctx = useContext(FeedContext);
      ctxPosts = Array.isArray(ctx?.posts) ? ctx.posts : [];
    } catch {
      ctxPosts = [];
    }
  
    return ctxPosts.length > 0 ? ctxPosts : Array.isArray(seedPosts) ? seedPosts : [];
  }, [useFeed, seedPosts]);  

  // Visible count for infinite scroll
  const [visible, setVisible] = useState(PAGE_SIZE);
  const sentinelRef = useRef(null);

  // Order newest-first; tolerate missing/invalid createdAt by treating as 0
  const ordered = useMemo(() => {
    return [...postsSource].sort((a, b) => {
      const ta = Number.isFinite(Date.parse(a?.createdAt)) ? Date.parse(a.createdAt) : 0;
      const tb = Number.isFinite(Date.parse(b?.createdAt)) ? Date.parse(b.createdAt) : 0;
      return tb - ta;
    });
  }, [postsSource]);

  // Reset visible when posts list identity changes (new post added/removed)
  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [ordered.length]);

  // IntersectionObserver to auto-load more posts
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) {
      return;
    }

    if (typeof IntersectionObserver === "undefined") {
      // no IO support -> show all
      setVisible(ordered.length);
      return;
    }

    let io = null;
    try {
      io = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) {
            setVisible((v) => Math.min(v + PAGE_SIZE, ordered.length));
          }
        },
        { rootMargin: "200px 0px 200px 0px", threshold: 0.01 }
      );
      io.observe(el);
    } catch {
      void err;
      // Fallback: reveal all posts
      setVisible(ordered.length);
    }

    return () => {
      if (io) io.disconnect();
    };
  }, [ordered.length]);

  const slice = ordered.slice(0, visible);
  const hasMore = visible < ordered.length;

  return (
    <div>
      {/* Empty / loading state */}
      {slice.length === 0 ? <FeedSkeleton count={3} /> : null}

      {/* Posts */}
      {slice.map((p, idx) => (
        <AnswerPostCard
          key={p?.id ?? p?._id ?? `post-${idx}`}
          post={p}
          onTryPost={onTryPost}
          onCreateSpace={onCreateSpace}
          onProfileClick={onProfileClick}
        />
      ))}

      {/* sentinel for infinite scroll */}
      <div ref={sentinelRef} style={{ height: 2 }} aria-hidden="true" />

      {/* Load indicator or spacer */}
      {hasMore ? (
        <div className="text-center text-muted py-3" aria-live="polite">
          Loading more…
        </div>
      ) : (
        <div style={{ height: 24 }} aria-hidden="true" />
      )}
    </div>
  );
}
