import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  MapPin,
  BedDouble,
  Maximize,
  Heart,
  SlidersHorizontal,
  X,
  CheckCircle2,
  ArrowUpDown,
  Home,
} from "lucide-react";

import "./Properties.css";

const API_BASE =
  import.meta.env.VITE_API_URL ||
  "https://xevoprop.onrender.com/api";

function Properties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [propertyType, setPropertyType] = useState("all");
  const [bedrooms, setBedrooms] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minArea, setMinArea] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [readyOnly, setReadyOnly] = useState(false);

  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);

  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("xevoprop_favorites") || "[]"
      );
    } catch {
      return [];
    }
  });

  /* =====================================================
     LOAD PROPERTIES
  ===================================================== */

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE}/properties`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load properties."
        );
      }

      setProperties(data.properties || []);
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

  /* =====================================================
     FAVORITES
  ===================================================== */

  const toggleFavorite = async (event, propertyId) => {
    event.preventDefault();
    event.stopPropagation();

    const id = Number(propertyId);

    setFavorites((previous) => {
      const exists = previous.includes(id);

      const updated = exists
        ? previous.filter(
            (favoriteId) =>
              favoriteId !== id
          )
        : [...previous, id];

      localStorage.setItem(
        "xevoprop_favorites",
        JSON.stringify(updated)
      );

      return updated;
    });

    const token =
      localStorage.getItem("token");

    if (!token) return;

    try {
      const isFavorite =
        favorites.includes(id);

      await fetch(
        `${API_BASE}/favorites`,
        {
          method: isFavorite
            ? "DELETE"
            : "POST",
          headers: {
            "Content-Type":
              "application/json",
            Authorization:
              `Bearer ${token}`,
          },
          body: JSON.stringify({
            property_id: id,
          }),
        }
      );
    } catch (error) {
      console.error(
        "Favorite error:",
        error
      );
    }
  };

  /* =====================================================
     PRICE FORMAT
  ===================================================== */

  const formatPrice = (property) => {
    if (property.price) {
      return property.price;
    }

    const value =
      Number(property.price_value) || 0;

    if (!value) {
      return "Price on request";
    }

    if (value >= 10000000) {
      return `₹${(
        value / 10000000
      ).toFixed(2)} Cr`;
    }

    if (value >= 100000) {
      return `₹${(
        value / 100000
      ).toFixed(1)} L`;
    }

    return `₹${value.toLocaleString(
      "en-IN"
    )}`;
  };

  /* =====================================================
     FILTER + SORT
  ===================================================== */

  const filteredProperties = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    let result = properties.filter(
      (property) => {
        /* SEARCH */

        if (query) {
          const searchableText = [
            property.title,
            property.type,
            property.location,
            property.city,
            property.state,
            property.description,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          if (
            !searchableText.includes(query)
          ) {
            return false;
          }
        }

        /* PROPERTY TYPE */

        if (
          propertyType !== "all" &&
          String(property.type)
            .toLowerCase() !==
            propertyType.toLowerCase()
        ) {
          return false;
        }

        /* BEDROOMS */

        if (bedrooms !== "all") {
          const propertyBedrooms =
            Number(property.bedrooms) || 0;

          if (
            bedrooms === "4+" &&
            propertyBedrooms < 4
          ) {
            return false;
          }

          if (
            bedrooms !== "4+" &&
            propertyBedrooms !==
              Number(bedrooms)
          ) {
            return false;
          }
        }

        /* PRICE */

        const price =
          Number(property.price_value);

        if (
          minPrice &&
          (!price ||
            price <
              Number(minPrice))
        ) {
          return false;
        }

        if (
          maxPrice &&
          (!price ||
            price >
              Number(maxPrice))
        ) {
          return false;
        }

        /* AREA */

        const area =
          Number(property.area);

        if (
          minArea &&
          (!area ||
            area <
              Number(minArea))
        ) {
          return false;
        }

        /* VERIFIED */

        if (
          verifiedOnly &&
          !property.verified
        ) {
          return false;
        }

        /* READY TO MOVE */

        if (
          readyOnly &&
          !property.ready_to_move
        ) {
          return false;
        }

        return true;
      }
    );

    /* SORT */

    result = [...result].sort(
      (a, b) => {
        if (sortBy === "price-low") {
          return (
            Number(a.price_value || 0) -
            Number(b.price_value || 0)
          );
        }

        if (sortBy === "price-high") {
          return (
            Number(b.price_value || 0) -
            Number(a.price_value || 0)
          );
        }

        if (sortBy === "area") {
          return (
            Number(b.area || 0) -
            Number(a.area || 0)
          );
        }

        /* NEWEST */

        const dateA = new Date(
          a.created_at || 0
        ).getTime();

        const dateB = new Date(
          b.created_at || 0
        ).getTime();

        return dateB - dateA;
      }
    );

    return result;
  }, [
    properties,
    search,
    propertyType,
    bedrooms,
    minPrice,
    maxPrice,
    minArea,
    verifiedOnly,
    readyOnly,
    sortBy,
  ]);

  /* =====================================================
     RESET FILTERS
  ===================================================== */

  const resetFilters = () => {
    setSearch("");
    setPropertyType("all");
    setBedrooms("all");
    setMinPrice("");
    setMaxPrice("");
    setMinArea("");
    setVerifiedOnly(false);
    setReadyOnly(false);
    setSortBy("newest");
  };

  const activeFilterCount = [
    propertyType !== "all",
    bedrooms !== "all",
    minPrice !== "",
    maxPrice !== "",
    minArea !== "",
    verifiedOnly,
    readyOnly,
  ].filter(Boolean).length;

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <main className="properties-page">
        <section className="properties-loading">
          <div className="properties-loading-mark">
            <Home size={22} />
          </div>

          <p>Finding properties...</p>
        </section>
      </main>
    );
  }

  /* =====================================================
     ERROR
  ===================================================== */

  if (error) {
    return (
      <main className="properties-page">
        <section className="properties-error">
          <div className="properties-error-icon">
            <Home size={24} />
          </div>

          <h1>
            We couldn't load the properties.
          </h1>

          <p>{error}</p>

          <button
            type="button"
            onClick={loadProperties}
            className="properties-retry"
          >
            Try again
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="properties-page">

      {/* =================================================
          HERO
      ================================================= */}

      <section className="properties-hero">
        <div className="properties-hero-inner">

          <div className="properties-hero-copy">
            <span className="properties-eyebrow">
              THE COLLECTION
            </span>

            <h1>
              Find a place
              <br />
              <em>worth coming home to.</em>
            </h1>

            <p>
              Explore thoughtfully selected properties
              across locations, budgets and lifestyles.
            </p>
          </div>

          <div className="properties-hero-count">
            <strong>
              {filteredProperties.length}
            </strong>

            <span>
              properties
              <br />
              available
            </span>
          </div>

        </div>
      </section>

      {/* =================================================
          SEARCH
      ================================================= */}

      <section className="properties-discovery">
        <div className="properties-discovery-inner">

          <div className="properties-search-row">

            <div className="properties-search">
              <Search size={19} />

              <input
                type="text"
                placeholder="Search by location, city, property type..."
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
              />

              {search && (
                <button
                  type="button"
                  className="search-clear"
                  onClick={() =>
                    setSearch("")
                  }
                >
                  <X size={17} />
                </button>
              )}
            </div>

            <button
              type="button"
              className="filter-toggle"
              onClick={() =>
                setShowFilters(
                  (previous) =>
                    !previous
                )
              }
            >
              <SlidersHorizontal
                size={17}
              />

              Filters

              {activeFilterCount > 0 && (
                <span>
                  {activeFilterCount}
                </span>
              )}
            </button>

          </div>

          {/* =================================================
              FILTER PANEL
          ================================================= */}

          <div
            className={`properties-filter-panel ${
              showFilters
                ? "open"
                : ""
            }`}
          >

            <div className="filter-group">
              <label>
                PROPERTY TYPE
              </label>

              <select
                value={propertyType}
                onChange={(event) =>
                  setPropertyType(
                    event.target.value
                  )
                }
              >
                <option value="all">
                  All types
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

            <div className="filter-group">
              <label>
                BEDROOMS
              </label>

              <select
                value={bedrooms}
                onChange={(event) =>
                  setBedrooms(
                    event.target.value
                  )
                }
              >
                <option value="all">
                  Any
                </option>

                <option value="1">
                  1 BHK
                </option>

                <option value="2">
                  2 BHK
                </option>

                <option value="3">
                  3 BHK
                </option>

                <option value="4+">
                  4+ BHK
                </option>
              </select>
            </div>

            <div className="filter-group">
              <label>
                MIN PRICE
              </label>

              <input
                type="number"
                placeholder="₹ Minimum"
                value={minPrice}
                onChange={(event) =>
                  setMinPrice(
                    event.target.value
                  )
                }
              />
            </div>

            <div className="filter-group">
              <label>
                MAX PRICE
              </label>

              <input
                type="number"
                placeholder="₹ Maximum"
                value={maxPrice}
                onChange={(event) =>
                  setMaxPrice(
                    event.target.value
                  )
                }
              />
            </div>

            <div className="filter-group">
              <label>
                MIN AREA
              </label>

              <input
                type="number"
                placeholder="Sq. Ft."
                value={minArea}
                onChange={(event) =>
                  setMinArea(
                    event.target.value
                  )
                }
              />
            </div>

            <div className="filter-checks">

              <button
                type="button"
                className={
                  verifiedOnly
                    ? "filter-check active"
                    : "filter-check"
                }
                onClick={() =>
                  setVerifiedOnly(
                    (previous) =>
                      !previous
                  )
                }
              >
                <span>
                  {verifiedOnly && (
                    <CheckCircle2
                      size={14}
                    />
                  )}
                </span>

                Verified
              </button>

              <button
                type="button"
                className={
                  readyOnly
                    ? "filter-check active"
                    : "filter-check"
                }
                onClick={() =>
                  setReadyOnly(
                    (previous) =>
                      !previous
                  )
                }
              >
                <span>
                  {readyOnly && (
                    <CheckCircle2
                      size={14}
                    />
                  )}
                </span>

                Ready to Move
              </button>

            </div>

            {activeFilterCount > 0 && (
              <button
                type="button"
                className="clear-filters"
                onClick={resetFilters}
              >
                Clear all filters
              </button>
            )}

          </div>

        </div>
      </section>

      {/* =================================================
          RESULTS HEADER
      ================================================= */}

      <section className="properties-results">

        <div className="properties-results-header">

          <div>
            <span className="results-label">
              DISCOVER
            </span>

            <h2>
              Properties for you
            </h2>
          </div>

          <div className="properties-sort">
            <ArrowUpDown size={16} />

            <select
              value={sortBy}
              onChange={(event) =>
                setSortBy(
                  event.target.value
                )
              }
            >
              <option value="newest">
                Newest first
              </option>

              <option value="price-low">
                Price: Low to High
              </option>

              <option value="price-high">
                Price: High to Low
              </option>

              <option value="area">
                Largest area
              </option>
            </select>
          </div>

        </div>

        {/* =================================================
            PROPERTY GRID
        ================================================= */}

        {filteredProperties.length === 0 ? (
          <div className="properties-empty">

            <div className="properties-empty-icon">
              <Search size={23} />
            </div>

            <h3>
              No properties found
            </h3>

            <p>
              Try adjusting your search or
              removing some filters.
            </p>

            <button
              type="button"
              onClick={resetFilters}
            >
              Reset filters
            </button>

          </div>
        ) : (
          <div className="properties-grid">

            {filteredProperties.map(
              (property) => {

                const propertyId =
                  Number(property.id);

                const isFavorite =
                  favorites.includes(
                    propertyId
                  );

                return (
                  <Link
                    key={property.id}
                    to={`/properties/${property.id}`}
                    className="property-card"
                  >

                    {/* IMAGE */}

                    <div className="property-card-image">

                      <img
                        src={
                          property.image ||
                          "/property-placeholder.jpg"
                        }
                        alt={
                          property.title ||
                          "Property"
                        }
                        loading="lazy"
                      />

                      <div className="property-card-image-overlay" />

                      {property.verified && (
                        <span className="property-verified">
                          <CheckCircle2
                            size={13}
                          />

                          Verified
                        </span>
                      )}

                      <button
                        type="button"
                        className={
                          isFavorite
                            ? "property-favorite active"
                            : "property-favorite"
                        }
                        onClick={(event) =>
                          toggleFavorite(
                            event,
                            property.id
                          )
                        }
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

                      {property.ready_to_move && (
                        <span className="property-ready">
                          Ready to move
                        </span>
                      )}

                    </div>

                    {/* CONTENT */}

                    <div className="property-card-content">

                      <div className="property-card-top">

                        <span className="property-type">
                          {property.type ||
                            "Property"}
                        </span>

                        <span className="property-price">
                          {formatPrice(
                            property
                          )}
                        </span>

                      </div>

                      <h3>
                        {property.title ||
                          "Untitled Property"}
                      </h3>

                      <div className="property-location">
                        <MapPin
                          size={14}
                        />

                        <span>
                          {property.location ||
                            property.city ||
                            "Location unavailable"}
                        </span>
                      </div>

                      <div className="property-meta">

                        {property.bedrooms !=
                          null && (
                          <span>
                            <BedDouble
                              size={15}
                            />

                            {property.bedrooms}
                            {" "}
                            Beds
                          </span>
                        )}

                        {property.area !=
                          null && (
                          <span>
                            <Maximize
                              size={14}
                            />

                            {Number(
                              property.area
                            ).toLocaleString(
                              "en-IN"
                            )}
                            {" "}
                            sq.ft.
                          </span>
                        )}

                      </div>

                    </div>

                  </Link>
                );
              }
            )}

          </div>
        )}

      </section>

    </main>
  );
}

export default Properties;