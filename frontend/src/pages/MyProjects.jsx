import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  Building2,
  MapPin,
  Layers,
  IndianRupee,
  Loader2,
  Clock3,
  CheckCircle2,
  XCircle,
  Image,
  Video,
  FileCheck2,
  ExternalLink,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./MyProjects.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://xevoprop.onrender.com/api";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=85";

function MyProjects() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        `${API_URL}/projects`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load projects."
        );
      }

      setProjects(
        Array.isArray(data)
          ? data
          : data.projects || []
      );
    } catch (err) {
      console.error(
        "PROJECT FETCH ERROR:",
        err
      );

      setError(
        err.message ||
          "Unable to load projects."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this project?"
    );

    if (!confirmed) return;

    try {
      const token =
        localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/projects/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to delete project."
        );
      }

      setProjects((previous) =>
        previous.filter(
          (project) =>
            project.id !== id
        )
      );
    } catch (err) {
      console.error(
        "DELETE PROJECT ERROR:",
        err
      );

      alert(
        err.message ||
          "Unable to delete project."
      );
    }
  };

  const getProjectStatus = (status) => {
    const normalizedStatus = String(
      status || "pending"
    ).toLowerCase();

    if (normalizedStatus === "approved") {
      return {
        label: "Approved",
        className: "approved",
        icon: CheckCircle2,
      };
    }

    if (normalizedStatus === "rejected") {
      return {
        label: "Rejected",
        className: "rejected",
        icon: XCircle,
      };
    }

    return {
      label: "Pending Review",
      className: "pending",
      icon: Clock3,
    };
  };

  const getMediaCount = (project) => {
    const count = Number(
      project.media_count
    );

    return Number.isFinite(count)
      ? count
      : 0;
  };

  const getVideoCount = (project) => {
    const count = Number(
      project.video_count
    );

    return Number.isFinite(count)
      ? count
      : 0;
  };

  const getAgreementStatus = (project) => {
    if (!project.agreement) {
      return {
        label: "Not Uploaded",
        className: "not-uploaded",
        icon: FileCheck2,
      };
    }

    const agreement = project.agreement;

    const complete =
      agreement.accepted === true &&
      agreement.information_confirmed ===
        true &&
      agreement.authorization_confirmed ===
        true;

    if (complete) {
      return {
        label: "Agreement Accepted",
        className: "accepted",
        icon: FileCheck2,
      };
    }

    return {
      label: "Agreement Incomplete",
      className: "incomplete",
      icon: FileCheck2,
    };
  };

  if (loading) {
    return (
      <div className="my-projects-page">
        <div className="my-projects-loading">
          <Loader2
            className="projects-spinner"
            size={30}
          />

          <p>
            Loading your projects...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-projects-page">
      <div className="my-projects-container">

        {/* HEADER */}

        <div className="my-projects-header">
          <div>
            <span className="my-projects-label">
              DEVELOPER SPACE
            </span>

            <h1>My Projects</h1>

            <p>
              Manage the property projects you
              have created on Xevoprop.
            </p>
          </div>

          <button
            className="add-project-btn"
            onClick={() =>
              navigate("/add-project")
            }
          >
            <Plus size={18} />
            Create Project
          </button>
        </div>

        {/* ERROR */}

        {error && (
          <div className="my-projects-error">
            {error}
          </div>
        )}

        {/* EMPTY STATE */}

        {!error &&
          projects.length === 0 && (
            <div className="my-projects-empty">
              <div className="empty-project-icon">
                <Building2 size={32} />
              </div>

              <h2>No projects yet</h2>

              <p>
                Create your first property
                project and submit it for
                admin approval.
              </p>

              <button
                className="add-project-btn"
                onClick={() =>
                  navigate("/add-project")
                }
              >
                <Plus size={18} />
                Create Your First Project
              </button>
            </div>
          )}

        {/* PROJECTS */}

        {projects.length > 0 && (
          <div className="my-projects-grid">

            {projects.map((project) => {
              const projectStatus =
                getProjectStatus(
                  project.status
                );

              const StatusIcon =
                projectStatus.icon;

              const agreementStatus =
                getAgreementStatus(project);

              const AgreementIcon =
                agreementStatus.icon;

              const mediaCount =
                getMediaCount(project);

              const videoCount =
                getVideoCount(project);

              return (
                <article
                  className="my-project-card"
                  key={project.id}
                >

                  {/* IMAGE */}

                  <div className="my-project-image">
                    {project.image ? (
                      <img
                        src={project.image}
                        alt={project.name}
                        onError={(event) => {
                          event.currentTarget.src =
                            FALLBACK_IMAGE;
                        }}
                      />
                    ) : (
                      <div className="project-image-placeholder">
                        <Building2 size={42} />
                      </div>
                    )}

                    <span
                      className={`project-status ${projectStatus.className}`}
                    >
                      <StatusIcon size={13} />

                      {projectStatus.label}
                    </span>
                  </div>

                  {/* CONTENT */}

                  <div className="my-project-content">

                    <h2>
                      {project.name}
                    </h2>

                    <div className="project-location">
                      <MapPin size={15} />

                      <span>
                        {project.location ||
                          project.city ||
                          "Location not available"}
                      </span>
                    </div>

                    <div className="project-meta">

                      {project.type && (
                        <div>
                          <Building2 size={14} />

                          <span>
                            {project.type}
                          </span>
                        </div>
                      )}

                      {project.units !== null &&
                        project.units !==
                          undefined && (
                          <div>
                            <Layers size={14} />

                            <span>
                              {project.units} units
                            </span>
                          </div>
                        )}

                    </div>

                    {project.price && (
                      <div className="project-price">
                        <IndianRupee size={16} />

                        <span>
                          {project.price}
                        </span>
                      </div>
                    )}

                    {/* MEDIA INFORMATION */}

                    <div className="project-media-summary">

                      <div className="project-media-stat">
                        <Image size={15} />

                        <span>
                          {mediaCount}{" "}
                          {mediaCount === 1
                            ? "Image"
                            : "Images"}
                        </span>
                      </div>

                      <div className="project-media-stat">
                        <Video size={15} />

                        <span>
                          {videoCount}{" "}
                          {videoCount === 1
                            ? "Video"
                            : "Videos"}
                        </span>
                      </div>

                    </div>

                    {/* AGREEMENT */}

                    <div
                      className={`project-agreement-status ${agreementStatus.className}`}
                    >
                      <AgreementIcon size={15} />

                      <span>
                        {agreementStatus.label}
                      </span>

                      {project.agreement
                        ?.agreement_version && (
                        <small>
                          v
                          {
                            project.agreement
                              .agreement_version
                          }
                        </small>
                      )}
                    </div>

                    {/* REJECTION MESSAGE */}

                    {project.status ===
                      "rejected" &&
                      project.rejection_reason && (
                        <div className="project-rejection">

                          <div className="project-rejection-title">
                            <XCircle size={15} />

                            <span>
                              Admin feedback
                            </span>
                          </div>

                          <p>
                            {
                              project.rejection_reason
                            }
                          </p>

                        </div>
                      )}

                    {/* PENDING MESSAGE */}

                    {project.status ===
                      "pending" && (
                      <div className="project-review-message">
                        <Clock3 size={15} />

                        <span>
                          Your project is waiting
                          for admin approval.
                        </span>
                      </div>
                    )}

                    {/* APPROVED MESSAGE */}

                    {project.status ===
                      "approved" && (
                      <div className="project-approved-message">
                        <CheckCircle2 size={15} />

                        <span>
                          This project is live on
                          Xevoprop.
                        </span>
                      </div>
                    )}

                    {/* ACTIONS */}

                    <div className="my-project-actions">

                      <button
                        onClick={() =>
                          navigate(
                            `/projects/${project.id}`
                          )
                        }
                      >
                        <Eye size={16} />
                        View
                      </button>

                      <button
                        onClick={() =>
                          navigate(
                            `/edit-project/${project.id}`
                          )
                        }
                      >
                        <Pencil size={16} />
                        Edit
                      </button>

                      <button
                        className="delete-project-btn"
                        onClick={() =>
                          handleDelete(
                            project.id
                          )
                        }
                      >
                        <Trash2 size={16} />
                      </button>

                    </div>

                  </div>
                </article>
              );
            })}

          </div>
        )}

      </div>
    </div>
  );
}

export default MyProjects;