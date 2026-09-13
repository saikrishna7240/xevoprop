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
          data.message ||
            "Failed to load enquiries."
        );
      }

      setEnquiries(data.enquiries || []);
    } catch (error) {
      console.error(
        "Load enquiries error:",
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

  useEffect(() => {
    loadEnquiries();
  }, []);

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

  const deleteEnquiry = async (id) => {
    /*
      We are intentionally not deleting from
      localStorage anymore.

      Enquiries now belong to the database.
      Delete functionality will be handled
      later with a protected backend endpoint.
    */

    alert(
      "Enquiries are now stored securely in the database and cannot be deleted from this page yet."
    );
  };

  return (
    <div className="my-enquiries-page">
      <div className="my-enquiries-container">

        {/* HEADER */}

        <div className="my-enquiries-header">

          <div>

            <span className="my-enquiries-eyebrow">
              YOUR PROPERTY ACTIVITY
            </span>

            <h1>
              My enquiries<span>.</span>
            </h1>

            <p>
              Keep track of the properties
              you've contacted.
            </p>

          </div>

          <div className="enquiries-count">

            <MessageCircle size={15} />

            <strong>
              {enquiries.length}
            </strong>

            <span>
              Enquiries
            </span>

          </div>

        </div>

        {/* LOADING */}

        {loading && (
          <div className="enquiries-empty">

            <div className="enquiries-empty-icon">
              <MessageCircle size={25} />
            </div>

            <h2>
              Loading enquiries...
            </h2>

            <p>
              Fetching your enquiry history.
            </p>

          </div>
        )}

        {/* ERROR */}

        {!loading && error && (
          <div className="enquiries-empty">

            <div className="enquiries-empty-icon">
              <MessageCircle size={25} />
            </div>

            <h2>
              Unable to load enquiries
            </h2>

            <p>
              {error}
            </p>

            <button
              type="button"
              onClick={loadEnquiries}
            >
              Try Again
            </button>

          </div>
        )}

        {/* EMPTY */}

        {!loading &&
          !error &&
          enquiries.length === 0 && (

            <div className="enquiries-empty">

              <div className="enquiries-empty-icon">
                <MessageCircle size={25} />
              </div>

              <h2>
                No enquiries yet.
              </h2>

              <p>
                When you contact a property,
                your enquiry will appear here.
              </p>

              <Link to="/properties">
                <Search size={14} />
                Explore Properties
                <ArrowRight size={14} />
              </Link>

            </div>

          )}

        {/* ENQUIRIES */}

        {!loading &&
          !error &&
          enquiries.length > 0 && (

            <div className="enquiries-list">

              {enquiries.map(
                (enquiry) => (

                  <div
                    className="enquiry-history-card"
                    key={enquiry.id}
                  >

                    {/* ICON */}

                    <div className="history-icon">

                      <MessageCircle
                        size={18}
                      />

                    </div>

                    {/* CONTENT */}

                    <div className="history-content">

                      <div className="history-heading">

                        <div>

                          <span className="history-label">
                            ENQUIRY SENT
                          </span>

                          <h2>
                            {enquiry.property_title ||
                              "Property"}
                          </h2>

                        </div>

                        <span className="history-date">
                          {formatDate(
                            enquiry.created_at
                          )}
                        </span>

                      </div>

                      {/* LOCATION */}

                      <div className="history-location">

                        <MapPin size={13} />

                        {enquiry.property_location ||
                          "Location unavailable"}

                      </div>

                      {/* MESSAGE */}

                      {enquiry.message && (
                        <div className="history-message">

                          <span>
                            Your message
                          </span>

                          <p>
                            {enquiry.message}
                          </p>

                        </div>
                      )}

                      {/* FOOTER */}

                      <div className="history-footer">

                        <span
                          className={`history-status ${
                            enquiry.status ||
                            "new"
                          }`}
                        >

                          <CheckCircle2
                            size={13}
                          />

                          {getStatusLabel(
                            enquiry.status
                          )}

                        </span>

                        <Link to={`/enquiries/${enquiry.id}/chat`} className="history-view">
                          <MessageCircle size={13} />
                          Chat
                          <ArrowRight size={13} />
                        </Link>

                        {enquiry.property_id && (
                          <Link
                            to={`/properties/${enquiry.property_id}`}
                            className="history-view"
                          >
                            View property

                            <ArrowRight
                              size={13}
                            />

                          </Link>
                        )}

                        <button
                          type="button"
                          className="history-delete"
                          onClick={() =>
                            deleteEnquiry(
                              enquiry.id
                            )
                          }
                          aria-label="Delete enquiry"
                        >
                          <Trash2
                            size={14}
                          />
                        </button>

                      </div>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        {/* FOOTER ACTION */}

        {!loading &&
          !error &&
          enquiries.length > 0 && (

            <div className="enquiries-bottom">

              <CalendarDays size={14} />

              Looking for another property?

              <Link to="/properties">

                Explore more

                <ArrowRight
                  size={13}
                />

              </Link>

            </div>

          )}

      </div>
    </div>
  );
}

export default MyEnquiries;