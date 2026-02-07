// FILE: src/context/FeedContext.jsx
import React, { createContext, useEffect, useState } from "react";
import { v4 as uuid } from "uuid";
import {
  posts as seedPosts,
  spaces as seedSpaces,
  notifications as seedNotifications,
  following as seedFollowing,
} from "../data";

export const FeedContext = createContext(null);

/** 
 * FeedProvider
 * ------------
 * - Manages posts, spaces, notifications, following
 * - Persists to localStorage
 * - Emits notifications for comments, follows, etc.
 */
export function FeedProvider({ children }) {
  // Safe JSON reader
  const safeParse = (key, fallback) => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    } 
  };

  // State
  const [posts, setPosts] = useState(() => safeParse("feedPosts", seedPosts || []));
  const [spaces, setSpaces] = useState(() => safeParse("feedSpaces", seedSpaces || []));
  const [notifications, setNotifications] = useState(() =>
    safeParse("feedNotifications", seedNotifications || [])
  );
  const [following, setFollowing] = useState(() =>
    safeParse("qcFollowing", seedFollowing || [])
  );

  // Normalize post shapes on first load
  useEffect(() => {
    setPosts((prev) =>
      (prev || []).map((p, i) => {
        const id =
          p?.id ||
          p?._id ||
          `${i}-${(p?.title || "post").slice(0, 10)}-${Math.random()
            .toString(36)
            .slice(2, 7)}`;

        const commentsList = Array.isArray(p.commentsList)
          ? p.commentsList
          : Array.isArray(p.comments)
          ? p.comments
          : [];

        return {
          ...p,
          id: String(id),
          upvotes: Number(p.upvotes) || 0,
          downvotes: Number(p.downvotes) || 0,
          commentsList,
          comments: commentsList.length,
          __upvoted: !!p.__upvoted,
          __downvoted: !!p.__downvoted,
        };
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist states
  useEffect(() => {
    try {
      localStorage.setItem("feedPosts", JSON.stringify(posts));
    } catch {}
  }, [posts]);

  useEffect(() => {
    try {
      localStorage.setItem("feedSpaces", JSON.stringify(spaces));
    } catch {}
  }, [spaces]);

  useEffect(() => {
    try {
      localStorage.setItem("feedNotifications", JSON.stringify(notifications));
    } catch {}
  }, [notifications]);

  useEffect(() => {
    try {
      localStorage.setItem("qcFollowing", JSON.stringify(following));
    } catch {}
  }, [following]);

  // Get current user from auth storage
  const getCurrentUser = () => {
    try {
      return JSON.parse(localStorage.getItem("authUser")) || null;
    } catch {
      return null;
    }
  };

  // ------------------------ COMMENTS ------------------------
  const addComment = (postId, comment) => {
    if (!postId || !comment) return;

    let commentedPost = null;

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const list = [...p.commentsList, comment];
        const updated = { ...p, commentsList: list, comments: list.length };
        commentedPost = updated;
        return updated;
      })
    );

    try {
      const current = getCurrentUser();
      const postAuthor = commentedPost?.author?.id;

      if (postAuthor && current?.email && postAuthor !== current.email) {
        addNotification({
          text: `${current.name || "Someone"} commented on your post.`,
          type: "comment",
          from: { name: current.name, avatar: current.avatar },
        });
      }
    } catch {}
  };

  const deleteComment = (postId, commentId) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              commentsList: p.commentsList.filter((c) => c.id !== commentId),
              comments: p.comments - 1,
            }
          : p
      )
    );
  };

  // ------------------------ POSTS ------------------------
  const addQuestion = (payload = {}) => {
    const currentUser = getCurrentUser();

    const newPost = {
      id: uuid(),
      type: payload.type || "question",
      title: payload.title || null,
      content: payload.content || "",
      image: payload.image || null,
      font: payload.font || "inherit",
      author:
        payload.author ||
        (currentUser
          ? {
              id: currentUser.id,
              name: currentUser.name || "You",
              avatar: currentUser.avatar,
            }
          : null),
      createdAt: new Date().toISOString(),
      upvotes: 0,
      downvotes: 0,
      comments: 0,
      commentsList: [],
      followed: false,
      __upvoted: false,
      __downvoted: false,
    };

    setPosts((prev) => [newPost, ...prev]);
    return newPost;
  };

  const removePost = (id) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  const updatePostStats = (id, changes = {}) => {
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, ...changes } : p)));
  };

  // ------------------------ SPACES ------------------------
  const addSpace = (space = {}) => {
    const current = getCurrentUser();

    const newSpace = {
      id: uuid(),
      name: space.name || "",
      description: space.description || "",
      color: space.color || "#ddd",
      members: space.members || 1,
      createdAt: new Date().toISOString(),
      ownerId: current?.id || null,
    };

    setSpaces((prev) => [newSpace, ...prev]);

    // auto-join creator
    if (current) {
      setFollowing((prev) =>[
        { id: newSpace.id, name: newSpace.name},
        ...prev,
      ])
    }

    return newSpace;
  };

  const toggleJoinSpace = (space) => {
    if (!space?.id) return;
  
    const current = getCurrentUser();
    if (!current) return;
  
    let didJoin = false;
  
    setSpaces((prev) => {
      const exists = prev.find((s) => s.id === space.id);
      if (!exists) return prev;

      const isJoined = !!exists.__joined;
      didJoin = !isJoined;
  
      return prev.map((s) =>
        s.id === space.id
          ? {
              ...s,
              members: Math.max(0, (s.members || 0) + (isJoined ? -1 : 1)),
              __joined: !isJoined,
            }
          : s
      );
    });

    // ✅ SIDE-EFFECT OUTSIDE setState (RUNS ONCE)
    addNotification({
      text: didJoin
        ? `You joined the space "${space.name}"`
        : `You left the space "${space.name}"`,
      type: "space",
      from: { name: current.name, avatar: current.avatar },
    });
  };


  // ------------------------ NOTIFICATIONS ------------------------
  const addNotification = ({ text, type = "info", from } = {}) => {
    const current = getCurrentUser();
    const sender =
      from ||
      (current
        ? { name: current.name, avatar: current.avatar }
        : { name: "System", avatar: "/assets/profiles/nilu.jpg" });

    const notif = {
      id: uuid(),
      text: text || "New notification",
      type,
      from: sender,
      unread: true,
      read: false,
      createdAt: new Date().toISOString(),
    };

    setNotifications((prev) => [notif, ...prev]);
    return notif;
  };

  const markNotificationRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false, read: true } : n))
    );
  };

  const dismissNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, unread: false, read: true }))
    );
  };

  // ------------------------ VOTES ------------------------
  const upvotePost = (id) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const wasUp = p.__upvoted;
        const wasDown = p.__downvoted;

        return {
          ...p,
          upvotes: wasUp ? p.upvotes - 1 : p.upvotes + 1,
          downvotes: wasDown ? p.downvotes - 1 : p.downvotes,
          __upvoted: !wasUp,
          __downvoted: false,
        };
      })
    );
  };

  const downvotePost = (id) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const wasDown = p.__downvoted;
        const wasUp = p.__upvoted;

        return {
          ...p,
          downvotes: wasDown ? p.downvotes - 1 : p.downvotes + 1,
          upvotes: wasUp ? p.upvotes - 1 : p.upvotes,
          __downvoted: !wasDown,
          __upvoted: false,
        };
      })
    );
  };

  // ------------------------ FOLLOWING ------------------------
  const toggleFollowAuthor = (author) => {
    const current = getCurrentUser();
    if (!author?.id || !current) return;

    setFollowing((prev) => {
      const exists = prev.find((u) => u.id === author.id);

      const updated = exists
        ? prev.filter((u) => u.id !== author.id)
        : [{ id: author.id, name: author.name, avatar: author.avatar }, ...prev];

      setPosts((p) =>
        p.map((post) =>
          post.author?.id === author.id
            ? { ...post, followed: !exists }
            : post
        )
      );

      return updated;
    });
  };

  // ------------------------ PROVIDER ------------------------
  const value = {
    posts,
    spaces,
    notifications,
    following,
    addQuestion,
    removePost,
    updatePostStats,
    addComment,
    deleteComment,
    addSpace,
    addNotification,
    markNotificationRead,
    dismissNotification,
    markAllNotificationsRead,
    upvotePost,
    downvotePost,
    toggleFollowAuthor,
    toggleJoinSpace,
  };

  return <FeedContext.Provider value={value}>{children}</FeedContext.Provider>;
}
