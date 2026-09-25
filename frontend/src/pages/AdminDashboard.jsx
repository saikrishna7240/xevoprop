import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock3,
  Home,
  LogOut,
  RefreshCw,
  ShieldCheck,
  Users,
  XCircle,
  TrendingUp,
} from "lucide-react";

import "./AdminDashboard.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://xevoprop.onrender.com/api";

const EMPTY_STATS = {
  users: 0,

  properties: {
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  },

  projects: {
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  },
};

function AdminDashboard() {
  const [stats, setStats] = useState(EMPTY_STATS);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getToken = () => {
    return localStorage.getItem("token");
  };
  const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  localStorage.removeItem("user");

  window.location.replace("/login");
};

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        throw new Error("Admin authentication token not found.");
      }

      const response = await fetch(
        `${API_URL}/admin/dashboard`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load admin dashboard."
        );
      }

      /*
       * IMPORTANT
       *
       * Backend currently returns:
       *
       * {
       *   properties: {...},
       *   projects: {...},
       *   users: {...}
       * }
       *
       * NOT data.stats.
       */

      const properties = data.properties || {};
      const projects = data.projects || {};
      const users = data.users || {};

      setStats({
        users: Number(users.total) || 0,

        properties: {
          total: Number(properties.total) || 0,
          pending: Number(properties.pending) || 0,
          approved: Number(properties.approved) || 0,
          rejected: Number(properties.rejected) || 0,
        },

        projects: {
          total: Number(projects.total) || 0,
          pending: Number(projects.pending) || 0,
          approved: Number(projects.approved) || 0,
          rejected: Number(projects.rejected) || 0,
        },
      });
    } catch (err) {
      console.error(
        "ADMIN DASHBOARD ERROR:",
        err
      );

      setError(
        err.message ||
          "Unable to load admin dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const totalListings =
    stats.properties.total +
    stats.projects.total;

  const totalApproved =
    stats.properties.approved +
    stats.projects.approved;

  const totalPending =
    stats.properties.pending +
    stats.projects.pending;

  const totalRejected =
    stats.properties.rejected +
    stats.projects.rejected;

  return (
    <div className="admin-dashboard-page">
      <div className="admin-dashboard-container">

        {/* =================================================
            HEADER
        ================================================= */}

        <header className="admin-dashboard-header">

          <div className="admin-dashboard-heading">

            <div className="admin-dashboard-icon">
              <ShieldCheck size={23} />
            </div>

            <div>
              <span className="admin-dashboard-label">
                XEVOPROP • ADMINISTRATION
              </span>

              <h1>
                Marketplace{" "}
                <span>Control Center</span>
              </h1>

              <p>
                Monitor properties, projects,
                users and listing approvals.
              </p>
            </div>

          </div>

          <button
            type="button"
            className="admin-refresh-button"
            onClick={loadDashboard}
            disabled={loading}
          >
            <RefreshCw
              size={16}
              className={
                loading
                  ? "admin-refresh-spinning"
                  : ""
              }
            />

            {loading
              ? "Refreshing..."
              : "Refresh Data"}
          </button>
           <button
    type="button"
    className="admin-logout-button"
    onClick={handleLogout}
  >
    <LogOut size={16} />
    Logout
  </button>

        </header>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="admin-dashboard-error">
            {error}
          </div>
        )}

        {/* =================================================
            TOP STATISTICS
        ================================================= */}

        <section className="admin-main-stats">

          <div className="admin-main-stat">
            <div className="admin-main-stat-icon users">
              <Users size={21} />
            </div>

            <div>
              <span>Total Users</span>

              <strong>
                {loading
                  ? "—"
                  : stats.users.toLocaleString()}
              </strong>

              <small>
                Registered accounts
              </small>
            </div>
          </div>

          <div className="admin-main-stat">
            <div className="admin-main-stat-icon properties">
              <Home size={21} />
            </div>

            <div>
              <span>Total Properties</span>

              <strong>
                {loading
                  ? "—"
                  : stats.properties.total.toLocaleString()}
              </strong>

              <small>
                Seller listings
              </small>
            </div>
          </div>

          <div className="admin-main-stat">
            <div className="admin-main-stat-icon projects">
              <Building2 size={21} />
            </div>

            <div>
              <span>Total Projects</span>

              <strong>
                {loading
                  ? "—"
                  : stats.projects.total.toLocaleString()}
              </strong>

              <small>
                Developer projects
              </small>
            </div>
          </div>

          <div className="admin-main-stat">
            <div className="admin-main-stat-icon pending">
              <Clock3 size={21} />
            </div>

            <div>
              <span>Needs Review</span>

              <strong>
                {loading
                  ? "—"
                  : totalPending.toLocaleString()}
              </strong>

              <small>
                Pending approvals
              </small>
            </div>
          </div>

        </section>

        {/* =================================================
            PLATFORM SUMMARY
        ================================================= */}

        <section className="admin-platform-summary">

          <div className="admin-platform-summary-content">

            <div>
              <span className="admin-summary-label">
                PLATFORM OVERVIEW
              </span>

              <h2>
                Xevoprop marketplace activity
              </h2>

              <p>
                Keep track of the complete
                property and project approval
                pipeline from one place.
              </p>
            </div>

            <div className="admin-summary-total">
              <span>
                TOTAL LISTINGS
              </span>

              <strong>
                {loading
                  ? "—"
                  : totalListings.toLocaleString()}
              </strong>
            </div>

          </div>

          <div className="admin-summary-metrics">

            <div>
              <CheckCircle2 size={17} />

              <span>Approved</span>

              <strong>
                {loading
                  ? "—"
                  : totalApproved.toLocaleString()}
              </strong>
            </div>

            <div>
              <Clock3 size={17} />

              <span>Pending</span>

              <strong>
                {loading
                  ? "—"
                  : totalPending.toLocaleString()}
              </strong>
            </div>

            <div>
              <XCircle size={17} />

              <span>Rejected</span>

              <strong>
                {loading
                  ? "—"
                  : totalRejected.toLocaleString()}
              </strong>
            </div>

          </div>

        </section>

        {/* =================================================
            APPROVAL OVERVIEW
        ================================================= */}

        <section className="admin-overview-section">

          <div className="admin-section-heading">

            <div>
              <span>
                APPROVAL MANAGEMENT
              </span>

              <h2>
                Review marketplace listings
              </h2>
            </div>

          </div>

          <div className="admin-overview-grid">

            {/* PROPERTY MODERATION */}

            <div className="admin-overview-card">

              <div className="admin-overview-card-header">

                <div className="admin-overview-card-title">

                  <div className="admin-overview-icon property">
                    <Home size={19} />
                  </div>

                  <div>
                    <h3>
                      Property Listings
                    </h3>

                    <p>
                      Seller submissions
                    </p>
                  </div>

                </div>

                <Link
                  to="/admin/properties"
                  className="admin-view-link"
                >
                  Manage
                  <ArrowRight size={14} />
                </Link>

              </div>

              <div className="admin-status-grid">

                <div className="admin-status-item pending">

                  <Clock3 size={16} />

                  <div>
                    <strong>
                      {loading
                        ? "—"
                        : stats.properties.pending}
                    </strong>

                    <span>
                      Pending
                    </span>
                  </div>

                </div>

                <div className="admin-status-item approved">

                  <CheckCircle2 size={16} />

                  <div>
                    <strong>
                      {loading
                        ? "—"
                        : stats.properties.approved}
                    </strong>

                    <span>
                      Approved
                    </span>
                  </div>

                </div>

                <div className="admin-status-item rejected">

                  <XCircle size={16} />

                  <div>
                    <strong>
                      {loading
                        ? "—"
                        : stats.properties.rejected}
                    </strong>

                    <span>
                      Rejected
                    </span>
                  </div>

                </div>

              </div>

            </div>

            {/* PROJECT MODERATION */}

            <div className="admin-overview-card">

              <div className="admin-overview-card-header">

                <div className="admin-overview-card-title">

                  <div className="admin-overview-icon project">
                    <Building2 size={19} />
                  </div>

                  <div>
                    <h3>
                      Development Projects
                    </h3>

                    <p>
                      Developer submissions
                    </p>
                  </div>

                </div>

                <Link
                  to="/admin/projects"
                  className="admin-view-link"
                >
                  Manage
                  <ArrowRight size={14} />
                </Link>

              </div>

              <div className="admin-status-grid">

                <div className="admin-status-item pending">

                  <Clock3 size={16} />

                  <div>
                    <strong>
                      {loading
                        ? "—"
                        : stats.projects.pending}
                    </strong>

                    <span>
                      Pending
                    </span>
                  </div>

                </div>

                <div className="admin-status-item approved">

                  <CheckCircle2 size={16} />

                  <div>
                    <strong>
                      {loading
                        ? "—"
                        : stats.projects.approved}
                    </strong>

                    <span>
                      Approved
                    </span>
                  </div>

                </div>

                <div className="admin-status-item rejected">

                  <XCircle size={16} />

                  <div>
                    <strong>
                      {loading
                        ? "—"
                        : stats.projects.rejected}
                    </strong>

                    <span>
                      Rejected
                    </span>
                  </div>

                </div>

              </div>

            </div>

          </div>

        </section>

        {/* =================================================
            QUICK ACTIONS
        ================================================= */}

        <section className="admin-actions-section">

          <div className="admin-section-heading">

            <div>
              <span>
                ADMIN WORKSPACE
              </span>

              <h2>
                Review and manage
              </h2>
            </div>

          </div>

          <div className="admin-quick-actions">

            <Link
              to="/admin/properties"
              className="admin-quick-action"
            >
              <Home size={20} />

              <div>
                <strong>
                  Property Moderation
                </strong>

                <span>
                  Review seller listings,
                  property details and approval status.
                </span>
              </div>

              <ArrowRight size={17} />
            </Link>

            <Link
              to="/admin/projects"
              className="admin-quick-action"
            >
              <Building2 size={20} />

              <div>
                <strong>
                  Project Moderation
                </strong>

                <span>
                  Review developer projects,
                  media and approval status.
                </span>
              </div>

              <ArrowRight size={17} />
            </Link>

          </div>

        </section>

      </div>
    </div>
  );
}

export default AdminDashboard;