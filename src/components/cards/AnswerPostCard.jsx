// FILE: src/components/cards/AnswerPostCard.jsx
import React, {useEffect, useMemo, useRef, useState} from "react";
import PropTypes from "prop-types";
import { v4 as uuid } from "uuid";
import { toast } from "react-hot-toast";
import {
  FaThumbsUp,
  FaThumbsDown,
  FaRegCommentDots,
  FaShareAlt,
  FaUserPlus,
  FaUserCheck,
} from "react-icons/fa";
import { useFeed } from "../../hooks/useFeed";
import { useAuth } from "../../hooks/useAuth";
import "../../styles/PostCard.css";

/**
 * Inline SVG placeholder (data URI)
 * - used as final fallback for avatars so we never show broken images
 */
const placeholderSvg = encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 24 24' fill='none'>
     <rect rx='12' width='24' height='24' fill='%23e9ecef'/>
     <path d='M12 12a3 3 0 100-6 3 3 0 000 6zm0 2c-3 0-6 1.5-6 3v1h12v-1c0-1.5-3-3-6-3z' fill='%23999'/>
   </svg>`
);
const placeholderDataUri = `data:image/svg+xml;utf8,${placeholderSvg}`;

/**
 * Small default inline avatar (base64 kept for backwards compatibility)
 * but primary fallback is placeholderDataUri above.
 */
const defaultAvatar =
  "data:image/svg+xml;base64,PHN2ZyBmaWxsPSJub25lIiBoZWlnaHQ9IjMyIiBzdHJva2U9IiM3YTc3NzciIHN0cm9rZS13aWR0aD0iMS41IiB2aWV3Qm94PSIwIDAgMjQgMjQiIHdpZHRoPSIzMiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjgiIHI9IjMiLz48cGF0aCBkPSJNNC4xOCAxOS4yMkE4IDggMCAwIDEgMTIgMTZhOCA4IDAgMCAxIDcuODIgMy4yMiIvPjwvc3ZnPg==";

/**
 * AnswerPostCard
 * - Displays a single post/question
 * - Handles votes, follow, comments (create/delete) using FeedContext actions
 */
export default function AnswerPostCard({ post }) {
  const { 
    upvotePost, 
    downvotePost, 
    toggleFollowAuthor, 
    addNotification,
    addComment, 
    deleteComment,
    } = useFeed();

  const { isAuthenticated, user } = useAuth();

  // Local UI state
  const [expanded, setExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const contentRef = useRef(null);
  const [isOverflowing, setIsOverflowing] = useState(false)

  // Defensive destructure with defaults
  const {
    id: rawId,
    type = "question",
    title = "",
    content = "",
    font = "inherit",
    image = null,
    author = {},
    createdAt,
    upvotes = 0,
    downvotes = 0,
    comments = 0,
    followed = false,
    commentsList = [],
    _id,
  } = post || {};

  const postId = String(rawId || _id || "");

  // Author display fields with safe fallbacks
  const authorName = author?.name || author?.username || "Unknown user";
  const authorAvatar = author?.avatar || defaultAvatar || placeholderDataUri;
  const authorProfession = author?.profession || "Member";
  const canFollow = !!author?.id;

  // nicely formatted created date (defensive)
  const when = useMemo(() => {
    if (!createdAt) return "";
    try {
      const d = new Date(createdAt);
      if (Number.isNaN(d.getTime())) return "";
      return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
    } catch {
      return "";
    }
  }, [createdAt]);

  // Content length check for "read more"
  const safeContent =
  typeof content === "string"
    ? content
    : Array.isArray(content)
    ? content.join(" ")
    : typeof content === "object"
    ? JSON.stringify(content)
    : String(content ?? "");

  const plainLen = safeContent.replace(/\n+/g, " ").length;
    useEffect(() => {
      if (!expanded && contentRef.current) return;

      const el = contentRef.current;

      const measure = () => {
        setIsOverflowing(el.scrollHeight > el.clientHeight)
      }

      //Meaasure after layout settles
      requestAnimationFrame(measure)
    }, [expanded, safeContent])

  const handleFollowToggle = () => {
    if (!isAuthenticated) {
      toast.error("Please login to follow useres");
      return;
    }
    if (!canFollow) {
      toast("Cannot follow this author");
      return;
    }

    const wasFollowing = followed;
    try {
      toggleFollowAuthor(author);

      addNotification({
        type: "system",
        text: wasFollowing
          ? `You unfollowed ${authorName}.`
          : `You started following ${authorName}`,
          from: {name: "You", avatar: user?.avatar},
      });
      toast.success(
        wasFollowing ? `Unfollowed ${authorName}` : `Following ${authorName}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update follow");
    }
  };

  // Add comment handler (uses FeedContext.addComment)
  const handlePostComment = () => {
    if (!isAuthenticated) {
      toast.error("Please login to comment");
      return;
    }
    const text = (newComment || "").trim();
    if (!text) return;

    const c = {
      id: uuid(),
      text,
      author: {
        id: user?.email || user?.id || "me",
        name: user?.name || "You",
        avatar: user?.avatar || placeholderDataUri,
      },
      createdAt: new Date().toISOString(),
    };

    try {
      addComment(postId, c);
      setNewComment("");
      toast.success("Comment added");
      setShowComments(true);
    } catch (err) {
      console.error(err);
      toast.error("Failed to add comment");
    }
  };

  // Delete comment wrapper (calls FeedContext.deleteComment)
  const handleDeleteComment = (commentId) => {
    try {
      deleteComment(postId, commentId);
      toast.success("Comment deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete comment");
    }
  };

  return (
    <article className="post-card card shadow-sm mb-3 p-3 rounded" aria-labelledby={`post-${postId}`}>
      {/* Header */}
      <header className="post-header d-flex align-items-center justify-content-between mb-2">
        <div className="d-flex align-items-center gap-2">
          <img
            src={authorAvatar || placeholderDataUri}
            alt={authorName}
            className="rounded-circle"
            width={45}
            height={45}
            style={{ objectFit: "cover" }}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = placeholderDataUri;
            }}
          />
          <div>
            <h6 id={`post-${postId}`} className="mb-0 fw-semibold">{authorName}</h6>
            <small className="text-muted">
              {authorProfession}
              {when ? ` · ${when}` : ""}
            </small>
          </div>
        </div>

        <button
          className={`btn btn-sm ${followed ? "btn-outline-secondary" : "btn-outline-primary"}`}
          onClick={handleFollowToggle}
          disabled={!canFollow}
          title={canFollow ? (followed ? "Unfollow" : "Follow") : "Cannot follow"}
          aria-pressed={!!followed}
        >
          {followed ? <FaUserCheck className="me-1" /> : <FaUserPlus className="me-1" />}
          {followed ? "Following" : "Follow"}
        </button>
      </header>
 
      {/* Body */}
      <section className="post-body mt-2" style={{ fontFamily: font }}>
        {type === "question" && title && <h5 className="fw-semibold mb-2">{title}</h5>}

        {!!content && (
          <div className="post-text">
            <div className="post-text-inner">
             <p
               ref={contentRef}
               className="post-content" 
               style={{
                maxHeight :expanded ? "none" : "4.8rem",
                overflow: "hidden"
               }}
              >
                {safeContent} 
              </p>

              {(plainLen > 50 || isOverflowing) && (
                 <button
                    className="post-readmore"
                    onClick={() => setExpanded(s => !s)}
                 >
                    {expanded ? "Show less" : "Read more"}
                 </button>
                )}
              </div>
           </div>
          )}
          
        {image && (
          <div className="mt-3">
            <img
              src={image}
              alt="Post visual"
              className="img-fluid rounded"
              style={{ maxHeight: 400, objectFit: "cover" }}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
        )}
      </section>

      {/* Footer: votes / comments / share */}
      <footer className="post-footer mt-3 d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-2">
          <button
            className={`btn btn-sm btn-outline-success d-flex align-items-center btn-vote-up ${post.__upvoted ? "active" : ""}`}
            onClick={() => {
              if (!isAuthenticated) {
                toast.error("Please login to vote")
                return;
              }
              upvotePost(postId);
            }}
            aria-label="Upvote"
          >
            <FaThumbsUp className="me-1" />
            {upvotes}
          </button> 

          <button
            className={`btn btn-sm btn-outline-danger d-flex align-items-center btn-vote-down ${post.__downvoted ? "active" : ""}`}
            onClick={() => {
              if (!isAuthenticated) {
                toast.error("Please login to vote");
                return;
              }
              downvotePost(postId)
            }}
            aria-label="Downvote"
          >
            <FaThumbsDown className="me-1" />
            {downvotes}
          </button>

          <button
            className="btn btn-sm btn-outline-secondary d-flex align-items-center"
            onClick={() => setShowComments((s) => !s)}
            aria-label="Toggle comments"
            aria-expanded={showComments}
          >
            <FaRegCommentDots className="me-1" />
            {comments}
          </button>

          <button
            className="btn btn-sm btn-outline-secondary d-flex align-items-center"
            onClick={() => toast("Share feature not implemented in demo")}
            aria-label="Share"
          >
            <FaShareAlt className="me-1" /> Share
          </button>
        </div>

        <span className={`badge ${type === "question" ? "bg-primary-subtle text-primary" : "bg-info-subtle text-info"}`}>
          {type === "question" ? "Question" : "Post"}
        </span>
      </footer>

      {/* Comments */}
      {showComments && (
        <div className="mt-3">
          <div className="d-flex gap-2">
            <input
              className="form-control"
              placeholder={isAuthenticated ? "Write a comment…" : "Login to comment"}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={!isAuthenticated}
              aria-label="Write a comment"
            />
            <button
              className="btn btn-primary"
              disabled={!isAuthenticated || !newComment.trim()}
              onClick={handlePostComment}
            >
              Post
            </button>
          </div>

          <ul className="list-unstyled mt-3">
            {Array.isArray(commentsList) && commentsList.length > 0 ? (
              commentsList.slice().reverse().map((c) => {
                // Defensive date formatting
                let createdAtStr = "";
                try {
                  const d = new Date(c.createdAt);
                  createdAtStr = Number.isFinite(d.getTime()) ? d.toLocaleString() : "";
                } catch {
                  createdAtStr = "";
                }

                return (
                  <li key={c.id} className="d-flex justify-content-between align-items-start mb-2">
                    <div className="d-flex gap-2">
                      <img
                        src={c.author?.avatar || placeholderDataUri}
                        alt={c.author?.name || "User"}
                        width={32}
                        height={32}
                        className="rounded-circle"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = placeholderDataUri;
                        }}
                        style={{ objectFit: "cover" }}
                      />
                      <div>
                        <div className="small">
                          <strong>{c.author?.name || "User"}</strong>
                          {createdAtStr ? ` · ${createdAtStr}` : ""}
                        </div>
                        <div>{c.text}</div>
                      </div>
                    </div>

                    {c.author?.id === (user?.email || user?.id || "me") && (
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDeleteComment(c.id)}
                        aria-label="Delete comment"
                      >
                        Delete
                      </button>
                    )}
                  </li>
                );
              })
            ) : (
              <div className="text-muted small">No comments yet.</div>
            )}
          </ul>
        </div>
      )}
    </article>
  );
}

AnswerPostCard.propTypes = {
  post: PropTypes.shape({
    id: PropTypes.string,
    type: PropTypes.string,
    title: PropTypes.string,
    content: PropTypes.string,
    font: PropTypes.string,
    image: PropTypes.string,
    author: PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
      avatar: PropTypes.string,
      profession: PropTypes.string,
    }),
    createdAt: PropTypes.string,
    upvotes: PropTypes.number,
    downvotes: PropTypes.number,
    comments: PropTypes.number,
    followed: PropTypes.bool,
    commentsList: PropTypes.array,
  }).isRequired,
};
