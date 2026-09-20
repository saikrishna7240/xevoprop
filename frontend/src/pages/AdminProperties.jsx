import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Eye,
  Home,
  RefreshCw,
  Search,
  Trash2,
  XCircle,
} from "lucide-react";
import "./AdminProperties.css";

const API_URL = "https://xevoprop.onrender.com/api";

function AdminProperties() {
  const [properties, setProperties] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getToken = () => localStorage.getItem("token");

  const loadProperties = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/admin/properties`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load properties");
      }

      setProperties(data.properties || []);
    } catch (err) {
      setError(err.message || "Failed to load properties");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProperties();
  }, []);

  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      const status = (property.status || "pending").toLowerCase();

      const matchesFilter =
        filter === "all" || status === filter;

      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        !searchText ||
        property.title?.toLowerCase().includes(searchText) ||
        property.location?.toLowerCase().includes(searchText) ||
        property.city?.toLowerCase().includes(searchText) ||
        property.owner_name?.toLowerCase().includes(searchText) ||
        property.owner_email?.toLowerCase().includes(searchText);

      return matchesFilter && matchesSearch;
    });
  }, [properties, filter, search]);

  const handleApprove = async (id) => {
    const confirmed = window.confirm(
      "Approve this property and make it visible publicly?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API_URL}/admin/properties/${id}/approve`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to approve property");
      }

      await loadProperties();
    } catch (err) {
      alert(err.message || "Failed to approve property");
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
        `${API_URL}/admin/properties/${id}/reject`,
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
        throw new Error(data.message || "Failed to reject property");
      }

      await loadProperties();
    } catch (err) {
      alert(err.message || "Failed to reject property");
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this property?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API_URL}/admin/properties/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete property");
      }

      setProperties((previous) =>
        previous.filter((property) => property.id !== id)
      );
    } catch (err) {
      alert(err.message || "Failed to delete property");
    }
  };

  const getStatusCount = (status) => {
    if (status === "all") return properties.length;

    return properties.filter(
      (property) =>
        (property.status || "pending").toLowerCase() === status
    ).length;
  };

  return (
    <div className="admin-properties-page">
      <div className="admin-properties-container">

        <div className="admin-properties-header">
          <div>
            <Link to="/admin" className="admin-properties-back">
              <ArrowLeft size={16} />
              Admin Dashboard
            </Link>

            <div className="admin-properties-title-row">
              <div className="admin-properties-title-icon">
                <Home size={22} />
              </div>

              <div>
                <span className="admin-properties-label">
                  PROPERTY MANAGEMENT
                </span>

                <h1>
                  Review <span>Properties</span>
                </h1>

                <p>
                  Verify seller submissions before they appear
                  on Xevoprop.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="admin-refresh-btn"
            onClick={loadProperties}
            disabled={loading}
          >
            <RefreshCw
              size={16}
              className={loading ? "spinning" : ""}
            />
            Refresh
          </button>
        </div>

        <div className="admin-property-stats">
          <button
            type="button"
            className={filter === "all" ? "active" : ""}
            onClick={() => setFilter("all")}
          >
            <span className="admin-stat-icon all">
              <Home size={17} />
            </span>

            <span>
              <strong>{getStatusCount("all")}</strong>
              <small>All Properties</small>
            </span>
          </button>

          <button
            type="button"
            className={filter === "pending" ? "active" : ""}
            onClick={() => setFilter("pending")}
          >
            <span className="admin-stat-icon pending">
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
            <span className="admin-stat-icon approved">
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
            <span className="admin-stat-icon rejected">
              <XCircle size={17} />
            </span>

            <span>
              <strong>{getStatusCount("rejected")}</strong>
              <small>Rejected</small>
            </span>
          </button>
        </div>

        <div className="admin-properties-toolbar">
          <div className="admin-property-search">
            <Search size={17} />

            <input
              type="text"
              placeholder="Search property, seller or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <span className="admin-results-count">
            {filteredProperties.length} properties
          </span>
        </div>

        {error && (
          <div className="admin-properties-error">
            {error}
          </div>
        )}

        {loading ? (
          <div className="admin-properties-loading">
            <div className="admin-loading-spinner" />
            <p>Loading properties...</p>
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="admin-properties-empty">
            <div>
              <Home size={28} />
            </div>

            <h3>No properties found</h3>

            <p>
              There are no properties matching the current
              filters.
            </p>
          </div>
        ) : (
          <div className="admin-properties-table-wrapper">
            <table className="admin-properties-table">
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Seller</th>
                  <th>Location</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredProperties.map((property) => {
                  const status =
                    (property.status || "pending").toLowerCase();

                  return (
                    <tr key={property.id}>
                      <td>
                        <div className="admin-property-cell">
                          <div className="admin-property-image">
                            {property.image ? (
                              <img
                                src={property.image}
                                alt={property.title}
                              />
                            ) : (
                              <Home size={20} />
                            )}
                          </div>

                          <div>
                            <strong>
                              {property.title || "Untitled Property"}
                            </strong>

                            <span>
                              {property.type || "Property"}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="admin-seller-cell">
                          <strong>
                            {property.owner_name || "Unknown Seller"}
                          </strong>

                          <span>
                            {property.owner_email || "—"}
                          </span>
                        </div>
                      </td>

                      <td>
                        <span className="admin-location">
                          {property.location ||
                            property.city ||
                            "—"}
                        </span>
                      </td>

                      <td>
                        <strong className="admin-price">
                          {property.price || "Price on request"}
                        </strong>
                      </td>

                      <td>
                        <span
                          className={`admin-status ${status}`}
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
                        <div className="admin-property-actions">
                          <Link
                            to={`/properties/${property.id}`}
                            className="admin-action view"
                            title="View property"
                          >
                            <Eye size={16} />
                          </Link>

                          {status !== "approved" && (
                            <button
                              type="button"
                              className="admin-action approve"
                              onClick={() =>
                                handleApprove(property.id)
                              }
                              title="Approve property"
                            >
                              <CheckCircle2 size={16} />
                            </button>
                          )}

                          {status !== "rejected" && (
                            <button
                              type="button"
                              className="admin-action reject"
                              onClick={() =>
                                handleReject(property.id)
                              }
                              title="Reject property"
                            >
                              <XCircle size={16} />
                            </button>
                          )}

                          <button
                            type="button"
                            className="admin-action delete"
                            onClick={() =>
                              handleDelete(property.id)
                            }
                            title="Delete property"
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

export default AdminProperties;