// FILE: src/utils/fakeApi.js

/**
 * Simple mock API layer to simulate async network requests.
 * ---------------------------------------------------------
 * Used in demo mode to load local seed data with small delays,
 * mimicking realistic fetch timings for smoother UI skeletons.
 *
 * In production, replace these with real API calls (fetch/Axios).
 */

/**
 * Delay helper
 * @param {number} ms - base milliseconds to delay
 * @param {boolean} [jitter=false] - add small random variation
 */
const delay = (ms, jitter = false) =>
  new Promise((resolve) => {
    const time = jitter ? ms + Math.random() * ms * 0.2 : ms;
    setTimeout(resolve, time);
  });

/**
 * Fetch all posts (mock)
 * @returns {Promise<Array>} - resolves with posts array
 */
export async function fetchPosts() {
  try {
    const { posts } = await import("../data/index.js");
    await delay(400, true);
    return posts;
  } catch (err) {
    console.error("Failed to load posts:", err);
    return [];
  }
}

/**
 * Fetch all spaces (mock)
 * @returns {Promise<Array>} - resolves with spaces array
 */
export async function fetchSpaces() {
  try {
    const { spaces } = await import("../data/index.js");
    await delay(300, true);
    return spaces;
  } catch (err) {
    console.error("Failed to load spaces:", err);
    return [];
  }
}

/**
 * Fetch all notifications (mock)
 * @returns {Promise<Array>} - resolves with notifications array
 */
export async function fetchNotifications() {
  try {
    const { notifications } = await import("../data/index.js");
    await delay(300, true);
    return notifications;
  } catch (err) {
    console.error("Failed to load notifications:", err);
    return [];
  }
}
