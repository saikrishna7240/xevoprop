import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  ArrowDownToLine,
  Bath,
  BedDouble,
  Building2,
  CheckCircle2,
  Clock3,
  Eye,
  Image as ImageIcon,
  MapPin,
  Maximize,
  Pencil,
  Plus,
  Search,
  Trash2,
  Video,
  XCircle,
} from "lucide-react";

import "./MyProperties.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://xevoprop.onrender.com/api";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=85";

function MyProperties() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    loadListings();
  }, []);

  /* =========================================================
     LOAD MY PROPERTIES
  ========================================================= */

  const loadListings = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login as a Seller or Developer.");
        return;
      }

      const response = await fetch(
        `${API_URL}/properties/my`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const text = await response.text();

      let data;

      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(
          "Server returned an invalid response."
        );
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            `Failed to load properties (${response.status})`
        );
      }

      setListings(
        Array.isArray(data.properties)
          ? data.properties
          : []
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

  /* =========================================================
     DELETE PROPERTY
  ========================================================= */

  const deleteListing = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this property?"
    );

    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Please login again.");
      }

      const response = await fetch(
        `${API_URL}/properties/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to delete property"
        );
      }

      setListings((previous) =>
        previous.filter(
          (listing) => listing.id !== id
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

  /* =========================================================
     PRICE FORMAT
  ========================================================= */

  const formatPrice = (listing) => {
    if (listing.price) {
      return listing.price;
    }

    const price =
      Number(listing.price_value) || 0;

    if (!price) {
      return "Price on request";
    }

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

  /* =========================================================
     STATUS
  ========================================================= */

  const getStatus = (listing) => {
    const status = String(
      listing.status || ""
    )
      .trim()
      .toLowerCase();

    if (
      status === "approved" ||
      status === "published"
    ) {
      return "approved";
    }

    if (status === "rejected") {
      return "rejected";
    }

    return "pending";
  };

  const getStatusLabel = (listing) => {
    const status = getStatus(listing);

    if (status === "approved") {
      return "Approved";
    }

    if (status === "rejected") {
      return "Rejected";
    }

    return "Pending Review";
  };

  /* =========================================================
     MEDIA
  ========================================================= */

  const getMedia = (listing) => {
    const media =
      listing.property_images ||
      listing.images ||
      listing.media ||
      listing.gallery ||
      [];

    if (
      Array.isArray(media) &&
      media.length
    ) {
      return media;
    }

    if (listing.image) {
      return [
        {
          image_url: listing.image,
          media_type: "image",
        },
      ];
    }

    return [];
  };

  const getCoverImage = (listing) => {
    const media = getMedia(listing);

    const image = media.find((item) => {
      if (!item) return false;

      const type =
        item.media_type ||
        item.type ||
        item.resource_type;

      return type !== "video";
    });

    if (!image) {
      return FALLBACK_IMAGE;
    }

    if (typeof image === "string") {
      return image;
    }

    return (
      image.image_url ||
      image.url ||
      image.secure_url ||
      image.image ||
      image.src ||
      FALLBACK_IMAGE
    );
  };

  const getMediaCount = (listing) => {
    return getMedia(listing).length;
  };

  const hasVideo = (listing) => {
    return getMedia(listing).some((item) => {
      if (
        !item ||
        typeof item === "string"
      ) {
        return false;
      }

      const type =
        item.media_type ||
        item.type ||
        item.resource_type;

      return type === "video";
    });
  };

  /* =========================================================
     FILTER
  ========================================================= */

  const filteredListings = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    return listings.filter((listing) => {
      const status = getStatus(listing);

      const matchesStatus =
        statusFilter === "all" ||
        status === statusFilter;

      const searchableText = [
        listing.title,
        listing.type,
        listing.location,
        listing.city,
        listing.description,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !query ||
        searchableText.includes(query);

      return (
        matchesStatus &&
        matchesSearch
      );
    });
  }, [
    listings,
    search,
    statusFilter,
  ]);

  /* =========================================================
     STATISTICS
  ========================================================= */

  const totalListings =
    listings.length;

  const approvedListings =
    listings.filter(
      (item) =>
        getStatus(item) ===
        "approved"
    ).length;

  const pendingListings =
    listings.filter(
      (item) =>
        getStatus(item) ===
        "pending"
    ).length;

  const rejectedListings =
    listings.filter(
      (item) =>
        getStatus(item) ===
        "rejected"
    ).length;

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="my-properties-page">
        <div className="my-properties-loading">
          <div className="loading-spinner" />

          <h2>
            Loading your properties...
          </h2>

          <p>
            Fetching your Xevoprop listings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-properties-page">

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      

      <main className="my-properties-container">

        {/* ===================================================
            HERO
        =================================================== */}

        <section className="properties-hero">

          <div className="hero-content">

            <div className="breadcrumb">
              <span>
                SELLER SPACE
              </span>

              <b>/</b>

              <span>
                INVENTORY & PORTFOLIO
              </span>

              <b>/</b>

              <strong>
                MY PROPERTIES
              </strong>
            </div>

            <h1>
              My Properties<span>.</span>
            </h1>

            <p>
              Manage the properties you've listed
              on Xevoprop, review compliance and
              verification status, and monitor
              prospective buyer interest.
            </p>

          </div>

          <div className="hero-actions">

            

            <Link
              to="/list-property"
              className="hero-list-btn"
            >
              <Plus size={16} />
              List Property
            </Link>

          </div>

        </section>

        {/* ERROR */}

        {error && (
          <div className="my-properties-error">
            {error}
          </div>
        )}

        {/* ===================================================
            STATISTICS
        =================================================== */}

        <section className="properties-stats">

          <div className="stat-card">

            <div className="stat-content">
              <span>
                TOTAL LISTINGS
              </span>

              <strong>
                {String(
                  totalListings
                ).padStart(2, "0")}
              </strong>

              <small>
                • Active portfolio inventory
              </small>
            </div>

            <div className="stat-icon">
              <Building2 size={20} />
            </div>

          </div>

          <div className="stat-card approved">

            <div className="stat-content">
              <span>
                APPROVED & LIVE
              </span>

              <strong>
                {String(
                  approvedListings
                ).padStart(2, "0")}
              </strong>

              <small>
                • Publicly discoverable on
                marketplace
              </small>
            </div>

            <div className="stat-icon">
              <CheckCircle2 size={20} />
            </div>

          </div>

          <div className="stat-card pending">

            <div className="stat-content">
              <span>
                PENDING REVIEW
              </span>

              <strong>
                {String(
                  pendingListings
                ).padStart(2, "0")}
              </strong>

              <small>
                • Awaiting title deeds
                verification
              </small>
            </div>

            <div className="stat-icon">
              <Clock3 size={20} />
            </div>

          </div>

          <div className="stat-card rejected">

            <div className="stat-content">
              <span>
                ACTION REQUIRED
              </span>

              <strong>
                {String(
                  rejectedListings
                ).padStart(2, "0")}
              </strong>

              <small>
                • RERA or Khata
                clarification required
              </small>
            </div>

            <div className="stat-icon">
              <XCircle size={20} />
            </div>

          </div>

        </section>

        {/* ===================================================
            EMPTY STATE
        =================================================== */}

        {listings.length === 0 ? (

          <section className="properties-empty">

            <div className="empty-icon">
              <Building2 size={34} />
            </div>

            <h2>
              No properties listed yet
            </h2>

            <p>
              Start by adding your first property
              to Xevoprop.
            </p>

            <Link to="/list-property">
              <Plus size={17} />
              List Your First Property
            </Link>

          </section>

        ) : (

          <>

            {/* =================================================
                TOOLBAR
            ================================================= */}

            <section className="properties-toolbar">

              <div className="property-search">

                <Search size={18} />

                <input
                  type="text"
                  placeholder="Search your properties by title, micro-market, city..."
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                />

              </div>

              <div className="property-filters">

                <button
                  type="button"
                  className={
                    statusFilter === "all"
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setStatusFilter(
                      "all"
                    )
                  }
                >
                  All
                  <span>
                    ({totalListings})
                  </span>
                </button>

                <button
                  type="button"
                  className={
                    statusFilter ===
                    "approved"
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setStatusFilter(
                      "approved"
                    )
                  }
                >
                  Approved
                  <span>
                    ({approvedListings})
                  </span>
                </button>

                <button
                  type="button"
                  className={
                    statusFilter ===
                    "pending"
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setStatusFilter(
                      "pending"
                    )
                  }
                >
                  Pending Review
                  <span>
                    ({pendingListings})
                  </span>
                </button>

                <button
                  type="button"
                  className={
                    statusFilter ===
                    "rejected"
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setStatusFilter(
                      "rejected"
                    )
                  }
                >
                  Rejected
                  <span>
                    ({rejectedListings})
                  </span>
                </button>

              </div>

              <select className="sort-select">
                <option>
                  Sort by: Recent Activity
                </option>

                <option>
                  Sort by: Price
                </option>

                <option>
                  Sort by: Property Type
                </option>
              </select>

              <button
                type="button"
                className="download-btn"
                title="Download"
              >
                <ArrowDownToLine size={17} />
              </button>

            </section>

            {/* =================================================
                FILTER RESULT
            ================================================= */}

            {filteredListings.length === 0 ? (

              <section className="no-filter-results">

                <Search size={32} />

                <h3>
                  No matching properties
                </h3>

                <p>
                  Try changing your search
                  or status filter.
                </p>

              </section>

            ) : (

              <section className="my-properties-grid">

                {filteredListings.map(
                  (listing) => {

                    const status =
                      getStatus(
                        listing
                      );

                    const image =
                      getCoverImage(
                        listing
                      );

                    const mediaCount =
                      getMediaCount(
                        listing
                      );

                    const videoAvailable =
                      hasVideo(
                        listing
                      );

                    return (
                      <article
                        className={`property-card ${status}`}
                        key={listing.id}
                      >

                        {/* IMAGE */}

                        <div className="property-card-image">

                          <img
                            src={image}
                            alt={
                              listing.title ||
                              "Property"
                            }
                            onError={(e) => {
                              e.currentTarget.src =
                                FALLBACK_IMAGE;
                            }}
                          />

                          <span
                            className={`property-status ${status}`}
                          >

                            {status ===
                              "approved" && (
                              <CheckCircle2
                                size={14}
                              />
                            )}

                            {status ===
                              "pending" && (
                              <Clock3
                                size={14}
                              />
                            )}

                            {status ===
                              "rejected" && (
                              <XCircle
                                size={14}
                              />
                            )}

                            {getStatusLabel(
                              listing
                            )}

                          </span>

                          <div className="image-meta">

                            {mediaCount > 0 && (
                              <span>
                                <ImageIcon
                                  size={14}
                                />
                                {mediaCount} Photos
                              </span>
                            )}

                            {videoAvailable && (
                              <span>
                                <Video
                                  size={14}
                                />
                                Video
                              </span>
                            )}

                          </div>

                        </div>

                        {/* CONTENT */}

                        <div className="property-card-content">

                          <div className="property-card-type-row">

                            <span>
                              {(
                                listing.type ||
                                "PROPERTY"
                              ).toUpperCase()}
                            </span>

                            <b
                              className={`verification-badge ${status}`}
                            >
                              {status ===
                              "approved"
                                ? "K-RERA Verified"
                                : status ===
                                  "pending"
                                ? "Audit In-Progress"
                                : "Action Needed"}
                            </b>

                          </div>

                          <h2>
                            {listing.title ||
                              "Untitled Property"}
                          </h2>

                          <div className="property-location">

                            <MapPin size={15} />

                            <span>
                              {listing.location ||
                                listing.city ||
                                "India"}
                            </span>

                          </div>

                          <div className="property-price-row">

                            <strong>
                              {formatPrice(
                                listing
                              )}
                            </strong>

                            {listing.area &&
                              listing.price_value && (
                              <small>
                                ₹
                                {Math.round(
                                  Number(
                                    listing.price_value
                                  ) /
                                    Number(
                                      listing.area
                                    )
                                ).toLocaleString(
                                  "en-IN"
                                )}
                                {" / sq.ft"}
                              </small>
                            )}

                          </div>

                          <div className="property-details">

                            <div>
                              <BedDouble size={16} />

                              <span>
                                {listing.bedrooms ||
                                  0}{" "}
                                Beds
                              </span>
                            </div>

                            <div>
                              <Bath size={16} />

                              <span>
                                {listing.bathrooms ||
                                  0}{" "}
                                Baths
                              </span>
                            </div>

                            <div>
                              <Maximize size={16} />

                              <span>
                                {listing.area ||
                                  0}{" "}
                                sq.ft
                              </span>
                            </div>

                          </div>

                          <div
                            className={`property-compliance ${status}`}
                          >

                            {status ===
                            "approved" ? (
                              <>
                                <CheckCircle2
                                  size={15}
                                />

                                <span>
                                  RERA Approved /
                                  Title Verification
                                </span>

                                <b>
                                  LIVE ONLINE
                                </b>
                              </>
                            ) : status ===
                              "pending" ? (
                              <>
                                <Clock3
                                  size={15}
                                />

                                <span>
                                  Submitting for
                                  legal validation
                                </span>

                                <b>
                                  REVIEW
                                </b>
                              </>
                            ) : (
                              <>
                                <XCircle
                                  size={15}
                                />

                                <span>
                                  Admin feedback
                                  requires
                                  clarification
                                </span>

                                <b>
                                  ACTION
                                </b>
                              </>
                            )}

                          </div>

                          <div className="property-card-actions">

                            <Link
                              to={`/properties/${listing.id}`}
                              className="property-view-btn"
                            >
                              <Eye size={15} />
                              View
                            </Link>

                            <Link
                              to={`/edit-property/${listing.id}`}
                              className={
                                status ===
                                "rejected"
                                  ? "property-edit-btn danger"
                                  : "property-edit-btn"
                              }
                            >
                              <Pencil size={15} />

                              {status ===
                              "rejected"
                                ? "Edit Property (Fix Issues)"
                                : "Edit"}
                            </Link>

                            <button
                              type="button"
                              className="property-delete-btn"
                              onClick={() =>
                                deleteListing(
                                  listing.id
                                )
                              }
                              aria-label="Delete property"
                            >
                              <Trash2 size={16} />
                            </button>

                          </div>

                        </div>

                      </article>
                    );
                  }
                )}

              </section>
            )}

            {/* =================================================
                TRUST BANNER
            ================================================= */}

            <section className="verification-banner">

              <div className="verification-banner-icon">
                ✓
              </div>

              <div className="verification-banner-content">

                <strong>
                  Xevoprop Title Verification
                  Protocol
                </strong>

                <p>
                  Every property listed is audited
                  against 30-year encumbrance
                  records, municipal Khata files,
                  and state RERA registries prior
                  to buyer outreach.
                </p>

              </div>

              <div className="verification-banner-tags">

                <span>
                  ✓ MLS Real-Time Sync
                </span>

                <span>
                  ✓ 24/7 Seller Concierge
                </span>

              </div>

            </section>

          </>
        )}

        {/* ===================================================
            FOOTER
        =================================================== */}

        <footer className="properties-footer">

          <div className="footer-about">

            <div className="footer-logo">

              <span className="brand-logo">
                X
              </span>

              <strong>
                XEVOPROP
              </strong>

            </div>

            <p>
              India's high-integrity proptech
              platform for legally verified luxury
              residences, commercial portfolios,
              and vetted new property developments.
            </p>

            <span className="footer-trust">
              ◉ 100% Title-Verified Listings &
              RERA Audited
            </span>

          </div>

          <div className="footer-column">

            <strong>
              POPULAR LOCALITIES
            </strong>

            <span>
              Whitefield, Bengaluru
            </span>

            <span>
              Worli, Mumbai
            </span>

            <span>
              Indiranagar, Bengaluru
            </span>

            <span>
              Golf Course Rd, Gurugram
            </span>

            <span>
              BKC, Mumbai
            </span>

          </div>

          <div className="footer-column">

            <strong>
              PROPERTY TYPES
            </strong>

            <span>
              Luxury Gated Penthouses
            </span>

            <span>
              RERA Verified Apartments
            </span>

            <span>
              Grade-A Commercial Suites
            </span>

            <span>
              Exclusive Villa Communities
            </span>

            <span>
              Pre-Launch Expressions
            </span>

          </div>

          <div className="footer-column">

            <strong>
              COMPANY & TRUST
            </strong>

            <span>
              Verified Protocol
            </span>

            <span>
              RERA Compliance Cell
            </span>

            <span>
              Legal Title Due Diligence
            </span>

            <span>
              About Xevoprop
            </span>

            <span>
              Institutional Advisory
            </span>

          </div>

          <div className="footer-bottom">

            <span>
              © 2025 Xevoprop Technologies Pvt. Ltd.
              All rights reserved. RERA Certified.
            </span>

            <div>
              <span>
                Terms of Service
              </span>

              <span>
                Privacy Policy
              </span>

              <span>
                RERA Disclosures
              </span>
            </div>

          </div>

        </footer>

      </main>
    </div>
  );
}

export default MyProperties;