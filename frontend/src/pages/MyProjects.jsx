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
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./MyProjects.css";

const API_URL =
  import.meta.env.VITE_API_URL || "https://xevoprop.onrender.com/api";

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
          data.message || "Failed to load projects."
        );
      }

      setProjects(
        Array.isArray(data)
          ? data
          : data.projects || []
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
        previous.filter(
          (project) => project.id !== id
        )
      );
    } catch (err) {
      console.error("DELETE PROJECT ERROR:", err);
      alert(
        err.message || "Unable to delete project."
      );
    }
  };

  if (loading) {
    return (
      <div className="my-projects-page">
        <div className="my-projects-loading">
          <Loader2 className="projects-spinner" size={30} />
          <p>Loading your projects...</p>
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
            onClick={() => navigate("/add-project")}
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
        {!error && projects.length === 0 && (
          <div className="my-projects-empty">
            <div className="empty-project-icon">
              <Building2 size={32} />
            </div>

            <h2>No projects yet</h2>

            <p>
              Create your first property project
              and publish it on Xevoprop.
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
            {projects.map((project) => (
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
                    />
                  ) : (
                    <div className="project-image-placeholder">
                      <Building2 size={42} />
                    </div>
                  )}

                  <span
                    className={`project-status ${
                      String(
                        project.status || ""
                      ).toLowerCase()
                    }`}
                  >
                    {project.status ||
                      "Available"}
                  </span>
                </div>

                {/* CONTENT */}
                <div className="my-project-content">

                  <h2>{project.name}</h2>

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
                      project.units !== undefined && (
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
                        handleDelete(project.id)
                      }
                    >
                      <Trash2 size={16} />
                    </button>

                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

export default MyProjects;