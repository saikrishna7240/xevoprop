import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Heart,
  MapPin,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./FeaturedProperties.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

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

        // Show only the first 3 properties on homepage
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
      [property.city, property.state]
        .filter(Boolean)
        .join(", ") ||
      "Location unavailable"
    );
  };

  const getArea = (property) => {
    return (
      property.area ||
      property.area_sqft ||
      property.built_up_area ||
      property.size ||
      "Area unavailable"
    );
  };

  if (loading) {
    return (
      <section className="featured-section" id="properties">
        <div className="featured-container">
          <div className="featured-loading">
            <Loader2 className="loading-spinner" size={30} />
            <p>Finding properties for you...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="featured-section" id="properties">
      <div className="featured-container">

        {/* Heading */}
        <motion.div
          className="featured-heading"
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <span className="section-label">
              CURATED FOR YOU
            </span>

            <h2>
              Properties worth
              <span> discovering.</span>
            </h2>

            <p>
              Explore properties selected to help you
              find the right place with less searching.
            </p>
          </div>

          <button
            type="button"
            className="view-all-btn"
            onClick={() => navigate("/properties")}
          >
            View all properties
            <ArrowUpRight size={17} />
          </button>
        </motion.div>

        {/* Empty state */}
        {properties.length === 0 ? (
          <div className="featured-empty">
            <h3>No properties available yet</h3>
            <p>
              New properties will appear here once they are
              listed on Xevoprop.
            </p>

            <button
              type="button"
              onClick={() => navigate("/properties")}
            >
              Explore properties
              <ArrowUpRight size={16} />
            </button>
          </div>
        ) : (
          <div className="property-grid">

            {properties.map((property, index) => {
              const propertyId = property.id;

              const isFavorite =
                favorites.includes(propertyId);

              return (
                <motion.article
                  className="property-card"
                  key={propertyId}
                  initial={{
                    opacity: 0,
                    y: 30,
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.6,
                    delay: index * 0.12,
                  }}
                  onClick={() =>
                    navigate(`/properties/${propertyId}`)
                  }
                >

                  {/* Image */}
                  <div className="property-image">

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

                    <div className="image-overlay"></div>

                    <span className="verified-badge">
                      ✓ Verified
                    </span>

                    {/* Favorite */}
                    <button
                      type="button"
                      className={`heart-btn ${
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
                        size={18}
                        fill={
                          isFavorite
                            ? "currentColor"
                            : "none"
                        }
                      />
                    </button>

                  </div>

                  {/* Details */}
                  <div className="property-details">

                    <div className="property-price-row">
                      <h3>
                        {getPrice(property)}
                      </h3>

                      <span>
                        {getType(property)}
                      </span>
                    </div>

                    <h4>
                      {property.title ||
                        property.name ||
                        "Property"}
                    </h4>

                    <div className="property-location">
                      <MapPin size={15} />
                      {getLocation(property)}
                    </div>

                    <div className="property-meta">
                      <span>{getArea(property)}</span>

                      <span>•</span>

                      <span>
                        {property.bedrooms
                          ? `${property.bedrooms} BHK`
                          : getType(property)}
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