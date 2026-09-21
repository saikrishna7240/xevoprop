import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Phone,
  MapPin,
  CalendarDays,
  Building2,
  MessageSquare,
  Clock3,
  CheckCircle2,
  X,
  RefreshCw,
} from "lucide-react";

import { apiFetch } from "../lib/api";
import "./ProjectEnquiries.css";

export default function ProjectEnquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");
const navigate = useNavigate();
  const loadEnquiries = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await apiFetch(
        "/enquiries/project/developer"
      );

      setEnquiries(data?.enquiries || []);
    } catch (err) {
      console.error("Project enquiries error:", err);

      setError(
        err.message || "Failed to load project enquiries."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEnquiries();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      setUpdatingId(id);

      const data = await apiFetch(
        `/enquiries/project/${id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      setEnquiries((current) =>
        current.map((enquiry) =>
          enquiry.id === id
            ? {
                ...enquiry,
                status:
                  data?.enquiry?.status || status,
              }
            : enquiry
        )
      );

      if (selectedEnquiry?.id === id) {
        setSelectedEnquiry((current) => ({
          ...current,
          status:
            data?.enquiry?.status || status,
        }));
      }
    } catch (err) {
      console.error(
        "Update project enquiry status error:",
        err
      );

      alert(
        err.message ||
          "Failed to update enquiry status."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusIcon = (status) => {
    if (status === "contacted") {
      return <Clock3 size={15} />;
    }

    if (status === "resolved") {
      return <CheckCircle2 size={15} />;
    }

    return <MessageSquare size={15} />;
  };

  const getStatusLabel = (status) => {
    if (status === "contacted") {
      return "Contacted";
    }

    if (status === "resolved") {
      return "Resolved";
    }

    return "New";
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const newCount = enquiries.filter(
    (item) => item.status === "new"
  ).length;

  const contactedCount = enquiries.filter(
    (item) => item.status === "contacted"
  ).length;

  const resolvedCount = enquiries.filter(
    (item) => item.status === "resolved"
  ).length;

  return (
    <div className="project-enquiries-page">
      <div className="project-enquiries-container">

        {/* HEADER */}
        <div className="project-enquiries-header">
          <div>
            <span className="project-enquiries-eyebrow">
              DEVELOPER CENTER
            </span>

            <h1>Project Enquiries</h1>

            <p>
              Manage enquiries received from buyers
              interested in your projects.
            </p>
          </div>

          <button
            type="button"
            className="project-enquiries-refresh"
            onClick={loadEnquiries}
            disabled={loading}
          >
            <RefreshCw
              size={17}
              className={
                loading
                  ? "project-refresh-spinning"
                  : ""
              }
            />
            Refresh
          </button>
        </div>

        {/* STATS */}
        <div className="project-enquiries-stats">

          <div className="project-enquiry-stat">
            <div className="project-enquiry-stat-icon">
              <MessageSquare size={20} />
            </div>

            <div>
              <strong>{enquiries.length}</strong>
              <span>Total Enquiries</span>
            </div>
          </div>

          <div className="project-enquiry-stat">
            <div className="project-enquiry-stat-icon new">
              <MessageSquare size={20} />
            </div>

            <div>
              <strong>{newCount}</strong>
              <span>New</span>
            </div>
          </div>

          <div className="project-enquiry-stat">
            <div className="project-enquiry-stat-icon contacted">
              <Clock3 size={20} />
            </div>

            <div>
              <strong>{contactedCount}</strong>
              <span>Contacted</span>
            </div>
          </div>

          <div className="project-enquiry-stat">
            <div className="project-enquiry-stat-icon resolved">
              <CheckCircle2 size={20} />
            </div>

            <div>
              <strong>{resolvedCount}</strong>
              <span>Resolved</span>
            </div>
          </div>

        </div>

        {/* ERROR */}
        {error && (
          <div className="project-enquiries-error">
            {error}
          </div>
        )}

        {/* LOADING */}
        {loading ? (
          <div className="project-enquiries-loading">
            <div className="project-enquiries-spinner" />
            <p>Loading enquiries...</p>
          </div>
        ) : enquiries.length === 0 ? (
          /* EMPTY */
          <div className="project-enquiries-empty">
            <div className="project-enquiries-empty-icon">
              <MessageSquare size={30} />
            </div>

            <h2>No project enquiries yet</h2>

            <p>
              When buyers contact you about your
              approved projects, their enquiries
              will appear here.
            </p>
          </div>
        ) : (
          /* ENQUIRIES */
          <div className="project-enquiries-list">

            {enquiries.map((enquiry) => (
              <article
                className="project-enquiry-card"
                key={enquiry.id}
              >
                {/* PROJECT */}
                <div className="project-enquiry-project">

                  <div className="project-enquiry-project-image">
                    {enquiry.project_image ? (
                      <img
                        src={enquiry.project_image}
                        alt={enquiry.project_name}
                      />
                    ) : (
                      <Building2 size={25} />
                    )}
                  </div>

                  <div>
                    <span>
                      PROJECT
                    </span>

                    <h2>
                      {enquiry.project_name ||
                        "Untitled Project"}
                    </h2>

                    <p>
                      <MapPin size={14} />
                      {enquiry.project_location ||
                        enquiry.project_city ||
                        "Location unavailable"}
                    </p>
                  </div>

                </div>

                {/* BUYER */}
                <div className="project-enquiry-buyer">

                  <div className="project-enquiry-buyer-heading">
                    <div className="project-enquiry-avatar">
                      {(enquiry.name || "B")
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div>
                      <h3>
                        {enquiry.name ||
                          "Buyer"}
                      </h3>

                      <span>
                        Interested Buyer
                      </span>
                    </div>
                  </div>

                  <div className="project-enquiry-contact">

                    <a
                      href={`mailto:${enquiry.email}`}
                    >
                      <Mail size={15} />
                      {enquiry.email}
                    </a>

                    {enquiry.phone && (
                      <a
                        href={`tel:${enquiry.phone}`}
                      >
                        <Phone size={15} />
                        {enquiry.phone}
                      </a>
                    )}

                  </div>

                </div>

                {/* MESSAGE */}
                <div className="project-enquiry-message">
                  <span>MESSAGE</span>

                  <p>
                    {enquiry.message ||
                      "No message provided."}
                  </p>
                </div>

                {/* FOOTER */}
                <div className="project-enquiry-card-footer">

                  <div className="project-enquiry-date">
                    <CalendarDays size={15} />
                    {formatDate(
                      enquiry.created_at
                    )}
                  </div>

                  <div className="project-enquiry-actions">

                    <select
                      value={
                        enquiry.status || "new"
                      }
                      disabled={
                        updatingId === enquiry.id
                      }
                      onChange={(event) =>
                        updateStatus(
                          enquiry.id,
                          event.target.value
                        )
                      }
                      className={`project-enquiry-status ${enquiry.status || "new"}`}
                    >
                      <option value="new">
                        New
                      </option>

                      <option value="contacted">
                        Contacted
                      </option>

                      <option value="resolved">
                        Resolved
                      </option>
                    </select>

                    <button
                      type="button"
                      className="project-enquiry-view"
                      onClick={() =>
                        setSelectedEnquiry(
                          enquiry
                        )
                      }
                    >
                      View
                    </button>

                    <button
  type="button"
  className="project-enquiry-view"
  onClick={() =>
    navigate(
      `/project-enquiries/${enquiry.id}/chat`
    )
  }
>
  Chat
</button>

                  </div>
                </div>

              </article>
            ))}

          </div>
        )}
      </div>

      {/* DETAILS MODAL */}
      {selectedEnquiry && (
        <div
          className="project-enquiry-modal-overlay"
          onClick={() =>
            setSelectedEnquiry(null)
          }
        >
          <div
            className="project-enquiry-details-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="project-enquiry-details-header">
              <div>
                <span>ENQUIRY DETAILS</span>
                <h2>
                  {selectedEnquiry.name ||
                    "Buyer"}
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedEnquiry(null)
                }
              >
                <X size={19} />
              </button>
            </div>

            <div className="project-enquiry-details-project">
              {selectedEnquiry.project_image ? (
                <img
                  src={
                    selectedEnquiry.project_image
                  }
                  alt={
                    selectedEnquiry.project_name
                  }
                />
              ) : (
                <Building2 size={24} />
              )}

              <div>
                <span>PROJECT</span>
                <strong>
                  {selectedEnquiry.project_name}
                </strong>
              </div>
            </div>

            <div className="project-enquiry-details-grid">

              <div>
                <span>Email</span>
                <a
                  href={`mailto:${selectedEnquiry.email}`}
                >
                  {selectedEnquiry.email}
                </a>
              </div>

              <div>
                <span>Phone</span>
                <a
                  href={
                    selectedEnquiry.phone
                      ? `tel:${selectedEnquiry.phone}`
                      : "#"
                  }
                >
                  {selectedEnquiry.phone ||
                    "Not provided"}
                </a>
              </div>

              <div>
                <span>Location</span>
                <strong>
                  {selectedEnquiry.project_location ||
                    selectedEnquiry.project_city ||
                    "Not available"}
                </strong>
              </div>

              <div>
                <span>Date</span>
                <strong>
                  {formatDate(
                    selectedEnquiry.created_at
                  )}
                </strong>
              </div>

            </div>

            <div className="project-enquiry-details-message">
              <span>BUYER MESSAGE</span>

              <p>
                {selectedEnquiry.message ||
                  "No message provided."}
              </p>
            </div>

            <div className="project-enquiry-details-footer">

              <div className="project-enquiry-current-status">
                {getStatusIcon(
                  selectedEnquiry.status
                )}

                {getStatusLabel(
                  selectedEnquiry.status
                )}
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedEnquiry(null)
                }
              >
                Close
              </button>

            </div>

          </div>
        </div>
      )}
    </div>
  );
}