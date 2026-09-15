import { Link, NavLink, useLocation } from "react-router-dom";
import {
  Search,
  Heart,
  MessageCircle,
  Home,
  Plus,
  Bell,
  Building2,
  BarChart3,
  UserRound,
  LogIn,
  Menu,
  X,
  CalendarDays,
  ChevronDown,
  Info,
  Phone,
} from "lucide-react";
import { useState } from "react";

import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

function Navbar() {
  const { user } = useAuth();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  /*
   * PUBLIC NAVIGATION
   */

  const publicLinks = [
    {
      label: "Properties",
      path: "/properties",
      icon: Search,
    },
    {
      label: "Projects",
      path: "/projects",
      icon: Building2,
    },
    {
      label: "Developers",
      path: "/developers",
      icon: Building2,
    },
  ];

  /*
   * BUYER NAVIGATION
   */

  const buyerLinks = [
    {
      label: "Properties",
      path: "/properties",
      icon: Search,
    },
    {
      label: "Projects",
      path: "/projects",
      icon: Building2,
    },
    {
      label: "Saved",
      path: "/favorites",
      icon: Heart,
    },
    {
      label: "Enquiries",
      path: "/my-enquiries",
      icon: MessageCircle,
    },
    {
      label: "Visits",
      path: "/my-visits",
      icon: CalendarDays,
    },
  ];

  /*
   * SELLER NAVIGATION
   */

  const sellerLinks = [
    {
      label: "Properties",
      path: "/properties",
      icon: Search,
    },
    {
      label: "My Properties",
      path: "/my-properties",
      icon: Home,
    },
    {
      label: "List Property",
      path: "/list-property",
      icon: Plus,
    },
    {
      label: "Leads",
      path: "/leads",
      icon: BarChart3,
    },
  ];

  /*
   * DEVELOPER NAVIGATION
   */

  const developerLinks = [
    {
      label: "Properties",
      path: "/properties",
      icon: Search,
    },
    {
      label: "Projects",
      path: "/projects",
      icon: Building2,
    },
    {
      label: "My Projects",
      path: "/my-projects",
      icon: Building2,
    },
    {
      label: "Add Project",
      path: "/add-project",
      icon: Plus,
    },
    {
      label: "Leads",
      path: "/leads",
      icon: BarChart3,
    },
  ];

  /*
   * SELECT NAVIGATION
   */

  let navLinks = publicLinks;

  if (user) {
    const role = user.role || "Buyer";

    if (role === "Seller") {
      navLinks = sellerLinks;
    } else if (role === "Developer") {
      navLinks = developerLinks;
    } else {
      navLinks = buyerLinks;
    }
  }

  /*
   * MORE MENU
   */

  const moreLinks = [
    {
      label: "About Xevoprop",
      path: "/about",
      icon: Info,
    },
    {
      label: "Contact Us",
      path: "/contact",
      icon: Phone,
    },
  ];

  /*
   * MOBILE MENU CLOSE
   */

  const closeMenu = () => {
    setMobileOpen(false);
    setMoreOpen(false);
  };

  /*
   * CHECK MORE ACTIVE
   */

  const isMoreActive = moreLinks.some(
    (link) => location.pathname === link.path
  );

  return (
    <header className="xevoprop-navbar">
      <div className="navbar-container">

        {/* =====================================================
            LOGO
            ===================================================== */}

        <Link
          to="/"
          className="navbar-logo"
          onClick={closeMenu}
        >
          <img
            src="/xevoprop-logo.png"
            alt="Xevoprop"
          />
        </Link>

        {/* =====================================================
            DESKTOP NAVIGATION
            ===================================================== */}

        <nav className="navbar-links">

          {navLinks.map((link) => {
            const Icon = link.icon;

            return (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  isActive
                    ? "navbar-link active"
                    : "navbar-link"
                }
              >
                {Icon && <Icon size={14} />}

                <span>{link.label}</span>
              </NavLink>
            );
          })}

          {/* MORE */}

          <div className="navbar-more">

            <button
              type="button"
              className={
                isMoreActive
                  ? "navbar-link navbar-more-button active"
                  : "navbar-link navbar-more-button"
              }
              onClick={() => setMoreOpen(!moreOpen)}
            >
              <span>More</span>
              <ChevronDown
                size={13}
                className={
                  moreOpen
                    ? "more-chevron rotated"
                    : "more-chevron"
                }
              />
            </button>

            {moreOpen && (
              <div className="navbar-dropdown">

                {moreLinks.map((link) => {
                  const Icon = link.icon;

                  return (
                    <NavLink
                      key={link.path}
                      to={link.path}
                      onClick={closeMenu}
                      className={({ isActive }) =>
                        isActive
                          ? "navbar-dropdown-link active"
                          : "navbar-dropdown-link"
                      }
                    >
                      <Icon size={15} />

                      <span>{link.label}</span>
                    </NavLink>
                  );
                })}

              </div>
            )}

          </div>

        </nav>

        {/* =====================================================
            RIGHT SIDE
            ===================================================== */}

        <div className="navbar-actions">

          {!user ? (
            <>
              <Link
                to="/login"
                className="navbar-login"
              >
                <LogIn size={14} />
                Login
              </Link>

              <Link
                to="/register"
                className="navbar-start"
              >
                Get Started
              </Link>
            </>
          ) : (
            <>
              {/* NOTIFICATIONS */}

              <Link
                to="/notifications"
                className="navbar-notification"
                aria-label="Notifications"
              >
                <Bell size={17} />
              </Link>

              {/* DASHBOARD */}

              <Link
                to="/dashboard"
                className="navbar-dashboard"
              >
                Dashboard
              </Link>

              {/* PROFILE */}

              <Link
                to="/profile"
                className="navbar-avatar"
                aria-label="Profile"
              >
                {user.name
                  ?.charAt(0)
                  .toUpperCase() || "U"}
              </Link>
            </>
          )}

        </div>

        {/* =====================================================
            MOBILE BUTTON
            ===================================================== */}

        <button
          type="button"
          className="navbar-mobile-button"
          onClick={() =>
            setMobileOpen(!mobileOpen)
          }
          aria-label="Toggle navigation"
        >
          {mobileOpen ? (
            <X size={21} />
          ) : (
            <Menu size={21} />
          )}
        </button>

      </div>

      {/* =====================================================
          MOBILE NAVIGATION
          ===================================================== */}

      {mobileOpen && (
        <div className="mobile-navbar">

          <nav>

            {navLinks.map((link) => {
              const Icon = link.icon;

              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    isActive
                      ? "mobile-nav-link active"
                      : "mobile-nav-link"
                  }
                >
                  {Icon && <Icon size={16} />}

                  <span>{link.label}</span>
                </NavLink>
              );
            })}

            {/* MOBILE MORE LINKS */}

            <div className="mobile-more-title">
              More
            </div>

            {moreLinks.map((link) => {
              const Icon = link.icon;

              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    isActive
                      ? "mobile-nav-link active"
                      : "mobile-nav-link"
                  }
                >
                  <Icon size={16} />

                  <span>{link.label}</span>
                </NavLink>
              );
            })}

          </nav>

          {/* MOBILE ACTIONS */}

          <div className="mobile-actions">

            {!user ? (
              <>
                <Link
                  to="/login"
                  onClick={closeMenu}
                >
                  <LogIn size={15} />
                  Login
                </Link>

                <Link
                  to="/register"
                  onClick={closeMenu}
                >
                  Get Started
                  <ArrowRightIcon />
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/notifications"
                  onClick={closeMenu}
                >
                  <Bell size={15} />
                  Notifications
                </Link>

                <Link
                  to="/dashboard"
                  onClick={closeMenu}
                >
                  <UserRound size={15} />
                  Dashboard
                </Link>

                <Link
                  to="/profile"
                  onClick={closeMenu}
                >
                  <UserRound size={15} />
                  Profile
                </Link>
              </>
            )}

          </div>

        </div>
      )}

    </header>
  );
}

/*
 * Small arrow component used only
 * inside the mobile Get Started button.
 */

function ArrowRightIcon() {
  return <span aria-hidden="true">→</span>;
}

export default Navbar;