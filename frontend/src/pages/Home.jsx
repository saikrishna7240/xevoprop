import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";

import {
  ArrowRight,
  Building2,
  CalendarDays,
  ChevronRight,
  FileCheck2,
  Heart,
  Home as HomeIcon,
  Handshake,
  Landmark,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  WalletCards,
} from "lucide-react";

import "./Home.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://xevoprop.onrender.com/api";

const fallbackImages = [
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=85",
];

const categoryItems = [
  {
    title: "Apartments & Condos",
    icon: Building2,
    type: "Apartment",
  },
  {
    title: "Luxury Gated Villas",
    icon: HomeIcon,
    type: "Villa",
  },
  {
    title: "Builder Floors",
    icon: Landmark,
    type: "Builder Floor",
  },
  {
    title: "Commercial & Grade-A",
    icon: Building2,
    type: "Commercial",
  },
  {
    title: "Plots & Farmhouses",
    icon: MapPin,
    type: "Plot",
  },
  {
    title: "Penthouses & Duplexes",
    icon: HomeIcon,
    type: "Penthouse",
  },
];

const trustStats = [
  {
    icon: Building2,
    value: "Verified",
    label: "PROPERTY LISTINGS",
    tone: "blue",
  },
  {
    icon: ShieldCheck,
    value: "Verified",
    label: "PROPERTY DETAILS",
    tone: "green",
  },
  {
    icon: Handshake,
    value: "Direct",
    label: "OWNER & DEVELOPER CONNECT",
    tone: "orange",
  },
  {
    icon: Star,
    value: "Trusted",
    label: "REAL ESTATE PLATFORM",
    tone: "purple",
  },
];

const whyItems = [
  {
    icon: ShieldCheck,
    title: "Verified Property Information",
    description:
      "Browse property information submitted through the Xevoprop platform with clear details about location, type, pricing and specifications.",
    tone: "blue",
  },
  {
    icon: Handshake,
    title: "Direct Connect",
    description:
      "Connect directly with property owners and developers through the platform without unnecessary communication layers.",
    tone: "orange",
  },
  {
    icon: TrendingUp,
    title: "Better Property Discovery",
    description:
      "Search and compare properties using practical filters such as location, property type, bedrooms and budget.",
    tone: "green",
  },
  {
    icon: FileCheck2,
    title: "Structured Property Journey",
    description:
      "Move from property discovery to enquiries, visits and the next steps through one connected platform.",
    tone: "purple",
  },
];

const milestones = [
  {
    number: "1",
    title: "Search with Precision",
    description:
      "Search properties using location, property type, configuration and budget.",
  },
  {
    number: "2",
    title: "Explore the Property",
    description:
      "Review property images, specifications, location and available information.",
  },
  {
    number: "3",
    title: "Connect Directly",
    description:
      "Send an enquiry and connect with the relevant property owner or developer.",
  },
  {
    number: "4",
    title: "Take the Next Step",
    description:
      "Continue with property visits, discussions and the next stage of your property journey.",
  },
];

function getPropertyImage(property, index) {
  if (property?.image) return property.image;

  if (property?.image_url) return property.image_url;

  if (Array.isArray(property?.images) && property.images.length) {
    const firstImage = property.images[0];

    if (typeof firstImage === "string") {
      return firstImage;
    }

    return firstImage?.image_url || firstImage?.url;
  }

  if (
    Array.isArray(property?.property_images) &&
    property.property_images.length
  ) {
    const firstImage = property.property_images[0];

    if (typeof firstImage === "string") {
      return firstImage;
    }

    return firstImage?.image_url || firstImage?.url || firstImage?.media_url;
  }

  return fallbackImages[index % fallbackImages.length];
}

function getPropertyTitle(property) {
  return (
    property?.title ||
    property?.name ||
    property?.property_name ||
    "Property"
  );
}

function getPropertyLocation(property) {
  return (
    property?.location ||
    property?.address ||
    property?.city ||
    "Location not specified"
  );
}

function getPropertyPrice(property) {
  return property?.price || "Price on request";
}

function getPropertyType(property) {
  return (
    property?.property_type ||
    property?.type ||
    "Property"
  );
}

function getBedrooms(property) {
  return (
    property?.bedrooms ||
    property?.bhk ||
    property?.bedroom_count ||
    "—"
  );
}

function getArea(property) {
  return (
    property?.area ||
    property?.carpet_area ||
    property?.built_up_area ||
    "—"
  );
}

function getPossession(property) {
  return (
    property?.possession ||
    property?.possession_date ||
    "—"
  );
}

function getImageAlt(property) {
  return `${getPropertyTitle(property)} property`;
}

export default function Home() {
  const navigate = useNavigate();

  const [properties, setProperties] = useState([]);
  const [loadingProperties, setLoadingProperties] = useState(true);

  const [activeIntent, setActiveIntent] = useState("Buy");
  const [location, setLocation] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [budget, setBudget] = useState("");

  const [savedProperties, setSavedProperties] = useState([]);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoadingProperties(true);

        const response = await fetch(`${API_URL}/properties`);

        if (!response.ok) {
          throw new Error("Unable to fetch properties");
        }

        const data = await response.json();

        const propertyList = Array.isArray(data)
          ? data
          : data?.properties ||
            data?.data ||
            data?.results ||
            [];

        setProperties(
          Array.isArray(propertyList)
            ? propertyList
            : []
        );
      } catch (error) {
        console.error("Home properties error:", error);
        setProperties([]);
      } finally {
        setLoadingProperties(false);
      }
    };

    fetchProperties();
  }, []);

  const featuredProperties = useMemo(() => {
    return properties.slice(0, 3);
  }, [properties]);

  const handleSearch = () => {
    const params = new URLSearchParams();

    if (activeIntent) {
      params.set(
        "intent",
        activeIntent.toLowerCase()
      );
    }

    if (location.trim()) {
      params.set(
        "location",
        location.trim()
      );
    }

    if (propertyType) {
      params.set(
        "propertyType",
        propertyType
      );
    }

    if (budget) {
      params.set("budget", budget);
    }

    navigate(`/search?${params.toString()}`);
  };

  const handlePopularLocation = (city) => {
    setLocation(city);

    navigate(
      `/search?location=${encodeURIComponent(city)}`
    );
  };

  const toggleSave = (propertyId) => {
    setSavedProperties((current) =>
      current.includes(propertyId)
        ? current.filter(
            (id) => id !== propertyId
          )
        : [...current, propertyId]
    );
  };

  const handleCategoryClick = (type) => {
    navigate(
      `/properties?type=${encodeURIComponent(type)}`
    );
  };

  return (
    <main className="xevoprop-home">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="xp-hero">
        <div className="xp-container">

          <div className="xp-hero-badge">
            <span className="xp-badge-dot"></span>

            INDIA'S VERIFIED PROPTECH GATEWAY

            <span className="xp-badge-separator">
              •
            </span>

            REAL ESTATE MADE CLEAR
          </div>

          <h1 className="xp-hero-title">
            Find Your <span>Sanctuary.</span>
            <br />
            Built on{" "}
            <strong>Absolute Transparency.</strong>
          </h1>

          <p className="xp-hero-description">
            Discover residential and commercial properties
            across India with clear property information,
            direct connections and a structured property
            discovery experience.
          </p>

          {/* SEARCH */}

          <div className="xp-search-card">

            <div className="xp-search-tabs">

              {[
                "Buy",
                "Commercial",
                "Plots & Land",
                "New Projects",
              ].map((item) => (
                <button
                  key={item}
                  type="button"
                  className={
                    activeIntent === item
                      ? "xp-search-tab active"
                      : "xp-search-tab"
                  }
                  onClick={() =>
                    setActiveIntent(item)
                  }
                >
                  {item === "Buy" && (
                    <HomeIcon size={13} />
                  )}

                  {item === "Commercial" && (
                    <Building2 size={13} />
                  )}

                  {item === "Plots & Land" && (
                    <MapPin size={13} />
                  )}

                  {item === "New Projects" && (
                    <Landmark size={13} />
                  )}

                  <span>{item}</span>
                </button>
              ))}

            </div>

            <div className="xp-search-fields">

              <div className="xp-search-field xp-location-field">

                <MapPin size={17} />

                <div className="xp-field-content">

                  <label>
                    LOCALITY OR BUILDER
                  </label>

                  <input
                    type="text"
                    value={location}
                    onChange={(event) =>
                      setLocation(
                        event.target.value
                      )
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        handleSearch();
                      }
                    }}
                    placeholder="Enter the location..."
                  />

                </div>

              </div>

              <div className="xp-search-field">

                <Building2 size={17} />

                <div className="xp-field-content">

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
                    <option value="">
                      Flats & Apartments
                    </option>

                    <option value="Apartment">
                      Apartments
                    </option>

                    <option value="Villa">
                      Villas
                    </option>

                    <option value="Independent House">
                      Independent Houses
                    </option>

                    <option value="Commercial">
                      Commercial
                    </option>

                    <option value="Plot">
                      Plots
                    </option>
                  </select>

                </div>

                <ChevronRight
                  size={15}
                  className="xp-field-chevron"
                />

              </div>

              <div className="xp-search-field">

                <WalletCards size={17} />

                <div className="xp-field-content">

                  <label>BUDGET</label>

                  <select
                    value={budget}
                    onChange={(event) =>
                      setBudget(
                        event.target.value
                      )
                    }
                  >
                    <option value="">
                      Select Budget
                    </option>

                    <option value="0-5000000">
                      Under ₹50 Lakhs
                    </option>

                    <option value="5000000-10000000">
                      ₹50 Lakhs – ₹1 Crore
                    </option>

                    <option value="10000000-15000000">
                      ₹1 Crore – ₹1.5 Crore
                    </option>

                    <option value="15000000+">
                      ₹1.5 Crore+
                    </option>
                  </select>

                </div>

                <ChevronRight
                  size={15}
                  className="xp-field-chevron"
                />

              </div>

              <button
                type="button"
                className="xp-search-button"
                onClick={handleSearch}
              >
                <Search size={16} />
                Search
              </button>

            </div>

            <div className="xp-search-footer">

              <div className="xp-configurations">

                <span>
                  Configurations:
                </span>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/search?bedrooms=1"
                    )
                  }
                >
                  1 BHK
                </button>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/search?bedrooms=2"
                    )
                  }
                >
                  2 BHK
                </button>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/search?bedrooms=3"
                    )
                  }
                >
                  3 BHK
                </button>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/search?bedrooms=4"
                    )
                  }
                >
                  4+ BHK
                </button>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/search?propertyType=Villa"
                    )
                  }
                >
                  Villas
                </button>

              </div>

              <button
                type="button"
                className="xp-more-filters"
                onClick={() =>
                  navigate("/properties")
                }
              >
                <Sparkles size={13} />
                More Filters
              </button>

            </div>

            <div className="xp-trending-row">

              <span className="xp-trending-label">
                <TrendingUp size={12} />
                Trending:
              </span>

              <button
                type="button"
                onClick={() =>
                  handlePopularLocation(
                    "Whitefield"
                  )
                }
              >
                Whitefield
              </button>

              <span>•</span>

              <button
                type="button"
                onClick={() =>
                  handlePopularLocation(
                    "Worli"
                  )
                }
              >
                Worli
              </button>

              <span>•</span>

              <button
                type="button"
                onClick={() =>
                  handlePopularLocation(
                    "Gurugram"
                  )
                }
              >
                Gurugram
              </button>

              <span>•</span>

              <button
                type="button"
                onClick={() =>
                  handlePopularLocation(
                    "Gachibowli"
                  )
                }
              >
                Gachibowli Hyderabad
              </button>

            </div>

          </div>

        </div>
      </section>

      {/* =====================================================
          TRUST
      ===================================================== */}

      <section className="xp-trust-strip">

        <div className="xp-container xp-trust-grid">

          {trustStats.map((item) => {

            const Icon = item.icon;

            return (
              <div
                className="xp-trust-item"
                key={item.label}
              >

                <div
                  className={`xp-trust-icon ${item.tone}`}
                >
                  <Icon size={18} />
                </div>

                <div>

                  <strong>
                    {item.value}
                  </strong>

                  <span>
                    {item.label}
                  </span>

                </div>

              </div>
            );
          })}

        </div>

      </section>

      {/* =====================================================
          CURATED PROPERTIES
      ===================================================== */}

      <section className="xp-section xp-properties-section">

        <div className="xp-container">

          <div className="xp-section-heading-row">

            <div>

              <div className="xp-section-kicker">

                <span></span>

                CURATED PROPERTY LISTINGS

              </div>

              <h2>
                Explore Featured Properties
              </h2>

              <p>
                Browse available properties and
                review their details before taking
                the next step.
              </p>

            </div>

            <div className="xp-property-filters">

              <button
                type="button"
                className="active"
              >
                All
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/properties?ready_to_move=true"
                  )
                }
              >
                Ready to Move
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/properties?type=Penthouse"
                  )
                }
              >
                Penthouses
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/properties?type=Villa"
                  )
                }
              >
                Gated Villas
              </button>

            </div>

          </div>

          <div className="xp-property-grid">

            {loadingProperties ? (
              [1, 2, 3].map((item) => (
                <div
                  className="xp-property-card xp-skeleton-card"
                  key={item}
                >
                  <div className="xp-skeleton xp-skeleton-image"></div>

                  <div className="xp-skeleton xp-skeleton-line"></div>

                  <div className="xp-skeleton xp-skeleton-line short"></div>

                  <div className="xp-skeleton xp-skeleton-box"></div>
                </div>
              ))
            ) : featuredProperties.length > 0 ? (
              featuredProperties.map(
                (property, index) => {

                  const propertyId =
                    property?.id ||
                    property?._id;

                  if (!propertyId) {
                    return null;
                  }

                  const isSaved =
                    savedProperties.includes(
                      propertyId
                    );

                  return (
                    <article
                      className="xp-property-card"
                      key={propertyId}
                    >

                      <div className="xp-property-image">

                        <img
                          src={getPropertyImage(
                            property,
                            index
                          )}
                          alt={getImageAlt(
                            property
                          )}
                          onError={(event) => {
                            event.currentTarget.src =
                              fallbackImages[
                                index %
                                  fallbackImages.length
                              ];
                          }}
                        />

                        <div className="xp-property-top-tags">

                          {property?.status && (
                            <span className="xp-property-status">
                              {property.status ===
                              "approved"
                                ? "Approved"
                                : property.status}
                            </span>
                          )}

                          {property?.zero_brokerage && (
                            <span className="xp-property-brokerage">
                              0% BROKERAGE
                            </span>
                          )}

                        </div>

                        <button
                          type="button"
                          className={`xp-save-button ${
                            isSaved
                              ? "saved"
                              : ""
                          }`}
                          onClick={() =>
                            toggleSave(
                              propertyId
                            )
                          }
                          aria-label="Save property"
                        >
                          <Heart
                            size={17}
                            fill={
                              isSaved
                                ? "currentColor"
                                : "none"
                            }
                          />
                        </button>

                        <div className="xp-property-location">

                          <MapPin size={12} />

                          {getPropertyLocation(
                            property
                          )}

                        </div>

                      </div>

                      <div className="xp-property-content">

                        <div className="xp-property-price-row">

                          <strong>
                            {getPropertyPrice(
                              property
                            )}
                          </strong>

                          <span>
                            {getPropertyType(
                              property
                            )}
                          </span>

                        </div>

                        <h3>
                          {getPropertyTitle(
                            property
                          )}
                        </h3>

                        <div className="xp-property-specs">

                          <div>
                            <span>
                              CONFIG
                            </span>

                            <strong>
                              {getBedrooms(
                                property
                              )}
                            </strong>
                          </div>

                          <div>
                            <span>
                              AREA
                            </span>

                            <strong>
                              {getArea(
                                property
                              )}
                            </strong>
                          </div>

                          <div>
                            <span>
                              POSSESSION
                            </span>

                            <strong>
                              {getPossession(
                                property
                              )}
                            </strong>
                          </div>

                        </div>

                        <div className="xp-property-tags">

                          {property?.verified && (
                            <span>
                              Verified
                            </span>
                          )}

                          {property?.ready_to_move && (
                            <span>
                              Ready to Move
                            </span>
                          )}

                          {property?.zero_brokerage && (
                            <span>
                              Zero Brokerage
                            </span>
                          )}

                        </div>

                        <div className="xp-property-actions">

                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/properties/${propertyId}`
                              )
                            }
                          >
                            View Details
                          </button>

                          <button
                            type="button"
                            className="enquire-button"
                            onClick={() =>
                              navigate(
                                `/properties/${propertyId}`
                              )
                            }
                          >
                            <Phone size={13} />
                            Enquire Now
                          </button>

                        </div>

                      </div>

                    </article>
                  );
                }
              )
            ) : (
              <div className="xp-properties-empty">

                <Building2 size={32} />

                <h3>
                  Properties are being updated
                </h3>

                <p>
                  Explore the full marketplace
                  to discover available properties.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    navigate("/properties")
                  }
                >
                  Explore Properties
                  <ArrowRight size={15} />
                </button>

              </div>
            )}

          </div>

          <div className="xp-properties-bottom">

            <button
              type="button"
              onClick={() =>
                navigate("/properties")
              }
            >
              Explore all properties
              <ArrowRight size={16} />
            </button>

          </div>

        </div>

      </section>

      {/* =====================================================
          CATEGORIES
      ===================================================== */}

      <section className="xp-section xp-categories-section">

        <div className="xp-container">

          <div className="xp-section-heading-row category-heading">

            <div>

              <div className="xp-section-kicker">

                <span></span>

                BROWSE PROPERTY TYPES

              </div>

              <h2>
                Explore by Property Categories
              </h2>

              <p>
                Find properties based on the type
                that fits your requirements.
              </p>

            </div>

            <button
              type="button"
              className="xp-view-all"
              onClick={() =>
                navigate("/properties")
              }
            >
              View all categories
              <ArrowRight size={14} />
            </button>

          </div>

          <div className="xp-category-grid">

            {categoryItems.map((category) => {

              const Icon = category.icon;

              return (
                <button
                  type="button"
                  className="xp-category-card"
                  key={category.title}
                  onClick={() =>
                    handleCategoryClick(
                      category.type
                    )
                  }
                >

                  <span className="xp-category-icon">
                    <Icon size={18} />
                  </span>

                  <span className="xp-category-content">

                    <strong>
                      {category.title}
                    </strong>

                    <small>
                      Explore listings
                    </small>

                  </span>

                  <ChevronRight
                    size={17}
                    className="xp-category-arrow"
                  />

                </button>
              );
            })}

          </div>

        </div>

      </section>

      {/* =====================================================
          WHY XEVOPROP
      ===================================================== */}

      <section className="xp-section xp-why-section">

        <div className="xp-container">

          <div className="xp-centered-heading">

            <div className="xp-section-kicker centered">

              <span></span>

              THE XEVOPROP DIFFERENCE

              <span></span>

            </div>

            <h2>
              A Clearer Way to Navigate Real Estate
            </h2>

            <p>
              Xevoprop brings property discovery,
              direct connections and the next steps
              of your property journey into one place.
            </p>

          </div>

          <div className="xp-why-grid">

            {whyItems.map((item) => {

              const Icon = item.icon;

              return (
                <article
                  className="xp-why-card"
                  key={item.title}
                >

                  <div
                    className={`xp-why-icon ${item.tone}`}
                  >
                    <Icon size={18} />
                  </div>

                  <h3>
                    {item.title}
                  </h3>

                  <p>
                    {item.description}
                  </p>

                </article>
              );
            })}

          </div>

        </div>

      </section>

      {/* =====================================================
          MILESTONES
      ===================================================== */}

      <section className="xp-section xp-milestones-section">

        <div className="xp-container">

          <div className="xp-centered-heading">

            <div className="xp-section-kicker centered">

              <span></span>

              FRICTIONLESS PATH

              <span></span>

            </div>

            <h2>
              Your Property Journey in 4 Steps
            </h2>

          </div>

          <div className="xp-milestones-grid">

            {milestones.map((milestone) => (

              <article
                className="xp-milestone-card"
                key={milestone.number}
              >

                <div
                  className={`xp-milestone-number ${
                    milestone.number === "4"
                      ? "last"
                      : ""
                  }`}
                >
                  {milestone.number}
                </div>

                <h3>
                  {milestone.title}
                </h3>

                <p>
                  {milestone.description}
                </p>

              </article>

            ))}

          </div>

        </div>

      </section>

      {/* =====================================================
          LIST PROPERTY CTA
      ===================================================== */}

      <section className="xp-owner-section">

        <div className="xp-container">

          <div className="xp-owner-card">

            <div className="xp-owner-content">

              <div className="xp-owner-kicker">

                <Sparkles size={13} />

                FOR PROPERTY OWNERS

              </div>

              <h2>
                Own a property? List it on
                <br />
                Xevoprop.
              </h2>

              <p>
                List your property on Xevoprop,
                provide the required details and
                connect with interested buyers
                through the platform.
              </p>

            </div>

            <div className="xp-owner-actions">

              <button
                type="button"
                className="xp-owner-primary"
                onClick={() =>
                  navigate("/list-property")
                }
              >
                <PlusIcon />
                Post Property for Free
              </button>

              <button
                type="button"
                className="xp-owner-secondary"
                onClick={() =>
                  navigate("/list-property")
                }
              >
                <FileTextIcon />
                List Your Property
              </button>

            </div>

          </div>

        </div>

      </section>

      <Footer />

    </main>
  );
}

function PlusIcon() {
  return (
    <span className="xp-plus-icon">
      +
    </span>
  );
}

function FileTextIcon() {
  return (
    <span className="xp-plus-icon">
      ↗
    </span>
  );
}