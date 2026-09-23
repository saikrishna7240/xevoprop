import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  MessageCircle,
  MapPin,
  CalendarDays,
  ArrowRight,
  Search,
  Trash2,
  CheckCircle2,
} from "lucide-react";

import "./MyEnquiries.css";

function MyEnquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadEnquiries = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login to view your enquiries.");
        return;
      }

      const response = await fetch(
        "https://xevoprop.onrender.com/api/enquiries/buyer",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load enquiries."
        );
      }

      setEnquiries(data.enquiries || []);
    } catch (error) {
      console.error("Load enquiries error:", error);

      setError(
        error.message || "Unable to load enquiries."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEnquiries();
  }, []);

  const formatDate = (date) => {
    if (!date) return "Recently";

    return new Date(date).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getStatusLabel = (status) => {
    if (!status || status === "new") {
      return "Submitted";
    }

    if (status === "contacted") {
      return "Seller Contacted";
    }

    if (status === "resolved") {
      return "Resolved";
    }

    return status;
  };

  const deleteEnquiry = async () => {
    alert(
      "Enquiries are now stored securely in the database and cannot be deleted from this page yet."
    );
  };

  return (
    <div className="my-enquiries-page">
      <div className="my-enquiries-container">

        {/* =================================================
            HEADER
        ================================================= */}

        <header className="my-enquiries-header">

          <div>
            <span className="my-enquiries-eyebrow">
              YOUR PROPERTY ACTIVITY
            </span>

            <h1>
              My enquiries<span>.</span>
            </h1>

            <p>
              Keep track of the properties you&apos;ve contacted.
            </p>
          </div>

          <div className="enquiries-count">
            <MessageCircle size={15} />

            <strong>{enquiries.length}</strong>

            <span>Enquiries</span>
          </div>

        </header>

        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (
          <div className="enquiries-state">
            <span className="enquiries-loader" />
            <p>Loading enquiries...</p>
          </div>
        )}

        {/* =================================================
            ERROR
        ================================================= */}

        {!loading && error && (
          <div className="enquiries-state">

            <div className="enquiries-state-icon">
              <MessageCircle size={22} />
            </div>

            <h2>Unable to load enquiries</h2>

            <p>{error}</p>

            <button
              type="button"
              onClick={loadEnquiries}
              className="enquiries-retry"
            >
              Try again
            </button>

          </div>
        )}

        {/* =================================================
            EMPTY
        ================================================= */}

        {!loading &&
          !error &&
          enquiries.length === 0 && (
            <div className="enquiries-state">

              <div className="enquiries-state-icon">
                <MessageCircle size={22} />
              </div>

              <h2>No enquiries yet</h2>

              <p>
                When you contact a property, your enquiry
                will appear here.
              </p>

              <Link
                to="/properties"
                className="enquiries-explore"
              >
                <Search size={14} />
                Explore Properties
                <ArrowRight size={14} />
              </Link>

            </div>
          )}

        {/* =================================================
            ENQUIRY LIST
        ================================================= */}

        {!loading &&
          !error &&
          enquiries.length > 0 && (

            <section className="enquiries-section">

              <div className="enquiries-list-heading">
                <span>PROPERTY</span>
                <span>SUBMITTED</span>
                <span>STATUS</span>
                <span />
              </div>

              <div className="enquiries-list">

                {enquiries.map((enquiry) => (

                  <article
                    className="enquiry-row"
                    key={enquiry.id}
                  >

                    {/* PROPERTY */}

                    <div className="enquiry-property">

                      <div className="enquiry-property-icon">
                        <MessageCircle size={16} />
                      </div>

                      <div className="enquiry-property-info">

                        <strong>
                          {enquiry.property_title ||
                            "Property"}
                        </strong>

                        <span>
                          <MapPin size={11} />

                          {enquiry.property_location ||
                            "Location unavailable"}
                        </span>

                      </div>

                    </div>

                    {/* DATE */}

                    <div className="enquiry-date">
                      <CalendarDays size={13} />

                      <span>
                        {formatDate(
                          enquiry.created_at
                        )}
                      </span>
                    </div>

                    {/* STATUS */}

                    <div className="enquiry-status">

                      <span
                        className={`enquiry-status-badge ${
                          enquiry.status || "new"
                        }`}
                      >
                        <CheckCircle2 size={12} />

                        {getStatusLabel(
                          enquiry.status
                        )}
                      </span>

                    </div>

                    {/* ACTIONS */}

                    <div className="enquiry-actions">

                      <Link
                        to={`/enquiries/${enquiry.id}/chat`}
                        className="enquiry-action"
                      >
                        <MessageCircle size={13} />
                        Chat
                      </Link>

                      {enquiry.property_id && (
                        <Link
                          to={`/properties/${enquiry.property_id}`}
                          className="enquiry-action"
                        >
                          View property
                          <ArrowRight size={13} />
                        </Link>
                      )}

                      <button
                        type="button"
                        className="enquiry-delete"
                        onClick={() =>
                          deleteEnquiry(enquiry.id)
                        }
                        aria-label="Delete enquiry"
                      >
                        <Trash2 size={14} />
                      </button>

                    </div>

                    {/* MESSAGE */}

                    {enquiry.message && (
                      <div className="enquiry-message">

                        <span>YOUR MESSAGE</span>

                        <p>{enquiry.message}</p>

                      </div>
                    )}

                  </article>

                ))}

              </div>

            </section>
          )}

        {/* =================================================
            BOTTOM ACTION
        ================================================= */}

        {!loading &&
          !error &&
          enquiries.length > 0 && (

            <div className="enquiries-bottom">

              <div>
                <CalendarDays size={14} />

                <span>
                  Looking for another property?
                </span>
              </div>

              <Link to="/properties">
                Explore more
                <ArrowRight size={13} />
              </Link>

            </div>
          )}

      </div>
    </div>
  );
}

export default MyEnquiries;