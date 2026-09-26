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

      const response = await fetch(`${API_URL}/projects`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load projects."
        );
      }

      setProjects(
        Array.isArray(data) ? data : data.projects || []
      );
    } catch (err) {
      console.error("PROJECT FETCH ERROR:", err);

      setError(
        err.message || "Unable to load projects."
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
      const token = localStorage.getItem("token");

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
          data.message || "Failed to delete project."
        );
      }

      setProjects((previous) =>
        previous.filter((project) => project.id !== id)
      );
    } catch (err) {
      console.error("DELETE PROJECT ERROR:", err);

      alert(
        err.message || "Unable to delete project."
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
    const count = Number(project.media_count);
    return Number.isFinite(count) ? count : 0;
  };

  const getVideoCount = (project) => {
    const count = Number(project.video_count);
    return Number.isFinite(count) ? count : 0;
  };

  const getProjectImage = (project) => {
  const mediaList = Array.isArray(project?.project_media)
    ? [...project.project_media].sort(
        (a, b) =>
          Number(a?.sort_order ?? 0) -
          Number(b?.sort_order ?? 0)
      )
    : [];

  const imageMedia = mediaList.find((media) => {
    const type = String(
      media?.media_type ||
        media?.type ||
        "image"
    ).toLowerCase();

    return (
      type !== "video" &&
      Boolean(
        media?.media_url ||
          media?.url ||
          media?.secure_url ||
          media?.image_url
      )
    );
  });

  return (
    project?.project_image ||
    imageMedia?.media_url ||
    imageMedia?.url ||
    imageMedia?.secure_url ||
    imageMedia?.image_url ||
    project?.image ||
    project?.image_url ||
    ""
  );
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
      agreement.information_confirmed === true &&
      agreement.authorization_confirmed === true;

    if (complete) {
      return {
        label: "Accepted",
        className: "accepted",
        icon: FileCheck2,
      };
    }

    return {
      label: "Incomplete",
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
            size={25}
          />
          <span>Loading your projects...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="my-projects-page">
      <div className="my-projects-container">

        <header className="my-projects-header">
          <div>
            <span className="my-projects-label">
              DEVELOPER SPACE
            </span>

            <h1>My Projects</h1>

            <p>
              Manage the property projects you have
              created on Xevoprop.
            </p>
          </div>

          <button
            type="button"
            className="add-project-btn"
            onClick={() => navigate("/add-project")}
          >
            <Plus size={16} />
            Create Project
          </button>
        </header>

        {error && (
          <div className="my-projects-error">
            {error}
          </div>
        )}

        {!error && projects.length === 0 && (
          <div className="my-projects-empty">
            <div className="empty-icon">
              <Building2 size={25} />
            </div>

            <h2>No projects yet</h2>

            <p>
              Create your first property project and
              submit it for admin approval.
            </p>

            <button
              type="button"
              className="add-project-btn"
              onClick={() => navigate("/add-project")}
            >
              <Plus size={16} />
              Create Your First Project
            </button>
          </div>
        )}

        {!error && projects.length > 0 && (
          <section className="projects-section">

            <div className="projects-summary">
              <div>
                <strong>
                  {projects.length}
                </strong>{" "}
                {projects.length === 1
                  ? "Project"
                  : "Projects"}
              </div>

              <span>
                Your project listings
              </span>
            </div>

            <div className="projects-grid">
              {projects.map((project) => {
                const projectStatus =
                  getProjectStatus(project.status);

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
                    className="project-card"
                    key={project.id}
                  >
                    <div className="project-image-wrap">
  {getProjectImage(project) ? (
    <img
      src={getProjectImage(project)}
      alt={project.name}
      className="project-image"
      onError={(event) => {
        console.error(
          "PROJECT IMAGE FAILED:",
          getProjectImage(project)
        );

        event.currentTarget.onerror = null;
        event.currentTarget.src = FALLBACK_IMAGE;
      }}
    />
  ) : (
    <img
      src={FALLBACK_IMAGE}
      alt={project.name}
      className="project-image"
    />
  )}

  <span
    className={`project-status ${projectStatus.className}`}
  >
    <StatusIcon size={13} />
    {projectStatus.label}
  </span>
</div>

                    <div className="project-card-body">

                      <div className="project-title-row">
                        <div>
                          <h2>{project.name}</h2>

                          <div className="project-location">
                            <MapPin size={13} />
                            <span>
                              {project.location ||
                                project.city ||
                                "Location unavailable"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="project-details">
                        {project.type && (
                          <div className="detail-item">
                            <Building2 size={14} />
                            <div>
                              <small>Type</small>
                              <span>{project.type}</span>
                            </div>
                          </div>
                        )}

                        {project.units !== null &&
                          project.units !== undefined && (
                            <div className="detail-item">
                              <Layers size={14} />
                              <div>
                                <small>Units</small>
                                <span>
                                  {project.units}
                                </span>
                              </div>
                            </div>
                          )}

                        {project.price && (
                          <div className="detail-item">
                            <IndianRupee size={14} />
                            <div>
                              <small>Price</small>
                              <span>
                                {project.price}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="project-media-row">
                        <span>
                          <Image size={14} />
                          {mediaCount} Images
                        </span>

                        <span>
                          <Video size={14} />
                          {videoCount} Videos
                        </span>
                      </div>

                      <div className="project-agreement">
                        <div>
                          <AgreementIcon size={15} />

                          <span>
                            Agreement
                          </span>
                        </div>

                        <strong
                          className={
                            agreementStatus.className
                          }
                        >
                          {agreementStatus.label}
                        </strong>

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

                      {project.status ===
                        "rejected" &&
                        project.rejection_reason && (
                          <div className="project-feedback rejected-feedback">
                            <XCircle size={15} />

                            <div>
                              <strong>
                                Admin feedback
                              </strong>

                              <p>
                                {
                                  project.rejection_reason
                                }
                              </p>
                            </div>
                          </div>
                        )}

                      {project.status === "pending" && (
                        <div className="project-feedback pending-feedback">
                          <Clock3 size={15} />

                          <span>
                            Waiting for admin approval.
                          </span>
                        </div>
                      )}

                      {project.status === "approved" && (
                        <div className="project-feedback approved-feedback">
                          <CheckCircle2 size={15} />

                          <span>
                            This project is live on
                            Xevoprop.
                          </span>
                        </div>
                      )}

                      <div className="project-actions">
                        <button
                          type="button"
                          className="view-project-btn"
                          onClick={() =>
                            navigate(
                              `/projects/${project.id}`
                            )
                          }
                        >
                          <Eye size={15} />
                          View
                        </button>

                        <button
                          type="button"
                          className="edit-project-btn"
                          onClick={() =>
                            navigate(
                              `/edit-project/${project.id}`
                            )
                          }
                        >
                          <Pencil size={15} />
                          Edit
                        </button>

                        <button
                          type="button"
                          className="delete-project-btn"
                          onClick={() =>
                            handleDelete(project.id)
                          }
                          title="Delete project"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>

                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default MyProjects;