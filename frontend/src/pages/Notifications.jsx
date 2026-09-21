import { useEffect, useState } from "react";
import {
  Bell,
  MessageCircle,
  CalendarDays,
  Check,
  Building2,
  UserRound,
  CheckCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api";
import "./Notifications.css";

export default function Notifications() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  /* ============================================================
     LOAD NOTIFICATIONS
  ============================================================ */

  const loadNotifications = async () => {
    try {
      setLoading(true);

      const data = await apiFetch("/notifications");

      setNotifications(data.notifications || []);

      const unread = (data.notifications || []).filter(
        (notification) => !notification.is_read
      ).length;

      setUnreadCount(unread);
    } catch (error) {
      console.error(
        "Failed to load notifications:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  /* ============================================================
     LOAD UNREAD COUNT
  ============================================================ */

  const loadUnreadCount = async () => {
    try {
      const data = await apiFetch(
        "/notifications/unread-count"
      );

      setUnreadCount(data.count || 0);
    } catch (error) {
      console.error(
        "Failed to load unread count:",
        error
      );
    }
  };

  /* ============================================================
     INITIAL LOAD
  ============================================================ */

  useEffect(() => {
    loadNotifications();

    const interval = setInterval(() => {
      loadUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  /* ============================================================
     MARK SINGLE NOTIFICATION AS READ
  ============================================================ */

  const markAsRead = async (notification) => {
    if (!notification.id || notification.is_read) {
      return;
    }

    try {
      await apiFetch(
        `/notifications/${notification.id}/read`,
        {
          method: "PUT",
        }
      );

      setNotifications((previous) =>
        previous.map((item) =>
          item.id === notification.id
            ? {
                ...item,
                is_read: true,
              }
            : item
        )
      );

      setUnreadCount((previous) =>
        Math.max(previous - 1, 0)
      );
    } catch (error) {
      console.error(
        "Failed to mark notification as read:",
        error
      );
    }
  };

  /* ============================================================
     MARK ALL AS READ
  ============================================================ */

  const markAllAsRead = async () => {
    if (unreadCount === 0) {
      return;
    }

    try {
      await apiFetch(
        "/notifications/read-all",
        {
          method: "PUT",
        }
      );

      setNotifications((previous) =>
        previous.map((item) => ({
          ...item,
          is_read: true,
        }))
      );

      setUnreadCount(0);
    } catch (error) {
      console.error(
        "Failed to mark all notifications as read:",
        error
      );
    }
  };

  /* ============================================================
     NOTIFICATION CLICK
  ============================================================ */

  const handleNotificationClick = async (
    notification
  ) => {
    await markAsRead(notification);

    /*
      Project enquiry/chat
    */

    if (
      notification.reference_type ===
      "project_enquiry"
    ) {
      navigate(
        `/project-enquiries/${notification.reference_id}/chat`
      );

      return;
    }

    /*
      Property enquiry
    */

    if (
      notification.reference_type ===
      "property_enquiry"
    ) {
      /*
        Keep the notification page open for now.
        Property enquiry navigation can be connected
        to your existing property enquiry page later.
      */

      return;
    }
  };

  /* ============================================================
     ICON
  ============================================================ */

  const getNotificationIcon = (type) => {
    switch (type) {
      case "property_enquiry":
        return <Building2 size={18} />;

      case "property_chat":
        return <MessageCircle size={18} />;

      case "project_enquiry":
        return <Building2 size={18} />;

      case "project_chat":
        return <MessageCircle size={18} />;

      case "property_enquiry_status":
      case "project_enquiry_status":
        return <Check size={18} />;

      case "visit":
        return <CalendarDays size={18} />;

      case "enquiry":
      case "chat":
        return <MessageCircle size={18} />;

      default:
        return <Bell size={18} />;
    }
  };

  /* ============================================================
     FORMAT DATE
  ============================================================ */

  const formatDate = (date) => {
    if (!date) {
      return "";
    }

    return new Date(date).toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  return (
    <div className="notifications-page">
      <div className="notifications-container">

        {/* ======================================================
            HEADER
        ====================================================== */}

        <div className="notifications-header">
          <span>ACTIVITY CENTER</span>

          <h1>
            Notifications<span>.</span>
          </h1>

          <p>
            Stay updated on enquiries, visits and
            conversations.
          </p>

          {unreadCount > 0 && (
            <div className="notifications-header-actions">
              <span className="notifications-unread-count">
                {unreadCount} unread
              </span>

              <button
                type="button"
                className="notifications-mark-all"
                onClick={markAllAsRead}
              >
                <CheckCheck size={16} />
                Mark all as read
              </button>
            </div>
          )}
        </div>

        {/* ======================================================
            CONTENT
        ====================================================== */}

        {loading ? (
          <div className="notifications-empty">
            <Bell size={30} />
            <h2>
              Loading notifications...
            </h2>
          </div>
        ) : notifications.length === 0 ? (
          <div className="notifications-empty">
            <Bell size={30} />

            <h2>
              You're all caught up
            </h2>

            <p>
              New enquiries and messages will
              appear here.
            </p>
          </div>
        ) : (
          <div className="notifications-list">
            {notifications.map(
              (notification, index) => (
                <button
                  type="button"
                  className={`notification-card ${
                    notification.is_read
                      ? "read"
                      : "unread"
                  }`}
                  key={
                    notification.id ||
                    `${notification.type}-${notification.reference_id}-${index}`
                  }
                  onClick={() =>
                    handleNotificationClick(
                      notification
                    )
                  }
                >
                  <div className="notification-icon">
                    {getNotificationIcon(
                      notification.type
                    )}
                  </div>

                  <div className="notification-card-content">
                    <div className="notification-card-title">
                      <strong>
                        {notification.title}
                      </strong>

                      {!notification.is_read && (
                        <span className="notification-new-dot" />
                      )}
                    </div>

                    <p>
                      {notification.message}
                    </p>

                    <span>
                      {formatDate(
                        notification.created_at
                      )}
                    </span>
                  </div>

                  {notification.is_read && (
                    <Check
                      className="notification-read-icon"
                      size={14}
                    />
                  )}
                </button>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}