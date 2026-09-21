import { useEffect, useState } from "react";
import {
  Building2,
  MapPin,
  CalendarDays,
  MessageSquare,
  Clock3,
  CheckCircle2,
  ChevronRight,
  RefreshCw,
} from "lucide-react";

import { apiFetch } from "../lib/api";
import "./ProjectEnquiriesBuyer.css";

export default function ProjectEnquiriesBuyer() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadEnquiries = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const data = await apiFetch(
        "/enquiries/project/buyer"
      );

      setEnquiries(data?.enquiries || []);
    } catch (err) {
      console.error(
        "Buyer project enquiries error:",
        err
      );

      setError(
        err.message ||
          "Failed to load project enquiries."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadEnquiries();
  }, []);

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

  const openChat = (id) => {
    window.location.href =
      `/project-enquiries/${id}/chat`;
  };

  return (
    <div className="buyer-project-enquiries-page">
      <div className="buyer-project-enquiries-container">

        {/* HEADER */}
        <div className="buyer-project-enquiries-header">
          <div>
            <span className="buyer-project-enquiries-eyebrow">
              MY ENQUIRIES
            </span>

            <h1>Project Enquiries</h1>

            <p>
              Track your conversations with
              developers about their projects.
            </p>
          </div>

          <button
            type="button"
            className="buyer-project-enquiries-refresh"
            onClick={() => loadEnquiries(true)}
            disabled={loading || refreshing}
          >
            <RefreshCw
              size={17}
              className={
                refreshing
                  ? "buyer-enquiry-refresh-spin"
                  : ""
              }
            />

            Refresh
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div className="buyer-project-enquiries-error">
            {error}
          </div>
        )}

        {/* LOADING */}
        {loading ? (
          <div className="buyer-project-enquiries-loading">
            <div className="buyer-project-enquiries-spinner" />

            <p>
              Loading your project enquiries...
            </p>
          </div>
        ) : enquiries.length === 0 ? (
          /* EMPTY */
          <div className="buyer-project-enquiries-empty">
            <div className="buyer-project-enquiries-empty-icon">
              <Building2 size={30} />
            </div>

            <h2>No project enquiries yet</h2>

            <p>
              When you contact a developer about
              an approved project, your enquiry
              will appear here.
            </p>
          </div>
        ) : (
          /* LIST */
          <div className="buyer-project-enquiries-list">

            {enquiries.map((enquiry) => (
              <article
                className="buyer-project-enquiry-card"
                key={enquiry.id}
              >

                {/* PROJECT */}
                <div className="buyer-project-enquiry-project">

                  <div className="buyer-project-enquiry-image">
                    {enquiry.project_image ? (
                      <img
                        src={enquiry.project_image}
                        alt={enquiry.project_name}
                      />
                    ) : (
                      <Building2 size={25} />
                    )}
                  </div>

                  <div className="buyer-project-enquiry-project-info">
                    <span>PROJECT</span>

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

                {/* CONTENT */}
                <div className="buyer-project-enquiry-content">

                  <div className="buyer-project-enquiry-message">

                    <div className="buyer-project-enquiry-section-title">
                      <MessageSquare size={15} />
                      Your Message
                    </div>

                    <p>
                      {enquiry.message ||
                        "No message provided."}
                    </p>

                  </div>

                  <div className="buyer-project-enquiry-meta">

                    <div className="buyer-project-enquiry-date">
                      <CalendarDays size={15} />

                      {formatDate(
                        enquiry.created_at
                      )}
                    </div>

                    <div
                      className={`buyer-project-enquiry-status ${enquiry.status || "new"}`}
                    >
                      {getStatusIcon(
                        enquiry.status
                      )}

                      {getStatusLabel(
                        enquiry.status
                      )}
                    </div>

                  </div>

                </div>

                {/* FOOTER */}
                <div className="buyer-project-enquiry-footer">

                  <div>
                    <span>Developer response</span>

                    <strong>
                      {enquiry.status ===
                      "resolved"
                        ? "Enquiry resolved"
                        : enquiry.status ===
                          "contacted"
                        ? "Developer has contacted you"
                        : "Waiting for developer response"}
                    </strong>
                  </div>

                  <button
                    type="button"
                    className="buyer-project-enquiry-chat-button"
                    onClick={() =>
                      openChat(enquiry.id)
                    }
                  >
                    <MessageSquare size={16} />

                    Open Conversation

                    <ChevronRight size={16} />
                  </button>

                </div>

              </article>
            ))}

          </div>
        )}

      </div>
    </div>
  );
}