// FILE: src/components/cards/NotificationItem.jsx
import React from "react";
import PropTypes from "prop-types";

export default function NotificationItem({ item, onMarkRead, onDismiss }) {
  if (!item) return null;
  const { id, text = "", createdAt = "" } = item;
  const isUnread = item.unread !== undefined ? item.unread : !item.read;

  const when = (() => {
    if (!createdAt) return "";
    try { return new Date(createdAt).toLocaleString(); } catch { return ""; }
  })();

  return (
    <div
      className={`d-flex align-items-start justify-content-between p-3 mb-2 border rounded ${
        isUnread ? "bg-light" : "bg-white"
      }`}
      role="listitem"
      aria-live="polite"
    >
      <div className="me-3 flex-grow-1">
        <div className="fw-medium">{text || "Notification"}</div>
        <div className="text-muted small">{when}</div>
      </div>

      <div className="ms-3 d-flex align-items-center">
        <button
          className="btn btn-sm btn-outline-secondary me-2"
          onClick={() => onMarkRead?.(id)}
          type="button"
          aria-pressed={!isUnread}
          disabled={!isUnread}
          title={isUnread ? "Mark as read" : "Already read"}
        >
          {isUnread ? "Mark read" : "Read"}
        </button>
        <button className="btn btn-sm btn-outline-danger" onClick={() => onDismiss?.(id)} type="button">
          Dismiss
        </button>
      </div>
    </div>
  );
}

NotificationItem.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    text: PropTypes.string,
    type: PropTypes.string,
    createdAt: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    unread: PropTypes.bool, // preferred
    read: PropTypes.bool,   // legacy fallback
  }),
  onMarkRead: PropTypes.func,
  onDismiss: PropTypes.func,
};
