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

  const handleNotificationClick = async (
    notification
  ) => {
    await markAsRead(notification);

    if (
      notification.reference_type ===
      "project_enquiry"
    ) {
      navigate(
        `/project-enquiries/${notification.reference_id}/chat`
      );

      return;
    }

    if (
      notification.reference_type ===
      "property_enquiry"
    ) {
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

      <header className="notifications-topbar">

        <div className="notifications-brand">
          <div className="notifications-brand-mark">
            A
          </div>

          <div>
            <strong>XEVOPROP</strong>
            <span>VERIFIED PROPTECH</span>
          </div>
        </div>

        <div className="notifications-product-name">
          Xevoprop
        </div>

        <nav className="notifications-nav">

          <button type="button">
            ← Back to Marketplace
          </button>

          <button type="button">
            Secure Sign In
          </button>

          <button type="button">
            Create Account
          </button>

          <button type="button">
            RERA Verification
          </button>

          <button type="button">
            Data Security
          </button>

        </nav>

        <div className="notifications-security-pill">
          <ShieldCheck size={14} />
          256-bit SSL • RERA Verified
        </div>

        <div className="notifications-profile">
          <Building2 size={17} />
        </div>

      </header>

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

          <button
            type="button"
            className="notifications-preferences"
          >
            <SlidersHorizontal size={14} />
            Preferences
          </button>

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

              <div className="notifications-filter-bar">

                <button
                  type="button"
                  className="notification-filter active"
                >
                  All
                  <span>
                    ({notifications.length})
                  </span>
                </button>

                <button
                  type="button"
                  className="notification-filter"
                >
                  Unread
                  <span>
                    {unreadCount > 0
                      ? ` ${unreadCount}`
                      : ""}
                  </span>
                </button>

                <button
                  type="button"
                  className="notification-filter"
                >
                  Enquiries
                </button>

                <button
                  type="button"
                  className="notification-filter"
                >
                  Site Visits
                </button>

                <button
                  type="button"
                  className="notification-filter"
                >
                  System & Status
                </button>

                <div className="notifications-search">

                  <Search size={15} />

                  <input
                    type="text"
                    placeholder="Search notifications..."
                  />

                </div>

              </div>

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

          {/* ==================================================
              RIGHT COLUMN
          ================================================== */}

          <aside className="notifications-sidebar">

            {/* ================================================
                VERIFICATION MATRIX
            ================================================ */}

            <section className="verification-card">

              <div className="verification-header">

                <span>
                  VERIFICATION MATRIX
                </span>

                <i />

              </div>

              <div className="verification-stats">

                <div className="verification-stat">

                  <strong>99.4%</strong>

                  <span>
                    RERA Authenticity
                  </span>

                </div>

                <div className="verification-stat">

                  <strong>14m</strong>

                  <span>
                    Avg Agent Response
                  </span>

                </div>

              </div>

              <div className="verification-chart-header">

                <span>
                  Inquiry Volume (This Week)
                </span>

                <strong>
                  +28%
                </strong>

              </div>

              <div className="verification-chart">

                <svg
                  viewBox="0 0 400 100"
                  preserveAspectRatio="none"
                >

                  <path
                    d="M0 78 C35 75 55 82 90 76 C120 70 128 48 165 48 C205 48 205 56 238 51 C270 45 280 30 320 30 C350 30 370 32 400 25 L400 100 L0 100 Z"
                  />

                  <path
                    className="verification-line"
                    d="M0 78 C35 75 55 82 90 76 C120 70 128 48 165 48 C205 48 205 56 238 51 C270 45 280 30 320 30 C350 30 370 32 400 25"
                  />

                </svg>

              </div>

              <div className="verification-days">

                <span>Mon</span>
                <span>Wed</span>
                <span>Fri</span>
                <span>Sun</span>

              </div>

            </section>

            {/* ================================================
                FAST TRACK
            ================================================ */}

            <section className="fast-track-card">

              <div className="fast-track-top">

                <span>
                  <CircleCheck size={13} />
                  Fast Track Enquiry
                </span>

                <small>
                  Bangalore East
                </small>

              </div>

              <div className="fast-track-image">

                <div className="fast-track-overlay">

                  <strong>
                    The Grand Pavilion • 402
                  </strong>

                </div>

              </div>

              <div className="fast-track-price">

                <span>
                  Pending Buyer Decision
                </span>

                <strong>
                  ₹ 8.45 Cr
                </strong>

              </div>

              <p>
                Next scheduled virtual walk-through
                starts today at 04:00 PM with the
                principal architect.
              </p>

              <button
                type="button"
                className="fast-track-button"
              >
                <Video size={14} />
                Join Secure Virtual Room
              </button>

            </section>

            {/* ================================================
                CONCIERGE
            ================================================ */}

            <section className="concierge-card">

              <div className="concierge-icon">
                <Headphones size={17} />
              </div>

              <div>

                <h3>
                  Need Site Visit Logistics?
                </h3>

                <p>
                  Xevoprop Concierge coordinates
                  chauffeured property inspections
                  across Tier-1 luxury corridors.
                </p>

                <button type="button">
                  Request Concierge Call
                  <ChevronRight size={13} />
                </button>

              </div>

            </section>

          </aside>

        </section>

      </main>

      
    </div>
  );
}