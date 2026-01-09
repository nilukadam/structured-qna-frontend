// FILE: src/features/Home/HomePage.jsx
import React from "react";
import AskBox from "../../components/layout/AskBox";
import FilterSidebar from "../../components/FilterSidebar";
import SidebarFooter from "../../components/layout/Footer"; // compact footer under spaces
import Feed from "./Feed";
import "../../styles/HomePage.css";

/**
 * HomePage
 * - Composes AskBox, Feed, and the left FilterSidebar (Spaces)
 * - Accepts handler props from App.jsx so App can centralize auth/profile gating
 *
 * Props:
 *  - onAskClick?: () => void
 *  - onTryPost?: (draft?) => void
 *  - onCreateSpace?: (prefillName?) => void
 *  - onProfileClick?: (opts?) => void
 *
 * Notes:
 * - If handlers are not provided, the component falls back to legacy CustomEvents
 *   (so older parts of the app that dispatch those events continue to work).
 */
export default function HomePage({
  onAskClick,
  onTryPost,
  onCreateSpace,
  onProfileClick,
}) {
  // --- Legacy events (kept for backwards compatibility) ---
  const legacyOpenQuestion = () => window.dispatchEvent(new CustomEvent("qc:openQuestion"));
  const legacyOpenSpace = (prefill = "") =>
    window.dispatchEvent(new CustomEvent("qc:openSpaceModal", { detail: { prefill } }));
  const legacyOpenProfile = (opts = {}) =>
    window.dispatchEvent(new CustomEvent("qc:openProfile", { detail: opts }));

  // --- Handlers: prefer props, fall back to legacy events ---
  const askHandler = typeof onAskClick === "function" ? onAskClick : legacyOpenQuestion;

  // onTryPost may receive an optional draft; preserve that when falling back
  const postHandler =
    typeof onTryPost === "function"
      ? onTryPost
      : () => {
          // legacy opens the question modal (no draft support in legacy path)
          legacyOpenQuestion();
        };

  // createSpace handler may be passed a prefill name
  const createSpaceHandler =
    typeof onCreateSpace === "function"
      ? onCreateSpace
      : (prefill = "") => {
          legacyOpenSpace(prefill);
        };

  const profileHandler =
    typeof onProfileClick === "function"
      ? onProfileClick
      : (opts = {}) => legacyOpenProfile(opts);

  return (
    <div className="container homepage-container">
      <div className="row g-4">
        {/* LEFT: sticky column (spaces list scrolls; small footer pinned below) */}
        <aside className="col-lg-3 d-none d-lg-block homepage-sidebar">
          <div className="sidebar-sticky">
            <div className="spaces-scroll">
              {/* FilterSidebar should call onCreateSpaceClick when user wants to create a space */}
              <FilterSidebar onCreateSpaceClick={createSpaceHandler} onSpaceClick={() => {}} />
            </div>

            {/* small footer under spaces */}
            <div className="sidebar-footer-wrapper">
              <SidebarFooter />
            </div>
          </div>
        </aside>

        {/* CENTER: Ask box + Feed */}
        <section className="col-12 col-lg-6 homepage-main">
          <AskBox onAskClick={askHandler} onTryPost={postHandler} onProfileClick={profileHandler} />
          {/* pass handlers to Feed in case Feed/PostCard uses them (safe to pass even if unused) */}
          <Feed onTryPost={postHandler} onCreateSpace={createSpaceHandler} onProfileClick={profileHandler} />
        </section>

        {/* RIGHT (optional widgets) */}
        <aside className="col-lg-3 d-none d-lg-block">{/* future widgets */}</aside>
      </div>
    </div>
  );
}
