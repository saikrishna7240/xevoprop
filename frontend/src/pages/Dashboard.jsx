import { Link } from "react-router-dom";

import {
  ArrowRight,
  BarChart3,
  Building2,
  CalendarDays,
  Heart,
  Home,
  LogOut,
  MessageCircle,
  Plus,
  Search,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

import "./Dashboard.css";

function Dashboard() {
  const { user, logout } = useAuth();

  /* =====================================================
     NOT LOGGED IN
  ===================================================== */

  if (!user) {
    return (
      <div className="dashboard-login-page">
        <div className="dashboard-login-box">

          <div className="dashboard-login-brand">
            <span className="dashboard-logo-mark">X</span>

            <span className="dashboard-logo-text">
              XEVO<span>PROP</span>
            </span>
          </div>

          <div className="dashboard-login-icon">
            <UserRound size={23} />
          </div>

          <span className="dashboard-login-label">
            XEVOPROP ACCOUNT
          </span>

          <h1>You&apos;re not signed in</h1>

          <p>
            Sign in to access your properties, enquiries,
            visits and account settings.
          </p>

          <Link
            to="/login"
            className="dashboard-login-button"
          >
            Sign in
            <ArrowRight size={16} />
          </Link>

        </div>
      </div>
    );
  }

  /* =====================================================
     USER ROLE
  ===================================================== */

  const role = user.role || "Buyer";

  /* =====================================================
     DASHBOARD DATA
  ===================================================== */

  const dashboardData = {
    Buyer: {
      eyebrow: "BUYER ACCOUNT",

      title: `Welcome, ${user.name}.`,

      description:
        "Manage your property search, saved listings, enquiries and visits.",

      items: [
        {
          icon: Search,
          title: "Explore Properties",
          description:
            "Find properties matching your requirements.",
          link: "/properties",
        },

        {
          icon: Heart,
          title: "Saved Properties",
          description:
            "View the properties you have saved.",
          link: "/favorites",
        },

        {
          icon: MessageCircle,
          title: "Property Enquiries",
          description:
            "Track your property enquiries and conversations.",
          link: "/my-enquiries",
        },

        {
          icon: MessageCircle,
          title: "Project Enquiries",
          description:
            "View your enquiries with developers.",
          link: "/buyer/project-enquiries",
        },

        {
          icon: CalendarDays,
          title: "My Visits",
          description:
            "View and manage your scheduled visits.",
          link: "/my-visits",
        },

        {
          icon: UserRound,
          title: "My Profile",
          description:
            "Manage your personal account information.",
          link: "/profile",
        },
      ],
    },

    Seller: {
      eyebrow: "SELLER ACCOUNT",

      title: `Welcome, ${user.name}.`,

      description:
        "Manage your property listings, visits and buyer enquiries.",

      items: [
        {
          icon: Home,
          title: "My Properties",
          description:
            "View and manage your listed properties.",
          link: "/my-properties",
        },

        {
          icon: Plus,
          title: "List a Property",
          description:
            "Add a new property listing to Xevoprop.",
          link: "/list-property",
        },

        {
          icon: CalendarDays,
          title: "Schedule Visit",
          description:
            "Manage property visits and appointments.",
          link: "/seller-visits",
        },

        {
          icon: MessageCircle,
          title: "Buyer Enquiries",
          description:
            "View people interested in your properties.",
          link: "/seller-enquiries",
        },

        {
          icon: UserRound,
          title: "My Profile",
          description:
            "Manage your seller profile.",
          link: "/profile",
        },
      ],
    },

    Developer: {
      eyebrow: "DEVELOPER ACCOUNT",

      title: `Welcome, ${user.name}.`,

      description:
        "Manage your projects, listings and enquiries from one place.",

      items: [
        {
          icon: Building2,
          title: "My Projects",
          description:
            "View and manage your projects on Xevoprop.",
          link: "/my-projects",
        },

        {
          icon: Plus,
          title: "Add Project",
          description:
            "Create and submit a new project listing.",
          link: "/add-project",
        },

        {
          icon: BarChart3,
          title: "Project Enquiries",
          description:
            "Track enquiries from potential buyers.",
          link: "/project-enquiries",
        },

        {
          icon: Building2,
          title: "Company Profile",
          description:
            "Manage your developer company profile.",
          link: "/profile",
        },
      ],
    },
  };

  const data =
    dashboardData[role] || dashboardData.Buyer;

  return (
    <div className="dashboard-page">

      <div className="dashboard-container">

        {/* =================================================
            HEADER
        ================================================= */}

        <header className="dashboard-header">

          <Link
            to="/"
            className="dashboard-brand"
          >
            

            <span className="dashboard-logo-text">
              XEVO<span>PROP</span>
            </span>
          </Link>

          <div className="dashboard-header-actions">

            <div className="dashboard-user-mini">

              <div className="dashboard-mini-avatar">
                {user.name
                  ?.charAt(0)
                  .toUpperCase()}
              </div>

              <div className="dashboard-mini-info">
                <strong>{user.name}</strong>
                <span>{role}</span>
              </div>

            </div>

            <button
              type="button"
              className="dashboard-logout"
              onClick={logout}
            >
              <LogOut size={15} />
              <span>Logout</span>
            </button>

          </div>

        </header>

        {/* =================================================
            INTRO
        ================================================= */}

        <main>

          <section className="dashboard-intro">

            <div>
              <span className="dashboard-eyebrow">
                {data.eyebrow}
              </span>

              <h1>{data.title}</h1>

              <p>{data.description}</p>
            </div>

            <div className="dashboard-intro-status">
              <ShieldCheck size={16} />
              <span>Account active</span>
            </div>

          </section>

          {/* =================================================
              ACCOUNT DETAILS
          ================================================= */}

          <section className="dashboard-account">

            <div className="dashboard-account-person">

              <div className="dashboard-avatar">
                {user.name
                  ?.charAt(0)
                  .toUpperCase()}
              </div>

              <div>
                <span className="dashboard-field-label">
                  ACCOUNT HOLDER
                </span>

                <strong>{user.name}</strong>

                <p>{user.email}</p>
              </div>

            </div>

            <div className="dashboard-account-meta">

              <div>
                <span className="dashboard-field-label">
                  ACCOUNT TYPE
                </span>

                <strong>{role}</strong>
              </div>

              <div className="dashboard-meta-divider" />

              <div className="dashboard-account-security">
                <ShieldCheck size={15} />
                <span>Secure account</span>
              </div>

            </div>

          </section>

          {/* =================================================
              QUICK ACCESS
          ================================================= */}

          <section className="dashboard-access">

            <div className="dashboard-access-heading">

              <div>
                <span>QUICK ACCESS</span>

                <h2>Manage your account</h2>
              </div>

            </div>

            <div className="dashboard-access-list">

              {data.items.map((item, index) => {

                const Icon = item.icon;

                return (
                  <Link
                    key={item.title}
                    to={item.link}
                    className="dashboard-access-row"
                  >

                    <span className="dashboard-row-number">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <span className="dashboard-row-icon">
                      <Icon size={18} />
                    </span>

                    <span className="dashboard-row-content">
                      <strong>{item.title}</strong>
                      <span>{item.description}</span>
                    </span>

                    <span className="dashboard-row-arrow">
                      <ArrowRight size={17} />
                    </span>

                  </Link>
                );
              })}

            </div>

          </section>

        </main>

        {/* =================================================
            FOOTER
        ================================================= */}

        <footer className="dashboard-footer">

          <span>
            Xevoprop account
          </span>

          <Link to="/profile">
            Account settings
            <ArrowRight size={13} />
          </Link>

        </footer>

      </div>

    </div>
  );
}

export default Dashboard;