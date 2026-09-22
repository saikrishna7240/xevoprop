import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Home,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Play,
  ShieldCheck,
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
        type:
          item.media_type === "video"
            ? "video"
            : "image",
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

  const loadProject = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiFetch(
        `/projects/public/${id}`
      );

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
        err?.message ||
          "Failed to load project details."
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
  };

  const handleEnquirySubmit = async (event) => {
    event.preventDefault();

    setFormStatus({
      type: "",
      message: "",
    });

    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken");

    if (!token) {
      navigate("/login");
      return;
    }

    if (
      !enquiryForm.name.trim() ||
      !enquiryForm.email.trim()
    ) {
      setFormStatus({
        type: "error",
        message:
          "Name and email are required.",
      });

      return;
    }

    try {
      setSubmitting(true);

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

      if (
        response?.success === false
      ) {
        throw new Error(
          response?.message ||
            "Failed to submit enquiry."
        );
      }

      setFormStatus({
        type: "success",
        message:
          "Your enquiry has been submitted successfully.",
      });

      setEnquiryForm({
        name: "",
        email: "",
        phone: "",
        message: "",
      });
    } catch (err) {
      console.error(
        "PROJECT ENQUIRY ERROR:",
        err
      );

      setFormStatus({
        type: "error",
        message:
          err?.message ||
          "Failed to submit enquiry.",
      });
    } finally {
      setSubmitting(false);
    }
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
              <Home size={28} />
            </div>

            <h2>
              Unable to load project
            </h2>

            <p>
              {error ||
                "Project not found."}
            </p>

            <button
              className="project-primary-button"
              onClick={() =>
                navigate("/projects")
              }
            >
              Browse Projects
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="project-details-page">
      <div className="project-details-container">
        {/* HEADER */}
        <div className="project-details-topbar">
          <button
            className="project-back-button"
            onClick={() => navigate("/projects")}
          >
            <ArrowLeft size={18} />
            Back to Projects
          </button>

          <div className="project-topbar-status">
            <CheckCircle2 size={16} />
            Verified Project
          </div>
        </div>

        {/* MEDIA */}
        <section className="project-gallery-section">
          <div className="project-main-media">
            {currentMedia.type === "video" ? (
              <video
                className="project-main-media-element"
                src={currentMedia.url}
                controls
                playsInline
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
                  <ChevronLeft size={22} />
                </button>

                <button
                  className="project-gallery-arrow project-gallery-next"
                  onClick={handleNext}
                  aria-label="Next media"
                >
                  <ChevronRight size={22} />
                </button>
              </>
            )}

            <div className="project-media-counter">
              {activeMedia + 1} / {media.length}
            </div>

            {currentMedia.type ===
              "video" && (
              <div className="project-current-video-label">
                <Play size={14} />
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
                >
                  {item.type === "video" ? (
                    <div className="project-video-thumbnail">
                      <video
                        src={item.url}
                        muted
                        preload="metadata"
                      />

                      <span>
                        <Play size={16} />
                      </span>
                    </div>
                  ) : (
                    <img
                      src={item.url}
                      alt={`${projectTitle} ${index + 1}`}
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </section>

        {/* CONTENT */}
        <section className="project-details-layout">
          <main className="project-details-main">
            <div className="project-heading-block">
              <div className="project-type-label">
                {projectType}
              </div>

              <h1>{projectTitle}</h1>

              <div className="project-location">
                <MapPin size={18} />
                <span>{location}</span>
                {project.city &&
                  project.city !==
                    location && (
                    <>
                      <span>•</span>
                      <span>
                        {project.city}
                      </span>
                    </>
                  )}
              </div>
            </div>

            <div className="project-price-block">
              <span className="project-price-label">
                Starting Price
              </span>

              <strong>{price}</strong>
            </div>

            <div className="project-specs">
              <div className="project-spec">
                <div className="project-spec-icon">
                  <Building2Icon />
                </div>
                <div>
                  <span>Project Type</span>
                  <strong>{projectType}</strong>
                </div>
              </div>

              <div className="project-spec">
                <div className="project-spec-icon">
                  <Users size={20} />
                </div>
                <div>
                  <span>Total Units</span>
                  <strong>{units}</strong>
                </div>
              </div>

              <div className="project-spec">
                <div className="project-spec-icon">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <span>Listing Status</span>
                  <strong>
                    {project.status ||
                      "Approved"}
                  </strong>
                </div>
              </div>
            </div>

            <div className="project-content-section">
              <h2>About this Project</h2>

              <p className="project-description">
                {description}
              </p>
            </div>

            <div className="project-content-section">
              <h2>Project Highlights</h2>

              <div className="project-highlight-grid">
                <div>
                  <CheckCircle2 size={18} />
                  Verified project listing
                </div>

                <div>
                  <CheckCircle2 size={18} />
                  Professional developer listing
                </div>

                <div>
                  <CheckCircle2 size={18} />
                  Multiple project media
                </div>

                <div>
                  <CheckCircle2 size={18} />
                  Enquiry support
                </div>
              </div>
            </div>
          </main>

          {/* ENQUIRY CARD */}
          <aside className="project-enquiry-card">
            <div className="project-enquiry-header">
              <span>Interested in this project?</span>
              <h2>
                Request Project Details
              </h2>
              <p>
                Send an enquiry and the
                developer can contact you.
              </p>
            </div>

            <form
              className="project-enquiry-form"
              onSubmit={handleEnquirySubmit}
            >
              <div className="project-input-group">
                <label>Your Name</label>

                <div className="project-input-wrapper">
                  <Users size={17} />
                  <input
                    type="text"
                    name="name"
                    value={enquiryForm.name}
                    onChange={
                      handleEnquiryChange
                    }
                    placeholder="Enter your name"
                  />
                </div>
              </div>

              <div className="project-input-group">
                <label>Email Address</label>

                <div className="project-input-wrapper">
                  <Mail size={17} />
                  <input
                    type="email"
                    name="email"
                    value={
                      enquiryForm.email
                    }
                    onChange={
                      handleEnquiryChange
                    }
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div className="project-input-group">
                <label>Phone Number</label>

                <div className="project-input-wrapper">
                  <Phone size={17} />
                  <input
                    type="tel"
                    name="phone"
                    value={
                      enquiryForm.phone
                    }
                    onChange={
                      handleEnquiryChange
                    }
                    placeholder="Enter your phone"
                  />
                </div>
              </div>

              <div className="project-input-group">
                <label>Message</label>

                <div className="project-input-wrapper project-textarea-wrapper">
                  <MessageSquare size={17} />

                  <textarea
                    name="message"
                    value={
                      enquiryForm.message
                    }
                    onChange={
                      handleEnquiryChange
                    }
                    placeholder="I am interested in this project..."
                    rows="4"
                  />
                </div>
              </div>

              {formStatus.message && (
                <div
                  className={`project-form-status ${formStatus.type}`}
                >
                  {formStatus.type ===
                    "success" && (
                    <CheckCircle2
                      size={17}
                    />
                  )}

                  {formStatus.message}
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
                    Send Enquiry
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="project-enquiry-note">
              <ShieldCheck size={17} />
              Your information is shared
              securely with the project
              representative.
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

        <button
          onClick={() =>
            setShowEnquiry(true)
          }
        >
          <MessageSquare size={18} />
          Enquire
        </button>
      </div>

      {/* MOBILE ENQUIRY MODAL */}
      {showEnquiry && (
        <div className="project-enquiry-overlay">
          <div className="project-enquiry-modal">
            <button
              className="project-modal-close"
              onClick={() =>
                setShowEnquiry(false)
              }
              aria-label="Close"
            >
              <X size={21} />
            </button>

            <div className="project-enquiry-header">
              <span>Project Enquiry</span>
              <h2>
                Request Details
              </h2>
              <p>
                Fill in your details and
                we'll connect you with the
                developer.
              </p>
            </div>

            <form
              className="project-enquiry-form"
              onSubmit={(event) => {
                handleEnquirySubmit(event);
                if (
                  !formStatus.message
                ) {
                  setShowEnquiry(false);
                }
              }}
            >
              <div className="project-input-group">
                <label>Your Name</label>
                <input
                  type="text"
                  name="name"
                  value={enquiryForm.name}
                  onChange={
                    handleEnquiryChange
                  }
                  placeholder="Enter your name"
                />
              </div>

              <div className="project-input-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={
                    enquiryForm.email
                  }
                  onChange={
                    handleEnquiryChange
                  }
                  placeholder="Enter your email"
                />
              </div>

              <div className="project-input-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={
                    enquiryForm.phone
                  }
                  onChange={
                    handleEnquiryChange
                  }
                  placeholder="Enter your phone"
                />
              </div>

              <div className="project-input-group">
                <label>Message</label>
                <textarea
                  name="message"
                  value={
                    enquiryForm.message
                  }
                  onChange={
                    handleEnquiryChange
                  }
                  placeholder="Your message"
                  rows="4"
                />
              </div>

              <button
                type="submit"
                className="project-submit-button"
                disabled={submitting}
              >
                {submitting
                  ? "Sending..."
                  : "Send Enquiry"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Building2Icon() {
  return <Home size={20} />;
}

export default ProjectDetails;