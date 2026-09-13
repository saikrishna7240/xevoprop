import { Link } from "react-router-dom";

import {
  Heart,
  Search,
  UserRound,
  LogOut,
  Building2,
  Plus,
  MessageCircle,
  BarChart3,
  Home,
  BriefcaseBusiness,
  CalendarDays,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

import "./Dashboard.css";

function Dashboard() {
  const { user, logout } = useAuth();

  /* =================================
     NOT LOGGED IN
  ================================= */

  if (!user) {
    return (
      <div className="dashboard-login">

        <UserRound size={35} />

        <h1>
          You're not signed in
        </h1>

        <p>
          Please sign in to access
          your dashboard.
        </p>

        <Link to="/login">
          Sign in
        </Link>

      </div>
    );
  }

  /* =================================
     USER ROLE
  ================================= */

  const role =
    user.role || "Buyer";

  /* =================================
     DASHBOARD DATA
  ================================= */

  const dashboardData = {

    /* =================================
       BUYER
    ================================= */

    Buyer: {

      eyebrow:
        "BUYER DASHBOARD",

      title:
        `Welcome, ${user.name}.`,

      description:
        "Discover properties and manage your property journey.",

      cards: [

        {
          icon: Search,

          title:
            "Explore Properties",

          description:
            "Discover properties matching your requirements.",

          link:
            "/properties",
        },

        {
          icon: Heart,

          title:
            "Saved Properties",

          description:
            "View the properties you've saved.",

          link:
            "/favorites",
        },

        {
          icon: MessageCircle,

          title:
            "My Enquiries",

          description:
            "Track your property enquiries and conversations.",

          link:
            "/my-enquiries",
        },

        {
          icon: CalendarDays,

          title:
            "My Visits",

          description:
            "View and manage your scheduled property visits.",

          link:
            "/my-visits",
        },

        {
          icon: UserRound,

          title:
            "My Profile",

          description:
            "Manage your personal information.",

          link:
            "/profile",
        },

      ],
    },

    /* =================================
       SELLER
    ================================= */

    Seller: {

      eyebrow:
        "SELLER DASHBOARD",

      title:
        `Welcome, ${user.name}.`,

      description:
        "Manage your properties and connect with interested buyers.",

      cards: [

        {
          icon: Home,

          title:
            "My Properties",

          description:
            "View and manage your listed properties.",

          link:
            "/my-properties",
        },

        {
          icon: Plus,

          title:
            "List a Property",

          description:
            "Add a new property to Xevoprop.",

          link:
            "/list-property",
        },

        {
          icon: CalendarDays,

          title:
            "Schedule Visit",

          description:
            "Manage property visits and appointments.",

          link:
            "/seller-visits",
        },

        {
          icon: MessageCircle,

          title:
            "Buyer Enquiries",

          description:
            "See people interested in your properties.",

          link:
            "/seller-enquiries",
        },

        {
          icon: UserRound,

          title:
            "My Profile",

          description:
            "Manage your seller profile.",

          link:
            "/profile",
        },

      ],
    },

    /* =================================
       DEVELOPER
    ================================= */

    Developer: {

      eyebrow:
        "DEVELOPER DASHBOARD",

      title:
        `Welcome, ${user.name}.`,

      description:
        "Manage your projects, listings and property leads.",

      cards: [

        {
          icon: Building2,

          title:
            "My Projects",

          description:
            "Manage your projects listed on Xevoprop.",

          link:
            "/my-projects",
        },

        {
          icon: Plus,

          title:
            "Add Project",

          description:
            "Create a new project listing.",

          link:
            "/add-project",
        },

        {
          icon: BarChart3,

          title:
            "Project Leads",

          description:
            "Track enquiries and potential buyers.",

          link:
            "/leads",
        },

        {
          icon: BriefcaseBusiness,

          title:
            "Company Profile",

          description:
            "Manage your developer profile.",

          link:
            "/profile",
        },

      ],
    },

  };

  /* =================================
     CURRENT ROLE DATA
  ================================= */

  const data =
    dashboardData[role] ||
    dashboardData.Buyer;

  return (

    <div className="dashboard-page">

      <div className="dashboard-container">

        {/* =================================
            HEADER
        ================================= */}

        <div className="dashboard-header">

          <div>

            <span>
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
            className="logout-btn"
            onClick={logout}
          >

            <LogOut size={15} />

            Logout

          </button>

        </div>

        {/* =================================
            USER CARD
        ================================= */}

        <div className="dashboard-user">

          <div className="user-avatar">

            {user.name
              ?.charAt(0)
              .toUpperCase()}

          </div>

          <div className="user-details">

            <strong>
              {user.name}
            </strong>

            <p>
              {user.email}
            </p>

          </div>

          <span className="user-role">
            {role}
          </span>

        </div>

        {/* =================================
            INTRO
        ================================= */}

        <div className="dashboard-intro">

          {role === "Buyer" && (
            <>
              <Search size={18} />

              <span>
                Your next property could be
                closer than you think.
              </span>
            </>
          )}

          {role === "Seller" && (
            <>
              <Home size={18} />

              <span>
                Put your property in front of
                the right audience.
              </span>
            </>
          )}

          {role === "Developer" && (
            <>
              <Building2 size={18} />

              <span>
                Turn your projects into meaningful
                property opportunities.
              </span>
            </>
          )}

        </div>

        {/* =================================
            DASHBOARD CARDS
        ================================= */}

        <div className="dashboard-grid">

          {data.cards.map((card) => {

            const Icon =
              card.icon;

            return (

              <Link
                key={card.title}
                to={card.link}
                className="dashboard-card"
              >

                <Icon size={21} />

                <strong>
                  {card.title}
                </strong>

                <span>
                  {card.description}
                </span>

              </Link>

            );

          })}

        </div>

      </div>

    </div>

  );
}

export default Dashboard;