// FILE: src/context/AuthContext.jsx
import React, { createContext, useEffect, useState } from "react";

/**
 * AuthContext (frontend mock)
 * ---------------------------
 * - Stores auth user in localStorage
 * - Provides register, login, logout, updateProfile
 * - Exposes `user` + `isAuthenticated`
 * - Used by useAuth() hook (separate file)
 */

export const AuthContext = createContext(null);
const LS_KEY = "authUser";

// Safe ID generator
const generateId = () => {
  try {
    return crypto?.randomUUID?.() || String(Date.now());
  } catch {
    return String(Date.now());
  }
};

// Normalize user object
function normalizeUser(u = {}) {
  return {
    id: String(u.id ?? u.email ?? generateId()),
    email: u.email ?? "",
    name: u.name ?? "",
    bio: u.bio ?? "",
    location: u.location ?? "",
    avatar: u.avatar ?? "/assets/profiles/nilu.jpg",
    createdAt: u.createdAt ?? new Date().toISOString(),
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const isAuthenticated = !!user;

  // Load from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setUser(normalizeUser(JSON.parse(raw)));
    } catch {
      setUser(null);
    }
  }, []);

  // Persist to localStorage
  useEffect(() => {
    try {
      if (user) localStorage.setItem(LS_KEY, JSON.stringify(user));
      else localStorage.removeItem(LS_KEY);
    } catch {}
  }, [user]);

  // Registration (demo only)
  const register = (payload = {}) => {
    const newUser = normalizeUser(payload);
    setUser(newUser);
    return newUser;
  };

  // Login (merge with stored profile)
  const login = ({ email, password } = {}) => {
    if (!email || !password) throw new Error("Email and password are required");
    if (password.length < 6) throw new Error("Password must be at least 6 characters");

    let existing = null;
    try {
      const raw = localStorage.getItem(LS_KEY);
      existing = raw ? JSON.parse(raw) : null;
    } catch {}

    const merged = normalizeUser({ ...(existing || {}), email });
    setUser(merged);
    return merged;
  };

  const logout = () => setUser(null);

  // Update profile
  const updateProfile = (patch = {}) => {
    setUser((prev) => normalizeUser({ ...(prev || {}), ...(patch || {}) }));
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, register, login, logout, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}
