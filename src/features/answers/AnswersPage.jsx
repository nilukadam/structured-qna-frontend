// FILE: src/features/answers/AnswersPage.jsx
import React, { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useFeed } from "../../hooks/useFeed";
import AnswerPostCard from "../../components/cards/AnswerPostCard";
import "../../styles/AnswerPage.css"

/**
 * AnswersPage — FINAL PRODUCTION VERSION
 * -------------------------------------
 * - Shows all posts or filtered search results.
 * - Accepts search param `?q=` from Navbar search.
 * - Supports fuzzy relevance scoring (title > body > author > tags).
 * - Fully defensive against missing fields (dates, ids, author, etc).
 * - Results sorted by score first, then newest timestamp.
 */

export default function AnswersPage() {
  const { posts = [] } = useFeed();
  const [params] = useSearchParams();
  const q = (params.get("q") || "").trim();

  // Compute search results or full posts list
  const results = useMemo(() => {
    const all = Array.isArray(posts) ? [...posts] : [];

    // No search → show all newest-first
    if (!q) {
      return all.sort((a, b) => {
        const ta = Date.parse(a?.createdAt) || 0;
        const tb = Date.parse(b?.createdAt) || 0;
        return tb - ta;
      });
    }

    const term = q.toLowerCase();

    // Score each post for relevance
    const scored = all.map((p) => {
      const title = String(p.title || "").toLowerCase();
      const body = String(p.content || p.description || "").toLowerCase();
      const tags = Array.isArray(p.tags)
        ? p.tags.map((t) => String(t).toLowerCase())
        : [];
      const author = String(p.author?.name || "").toLowerCase();

      let score = 0;
      if (title.includes(term)) score += 5;     // strong
      if (body.includes(term)) score += 3;      // medium
      if (author.includes(term)) score += 2;    // weak-medium
      if (tags.some((t) => t.includes(term))) score += 1; // light

      return { post: p, score };
    });

    // Keep only matching posts and sort by score + date
    return scored
      .filter((s) => s.score > 0)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        const ta = Date.parse(a.post?.createdAt) || 0;
        const tb = Date.parse(b.post?.createdAt) || 0;
        return tb - ta;
      })
      .map((s) => s.post);
  }, [posts, q]);

  return (
    <div className="container mt-4">
      {/* Header */}
      <h4 className="mb-3">
        {q ? `Results for “${q}”` : "All answers"}
      </h4>

      {/* Summary */}
      <div className="mb-3 text-muted small">
        {q
          ? `${results.length} result${results.length !== 1 ? "s" : ""} found`
          : `${results.length} post${results.length !== 1 ? "s" : ""} — newest first`
        }
      </div>

      {/* No results */}
      {results.length === 0 ? (
        <div className="alert alert-info">
          {q ? (
            <>
              No results matched <strong>“{q}”</strong>.  
              Try different keywords or remove filters.
            </>
          ) : (
            "No posts yet. Be the first to ask or post!"
          )}
        </div>
      ) : (
        results.map((p, idx) => (
          <AnswerPostCard
            key={p?.id || p?._id || `post-${idx}`}
            post={p}
          />
        ))
      )}
    </div>
  );
}
