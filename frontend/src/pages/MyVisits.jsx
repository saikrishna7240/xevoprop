import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
  Clock3,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import "./MyVisits.css";

function MyVisits() {
  const navigate = useNavigate();

  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadVisits();
  }, []);

  const loadVisits = async () => {
    try {
      setLoading(true);
      setError("");

      const token =
        localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        "https://xevoprop.onrender.com/api/visits/buyer",
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load visits."
        );
      }

      setVisits(data.visits || []);

    } catch (error) {
      console.error(
        "My visits error:",
        error
      );

      setError(
        error.message ||
          "Unable to load visits."
      );

    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(
      `${date}T00:00:00`
    ).toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  const formatTime = (time) => {
    if (!time) return "-";

    return new Date(
      `1970-01-01T${time}`
    ).toLocaleTimeString(
      "en-IN",
      {
        hour: "numeric",
        minute: "2-digit",
      }
    );
  };

  const statusIcon = (status) => {
    if (status === "accepted") {
      return <CheckCircle size={15} />;
    }

    if (status === "rejected") {
      return <XCircle size={15} />;
    }

    return <Clock3 size={15} />;
  };

  return (
    <div className="my-visits-page">

      <div className="my-visits-container">

        {/* HEADER */}

        <div className="my-visits-header">

          <button
            className="my-visits-back"
            onClick={() =>
              navigate("/properties")
            }
          >
            <ArrowLeft size={15} />
            Back to properties
          </button>

          <span>BUYER SPACE</span>

          <h1>My Visits</h1>

          <p>
            Track your property visit
            requests and schedules.
          </p>

        </div>

        {/* LOADING */}

        {loading && (
          <div className="my-visits-message">
            Loading your visits...
          </div>
        )}

        {/* ERROR */}

        {!loading && error && (
          <div className="my-visits-error">
            {error}
          </div>
        )}

        {/* EMPTY */}

        {!loading &&
          !error &&
          visits.length === 0 && (
            <div className="my-visits-empty">

              <CalendarDays size={35} />

              <h2>
                No visits booked yet
              </h2>

              <p>
                When you book a property
                visit, it will appear here.
              </p>

              <button
                onClick={() =>
                  navigate("/properties")
                }
              >
                Browse Properties
              </button>

            </div>
          )}

        {/* VISITS */}

        {!loading &&
          !error &&
          visits.length > 0 && (
            <div className="my-visits-list">

              {visits.map((visit) => (
                <div
                  className="my-visit-card"
                  key={visit.id}
                >

                  {/* IMAGE */}

                  <div className="my-visit-image">

                    {visit.property_image ? (
                      <img
                        src={
                          visit.property_image
                        }
                        alt={
                          visit.property_title
                        }
                      />
                    ) : (
                      <MapPin size={25} />
                    )}

                  </div>

                  {/* CONTENT */}

                  <div className="my-visit-content">

                    <div className="my-visit-top">

                      <div>
                        <span>
                          PROPERTY VISIT
                        </span>

                        <h2>
                          {visit.property_title}
                        </h2>

                        <p>
                          <MapPin size={13} />
                          {visit.property_location}
                        </p>
                      </div>

                      <div
                        className={`my-visit-status ${
                          visit.status ||
                          "pending"
                        }`}
                      >
                        {statusIcon(
                          visit.status
                        )}

                        {visit.status ||
                          "pending"}
                      </div>

                    </div>

                    {/* DATE / TIME */}

                    <div className="my-visit-schedule">

                      <div>
                        <CalendarDays
                          size={16}
                        />

                        <div>
                          <span>DATE</span>

                          <strong>
                            {formatDate(
                              visit.visit_date
                            )}
                          </strong>
                        </div>
                      </div>

                      <div>
                        <Clock size={16} />

                        <div>
                          <span>TIME</span>

                          <strong>
                            {formatTime(
                              visit.visit_time
                            )}
                          </strong>
                        </div>
                      </div>

                    </div>

                    {/* MESSAGE */}

                    {visit.message && (
                      <div className="my-visit-message">

                        <span>
                          YOUR MESSAGE
                        </span>

                        <p>
                          {visit.message}
                        </p>

                      </div>
                    )}

                    {/* VIEW PROPERTY */}

                    <button
                      className="view-property-btn"
                      onClick={() =>
                        navigate(
                          `/properties/${visit.property_id}`
                        )
                      }
                    >
                      View Property
                    </button>

                  </div>

                </div>
              ))}

            </div>
          )}

      </div>

    </div>
  );
}

export default MyVisits;