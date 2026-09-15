import {
  ArrowUpRight,
  Mail,
} from "lucide-react";

import { Link } from "react-router-dom";

import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">

      <div className="footer-container">

        {/* MAIN FOOTER */}
        <div className="footer-main">

          {/* BRAND */}
          <div className="footer-brand">

            <Link to="/" className="footer-logo">
              <img
                src="/xevoprop-logo.png"
                alt="Xevoprop"
              />
            </Link>

            <p className="footer-description">
              Your trusted partner in real estate.
              Discover premium properties, connect
              with verified developers, and build a
              brighter future with XevopropTech.
            </p>

            {/* SOCIALS */}
            <div className="footer-socials">

              <a
                href="#"
                aria-label="LinkedIn"
                className="footer-social"
              >
                in
              </a>

              <a
                href="#"
                aria-label="Instagram"
                className="footer-social"
              >
                ◎
              </a>

              <a
                href="#"
                aria-label="YouTube"
                className="footer-social"
              >
                ▶
              </a>

              <a
                href="#"
                aria-label="Facebook"
                className="footer-social"
              >
                f
              </a>

            </div>

          </div>


          {/* QUICK LINKS */}
          <div className="footer-column">

            <h4>Quick Links</h4>

            <Link to="/">
              Home
            </Link>

            <Link to="/properties">
              Properties
            </Link>

            <Link to="/projects">
              Projects
            </Link>

            <Link to="/about">
              About
            </Link>

            <Link to="/contact">
              Contact
            </Link>

          </div>


          {/* PROPERTY TYPES */}
          <div className="footer-column">

            <h4>Property Types</h4>

            <Link to="/properties?type=residential">
              Residential
            </Link>

            <Link to="/properties?type=commercial">
              Commercial
            </Link>

            <Link to="/properties?type=plot">
              Plots
            </Link>

            <Link to="/properties?type=villa">
              Villas
            </Link>

            <Link to="/properties?type=apartment">
              Apartments
            </Link>

          </div>


          {/* SUPPORT */}
          <div className="footer-column">

            <h4>Support</h4>

            <Link to="/help">
              Help Center
            </Link>

            <Link to="/terms">
              Terms &amp; Conditions
            </Link>

            <Link to="/privacy">
              Privacy Policy
            </Link>

            <Link to="/faq">
              FAQ
            </Link>

            <Link to="/contact">
              Contact Us
            </Link>

          </div>


          {/* NEWSLETTER */}
          <div className="footer-newsletter">

            <h4>
              Subscribe to our Newsletter
            </h4>

            <p>
              Get the latest property updates and
              investment opportunities.
            </p>

            <form
              className="footer-newsletter-form"
              onSubmit={(e) => e.preventDefault()}
            >

              <div className="footer-email-wrapper">

                <Mail size={14} />

                <input
                  type="email"
                  placeholder="Enter your email"
                  aria-label="Email address"
                />

              </div>

              <button type="submit">
                Subscribe
              </button>

            </form>

          </div>

        </div>


        {/* DIVIDER */}
        <div className="footer-divider" />


        {/* BOTTOM FOOTER */}
        <div className="footer-bottom">

          <span>
            © 2026 XevopropTech Pvt Ltd. All rights
            reserved.
          </span>

          <div className="footer-bottom-links">

            <Link to="/privacy">
              Privacy
            </Link>

            <Link to="/contact">
              Contact
            </Link>

            <a
              href="#top"
              className="back-top"
            >
              Back to top
              <ArrowUpRight size={14} />
            </a>

          </div>

        </div>

      </div>

    </footer>
  );
}

export default Footer;