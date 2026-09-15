import {
  ArrowRight,
  Building2,
  ShieldCheck,
  Search,
  Users,
  CheckCircle2,
} from "lucide-react";
import { Link } from "react-router-dom";

import "./About.css";

function About() {
  return (
    <div className="about-page">

      {/* HERO */}
      <section className="about-hero">
        <div className="about-hero-content">
          <span className="about-eyebrow">
            ABOUT XEVOPROP
          </span>

          <h1>
            Real estate,
            <br />
            <em>made more certain.</em>
          </h1>

          <p>
            Xevoprop is a smarter real-estate platform designed
            to make discovering, comparing and connecting with
            properties simpler and more transparent.
          </p>
        </div>

        <div className="about-hero-mark">
          <Building2 size={38} />
          <span>XP</span>
        </div>
      </section>

      {/* MISSION */}
      <section className="about-mission">
        <div className="about-section-label">
          OUR PURPOSE
        </div>

        <div className="about-mission-grid">
          <h2>
            Less uncertainty.
            <br />
            <span>Better decisions.</span>
          </h2>

          <div className="about-mission-copy">
            <p>
              Finding a property should not feel like navigating
              dozens of disconnected websites, listings and
              conversations.
            </p>

            <p>
              Xevoprop brings property discovery, information,
              enquiries, visits and connections together in one
              focused platform.
            </p>

            <Link to="/properties" className="about-link">
              Explore properties
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="about-values">
        <div className="about-values-header">
          <span className="about-section-label">
            WHAT WE BELIEVE
          </span>

          <h2>
            Built around the
            <br />
            <em>property journey.</em>
          </h2>
        </div>

        <div className="about-values-grid">

          <article className="about-value-card">
            <div className="about-value-number">01</div>

            <div className="about-value-icon">
              <Search size={21} />
            </div>

            <h3>Discover clearly</h3>

            <p>
              Search and explore properties using practical
              information that helps narrow down the right
              choices.
            </p>
          </article>

          <article className="about-value-card">
            <div className="about-value-number">02</div>

            <div className="about-value-icon">
              <ShieldCheck size={21} />
            </div>

            <h3>Build confidence</h3>

            <p>
              Present property information in a clear,
              structured way so buyers can make decisions
              with greater confidence.
            </p>
          </article>

          <article className="about-value-card">
            <div className="about-value-number">03</div>

            <div className="about-value-icon">
              <Users size={21} />
            </div>

            <h3>Connect directly</h3>

            <p>
              Make it easier for buyers, sellers and developers
              to communicate and move from interest to action.
            </p>
          </article>

        </div>
      </section>

      {/* PLATFORM */}
      <section className="about-platform">
        <div className="about-platform-inner">

          <div className="about-platform-content">
            <span className="about-section-label">
              ONE PLATFORM
            </span>

            <h2>
              From the first
              <br />
              <em>search to the next step.</em>
            </h2>

            <p>
              Xevoprop brings the important parts of the
              property journey into one connected experience.
            </p>

            <div className="about-platform-points">

              <div>
                <CheckCircle2 size={17} />
                <span>Property discovery</span>
              </div>

              <div>
                <CheckCircle2 size={17} />
                <span>Property comparison</span>
              </div>

              <div>
                <CheckCircle2 size={17} />
                <span>Direct enquiries</span>
              </div>

              <div>
                <CheckCircle2 size={17} />
                <span>Property visits</span>
              </div>

            </div>
          </div>

          <div className="about-platform-card">
            <span>THE XEVOPROP IDEA</span>

            <strong>
              Less searching.
              <br />
              More certainty.
            </strong>

            <div className="about-platform-line" />

            <p>
              A focused property experience for modern
              buyers, sellers and developers.
            </p>
          </div>

        </div>
      </section>

      {/* CTA */}
      <section className="about-cta">
        <span className="about-section-label">
          START EXPLORING
        </span>

        <h2>
          Your next property
          <br />
          <em>could start here.</em>
        </h2>

        <Link to="/properties" className="about-cta-button">
          Explore Xevoprop
          <ArrowRight size={16} />
        </Link>
      </section>

    </div>
  );
}

export default About;