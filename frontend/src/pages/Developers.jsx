import {
  ArrowRight,
  Building2,
  ChartNoAxesCombined,
  ClipboardCheck,
  Eye,
  Handshake,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import "./Developers.css";

function Developers() {
  const benefits = [
    {
      icon: Building2,
      number: "01",
      title: "Showcase Projects",
      text: "Present your residential and commercial projects with a dedicated, professional property experience.",
    },
    {
      icon: Eye,
      number: "02",
      title: "Reach Serious Buyers",
      text: "Put your projects in front of users actively searching for their next property.",
    },
    {
      icon: Users,
      number: "03",
      title: "Manage Leads",
      text: "Keep track of buyer interest and enquiries from one connected platform.",
    },
    {
      icon: ChartNoAxesCombined,
      number: "04",
      title: "Grow Visibility",
      text: "Give your developments a stronger digital presence without building the entire platform yourself.",
    },
  ];

  const features = [
    "Project-focused property discovery",
    "Centralized project management",
    "Buyer enquiry management",
    "Structured project information",
    "Professional property presentation",
    "A connected real-estate ecosystem",
  ];

  return (
    <div className="developers-page">
      {/* HERO */}
      <section className="developers-hero">
        <div className="developers-hero-content">
          <span className="developers-eyebrow">
            FOR DEVELOPERS
          </span>

          <h1>
            Build visibility.
            <br />
            <em>Build trust.</em>
          </h1>

          <p>
            Xevoprop gives developers a focused digital space to
            showcase projects, connect with buyers, and manage
            property opportunities more efficiently.
          </p>

          <div className="developers-hero-actions">
            <Link to="/add-project" className="developers-primary-btn">
              Add Your Project
              <ArrowRight size={16} />
            </Link>

            <Link
              to="/projects"
              className="developers-secondary-btn"
            >
              Explore Projects
            </Link>
          </div>
        </div>

        <div className="developers-hero-mark">
          <Building2 size={32} strokeWidth={1.2} />
          <span>PROJECT<br />PARTNERS</span>
        </div>
      </section>

      {/* INTRO */}
      <section className="developers-intro">
        <div className="developers-intro-grid">
          <div>
            <span className="developers-section-label">
              THE XEVOPROP APPROACH
            </span>

            <h2>
              More than a listing.
              <br />
              <em>A project experience.</em>
            </h2>
          </div>

          <div className="developers-intro-copy">
            <p>
              Property buyers need more than a name and a price.
              They want to understand the project, its location,
              available units, and what makes it worth considering.
            </p>

            <p>
              Xevoprop brings those details together into one
              structured experience designed for modern property
              discovery.
            </p>
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="developers-benefits">
        <div className="developers-benefits-header">
          <div>
            <span className="developers-section-label">
              WHY XEVOPROP
            </span>

            <h2>
              Everything your
              <br />
              project needs to <em>stand out.</em>
            </h2>
          </div>

          <p>
            From discovery to enquiries, give potential buyers a
            clearer way to understand and engage with your projects.
          </p>
        </div>

        <div className="developers-benefits-grid">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;

            return (
              <article
                className="developers-benefit-card"
                key={benefit.number}
              >
                <div className="developers-benefit-top">
                  <span>{benefit.number}</span>

                  <div className="developers-benefit-icon">
                    <Icon size={19} strokeWidth={1.5} />
                  </div>
                </div>

                <h3>{benefit.title}</h3>

                <p>{benefit.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      {/* PLATFORM */}
      <section className="developers-platform">
        <div className="developers-platform-inner">
          <div className="developers-platform-content">
            <span className="developers-section-label">
              ONE CONNECTED PLATFORM
            </span>

            <h2>
              From project launch
              <br />
              to <em>buyer enquiry.</em>
            </h2>

            <p>
              Keep your project information organized while giving
              buyers the information they need to take the next
              step.
            </p>

            <div className="developers-platform-points">
              {features.map((feature) => (
                <div
                  className="developers-platform-point"
                  key={feature}
                >
                  <ShieldCheck size={16} />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="developers-platform-card">
            <div className="developers-platform-card-top">
              <span>XEVOPROP</span>
              <ClipboardCheck size={20} />
            </div>

            <div className="developers-platform-card-line">
              <span>PROJECT MANAGEMENT</span>
              <strong>CONNECTED</strong>
            </div>

            <div className="developers-platform-card-line">
              <span>BUYER DISCOVERY</span>
              <strong>ACTIVE</strong>
            </div>

            <div className="developers-platform-card-line">
              <span>ENQUIRIES</span>
              <strong>ORGANIZED</strong>
            </div>

            <div className="developers-platform-card-footer">
              <Handshake size={18} />
              <span>Built for better property connections.</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="developers-cta">
        <span>READY TO GET STARTED?</span>

        <h2>
          Put your project
          <br />
          <em>in the right place.</em>
        </h2>

        <p>
          Create your project on Xevoprop and give buyers a better
          way to discover what you are building.
        </p>

        <Link to="/add-project" className="developers-cta-btn">
          Create a Project
          <ArrowRight size={16} />
        </Link>
      </section>
    </div>
  );
}

export default Developers;