import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Heart,
  MapPin,
  Loader2,
  BedDouble,
  Maximize2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./FeaturedProperties.css";

const API_URL =
  import.meta.env.VITE_API_URL || "https://xevoprop.onrender.com/api";

function FeaturedProperties() {
  const navigate = useNavigate();

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await fetch(`${API_URL}/properties`);

        if (!response.ok) {
          throw new Error("Failed to fetch properties");
        }

        const data = await response.json();

        const propertyList = Array.isArray(data)
          ? data
          : data.properties || [];

        setProperties(propertyList.slice(0, 3));
      } catch (error) {
        console.error("Featured properties error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const toggleFavorite = (id) => {
    setFavorites((previous) => {
      if (previous.includes(id)) {
        return previous.filter((item) => item !== id);
      }

      return [...previous, id];
    });
  };

  const getImage = (property) => {
    if (property.image) {
      return property.image;
    }

    if (property.image_url) {
      return property.image_url;
    }

    if (property.images?.length > 0) {
      return property.images[0].image_url || property.images[0].url;
    }

    return "/placeholder-property.jpg";
  };

  const getPrice = (property) => {
    if (property.price) {
      return property.price;
    }

    if (property.min_price) {
      return `₹${property.min_price}`;
    }

    return "Price on request";
  };

  const getType = (property) => {
    return (
      property.property_type ||
      property.type ||
      property.category ||
      "Property"
    );
  };

  const getLocation = (property) => {
    return (
      property.location ||
      [property.city, property.state].filter(Boolean).join(", ") ||
      "Location unavailable"
    );
  };

  const getArea = (property) => {
    return (
      property.area ||
      property.area_sqft ||
      property.built_up_area ||
      property.size ||
      null
    );
  };

  if (loading) {
    return (
      <section className="featured-section" id="properties">
        <div className="featured-container">
          <div className="featured-loading">
            <Loader2 className="loading-spinner" size={24} />
            <span>Loading properties...</span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="featured-section" id="properties">
      <div className="featured-container">
        {/* Section header */}
        <motion.div
          className="featured-heading"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
        >
          <div className="featured-heading-content">
            <span className="section-label">FEATURED PROPERTIES</span>

            <h2>Properties worth exploring</h2>

            <p>
              Browse a selection of properties currently available on
              Xevoprop.
            </p>
          </div>

          <button
            type="button"
            className="featured-view-all"
            onClick={() => navigate("/properties")}
          >
            <span>View all properties</span>
            <ArrowUpRight size={16} />
          </button>
        </motion.div>

        {/* Empty state */}
        {properties.length === 0 ? (
          <div className="featured-empty">
            <div className="featured-empty-icon">
              <MapPin size={22} />
            </div>

            <div>
              <h3>No properties available yet</h3>

              <p>
                New properties will appear here once they are listed
                on Xevoprop.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/properties")}
            >
              Explore properties
              <ArrowUpRight size={16} />
            </button>
          </div>
        ) : (
          <div className="featured-property-grid">
            {properties.map((property, index) => {
              const propertyId = property.id;

              const isFavorite = favorites.includes(propertyId);

              return (
                <motion.article
                  className="featured-property-card"
                  key={propertyId}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.4,
                    delay: index * 0.08,
                  }}
                  onClick={() =>
                    navigate(`/properties/${propertyId}`)
                  }
                >
                  {/* Property image */}
                  <div className="featured-property-image">
                    <img
                      src={getImage(property)}
                      alt={
                        property.title ||
                        property.name ||
                        "Property"
                      }
                      onError={(event) => {
                        event.currentTarget.src =
                          "/placeholder-property.jpg";
                      }}
                    />

                    <div className="featured-image-top">
                      <span className="featured-verified">
                        Verified
                      </span>

                      <button
                        type="button"
                        className={`featured-favorite ${
                          isFavorite ? "active" : ""
                        }`}
                        onClick={(event) => {
                          event.stopPropagation();
                          toggleFavorite(propertyId);
                        }}
                        aria-label={
                          isFavorite
                            ? "Remove from favorites"
                            : "Add to favorites"
                        }
                      >
                        <Heart
                          size={17}
                          fill={
                            isFavorite
                              ? "currentColor"
                              : "none"
                          }
                        />
                      </button>
                    </div>

                    <span className="featured-property-type">
                      {getType(property)}
                    </span>
                  </div>

                  {/* Property information */}
                  <div className="featured-property-content">
                    <div className="featured-price-row">
                      <h3>{getPrice(property)}</h3>
                    </div>

                    <h4>
                      {property.title ||
                        property.name ||
                        "Property"}
                    </h4>

                    <div className="featured-location">
                      <MapPin size={14} />
                      <span>{getLocation(property)}</span>
                    </div>

                    <div className="featured-property-divider" />

                    <div className="featured-property-meta">
                      {property.bedrooms ? (
                        <span>
                          <BedDouble size={15} />
                          {property.bedrooms} BHK
                        </span>
                      ) : null}

                      {getArea(property) ? (
                        <span>
                          <Maximize2 size={14} />
                          {getArea(property)}
                        </span>
                      ) : null}

                      {!property.bedrooms &&
                        !getArea(property) && (
                          <span className="meta-property-type">
                            {getType(property)}
                          </span>
                        )}

                      <span className="property-details-link">
                        View details
                        <ArrowUpRight size={14} />
                      </span>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export default FeaturedProperties;