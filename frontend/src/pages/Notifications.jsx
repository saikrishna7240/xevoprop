import { useEffect, useState } from "react";
import {
  Bell,
  MessageCircle,
  CalendarDays,
  Check,
  Building2,
  CheckCheck,
  ShieldCheck,
  SlidersHorizontal,
  Search,
  FileText,
  Video,
  Headphones,
  Handshake,
  CircleCheck,
  ChevronRight,
  LockKeyhole,
  BarChart3,
  MapPin,
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

  const handleNotificationClick = async (notification) => {
  await markAsRead(notification);

  // Project enquiry
  if (
    notification.reference_type ===
    "project_enquiry"
  ) {
    navigate(
      `/project-enquiries/${notification.reference_id}/chat`
    );
    return;
  }

  // Property enquiry
  if (
    notification.reference_type ===
    "property_enquiry"
  ) {
    return;
  }

  // Project approval
  if (
    notification.reference_type ===
    "project_approval"
  ) {
    navigate(
      `/admin/projects`
    );
    return;
  }

  // Property approval
  if (
    notification.reference_type ===
    "property_approval"
  ) {
    navigate(
      `/admin/properties`
    );
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

  /* ============================================================
     NOTIFICATION TYPE LABEL
  ============================================================ */

  const getNotificationType = (notification) => {
  const type = String(
    notification?.type || ""
  ).toLowerCase();

  if (
    type === "property_approval"
  ) {
    return "PROPERTY APPROVAL";
  }

  if (
    type === "project_approval"
  ) {
    return "PROJECT APPROVAL";
  }

  if (
    type.includes("property")
  ) {
    return "PROPERTY ENQUIRY";
  }

  if (
    type.includes("project")
  ) {
    return "PROJECT ENQUIRY";
  }

  if (
    type.includes("visit")
  ) {
    return "SITE INSPECTION";
  }

  if (
    type.includes("chat") ||
    type.includes("message")
  ) {
    return "PROJECT CHAT";
  }

  return "SYSTEM ACTIVITY";
};
  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <div className="notifications-page">

      {/* ======================================================
          TOP NAVIGATION
      ====================================================== */}

      

      {/* ======================================================
          PAGE
      ====================================================== */}

      <main className="notifications-container">

        {/* ====================================================
            BREADCRUMB
        ==================================================== */}

        <div className="notifications-workspace-bar">

          <div className="notifications-breadcrumb">
            <span>▦</span>
            <span>Workspace</span>
            <b>/</b>
            <strong>Activity & Audits</strong>
          </div>

          <div className="notifications-engine-status">
            <span />
            Real-time Engine Active
          </div>

         

        </div>

        {/* ====================================================
            MAIN GRID
        ==================================================== */}

        <section className="notifications-layout">

          {/* ==================================================
              LEFT COLUMN
          ================================================== */}

          <div className="notifications-main">

            {/* ================================================
                ACTIVITY HEADER
            ================================================ */}

            <section className="notifications-activity-card">

              <div className="notifications-activity-top">

                <div>

                  <div className="notifications-kicker-row">
                    <span className="notifications-kicker">
                      ACTIVITY CENTER
                    </span>

                    <span className="notifications-monitored">
                      <ShieldCheck size={13} />
                      RERA Monitored
                    </span>
                  </div>

                  <h1>
                    Notifications<span>.</span>
                  </h1>

                  <p>
                    Stay updated on verified buyer
                    enquiries, physical site visits,
                    and developer negotiations.
                  </p>

                </div>

                <div className="notifications-header-actions">

                  <span className="notifications-unread-count">
                    {unreadCount} unread
                  </span>

                  <button
                    type="button"
                    className="notifications-mark-all"
                    onClick={markAllAsRead}
                    disabled={unreadCount === 0}
                  >
                    <CheckCheck size={15} />
                    Mark all as read
                  </button>

                </div>

              </div>

              {/* FILTER BAR */}

              

            </section>

            {/* ================================================
                NOTIFICATIONS
            ================================================ */}

            {loading ? (

              <div className="notifications-state-card">

                <Bell size={28} />

                <h2>
                  Loading notifications...
                </h2>

                <p>
                  Checking your latest activity.
                </p>

              </div>

            ) : notifications.length === 0 ? (

              <div className="notifications-state-card">

                <Bell size={28} />

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

                        <div className="notification-meta-row">

                          <span className="notification-type">

                            {!notification.is_read && (
                              <span className="notification-new-dot" />
                            )}

                            {getNotificationType(
                              notification
                            )}

                          </span>

                          <span className="notification-meta-divider">
                            •
                          </span>

                          <span className="notification-reference">
                            {notification.reference_type
                              ?.replaceAll(
                                "_",
                                " "
                              )}
                          </span>

                        </div>

                        <div className="notification-card-title">

                          <strong>
                            {notification.title}
                          </strong>

                          <span className="notification-date">
                            {formatDate(
                              notification.created_at
                            )}
                          </span>

                        </div>

                        <p>
                          {notification.message}
                        </p>

                        <div className="notification-card-bottom">
                          {notification.reference_type ===
  "project_approval" && (
  <span className="notification-action-tag">
    <Building2 size={12} />
    Review Project
  </span>
)}

{notification.reference_type ===
  "property_approval" && (
  <span className="notification-action-tag">
    <Building2 size={12} />
    Review Property
  </span>
)}

                          {notification.reference_type ===
                            "project_enquiry" && (
                            <span className="notification-action-tag">
                              <MessageCircle
                                size={12}
                              />
                              Direct Chat
                            </span>
                          )}

                          {notification.reference_type ===
                            "property_enquiry" && (
                            <span className="notification-action-tag">
                              <FileText
                                size={12}
                              />
                              View Enquiry
                            </span>
                          )}

                          {notification.type ===
                            "visit" && (
                            <span className="notification-action-tag">
                              <CalendarDays
                                size={12}
                              />
                              View Schedule
                            </span>
                          )}

                        </div>

                      </div>

                      {notification.is_read && (
                        <Check
                          className="notification-read-icon"
                          size={15}
                        />
                      )}

                    </button>

                  )
                )}

              </div>

            )}

            {/* ================================================
                SECURITY NOTE
            ================================================ */}

            <div className="notifications-security-note">

              <LockKeyhole size={15} />

              <span>
                All activity feeds are secured under
                Xevoprop Bank-Grade AES-256 telemetry.
              </span>

              <button type="button">
                Notification settings & email digests
                <ChevronRight size={14} />
              </button>

            </div>

          </div>

          
        </section>

      </main>

      
    </div>
  );
}