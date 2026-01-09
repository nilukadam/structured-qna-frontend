// FILE: src/features/notifications/NotificationsPage.jsx
import React, { useMemo, useState } from "react";
import { useFeed } from "../../hooks/useFeed";
import { toast } from "react-hot-toast";
import { FaCheckCircle, FaRegBell, FaTimes, FaEnvelopeOpenText } from "react-icons/fa";
import "../../styles/Notifications.css";

export default function NotificationsPage() {
  const {
    notifications,
    markNotificationRead,
    dismissNotification,
    markAllNotificationsRead,
  } = useFeed();

  const [filter, setFilter] = useState("all");
  const [expandedIds, setExpandedIds] = useState({});

  const filtered = useMemo(() => {
    if (!notifications) return [];
    switch (filter) {
      case "unread": return notifications.filter((n) => n.unread === true);
      case "system": return notifications.filter((n) => n.type === "system");
      case "space": return notifications.filter((n) => n.type === "space");
      case "comment": return notifications.filter((n) => n.type === "comment");
      case "mention": return notifications.filter((n) => n.type === "mention");
      default: return notifications;
    }
  }, [notifications, filter]);

  const unreadCount = notifications.filter((n) => n.unread === true).length;

  const toggleExpand = (id) => setExpandedIds((p) => ({ ...p, [id]: !p[id] }));

  const handleMarkAll = () => {
    const changed = markAllNotificationsRead?.();
    if (changed) toast.success("All notifications marked as read"); else toast("Already up to date");
  };
  const handleMarkOne = (id) => { if (markNotificationRead?.(id)) toast.success("Marked as read"); };
  const handleDismiss = (id) => { if (dismissNotification?.(id)) toast("Dismissed"); };

  return (
    <div className="container mt-4">
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
        <h4 className="m-0 d-flex align-items-center gap-2">
          <FaRegBell /> Notifications
        </h4>
        <div className="text-muted small">
          {unreadCount > 0 ? `${unreadCount} unread` : "All caught up 🎉"}
        </div>
      </div>

      {/* Filters + Mark all */}
      <div className="mb-3 d-flex flex-wrap gap-2">
        {["all", "unread", "system", "space", "comment", "mention"].map((f) => (
          <button
            key={f}
            className={`btn btn-sm ${filter === f ? "btn-danger text-white" : "btn-outline-secondary"}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
        {unreadCount > 0 && (
          <button className="btn btn-sm btn-outline-success ms-auto" onClick={handleMarkAll}>
            <FaCheckCircle className="me-1" /> Mark all read
          </button>
        )}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="alert alert-info">No notifications found for this filter.</div>
      ) : (
        <ul className="list-unstyled">
          {filtered.map((n) => {
            const isExpanded = !!expandedIds[n.id];
            const isUnread = n.unread === true;
            const showToggle = n.text?.length > 120;
            const text = isExpanded || !showToggle ? n.text : `${n.text.slice(0, 120)}...`;

            return (
              <li
                key={n.id}
                className={`notification-item p-3 mb-2 rounded shadow-sm position-relative ${isUnread ? "unread" : ""}`}
              >
                {/* 🔴 unread badge */}
                {isUnread && <span className="notif-dot" aria-hidden="true"></span>}

                <div className="d-flex align-items-start justify-content-between">
                  <div className="d-flex align-items-start gap-2">
                    <img
                      src={n.from?.avatar || "/assets/profiles/nilu.jpg"}
                      alt={n.from?.name || "User"}
                      className="rounded-circle"
                      width={40}
                      height={40}
                    />
                    <div>
                      <p className="mb-1">
                        <strong>{n.from?.name === "You" ? "You" : n.from?.name || "Someone"}</strong>{" "}
                        <span className="text-muted small">• {n.type}</span>
                      </p>
                      <p className="small mb-1">{text}</p>
                      {showToggle && (
                        <button className="btn btn-link btn-sm p-0" onClick={() => toggleExpand(n.id)}>
                          {isExpanded ? "Show less" : "Read more"}
                        </button>
                      )}
                      <small className="text-muted">{new Date(n.createdAt).toLocaleString()}</small>
                    </div>
                  </div>

                  <div className="d-flex flex-column align-items-end gap-1">
                    {isUnread ? (
                      <button className="btn btn-sm btn-outline-success" onClick={() => handleMarkOne(n.id)}>
                        <FaEnvelopeOpenText className="me-1" /> Mark read
                      </button>
                    ) : (
                      <span className="badge bg-secondary align-self-center">Read</span>
                    )}
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => handleDismiss(n.id)} title="Dismiss">
                      <FaTimes />
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
