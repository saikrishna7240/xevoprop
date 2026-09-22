import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  Check,
  ChevronRight,
  FileCheck2,
  Heart,
  Home as HomeIcon,
  Landmark,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  WalletCards,
  Scale,
  Handshake,
  FileText,
  CalendarDays,
  ClipboardCheck,
  KeyRound,
  BadgeCheck,
  Phone,
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
    count: "18,400+ properties",
    icon: Building2,
    type: "Apartment",
  },
  {
    title: "Luxury Gated Villas",
    count: "3,200+ properties",
    icon: HomeIcon,
    type: "Villa",
  },
  {
    title: "Builder Floors",
    count: "5,100+ properties",
    icon: Landmark,
    type: "Builder Floor",
  },
  {
    title: "Commercial & Grade-A",
    count: "2,800+ spaces",
    icon: Building2,
    type: "Commercial",
  },
  {
    title: "Plots & Farmhouses",
    count: "4,100+ plots",
    icon: MapPin,
    type: "Plot",
  },
  {
    title: "Penthouses & Duplexes",
    count: "920+ exclusive units",
    icon: HomeIcon,
    type: "Penthouse",
  },
];

const trustStats = [
  {
    icon: Building2,
    value: "45,000+",
    label: "VERIFIED PROPERTIES",
    tone: "blue",
  },
  {
    icon: ShieldCheck,
    value: "100%",
    label: "RERA CHECKED & LEGAL",
    tone: "green",
  },
  {
    icon: Handshake,
    value: "₹0 Brokerage",
    label: "ON DIRECT OWNER LISTINGS",
    tone: "orange",
  },
  {
    icon: Star,
    value: "4.9 / 5",
    label: "18,000+ REVIEWS",
    tone: "purple",
  },
];

const whyItems = [
  {
    icon: ShieldCheck,
    title: "Triple-Layer Verification",
    description:
      "Title deeds, RERA filings, and physical carpet boundaries cross-checked on-ground by licensed legal engineers before publication.",
    tone: "blue",
  },
  {
    icon: Handshake,
    title: "Zero Spam & Direct Connect",
    description:
      "Encrypted contact channels. Converse exclusively with verified sellers or developer representatives. No cold calls from unverified agents.",
    tone: "orange",
  },
  {
    icon: TrendingUp,
    title: "Smart Price Intelligence",
    description:
      "AI benchmark calculations using sub-registrar transaction archives and historical quarter-on-quarter market appreciation curves.",
    tone: "green",
  },
  {
    icon: FileCheck2,
    title: "End-to-End Paperwork",
    description:
      "From encumbrance certificate retrieval to stamp-duty calculation and turnkey doorstep home loan disbursement with top banks.",
    tone: "purple",
  },
];

const milestones = [
  {
    number: "1",
    title: "Search with Precision",
    description:
      "Filter by RERA status, carpet sq. ft, Vastu compliance, and proximity to major IT corridors and metro lines.",
  },
  {
    number: "2",
    title: "Schedule 3D or Site Visit",
    description:
      "Book private walkthroughs or inspect spatial layouts with guided digital tours verified by Xevoprop.",
  },
  {
    number: "3",
    title: "Instant Document Audit",
    description:
      "Access Khata extracts, sanctioned plans, and 30-year mother deed verification reports on the client dashboard.",
  },
  {
    number: "4",
    title: "Handover & Move In",
    description:
      "Seamless registry closure with transparent escrow protections and doorstep key handover.",
  },
];

const footerLinks = {
  popular: [
    "3 BHK in Whitefield",
    "Luxury Villas in ECR Chennai",
    "Sea-facing in Worli",
    "Flats near HITEC City Hyderabad",
    "Penthouses in Golf Course Extn",
  ],
  portals: [
    "Buyer Advisory Services",
    "Verified Rental Agreements",
    "Post Property for Free",
    "Corporate Leases & Coworking",
    "Builder Launchpad",
  ],
};

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

  return fallbackImages[index % fallbackImages.length];
}

function getPropertyTitle(property, index) {
  return (
    property?.title ||
    property?.name ||
    property?.property_name ||
    [
      "The Sovereign Sky Residences",
      "Elysium Gated Villas",
      "Maritime Crest Horizon",
    ][index] ||
    "Premium Property"
  );
}

function getPropertyLocation(property, index) {
  return (
    property?.location ||
    property?.address ||
    property?.city ||
    [
      "Hebbal Lake, North Bengaluru",
      "Narsingi, Financial District, Hyderabad",
      "Worli Bay, South Mumbai",
    ][index] ||
    "Prime Location"
  );
}

function getPropertyPrice(property, index) {
  if (property?.price) {
    return property.price;
  }

  return ["₹3.40 Cr – ₹5.80 Cr", "₹6.25 Cr", "₹8.90 Cr Onwards"][index];
}

function getPropertyType(property) {
  return property?.property_type || property?.type || "Residential";
}

function getBedrooms(property) {
  return (
    property?.bedrooms ||
    property?.bhk ||
    property?.bedroom_count ||
    "3 & 4 BHK"
  );
}

function getArea(property) {
  return (
    property?.area ||
    property?.carpet_area ||
    property?.built_up_area ||
    "2,450 sq.ft"
  );
}

function getPossession(property) {
  return property?.possession || property?.possession_date || "Dec 2025";
}

function getImageAlt(property, index) {
  return `${getPropertyTitle(property, index)} property`;
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
          : data?.properties || data?.data || [];

        setProperties(propertyList);
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
      params.set("intent", activeIntent.toLowerCase());
    }

    if (location.trim()) {
      params.set("location", location.trim());
    }

    if (propertyType) {
      params.set("propertyType", propertyType);
    }

    if (budget) {
      params.set("budget", budget);
    }

    navigate(`/search?${params.toString()}`);
  };

  const handlePopularLocation = (city) => {
    setLocation(city);

    navigate(`/search?location=${encodeURIComponent(city)}`);
  };

  const toggleSave = (propertyId) => {
    setSavedProperties((current) =>
      current.includes(propertyId)
        ? current.filter((id) => id !== propertyId)
        : [...current, propertyId]
    );
  };

  const handleCategoryClick = (type) => {
    navigate(`/properties?type=${encodeURIComponent(type)}`);
  };

  return (
    <main className="xevoprop-home">

      {/* =========================================================
          HERO
      ========================================================= */}

      <section className="xp-hero">
        <div className="xp-container">

          <div className="xp-hero-badge">
            <span className="xp-badge-dot"></span>
            INDIA'S VERIFIED PROPTECH GATEWAY
            <span className="xp-badge-separator">•</span>
            RERA CERTIFIED 2025
          </div>

          <h1 className="xp-hero-title">
            Find Your <span>Sanctuary.</span>
            <br />
            Built on{" "}
            <strong>Absolute Transparency.</strong>
          </h1>

          <p className="xp-hero-description">
            Discover 45,000+ verified residential & commercial properties
            across India
            <br className="xp-desktop-break" />
            with verified RERA documentation, zero spam, and direct
            owner/builder connect.
          </p>

          {/* SEARCH BOX */}

          <div className="xp-search-card">

            <div className="xp-search-tabs">

              {["Buy", "Rent", "Commercial", "Plots & Land", "New Projects"].map(
                (item) => (
                  <button
                    key={item}
                    type="button"
                    className={
                      activeIntent === item
                        ? "xp-search-tab active"
                        : "xp-search-tab"
                    }
                    onClick={() => setActiveIntent(item)}
                  >
                    {item === "Buy" && <HomeIcon size={13} />}
                    {item === "Rent" && <KeyRound size={13} />}
                    {item === "Commercial" && <Building2 size={13} />}
                    {item === "Plots & Land" && <MapPin size={13} />}
                    {item === "New Projects" && <Landmark size={13} />}
                    <span>{item}</span>
                  </button>
                )
              )}

            </div>

            <div className="xp-search-fields">

              <div className="xp-search-field xp-location-field">
                <MapPin size={17} />

                <div className="xp-field-content">
                  <label>LOCALITY OR BUILDER</label>

                  <input
                    type="text"
                    value={location}
                    onChange={(event) =>
                      setLocation(event.target.value)
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        handleSearch();
                      }
                    }}
                    placeholder="Indiranagar, Whitefield, Bandra West..."
                  />
                </div>
              </div>

              <div className="xp-search-field">
                <Building2 size={17} />

                <div className="xp-field-content">
                  <label>PROPERTY TYPE</label>

                  <select
                    value={propertyType}
                    onChange={(event) =>
                      setPropertyType(event.target.value)
                    }
                  >
                    <option value="">Flats & Apartments</option>
                    <option value="Apartment">Apartments</option>
                    <option value="Villa">Villas</option>
                    <option value="Independent House">
                      Independent Houses
                    </option>
                    <option value="Commercial">Commercial</option>
                    <option value="Plot">Plots</option>
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
                      setBudget(event.target.value)
                    }
                  >
                    <option value="">₹50 Lakhs – ₹1.5 Crore</option>
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
                <span>Configurations:</span>

                <button type="button">1 BHK</button>
                <button type="button">2 BHK</button>
                <button type="button">3 BHK</button>
                <button type="button">4+ BHK</button>
                <button type="button">Villas</button>
              </div>

              <button
                type="button"
                className="xp-more-filters"
                onClick={() => navigate("/properties")}
              >
                <Sparkles size={13} />
                More Filters (Floor, Facing, Vastu)
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
                  handlePopularLocation("Hyderabad")
                }
              >
                RERA Approved in Whitefield
              </button>

              <span>•</span>

              <button
                type="button"
                onClick={() =>
                  handlePopularLocation("Bengaluru")
                }
              >
                Luxury Sea View in Worli
              </button>

              <span>•</span>

              <button
                type="button"
                onClick={() =>
                  handlePopularLocation("Hyderabad")
                }
              >
                Golf Course Road Gurugram
              </button>

              <span>•</span>

              <button
                type="button"
                onClick={() =>
                  handlePopularLocation("Hyderabad")
                }
              >
                Gachibowli Hyderabad
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================
          TRUST STATS
      ========================================================= */}

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
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </div>
              </div>
            );
          })}

        </div>
      </section>

      {/* =========================================================
          CURATED PROPERTIES
      ========================================================= */}

      <section className="xp-section xp-properties-section">
        <div className="xp-container">

          <div className="xp-section-heading-row">

            <div>
              <div className="xp-section-kicker">
                <span></span>
                CURATED HANDPICKED PORTFOLIO
              </div>

              <h2>
                Curated Architectural Residences
              </h2>

              <p>
                Independently audited title records, verified builder
                credentials, and guaranteed floor plans.
              </p>
            </div>

            <div className="xp-property-filters">
              <button className="active">All</button>
              <button>Ready to Move</button>
              <button>Penthouse Collection</button>
              <button>Gated Villas</button>
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
              featuredProperties.map((property, index) => {
                const propertyId =
                  property?.id ||
                  property?._id ||
                  index;

                const isSaved =
                  savedProperties.includes(propertyId);

                return (
                  <article
                    className="xp-property-card"
                    key={propertyId}
                  >

                    <div className="xp-property-image">

                      <img
                        src={getPropertyImage(property, index)}
                        alt={getImageAlt(property, index)}
                        onError={(event) => {
                          event.currentTarget.src =
                            fallbackImages[index % 3];
                        }}
                      />

                      <div className="xp-property-top-tags">
                        <span className="xp-property-status">
                          {index === 1
                            ? "Ready to Move"
                            : "RERA Approved"}
                        </span>

                        <span className="xp-property-brokerage">
                          {index === 0
                            ? "0% BROKERAGE"
                            : index === 1
                            ? "Verified Title Deed"
                            : "New Launch"}
                        </span>
                      </div>

                      <button
                        type="button"
                        className={`xp-save-button ${
                          isSaved ? "saved" : ""
                        }`}
                        onClick={() =>
                          toggleSave(propertyId)
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
                          property,
                          index
                        )}
                      </div>

                    </div>

                    <div className="xp-property-content">

                      <div className="xp-property-price-row">
                        <strong>
                          {getPropertyPrice(
                            property,
                            index
                          )}
                        </strong>

                        <span>
                          {index === 0
                            ? "EMI starts ₹2.41L/mo"
                            : index === 1
                            ? "100% Vastu Compliant"
                            : "Sea-Facing Decks"}
                        </span>
                      </div>

                      <h3>
                        {getPropertyTitle(
                          property,
                          index
                        )}
                      </h3>

                      <div className="xp-property-specs">

                        <div>
                          <span>CONFIG</span>
                          <strong>
                            {getBedrooms(property)}
                          </strong>
                        </div>

                        <div>
                          <span>CARPET AREA</span>
                          <strong>
                            {getArea(property)}
                          </strong>
                        </div>

                        <div>
                          <span>POSSESSION</span>
                          <strong>
                            {getPossession(property)}
                          </strong>
                        </div>

                      </div>

                      <div className="xp-property-tags">
                        <span>Infinity Pool</span>
                        <span>Lake View Deck</span>
                        <span>2 Covered Parking</span>
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
                          className={
                            index === 1
                              ? "visit-button"
                              : "enquire-button"
                          }
                          onClick={() =>
                            navigate(
                              `/properties/${propertyId}`
                            )
                          }
                        >
                          {index === 1 ? (
                            <>
                              <CalendarDays size={13} />
                              Schedule Visit
                            </>
                          ) : (
                            <>
                              <Phone size={13} />
                              Enquire Now
                            </>
                          )}
                        </button>

                      </div>

                    </div>
                  </article>
                );
              })
            ) : (
              <div className="xp-properties-empty">
                <Building2 size={32} />
                <h3>Properties are being updated</h3>
                <p>
                  Explore the full marketplace to discover
                  available properties.
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

      {/* =========================================================
          CATEGORIES
      ========================================================= */}

      <section className="xp-section xp-categories-section">
        <div className="xp-container">

          <div className="xp-section-heading-row category-heading">

            <div>
              <div className="xp-section-kicker">
                <span></span>
                BROWSE ARCHETYPES
              </div>

              <h2>
                Explore by Property Categories
              </h2>

              <p>
                Segmented by lifestyle requisites and
                institutional zoning parameters.
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
                    <strong>{category.title}</strong>
                    <small>{category.count}</small>
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

      {/* =========================================================
          WHY XEVOPROP
      ========================================================= */}

      <section className="xp-section xp-why-section">
        <div className="xp-container">

          <div className="xp-centered-heading">

            <div className="xp-section-kicker centered">
              <span></span>
              INSTITUTIONAL REALTY
              <span></span>
            </div>

            <h2>
              Why Thousands Trust Xevoprop Over
              <br />
              Traditional Portals
            </h2>

            <p>
              Engineered to eradicate ghost listings,
              unverified broker rings, and opaque pricing
              from modern Indian realty.
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

                  <h3>{item.title}</h3>

                  <p>{item.description}</p>

                </article>
              );
            })}

          </div>

        </div>
      </section>

      {/* =========================================================
          MILESTONES
      ========================================================= */}

      <section className="xp-section xp-milestones-section">
        <div className="xp-container">

          <div className="xp-centered-heading">

            <div className="xp-section-kicker centered">
              <span></span>
              FRICTIONLESS PATH
              <span></span>
            </div>

            <h2>
              Your Home Purchase in 4 Structured
              <br />
              Milestones
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

                <h3>{milestone.title}</h3>

                <p>{milestone.description}</p>

              </article>
            ))}

          </div>

        </div>
      </section>

      {/* =========================================================
          LIST PROPERTY CTA
      ========================================================= */}

      <section className="xp-owner-section">
        <div className="xp-container">

          <div className="xp-owner-card">

            <div className="xp-owner-content">

              <div className="xp-owner-kicker">
                <Sparkles size={13} />
                Zero Listing Brokerage For Property Owners
              </div>

              <h2>
                Own a property? List it on
                <br />
                Xevoprop in under 3 minutes.
              </h2>

              <p>
                Connect with 1.2 Million genuine buyers &
                corporate tenants every month. Zero listing
                fee, full privacy control, and dedicated
                relationship manager.
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
                <FileText size={14} />
                Request Valuation Report
              </button>

            </div>

          </div>

        </div>
      </section>

      {/* =========================================================
          FOOTER
      ========================================================= */}
<Footer/>
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