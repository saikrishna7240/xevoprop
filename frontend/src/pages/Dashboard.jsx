import { Link } from "react-router-dom";

import {
  ArrowRight,
  BarChart3,
  Building2,
  CalendarDays,
  CheckCircle2,
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
        <div className="dashboard-login-card">

          <div className="dashboard-login-icon">
            <UserRound size={28} />
          </div>

          <span className="dashboard-login-eyebrow">
            XEVOPROP ACCOUNT
          </span>

          <h1>
            You're not signed in
          </h1>

          <p>
            Please sign in to access your
            Xevoprop dashboard.
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

    /* ===================================================
       BUYER
    =================================================== */

    Buyer: {
      eyebrow: "BUYER DASHBOARD",

      title: `Welcome, ${user.name}.`,

      description:
        "Discover properties and manage your property journey.",

      introIcon: Search,

      intro:
        "Your next property could be closer than you think.",

      cards: [
        {
          icon: Search,
          title: "Explore Properties",
          description:
            "Discover properties matching your requirements.",
          link: "/properties",
        },

        {
          icon: Heart,
          title: "Saved Properties",
          description:
            "View the properties you've saved.",
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
            "View your project enquiries and chat with developers.",
          link: "/buyer/project-enquiries",
        },

        {
          icon: CalendarDays,
          title: "My Visits",
          description:
            "View and manage your scheduled property visits.",
          link: "/my-visits",
        },

        {
          icon: UserRound,
          title: "My Profile",
          description:
            "Manage your personal information.",
          link: "/profile",
        },
      ],
    },

    /* ===================================================
       SELLER
    =================================================== */

    Seller: {
      eyebrow: "SELLER DASHBOARD",

      title: `Welcome, ${user.name}.`,

      description:
        "Manage your properties and connect with interested buyers.",

      introIcon: Home,

      intro:
        "Put your property in front of the right audience.",

      cards: [
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
            "Add a new property to Xevoprop.",
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
            "See people interested in your properties.",
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

    /* ===================================================
       DEVELOPER
    =================================================== */

    Developer: {
      eyebrow: "DEVELOPER DASHBOARD",

      title: `Welcome, ${user.name}.`,

      description:
        "Manage your projects, listings and property leads.",

      introIcon: Building2,

      intro:
        "Turn your projects into meaningful property opportunities.",

      cards: [
        {
          icon: Building2,
          title: "My Projects",
          description:
            "Manage your projects listed on Xevoprop.",
          link: "/my-projects",
        },

        {
          icon: Plus,
          title: "Add Project",
          description:
            "Create a new project listing.",
          link: "/add-project",
        },

        {
          icon: BarChart3,
          title: "Project Enquiries",
          description:
            "Track enquiries and potential buyers.",
          link: "/project-enquiries",
        },

        {
          icon: Building2,
          title: "Company Profile",
          description:
            "Manage your developer profile.",
          link: "/profile",
        },
      ],
    },
  };

  /* =====================================================
     CURRENT ROLE DATA
  ===================================================== */

  const data =
    dashboardData[role] ||
    dashboardData.Buyer;

  const IntroIcon = data.introIcon;

  /* =====================================================
     DASHBOARD
  ===================================================== */

  return (
    <div className="dashboard-page">

      {/* =================================================
          BACKGROUND GRID
      ================================================= */}

      <div className="dashboard-background-grid" />

      <div className="dashboard-container">

        {/* =================================================
            HEADER
        ================================================= */}

        <header className="dashboard-header">

          <div className="dashboard-heading">

            <span className="dashboard-eyebrow">
              <ShieldCheck size={13} />
              {data.eyebrow}
            </span>

            <h1>
              {data.title}
            </h1>

            <p>
              {data.description}
            </p>

          </div>

          <button
            type="button"
            className="dashboard-logout"
            onClick={logout}
          >
            <LogOut size={15} />
            Logout
          </button>

        </header>

        {/* =================================================
            USER PROFILE STRIP
        ================================================= */}

        <section className="dashboard-user-card">

          <div className="dashboard-user-main">

            <div className="dashboard-avatar">
              {user.name
                ?.charAt(0)
                .toUpperCase()}
            </div>

            <div className="dashboard-user-info">

              <span>
                ACCOUNT HOLDER
              </span>

              <strong>
                {user.name}
              </strong>

              <p>
                {user.email}
              </p>

            </div>

          </div>

          <div className="dashboard-user-status">

            <span className="dashboard-role-badge">
              {role}
            </span>

            <div className="dashboard-account-status">
              <CheckCircle2 size={13} />
              Account active
            </div>

          </div>

        </section>

        {/* =================================================
            INTRODUCTION
        ================================================= */}

        <section className="dashboard-intro">

          <div className="dashboard-intro-icon">
            <IntroIcon size={19} />
          </div>

          <div>
            <span>
              YOUR XEVOPROP JOURNEY
            </span>

            <strong>
              {data.intro}
            </strong>
          </div>

        </section>

        {/* =================================================
            SECTION HEADER
        ================================================= */}

        <div className="dashboard-section-header">

          <div>
            <span>
              QUICK ACCESS
            </span>

            <h2>
              Your workspace
            </h2>
          </div>

          <p>
            Access the tools and services
            available to your account.
          </p>

        </div>

        {/* =================================================
            DASHBOARD CARDS
        ================================================= */}

        <section className="dashboard-grid">

          {data.cards.map((card) => {

            const Icon = card.icon;

            return (
              <Link
                key={card.title}
                to={card.link}
                className="dashboard-card"
              >

                <div className="dashboard-card-top">

                  <div className="dashboard-card-icon">
                    <Icon size={20} />
                  </div>

                  <ArrowRight
                    size={16}
                    className="dashboard-card-arrow"
                  />

                </div>

                <div className="dashboard-card-content">

                  <strong>
                    {card.title}
                  </strong>

                  <span>
                    {card.description}
                  </span>

                </div>

                <div className="dashboard-card-line" />

              </Link>
            );
          })}

        </section>

        {/* =================================================
            SECURITY FOOTER
        ================================================= */}

        <div className="dashboard-security">

          <ShieldCheck size={15} />

          <span>
            Your Xevoprop account is protected with
            secure authentication.
          </span>

          <span className="dashboard-security-divider">
            •
          </span>

          <strong>
            XEVOPROP
          </strong>

        </div>

      </div>
    </div>
  );
}

export default Dashboard;