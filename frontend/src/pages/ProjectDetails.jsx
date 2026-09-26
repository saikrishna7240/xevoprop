import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Play,
  ShieldCheck,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { apiFetch } from "../lib/api";
import "./ProjectDetails.css";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1600&q=85";

const getProjectMedia = (project) => {
  const media = Array.isArray(project?.project_media)
    ? project.project_media
    : [];

  const normalized = media
    .map((item) => {
      if (!item) return null;

      const url =
        item.media_url ||
        item.url ||
        item.secure_url ||
        item.image_url;

      if (!url) return null;

      return {
        id: item.id,
        url,
        type: item.media_type === "video" ? "video" : "image",
        sort_order: item.sort_order ?? 0,
      };
    })
    .filter(Boolean)
    .sort(
      (a, b) =>
        a.sort_order - b.sort_order ||
        Number(a.id || 0) - Number(b.id || 0)
    );

  if (normalized.length > 0) {
    return normalized;
  }

  if (project?.image) {
    return [
      {
        id: "cover",
        url: project.image,
        type: "image",
        sort_order: 0,
      },
    ];
  }

  return [
    {
      id: "fallback",
      url: FALLBACK_IMAGE,
      type: "image",
      sort_order: 0,
    },
  ];
};

function ProjectDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeMedia, setActiveMedia] = useState(0);
  const [showEnquiry, setShowEnquiry] = useState(false);

  const [enquiryForm, setEnquiryForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [formStatus, setFormStatus] = useState({
    type: "",
    message: "",
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadProject();
  }, [id]);

  useEffect(() => {
    setActiveMedia(0);
    setFormStatus({
      type: "",
      message: "",
    });
  }, [id]);

  const loadProject = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiFetch(`/projects/public/${id}`);

      const data =
        response?.project ||
        response?.data ||
        response;

      if (!data) {
        throw new Error("Project not found");
      }

      setProject(data);
    } catch (err) {
      console.error("PROJECT DETAILS ERROR:", err);

      setError(
        err?.message || "Failed to load project details."
      );
    } finally {
      setLoading(false);
    }
  };

  const media = useMemo(
    () => getProjectMedia(project),
    [project]
  );

  const currentMedia =
    media[activeMedia] || media[0];

  const projectTitle =
    project?.name || "Residential Project";

  const location =
    project?.location ||
    project?.city ||
    "Location not available";

  const projectType =
    project?.type || "Residential";

  const price =
    project?.price || "Price on request";

  const units =
    project?.units || "Available on request";

  const description =
    project?.description ||
    "Project details will be updated soon.";
    const developer = project?.developer || {};

const ownerName =
  developer.name ||
  developer.username ||
  "Project Developer";

const ownerPhone =
  developer.phone || "";

const ownerEmail =
  developer.email || "";

const isCertified =
  developer.is_cerified === true ||
  developer.is_cerified === "true";

  const handlePrevious = () => {
    setActiveMedia((current) =>
      current === 0
        ? media.length - 1
        : current - 1
    );
  };

  const handleNext = () => {
    setActiveMedia((current) =>
      current === media.length - 1
        ? 0
        : current + 1
    );
  };

  const handleEnquiryChange = (event) => {
    const { name, value } = event.target;

    setEnquiryForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (formStatus.message) {
      setFormStatus({
        type: "",
        message: "",
      });
    }
  };

  const validateEnquiry = () => {
    const name = enquiryForm.name.trim();
    const email = enquiryForm.email.trim();

    if (!name) {
      return "Please enter your name.";
    }

    if (!email) {
      return "Please enter your email address.";
    }

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      return "Please enter a valid email address.";
    }

    return "";
  };

  /**
   * Returns true only when the enquiry is actually submitted.
   * This fixes the previous mobile-modal issue where the caller
   * checked formStatus before React had updated it.
   */
  const submitEnquiry = async () => {
    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken");

    if (!token) {
      navigate("/login", {
        state: {
          from: `/projects/${id}`,
        },
      });

      return false;
    }

    const validationError = validateEnquiry();

    if (validationError) {
      setFormStatus({
        type: "error",
        message: validationError,
      });

      return false;
    }

    if (!project?.id) {
      setFormStatus({
        type: "error",
        message: "Project information is unavailable.",
      });

      return false;
    }

    try {
      setSubmitting(true);

      setFormStatus({
        type: "",
        message: "",
      });

      const response = await apiFetch(
        "/enquiries/project",
        {
          method: "POST",
          body: {
            project_id: project.id,
            name: enquiryForm.name.trim(),
            email: enquiryForm.email.trim(),
            phone:
              enquiryForm.phone.trim() || null,
            message:
              enquiryForm.message.trim() || null,
          },
        }
      );

      if (response?.success === false) {
        throw new Error(
          response?.message ||
            "Failed to submit enquiry."
        );
      }

      setFormStatus({
        type: "success",
        message:
          "Enquiry sent successfully. The project representative can now contact you.",
      });

      setEnquiryForm({
        name: "",
        email: "",
        phone: "",
        message: "",
      });

      return true;
    } catch (err) {
      console.error(
        "PROJECT ENQUIRY ERROR:",
        err
      );

      setFormStatus({
        type: "error",
        message:
          err?.message ||
          "Unable to send your enquiry. Please try again.",
      });

      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const handleDesktopSubmit = async (event) => {
    event.preventDefault();
    await submitEnquiry();
  };

  const handleMobileSubmit = async (event) => {
    event.preventDefault();

    const success = await submitEnquiry();

    if (success) {
      setTimeout(() => {
        setShowEnquiry(false);

        setFormStatus({
          type: "",
          message: "",
        });
      }, 900);
    }
  };

  const openEnquiry = () => {
    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken");

    if (!token) {
      navigate("/login", {
        state: {
          from: `/projects/${id}`,
        },
      });
      return;
    }

    setFormStatus({
      type: "",
      message: "",
    });

    setShowEnquiry(true);
  };

  const closeEnquiry = () => {
    if (submitting) return;

    setShowEnquiry(false);

    setFormStatus({
      type: "",
      message: "",
    });
  };

  if (loading) {
    return (
      <div className="project-details-page">
        <div className="project-details-container">
          <div className="project-details-loading">
            <div className="project-details-spinner" />
            <p>Loading project details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="project-details-page">
        <div className="project-details-container">
          <button
            className="project-back-button"
            onClick={() => navigate("/projects")}
          >
            <ArrowLeft size={18} />
            Back to Projects
          </button>

          <div className="project-details-error">
            <div className="project-error-icon">
              <Building2 size={28} />
            </div>

            <span className="project-error-label">
              PROJECT DETAILS
            </span>

            <h2>Unable to load project</h2>

            <p>
              {error || "Project not found."}
            </p>

            <button
              className="project-primary-button"
              onClick={() => navigate("/projects")}
            >
              Browse Projects
              <ArrowRight size={17} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="project-details-page">
      <div className="project-details-container">

        {/* TOP NAVIGATION */}
        <div className="project-details-topbar">
          <button
            className="project-back-button"
            onClick={() => navigate("/projects")}
          >
            <ArrowLeft size={18} />
            Back to Projects
          </button>

          <div className="project-topbar-status">
            <CheckCircle2 size={15} />
            Verified Project
          </div>
        </div>

        {/* MEDIA */}
        <section className="project-gallery-section">
          <div className="project-main-media">

            {currentMedia?.type === "video" ? (
              <video
                className="project-main-media-element"
                src={currentMedia.url}
                controls
                playsInline
                preload="metadata"
              />
            ) : (
              <img
                className="project-main-media-element"
                src={currentMedia.url}
                alt={projectTitle}
                onError={(event) => {
                  event.currentTarget.src =
                    FALLBACK_IMAGE;
                }}
              />
            )}

            {media.length > 1 && (
              <>
                <button
                  className="project-gallery-arrow project-gallery-prev"
                  onClick={handlePrevious}
                  aria-label="Previous media"
                >
                  <ChevronLeft size={21} />
                </button>

                <button
                  className="project-gallery-arrow project-gallery-next"
                  onClick={handleNext}
                  aria-label="Next media"
                >
                  <ChevronRight size={21} />
                </button>
              </>
            )}

            <div className="project-media-counter">
              {activeMedia + 1} / {media.length}
            </div>

            {currentMedia?.type === "video" && (
              <div className="project-current-video-label">
                <Play size={13} />
                Project Video
              </div>
            )}
          </div>

          {media.length > 1 && (
            <div className="project-media-thumbnails">
              {media.map((item, index) => (
                <button
                  key={
                    item.id ||
                    `${item.url}-${index}`
                  }
                  className={`project-media-thumbnail ${
                    index === activeMedia
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    setActiveMedia(index)
                  }
                  aria-label={`View media ${index + 1}`}
                >
                  {item.type === "video" ? (
                    <div className="project-video-thumbnail">
                      <video
                        src={item.url}
                        muted
                        preload="metadata"
                      />

                      <span>
                        <Play size={14} />
                      </span>
                    </div>
                  ) : (
                    <img
                      src={item.url}
                      alt={`${projectTitle} ${index + 1}`}
                      onError={(event) => {
                        event.currentTarget.src =
                          FALLBACK_IMAGE;
                      }}
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </section>

        {/* MAIN INFORMATION */}
        <section className="project-details-layout">

          <main className="project-details-main">

            {/* PROJECT HEADER */}
            <div className="project-heading-block">
              <span className="project-type-label">
                {projectType}
              </span>

              <h1>{projectTitle}</h1>

              <div className="project-location">
                <MapPin size={17} />

                <span>{location}</span>

                {project.city &&
                  project.city !== location && (
                    <>
                      <span className="project-location-separator">
                        •
                      </span>

                      <span>
                        {project.city}
                      </span>
                    </>
                  )}
              </div>
            </div>

            {/* PRICE */}
            <div className="project-price-block">
              <div>
                <span className="project-price-label">
                  Starting price
                </span>

                <strong>{price}</strong>
              </div>

              <button
                className="project-inline-enquiry"
                onClick={openEnquiry}
              >
                <MessageSquare size={17} />
                Enquire
              </button>
            </div>

            {/* KEY INFORMATION */}
            <div className="project-specs">
              <div className="project-spec">
                <Building2 size={19} />

                <div>
                  <span>Project type</span>
                  <strong>{projectType}</strong>
                </div>
              </div>

              <div className="project-spec">
                <Users size={19} />

                <div>
                  <span>Total units</span>
                  <strong>{units}</strong>
                </div>
              </div>

              <div className="project-spec">
                <ShieldCheck size={19} />

                <div>
                  <span>Listing status</span>
                  <strong>
                    {project.status || "Approved"}
                  </strong>
                </div>
              </div>

              <div className="project-spec">
    <Building2 size={19} />

    <div>
      <span>Project status</span>
      <strong>
        {project.project_status || "Upcoming"}
      </strong>
    </div>
  </div>
            </div>

            {/* DESCRIPTION */}
            <section className="project-content-section">
              <div className="project-section-heading">
                <span>PROJECT OVERVIEW</span>
                <h2>About this project</h2>
              </div>

              <p className="project-description">
                {description}
              </p>
            </section>

            {/* HIGHLIGHTS */}
            <section className="project-content-section">
              <div className="project-section-heading">
                <span>AT A GLANCE</span>
                <h2>Project information</h2>
              </div>

              <div className="project-highlight-list">
                <div className="project-highlight-row">
                  <CheckCircle2 size={17} />
                  <span>Verified project listing</span>
                </div>

                <div className="project-highlight-row">
                  <CheckCircle2 size={17} />
                  <span>
                    Professional developer listing
                  </span>
                </div>

                <div className="project-highlight-row">
                  <CheckCircle2 size={17} />
                  <span>
                    Project images and videos available
                  </span>
                </div>

                <div className="project-highlight-row">
                  <CheckCircle2 size={17} />
                  <span>
                    Direct enquiry support
                  </span>
                </div>
              </div>
            </section>
          </main>

          {/* DESKTOP ENQUIRY */}
          <aside className="project-enquiry-card">
            <div className="project-enquiry-header">
              <span>PROJECT ENQUIRY</span>

              <h2>
                Interested in this project?
              </h2>

              <p>
                Share your details and the
                project representative can
                contact you.
              </p>
            </div>
            {/* PROJECT OWNER / DEVELOPER */}
<div className="project-owner-card">

  <div className="project-owner-avatar">
    <UserRound size={21} />
  </div>

  <div className="project-owner-details">

    <span className="project-owner-label">
      PROJECT DEVELOPER
    </span>

    <strong>
      {ownerName}
    </strong>

    <small>
      Project Developer / Owner
    </small>

    {ownerPhone && (
      <a
        href={`tel:${ownerPhone}`}
        className="project-owner-contact"
      >
        <Phone size={14} />
        {ownerPhone}
      </a>
    )}

    {ownerEmail && (
      <a
        href={`mailto:${ownerEmail}`}
        className="project-owner-contact"
      >
        <Mail size={14} />
        {ownerEmail}
      </a>
    )}

  </div>

  {isCertified && (
    <span className="project-owner-certified">
      <ShieldCheck size={12} />
      Certified
    </span>
  )}

</div>

            <form
              className="project-enquiry-form"
              onSubmit={handleDesktopSubmit}
            >
              <div className="project-input-group">
                <label htmlFor="desktop-name">
                  Your name
                </label>

                <div className="project-input-wrapper">
                  <Users size={17} />

                  <input
                    id="desktop-name"
                    type="text"
                    name="name"
                    value={enquiryForm.name}
                    onChange={handleEnquiryChange}
                    placeholder="Enter your name"
                    autoComplete="name"
                  />
                </div>
              </div>

              <div className="project-input-group">
                <label htmlFor="desktop-email">
                  Email address
                </label>

                <div className="project-input-wrapper">
                  <Mail size={17} />

                  <input
                    id="desktop-email"
                    type="email"
                    name="email"
                    value={enquiryForm.email}
                    onChange={handleEnquiryChange}
                    placeholder="Enter your email"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="project-input-group">
                <label htmlFor="desktop-phone">
                  Phone number
                </label>

                <div className="project-input-wrapper">
                  <Phone size={17} />

                  <input
                    id="desktop-phone"
                    type="tel"
                    name="phone"
                    value={enquiryForm.phone}
                    onChange={handleEnquiryChange}
                    placeholder="Enter your phone"
                    autoComplete="tel"
                  />
                </div>
              </div>

              <div className="project-input-group">
                <label htmlFor="desktop-message">
                  Message
                </label>

                <div className="project-input-wrapper project-textarea-wrapper">
                  <MessageSquare size={17} />

                  <textarea
                    id="desktop-message"
                    name="message"
                    value={enquiryForm.message}
                    onChange={handleEnquiryChange}
                    placeholder="I am interested in this project..."
                    rows={4}
                  />
                </div>
              </div>

              {formStatus.message && (
                <div
                  className={`project-form-status ${formStatus.type}`}
                  role="alert"
                >
                  {formStatus.type === "success" && (
                    <CheckCircle2 size={17} />
                  )}

                  <span>{formStatus.message}</span>
                </div>
              )}

              <button
                type="submit"
                className="project-submit-button"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="project-button-spinner" />
                    Sending...
                  </>
                ) : (
                  <>
                    Send enquiry
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </form>

            <div className="project-enquiry-note">
              <ShieldCheck size={16} />

              <span>
                Your information is shared
                securely with the project
                representative.
              </span>
            </div>
          </aside>
        </section>
      </div>

      {/* MOBILE ENQUIRY BAR */}
      <div className="project-mobile-enquiry-bar">
        <div>
          <span>Starting from</span>
          <strong>{price}</strong>
        </div>

        <button onClick={openEnquiry}>
          <MessageSquare size={17} />
          Enquire
        </button>
      </div>

      {/* MOBILE ENQUIRY MODAL */}
      {showEnquiry && (
        <div
          className="project-enquiry-overlay"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !submitting
            ) {
              closeEnquiry();
            }
          }}
        >
          <div
            className="project-enquiry-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-enquiry-title"
          >
            <button
              className="project-modal-close"
              onClick={closeEnquiry}
              disabled={submitting}
              aria-label="Close enquiry"
            >
              <X size={20} />
            </button>

            <div className="project-enquiry-header">
              <span>PROJECT ENQUIRY</span>

              <h2 id="mobile-enquiry-title">
                Request project details
              </h2>

              <p>
                Fill in your details and we'll
                connect you with the developer.
              </p>
            </div>

            <form
              className="project-enquiry-form"
              onSubmit={handleMobileSubmit}
            >
              <div className="project-input-group">
                <label htmlFor="mobile-name">
                  Your name
                </label>

                <input
                  id="mobile-name"
                  type="text"
                  name="name"
                  value={enquiryForm.name}
                  onChange={handleEnquiryChange}
                  placeholder="Enter your name"
                  autoComplete="name"
                />
              </div>

              <div className="project-input-group">
                <label htmlFor="mobile-email">
                  Email address
                </label>

                <input
                  id="mobile-email"
                  type="email"
                  name="email"
                  value={enquiryForm.email}
                  onChange={handleEnquiryChange}
                  placeholder="Enter your email"
                  autoComplete="email"
                />
              </div>

              <div className="project-input-group">
                <label htmlFor="mobile-phone">
                  Phone number
                </label>

                <input
                  id="mobile-phone"
                  type="tel"
                  name="phone"
                  value={enquiryForm.phone}
                  onChange={handleEnquiryChange}
                  placeholder="Enter your phone"
                  autoComplete="tel"
                />
              </div>

              <div className="project-input-group">
                <label htmlFor="mobile-message">
                  Message
                </label>

                <textarea
                  id="mobile-message"
                  name="message"
                  value={enquiryForm.message}
                  onChange={handleEnquiryChange}
                  placeholder="Your message"
                  rows={4}
                />
              </div>

              {formStatus.message && (
                <div
                  className={`project-form-status ${formStatus.type}`}
                  role="alert"
                >
                  {formStatus.type === "success" && (
                    <CheckCircle2 size={17} />
                  )}

                  <span>{formStatus.message}</span>
                </div>
              )}

              <button
                type="submit"
                className="project-submit-button"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="project-button-spinner" />
                    Sending...
                  </>
                ) : (
                  <>
                    Send enquiry
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectDetails;