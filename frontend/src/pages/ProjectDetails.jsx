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
  X,
  Send,
  Loader2,
} from "lucide-react";

import { apiFetch } from "../lib/api";
import "./ProjectDetails.css";

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  // ============================================================
  // ENQUIRY STATE
  // ============================================================

  const [showEnquiry, setShowEnquiry] =
    useState(false);

  const [enquiryForm, setEnquiryForm] =
    useState({
      name: "",
      email: "",
      phone: "",
      message: "",
    });

  const [enquiryLoading, setEnquiryLoading] =
    useState(false);

  const [enquiryMessage, setEnquiryMessage] =
    useState("");

  const [enquiryError, setEnquiryError] =
    useState("");

  // ============================================================
  // LOAD PUBLIC PROJECT
  // ============================================================

  useEffect(() => {
    let cancelled = false;

    const loadProject = async () => {
      try {
        setLoading(true);

        const data = await apiFetch(
          `/projects/public/${id}`
        );

        console.log(
          "PUBLIC PROJECT RESPONSE:",
          data
        );

        /*
         * The current backend returns the project
         * directly.
         *
         * Support both:
         *
         * { project: {...} }
         *
         * and:
         *
         * { id: 8, name: "..." }
         */

        const projectData =
          data?.project ||
          data?.data ||
          data;

        if (
          !projectData ||
          !projectData.id
        ) {
          throw new Error(
            "Project data was not returned."
          );
        }

        if (!cancelled) {
          setProject(projectData);
        }
      } catch (error) {
        console.error(
          "Project details error:",
          error
        );

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

  // ============================================================
  // OPEN ENQUIRY
  // ============================================================

  const openEnquiry = () => {
    setEnquiryError("");
    setEnquiryMessage("");

    setShowEnquiry(true);
  };

  // ============================================================
  // CLOSE ENQUIRY
  // ============================================================

  const closeEnquiry = () => {
    if (enquiryLoading) {
      return;
    }

    setShowEnquiry(false);

    setEnquiryError("");
    setEnquiryMessage("");
  };

  // ============================================================
  // ENQUIRY FORM CHANGE
  // ============================================================

  const handleEnquiryChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setEnquiryForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ============================================================
  // SUBMIT PROJECT ENQUIRY
  // ============================================================

  const handleEnquirySubmit = async (e) => {
    e.preventDefault();

    setEnquiryMessage("");
    setEnquiryError("");

    if (!project?.id) {
      setEnquiryError(
        "Project information is unavailable."
      );

      return;
    }

    try {
      setEnquiryLoading(true);

      const token =
        localStorage.getItem("token");

      /*
       * Project enquiries require an
       * authenticated buyer.
       */

      if (!token) {
        setShowEnquiry(false);

        navigate("/login");

        return;
      }

      const data = await apiFetch(
        "/enquiries/project",
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            project_id: project.id,

            name:
              enquiryForm.name.trim(),

            email:
              enquiryForm.email
                .trim(),

            phone:
              enquiryForm.phone
                .trim() || null,

            message:
              enquiryForm.message
                .trim() || null,
          }),
        }
      );

      console.log(
        "PROJECT ENQUIRY RESPONSE:",
        data
      );

      setEnquiryMessage(
        data?.message ||
          "Enquiry sent successfully."
      );

      setEnquiryForm({
        name: "",
        email: "",
        phone: "",
        message: "",
      });
    } catch (error) {
      console.error(
        "Project enquiry error:",
        error
      );

      setEnquiryError(
        error.message ||
          "Failed to send enquiry."
      );
    } finally {
      setEnquiryLoading(false);
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="project-details-page">
        <div className="project-details-container">
          <div className="project-details-loading">
            <div className="project-loading-spinner" />

            <span>
              Loading project...
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // PROJECT NOT FOUND
  // ============================================================

  if (!project) {
    return (
      <div className="project-details-page">
        <div className="project-details-container">
          <div className="project-not-found">

            <div className="project-not-found-icon">
              <Building2 size={28} />
            </div>

            <h1>
              Project not found
            </h1>

            <p>
              We couldn't find the project
              you're looking for.
            </p>

            <button
              className="project-back-main"
              onClick={() =>
                navigate("/projects")
              }
            >
              <ArrowLeft size={15} />

              Back to Projects
            </button>

          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // MAIN UI
  // ============================================================

  return (
    <div className="project-details-page">

      <div className="project-details-container">

        {/* ======================================================
            BACK
        ====================================================== */}

        <button
          className="project-details-back"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={16} />

          Back to Projects
        </button>

        {/* ======================================================
            HERO
        ====================================================== */}

        <section className="project-details-hero">

          {/* PROJECT IMAGE */}

          <div className="project-details-image">

            {project.image ? (
              <img
                src={project.image}
                alt={project.name}
              />
            ) : (
              <div className="project-details-placeholder">

                <Building2 size={48} />

                <span>
                  Project Image
                </span>

              </div>
            )}

            <div className="project-image-badge">

              <CheckCircle2 size={14} />

              Verified Project

            </div>

          </div>

          {/* PROJECT INTRO */}

          <div className="project-details-intro">

            <span className="project-details-label">
              PREMIUM PROJECT
            </span>

            <h1>
              {project.name}
            </h1>

            <div className="project-details-location">

              <MapPin size={17} />

              <span>
                {project.location}

                {project.city
                  ? `, ${project.city}`
                  : ""}
              </span>

            </div>

            <p className="project-details-description">
              {project.description ||
                "Discover a thoughtfully planned residential project designed for modern living."}
            </p>

            <div className="project-details-actions">

              <button
                className="project-primary-button"
                onClick={openEnquiry}
              >
                <Phone size={16} />

                Contact Developer
              </button>

              <button
                className="project-secondary-button"
                onClick={() =>
                  navigate("/properties")
                }
              >
                Explore Properties
              </button>

            </div>

          </div>

        </section>

        {/* ======================================================
            QUICK STATS
        ====================================================== */}

        <section className="project-stats">

          {/* PROJECT TYPE */}

          <div className="project-stat-card">

            <div className="project-stat-icon">
              <Building2 size={18} />
            </div>

            <div>

              <span>
                Project Type
              </span>

              <strong>
                {project.type ||
                  "Residential"}
              </strong>

            </div>

          </div>

          {/* TOTAL UNITS */}

          <div className="project-stat-card">

            <div className="project-stat-icon">
              <Home size={18} />
            </div>

            <div>

              <span>
                Total Units
              </span>

              <strong>
                {project.units || "—"}
              </strong>

            </div>

          </div>

          {/* STARTING PRICE */}

          <div className="project-stat-card">

            <div className="project-stat-icon">
              <IndianRupee size={18} />
            </div>

            <div>

              <span>
                Starting Price
              </span>

              <strong>
                {project.price ||
                  "Contact for price"}
              </strong>

            </div>

          </div>

          {/* LOCATION */}

          <div className="project-stat-card">

            <div className="project-stat-icon">
              <Layers3 size={18} />
            </div>

            <div>

              <span>
                Location
              </span>

              <strong>
                {project.city ||
                  project.location ||
                  "—"}
              </strong>

            </div>

          </div>

        </section>

        {/* ======================================================
            INFORMATION
        ====================================================== */}

        <section className="project-information">

          <div className="project-information-main">

            <div className="project-section-heading">

              <span>
                ABOUT THE PROJECT
              </span>

              <h2>
                Designed for
                <em>
                  {" "}
                  better living.
                </em>
              </h2>

            </div>

            <p>
              {project.description ||
                "This project brings together thoughtful planning, modern architecture and convenient living in a well-connected location."}
            </p>

            <div className="project-feature-list">

              <div className="project-feature">

                <CheckCircle2 size={17} />

                <span>
                  Professionally planned
                  development
                </span>

              </div>

              <div className="project-feature">

                <CheckCircle2 size={17} />

                <span>
                  Modern residential
                  spaces
                </span>

              </div>

              <div className="project-feature">

                <CheckCircle2 size={17} />

                <span>
                  Strategic location
                </span>

              </div>

              <div className="project-feature">

                <CheckCircle2 size={17} />

                <span>
                  Direct developer
                  connection
                </span>

              </div>

            </div>

          </div>

          {/* CONTACT CARD */}

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
              Connect with the developer
              and get more information
              about availability, pricing
              and visits.
            </p>

            <button
              className="project-contact-button"
              onClick={openEnquiry}
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

      {/* ========================================================
          PROJECT ENQUIRY MODAL
      ======================================================== */}

      {showEnquiry && (
        <div
          className="project-enquiry-overlay"
          onClick={closeEnquiry}
        >

          <div
            className="project-enquiry-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

            <div className="project-enquiry-header">

              <div>

                <span>
                  PROJECT ENQUIRY
                </span>

                <h2>
                  Contact Developer
                </h2>

                <p>
                  Interested in{" "}
                  <strong>
                    {project.name}
                  </strong>
                  ? Send your enquiry
                  directly to the developer.
                </p>

              </div>

              <button
                type="button"
                className="project-enquiry-close"
                onClick={closeEnquiry}
                disabled={
                  enquiryLoading
                }
                aria-label="Close enquiry"
              >
                <X size={19} />
              </button>

            </div>

            {/* SUCCESS MESSAGE */}

            {enquiryMessage && (
              <div className="project-enquiry-success">

                <CheckCircle2
                  size={18}
                />

                <span>
                  {enquiryMessage}
                </span>

              </div>
            )}

            {/* ERROR MESSAGE */}

            {enquiryError && (
              <div className="project-enquiry-error">
                {enquiryError}
              </div>
            )}

            {/* FORM */}

            {!enquiryMessage && (
              <form
                className="project-enquiry-form"
                onSubmit={
                  handleEnquirySubmit
                }
              >

                <div className="project-enquiry-grid">

                  {/* NAME */}

                  <div className="project-enquiry-field">

                    <label>
                      Name *
                    </label>

                    <input
                      type="text"
                      name="name"
                      value={
                        enquiryForm.name
                      }
                      onChange={
                        handleEnquiryChange
                      }
                      placeholder="Your name"
                      required
                    />

                  </div>

                  {/* EMAIL */}

                  <div className="project-enquiry-field">

                    <label>
                      Email *
                    </label>

                    <input
                      type="email"
                      name="email"
                      value={
                        enquiryForm.email
                      }
                      onChange={
                        handleEnquiryChange
                      }
                      placeholder="you@example.com"
                      required
                    />

                  </div>

                  {/* PHONE */}

                  <div className="project-enquiry-field full">

                    <label>
                      Phone
                    </label>

                    <input
                      type="tel"
                      name="phone"
                      value={
                        enquiryForm.phone
                      }
                      onChange={
                        handleEnquiryChange
                      }
                      placeholder="Your phone number"
                    />

                  </div>

                  {/* MESSAGE */}

                  <div className="project-enquiry-field full">

                    <label>
                      Message
                    </label>

                    <textarea
                      name="message"
                      value={
                        enquiryForm.message
                      }
                      onChange={
                        handleEnquiryChange
                      }
                      rows="5"
                      placeholder="I'm interested in this project. Please share more details..."
                    />

                  </div>

                </div>

                {/* SUBMIT */}

                <button
                  type="submit"
                  className="project-enquiry-submit"
                  disabled={
                    enquiryLoading
                  }
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

            {/* DONE */}

            {enquiryMessage && (
              <button
                type="button"
                className="project-enquiry-done"
                onClick={() =>
                  setShowEnquiry(false)
                }
              >
                Done
              </button>
            )}

          </div>

        </div>
      )}

    </div>
  );
}