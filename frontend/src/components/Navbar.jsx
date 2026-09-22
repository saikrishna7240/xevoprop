import { Link, NavLink, useLocation } from "react-router-dom";
import {
  Bell,
  ChevronDown,
  Menu,
  X,
  UserRound,
  LogIn,
  Plus,
  Building2,
  Heart,
  MessageCircle,
  CalendarDays,
  Home,
  BarChart3,
  Info,
  Phone,
  UsersRound,
  LayoutDashboard,
} from "lucide-react";
import { useState } from "react";

import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

function Navbar() {
  const { user } = useAuth();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);

  const closeMenus = () => {
    setMobileOpen(false);
    setMoreOpen(false);
    setWorkspaceOpen(false);
  };

  const isActivePath = (paths) => {
    return paths.some((path) =>
      location.pathname === path ||
      location.pathname.startsWith(`${path}/`)
    );
  };

  /*
   * =========================================================
   * PRIMARY MARKETPLACE NAVIGATION
   * =========================================================
   *
   * These remain the main navigation for everyone.
   */

  const primaryLinks = [
    {
      label: "Buy",
      path: "/properties",
    },
    {
      label: "Rent",
      path: "/properties?listingType=rent",
    },
    {
      label: "Projects",
      path: "/projects",
    },
    {
      label: "Commercial",
      path: "/properties?type=commercial",
    },
  ];

  /*
   * =========================================================
   * MORE MENU
   * =========================================================
   */

  const moreLinks = [
    {
      label: "Developers",
      path: "/developers",
      icon: UsersRound,
    },
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
   * =========================================================
   * ROLE WORKSPACE
   * =========================================================
   */

  const getWorkspaceLinks = () => {
    if (!user) {
      return [];
    }

    const role = user.role || "Buyer";

    if (role === "Seller") {
      return [
        {
          label: "Dashboard",
          path: "/dashboard",
          icon: LayoutDashboard,
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
        {
          label: "Enquiries",
          path: "/seller-enquiries",
          icon: MessageCircle,
        },
        {
          label: "Visits",
          path: "/seller-visits",
          icon: CalendarDays,
        },
      ];
    }

    if (role === "Developer") {
      return [
        {
          label: "Dashboard",
          path: "/dashboard",
          icon: LayoutDashboard,
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
          label: "My Properties",
          path: "/my-properties",
          icon: Home,
        },
        {
          label: "Leads",
          path: "/leads",
          icon: BarChart3,
        },
        {
          label: "Project Enquiries",
          path: "/project-enquiries",
          icon: MessageCircle,
        },
      ];
    }

    if (role === "Admin") {
      return [
        {
          label: "Admin Dashboard",
          path: "/admin",
          icon: LayoutDashboard,
        },
        {
          label: "Properties",
          path: "/admin/properties",
          icon: Home,
        },
        {
          label: "Projects",
          path: "/admin/projects",
          icon: Building2,
        },
      ];
    }

    return [
      {
        label: "Dashboard",
        path: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        label: "Saved Properties",
        path: "/favorites",
        icon: Heart,
      },
      {
        label: "My Enquiries",
        path: "/my-enquiries",
        icon: MessageCircle,
      },
      {
        label: "My Visits",
        path: "/my-visits",
        icon: CalendarDays,
      },
    ];
  };

  const workspaceLinks = getWorkspaceLinks();

  const workspaceIsActive = workspaceLinks.some((link) =>
    location.pathname === link.path ||
    location.pathname.startsWith(`${link.path}/`)
  );

  const moreIsActive = moreLinks.some((link) =>
    location.pathname === link.path ||
    location.pathname.startsWith(`${link.path}/`)
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
          onClick={closeMenus}
          aria-label="Xevoprop Home"
        >
          <img
            src="/xevoprop-logo.jpeg"
            alt="Xevoprop"
          />
        </Link>

        {/* =====================================================
            DESKTOP PRIMARY NAVIGATION
        ===================================================== */}

        <nav
          className="navbar-primary"
          aria-label="Main navigation"
        >
          {primaryLinks.map((link) => {
            const isRent =
              link.label === "Rent";

            const isCommercial =
              link.label === "Commercial";

            const active =
              isRent
                ? location.pathname === "/properties" &&
                  new URLSearchParams(
                    location.search
                  ).get("listingType") === "rent"
                : isCommercial
                ? location.pathname === "/properties" &&
                  new URLSearchParams(
                    location.search
                  ).get("type") === "commercial"
                : link.path === "/properties"
                ? location.pathname === "/properties" &&
                  !location.search
                : location.pathname.startsWith(
                    link.path
                  );

            return (
              <NavLink
                key={link.label}
                to={link.path}
                className={
                  active
                    ? "navbar-primary-link active"
                    : "navbar-primary-link"
                }
                onClick={closeMenus}
              >
                {link.label}
              </NavLink>
            );
          })}

          {/* More */}

          <div className="navbar-menu-wrapper">

            <button
              type="button"
              className={
                moreIsActive
                  ? "navbar-primary-link navbar-menu-button active"
                  : "navbar-primary-link navbar-menu-button"
              }
              onClick={() =>
                setMoreOpen((current) => !current)
              }
              aria-expanded={moreOpen}
            >
              <span>More</span>

              <ChevronDown
                size={14}
                className={
                  moreOpen
                    ? "navbar-chevron open"
                    : "navbar-chevron"
                }
              />
            </button>

            {moreOpen && (
              <div className="navbar-dropdown">

                <div className="navbar-dropdown-heading">
                  Explore Xevoprop
                </div>

                {moreLinks.map((link) => {
                  const Icon = link.icon;

                  return (
                    <NavLink
                      key={link.path}
                      to={link.path}
                      onClick={closeMenus}
                      className={({ isActive }) =>
                        isActive
                          ? "navbar-dropdown-link active"
                          : "navbar-dropdown-link"
                      }
                    >
                      <span className="navbar-dropdown-icon">
                        <Icon size={16} />
                      </span>

                      <span>
                        {link.label}
                      </span>
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
                to="/list-property"
                className="navbar-list-property"
              >
                <Plus size={15} />
                <span>List Property</span>
              </Link>

              <Link
                to="/login"
                className="navbar-login"
              >
                <LogIn size={15} />
                <span>Login</span>
              </Link>

              <Link
                to="/register"
                className="navbar-register"
              >
                Register
              </Link>
            </>
          ) : (
            <>
              {/* Workspace */}

              <div className="navbar-menu-wrapper">

                <button
                  type="button"
                  className={
                    workspaceIsActive
                      ? "navbar-workspace-button active"
                      : "navbar-workspace-button"
                  }
                  onClick={() =>
                    setWorkspaceOpen(
                      (current) => !current
                    )
                  }
                  aria-expanded={workspaceOpen}
                >
                  <span>Workspace</span>

                  <ChevronDown
                    size={14}
                    className={
                      workspaceOpen
                        ? "navbar-chevron open"
                        : "navbar-chevron"
                    }
                  />
                </button>

                {workspaceOpen && (
                  <div className="navbar-dropdown navbar-workspace-dropdown">

                    <div className="navbar-dropdown-heading">
                      {user.role || "Buyer"} workspace
                    </div>

                    {workspaceLinks.map((link) => {
                      const Icon = link.icon;

                      return (
                        <NavLink
                          key={link.path}
                          to={link.path}
                          onClick={closeMenus}
                          className={({ isActive }) =>
                            isActive
                              ? "navbar-dropdown-link active"
                              : "navbar-dropdown-link"
                          }
                        >
                          <span className="navbar-dropdown-icon">
                            <Icon size={16} />
                          </span>

                          <span>
                            {link.label}
                          </span>
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Notification */}

              <Link
                to="/notifications"
                className="navbar-icon-button"
                aria-label="Notifications"
              >
                <Bell size={18} />

                <span className="navbar-notification-dot"></span>
              </Link>

              {/* Profile */}

              <Link
                to="/profile"
                className="navbar-profile"
                aria-label="Profile"
              >
                <span className="navbar-profile-avatar">
                  {user.name
                    ?.charAt(0)
                    .toUpperCase() || "U"}
                </span>

                <span className="navbar-profile-name">
                  {user.name || "Account"}
                </span>
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
            setMobileOpen((current) => !current)
          }
          aria-label="Toggle navigation"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? (
            <X size={22} />
          ) : (
            <Menu size={22} />
          )}
        </button>
      </div>

      {/* =====================================================
          MOBILE NAVIGATION
      ===================================================== */}

      {mobileOpen && (
        <div className="mobile-navbar">

          <div className="mobile-navbar-search">
            <span>Explore Xevoprop</span>
          </div>

          {/* Primary */}

          <div className="mobile-section">

            <div className="mobile-section-title">
              Marketplace
            </div>

            {primaryLinks.map((link) => (
              <NavLink
                key={link.label}
                to={link.path}
                onClick={closeMenus}
                className="mobile-nav-link"
              >
                <span>{link.label}</span>
              </NavLink>
            ))}

          </div>

          {/* More */}

          <div className="mobile-section">

            <div className="mobile-section-title">
              Discover
            </div>

            {moreLinks.map((link) => {
              const Icon = link.icon;

              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={closeMenus}
                  className="mobile-nav-link"
                >
                  <span className="mobile-nav-icon">
                    <Icon size={16} />
                  </span>

                  <span>{link.label}</span>
                </NavLink>
              );
            })}

          </div>

          {/* Workspace */}

          {user && workspaceLinks.length > 0 && (
            <div className="mobile-section">

              <div className="mobile-section-title">
                {user.role || "Buyer"} workspace
              </div>

              {workspaceLinks.map((link) => {
                const Icon = link.icon;

                return (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    onClick={closeMenus}
                    className="mobile-nav-link"
                  >
                    <span className="mobile-nav-icon">
                      <Icon size={16} />
                    </span>

                    <span>{link.label}</span>
                  </NavLink>
                );
              })}

            </div>
          )}

          {/* Account */}

          <div className="mobile-actions">

            {!user ? (
              <>
                <Link
                  to="/login"
                  onClick={closeMenus}
                  className="mobile-login"
                >
                  <LogIn size={16} />
                  Login
                </Link>

                <Link
                  to="/register"
                  onClick={closeMenus}
                  className="mobile-register"
                >
                  Create account
                </Link>

                <Link
                  to="/list-property"
                  onClick={closeMenus}
                  className="mobile-list-property"
                >
                  <Plus size={16} />
                  List your property
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/notifications"
                  onClick={closeMenus}
                  className="mobile-login"
                >
                  <Bell size={16} />
                  Notifications
                </Link>

                <Link
                  to="/profile"
                  onClick={closeMenus}
                  className="mobile-login"
                >
                  <UserRound size={16} />
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

export default Navbar;