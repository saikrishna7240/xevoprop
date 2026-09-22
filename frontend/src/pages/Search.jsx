import { useEffect, useMemo, useState } from "react";
import {
  useSearchParams,
  Link,
  useNavigate,
} from "react-router-dom";
import {
  ArrowRight,
  BedDouble,
  Building2,
  CheckCircle2,
  IndianRupee,
  MapPin,
  Search as SearchIcon,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";

import { apiFetch } from "../lib/api";
import "./Search.css";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=85";

const getPropertyImage = (property) => {
  if (!property) return FALLBACK_IMAGE;

  const media =
    property.property_images ||
    property.images ||
    property.media ||
    property.gallery ||
    [];

  if (Array.isArray(media)) {
    const imageItem = media.find((item) => {
      if (!item) return false;

      if (typeof item === "string") {
        return !/\.(mp4|webm|ogg|mov|m4v)(\?|$)/i.test(
          item
        );
      }

      return (
        item.media_type !== "video" &&
        item.type !== "video" &&
        item.resource_type !== "video"
      );
    });

    if (imageItem) {
      if (
        typeof imageItem === "string" &&
        imageItem.trim()
      ) {
        return imageItem;
      }

      return (
        imageItem.image_url ||
        imageItem.url ||
        imageItem.secure_url ||
        imageItem.image ||
        imageItem.src ||
        FALLBACK_IMAGE
      );
    }
  }

  return (
    property.image ||
    property.image_url ||
    property.cover_image ||
    property.property_image ||
    FALLBACK_IMAGE
  );
};

const formatLocation = (property) => {
  const location = property?.location?.trim?.() || "";
  const city = property?.city?.trim?.() || "";

  if (location && city) {
    return `${location}, ${city}`;
  }

  return location || city || "Location unavailable";
};

export default function Search() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const [city, setCity] = useState(
    params.get("city") || ""
  );

  const [type, setType] = useState(
    params.get("type") || "All"
  );

  const [bedrooms, setBedrooms] = useState(
    params.get("bedrooms") || "All"
  );

  const [maxPrice, setMaxPrice] = useState(
    params.get("maxPrice") || ""
  );

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =========================================================
     SEARCH
  ========================================================= */

  useEffect(() => {
    const searchProperties = async () => {
      try {
        setLoading(true);
        setError("");

        const query = new URLSearchParams({
          city,
          type,
          bedrooms,
          maxPrice,
        });

        const data = await apiFetch(
          `/search?${query.toString()}`
        );

        setResults(data.properties || []);
      } catch (err) {
        console.error("Search error:", err);

        setResults([]);
        setError(
          err.message ||
            "Unable to load properties right now."
        );
      } finally {
        setLoading(false);
      }
    };

    searchProperties();
  }, [city, type, bedrooms, maxPrice]);

  /* =========================================================
     SEARCH SUBMIT
  ========================================================= */

  const handleSearch = (e) => {
    e.preventDefault();

    const query = new URLSearchParams();

    if (city.trim()) {
      query.set("city", city.trim());
    }

    if (type !== "All") {
      query.set("type", type);
    }

    if (bedrooms !== "All") {
      query.set("bedrooms", bedrooms);
    }

    if (maxPrice) {
      query.set("maxPrice", maxPrice);
    }

    navigate(`/search?${query.toString()}`);
  };

  /* =========================================================
     CLEAR FILTERS
  ========================================================= */

  const clearFilters = () => {
    setCity("");
    setType("All");
    setBedrooms("All");
    setMaxPrice("");
  };

  /* =========================================================
     ACTIVE FILTER COUNT
  ========================================================= */

  const activeFilterCount = useMemo(() => {
    let count = 0;

    if (city.trim()) count += 1;
    if (type !== "All") count += 1;
    if (bedrooms !== "All") count += 1;
    if (maxPrice) count += 1;

    return count;
  }, [city, type, bedrooms, maxPrice]);

  return (
    <div className="search-page">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="search-hero">

        <div className="search-hero-inner">

          <div className="search-hero-copy">

            <span className="search-eyebrow">
              <Sparkles size={13} />
              XEVOPROP PROPERTY SEARCH
            </span>

            <h1>
              Find property
              <br />
              <span>with more certainty.</span>
            </h1>

            <p>
              Search properties by location, type,
              configuration and budget across the
              Xevoprop marketplace.
            </p>

          </div>

          <div className="search-hero-side">

            <div className="search-hero-side-card">
              <Building2 size={19} />

              <div>
                <strong>
                  Property Marketplace
                </strong>

                <span>
                  Search. Compare. Decide.
                </span>
              </div>
            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          SEARCH PANEL
      ===================================================== */}

      <section className="search-panel-wrap">

        <form
          className="search-panel"
          onSubmit={handleSearch}
        >

          <div className="search-panel-header">

            <div>
              <span>
                PROPERTY DISCOVERY
              </span>

              <h2>
                What are you looking for?
              </h2>
            </div>

            {activeFilterCount > 0 && (
              <button
                type="button"
                className="search-clear-top"
                onClick={clearFilters}
              >
                Clear {activeFilterCount} filter
                {activeFilterCount > 1 ? "s" : ""}
              </button>
            )}

          </div>

          <div className="search-fields">

            {/* LOCATION */}

            <div className="search-field search-field-location">

              <label>
                Location
              </label>

              <div className="search-input-wrapper">

                <MapPin size={17} />

                <input
                  type="text"
                  placeholder="City or location"
                  value={city}
                  onChange={(e) =>
                    setCity(e.target.value)
                  }
                />

              </div>

            </div>

            {/* TYPE */}

            <div className="search-field">

              <label>
                Property Type
              </label>

              <div className="search-select-wrapper">

                <Building2 size={17} />

                <select
                  value={type}
                  onChange={(e) =>
                    setType(e.target.value)
                  }
                >
                  <option value="All">
                    All property types
                  </option>

                  <option value="Apartment">
                    Apartment
                  </option>

                  <option value="Villa">
                    Villa
                  </option>

                  <option value="House">
                    House
                  </option>

                  <option value="Plot">
                    Plot
                  </option>

                  <option value="Commercial">
                    Commercial
                  </option>
                </select>

              </div>

            </div>

            {/* BEDROOMS */}

            <div className="search-field">

              <label>
                Configuration
              </label>

              <div className="search-select-wrapper">

                <BedDouble size={17} />

                <select
                  value={bedrooms}
                  onChange={(e) =>
                    setBedrooms(e.target.value)
                  }
                >
                  <option value="All">
                    Any configuration
                  </option>

                  <option value="1">
                    1 Bedroom
                  </option>

                  <option value="2">
                    2 Bedrooms
                  </option>

                  <option value="3">
                    3 Bedrooms
                  </option>

                  <option value="4">
                    4 Bedrooms
                  </option>

                  <option value="5">
                    5+ Bedrooms
                  </option>
                </select>

              </div>

            </div>

            {/* BUDGET */}

            <div className="search-field">

              <label>
                Maximum Budget
              </label>

              <div className="search-select-wrapper">

                <IndianRupee size={17} />

                <select
                  value={maxPrice}
                  onChange={(e) =>
                    setMaxPrice(e.target.value)
                  }
                >
                  <option value="">
                    Any budget
                  </option>

                  <option value="25">
                    ₹25 Lakh
                  </option>

                  <option value="50">
                    ₹50 Lakh
                  </option>

                  <option value="75">
                    ₹75 Lakh
                  </option>

                  <option value="100">
                    ₹1 Crore
                  </option>

                  <option value="150">
                    ₹1.5 Crore
                  </option>

                  <option value="200">
                    ₹2 Crore
                  </option>

                  <option value="300">
                    ₹3 Crore
                  </option>
                </select>

              </div>

            </div>

            <button
              type="submit"
              className="search-submit"
            >
              <SearchIcon size={17} />
              Search Properties
            </button>

          </div>

          <div className="search-filter-summary">

            <SlidersHorizontal size={14} />

            <span>
              Refine your search using location,
              property type, configuration and budget.
            </span>

          </div>

        </form>

      </section>

      {/* =====================================================
          RESULTS
      ===================================================== */}

      <section className="search-content">

        <div className="search-toolbar">

          <div className="search-results-heading">

            <span>
              PROPERTY INVENTORY
            </span>

            <h2>
              {loading
                ? "Searching properties..."
                : `${results.length} ${
                    results.length === 1
                      ? "property"
                      : "properties"
                  } found`}
            </h2>

          </div>

          <Link
            to="/properties"
            className="search-all-properties"
          >
            Browse all properties
            <ArrowRight size={15} />
          </Link>

        </div>

        {/* ===================================================
            ERROR
        =================================================== */}

        {!loading && error && (
          <div className="search-state search-error-state">

            <div className="search-state-icon">
              !
            </div>

            <h2>
              Unable to complete the search
            </h2>

            <p>
              {error}
            </p>

            <button
              type="button"
              onClick={() => window.location.reload()}
            >
              Try again
            </button>

          </div>
        )}

        {/* ===================================================
            LOADING
        =================================================== */}

        {loading && (
          <div className="search-results-grid">

            {Array.from({ length: 6 }).map(
              (_, index) => (
                <div
                  className="search-card search-card-skeleton"
                  key={index}
                >
                  <div className="skeleton-image" />

                  <div className="skeleton-content">
                    <span />
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              )
            )}

          </div>
        )}

        {/* ===================================================
            EMPTY
        =================================================== */}

        {!loading &&
          !error &&
          results.length === 0 && (
            <div className="search-empty">

              <div className="search-empty-icon">
                <SearchIcon size={28} />
              </div>

              <span className="search-empty-label">
                NO MATCHING INVENTORY
              </span>

              <h2>
                No properties match
                your current search.
              </h2>

              <p>
                Try a different location, property type,
                configuration or budget.
              </p>

              <button
                type="button"
                onClick={clearFilters}
              >
                Clear search filters
              </button>

            </div>
          )}

        {/* ===================================================
            RESULTS GRID
        =================================================== */}

        {!loading &&
          !error &&
          results.length > 0 && (
            <div className="search-results-grid">

              {results.map((property) => {

                const image =
                  getPropertyImage(property);

                const location =
                  formatLocation(property);

                return (
                  <Link
                    key={property.id}
                    to={`/properties/${property.id}`}
                    className="search-card"
                  >

                    {/* IMAGE */}

                    <div className="search-card-image">

                      <img
                        src={image}
                        alt={
                          property.title ||
                          "Property"
                        }
                        onError={(e) => {
                          e.currentTarget.src =
                            FALLBACK_IMAGE;
                        }}
                      />

                      <div className="search-card-image-overlay" />

                      {property.verified && (
                        <span className="search-verified">
                          <CheckCircle2 size={13} />
                          Verified
                        </span>
                      )}

                      <span className="search-card-type">
                        {property.type ||
                          "Property"}
                      </span>

                    </div>

                    {/* CONTENT */}

                    <div className="search-card-content">

                      <div className="search-card-price-row">

                        <strong>
                          {property.price ||
                            "Price on request"}
                        </strong>

                        <span>
                          View
                          <ArrowRight size={13} />
                        </span>

                      </div>

                      <h3>
                        {property.title ||
                          "Property"}
                      </h3>

                      <p className="search-card-location">

                        <MapPin size={13} />

                        {location}

                      </p>

                      <div className="search-card-specs">

                        <span>
                          <BedDouble size={13} />
                          {property.bedrooms ||
                            0}{" "}
                          Beds
                        </span>

                        <span>
                          {property.bathrooms ||
                            0}{" "}
                          Baths
                        </span>

                        <span>
                          {property.area ||
                            0}{" "}
                          sq.ft
                        </span>

                      </div>

                    </div>

                  </Link>
                );
              })}

            </div>
          )}

      </section>

    </div>
  );
}