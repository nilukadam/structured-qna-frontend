// FILE: src/app/App.jsx
import React, { Suspense, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";

import Navbar from "../components/layout/Navbar";
import AppRoutes from "../routes/AppRoutes";

import QuestionModal from "../components/modals/QuestionModal";
import ProfileModal from "../components/modals/ProfileModal";
import ProfileNudge from "../components/modals/ProfileNudge";
import {
  isProfileComplete,
  shouldShowProfileNudge,
  snoozeProfileNudge,
} from "../components/util/isProfileCompleted";
import SpaceModal from "../components/modals/SpaceModal";
import LoginModal from "../components/modals/LoginModal";
import AuthRequiredPopup from "../components/modals/AuthRequiredPopup";

import { useFeed } from "../hooks/useFeed";
import { useAuth } from "../hooks/useAuth";
import ErrorBoundary from "../components/util/ErrorBoundry"; // keep as-is (file name in your repo)

/**
 * App — application root
 *
 * Responsibilities:
 * - Mount Navbar, main routes and global modals
 * - Provide small gates for auth and profile-completion
 * - Wire feed actions (addQuestion/addSpace/addNotification) to UI events
 * - Show toasts on success/failure
 *
 * Notes:
 * - Uses local in-memory state to control modals & nudge flow.
 * - Auth gating will show an auth popup and store the last action to run after login.
 */

export default function App() {
  // --- modal / UI state ---
  const [questionOpen, setQuestionOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileEditIntent, setProfileEditIntent] = useState(false);
  const [spaceOpen, setSpaceOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [spaceInitialName, setSpaceInitialName] = useState("");
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [questionDraft, setQuestionDraft] = useState(null);

  // Profile nudge / pending actions
  const [showNudge, setShowNudge] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // function or null

  const navigate = useNavigate();
  const { addQuestion, addSpace, addNotification } = useFeed();
  const { isAuthenticated, user, updateProfile, logout } = useAuth();

  // --- Helper: require auth to run an action ---
  const requireAuth = useCallback(
    (fn) => {
      if (!isAuthenticated) {
        // store the intended action and show auth prompt
        setPendingAction(() => fn);
        setShowAuthPopup(true);
        toast("Please login to continue");
        return false;
      }
      // run action immediately if authed
      try {
        fn?.();
      } catch (err) {
        // swallow (UI components should handle their own errors)
        console.error(err);
      }
      return true;
    },
    [isAuthenticated]
  );

  // --- Helper: ensure profile completion before actions (if applicable) ---
  const gateWithProfile = useCallback(
    (action) => {
      if (!isAuthenticated) {
        return requireAuth(action);
      }

      if (!isProfileComplete(user) && shouldShowProfileNudge()) {
        // prompt the user to complete profile before proceeding
        setPendingAction(() => action);
        setShowNudge(true);
        return false;
      }

      try {
        action?.();
      } catch (err) {
        console.error(err);
      }
      return true;
    },
    [isAuthenticated, user, requireAuth]
  );

  // --- Openers (use gateWithProfile where we want profile checks) ---
  const openQuestion = useCallback(() => gateWithProfile(() => setQuestionOpen(true)), [gateWithProfile]);

  const handleProfileClick = useCallback(
    (edit = false) => {
      // require auth; if authed, open profile modal
      requireAuth(() => {
        setProfileEditIntent(Boolean(edit));
        setProfileOpen(true);
      });
    },
    [requireAuth]
  );

  const handleOpenCreateSpace = useCallback(
    (prefill = "") => gateWithProfile(() => {
      setSpaceInitialName(prefill || "");
      setSpaceOpen(true);
    }),
    [gateWithProfile]
  );

  const handleTryPost = useCallback(
    (draft) => {
      // store draft for modal; try open modal (requires auth & profile)
      setQuestionDraft(draft || null);
      return gateWithProfile(() => setQuestionOpen(true));
    },
    [gateWithProfile]
  );

  // --- Submit handlers that call FeedContext actions ---
  const handleQuestionSubmit = useCallback(
    (payload) => {
      try {
        const created = addQuestion(payload);
        addNotification({
          text: `Your ${created.title ? "question" : "post"} was published`,
          type: "question",
        });
        toast.success("Published successfully");
        setQuestionDraft(null);
        setQuestionOpen(false);
      } catch (err) {
        console.error(err);
        toast.error("Failed to publish");
      }
    },
    [addQuestion, addNotification]
  );

  const handleCreateSpace = useCallback(
    (space) => {
      try {
        const created = addSpace(space);
        if (created?.name) {
          addNotification({ text: `New space "${created.name}" created`, type: "space" });
          toast.success(`Space "${created.name}" created`);
          navigate(`/spaces?topic=${encodeURIComponent(created.name)}`);
        } else {
          navigate("/spaces");
        }
        setSpaceOpen(false);
      } catch (err) {
        console.error(err);
        toast.error("Failed to create space");
      }
    },
    [addSpace, addNotification, navigate]
  );

  // --- Global event listeners for inter-component communication ---
  useEffect(() => {
    const onOpenQuestion = () => gateWithProfile(() => setQuestionOpen(true));
    const onOpenSpace = () => gateWithProfile(() => setSpaceOpen(true));
    const onOpenLogin = () => setLoginOpen(true);
    const onOpenProfile = (e) => {
      const wantsEdit = !!(e && e.detail && e.detail.edit);
      handleProfileClick(wantsEdit);
    };
    const onLogout = () => {
      try {
        logout();
        toast.success("Logged out");
      } catch (error) {
        // make sure we reference the same identifier
        console.error(error);
        toast.error("Failed to logout");
      }
    };

    window.addEventListener("qc:openQuestion", onOpenQuestion);
    window.addEventListener("qc:openSpaceModal", onOpenSpace);
    window.addEventListener("qc:openLogin", onOpenLogin);
    window.addEventListener("qc:openProfile", onOpenProfile);
    window.addEventListener("qc:logout", onLogout);

    return () => {
      window.removeEventListener("qc:openQuestion", onOpenQuestion);
      window.removeEventListener("qc:openSpaceModal", onOpenSpace);
      window.removeEventListener("qc:openLogin", onOpenLogin);
      window.removeEventListener("qc:openProfile", onOpenProfile);
      window.removeEventListener("qc:logout", onLogout);
    };
  }, [gateWithProfile, handleProfileClick, logout]);

  // --- After successful login: run stored pending action (if any) and show nudge if needed ---
  const handleLoginSuccess = useCallback(() => {
    setLoginOpen(false);
    // run stored pending action (if present)
    setTimeout(() => {
      setPendingAction((fn) => {
        if (typeof fn === "function") {
          try {
            fn();
          } catch (err) {
            console.error(err);
          }
        }
        return null;
      });
    }, 0);

    setShowAuthPopup(false);
    toast.success("Welcome back!");

    // If profile incomplete and not snoozed — show nudge
    if (!isProfileComplete(user) && shouldShowProfileNudge()) {
      setShowNudge(true);
    }
  }, [user]);

  // --- Profile nudge handlers ---
  const onNudgeUpdateNow = useCallback(() => {
    setShowNudge(false);
    setProfileEditIntent(true);
    setProfileOpen(true);
  }, []);

  const onNudgeSkip = useCallback(
    (shouldProceed = true) => {
      snoozeProfileNudge(7); // don't show nudge for 7 days
      setShowNudge(false);

      if (shouldProceed && typeof pendingAction === "function") {
        const fn = pendingAction;
        setPendingAction(null);
        try {
          fn();
        } catch (err) {
          console.error(err);
        }
      } else {
        setPendingAction(null);
      }
    },
    [pendingAction]
  );

  // --- Render ---
  return (
    <>
      <Navbar
        onAddQuestionClick={openQuestion}
        onProfileClick={(opts) => {
          const edit = opts === true || (opts && opts.edit === true);
          handleProfileClick(edit);
        }}
        onCreateSpace={(name) => handleOpenCreateSpace(name)}
        onLoginClick={() => setLoginOpen(true)}
      />

      {/* Global Toaster */}
      <Toaster position="top-right" />

      {/* Main content: container wrapper */}
      <main className="container my-4 app-main" style={{ minHeight: "70vh", paddingTop: "72px" }}>
        <ErrorBoundary>
          <Suspense fallback={<div className="text-center my-5">Loading...</div>}>
            <AppRoutes
              onAskClick={openQuestion}
              onTryPost={(draft) => handleTryPost(draft)}
              onCreateSpace={(name) => handleOpenCreateSpace(name)}
              onProfileClick={(opts) => {
                const edit = opts === true || (opts && opts.edit === true);
                handleProfileClick(edit);
              }}
            />
          </Suspense>
        </ErrorBoundary>
      </main>

      {/* Modals */}
      <QuestionModal
        isOpen={questionOpen}
        onClose={() => {
          setQuestionOpen(false);
          setQuestionDraft(null);
        }}
        onSubmit={handleQuestionSubmit}
        initialDraft={questionDraft}
      />

      <SpaceModal
        isOpen={spaceOpen}
        initialName={spaceInitialName}
        onClose={() => setSpaceOpen(false)}
        onCreate={handleCreateSpace}
      />

      <ProfileModal
        isOpen={profileOpen}
        editMode={profileEditIntent}
        onClose={() => {
          setProfileOpen(false);
          setProfileEditIntent(false);
        }}
        onSave={(profile) => {
          updateProfile(profile);
          toast.success("Profile updated successfully 🎉");
          setProfileOpen(false);
        }}
        initialProfile={{
          name: user?.name || "",
          email: user?.email || "",
          bio: user?.bio || "",
          location: user?.location || "",
          avatar: user?.avatar || "",
        }}
      />

      <LoginModal
        isOpen={loginOpen}
        onClose={() => {
          setLoginOpen(false);
          setPendingAction(null);
        }}
        onSuccess={() => handleLoginSuccess()}
      />

      <AuthRequiredPopup
        show={showAuthPopup}
        onClose={() => setShowAuthPopup(false)}
        onOpenLogin={() => {
          setShowAuthPopup(false);
          setLoginOpen(true);
        }}
      />

      <ProfileNudge
        show={showNudge}
        onClose={() => onNudgeSkip(false)}
        onSkip={() => onNudgeSkip(true)}
        onUpdateNow={onNudgeUpdateNow}
      />
    </>
  );
}
