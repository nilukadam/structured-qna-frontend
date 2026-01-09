// FILE: src/components/modals/LoginModal.jsx
// LoginModal (frontend mock)
// - Frontend-only auth UI that uses useAuth().login (persisted to localStorage)
// - Props:
//    - isOpen: boolean
//    - onClose: () => void
//    - onSuccess: () => void  (called after successful login/signup)
// - Behavior: trap focus lightly by focusing first field, close on Escape, lock page scroll while open.
// - Note: this is intentionally minimal (no heavy focus-trap lib) but accessible and robust.

import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import "../../styles/LoginModal.css";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "react-hot-toast";

export default function LoginModal({ isOpen, onClose, onSuccess }) {
  const { login } = useAuth();

  // Tab: 'login' | 'signup'
  const [tab, setTab] = useState("login");

  // login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // signup state
  const [name, setName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const firstFieldRef = useRef(null);
  const prevActiveElement = useRef(null);

  // When modal opens/closes: focus management & scroll lock
  useEffect(() => {
    if (isOpen) {
      prevActiveElement.current = document.activeElement;
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
  
      const timer = setTimeout(() => firstFieldRef.current?.focus?.(), 80);
  
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = prevOverflow || "";
        try {
          prevActiveElement.current?.focus?.();
        } catch (err) {
          void err;// ignore focus restore errors
        }
      };
    } else {
      // Reset form state when closed
      setLoginEmail("");
      setLoginPassword("");
      setName("");
      setSignupEmail("");
      setSignupPassword("");
      setConfirmPassword("");
      setError("");
      setLoading(false);
      setTab("login");
    }
  }, [isOpen]);

  // Focus first field when tab changes
  useEffect(() => {
    if (!isOpen) return;
    setTimeout(() => firstFieldRef.current?.focus?.(), 80);
  }, [tab, isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") {
        onClose?.();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Handlers
  const handleLoginSubmit = async (e) => {
    e?.preventDefault?.();
    setError("");
    if (!loginEmail.trim() || !loginPassword) {
      setError("Please enter email and password.");
      return;
    }
    setLoading(true);
    try {
      await login({ email: loginEmail.trim(), password: loginPassword });
      toast.success("Logged in");
      try {
        await onSuccess?.();
      } catch { /* ignore parent callback errors */ }
      onClose?.();
    } catch (err) {
      setError(err?.message || "Login failed.");
      toast.error(err?.message || "Invalid credentials");
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e?.preventDefault?.();
    setError("");
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!signupEmail.trim() || !signupPassword) {
      setError("Please enter email and password.");
      return;
    }
    if (signupPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (signupPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      // For frontend-only demo, login() acts as registration/merge
      await login({ email: signupEmail.trim(), password: signupPassword, name: name.trim() });
      toast.success("Account created");
      try {
        await onSuccess?.();
      } catch { /* ignore */ }
      onClose?.();
    } catch (err) {
      setError(err?.message || "Create account failed.");
      toast.error(err?.message || "Create account failed");
      setLoading(false);
    }
  };

  return (
    <div className="lm-backdrop" role="dialog" aria-modal="true" aria-labelledby="lm-title">
      <div className="lm-card" role="document">
        <button className="lm-close" onClick={onClose} aria-label="Close">
          ×
        </button>

        <div className="lm-tabs" role="tablist" aria-label="Login or Create Account">
          <button
            role="tab"
            aria-selected={tab === "login"}
            className={`lm-tab ${tab === "login" ? "active" : ""}`}
            onClick={() => setTab("login")}
            id="tab-login"
            type="button"
          >
            Existing user
          </button>
          <button
            role="tab"
            aria-selected={tab === "signup"}
            className={`lm-tab ${tab === "signup" ? "active" : ""}`}
            onClick={() => setTab("signup")}
            id="tab-signup"
            type="button"
          >
            Create new account
          </button>
        </div>

        {tab === "login" ? (
          <form className="lm-form" onSubmit={handleLoginSubmit} aria-labelledby="tab-login">
            <h3 id="lm-title">Welcome back</h3>

            {error && <div className="lm-error" role="alert">{error}</div>}

            <label className="lm-label">
              Email
              <input
                ref={firstFieldRef}
                type="email"
                placeholder="you@example.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
                className="lm-input"
                autoComplete="username"
              />
            </label>

            <label className="lm-label">
              Password
              <input
                type="password"
                placeholder="••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
                className="lm-input"
                autoComplete="current-password"
              />
            </label>

            <button type="submit" className="lm-primary" disabled={loading}>
              {loading ? "Signing in…" : "Log in"}
            </button>
          </form>
        ) : (
          <form className="lm-form" onSubmit={handleSignupSubmit} aria-labelledby="tab-signup">
            <h3 id="lm-title">Create your account</h3>

            {error && <div className="lm-error" role="alert">{error}</div>}

            <label className="lm-label">
              Name
              <input
                ref={firstFieldRef}
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="lm-input"
                autoComplete="name"
              />
            </label>

            <label className="lm-label">
              Email
              <input
                type="email"
                placeholder="you@example.com"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                required
                className="lm-input"
                autoComplete="email"
              />
            </label>

            <label className="lm-label">
              Password
              <input
                type="password"
                placeholder="Minimum 6 characters"
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                required
                className="lm-input"
                minLength={6}
                autoComplete="new-password"
              />
            </label>

            <label className="lm-label">
              Confirm password
              <input
                type="password"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="lm-input"
                minLength={6}
                autoComplete="new-password"
              />
            </label>

            <button type="submit" className="lm-primary" disabled={loading}>
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

LoginModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  onSuccess: PropTypes.func,
};
LoginModal.defaultProps = {
  isOpen: false,
  onClose: () => {},
  onSuccess: () => {},
};
