import { useEffect, useState } from "react";
import {
  MessageCircle,
  Mail,
  Phone,
  MapPin,
  ArrowLeft,
  MessageSquare,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import "./SellerEnquiries.css";

function SellerEnquiries() {
  const navigate = useNavigate();

  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    loadEnquiries();
  }, []);

  const loadEnquiries = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        "https://xevoprop.onrender.com/api/enquiries/seller",
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
            "Failed to load enquiries."
        );
      }

      setEnquiries(data.enquiries || []);
    } catch (error) {
      console.error(
        "Seller enquiries error:",
        error
      );

      setError(
        error.message ||
          "Unable to load enquiries."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     UPDATE ENQUIRY STATUS
  ========================= */

  const updateEnquiryStatus = async (
    enquiryId,
    status
  ) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        `https://xevoprop.onrender.com/api/enquiries/${enquiryId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update enquiry."
        );
      }

      setEnquiries((previous) =>
        previous.map((item) =>
          item.id === enquiryId
            ? {
                ...item,
                status:
                  data.enquiry.status,
              }
            : item
        )
      );
    } catch (error) {
      console.error(
        "Update enquiry status error:",
        error
      );

      alert(
        error.message ||
          "Unable to update enquiry."
      );
    }
  };

  /* =========================
     FILTERED ENQUIRIES
  ========================= */

  const filteredEnquiries =
    statusFilter === "all"
      ? enquiries
      : enquiries.filter(
          (item) =>
            (item.status || "new") ===
            statusFilter
        );

  /* =========================
     DATE FORMAT
  ========================= */

  const formatDate = (date) => {
    if (!date) return "Recently";

    return new Date(date).toLocaleString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }
    );
  };

  /* =========================
     STATUS LABEL
  ========================= */

  const getStatusLabel = (status) => {
    if (!status || status === "new") {
      return "New";
    }

    return (
      status.charAt(0).toUpperCase() +
      status.slice(1)
    );
  };

  return (
    <div className="seller-enquiries-page">

      <div className="seller-enquiries-container">

        {/* =========================
            HEADER
        ========================= */}

        <div className="seller-enquiries-header">

          <button
            className="enquiries-back"
            onClick={() =>
              navigate("/my-properties")
            }
          >
            <ArrowLeft size={15} />
            Back to my properties
          </button>

          <span>SELLER SPACE</span>

          <h1>Property Enquiries</h1>

          <p>
            See who is interested in your
            properties and manage your leads.
          </p>

        </div>

        {/* =========================
            LOADING
        ========================= */}

        {loading && (
          <div className="enquiries-message">
            Loading enquiries...
          </div>
        )}

        {/* =========================
            ERROR
        ========================= */}

        {!loading && error && (
          <div className="enquiries-error">
            {error}
          </div>
        )}

        {/* =========================
            EMPTY
        ========================= */}

        {!loading &&
          !error &&
          enquiries.length === 0 && (
            <div className="enquiries-empty">

              <MessageCircle size={32} />

              <h2>
                No enquiries yet
              </h2>

              <p>
                When buyers contact you about
                your properties, their enquiries
                will appear here.
              </p>

            </div>
          )}

        {/* =========================
            LEAD SUMMARY
        ========================= */}

        {!loading &&
          !error &&
          enquiries.length > 0 && (

            <div className="lead-summary">

              <div className="lead-stat">
                <span>TOTAL</span>

                <strong>
                  {enquiries.length}
                </strong>
              </div>

              <div className="lead-stat">
                <span>NEW</span>

                <strong>
                  {
                    enquiries.filter(
                      (item) =>
                        (item.status ||
                          "new") ===
                        "new"
                    ).length
                  }
                </strong>
              </div>

              <div className="lead-stat">
                <span>CONTACTED</span>

                <strong>
                  {
                    enquiries.filter(
                      (item) =>
                        item.status ===
                        "contacted"
                    ).length
                  }
                </strong>
              </div>

              <div className="lead-stat">
                <span>RESOLVED</span>

                <strong>
                  {
                    enquiries.filter(
                      (item) =>
                        item.status ===
                        "resolved"
                    ).length
                  }
                </strong>
              </div>

            </div>
          )}

        {/* =========================
            FILTER
        ========================= */}

        {!loading &&
          !error &&
          enquiries.length > 0 && (

            <div className="lead-filters">

              <button
                className={
                  statusFilter === "all"
                    ? "lead-filter active"
                    : "lead-filter"
                }
                onClick={() =>
                  setStatusFilter("all")
                }
              >
                All
              </button>

              <button
                className={
                  statusFilter === "new"
                    ? "lead-filter active"
                    : "lead-filter"
                }
                onClick={() =>
                  setStatusFilter("new")
                }
              >
                New
              </button>

              <button
                className={
                  statusFilter === "contacted"
                    ? "lead-filter active"
                    : "lead-filter"
                }
                onClick={() =>
                  setStatusFilter("contacted")
                }
              >
                Contacted
              </button>

              <button
                className={
                  statusFilter === "resolved"
                    ? "lead-filter active"
                    : "lead-filter"
                }
                onClick={() =>
                  setStatusFilter("resolved")
                }
              >
                Resolved
              </button>

            </div>
          )}

        {/* =========================
            ENQUIRIES
        ========================= */}

        {!loading &&
          !error &&
          enquiries.length > 0 && (

            <div className="enquiries-list">

              {filteredEnquiries.length === 0 ? (

                <div className="enquiries-message">
                  No enquiries match this filter.
                </div>

              ) : (

                filteredEnquiries.map(
                  (enquiry) => (

                    <div
                      className="enquiry-card"
                      key={enquiry.id}
                    >

                      {/* PROPERTY */}

                      <div className="enquiry-property">

                        {enquiry.property_image ? (

                          <img
                            src={
                              enquiry.property_image
                            }
                            alt={
                              enquiry.property_title
                            }
                          />

                        ) : (

                          <div className="enquiry-property-placeholder">
                            <MapPin size={22} />
                          </div>

                        )}

                        <div>

                          <span>
                            PROPERTY
                          </span>

                          <h2>
                            {enquiry.property_title ||
                              "Property"}
                          </h2>

                          {enquiry.property_location && (
                            <p>
                              <MapPin size={13} />
                              {
                                enquiry.property_location
                              }
                            </p>
                          )}

                        </div>

                      </div>

                      {/* BUYER */}

                      <div className="enquiry-buyer">

                        <div className="buyer-header">

                          <div className="buyer-icon">
                            <MessageCircle
                              size={16}
                            />
                          </div>

                          <div>

                            <span>
                              BUYER ENQUIRY
                            </span>

                            <h3>
                              {enquiry.name}
                            </h3>

                          </div>

                        </div>

                        {/* CONTACT */}

                        <div className="buyer-contact">

                          <a
                            href={`mailto:${enquiry.email}`}
                          >
                            <Mail size={14} />
                            {enquiry.email}
                          </a>

                          {enquiry.phone && (
                            <a
                              href={`tel:${enquiry.phone}`}
                            >
                              <Phone size={14} />
                              {enquiry.phone}
                            </a>
                          )}

                        </div>

                        {/* LEAD ACTIONS */}

                        <div className="lead-actions">

                          {enquiry.phone && (
                            <a
                              href={`tel:${enquiry.phone}`}
                              className="lead-action call"
                            >
                              <Phone size={13} />
                              Call
                            </a>
                          )}

                          <a
                            href={`mailto:${enquiry.email}`}
                            className="lead-action email"
                          >
                            <Mail size={13} />
                            Email
                          </a>

                          {enquiry.phone && (
                            <a
                              href={`https://wa.me/${enquiry.phone.replace(
                                /\D/g,
                                ""
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="lead-action whatsapp"
                            >
                              <MessageCircle
                                size={13}
                              />
                              WhatsApp
                            </a>
                          )}

                          {/* CHAT */}

                          <button
                            type="button"
                            className="lead-action chat"
                            onClick={() =>
                              navigate(
                                `/enquiries/${enquiry.id}/chat`
                              )
                            }
                          >
                            <MessageSquare
                              size={13}
                            />
                            Chat
                          </button>

                        </div>

                        {/* MESSAGE */}

                        {enquiry.message && (
                          <div className="buyer-message">

                            <strong>
                              Message
                            </strong>

                            <p>
                              {enquiry.message}
                            </p>

                          </div>
                        )}

                        {/* FOOTER */}

                        <div className="enquiry-footer">

                          <div className="enquiry-status-section">

                            <span
                              className={`enquiry-status ${
                                enquiry.status ||
                                "new"
                              }`}
                            >
                              {getStatusLabel(
                                enquiry.status
                              )}
                            </span>

                            <div className="enquiry-actions">

                              {enquiry.status !==
                                "new" && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateEnquiryStatus(
                                      enquiry.id,
                                      "new"
                                    )
                                  }
                                >
                                  New
                                </button>
                              )}

                              {enquiry.status !==
                                "contacted" && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateEnquiryStatus(
                                      enquiry.id,
                                      "contacted"
                                    )
                                  }
                                >
                                  Contacted
                                </button>
                              )}

                              {enquiry.status !==
                                "resolved" && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateEnquiryStatus(
                                      enquiry.id,
                                      "resolved"
                                    )
                                  }
                                >
                                  Resolved
                                </button>
                              )}

                            </div>

                          </div>

                          <span>
                            Received{" "}
                            {formatDate(
                              enquiry.created_at
                            )}
                          </span>

                        </div>

                      </div>

                    </div>
                  )
                )
              )}

            </div>
          )}

      </div>

    </div>
  );
}

export default SellerEnquiries;