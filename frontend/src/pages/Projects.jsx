import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  MapPin,
  Layers,
  Search,
  ArrowRight,
  Loader2,
  SlidersHorizontal,
  X,
  CheckCircle2,
  ChevronDown,
  CalendarDays,
} from "lucide-react";
import { Link } from "react-router-dom";
import "./Projects.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://xevoprop.onrender.com/api";

function Projects() {
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showMobileFilters, setShowMobileFilters] =
    useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/projects/public`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load projects."
        );
      }

      const projectList = Array.isArray(data)
        ? data
        : data.projects || [];

      setProjects(projectList);
    } catch (err) {
      console.error(
        "PUBLIC PROJECTS ERROR:",
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

  const filteredProjects = useMemo(() => {
    let result = [...projects];

    if (search.trim()) {
      const keyword =
        search.toLowerCase().trim();

      result = result.filter((project) =>
        [
          project.name,
          project.location,
          project.city,
          project.state,
          project.type,
          project.description,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value)
              .toLowerCase()
              .includes(keyword)
          )
      );
    }

    if (type !== "All") {
      result = result.filter(
        (project) =>
          String(project.type || "")
            .toLowerCase() ===
          type.toLowerCase()
      );
    }

    return result;
  }, [projects, search, type]);

  const projectTypes = [
    "All",
    "Apartment",
    "Villa",
    "Plot",
    "Commercial",
  ];

  const getProjectImage = (project) => {
    const mediaList = Array.isArray(project?.project_media)
      ? [...project.project_media]
          .filter(Boolean)
          .sort(
            (a, b) =>
              Number(a?.sort_order ?? 0) -
              Number(b?.sort_order ?? 0)
          )
      : [];

    const imageMedia = mediaList.find((item) => {
      const mediaType = String(
        item?.media_type ||
        item?.type ||
        "image"
      ).toLowerCase();

      return (
        mediaType !== "video" &&
        Boolean(
          item?.media_url ||
          item?.url ||
          item?.secure_url ||
          item?.image_url
        )
      );
    });

    return (
      project?.image ||
      project?.image_url ||
      project?.cover_image ||
      imageMedia?.media_url ||
      imageMedia?.url ||
      imageMedia?.secure_url ||
      imageMedia?.image_url ||
      ""
    );
  };

  const getProjectLocation = (project) => {
    return (
      project.location ||
      project.city ||
      project.state ||
      "Location unavailable"
    );
  };

  const getProjectType = (project) => {
    return project.type || "Residential";
  };

  /* =====================================================
     STATUS HELPERS
  ===================================================== */

  const getStatusLabel = (status) => {
    if (!status) return "Available";

    const normalized = String(status)
      .trim()
      .toLowerCase();

    const labels = {
      approved: "Approved",
      pending: "Pending",
      rejected: "Rejected",
      available: "Available",
      active: "Active",
      draft: "Draft",
    };

    return (
      labels[normalized] ||
      normalized.charAt(0).toUpperCase() +
        normalized.slice(1)
    );
  };

  const getStatusClass = (status) => {
    if (!status) return "available";

    const normalized = String(status)
      .trim()
      .toLowerCase();

    if (normalized === "approved") {
      return "approved";
    }

    if (normalized === "pending") {
      return "pending";
    }

    if (normalized === "rejected") {
      return "rejected";
    }

    if (normalized === "active") {
      return "active";
    }

    return "available";
  };

  const clearFilters = () => {
    setSearch("");
    setType("All");
  };

  return (
    <div className="projects-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="projects-header">
        <div className="projects-container">

          <div className="projects-breadcrumb">
            <span>Home</span>
            <span>/</span>
            <span>Projects</span>
          </div>

          <div className="projects-heading-row">

            <div>
              <span className="projects-kicker">
                XEVOPROP PROJECTS
              </span>

              <h1>
                Discover exceptional
                <span> projects.</span>
              </h1>

              <p>
                Explore residential and commercial
                developments from verified developers
                across growing locations.
              </p>
            </div>

            <div className="projects-header-stat">
              <strong>
                {projects.length}
              </strong>

              <span>
                Projects Listed
              </span>
            </div>

          </div>

        </div>
      </header>

      <main className="projects-container">

        {/* =====================================================
            SEARCH
        ===================================================== */}

        <section className="projects-search-section">

          <div className="projects-search-card">

            <div className="projects-search-main">

              <Search size={19} />

              <div className="projects-search-field">

                <label>
                  SEARCH PROJECTS
                </label>

                <input
                  type="text"
                  placeholder="Search by project, location or developer"
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                />

              </div>

            </div>

            <div className="projects-search-divider" />

            <div className="projects-search-type">

              <label>
                PROJECT TYPE
              </label>

              <div className="projects-type-select">

                <Building2 size={16} />

                <select
                  value={type}
                  onChange={(e) =>
                    setType(e.target.value)
                  }
                >
                  {projectTypes.map(
                    (projectType) => (
                      <option
                        key={projectType}
                        value={projectType}
                      >
                        {projectType === "All"
                          ? "All Project Types"
                          : projectType}
                      </option>
                    )
                  )}
                </select>

                <ChevronDown size={15} />

              </div>

            </div>

            <button
              type="button"
              className="projects-search-button"
              onClick={() =>
                setShowMobileFilters(false)
              }
            >
              <Search size={17} />
              Search
            </button>

          </div>

        </section>

        {/* =====================================================
            MARKETPLACE
        ===================================================== */}

        <section className="projects-marketplace">

          <div className="projects-layout">

            {/* =================================================
                SIDEBAR
            ================================================= */}

            <aside
              className={`projects-sidebar ${
                showMobileFilters
                  ? "mobile-open"
                  : ""
              }`}
            >

              <div className="projects-sidebar-header">

                <div>
                  <span>
                    FILTER PROJECTS
                  </span>

                  <h3>
                    Refine your search
                  </h3>
                </div>

                <button
                  type="button"
                  className="projects-mobile-close"
                  onClick={() =>
                    setShowMobileFilters(
                      false
                    )
                  }
                >
                  <X size={19} />
                </button>

              </div>

              <div className="project-filter-group">

                <div className="project-filter-title">
                  Project Type
                </div>

                <div className="project-filter-options">

                  {projectTypes.map(
                    (projectType) => (
                      <button
                        type="button"
                        key={projectType}
                        className={
                          type === projectType
                            ? "active"
                            : ""
                        }
                        onClick={() => {
                          setType(
                            projectType
                          );
                          setShowMobileFilters(
                            false
                          );
                        }}
                      >

                        <span className="filter-radio">
                          {type ===
                            projectType && (
                            <span />
                          )}
                        </span>

                        {projectType === "All"
                          ? "All Projects"
                          : `${projectType}s`}

                      </button>
                    )
                  )}

                </div>

              </div>

              <div className="project-filter-group">

                <div className="project-filter-title">
                  Project Status
                </div>

                <div className="project-filter-note">
                  <CheckCircle2 size={15} />
                  Verified projects only
                </div>

              </div>

              <div className="project-filter-group">

                <div className="project-filter-title">
                  Location
                </div>

                <div className="project-location-note">
                  <MapPin size={15} />
                  Search using the location field
                </div>

              </div>

              {(search || type !== "All") && (
                <button
                  type="button"
                  className="clear-project-filters"
                  onClick={clearFilters}
                >
                  Clear all filters
                </button>
              )}

            </aside>

            {/* =================================================
                RESULTS
            ================================================= */}

            <div className="projects-results">

              <div className="projects-results-toolbar">

                <div>
                  <span className="results-kicker">
                    PROJECT DIRECTORY
                  </span>

                  <h2>
                    {loading
                      ? "Discover projects"
                      : `${filteredProjects.length} ${
                          filteredProjects.length ===
                          1
                            ? "Project"
                            : "Projects"
                        }`}
                  </h2>
                </div>

                <button
                  type="button"
                  className="projects-mobile-filter-button"
                  onClick={() =>
                    setShowMobileFilters(
                      true
                    )
                  }
                >
                  <SlidersHorizontal
                    size={16}
                  />
                  Filters
                </button>

              </div>

              {/* =================================================
                  ACTIVE FILTERS
              ================================================= */}

              {(search || type !== "All") && (
                <div className="projects-active-filters">

                  <span>
                    Active filters:
                  </span>

                  {search && (
                    <button
                      type="button"
                      onClick={() =>
                        setSearch("")
                      }
                    >
                      Search: {search}
                      <X size={13} />
                    </button>
                  )}

                  {type !== "All" && (
                    <button
                      type="button"
                      onClick={() =>
                        setType("All")
                      }
                    >
                      {type}
                      <X size={13} />
                    </button>
                  )}

                </div>
              )}

              {/* =================================================
                  LOADING
              ================================================= */}

              {loading && (
                <div className="projects-loading">

                  <div className="projects-loading-grid">

                    {[1, 2, 3, 4, 5, 6].map(
                      (item) => (
                        <div
                          className="project-skeleton"
                          key={item}
                        >
                          <div className="skeleton-image" />

                          <div className="skeleton-content">

                            <div className="skeleton-line large" />

                            <div className="skeleton-line medium" />

                            <div className="skeleton-line small" />

                          </div>
                        </div>
                      )
                    )}

                  </div>

                  <div className="projects-loading-message">
                    <Loader2
                      size={18}
                      className="projects-spinner"
                    />

                    Discovering projects...
                  </div>

                </div>
              )}

              {/* =================================================
                  ERROR
              ================================================= */}

              {!loading && error && (
                <div className="projects-error">

                  <div className="projects-error-icon">
                    <Building2 size={28} />
                  </div>

                  <h2>
                    Unable to load projects
                  </h2>

                  <p>{error}</p>

                  <button
                    type="button"
                    onClick={fetchProjects}
                  >
                    Try Again
                  </button>

                </div>
              )}

              {/* =================================================
                  EMPTY
              ================================================= */}

              {!loading &&
                !error &&
                filteredProjects.length ===
                  0 && (
                  <div className="projects-empty">

                    <div className="projects-empty-icon">
                      <Building2 size={30} />
                    </div>

                    <h2>
                      No projects found
                    </h2>

                    <p>
                      Try another search or
                      project type.
                    </p>

                    <button
                      type="button"
                      onClick={clearFilters}
                    >
                      Clear Filters
                    </button>

                  </div>
                )}

              {/* =================================================
                  PROJECT GRID
              ================================================= */}

              {!loading &&
                !error &&
                filteredProjects.length >
                  0 && (
                  <div className="projects-grid">

                    {filteredProjects.map(
                      (project) => {

                        const image =
                          getProjectImage(
                            project
                          );

                        const statusLabel =
                          getStatusLabel(
                            project.status
                          );

                        const statusClass =
                          getStatusClass(
                            project.status
                          );

                        return (
                          <article
                            className="project-card"
                            key={project.id}
                          >

                            {/* ================================
                                IMAGE
                            ================================= */}

                            <div className="project-card-image">

                              {image ? (
                                <img
                                  src={image}
                                  alt={
                                    project.name ||
                                    "Project"
                                  }
                                  loading="lazy"
                                />
                              ) : (
                                <div className="project-placeholder">
                                  <Building2
                                    size={42}
                                  />
                                </div>
                              )}

                              {/* STATUS AREA */}

                              <div className="project-card-top">

                                <span className="project-verified">
                                  <CheckCircle2
                                    size={13}
                                    strokeWidth={2.4}
                                  />

                                  <span>
                                    Verified
                                  </span>
                                </span>

                                <span
                                  className={`project-status ${statusClass}`}
                                >
                                  {statusLabel}
                                </span>

                              </div>

                            </div>

                            {/* ================================
                                CONTENT
                            ================================= */}

                            <div className="project-card-content">

                              <div className="project-card-location">

                                <MapPin size={15} />

                                <span>
                                  {getProjectLocation(
                                    project
                                  )}
                                </span>

                              </div>

                              <h2>
                                {project.name ||
                                  "Untitled Project"}
                              </h2>

                              <div className="project-card-info">

                                {project.type && (
                                  <div>
                                    <Building2
                                      size={15}
                                    />

                                    <span>
                                      {getProjectType(
                                        project
                                      )}
                                    </span>
                                  </div>
                                )}

                                {project.units !==
                                  null &&
                                  project.units !==
                                    undefined && (
                                    <div>
                                      <Layers
                                        size={15}
                                      />

                                      <span>
                                        {
                                          project.units
                                        }{" "}
                                        Units
                                      </span>
                                    </div>
                                  )}

                              </div>

                              {project.price && (
                                <div className="project-card-price">
                                  {project.price}
                                </div>
                              )}

                              {project.description && (
                                <p className="project-card-description">
                                  {
                                    project.description
                                  }
                                </p>
                              )}

                              <div className="project-card-footer">

                                <div className="project-card-developer">

                                  <CalendarDays
                                    size={14}
                                  />

                                  <span>
                                    Project
                                  </span>

                                </div>

                                <Link
                                  to={`/projects/${project.id}`}
                                  className="project-view-btn"
                                >
                                  View Project

                                  <ArrowRight
                                    size={16}
                                  />
                                </Link>

                              </div>

                            </div>

                          </article>
                        );
                      }
                    )}

                  </div>
                )}

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default Projects;