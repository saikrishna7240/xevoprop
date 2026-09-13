import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">

        <div className="footer-top">

          {/* BRAND */}
          <div className="footer-brand">

            <Link to="/">
              <img
                src="/xevoprop-logo.png"
                alt="Xevoprop"
              />
            </Link>

            <p>
              A smarter way to discover, connect
              and decide in real estate.
            </p>

            <div className="footer-socials">
              <a href="#" aria-label="LinkedIn">
                in
              </a>

              <a href="#" aria-label="Instagram">
                ◎
              </a>

              <a href="#" aria-label="X">
                𝕏
              </a>
            </div>

          </div>


          {/* EXPLORE */}
          <div className="footer-links">

            <div>
              <h4>Explore</h4>

              <Link to="/properties">
                Properties
              </Link>

              <Link to="/search">
                Search Properties
              </Link>

              <Link to="/projects">
                Projects
              </Link>

              <Link to="/about">
                Why Xevoprop
              </Link>
            </div>


            {/* PLATFORM */}
            <div>
              <h4>Platform</h4>

              <Link to="/properties?type=buy">
                Buy Property
              </Link>

              <Link to="/properties?type=rent">
                Rent Property
              </Link>

              <Link to="/properties?type=commercial">
                Commercial
              </Link>

              <Link to="/properties?type=plot">
                Plots
              </Link>
            </div>


            {/* ACCOUNT */}
            <div>
              <h4>Account</h4>

              <Link to="/login">
                Login
              </Link>

              <Link to="/register">
                Create Account
              </Link>

              <Link to="/profile">
                My Profile
              </Link>

              <Link to="/favorites">
                My Favorites
              </Link>
            </div>

          </div>

        </div>


        {/* DIVIDER */}
        <div className="footer-divider"></div>


        {/* BOTTOM */}
        <div className="footer-bottom">

          <span>
            © 2026 Xevoprop. All rights reserved.
          </span>

          <span className="footer-tagline">
            Discover. Connect. Decide.
          </span>

          <div className="footer-bottom-right">

            <Link to="/privacy">
              Privacy
            </Link>

            <Link to="/contact">
              Contact
            </Link>

            <a href="#top" className="back-top">
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