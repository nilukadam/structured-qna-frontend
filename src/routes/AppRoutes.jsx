// FILE: src/routes/AppRoutes.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// === Core feature pages ===
import HomePage from "../features/Home/HomePage";
import AnswersPage from "../features/answers/AnswersPage";
import FollowingPage from "../features/following/FollowingPage";
import SpacesPage from "../features/spaces/SpacesPage";
import NotificationsPage from "../features/notifications/NotificationsPage";
import ProfilePage from "../features/profiles/ProfilePage";

/**
 * AppRoutes
 * ---------------------------------------------------------
 * Central routing component for the entire app.
 *
 * It defines all top-level routes and passes handler props
 * down to pages that need them (especially HomePage).
 *
 * Props injected by <App />:
 *  - onAskClick: open Ask modal
 *  - onTryPost: open Question modal with draft
 *  - onCreateSpace: open Create Space modal
 *  - onProfileClick: open Profile modal
 *
 * Note: Using <Navigate> for catch-all ensures any unknown
 * path redirects gracefully to home.
 */
export default function AppRoutes({
  onAskClick,
  onTryPost,
  onCreateSpace,
  onProfileClick,
}) {
  return (
    <Routes>
      {/* === Home === */}
      <Route
        path="/"
        element={
          <HomePage
            onAskClick={onAskClick}
            onTryPost={onTryPost}
            onCreateSpace={onCreateSpace}
            onProfileClick={onProfileClick}
          />
        }
      />

      {/* === Answers (search / Q&A results) === */}
      <Route path="/answers" element={<AnswersPage />} />

      {/* === Following (feed of followed authors/spaces) === */}
      <Route path="/following" element={<FollowingPage />} />

      {/* === Spaces === */}
      <Route path="/spaces" element={<SpacesPage />} />
      <Route path="/spaces/:spaceId" element={<SpacesPage />} />

      {/* === Notifications === */}
      <Route path="/notifications" element={<NotificationsPage />} />

      {/* === Profile (current user view) === */}
      <Route path="/profile" element={<ProfilePage />} />

      {/* === Catch-all redirect === */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
