import { useEffect, useState } from "react";
import {
  Building2,
  MapPin,
  Layers,
  Search,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import "./Projects.css";

const API_URL =
  import.meta.env.VITE_API_URL || "https://xevoprop.onrender.com/api";

function Projects() {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);

  const [search, setSearch] = useState("");
  const [type, setType] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [search, type, projects]);

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
          data.message ||
            "Failed to load projects."
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

  const filterProjects = () => {
    let result = [...projects];

    if (search.trim()) {
      const keyword =
        search.toLowerCase();

      result = result.filter((project) =>
        [
          project.name,
          project.location,
          project.city,
          project.state,
          project.type,
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

    setFilteredProjects(result);
  };

  return (
    <div className="projects-page">

      {/* HERO */}
      <section className="projects-hero">
        <div className="projects-hero-content">

          <span className="projects-label">
            XEVOPROP PROJECTS
          </span>

          <h1>
            Discover
            <span> exceptional projects.</span>
          </h1>

          <p>
            Explore residential and commercial
            projects created by verified
            developers on Xevoprop.
          </p>

        </div>
      </section>


      {/* MAIN */}
      <main className="projects-main">

        {/* TOOLBAR */}
        <div className="projects-toolbar">

          <div className="projects-search">
            <Search size={18} />

            <input
              type="text"
              placeholder="Search projects, locations..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />
          </div>

          <div className="projects-filter">
            <button
              className={
                type === "All"
                  ? "active"
                  : ""
              }
              onClick={() => setType("All")}
            >
              All
            </button>

            <button
              className={
                type === "Apartment"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setType("Apartment")
              }
            >
              Apartments
            </button>

            <button
              className={
                type === "Villa"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setType("Villa")
              }
            >
              Villas
            </button>

            <button
              className={
                type === "Plot"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setType("Plot")
              }
            >
              Plots
            </button>

            <button
              className={
                type === "Commercial"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setType("Commercial")
              }
            >
              Commercial
            </button>
          </div>

        </div>


        {/* RESULT COUNT */}
        {!loading && !error && (
          <div className="projects-result-count">
            <span>
              {filteredProjects.length}
            </span>{" "}
            project
            {filteredProjects.length !== 1
              ? "s"
              : ""}{" "}
            found
          </div>
        )}


        {/* LOADING */}
        {loading && (
          <div className="projects-loading">
            <Loader2
              size={32}
              className="projects-spinner"
            />

            <p>
              Discovering projects...
            </p>
          </div>
        )}


        {/* ERROR */}
        {!loading && error && (
          <div className="projects-error">
            <Building2 size={30} />

            <h2>
              Unable to load projects
            </h2>

            <p>{error}</p>

            <button
              onClick={fetchProjects}
            >
              Try Again
            </button>
          </div>
        )}


        {/* EMPTY */}
        {!loading &&
          !error &&
          filteredProjects.length === 0 && (
            <div className="projects-empty">
              <Building2 size={38} />

              <h2>
                No projects found
              </h2>

              <p>
                Try another search or
                property type.
              </p>
            </div>
          )}


        {/* PROJECT GRID */}
        {!loading &&
          !error &&
          filteredProjects.length > 0 && (
            <div className="projects-grid">

              {filteredProjects.map(
                (project) => (
                  <article
                    className="project-card"
                    key={project.id}
                  >

                    {/* IMAGE */}
                    <div className="project-card-image">

                      {project.image ? (
                        <img
                          src={project.image}
                          alt={project.name}
                        />
                      ) : (
                        <div className="project-placeholder">
                          <Building2
                            size={45}
                          />
                        </div>
                      )}

                      <span className="project-card-status">
                        {project.status ||
                          "Available"}
                      </span>

                    </div>


                    {/* CONTENT */}
                    <div className="project-card-content">

                      <h2>
                        {project.name}
                      </h2>

                      <div className="project-card-location">
                        <MapPin
                          size={15}
                        />

                        <span>
                          {project.location ||
                            project.city ||
                            "Location unavailable"}
                        </span>
                      </div>


                      <div className="project-card-info">

                        {project.type && (
                          <div>
                            <Building2
                              size={15}
                            />

                            <span>
                              {project.type}
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
                                {project.units}{" "}
                                units
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
                          {project.description}
                        </p>
                      )}


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

                  </article>
                )
              )}

            </div>
          )}

      </main>
    </div>
  );
}

export default Projects;