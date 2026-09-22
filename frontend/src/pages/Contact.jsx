import {
  ArrowRight,
  CheckCircle2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";

import "./Contact.css";

function Contact() {
  return (
    <div className="contact-page">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="contact-hero">

        <div className="contact-hero-grid" />

        <div className="contact-hero-inner">

          <div className="contact-hero-content">

            <span className="contact-eyebrow">
              <MessageCircle size={13} />
              XEVOPROP CONTACT
            </span>

            <h1>
              Let’s talk about
              <br />
              <span>real estate.</span>
            </h1>

            <p>
              Have a question about a property, want to
              list a property, or looking to work with
              Xevoprop? Our team is here to help.
            </p>

          </div>

          <div className="contact-hero-badge">

            <ShieldCheck size={22} />

            <div>
              <strong>
                Property Support
              </strong>

              <span>
                Helping you take the next step.
              </span>
            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          CONTACT CONTENT
      ===================================================== */}

      <main className="contact-main">

        <div className="contact-grid">

          {/* =================================================
              INFORMATION
          ================================================= */}

          <section className="contact-info">

            <span className="contact-section-label">
              CONTACT XEVOPROP
            </span>

            <h2>
              Start a
              <br />
              <span>conversation.</span>
            </h2>

            <p className="contact-intro">
              Whether you are searching for your next
              property, listing one, or exploring a
              partnership, our team is here to help.
            </p>

            <div className="contact-details">

              {/* EMAIL */}

              <a
                href="mailto:contact@xevoprop.com"
                className="contact-detail"
              >

                <div className="contact-detail-icon">
                  <Mail size={18} />
                </div>

                <div className="contact-detail-content">
                  <span>Email</span>
                  <strong>
                    contact@xevoprop.com
                  </strong>
                  <small>
                    Send us your enquiry anytime
                  </small>
                </div>

                <ArrowRight
                  size={15}
                  className="contact-detail-arrow"
                />

              </a>

              {/* PHONE */}

              <a
                href="tel: +917013438613"
                className="contact-detail"
              >

                <div className="contact-detail-icon">
                  <Phone size={18} />
                </div>

                <div className="contact-detail-content">
                  <span>Phone</span>
                  <strong>
                     +91 70134 38613
                  </strong>
                  <small>
                    Speak directly with our team
                  </small>
                </div>

                <ArrowRight
                  size={15}
                  className="contact-detail-arrow"
                />

              </a>

              {/* LOCATION */}

              <div className="contact-detail">

                <div className="contact-detail-icon">
                  <MapPin size={18} />
                </div>

                <div className="contact-detail-content">
                  <span>Location</span>
                  <strong>
                    India
                  </strong>
                  <small>
                    Serving property participants
                    across India
                  </small>
                </div>

              </div>

            </div>

            {/* TRUST CARD */}

            <div className="contact-trust-card">

              <div className="contact-trust-icon">
                <CheckCircle2 size={20} />
              </div>

              <div>
                <strong>
                  Need property assistance?
                </strong>

                <p>
                  Tell us what you are looking for
                  and our team can help you identify
                  the right next step.
                </p>
              </div>

            </div>

          </section>

          {/* =================================================
              FORM
          ================================================= */}

          <section className="contact-form-card">

            <div className="contact-form-header">

              <div className="contact-form-icon">
                <MessageCircle size={19} />
              </div>

              <div>
                <span>
                  SEND A MESSAGE
                </span>

                <h3>
                  How can we help?
                </h3>

                <p>
                  Share a few details and we'll
                  understand your enquiry.
                </p>
              </div>

            </div>

            <form
              className="contact-form"
              onSubmit={(event) => {
                event.preventDefault();

                alert(
                  "Thank you! Your message has been received."
                );
              }}
            >

              <div className="contact-form-row">

                <div className="contact-field">

                  <label>
                    Name
                  </label>

                  <input
                    type="text"
                    placeholder="Your name"
                    required
                  />

                </div>

                <div className="contact-field">

                  <label>
                    Email
                  </label>

                  <input
                    type="email"
                    placeholder="Your email"
                    required
                  />

                </div>

              </div>

              <div className="contact-field">

                <label>
                  Subject
                </label>

                <select defaultValue="" required>

                  <option
                    value=""
                    disabled
                  >
                    Select a subject
                  </option>

                  <option value="property">
                    Property enquiry
                  </option>

                  <option value="listing">
                    List a property
                  </option>

                  <option value="developer">
                    Developer partnership
                  </option>

                  <option value="support">
                    Platform support
                  </option>

                  <option value="other">
                    Other
                  </option>

                </select>

              </div>

              <div className="contact-field">

                <label>
                  Message
                </label>

                <textarea
                  rows="6"
                  placeholder="Tell us how we can help..."
                  required
                />

              </div>

              <div className="contact-form-footer">

                <span>
                  <ShieldCheck size={14} />
                  Your enquiry is handled securely.
                </span>

                <button
                  type="submit"
                  className="contact-submit"
                >
                  Send Message
                  <ArrowRight size={16} />
                </button>

              </div>

            </form>

          </section>

        </div>

      </main>

      {/* =====================================================
          BOTTOM CTA
      ===================================================== */}

      <section className="contact-bottom">

        <div className="contact-bottom-grid" />

        <div className="contact-bottom-content">

          <span>
            LOOKING FOR A PROPERTY?
          </span>

          <h2>
            Your search can
            <br />
            <em>start here.</em>
          </h2>

          <p>
            Explore available properties and find
            the right place for your next move.
          </p>

          <Link
            to="/properties"
            className="contact-properties-btn"
          >
            Explore Properties
            <ArrowRight size={16} />
          </Link>

        </div>

      </section>

    </div>
  );
}

export default Contact;