import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  ArrowRight,
  Bell,
  Building2,
  CheckCircle2,
  Clock3,
  FileCheck2,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  RefreshCw,
  ShieldCheck,
  SlidersHorizontal,
  Users,
  X,
  XCircle,
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
  const [stats, setStats] =
    useState(EMPTY_STATS);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [sidebarOpen, setSidebarOpen] =
    useState(false);


  /* =====================================================
     AUTH
  ===================================================== */

  const getToken = () => {
    return localStorage.getItem("token");
  };


  /* =====================================================
     LOGOUT
  ===================================================== */

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("user");

    window.location.replace("/login");
  };


  /* =====================================================
     LOAD DASHBOARD
  ===================================================== */

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        throw new Error(
          "Admin authentication token not found."
        );
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

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Failed to load admin dashboard."
        );
      }

      /*
       * Backend response:
       *
       * {
       *   properties: {...},
       *   projects: {...},
       *   users: {...}
       * }
       */

      const properties =
        data?.properties || {};

      const projects =
        data?.projects || {};

      const users =
        data?.users || {};

      setStats({
        users:
          Number(users.total) || 0,

        properties: {
          total:
            Number(properties.total) ||
            0,

          pending:
            Number(properties.pending) ||
            0,

          approved:
            Number(properties.approved) ||
            0,

          rejected:
            Number(properties.rejected) ||
            0,
        },

        projects: {
          total:
            Number(projects.total) ||
            0,

          pending:
            Number(projects.pending) ||
            0,

          approved:
            Number(projects.approved) ||
            0,

          rejected:
            Number(projects.rejected) ||
            0,
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


  /* =====================================================
     CALCULATED VALUES
  ===================================================== */

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

  const totalProcessed =
    totalApproved +
    totalRejected;

  const approvalRate =
    totalProcessed > 0
      ? Math.round(
          (totalApproved /
            totalProcessed) *
            100
        )
      : 0;


  return (
    <div className="admin-dashboard-page">


      {/* =================================================
          MOBILE OVERLAY
      ================================================= */}

      {sidebarOpen && (
        <div
          className="admin-sidebar-overlay"
          onClick={() =>
            setSidebarOpen(false)
          }
        />
      )}


      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside
        className={`admin-sidebar ${
          sidebarOpen
            ? "admin-sidebar-open"
            : ""
        }`}
      >

        <div className="admin-sidebar-brand">

          

          <div>
            <strong>
              XEVOPROP
            </strong>

            <span>
              ADMIN CONSOLE
            </span>
          </div>

          <button
            type="button"
            className="admin-mobile-close"
            onClick={() =>
              setSidebarOpen(false)
            }
          >
            <X size={18} />
          </button>

        </div>


        <div className="admin-sidebar-section">

          <span className="admin-sidebar-label">
            OPERATIONAL UNITS
          </span>


          <nav className="admin-sidebar-nav">

            <Link
              to="/admin/dashboard"
              className="admin-sidebar-link active"
              onClick={() =>
                setSidebarOpen(false)
              }
            >
              <LayoutDashboard
                size={17}
              />

              <span>
                Dashboard Overview
              </span>
            </Link>


            <Link
              to="/admin/properties"
              className="admin-sidebar-link"
              onClick={() =>
                setSidebarOpen(false)
              }
            >
              <Home size={17} />

              <span>
                Properties Inventory
              </span>
            </Link>


            <Link
              to="/admin/projects"
              className="admin-sidebar-link"
              onClick={() =>
                setSidebarOpen(false)
              }
            >
              <FileCheck2
                size={17}
              />

              <span>
                RERA Project Approvals
              </span>
            </Link>


            <Link
              to="/admin/properties"
              className="admin-sidebar-link"
              onClick={() =>
                setSidebarOpen(false)
              }
            >
              <SlidersHorizontal
                size={17}
              />

              <span>
                Marketplace Operations
              </span>
            </Link>


            <div className="admin-sidebar-link disabled">
              <ShieldCheck
                size={17}
              />

              <span>
                Title Deeds Desk
              </span>
            </div>

          </nav>

        </div>


        <div className="admin-sidebar-security">

          <div className="admin-security-icon">
            <ShieldCheck size={15} />
          </div>

          <div>
            <strong>
              Encrypted Audit
            </strong>

            <span>
              Marketplace validation
              activity is protected.
            </span>
          </div>

        </div>

      </aside>


      {/* =================================================
          MAIN AREA
      ================================================= */}

      <div className="admin-dashboard-main">


        {/* =================================================
            TOP NAV
        ================================================= */}

        <header className="admin-topbar">

          <div className="admin-topbar-left">

            <button
              type="button"
              className="admin-mobile-menu"
              onClick={() =>
                setSidebarOpen(true)
              }
            >
              <Menu size={20} />
            </button>


            <div className="admin-top-brand">

              

              <strong>
                XEVOPROP
              </strong>

            </div>


            <span className="admin-control-center">
              CONTROL CENTER
            </span>

          </div>


          <div className="admin-topbar-right">

            <div className="admin-live-status">

              <span />

              PLATFORM LIVE

              <strong>
                99.98%
              </strong>

            </div>


            <Link
              to="/"
              className="admin-top-link"
            >
              Marketplace
            </Link>


            <Link
              to="/properties"
              className="admin-top-link"
            >
              Properties
            </Link>


            <Link
              to="/projects"
              className="admin-top-link"
            >
              Projects
            </Link>


            <span className="admin-top-active">
              Admin
            </span>


            <div className="admin-super-admin">

              <ShieldCheck
                size={14}
              />

              <span>
                SUPER ADMIN
              </span>

            </div>


            <button
              type="button"
              className="admin-notification"
              title="Notifications"
            >
              <Bell size={17} />

              <span />
            </button>


            <div className="admin-user">

              <div className="admin-user-avatar">
                A
              </div>

              <div>
                <strong>
                  Admin
                </strong>

                <span>
                  Admin Console
                </span>
              </div>

            </div>

          </div>

        </header>


        {/* =================================================
            CONTENT
        ================================================= */}

        <main className="admin-dashboard-content">


          {/* =================================================
              PAGE HEADER
          ================================================= */}

          <section className="admin-page-header">

            <div>

              <div className="admin-breadcrumb">

                <span>
                  XEVOPROP
                </span>

                <b>•</b>

                <span>
                  ADMINISTRATION
                </span>

                <b>•</b>

                <strong>
                  NODE: BLR-PRD-01
                </strong>

              </div>


              <h1>
                Marketplace Control Center
              </h1>

              <p>
                Monitor properties, projects,
                users and real-time listing
                approvals across the marketplace.
              </p>

            </div>


            <div className="admin-header-actions">

              <div className="admin-node-status">

                <span />

                Render Prod

                <strong>
                  42ms latency
                </strong>

              </div>


              <button
                type="button"
                className="admin-refresh-button"
                onClick={
                  loadDashboard
                }
                disabled={loading}
              >
                <RefreshCw
                  size={15}
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
                onClick={
                  handleLogout
                }
              >
                <LogOut size={15} />

                Logout
              </button>

            </div>

          </section>


          {error && (
            <div className="admin-dashboard-error">
              <XCircle size={16} />

              <span>
                {error}
              </span>
            </div>
          )}


          {/* =================================================
              STATISTICS
          ================================================= */}

          <section className="admin-main-stats">


            <article className="admin-main-stat">

              <div className="admin-main-stat-icon users">
                <Users size={20} />
              </div>

              <div>

                <span>
                  TOTAL ACCOUNTS
                </span>

                <strong>
                  {loading
                    ? "—"
                    : stats.users.toLocaleString()}
                </strong>

                <small>
                  Registered accounts
                </small>

              </div>

            </article>


            <article className="admin-main-stat">

              <div className="admin-main-stat-icon properties">
                <Home size={20} />
              </div>

              <div>

                <span>
                  PROPERTIES LISTED
                </span>

                <strong>
                  {loading
                    ? "—"
                    : stats.properties.total.toLocaleString()}
                </strong>

                <small>
                  Seller listings
                </small>

              </div>

            </article>


            <article className="admin-main-stat">

              <div className="admin-main-stat-icon projects">
                <Building2 size={20} />
              </div>

              <div>

                <span>
                  ACTIVE DEVELOPMENTS
                </span>

                <strong>
                  {loading
                    ? "—"
                    : stats.projects.total.toLocaleString()}
                </strong>

                <small>
                  Developer projects
                </small>

              </div>

            </article>


            <article className="admin-main-stat">

              <div className="admin-main-stat-icon pending">
                <Clock3 size={20} />
              </div>

              <div>

                <span>
                  VERIFICATION QUEUE
                </span>

                <strong>
                  {loading
                    ? "—"
                    : totalPending.toLocaleString()}
                </strong>

                <small>
                  Pending approvals
                </small>

              </div>

            </article>

          </section>


          {/* =================================================
              PLATFORM OVERVIEW
          ================================================= */}

          <section className="admin-platform-summary">

            <div className="admin-platform-top">

              <div>

                <div className="admin-summary-label">
                  PLATFORM OVERVIEW
                  <span>•</span>
                  PIPELINE ACTIVITY
                </div>

                <h2>
                  Comprehensive Clearance
                  Velocity
                </h2>

                <p>
                  Keep track of the complete
                  property and project approval
                  pipeline from one place.
                </p>

              </div>


              <div className="admin-summary-total">

                <span>
                  TOTAL VERIFIED VOLUME
                </span>

                <strong>
                  {loading
                    ? "—"
                    : totalApproved.toLocaleString()}
                </strong>

                <small>
                  {loading
                    ? "Loading..."
                    : `${approvalRate}% clearance rate`}
                </small>

              </div>

            </div>


            <div className="admin-summary-metrics">


              <div className="admin-summary-metric approved">

                <div className="admin-summary-metric-icon">
                  <CheckCircle2
                    size={17}
                  />
                </div>

                <div>
                  <span>
                    APPROVED
                  </span>

                  <strong>
                    {loading
                      ? "—"
                      : totalApproved.toLocaleString()}
                  </strong>
                </div>

                <small>
                  Active
                </small>

              </div>


              <div className="admin-summary-metric pending">

                <div className="admin-summary-metric-icon">
                  <Clock3
                    size={17}
                  />
                </div>

                <div>
                  <span>
                    PENDING REVIEW
                  </span>

                  <strong>
                    {loading
                      ? "—"
                      : totalPending.toLocaleString()}
                  </strong>
                </div>

                <small>
                  Triage
                </small>

              </div>


              <div className="admin-summary-metric rejected">

                <div className="admin-summary-metric-icon">
                  <XCircle
                    size={17}
                  />
                </div>

                <div>
                  <span>
                    REJECTED / NON-COMPLIANT
                  </span>

                  <strong>
                    {loading
                      ? "—"
                      : totalRejected.toLocaleString()}
                  </strong>
                </div>

                <small>
                  Archived
                </small>

              </div>

            </div>


            <div className="admin-clearance-bar">

              <div className="admin-clearance-label">

                <span>
                  Audit Success Distribution
                </span>

                <strong>
                  {totalApproved} Cleared
                  {" • "}
                  {totalPending} In Review
                  {" • "}
                  {totalRejected} Flagged
                </strong>

              </div>

              <div className="admin-clearance-track">

                <span
                  className="approved"
                  style={{
                    width: `${
                      totalListings
                        ? (totalApproved /
                            totalListings) *
                          100
                        : 0
                    }%`,
                  }}
                />

                <span
                  className="pending"
                  style={{
                    width: `${
                      totalListings
                        ? (totalPending /
                            totalListings) *
                          100
                        : 0
                    }%`,
                  }}
                />

                <span
                  className="rejected"
                  style={{
                    width: `${
                      totalListings
                        ? (totalRejected /
                            totalListings) *
                          100
                        : 0
                    }%`,
                  }}
                />

              </div>

            </div>

          </section>


          {/* =================================================
              APPROVAL MANAGEMENT
          ================================================= */}

          <section className="admin-overview-section">

            <div className="admin-section-heading">

              <div>

                <span>
                  APPROVAL MANAGEMENT
                </span>

                <h2>
                  Active Verification Pools
                </h2>

              </div>

              <p>
                Select manage to open the
                appropriate moderation workspace.
              </p>

            </div>


            <div className="admin-overview-grid">


              {/* PROPERTY */}

              <article className="admin-overview-card">

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
                        Individual seller
                        submissions
                      </p>
                    </div>

                  </div>


                  <Link
                    to="/admin/properties"
                    className="admin-view-link"
                  >
                    Manage
                    <ArrowRight
                      size={14}
                    />
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

                    <CheckCircle2
                      size={16}
                    />

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


                <div className="admin-card-footer">

                  <span />

                  Last property
                  moderation queue

                  <strong>
                    {stats.properties.pending}
                    {" "}pending
                  </strong>

                </div>

              </article>


              {/* PROJECT */}

              <article className="admin-overview-card">

                <div className="admin-overview-card-header">

                  <div className="admin-overview-card-title">

                    <div className="admin-overview-icon project">
                      <Building2
                        size={19}
                      />
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
                    <ArrowRight
                      size={14}
                    />
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

                    <CheckCircle2
                      size={16}
                    />

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


                <div className="admin-card-footer">

                  <span />

                  Last project
                  moderation queue

                  <strong>
                    {stats.projects.pending}
                    {" "}pending
                  </strong>

                </div>

              </article>

            </div>

          </section>


          {/* =================================================
              ADMIN WORKSPACE
          ================================================= */}

          <section className="admin-actions-section">

            <div className="admin-section-heading">

              <div>

                <span>
                  ADMIN WORKSPACE
                </span>

                <h2>
                  Review and Manage
                </h2>

              </div>

            </div>


            <div className="admin-quick-actions">


              <Link
                to="/admin/properties"
                className="admin-quick-action"
              >

                <div className="admin-quick-action-icon property">
                  <Home size={20} />
                </div>

                <div>

                  <strong>
                    Property Moderation
                  </strong>

                  <span>
                    Review seller listings,
                    property details and
                    approval status.
                  </span>

                </div>

                <ArrowRight size={18} />

              </Link>


              <Link
                to="/admin/projects"
                className="admin-quick-action"
              >

                <div className="admin-quick-action-icon project">
                  <Building2 size={20} />
                </div>

                <div>

                  <strong>
                    Project Moderation
                  </strong>

                  <span>
                    Review developer projects,
                    media and approval status.
                  </span>

                </div>

                <ArrowRight size={18} />

              </Link>

            </div>

          </section>


          {/* =================================================
              AUDIT FOOTER
          ================================================= */}

          <div className="admin-audit-footer">

            <div>

              <ShieldCheck size={17} />

              <span>
                Institutional Audit Logging
                Active
              </span>

              <b>
                •
              </b>

              <span>
                RERA Verification Ledger Synced
              </span>

            </div>


            <div>

              <span className="admin-audit-dot" />

              <span>
                BLOCK #88219
              </span>

              <b>
                •
              </b>

              <span>
                ZERO UNMATCHED DEEDS
              </span>

            </div>

          </div>

        </main>

      </div>

    </div>
  );
}

export default AdminDashboard;