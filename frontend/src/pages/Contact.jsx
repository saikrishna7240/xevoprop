import { Mail, Phone, MapPin, ArrowRight, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

import "./Contact.css";

function Contact() {
  return (
    <div className="contact-page">

      {/* HERO */}
      <section className="contact-hero">
        <div className="contact-hero-content">
          <span className="contact-eyebrow">
            GET IN TOUCH
          </span>

          <h1>
            Let’s talk about
            <br />
            <em>real estate.</em>
          </h1>

          <p>
            Have a question about a property, want to list a
            property, or looking to work with Xevoprop?
            We’d be happy to hear from you.
          </p>
        </div>
      </section>

      {/* CONTACT CONTENT */}
      <section className="contact-main">
        <div className="contact-grid">

          {/* INFORMATION */}
          <div className="contact-info">
            <span className="contact-section-label">
              CONTACT XEVOPROP
            </span>

            <h2>
              Start a
              <br />
              conversation.
            </h2>

            <p className="contact-intro">
              Whether you are searching for your next property,
              listing one, or exploring a partnership, our team
              is here to help.
            </p>

            <div className="contact-details">

              <a
                href="mailto:contact@xevoprop.com"
                className="contact-detail"
              >
                <div className="contact-detail-icon">
                  <Mail size={18} />
                </div>

                <div>
                  <span>Email</span>
                  <strong>contact@xevoprop.com</strong>
                </div>
              </a>

              <a
                href="tel:+919000000000"
                className="contact-detail"
              >
                <div className="contact-detail-icon">
                  <Phone size={18} />
                </div>

                <div>
                  <span>Phone</span>
                  <strong>+91 90000 00000</strong>
                </div>
              </a>

              <div className="contact-detail">
                <div className="contact-detail-icon">
                  <MapPin size={18} />
                </div>

                <div>
                  <span>Location</span>
                  <strong>India</strong>
                </div>
              </div>

            </div>
          </div>

          {/* FORM */}
          <div className="contact-form-card">
            <div className="contact-form-header">
              <div className="contact-form-icon">
                <MessageCircle size={19} />
              </div>

              <div>
                <span>SEND A MESSAGE</span>
                <h3>How can we help?</h3>
              </div>
            </div>

            <form
              className="contact-form"
              onSubmit={(event) => {
                event.preventDefault();
                alert("Thank you! Your message has been received.");
              }}
            >
              <div className="contact-form-row">

                <div className="contact-field">
                  <label>Name</label>
                  <input
                    type="text"
                    placeholder="Your name"
                    required
                  />
                </div>

                <div className="contact-field">
                  <label>Email</label>
                  <input
                    type="email"
                    placeholder="Your email"
                    required
                  />
                </div>

              </div>

              <div className="contact-field">
                <label>Subject</label>

                <select defaultValue="">
                  <option value="" disabled>
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
                <label>Message</label>

                <textarea
                  rows="6"
                  placeholder="Tell us how we can help..."
                  required
                />
              </div>

              <button
                type="submit"
                className="contact-submit"
              >
                Send Message
                <ArrowRight size={16} />
              </button>
            </form>
          </div>

        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="contact-bottom">
        <span>LOOKING FOR A PROPERTY?</span>

        <h2>
          Your search can
          <br />
          <em>start here.</em>
        </h2>

        <Link
          to="/properties"
          className="contact-properties-btn"
        >
          Explore Properties
          <ArrowRight size={16} />
        </Link>
      </section>

    </div>
  );
}

export default Contact;