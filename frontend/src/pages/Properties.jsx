import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
  ArrowDownUp,
  Bath,
  BedDouble,
  Building2,
  Check,
  ChevronDown,
  ChevronRight,
  Heart,
  MapPin,
  Maximize2,
  Phone,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

import "./Properties.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://xevoprop.onrender.com/api";

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85",
];

const PROPERTY_TYPES = [
  "Apartment",
  "Villa",
  "Independent House",
  "Plot",
  "Commercial",
  "Builder Floor",
  "Penthouse",
];

const BHK_OPTIONS = [
  "1 BHK",
  "2 BHK",
  "3 BHK",
  "4 BHK",
  "5+ BHK",
];



const SORT_OPTIONS = [
  {
    value: "newest",
    label: "Newest Listed",
  },
  {
    value: "price-low",
    label: "Price: Low to High",
  },
  {
    value: "price-high",
    label: "Price: High to Low",
  },
  {
    value: "area-high",
    label: "Area: High to Low",
  },
];

const getImage = (property) => {
  const fallback =
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=85";

  if (!property) return fallback;

  const media =
    property.property_images ||
    property.images ||
    property.media ||
    property.gallery ||
    [];

  if (Array.isArray(media)) {
    const imageMedia = media.find((item) => {
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

    if (imageMedia) {
      if (
        typeof imageMedia === "string" &&
        imageMedia.trim()
      ) {
        return imageMedia;
      }

      const imageUrl =
        imageMedia.image_url ||
        imageMedia.url ||
        imageMedia.secure_url ||
        imageMedia.image ||
        imageMedia.src;

      if (imageUrl) return imageUrl;
    }
  }

  const directImage =
    property.image ||
    property.image_url ||
    property.cover_image ||
    property.photo ||
    property.property_image;

  if (
    typeof directImage === "string" &&
    directImage.trim()
  ) {
    return directImage;
  }

  return fallback;
};

function getTitle(property) {
  return (
    property?.title ||
    property?.name ||
    property?.property_name ||
    "Premium Property"
  );
}

function getLocation(property) {
  return (
    property?.location ||
    property?.address ||
    property?.locality ||
    property?.city ||
    "Prime Location"
  );
}

function getCity(property) {
  return (
    property?.city ||
    property?.location ||
    property?.address ||
    ""
  );
}

function getType(property) {
  return (
    property?.property_type ||
    property?.propertyType ||
    property?.type ||
    "Apartment"
  );
}

function getPrice(property) {
  return (
    property?.price ||
    property?.price_range ||
    "Price on Request"
  );
}

function getNumericPrice(property) {
  const price = property?.price;

  if (typeof price === "number") {
    return price;
  }

  if (!price) return 0;

  const text = String(price)
    .toLowerCase()
    .replace(/,/g, "");

  const number = parseFloat(text);

  if (Number.isNaN(number)) {
    return 0;
  }

  if (text.includes("cr")) {
    return number * 10000000;
  }

  if (
    text.includes("lakh") ||
    text.includes("lac")
  ) {
    return number * 100000;
  }

  return number;
}

function getArea(property) {
  return (
    property?.area ||
    property?.carpet_area ||
    property?.built_up_area ||
    property?.size ||
    "—"
  );
}

function getBedrooms(property) {
  return (
    property?.bedrooms ||
    property?.bhk ||
    property?.bedroom_count ||
    ""
  );
}

function getBathrooms(property) {
  return (
    property?.bathrooms ||
    property?.bathroom_count ||
    ""
  );
}

function getPossession(property) {
  return (
    property?.possession ||
    property?.possession_date ||
    property?.availability ||
    "Ready to Move"
  );
}

function getPropertyId(property, index) {
  return (
    property?.id ||
    property?._id ||
    `property-${index}`
  );
}

function getPropertyText(property) {
  return [
    property?.title,
    property?.name,
    property?.description,
    property?.location,
    property?.address,
    property?.city,
    property?.locality,
    property?.property_type,
    property?.type,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function getBhkNumber(property) {
  const value = getBedrooms(property);

  if (typeof value === "number") {
    return value;
  }

  const match = String(value).match(/\d+/);

  return match ? Number(match[0]) : 0;
}

export default function Properties() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeMode, setActiveMode] = useState(
    searchParams.get("intent") || "buy"
  );

  const [search, setSearch] = useState(
    searchParams.get("location") || ""
  );

  const [selectedType, setSelectedType] =
    useState(
      searchParams.get("type") ||
        searchParams.get("propertyType") ||
        ""
    );

  const [selectedBhk, setSelectedBhk] =
    useState([]);

  const [budget, setBudget] = useState("");

 

  const [sortBy, setSortBy] =
    useState("newest");

  /*
   * This state now controls the normal
   * filter panel instead of a mobile sidebar.
   */
  const [showMobileFilters, setShowMobileFilters] =
    useState(false);

  const [savedProperties, setSavedProperties] =
    useState([]);

  const [showAdvanced, setShowAdvanced] =
    useState(false);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/properties`
        );

        if (!response.ok) {
          throw new Error(
            "Unable to load properties"
          );
        }

        const data = await response.json();

        const list = Array.isArray(data)
          ? data
          : data?.properties ||
            data?.data ||
            [];

        setProperties(list);
      } catch (err) {
        console.error(
          "Properties API error:",
          err
        );

        setError(
          "We couldn't load properties right now."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const filteredProperties = useMemo(() => {
    let result = [...properties];

    /*
     * SEARCH
     */
    if (search.trim()) {
      const query = search
        .trim()
        .toLowerCase();

      result = result.filter((property) =>
        getPropertyText(property).includes(query)
      );
    }

    /*
     * PROPERTY TYPE
     */
    if (selectedType) {
      const type =
        selectedType.toLowerCase();

      result = result.filter((property) => {
        const propertyType =
          getType(property).toLowerCase();

        return (
          propertyType.includes(type) ||
          type.includes(propertyType)
        );
      });
    }

    /*
     * BHK
     */
    if (selectedBhk.length > 0) {
      result = result.filter((property) => {
        const bhk =
          getBhkNumber(property);

        return selectedBhk.some((item) => {
          if (item === "5+ BHK") {
            return bhk >= 5;
          }

          const required =
            Number(
              item.match(/\d+/)?.[0]
            ) || 0;

          return bhk === required;
        });
      });
    }

    /*
     * BUDGET
     */
    if (budget) {
      result = result.filter((property) => {
        const price =
          getNumericPrice(property);

        if (!price) {
          return true;
        }

        if (budget === "under-50") {
          return price < 5000000;
        }

        if (budget === "50-100") {
          return (
            price >= 5000000 &&
            price <= 10000000
          );
        }

        if (budget === "100-150") {
          return (
            price > 10000000 &&
            price <= 15000000
          );
        }

        if (budget === "150-300") {
          return (
            price > 15000000 &&
            price <= 30000000
          );
        }

        if (budget === "300-plus") {
          return price > 30000000;
        }

        return true;
      });
    }

    /*
     * SORT
     */
    if (sortBy === "price-low") {
      result.sort(
        (a, b) =>
          getNumericPrice(a) -
          getNumericPrice(b)
      );
    }

    if (sortBy === "price-high") {
      result.sort(
        (a, b) =>
          getNumericPrice(b) -
          getNumericPrice(a)
      );
    }

    if (sortBy === "area-high") {
      result.sort((a, b) => {
        const areaA =
          parseFloat(
            String(
              getArea(a)
            ).replace(/,/g, "")
          ) || 0;

        const areaB =
          parseFloat(
            String(
              getArea(b)
            ).replace(/,/g, "")
          ) || 0;

        return areaB - areaA;
      });
    }

    return result;
  }, [
    properties,
    search,
    selectedType,
    selectedBhk,
    budget,
    sortBy,
  ]);

  const toggleBhk = (bhk) => {
    setSelectedBhk((current) =>
      current.includes(bhk)
        ? current.filter(
            (item) => item !== bhk
          )
        : [...current, bhk]
    );
  };

  

  const toggleSave = (id) => {
    setSavedProperties((current) =>
      current.includes(id)
        ? current.filter(
            (item) => item !== id
          )
        : [...current, id]
    );
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedType("");
    setSelectedBhk([]);
    setBudget("");
    
    setSortBy("newest");
  };

  const activeFilterCount =
    (selectedType ? 1 : 0) +
    selectedBhk.length +
    (budget ? 1 : 0);

  const handleSearch = () => {
    const params =
      new URLSearchParams();

    if (activeMode) {
      params.set(
        "intent",
        activeMode
      );
    }

    if (search.trim()) {
      params.set(
        "location",
        search.trim()
      );
    }

    if (selectedType) {
      params.set(
        "type",
        selectedType
      );
    }

    navigate(
      `/properties?${params.toString()}`
    );
  };

  return (
    <main className="properties-page">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <section className="properties-header">

        <div className="properties-container">

          <div className="properties-breadcrumb">

            <button
              type="button"
              onClick={() => navigate("/")}
            >
              Home
            </button>

            <ChevronRight size={13} />

            <span>Properties</span>

          </div>

          <div className="properties-heading-row">

            <div>

              <span className="properties-kicker">
                <span></span>
                XEVOPROP PROPERTY MARKETPLACE
              </span>

              <h1>
                Find a property that
                <br />
                fits your life.
              </h1>

              <p>
                Explore verified residential
                and commercial properties
                across India's leading markets.
              </p>

            </div>

            <div className="properties-header-stat">

              <Building2 size={18} />

              <div>

                <strong>
                  {properties.length ||
                    "45,000+"}
                </strong>

                <span>
                  Properties available
                </span>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          SEARCH BAR
      ===================================================== */}

      <section className="properties-search-section">

        <div className="properties-container">

          <div className="properties-search-card">

            <div className="properties-search-tabs">

              {[
                ["buy", "Buy"],
                ["rent", "Rent"],
                [
                  "commercial",
                  "Commercial",
                ],
              ].map(([value, label]) => (
                <button
                  type="button"
                  key={value}
                  className={
                    activeMode === value
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setActiveMode(value)
                  }
                >
                  {label}
                </button>
              ))}

            </div>

            <div className="properties-search-row">

              <div className="properties-search-input">

                <MapPin size={18} />

                <div>

                  <label>
                    LOCATION OR LOCALITY
                  </label>

                  <input
                    type="text"
                    value={search}
                    onChange={(event) =>
                      setSearch(
                        event.target.value
                      )
                    }
                    onKeyDown={(event) => {
                      if (
                        event.key ===
                        "Enter"
                      ) {
                        handleSearch();
                      }
                    }}
                    placeholder="Search city, locality or landmark"
                  />

                </div>

              </div>

              <div className="properties-search-select">

                <Building2 size={17} />

                <div>

                  <label>
                    PROPERTY TYPE
                  </label>

                  <select
                    value={selectedType}
                    onChange={(event) =>
                      setSelectedType(
                        event.target.value
                      )
                    }
                  >
                    <option value="">
                      Any property
                    </option>

                    {PROPERTY_TYPES.map(
                      (type) => (
                        <option
                          value={type}
                          key={type}
                        >
                          {type}
                        </option>
                      )
                    )}

                  </select>

                </div>

              </div>

              <div className="properties-search-select">

                <span className="wallet-icon">
                  ₹
                </span>

                <div>

                  <label>
                    BUDGET
                  </label>

                  <select
                    value={budget}
                    onChange={(event) =>
                      setBudget(
                        event.target.value
                      )
                    }
                  >
                    <option value="">
                      Any budget
                    </option>

                    <option value="under-50">
                      Under ₹50 Lakhs
                    </option>

                    <option value="50-100">
                      ₹50L – ₹1 Cr
                    </option>

                    <option value="100-150">
                      ₹1 Cr – ₹1.5 Cr
                    </option>

                    <option value="150-300">
                      ₹1.5 Cr – ₹3 Cr
                    </option>

                    <option value="300-plus">
                      ₹3 Cr+
                    </option>

                  </select>

                </div>

              </div>

              <button
                type="button"
                className="properties-search-button"
                onClick={handleSearch}
              >
                <Search size={16} />
                Search
              </button>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          FILTERS
          FILTER BUTTON + EXPANDABLE PANEL
      ===================================================== */}

      <section className="properties-filter-section">

        <div className="properties-container">

          <div className="properties-filter-toolbar">

            <div className="properties-filter-toolbar-left">

              <button
                type="button"
                className={`properties-filter-button ${
                  showMobileFilters
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setShowMobileFilters(
                    (current) =>
                      !current
                  )
                }
              >
                <SlidersHorizontal
                  size={17}
                />

                <span>Filters</span>

                {activeFilterCount >
                  0 && (
                  <span className="properties-filter-count">
                    {activeFilterCount}
                  </span>
                )}

                <ChevronDown
                  size={15}
                  className={
                    showMobileFilters
                      ? "filter-arrow rotated"
                      : "filter-arrow"
                  }
                />
              </button>

              {activeFilterCount > 0 && (
                <span className="filter-summary">
                  {activeFilterCount} filter
                  {activeFilterCount > 1
                    ? "s"
                    : ""}{" "}
                  selected
                </span>
              )}

            </div>

            {showMobileFilters && (
              <button
                type="button"
                className="properties-filter-reset"
                onClick={clearFilters}
              >
                <RotateCcw size={13} />
                Reset
              </button>
            )}

          </div>

          {showMobileFilters && (
            <div className="properties-filter-panel">

              <div className="properties-filter-panel-header">

                <div>
                  <span>
                    REFINE YOUR SEARCH
                  </span>

                  <h3>
                    Find exactly what you need
                  </h3>
                </div>

                <button
                  type="button"
                  className="properties-filter-close"
                  onClick={() =>
                    setShowMobileFilters(
                      false
                    )
                  }
                  aria-label="Close filters"
                >
                  <X size={18} />
                </button>

              </div>

              <div className="properties-filter-groups">

                {/* PROPERTY TYPE */}

                <div className="filter-group">

                  <div className="filter-group-title">

                    <span>
                      Property Type
                    </span>

                    <ChevronDown
                      size={14}
                    />

                  </div>

                  <div className="filter-options">

                    {PROPERTY_TYPES.map(
                      (type) => (
                        <label
                          className="filter-checkbox"
                          key={type}
                        >

                          <input
                            type="radio"
                            name="propertyType"
                            checked={
                              selectedType ===
                              type
                            }
                            onChange={() =>
                              setSelectedType(
                                type
                              )
                            }
                          />

                          <span className="custom-checkbox">
                            <Check size={10} />
                          </span>

                          <span>
                            {type}
                          </span>

                        </label>
                      )
                    )}

                  </div>

                </div>

                {/* BHK */}

                <div className="filter-group">

                  <div className="filter-group-title">

                    <span>BHK</span>

                    <ChevronDown
                      size={14}
                    />

                  </div>

                  <div className="bhk-filter-grid">

                    {BHK_OPTIONS.map(
                      (bhk) => (
                        <button
                          type="button"
                          key={bhk}
                          className={
                            selectedBhk.includes(
                              bhk
                            )
                              ? "active"
                              : ""
                          }
                          onClick={() =>
                            toggleBhk(bhk)
                          }
                        >
                          {bhk.replace(
                            " BHK",
                            ""
                          )}
                        </button>
                      )
                    )}

                  </div>

                </div>

                {/* BUDGET */}

                <div className="filter-group">

                  <div className="filter-group-title">

                    <span>Budget</span>

                    <ChevronDown
                      size={14}
                    />

                  </div>

                  <select
                    className="sidebar-select"
                    value={budget}
                    onChange={(event) =>
                      setBudget(
                        event.target.value
                      )
                    }
                  >
                    <option value="">
                      Any budget
                    </option>

                    <option value="under-50">
                      Under ₹50 Lakhs
                    </option>

                    <option value="50-100">
                      ₹50L – ₹1 Cr
                    </option>

                    <option value="100-150">
                      ₹1 Cr – ₹1.5 Cr
                    </option>

                    <option value="150-300">
                      ₹1.5 Cr – ₹3 Cr
                    </option>

                    <option value="300-plus">
                      ₹3 Cr+
                    </option>

                  </select>

                </div>

              

                

              </div>

              <div className="properties-filter-panel-footer">

                <div>
                  <strong>
                    {filteredProperties.length}
                  </strong>

                  <span>
                    properties found
                  </span>
                </div>

                <div className="properties-filter-actions">

                  <button
                    type="button"
                    className="properties-filter-clear-button"
                    onClick={clearFilters}
                  >
                    Clear Filters
                  </button>

                  <button
                    type="button"
                    className="properties-filter-apply-button"
                    onClick={() =>
                      setShowMobileFilters(
                        false
                      )
                    }
                  >
                    Show{" "}
                    {
                      filteredProperties.length
                    }{" "}
                    Properties
                  </button>

                </div>

              </div>

            </div>
          )}

        </div>

      </section>

      {/* =====================================================
          MAIN MARKETPLACE
      ===================================================== */}

      <section className="properties-marketplace">

        <div className="properties-container">

          <div className="properties-results">

            {/* =================================================
                RESULTS TOOLBAR
            ================================================= */}

            <div className="results-toolbar">

              <div>

                <span className="results-kicker">
                  PROPERTY LISTINGS
                </span>

                <h2>
                  {search
                    ? `Properties in ${search}`
                    : "Properties for you"}
                </h2>

                <p>
                  {filteredProperties.length}{" "}
                  properties matching your
                  requirements
                </p>

              </div>

              <div className="sort-wrapper">

                <ArrowDownUp size={14} />

                <select
                  value={sortBy}
                  onChange={(event) =>
                    setSortBy(
                      event.target.value
                    )
                  }
                >

                  {SORT_OPTIONS.map(
                    (option) => (
                      <option
                        value={option.value}
                        key={option.value}
                      >
                        {option.label}
                      </option>
                    )
                  )}

                </select>

              </div>

            </div>

            {/* =================================================
                ACTIVE FILTERS
            ================================================= */}

            {(search ||
              selectedType ||
              selectedBhk.length > 0 ||
              budget) && (

              <div className="active-filters">

                <span>
                  Active filters:
                </span>

                {search && (
                  <button
                    type="button"
                    onClick={() =>
                      setSearch("")
                    }
                  >
                    {search}
                    <X size={11} />
                  </button>
                )}

                {selectedType && (
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedType("")
                    }
                  >
                    {selectedType}
                    <X size={11} />
                  </button>
                )}

                {selectedBhk.map(
                  (bhk) => (
                    <button
                      type="button"
                      key={bhk}
                      onClick={() =>
                        toggleBhk(bhk)
                      }
                    >
                      {bhk}
                      <X size={11} />
                    </button>
                  )
                )}

                {budget && (
                  <button
                    type="button"
                    onClick={() =>
                      setBudget("")
                    }
                  >
                    Budget
                    <X size={11} />
                  </button>
                )}

                

                <button
                  type="button"
                  className="clear-all"
                  onClick={clearFilters}
                >
                  Clear all
                </button>

              </div>
            )}

            {/* =================================================
                PROPERTY GRID
            ================================================= */}

            {loading ? (
              <div className="properties-grid">

                {[1, 2, 3, 4, 5, 6].map(
                  (item) => (
                    <PropertySkeleton
                      key={item}
                    />
                  )
                )}

              </div>
            ) : error ? (

              <div className="properties-empty">

                <Building2 size={35} />

                <h3>
                  Unable to load properties
                </h3>

                <p>
                  Please try refreshing the
                  page or check your connection.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    window.location.reload()
                  }
                >
                  Try Again
                </button>

              </div>

            ) : filteredProperties.length ===
              0 ? (

              <div className="properties-empty">

                <Search size={35} />

                <h3>
                  No properties found
                </h3>

                <p>
                  Try changing your location,
                  property type, budget or
                  filters.
                </p>

                <button
                  type="button"
                  onClick={clearFilters}
                >
                  Clear Filters
                </button>

              </div>

            ) : (

              <div className="properties-grid">

                {filteredProperties.map(
                  (property, index) => {

                    const id =
                      getPropertyId(
                        property,
                        index
                      );

                    const saved =
                      savedProperties.includes(
                        id
                      );

                    return (
                      <PropertyCard
                        key={id}
                        property={property}
                        index={index}
                        saved={saved}
                        onSave={() =>
                          toggleSave(id)
                        }
                        onView={() =>
                          navigate(
                            `/properties/${id}`
                          )
                        }
                      />
                    );
                  }
                )}

              </div>
            )}

          </div>

        </div>

      </section>

    </main>
  );
}

/* =========================================================
   PROPERTY CARD
========================================================= */

function PropertyCard({
  property,
  index,
  saved,
  onSave,
  onView,
}) {
  const type = getType(property);

  const bedrooms =
    getBedrooms(property);

  const bathrooms =
    getBathrooms(property);

  return (
    <article className="market-property-card">

      <div className="market-property-image">

        <img
          src={getImage(property, index)}
          alt={getTitle(property)}
          onError={(event) => {
            event.currentTarget.src =
              FALLBACK_IMAGES[
                index %
                  FALLBACK_IMAGES.length
              ];
          }}
        />

        <div className="market-property-badges">

          <span className="verified-badge">
            <Check size={10} />
            RERA Approved
          </span>

          <span className="type-badge">
            {type}
          </span>

        </div>

        <button
          type="button"
          className={`market-save-button ${
            saved ? "saved" : ""
          }`}
          onClick={onSave}
          aria-label="Save property"
        >
          <Heart
            size={17}
            fill={
              saved
                ? "currentColor"
                : "none"
            }
          />
        </button>

        <div className="market-property-location">

          <MapPin size={11} />

          {getLocation(property)}

        </div>

      </div>

      <div className="market-property-body">

        <div className="market-property-price-row">

          <strong>
            {getPrice(property)}
          </strong>

          <span>
            {getPossession(property)}
          </span>

        </div>

        <h3>
          {getTitle(property)}
        </h3>

        <p className="market-property-city">
          {getCity(property)}
        </p>

        <div className="market-property-specs">

          {bedrooms && (
            <div>
              <BedDouble size={13} />

              <span>
                {bedrooms}
              </span>
            </div>
          )}

          {bathrooms && (
            <div>
              <Bath size={13} />

              <span>
                {bathrooms} Bath
              </span>
            </div>
          )}

          <div>

            <Maximize2 size={12} />

            <span>
              {getArea(property)}
            </span>

          </div>

        </div>

        <div className="market-property-footer">

          <button
            type="button"
            className="market-view-button"
            onClick={onView}
          >
            View Details
          </button>

          <button
            type="button"
            className="market-enquire-button"
            onClick={onView}
          >
            <Phone size={12} />
            Enquire
          </button>

        </div>

      </div>

    </article>
  );
}

/* =========================================================
   SKELETON
========================================================= */

function PropertySkeleton() {
  return (
    <div className="market-skeleton-card">

      <div className="market-skeleton-image"></div>

      <div className="market-skeleton-body">

        <div className="market-skeleton-line large"></div>

        <div className="market-skeleton-line"></div>

        <div className="market-skeleton-line short"></div>

        <div className="market-skeleton-specs"></div>

        <div className="market-skeleton-actions"></div>

      </div>

    </div>
  );
}