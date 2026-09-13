import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Home,
  MapPin,
  BedDouble,
  Bath,
  Maximize,
  Trash2,
  Eye,
  Plus,
  Building2,
  Pencil,
} from "lucide-react";

import "./MyProperties.css";

function MyProperties() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =========================
     LOAD MY PROPERTIES
  ========================= */

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    try {
      setLoading(true);
      setError("");

      const token =
        localStorage.getItem("token");

      if (!token) {
        setError(
          "Please login as a Seller or Developer."
        );
        return;
      }

      const response = await fetch(
        "https://xevoprop.onrender.com/api/properties/my-properties",
        {
          method: "GET",

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
          "Failed to load your properties"
        );
      }

      setListings(
        data.properties || []
      );

    } catch (error) {
      console.error(
        "Load properties error:",
        error
      );

      setError(
        error.message ||
        "Unable to load properties."
      );

    } finally {
      setLoading(false);
    }
  };

  /* =========================
     DELETE PROPERTY
  ========================= */

  const deleteListing = async (id) => {
    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this property?"
      );

    if (!confirmDelete) return;

    try {
      const token =
        localStorage.getItem("token");

      const response = await fetch(
        `https://xevoprop.onrender.com/api/properties/${id}`,
        {
          method: "DELETE",

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
          "Failed to delete property"
        );
      }

      setListings(
        (previous) =>
          previous.filter(
            (listing) =>
              listing.id !== id
          )
      );

    } catch (error) {
      console.error(
        "Delete property error:",
        error
      );

      alert(
        error.message ||
        "Unable to delete property."
      );
    }
  };

  /* =========================
     PRICE FORMAT
  ========================= */

  const formatPrice = (listing) => {
    if (listing.price) {
      return listing.price;
    }

    const price =
      Number(listing.price_value) || 0;

    if (price >= 10000000) {
      return `₹${(
        price / 10000000
      ).toFixed(2)} Cr`;
    }

    if (price >= 100000) {
      return `₹${(
        price / 100000
      ).toFixed(1)} L`;
    }

    return `₹${price.toLocaleString(
      "en-IN"
    )}`;
  };

  /* =========================
     LOADING
  ========================= */

  if (loading) {
    return (
      <div className="my-properties-page">
        <div className="my-properties-container">
          <div className="my-properties-empty">
            <Building2 size={32} />

            <h2>
              Loading your properties...
            </h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-properties-page">

      <div className="my-properties-container">

        {/* HEADER */}

        <div className="my-properties-header">

          <div>

            <span className="my-properties-eyebrow">
              SELLER SPACE
            </span>

            <h1>
              My properties<span>.</span>
            </h1>

            <p>
              Manage the properties you've
              listed on Xevoprop.
            </p>

          </div>

          <Link
            to="/list-property"
            className="add-property-btn"
          >
            <Plus size={16} />
            List Property
          </Link>

        </div>

        {/* ERROR */}

        {error && (
          <div
            style={{
              marginBottom: "20px",
              padding: "14px",
              borderRadius: "8px",
              background:
                "rgba(255, 107, 107, 0.08)",
              border:
                "1px solid rgba(255, 107, 107, 0.2)",
              color: "#ff6b6b",
              fontSize: "11px",
            }}
          >
            {error}
          </div>
        )}

        {/* STATS */}

        <div className="my-properties-stats">

          <div className="property-stat">

            <Building2 size={18} />

            <div>

              <strong>
                {listings.length}
              </strong>

              <span>
                Total Listings
              </span>

            </div>

          </div>

          <div className="property-stat">

            <Eye size={18} />

            <div>

              <strong>
                {
                  listings.filter(
                    (item) =>
                      item.status ===
                      "published"
                  ).length
                }
              </strong>

              <span>
                Published
              </span>

            </div>

          </div>

        </div>

        {/* EMPTY */}

        {listings.length === 0 ? (

          <div className="my-properties-empty">

            <Home size={32} />

            <h2>
              No properties listed yet
            </h2>

            <p>
              Start by adding your first
              property to Xevoprop.
            </p>

            <Link to="/list-property">
              <Plus size={14} />
              List Your First Property
            </Link>

          </div>

        ) : (

          <div className="my-properties-list">

            {listings.map(
              (listing) => {

                const image =
                  listing.image || null;

                return (

                  <div
                    className="seller-property-card"
                    key={listing.id}
                  >

                    {/* IMAGE */}

                    <div className="seller-property-image">

                      {image ? (

                        <img
                          src={image}
                          alt={
                            listing.title
                          }
                        />

                      ) : (

                        <div className="no-property-image">
                          <Home size={25} />
                        </div>

                      )}

                      <span className="seller-status">
                        {listing.status ===
                        "published"
                          ? "Published"
                          : "Draft"}
                      </span>

                    </div>

                    {/* CONTENT */}

                    <div className="seller-property-content">

                      <div className="seller-property-top">

                        <div>

                          <span className="seller-property-type">
                            {listing.type ||
                              "Property"}
                          </span>

                          <h2>
                            {listing.title ||
                              "Untitled Property"}
                          </h2>

                        </div>

                        <strong className="seller-property-price">
                          {formatPrice(
                            listing
                          )}
                        </strong>

                      </div>

                      {/* LOCATION */}

                      <div className="seller-property-location">

                        <MapPin size={13} />

                        {listing.location ||
                          listing.city ||
                          "India"}

                      </div>

                      {/* DETAILS */}

                      <div className="seller-property-details">

                        <span>
                          <BedDouble
                            size={14}
                          />

                          {listing.bedrooms ||
                            0}{" "}
                          Beds
                        </span>

                        <span>
                          <Bath size={14} />

                          {listing.bathrooms ||
                            0}{" "}
                          Baths
                        </span>

                        <span>
                          <Maximize
                            size={14}
                          />

                          {listing.area ||
                            0}{" "}
                          sq.ft
                        </span>

                      </div>

                      {/* ACTIONS */}

                      <div className="seller-property-actions">

                        <Link
                          to={`/properties/${listing.id}`}
                          className="view-property-btn"
                        >
                          <Eye size={14} />
                          View
                        </Link>

                         <Link
    to={`/edit-property/${listing.id}`}
    className="edit-property-btn"
  >
    <Pencil size={12} />
    Edit
  </Link>

                        <button
                          type="button"
                          className="delete-property-btn"
                          onClick={() =>
                            deleteListing(
                              listing.id
                            )
                          }
                        >
                          <Trash2
                            size={14}
                          />
                          Delete
                        </button>

                      </div>

                    </div>

                  </div>

                );
              }
            )}

          </div>

        )}

      </div>

    </div>
  );
}

export default MyProperties;