import { useState } from "react";
import {
  ArrowUpRight,
  Mail,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";

import "./Footer.css";

function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const handleSubscribe = async (event) => {
    event.preventDefault();

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setStatus("error");
      setMessage("Please enter your email address.");
      return;
    }

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(trimmedEmail)) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      /*
       * FRONTEND SUBSCRIPTION
       *
       * This currently simulates a successful subscription.
       *
       * When the newsletter API is ready, replace this
       * section with:
       *
       * const response = await fetch(
       *   `${API_URL}/newsletter/subscribe`,
       *   {
       *     method: "POST",
       *     headers: {
       *       "Content-Type": "application/json",
       *     },
       *     body: JSON.stringify({
       *       email: trimmedEmail,
       *     }),
       *   }
       * );
       */

      await new Promise((resolve) =>
        setTimeout(resolve, 700)
      );

      setStatus("success");
      setMessage(
        "You're subscribed! We'll keep you updated."
      );

      setEmail("");
    } catch (error) {
      console.error("Newsletter subscription error:", error);

      setStatus("error");
      setMessage(
        "Something went wrong. Please try again."
      );
    }
  };

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
                onClick={(event) =>
                  event.preventDefault()
                }
              >
                in
              </a>

              <a
                href="#"
                aria-label="Instagram"
                className="footer-social"
                onClick={(event) =>
                  event.preventDefault()
                }
              >
                ◎
              </a>

              <a
                href="#"
                aria-label="YouTube"
                className="footer-social"
                onClick={(event) =>
                  event.preventDefault()
                }
              >
                ▶
              </a>

              <a
                href="#"
                aria-label="Facebook"
                className="footer-social"
                onClick={(event) =>
                  event.preventDefault()
                }
              >
                f
              </a>
            </div>
          </div>

          {/* QUICK LINKS */}
          <div className="footer-column">
            <h4>Quick Links</h4>

            <Link to="/">Home</Link>

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
              onSubmit={handleSubscribe}
            >
              <div
                className={`footer-email-wrapper ${
                  status === "error"
                    ? "has-error"
                    : ""
                } ${
                  status === "success"
                    ? "has-success"
                    : ""
                }`}
              >
                <Mail size={14} />

                <input
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);

                    if (status !== "idle") {
                      setStatus("idle");
                      setMessage("");
                    }
                  }}
                  placeholder="Enter your email"
                  aria-label="Email address"
                  disabled={status === "loading"}
                />
              </div>

              <button
                type="submit"
                disabled={status === "loading"}
              >
                {status === "loading" ? (
                  <>
                    <Loader2
                      size={14}
                      className="footer-subscribe-spinner"
                    />
                    Subscribing...
                  </>
                ) : (
                  <>
                    Subscribe
                    <ArrowUpRight size={14} />
                  </>
                )}
              </button>
            </form>

            {/* STATUS MESSAGE */}
            {status === "success" && (
              <div className="footer-subscribe-message success">
                <CheckCircle2 size={14} />
                <span>{message}</span>
              </div>
            )}

            {status === "error" && (
              <div className="footer-subscribe-message error">
                <AlertCircle size={14} />
                <span>{message}</span>
              </div>
            )}
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
              onClick={(event) => {
                event.preventDefault();

                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                });
              }}
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