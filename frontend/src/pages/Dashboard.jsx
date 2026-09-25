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
  Bookmark,
  FileCheck2,
  WalletCards,
  LayoutDashboard,
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
            <span className="dashboard-logo-mark">
              X
            </span>

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

          <h1>
            You&apos;re not signed in
          </h1>

          <p>
            Sign in to access your properties,
            enquiries, visits and account settings.
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
     ROLE DATA
  ===================================================== */

  const dashboardData = {

    Buyer: {
      eyebrow: "BUYER ACCOUNT",

      description:
        "Manage your property search, saved listings, enquiries and visits.",

      items: [
        {
          icon: Search,
          title: "Explore Properties",
          description:
            "Find premium properties matching your requirements.",
          badge: "142 verified today",
          link: "/properties",
        },

        {
          icon: Heart,
          title: "Saved Properties",
          description:
            "View, compare and manage your saved properties.",
          badge: "4 saved assets",
          link: "/favorites",
        },

        {
          icon: MessageCircle,
          title: "Property Enquiries",
          description:
            "Track your property enquiries and conversations.",
          badge: "2 active chats",
          link: "/my-enquiries",
        },

        {
          icon: Building2,
          title: "Project Enquiries",
          description:
            "View your enquiries with developers.",
          badge: "Project enquiries",
          link: "/buyer/project-enquiries",
        },

        {
          icon: CalendarDays,
          title: "My Scheduled Visits",
          description:
            "View and manage your scheduled property visits.",
          badge: "Upcoming visits",
          link: "/my-visits",
        },

        {
          icon: UserRound,
          title: "Profile & KYC",
          description:
            "Manage your personal account information.",
          badge: "100% complete",
          link: "/profile",
        },
      ],
    },


    Seller: {
      eyebrow: "SELLER ACCOUNT",

      description:
        "Manage your property listings, visits and buyer enquiries.",

      items: [
        {
          icon: Home,
          title: "My Properties",
          description:
            "View and manage your listed properties.",
          badge: "Active listings",
          link: "/my-properties",
        },

        {
          icon: Plus,
          title: "List a Property",
          description:
            "Add a new property listing to Xevoprop.",
          badge: "Start listing",
          link: "/list-property",
        },

        {
          icon: CalendarDays,
          title: "Schedule Visits",
          description:
            "Manage property visits and appointments.",
          badge: "Upcoming visits",
          link: "/seller-visits",
        },

        {
          icon: MessageCircle,
          title: "Buyer Enquiries",
          description:
            "View people interested in your properties.",
          badge: "Active enquiries",
          link: "/seller-enquiries",
        },

        {
          icon: BarChart3,
          title: "Listing Performance",
          description:
            "Review enquiries and property engagement.",
          badge: "View activity",
          link: "/seller-enquiries",
        },

        {
          icon: UserRound,
          title: "My Profile",
          description:
            "Manage your seller profile.",
          badge: "Account settings",
          link: "/profile",
        },
      ],
    },


    Developer: {
      eyebrow: "DEVELOPER ACCOUNT",

      description:
        "Manage your projects, listings and enquiries from one place.",

      items: [
        {
          icon: Building2,
          title: "My Projects",
          description:
            "View and manage your projects on Xevoprop.",
          badge: "Active projects",
          link: "/my-projects",
        },

        {
          icon: Plus,
          title: "Add Project",
          description:
            "Create and submit a new project listing.",
          badge: "Create project",
          link: "/add-project",
        },

        {
          icon: MessageCircle,
          title: "Project Enquiries",
          description:
            "Track enquiries from potential buyers.",
          badge: "Active enquiries",
          link: "/project-enquiries",
        },

        {
          icon: BarChart3,
          title: "Project Performance",
          description:
            "Review your project engagement and enquiries.",
          badge: "View activity",
          link: "/project-enquiries",
        },

        {
          icon: Building2,
          title: "Company Profile",
          description:
            "Manage your developer company profile.",
          badge: "Company details",
          link: "/profile",
        },

        {
          icon: UserRound,
          title: "Account Settings",
          description:
            "Manage your developer account information.",
          badge: "Settings",
          link: "/profile",
        },
      ],
    },
  };


  const data =
    dashboardData[role] ||
    dashboardData.Buyer;


  /* =====================================================
     ROLE LABEL
  ===================================================== */

  const roleLabel =
    role === "Developer"
      ? "Developer"
      : role;


  /* =====================================================
     RETURN
  ===================================================== */

  return (
    <div className="dashboard-page">


      {/* =================================================
          TOP NAVIGATION
      ================================================= */}

      <header className="dashboard-topbar">

        <div className="dashboard-topbar-left">

          <Link
            to="/"
            className="dashboard-brand"
          >

            <span className="dashboard-brand-mark">
              X
            </span>

            <span className="dashboard-brand-name">
              XEVO<span>PROP</span>
            </span>

          </Link>


          <nav className="dashboard-main-nav">

            <Link to="/properties">
              Marketplace
            </Link>

            <Link to="/properties">
              Properties
            </Link>

            <Link to="/projects">
              Projects
            </Link>

            <Link to="/about">
              Insights
            </Link>

          </nav>

        </div>


        <div className="dashboard-topbar-right">

          <div className="dashboard-user-header">

            <div className="dashboard-header-avatar">
              {user.name
                ?.charAt(0)
                .toUpperCase()}
            </div>

            <div className="dashboard-header-user-info">

              <strong>
                {user.name}
              </strong>

              <span>
                {roleLabel.toUpperCase()} ACCOUNT
              </span>

            </div>

          </div>


          <button
            type="button"
            className="dashboard-header-logout"
            onClick={logout}
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>

        </div>

      </header>


      {/* =================================================
          PAGE BODY
      ================================================= */}

      <div className="dashboard-body">


        {/* =================================================
            SIDEBAR
        ================================================= */}

        <aside className="dashboard-sidebar">

          <div className="dashboard-sidebar-title">
            ACCOUNT NAVIGATION
          </div>


          <nav className="dashboard-sidebar-nav">

            <Link
              to="/dashboard"
              className="dashboard-sidebar-link active"
            >
              <LayoutDashboard size={18} />
              <span>Overview</span>
            </Link>


            {role === "Buyer" && (
              <>
                <Link
                  to="/favorites"
                  className="dashboard-sidebar-link"
                >
                  <Bookmark size={18} />
                  <span>Saved Assets</span>
                </Link>

                <Link
                  to="/my-enquiries"
                  className="dashboard-sidebar-link"
                >
                  <MessageCircle size={18} />
                  <span>Property Enquiries</span>
                </Link>

                <Link
                  to="/my-visits"
                  className="dashboard-sidebar-link"
                >
                  <CalendarDays size={18} />
                  <span>Site Visits</span>
                </Link>

                <Link
                  to="/profile"
                  className="dashboard-sidebar-link"
                >
                  <WalletCards size={18} />
                  <span>Financial Escrow</span>
                </Link>
              </>
            )}


            {role === "Seller" && (
              <>
                <Link
                  to="/my-properties"
                  className="dashboard-sidebar-link"
                >
                  <Home size={18} />
                  <span>My Properties</span>
                </Link>

                <Link
                  to="/seller-enquiries"
                  className="dashboard-sidebar-link"
                >
                  <MessageCircle size={18} />
                  <span>Buyer Enquiries</span>
                </Link>

                <Link
                  to="/seller-visits"
                  className="dashboard-sidebar-link"
                >
                  <CalendarDays size={18} />
                  <span>Site Visits</span>
                </Link>

                <Link
                  to="/profile"
                  className="dashboard-sidebar-link"
                >
                  <UserRound size={18} />
                  <span>Profile</span>
                </Link>
              </>
            )}


            {role === "Developer" && (
              <>
                <Link
                  to="/my-projects"
                  className="dashboard-sidebar-link"
                >
                  <Building2 size={18} />
                  <span>My Projects</span>
                </Link>

                <Link
                  to="/project-enquiries"
                  className="dashboard-sidebar-link"
                >
                  <MessageCircle size={18} />
                  <span>Project Enquiries</span>
                </Link>

                <Link
                  to="/add-project"
                  className="dashboard-sidebar-link"
                >
                  <Plus size={18} />
                  <span>Add Project</span>
                </Link>

                <Link
                  to="/profile"
                  className="dashboard-sidebar-link"
                >
                  <UserRound size={18} />
                  <span>Company Profile</span>
                </Link>
              </>
            )}

          </nav>


          <div className="dashboard-sidebar-bottom">

            <ShieldCheck size={17} />

            <div>
              <strong>
                Account Verified
              </strong>

              <span>
                Xevoprop secure account
              </span>
            </div>

          </div>

        </aside>


        {/* =================================================
            MAIN CONTENT
        ================================================= */}

        <main className="dashboard-content">


          {/* =================================================
              INTRO
          ================================================= */}

          <section className="dashboard-intro">

            <div className="dashboard-intro-copy">

              <div className="dashboard-intro-badges">

                <span className="dashboard-account-badge">
                  <ShieldCheck size={14} />
                  {data.eyebrow}
                </span>

                <span className="dashboard-active-badge">
                  <span />
                  Account Active
                </span>

              </div>


              <h1>
                Welcome,{" "}
                <em>{user.name}.</em>
              </h1>

              <p>
                {data.description}
              </p>

            </div>


            {/* ROLE SWITCH VISUAL */}

            <div className="dashboard-role-switch">

              <div
                className={
                  role === "Buyer"
                    ? "dashboard-role active"
                    : "dashboard-role"
                }
              >
                <UserRound size={17} />
                <span>
                  Buyer
                  <small>View</small>
                </span>
              </div>


              <div
                className={
                  role === "Seller"
                    ? "dashboard-role active"
                    : "dashboard-role"
                }
              >
                <Home size={17} />
                <span>
                  Seller
                  <small>View</small>
                </span>
              </div>


              <div
                className={
                  role === "Developer"
                    ? "dashboard-role active"
                    : "dashboard-role"
                }
              >
                <Building2 size={17} />
                <span>
                  Developer
                  <small>View</small>
                </span>
              </div>

            </div>

          </section>


          {/* =================================================
              ACCOUNT HOLDER
          ================================================= */}

          <section className="dashboard-account-card">

            <div className="dashboard-account-holder">

              <div className="dashboard-profile-avatar">

                {user.name
                  ?.charAt(0)
                  .toUpperCase()}

                <span>
                  <ShieldCheck size={13} />
                </span>

              </div>


              <div className="dashboard-holder-info">

                <span className="dashboard-card-label">
                  VERIFIED ACCOUNT HOLDER
                  <ShieldCheck size={14} />
                </span>

                <h2>
                  {user.name}
                </h2>

                <p>
                  {user.email}
                </p>

              </div>

            </div>


            <div className="dashboard-account-column">

              <span className="dashboard-card-label">
                ACCOUNT CLASSIFICATION
              </span>

              <strong>
                {role}
              </strong>

              <span className="dashboard-green-text">
                Tier-1 Xevoprop Access
              </span>

            </div>


            <div className="dashboard-account-column">

              <span className="dashboard-card-label">
                SECURITY STATUS
              </span>

              <strong className="dashboard-security-value">
                <ShieldCheck size={16} />
                Verified
              </strong>

              <span className="dashboard-green-text">
                Secure account
              </span>

            </div>


            <div className="dashboard-account-column dashboard-portfolio">

              <span className="dashboard-card-label">
                PORTFOLIO DESK
              </span>

              <strong>
                Active Member
              </strong>

              <span>
                Since 2024
              </span>

            </div>

          </section>


          {/* =================================================
              WORKSPACE HEADING
          ================================================= */}

          <section className="dashboard-workspace-heading">

            <div>

              <div className="dashboard-workspace-label">

                ACTIVE {role.toUpperCase()} WORKSPACE

                <span>
                  {data.items.length} Modules
                </span>

              </div>

              <h2>
                Manage your account
              </h2>

            </div>

            <span className="dashboard-workspace-sync">
              Real-time property workspace
            </span>

          </section>


          {/* =================================================
              MODULES
          ================================================= */}

          <section className="dashboard-module-grid">

            {data.items.map(
              (item, index) => {

                const Icon = item.icon;

                return (
                  <Link
                    key={item.title}
                    to={item.link}
                    className="dashboard-module-card"
                  >

                    <div className="dashboard-module-top">

                      <span className="dashboard-module-number">
                        {String(index + 1).padStart(
                          2,
                          "0"
                        )}
                      </span>

                      <span className="dashboard-module-icon">
                        <Icon size={20} />
                      </span>

                      <span className="dashboard-module-badge">
                        {item.badge}
                      </span>

                    </div>


                    <div className="dashboard-module-content">

                      <h3>
                        {item.title}
                      </h3>

                      <p>
                        {item.description}
                      </p>

                    </div>


                    <span className="dashboard-module-arrow">
                      <ArrowRight size={19} />
                    </span>

                  </Link>
                );
              }
            )}

          </section>


          {/* =================================================
              PROTOCOL BAR
          ================================================= */}

          <section className="dashboard-protocol">

            <div className="dashboard-protocol-icon">
              <ArrowRight size={21} />
            </div>

            <div className="dashboard-protocol-content">

              <h3>
                Multi-Persona Real Estate Protocol
              </h3>

              <p>
                Your Xevoprop account keeps your
                property activity, enquiries and
                account access connected in one place.
              </p>

            </div>

            <span className="dashboard-protocol-id">
              Unified Account
            </span>

          </section>

        </main>

      </div>

    </div>
  );
}

export default Dashboard;