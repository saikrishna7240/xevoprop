import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Home,
  Loader2,
  MapPin,
  MessageSquare,
  Send,
  Users,
  X,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../lib/api";
import "./ProjectDetails.css";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=85";

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showEnquiry, setShowEnquiry] = useState(false);

  const [enquiryForm, setEnquiryForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [enquiryLoading, setEnquiryLoading] = useState(false);
  const [enquiryMessage, setEnquiryMessage] = useState("");
  const [enquiryError, setEnquiryError] = useState("");

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await apiFetch(`/projects/public/${id}`);

      const projectData =
        data?.project ||
        data?.data ||
        data;

      if (!projectData) {
        throw new Error("Project not found");
      }

      setProject(projectData);
    } catch (err) {
      console.error("Project details error:", err);

      setError(
        err?.message ||
          "Unable to load project details."
      );
    } finally {
      setLoading(false);
    }
  };

  const openEnquiry = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    setEnquiryMessage("");
    setEnquiryError("");
    setShowEnquiry(true);
  };

  const closeEnquiry = () => {
    if (enquiryLoading) return;

    setShowEnquiry(false);
    setEnquiryMessage("");
    setEnquiryError("");
  };

  const handleEnquiryChange = (e) => {
    const { name, value } = e.target;

    setEnquiryForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const submitEnquiry = async (e) => {
    e.preventDefault();

    if (!enquiryForm.name.trim()) {
      setEnquiryError("Please enter your name.");
      return;
    }

    if (!enquiryForm.email.trim()) {
      setEnquiryError("Please enter your email.");
      return;
    }

    try {
      setEnquiryLoading(true);
      setEnquiryError("");
      setEnquiryMessage("");

      const token = localStorage.getItem("token");

      if (!token) {
        setShowEnquiry(false);
        navigate("/login");
        return;
      }

      await apiFetch("/enquiries/project", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          project_id: project.id,
          name: enquiryForm.name.trim(),
          email: enquiryForm.email.trim(),
          phone: enquiryForm.phone.trim() || null,
          message: enquiryForm.message.trim() || null,
        }),
      });

      setEnquiryMessage(
        "Your enquiry has been sent successfully. The developer will get back to you."
      );

      setEnquiryForm({
        name: "",
        email: "",
        phone: "",
        message: "",
      });
    } catch (err) {
      console.error("Enquiry error:", err);

      setEnquiryError(
        err?.message ||
          "Unable to send your enquiry. Please try again."
      );
    } finally {
      setEnquiryLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "Recently added";

    try {
      return new Date(date).toLocaleDateString(
        "en-IN",
        {
          day: "numeric",
          month: "short",
          year: "numeric",
        }
      );
    } catch {
      return "Recently added";
    }
  };

  const getStatusLabel = () => {
    const status = String(
      project?.status || ""
    ).toLowerCase();

    if (status === "approved") return "Approved";
    if (status === "pending") return "Under Review";
    if (status === "rejected") return "Rejected";

    return "Available";
  };

  const getStatusIcon = () => {
    const status = String(
      project?.status || ""
    ).toLowerCase();

    if (status === "pending") {
      return <Clock3 size={14} />;
    }

    if (status === "rejected") {
      return <X size={14} />;
    }

    return <CheckCircle2 size={14} />;
  };

  if (loading) {
    return (
      <div className="project-details-page">
        <div className="project-details-loading">

          <div className="project-loading-image" />

          <div className="project-loading-content">
            <div className="project-loading-line large" />
            <div className="project-loading-line medium" />
            <div className="project-loading-line small" />
          </div>

          <div className="project-loading-message">
            <Loader2
              size={18}
              className="project-loading-spinner"
            />
            Loading project details...
          </div>

        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="project-details-page">

        <div className="project-details-error-page">

          <div className="project-error-card">

            <div className="project-error-icon">
              <Building2 size={28} />
            </div>

            <h2>
              Project Not Found
            </h2>

            <p>
              {error ||
                "The project you're looking for is unavailable."}
            </p>

            <button
              type="button"
              onClick={() => navigate("/projects")}
            >
              <ArrowLeft size={17} />
              Back to Projects
            </button>

          </div>

        </div>

      </div>
    );
  }

  const image =
    project.image ||
    project.image_url ||
    project.cover_image ||
    FALLBACK_IMAGE;

  const projectType =
    project.type ||
    "Residential Project";

  const location =
    project.location ||
    project.city ||
    "Location unavailable";

  return (
    <div className="project-details-page">

      {/* =========================
          TOP BAR
      ========================= */}

      <div className="project-details-topbar">
        <div className="project-details-container">

          <button
            type="button"
            className="project-back-button"
            onClick={() => navigate("/projects")}
          >
            <ArrowLeft size={17} />
            Back to Projects
          </button>

          <div className="project-details-breadcrumb">
            Projects
            <span>/</span>
            {projectType}
            <span>/</span>
            {project.name}
          </div>

        </div>
      </div>

      {/* =========================
          HERO
      ========================= */}

      <section className="project-details-hero">

        <div className="project-details-container">

          <div className="project-hero-grid">

            {/* IMAGE */}

            <div className="project-main-image-wrapper">

              <img
                src={image}
                alt={project.name}
                className="project-main-image"
              />

              <div className="project-image-overlay" />

              <div className="project-image-top">

                <span className="project-verified-badge">
                  <CheckCircle2 size={14} />
                  Verified Project
                </span>

                <span className="project-status-badge">
                  {getStatusIcon()}
                  {getStatusLabel()}
                </span>

              </div>

              <div className="project-image-bottom">

                <span>
                  <Building2 size={14} />
                  {projectType}
                </span>

              </div>

            </div>

            {/* HERO INFO */}

            <div className="project-hero-info">

              <span className="project-hero-eyebrow">
                XEVOPROP PROJECT
              </span>

              <h1>
                {project.name}
              </h1>

              <div className="project-hero-location">
                <MapPin size={17} />
                <span>{location}</span>
              </div>

              <p className="project-hero-description">
                {project.description ||
                  "Discover project details, availability and developer information on Xevoprop."}
              </p>

              <div className="project-price-box">

                <span>
                  STARTING PRICE
                </span>

                <strong>
                  {project.price ||
                    "Price on request"}
                </strong>

              </div>

              <div className="project-hero-actions">

                <button
                  type="button"
                  className="project-primary-action"
                  onClick={openEnquiry}
                >
                  <MessageSquare size={17} />
                  Get in Touch
                </button>

                <button
                  type="button"
                  className="project-secondary-action"
                  onClick={openEnquiry}
                >
                  Contact Developer
                  <ArrowRight size={15} />
                </button>

              </div>

              <div className="project-added-date">
                <CalendarDays size={15} />
                Listed on {formatDate(project.created_at)}
              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =========================
          MAIN
      ========================= */}

      <main className="project-details-container project-content">

        <div className="project-content-grid">

          {/* LEFT */}

          <div className="project-content-main">

            {/* OVERVIEW */}

            <section className="project-section">

              <div className="project-section-heading">

                <span>
                  PROJECT OVERVIEW
                </span>

                <h2>
                  Everything you need to know
                </h2>

              </div>

              <div className="project-highlights">

                <div className="project-highlight-card">

                  <div className="project-highlight-icon">
                    <Building2 size={19} />
                  </div>

                  <span>
                    Project Type
                  </span>

                  <strong>
                    {projectType}
                  </strong>

                </div>

                <div className="project-highlight-card">

                  <div className="project-highlight-icon">
                    <Users size={19} />
                  </div>

                  <span>
                    Total Units
                  </span>

                  <strong>
                    {project.units ||
                      "Not specified"}
                  </strong>

                </div>

                <div className="project-highlight-card">

                  <div className="project-highlight-icon">
                    <MapPin size={19} />
                  </div>

                  <span>
                    Location
                  </span>

                  <strong>
                    {project.city ||
                      location}
                  </strong>

                </div>

                <div className="project-highlight-card">

                  <div className="project-highlight-icon">
                    <CheckCircle2 size={19} />
                  </div>

                  <span>
                    Status
                  </span>

                  <strong>
                    {getStatusLabel()}
                  </strong>

                </div>

              </div>

            </section>

            {/* DESCRIPTION */}

            <section className="project-section">

              <div className="project-section-heading">

                <span>
                  ABOUT THE PROJECT
                </span>

                <h2>
                  Project Description
                </h2>

              </div>

              <p className="project-description">
                {project.description ||
                  "Detailed information about this project will be available soon."}
              </p>

            </section>

            {/* LOCATION */}

            <section className="project-section">

              <div className="project-section-heading">

                <span>
                  PROJECT LOCATION
                </span>

                <h2>
                  Explore the location
                </h2>

              </div>

              <div className="project-location-card">

                <div className="project-location-icon">
                  <MapPin size={24} />
                </div>

                <div>
                  <h3>
                    {location}
                  </h3>

                  <p>
                    Project location provided by
                    the developer.
                  </p>
                </div>

              </div>

            </section>

            {/* DEVELOPER */}

            <section className="project-section">

              <div className="project-section-heading">

                <span>
                  DEVELOPER
                </span>

                <h2>
                  Project developer
                </h2>

              </div>

              <div className="project-developer-card">

                <div className="project-developer-avatar">
                  <Building2 size={22} />
                </div>

                <div className="project-developer-info">

                  <h3>
                    Verified Developer
                  </h3>

                  <p>
                    This project is listed by a
                    developer on Xevoprop.
                  </p>

                </div>

                <CheckCircle2
                  size={22}
                  className="project-developer-check"
                />

              </div>

            </section>

          </div>

          {/* SIDEBAR */}

          <aside className="project-content-sidebar">

            <div className="project-enquiry-sidebar">

              <span className="project-enquiry-sidebar-label">
                INTERESTED IN THIS PROJECT?
              </span>

              <h3>
                Talk to the Developer
              </h3>

              <p>
                Get information about pricing,
                availability and project details
                directly through Xevoprop.
              </p>

              <button
                type="button"
                onClick={openEnquiry}
              >
                <MessageSquare size={16} />
                Send Enquiry
              </button>

              <div className="project-sidebar-divider" />

              <div className="project-sidebar-info">

                <div>
                  <span>PROJECT</span>
                  <strong>
                    {project.name}
                  </strong>
                </div>

                <div>
                  <span>LOCATION</span>
                  <strong>
                    {location}
                  </strong>
                </div>

                <div>
                  <span>PRICE</span>
                  <strong>
                    {project.price ||
                      "On Request"}
                  </strong>
                </div>

              </div>

            </div>

          </aside>

        </div>

      </main>

      {/* =========================
          MOBILE BAR
      ========================= */}

      <div className="project-mobile-enquiry-bar">

        <button
          type="button"
          className="secondary"
          onClick={() => navigate("/projects")}
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <button
          type="button"
          onClick={openEnquiry}
        >
          <MessageSquare size={16} />
          Enquire Now
        </button>

      </div>

      {/* =========================
          ENQUIRY MODAL
      ========================= */}

      {showEnquiry && (
        <div
          className="project-enquiry-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              closeEnquiry();
            }
          }}
        >

          <div className="project-enquiry-modal">

            <div className="project-enquiry-header">

              <div>
                <span>
                  PROJECT ENQUIRY
                </span>

                <h2>
                  Contact Developer
                </h2>
              </div>

              <button
                type="button"
                className="project-enquiry-close"
                onClick={closeEnquiry}
                disabled={enquiryLoading}
              >
                <X size={19} />
              </button>

            </div>

            {enquiryMessage ? (

              <div className="project-enquiry-success">

                <div className="project-success-icon">
                  <CheckCircle2 size={30} />
                </div>

                <h3>
                  Enquiry Sent
                </h3>

                <p>
                  {enquiryMessage}
                </p>

                <button
                  type="button"
                  onClick={closeEnquiry}
                >
                  Done
                </button>

              </div>

            ) : (

              <form
                onSubmit={submitEnquiry}
                className="project-enquiry-form"
              >

                <div className="project-enquiry-grid">

                  <div className="project-enquiry-field">

                    <label htmlFor="project-name">
                      Name
                    </label>

                    <input
                      id="project-name"
                      type="text"
                      name="name"
                      value={enquiryForm.name}
                      onChange={handleEnquiryChange}
                      placeholder="Enter your name"
                      required
                    />

                  </div>

                  <div className="project-enquiry-field">

                    <label htmlFor="project-email">
                      Email
                    </label>

                    <input
                      id="project-email"
                      type="email"
                      name="email"
                      value={enquiryForm.email}
                      onChange={handleEnquiryChange}
                      placeholder="Enter your email"
                      required
                    />

                  </div>

                  <div className="project-enquiry-field">

                    <label htmlFor="project-phone">
                      Phone
                    </label>

                    <input
                      id="project-phone"
                      type="tel"
                      name="phone"
                      value={enquiryForm.phone}
                      onChange={handleEnquiryChange}
                      placeholder="Enter your phone number"
                    />

                  </div>

                  <div className="project-enquiry-field project-enquiry-full">

                    <label htmlFor="project-message">
                      Message
                    </label>

                    <textarea
                      id="project-message"
                      name="message"
                      value={enquiryForm.message}
                      onChange={handleEnquiryChange}
                      placeholder="What would you like to know about this project?"
                      rows={4}
                    />

                  </div>

                </div>

                {enquiryError && (
                  <div className="project-enquiry-error">
                    {enquiryError}
                  </div>
                )}

                <button
                  type="submit"
                  className="project-enquiry-submit"
                  disabled={enquiryLoading}
                >

                  {enquiryLoading ? (
                    <>
                      <Loader2
                        size={17}
                        className="project-enquiry-spinner"
                      />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={17} />
                      Send Enquiry
                    </>
                  )}

                </button>

              </form>

            )}

          </div>

        </div>
      )}

    </div>
  );
};

export default ProjectDetails;