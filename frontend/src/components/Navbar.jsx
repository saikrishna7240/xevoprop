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
} from "lucide-react";
import { useState } from "react";

import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

function Navbar() {
  const { user } = useAuth();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] =
    useState(false);

  const isHomePage =
    location.pathname === "/";

  /*
   * PUBLIC NAVBAR
   * Shown before login and on Home page
   */

  const publicLinks = [
    {
      label: "Properties",
      path: "/properties",
      icon: Search,
    },
    {
      label: "About",
      path: "/about",
    },
  ];

  /*
   * BUYER
   */

  const buyerLinks = [
    {
      label: "Properties",
      path: "/properties",
      icon: Search,
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
  ];

  /*
   * SELLER
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
      icon: MessageCircle,
    },
  ];

  /*
   * DEVELOPER
   */

  const developerLinks = [
    {
      label: "Properties",
      path: "/properties",
      icon: Search,
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
    {
  label: "Notifications",
  path: "/notifications",
  icon: Bell,
},

  ];

  /*
   * SELECT NAVIGATION
   */

  let navLinks = publicLinks;

  if (!isHomePage && user) {
    const role =
      user.role || "Buyer";

    if (role === "Seller") {
      navLinks = sellerLinks;
    } else if (role === "Developer") {
      navLinks = developerLinks;
    } else {
      navLinks = buyerLinks;
    }
  }

  const closeMenu = () => {
    setMobileOpen(false);
  };

  return (
    <header className="xevoprop-navbar">

      <div className="navbar-container">

        {/* LOGO */}

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

        {/* DESKTOP NAVIGATION */}

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

                {Icon && (
                  <Icon size={14} />
                )}

                <span>
                  {link.label}
                </span>

              </NavLink>
            );

          })}

        </nav>

        {/* RIGHT SIDE */}

        <div className="navbar-actions">

          {isHomePage || !user ? (

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
              <Link
                to="/dashboard"
                className="navbar-dashboard"
              >
                Dashboard
              </Link>

              <Link
                to="/profile"
                className="navbar-avatar"
              >
                {user.name
                  ?.charAt(0)
                  .toUpperCase() || "U"}
              </Link>
            </>

          )}

        </div>

        {/* MOBILE BUTTON */}

        <button
          type="button"
          className="navbar-mobile-button"
          onClick={() =>
            setMobileOpen(
              !mobileOpen
            )
          }
        >

          {mobileOpen ? (
            <X size={21} />
          ) : (
            <Menu size={21} />
          )}

        </button>

      </div>

      {/* MOBILE NAVIGATION */}

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

                  {Icon && (
                    <Icon size={16} />
                  )}

                  {link.label}

                </NavLink>
              );

            })}

          </nav>

          <div className="mobile-actions">

            {isHomePage || !user ? (

              <>
                <Link
                  to="/login"
                  onClick={closeMenu}
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  onClick={closeMenu}
                >
                  Get Started
                </Link>
              </>

            ) : (

              <Link
                to="/dashboard"
                onClick={closeMenu}
              >
                <UserRound size={15} />
                Dashboard
              </Link>

            )}

          </div>

        </div>

      )}

    </header>
  );
}

export default Navbar;