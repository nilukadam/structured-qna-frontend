// FILE: src/data/index.js
// =====================================================
// Unified Data Index for the Quora Clone (Final Version)
// -----------------------------------------------------
// This file provides consistent, named exports for all
// dummy data used throughout the frontend.
// No top-level awaits or wildcard imports — clean & static.
// =====================================================

// 🔹 Core data exports (each of these files must use named exports)
export { postsData as posts } from "./postsData";
export { spacesData as spaces } from "./spacesData";
export { notificationsData as notifications } from "./notificationsData";
export { followingData as following } from "./followingData";

// 🔹 Optional / Extended data (only if you have these files)
export { usersData as users } from "./usersData"; // or create if missing
export { trendingTopics } from "./trendingTopics"; // for Navbar search or sidebar
export { searchSpacesMap } from "./searchSpacesMap"; // for Navbar search suggestions

// =====================================================
// 🧠 Notes:
// - Each imported file (e.g., postsData.js) should export
//   its data using **named export** (not default):
//     👉 export const postsData = [ ... ];
//
// - The FeedContext.jsx will now reliably load from these
//   seeds whenever localStorage is cleared or missing.
//
// - You can safely clear your localStorage and refresh to
//   verify that all data (posts, spaces, notifications, etc.)
//   loads instantly again.
// =====================================================
