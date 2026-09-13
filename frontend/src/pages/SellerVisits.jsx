import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  MapPin,
  Phone,
  Mail,
  MessageCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import "./SellerVisits.css";

function SellerVisits() {
  const navigate = useNavigate();

  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
const [rescheduleVisit, setRescheduleVisit] =
  useState(null);

const [newDate, setNewDate] = useState("");
const [newTime, setNewTime] = useState("");
 
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
        "https://xevoprop.onrender.com/api/visits/seller",
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
        "Seller visits error:",
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

  const updateVisitStatus = async (
  visitId,
  status
) => {
  try {
    setError("");

    const token =
      localStorage.getItem("token");

    const response = await fetch(
      `https://xevoprop.onrender.com/api/visits/${visitId}/status`,
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

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Failed to update visit."
      );
    }

    setVisits((previous) =>
      previous.map((visit) =>
        visit.id === visitId
          ? {
              ...visit,
              status,
            }
          : visit
      )
    );

  } catch (error) {
    console.error(
      "Update visit status error:",
      error
    );

    setError(
      error.message ||
        "Failed to update visit."
    );
  }
};


const rescheduleVisitRequest = async () => {
  if (!rescheduleVisit) return;

  if (!newDate || !newTime) {
    setError(
      "Please select a new date and time."
    );
    return;
  }

  try {
    setError("");

    const token =
      localStorage.getItem("token");

    const response = await fetch(
      `https://xevoprop.onrender.com/api/visits/${rescheduleVisit.id}/reschedule`,
      {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          visit_date: newDate,
          visit_time: newTime,
        }),
      }
    );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Failed to reschedule visit."
      );
    }

    setVisits((previous) =>
      previous.map((visit) =>
        visit.id === rescheduleVisit.id
          ? {
              ...visit,
              visit_date: newDate,
              visit_time: newTime,
              status: "pending",
            }
          : visit
      )
    );

    setRescheduleVisit(null);
    setNewDate("");
    setNewTime("");

  } catch (error) {
    console.error(
      "Reschedule error:",
      error
    );

    setError(
      error.message ||
        "Failed to reschedule visit."
    );
  }
};

  return (
    <div className="seller-visits-page">

      <div className="seller-visits-container">

        {/* HEADER */}

        <div className="seller-visits-header">

          <button
            className="visits-back"
            onClick={() =>
              navigate(
                "/my-properties"
              )
            }
          >
            <ArrowLeft size={15} />
            Back to my properties
          </button>

          <span>SELLER SPACE</span>

          <h1>Property Visits</h1>

          <p>
            Manage buyer visit requests
            for your properties.
          </p>

        </div>

        {/* LOADING */}

        {loading && (
          <div className="visits-message">
            Loading visit requests...
          </div>
        )}

        {/* ERROR */}

        {!loading && error && (
          <div className="visits-error">
            {error}
          </div>
        )}

        {/* EMPTY */}

        {!loading &&
          !error &&
          visits.length === 0 && (
            <div className="visits-empty">

              <CalendarDays size={34} />

              <h2>
                No visit requests yet
              </h2>

              <p>
                When buyers request a
                property visit, their
                requests will appear here.
              </p>

            </div>
          )}

        {/* VISITS */}

        {!loading &&
          !error &&
          visits.length > 0 && (
            <div className="visits-list">

              {visits.map((visit) => (
                <div
                  className="visit-card"
                  key={visit.id}
                >

                  {/* PROPERTY */}

                  <div className="visit-property">

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
                      <div className="visit-placeholder">
                        <MapPin size={24} />
                      </div>
                    )}

                    <div className="visit-property-info">

                      <span>
                        PROPERTY
                      </span>

                      <h2>
                        {visit.property_title}
                      </h2>

                    </div>

                  </div>

                  {/* VISIT DETAILS */}

                  <div className="visit-content">

                    <div className="visit-heading">

                      <div className="visit-buyer-icon">
                        <CalendarDays
                          size={17}
                        />
                      </div>

                      <div>
                        <span>
                          VISIT REQUEST
                        </span>

                        <h3>
                          {visit.name}
                        </h3>
                      </div>

                    </div>

                    {/* DATE & TIME */}

                    <div className="visit-schedule">

                      <div>
                        <CalendarDays
                          size={15}
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
                        <Clock size={15} />

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

                    {/* CONTACT */}

                    <div className="visit-contact">

                      <a
                        href={`mailto:${visit.email}`}
                      >
                        <Mail size={14} />
                        {visit.email}
                      </a>

                      {visit.phone && (
                        <a
                          href={`tel:${visit.phone}`}
                        >
                          <Phone size={14} />
                          {visit.phone}
                        </a>
                      )}

                    </div>

                    {/* MESSAGE */}

                    {visit.message && (
                      <div className="visit-message">

                        <strong>
                          MESSAGE
                        </strong>

                        <p>
                          {visit.message}
                        </p>

                      </div>
                    )}

                    {/* ACTIONS */}

                    <div className="visit-actions">

                      <button
                        type="button"
                        onClick={() =>
  updateVisitStatus(
    visit.id,
    "accepted"
  )
}
                      >
                        Accept
                      </button>

                      <button
                        type="button"
                        onClick={() =>
  updateVisitStatus(
    visit.id,
    "rejected"
  )
}
                      >
                        Reject
                      </button>

                      <button
                        type="button"
                        onClick={() => {
  setRescheduleVisit(visit);
  setNewDate(visit.visit_date);
  setNewTime(
    visit.visit_time?.slice(0, 5) || ""
  );
}}
                      >
                        Reschedule
                      </button>

                    </div>

                    {/* STATUS */}

                    <div className="visit-footer">

                      <span
                        className={`visit-status ${
                          visit.status ||
                          "pending"
                        }`}
                      >
                        {visit.status ||
                          "pending"}
                      </span>

                      <span>
                        Requested{" "}
                        {new Date(
                          visit.created_at
                        ).toLocaleDateString(
                          "en-IN"
                        )}
                      </span>

                    </div>

                  </div>

                </div>
              ))}

            </div>
          )}

      </div>

      {rescheduleVisit && (
  <div className="reschedule-overlay">

    <div className="reschedule-modal">

      <button
        className="reschedule-close"
        onClick={() =>
          setRescheduleVisit(null)
        }
      >
        ×
      </button>

      <span>RESCHEDULE VISIT</span>

      <h2>
        Choose a new schedule
      </h2>

      <p>
        {rescheduleVisit.name}'s visit
      </p>

      <label>
        NEW DATE
      </label>

      <input
        type="date"
        value={newDate}
        min={
          new Date()
            .toISOString()
            .split("T")[0]
        }
        onChange={(e) =>
          setNewDate(e.target.value)
        }
      />

      <label>
        NEW TIME
      </label>

      <input
        type="time"
        value={newTime}
        onChange={(e) =>
          setNewTime(e.target.value)
        }
      />

      <button
        className="confirm-reschedule"
        onClick={
          rescheduleVisitRequest
        }
      >
        Confirm Reschedule
      </button>

    </div>

  </div>
)}

    </div>
  );
}

export default SellerVisits;