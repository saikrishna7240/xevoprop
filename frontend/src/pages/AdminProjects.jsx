import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Clock3,
  Eye,
  RefreshCw,
  Search,
  Trash2,
  XCircle,
} from "lucide-react";
import "./AdminProjects.css";

const API_URL = "https://xevoprop.onrender.com/api";

function AdminProjects() {
  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getToken = () => localStorage.getItem("token");

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/admin/projects`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load projects");
      }

      setProjects(data.projects || []);
    } catch (err) {
      setError(err.message || "Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const status = (project.status || "pending").toLowerCase();

      const matchesFilter =
        filter === "all" || status === filter;

      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        !searchText ||
        project.name?.toLowerCase().includes(searchText) ||
        project.location?.toLowerCase().includes(searchText) ||
        project.city?.toLowerCase().includes(searchText) ||
        project.developer_name
          ?.toLowerCase()
          .includes(searchText) ||
        project.developer_email
          ?.toLowerCase()
          .includes(searchText);

      return matchesFilter && matchesSearch;
    });
  }, [projects, filter, search]);

  const getStatusCount = (status) => {
    if (status === "all") return projects.length;

    return projects.filter(
      (project) =>
        (project.status || "pending").toLowerCase() === status
    ).length;
  };

  const handleApprove = async (id) => {
    const confirmed = window.confirm(
      "Approve this project and make it visible publicly?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API_URL}/admin/projects/${id}/approve`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to approve project");
      }

      await loadProjects();
    } catch (err) {
      alert(err.message || "Failed to approve project");
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt(
      "Enter a rejection reason:"
    );

    if (reason === null) return;

    if (!reason.trim()) {
      alert("Please enter a rejection reason.");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/admin/projects/${id}/reject`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({
            reason: reason.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to reject project");
      }

      await loadProjects();
    } catch (err) {
      alert(err.message || "Failed to reject project");
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this project?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API_URL}/admin/projects/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete project");
      }

      setProjects((previous) =>
        previous.filter((project) => project.id !== id)
      );
    } catch (err) {
      alert(err.message || "Failed to delete project");
    }
  };

  return (
    <div className="admin-projects-page">
      <div className="admin-projects-container">

        <div className="admin-projects-header">
          <div>
            <Link to="/admin" className="admin-projects-back">
              <ArrowLeft size={16} />
              Admin Dashboard
            </Link>

            <div className="admin-projects-title-row">
              <div className="admin-projects-title-icon">
                <Building2 size={22} />
              </div>

              <div>
                <span className="admin-projects-label">
                  PROJECT MANAGEMENT
                </span>

                <h1>
                  Review <span>Projects</span>
                </h1>

                <p>
                  Verify developer submissions before they appear
                  on Xevoprop.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="admin-projects-refresh"
            onClick={loadProjects}
            disabled={loading}
          >
            <RefreshCw
              size={16}
              className={loading ? "admin-projects-spinning" : ""}
            />
            Refresh
          </button>
        </div>

        <div className="admin-projects-stats">
          <button
            type="button"
            className={filter === "all" ? "active" : ""}
            onClick={() => setFilter("all")}
          >
            <span className="admin-project-stat-icon all">
              <Building2 size={17} />
            </span>

            <span>
              <strong>{getStatusCount("all")}</strong>
              <small>All Projects</small>
            </span>
          </button>

          <button
            type="button"
            className={filter === "pending" ? "active" : ""}
            onClick={() => setFilter("pending")}
          >
            <span className="admin-project-stat-icon pending">
              <Clock3 size={17} />
            </span>

            <span>
              <strong>{getStatusCount("pending")}</strong>
              <small>Pending Review</small>
            </span>
          </button>

          <button
            type="button"
            className={filter === "approved" ? "active" : ""}
            onClick={() => setFilter("approved")}
          >
            <span className="admin-project-stat-icon approved">
              <CheckCircle2 size={17} />
            </span>

            <span>
              <strong>{getStatusCount("approved")}</strong>
              <small>Approved</small>
            </span>
          </button>

          <button
            type="button"
            className={filter === "rejected" ? "active" : ""}
            onClick={() => setFilter("rejected")}
          >
            <span className="admin-project-stat-icon rejected">
              <XCircle size={17} />
            </span>

            <span>
              <strong>{getStatusCount("rejected")}</strong>
              <small>Rejected</small>
            </span>
          </button>
        </div>

        <div className="admin-projects-toolbar">
          <div className="admin-project-search">
            <Search size={17} />

            <input
              type="text"
              placeholder="Search project, developer or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <span className="admin-project-results">
            {filteredProjects.length} projects
          </span>
        </div>

        {error && (
          <div className="admin-projects-error">
            {error}
          </div>
        )}

        {loading ? (
          <div className="admin-projects-loading">
            <div className="admin-project-loading-spinner" />
            <p>Loading projects...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="admin-projects-empty">
            <div>
              <Building2 size={28} />
            </div>

            <h3>No projects found</h3>

            <p>
              There are no projects matching the current filters.
            </p>
          </div>
        ) : (
          <div className="admin-projects-table-wrapper">
            <table className="admin-projects-table">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Developer</th>
                  <th>Location</th>
                  <th>Price</th>
                  <th>Agreement</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredProjects.map((project) => {
                  const status =
                    (project.status || "pending").toLowerCase();

                  return (
                    <tr key={project.id}>
                      <td>
                        <div className="admin-project-cell">
                          <div className="admin-project-image">
                            {project.image ? (
                              <img
                                src={project.image}
                                alt={project.name}
                              />
                            ) : (
                              <Building2 size={20} />
                            )}
                          </div>

                          <div>
                            <strong>
                              {project.name || "Untitled Project"}
                            </strong>

                            <span>
                              {project.project_type ||
                                project.type ||
                                "Project"}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="admin-developer-cell">
                          <strong>
                            {project.developer_name ||
                              "Unknown Developer"}
                          </strong>

                          <span>
                            {project.developer_email || "—"}
                          </span>
                        </div>
                      </td>

                      <td>
                        <span className="admin-project-location">
                          {project.location ||
                            project.city ||
                            "—"}
                        </span>
                      </td>

                      <td>
                        <strong className="admin-project-price">
                          {project.price || "Price on request"}
                        </strong>
                      </td>

                      <td>
  {project.agreement?.signed_agreement_url ? (
  <a
    href={project.agreement.signed_agreement_url}
    target="_blank"
    rel="noopener noreferrer"
    className="admin-project-document"
  >
    <Eye size={15} />
    View Document
  </a>
) : (
  <span className="admin-no-document">
    No Document
  </span>
)}
</td>

                      <td>
                        <span
                          className={`admin-project-status ${status}`}
                        >
                          {status === "pending" && (
                            <Clock3 size={14} />
                          )}

                          {status === "approved" && (
                            <CheckCircle2 size={14} />
                          )}

                          {status === "rejected" && (
                            <XCircle size={14} />
                          )}

                          {status}
                        </span>
                      </td>

                      <td>
                        <div className="admin-project-actions">
                          <Link
                            to={`/projects/${project.id}`}
                            className="admin-project-action view"
                            title="View project"
                          >
                            <Eye size={16} />
                          </Link>

                          {status !== "approved" && (
                            <button
                              type="button"
                              className="admin-project-action approve"
                              onClick={() =>
                                handleApprove(project.id)
                              }
                              title="Approve project"
                            >
                              <CheckCircle2 size={16} />
                            </button>
                          )}

                          {status !== "rejected" && (
                            <button
                              type="button"
                              className="admin-project-action reject"
                              onClick={() =>
                                handleReject(project.id)
                              }
                              title="Reject project"
                            >
                              <XCircle size={16} />
                            </button>
                          )}

                          <button
                            type="button"
                            className="admin-project-action delete"
                            onClick={() =>
                              handleDelete(project.id)
                            }
                            title="Delete project"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminProjects;