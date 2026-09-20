import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock3,
  Home,
  RefreshCw,
  ShieldCheck,
  Users,
  XCircle,
} from "lucide-react";
import "./AdminDashboard.css";

const API_URL = "https://xevoprop.onrender.com/api";

function AdminDashboard() {
  const [stats, setStats] = useState({
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
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getToken = () => {
    return localStorage.getItem("token");
  };

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      const response = await fetch(
        `${API_URL}/admin/dashboard`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load admin dashboard"
        );
      }

      setStats({
        users: data.stats?.users || 0,

        properties: {
          total: data.stats?.properties?.total || 0,
          pending: data.stats?.properties?.pending || 0,
          approved: data.stats?.properties?.approved || 0,
          rejected: data.stats?.properties?.rejected || 0,
        },

        projects: {
          total: data.stats?.projects?.total || 0,
          pending: data.stats?.projects?.pending || 0,
          approved: data.stats?.projects?.approved || 0,
          rejected: data.stats?.projects?.rejected || 0,
        },
      });
    } catch (err) {
      setError(
        err.message || "Unable to load admin dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  return (
    <div className="admin-dashboard-page">
      <div className="admin-dashboard-container">

        {/* Header */}
        <header className="admin-dashboard-header">
          <div className="admin-dashboard-heading">
            <div className="admin-dashboard-icon">
              <ShieldCheck size={23} />
            </div>

            <div>
              <span className="admin-dashboard-label">
                ADMIN CONTROL CENTER
              </span>

              <h1>
                Xevoprop <span>Admin</span>
              </h1>

              <p>
                Manage users, properties and projects from
                one place.
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

            Refresh
          </button>
        </header>

        {/* Error */}
        {error && (
          <div className="admin-dashboard-error">
            {error}
          </div>
        )}

        {/* Main Stats */}
        <section className="admin-main-stats">

          <div className="admin-main-stat">
            <div className="admin-main-stat-icon users">
              <Users size={21} />
            </div>

            <div>
              <span>Total Users</span>
              <strong>
                {loading ? "—" : stats.users}
              </strong>
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
                  : stats.properties.total}
              </strong>
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
                  : stats.projects.total}
              </strong>
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
                  : stats.properties.pending +
                    stats.projects.pending}
              </strong>
            </div>
          </div>

        </section>

        {/* Approval Overview */}
        <section className="admin-overview-section">

          <div className="admin-section-heading">
            <div>
              <span>APPROVAL OVERVIEW</span>
              <h2>Content moderation</h2>
            </div>
          </div>

          <div className="admin-overview-grid">

            {/* Properties */}
            <div className="admin-overview-card">

              <div className="admin-overview-card-header">
                <div className="admin-overview-card-title">
                  <div className="admin-overview-icon">
                    <Home size={19} />
                  </div>

                  <div>
                    <h3>Properties</h3>
                    <p>Seller submissions</p>
                  </div>
                </div>

                <Link
                  to="/admin/properties"
                  className="admin-view-link"
                >
                  View all
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

                    <span>Pending</span>
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

                    <span>Approved</span>
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

                    <span>Rejected</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Projects */}
            <div className="admin-overview-card">

              <div className="admin-overview-card-header">
                <div className="admin-overview-card-title">
                  <div className="admin-overview-icon">
                    <Building2 size={19} />
                  </div>

                  <div>
                    <h3>Projects</h3>
                    <p>Developer submissions</p>
                  </div>
                </div>

                <Link
                  to="/admin/projects"
                  className="admin-view-link"
                >
                  View all
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

                    <span>Pending</span>
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

                    <span>Approved</span>
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

                    <span>Rejected</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </section>

        {/* Quick Actions */}
        <section className="admin-actions-section">

          <div className="admin-section-heading">
            <div>
              <span>ADMIN ACTIONS</span>
              <h2>Review submissions</h2>
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
                  Review Properties
                </strong>

                <span>
                  Approve or reject seller listings
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
                  Review Projects
                </strong>

                <span>
                  Approve or reject developer projects
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