import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Home,
  IndianRupee,
  Layers3,
  CheckCircle2,
  Phone,
  CalendarDays,
} from "lucide-react";

import { apiFetch } from "../lib/api";
import "./ProjectDetails.css";

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadProject = async () => {
      try {
        setLoading(true);

        const data = await apiFetch(`/projects/public/${id}`);

        if (!cancelled) {
          setProject(data.project);
        }
      } catch (error) {
        console.error("Project details error:", error);

        if (!cancelled) {
          setProject(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadProject();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="project-details-page">
        <div className="project-details-container">
          <div className="project-details-loading">
            <div className="project-loading-spinner" />
            <span>Loading project...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="project-details-page">
        <div className="project-details-container">
          <div className="project-not-found">
            <div className="project-not-found-icon">
              <Building2 size={28} />
            </div>

            <h1>Project not found</h1>

            <p>
              We couldn't find the project you're looking for.
            </p>

            <button
              className="project-back-main"
              onClick={() => navigate("/projects")}
            >
              <ArrowLeft size={15} />
              Back to Projects
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="project-details-page">
      <div className="project-details-container">

        {/* BACK */}

        <button
          className="project-details-back"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={16} />
          Back to Projects
        </button>

        {/* HERO */}

        <section className="project-details-hero">

          <div className="project-details-image">

            {project.image ? (
              <img
                src={project.image}
                alt={project.name}
              />
            ) : (
              <div className="project-details-placeholder">
                <Building2 size={48} />
                <span>Project Image</span>
              </div>
            )}

            <div className="project-image-badge">
              <CheckCircle2 size={14} />
              Verified Project
            </div>

          </div>

          <div className="project-details-intro">

            <span className="project-details-label">
              PREMIUM PROJECT
            </span>

            <h1>{project.name}</h1>

            <div className="project-details-location">
              <MapPin size={17} />
              <span>
                {project.location}
                {project.city ? `, ${project.city}` : ""}
              </span>
            </div>

            <p className="project-details-description">
              {project.description ||
                "Discover a thoughtfully planned residential project designed for modern living."}
            </p>

            <div className="project-details-actions">

              <button
                className="project-primary-button"
                onClick={() => navigate("/contact")}
              >
                <Phone size={16} />
                Contact Developer
              </button>

              <button
                className="project-secondary-button"
                onClick={() => navigate("/properties")}
              >
                Explore Properties
              </button>

            </div>

          </div>

        </section>

        {/* QUICK STATS */}

        <section className="project-stats">

          <div className="project-stat-card">
            <div className="project-stat-icon">
              <Building2 size={18} />
            </div>

            <div>
              <span>Project Type</span>
              <strong>{project.type || "Residential"}</strong>
            </div>
          </div>

          <div className="project-stat-card">
            <div className="project-stat-icon">
              <Home size={18} />
            </div>

            <div>
              <span>Total Units</span>
              <strong>{project.units || "—"}</strong>
            </div>
          </div>

          <div className="project-stat-card">
            <div className="project-stat-icon">
              <IndianRupee size={18} />
            </div>

            <div>
              <span>Starting Price</span>
              <strong>{project.price || "Contact for price"}</strong>
            </div>
          </div>

          <div className="project-stat-card">
            <div className="project-stat-icon">
              <Layers3 size={18} />
            </div>

            <div>
              <span>Location</span>
              <strong>{project.city || project.location || "—"}</strong>
            </div>
          </div>

        </section>

        {/* INFORMATION */}

        <section className="project-information">

          <div className="project-information-main">

            <div className="project-section-heading">
              <span>ABOUT THE PROJECT</span>

              <h2>
                Designed for
                <em> better living.</em>
              </h2>
            </div>

            <p>
              {project.description ||
                "This project brings together thoughtful planning, modern architecture and convenient living in a well-connected location."}
            </p>

            <div className="project-feature-list">

              <div className="project-feature">
                <CheckCircle2 size={17} />
                <span>Professionally planned development</span>
              </div>

              <div className="project-feature">
                <CheckCircle2 size={17} />
                <span>Modern residential spaces</span>
              </div>

              <div className="project-feature">
                <CheckCircle2 size={17} />
                <span>Strategic location</span>
              </div>

              <div className="project-feature">
                <CheckCircle2 size={17} />
                <span>Direct developer connection</span>
              </div>

            </div>

          </div>

          <aside className="project-contact-card">

            <div className="project-contact-icon">
              <CalendarDays size={21} />
            </div>

            <span className="project-contact-label">
              INTERESTED IN THIS PROJECT?
            </span>

            <h3>
              Take the next step.
            </h3>

            <p>
              Connect with the developer and get
              more information about availability,
              pricing and visits.
            </p>

            <button
              className="project-contact-button"
              onClick={() => navigate("/contact")}
            >
              Get in Touch
              <ArrowLeft
                size={15}
                className="project-arrow"
              />
            </button>

          </aside>

        </section>

      </div>
    </div>
  );
}