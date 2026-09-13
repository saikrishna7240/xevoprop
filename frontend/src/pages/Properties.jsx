import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../lib/api";
import {
  MapPin,
  BedDouble,
  Bath,
  Maximize,
  Heart,
} from "lucide-react";

import "./Properties.css";

function Properties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "http://localhost:5000/api/properties"
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to load properties"
          );
        }

        setProperties(
          data.properties || []
        );
      } catch (err) {
        console.error(
          "Properties error:",
          err
        );

        setError(
          "Unable to load properties"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
    if (localStorage.getItem("token")) apiFetch("/favorites").then(data => setFavorites((data.favorites||[]).map(p=>Number(p.id)))).catch(()=>{});
  }, []);

  const toggleFavorite = async (propertyId) => {
    try {
      if (!localStorage.getItem("token")) { alert("Please login to save properties."); return; }
      if (favorites.includes(Number(propertyId))) { await apiFetch(`/favorites/${propertyId}`, { method: "DELETE" }); setFavorites(x => x.filter(id => id !== Number(propertyId))); }
      else { await apiFetch(`/favorites/${propertyId}`, { method: "POST" }); setFavorites(x => [...x, Number(propertyId)]); }
    } catch (error) { alert(error.message); }
  };

  if (loading) {
    return (
      <div className="properties-page">
        <div className="properties-container">
          <div className="properties-state">
            Loading properties...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="properties-page">
        <div className="properties-container">
          <div className="properties-state error">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="properties-page">
      <div className="properties-container">

        {/* HEADER */}

        <div className="properties-header">
          <div>
            <span className="properties-eyebrow">
              EXPLORE
            </span>

            <h1>
              Find your next property
            </h1>

            <p>
              Discover verified properties
              that match your needs.
            </p>
          </div>

          <div className="property-count">
            {properties.length} Properties
          </div>
        </div>

        {/* EMPTY STATE */}

        {properties.length === 0 ? (
          <div className="properties-state">
            <h2>
              No properties available
            </h2>

            <p>
              New properties will appear
              here when they are listed.
            </p>

            <Link
              to="/list-property"
              className="list-property-link"
            >
              List a Property
            </Link>
          </div>
        ) : (
          <div className="properties-grid">

            {properties.map((property) => {
              const isFavorite =
                favorites.includes(
                  property.id
                );

              return (
                <article
                  className="property-card"
                  key={property.id}
                >

                  {/* IMAGE */}

                  <div className="property-image">

                    {property.image ? (
                      <img
                        src={property.image}
                        alt={property.title}
                      />
                    ) : (
                      <div className="property-image-placeholder">
                        No Image
                      </div>
                    )}

                    {property.verified && (
                      <span className="verified-badge">
                        ✓ Verified
                      </span>
                    )}

                    <button
                      className={
                        isFavorite
                          ? "property-favorite active"
                          : "property-favorite"
                      }
                      onClick={() =>
                        toggleFavorite(
                          property.id
                        )
                      }
                      aria-label="Favorite property"
                    >
                      <Heart
                        size={18}
                        fill={
                          isFavorite
                            ? "currentColor"
                            : "none"
                        }
                      />
                    </button>
                  </div>

                  {/* CONTENT */}

                  <div className="property-content">

                    <span className="property-type">
                      {property.type}
                    </span>

                    <h2>
                      {property.title}
                    </h2>

                    <div className="property-location">
                      <MapPin size={15} />
                      <span>
                        {property.location}
                      </span>
                    </div>

                    <div className="property-meta">

                      <span>
                        <BedDouble size={16} />
                        {property.bedrooms ??
                          "-"}{" "}
                        Beds
                      </span>

                      <span>
                        <Bath size={16} />
                        {property.bathrooms ??
                          "-"}{" "}
                        Baths
                      </span>

                      <span>
                        <Maximize size={16} />
                        {property.area ??
                          "-"}{" "}
                        sq.ft
                      </span>

                    </div>

                    <div className="property-footer">

                      <div>
                        <strong>
                          {property.price ||
                            "Price on request"}
                        </strong>

                        {property.ready_to_move && (
                          <small>
                            Ready to Move
                          </small>
                        )}
                      </div>

                      <Link
                        to={`/properties/${property.id}`}
                        className="view-property-btn"
                      >
                        View Details
                      </Link>

                    </div>

                  </div>
                </article>
              );
            })}

          </div>
        )}

      </div>
    </div>
  );
}

export default Properties;