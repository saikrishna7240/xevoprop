import { useEffect, useMemo, useState } from "react";
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
  Search,
  CheckCircle2,
  Clock3,
  XCircle,
  Video,
  Image as ImageIcon,
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

  /* =========================
     LOAD MY PROPERTIES
  ========================= */

  const loadListings = async () => {
  try {
    setLoading(true);
    setError("");

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please login as a Seller or Developer.");
      return;
    }

    console.log("MY PROPERTIES: requesting...");

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

    console.log(
      "MY PROPERTIES STATUS:",
      response.status
    );

    const text = await response.text();

    console.log(
      "MY PROPERTIES RESPONSE:",
      text
    );

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
    console.log(
      "MY PROPERTIES: loading finished"
    );

    setLoading(false);
  }
};

  /* =========================
     DELETE PROPERTY
  ========================= */

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
          data.message || "Failed to delete property"
        );
      }

      setListings((previous) =>
        previous.filter(
          (listing) => listing.id !== id
        )
      );
    } catch (error) {
      console.error("Delete property error:", error);

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

    return `₹${price.toLocaleString("en-IN")}`;
  };

  /* =========================
     STATUS HELPERS
  ========================= */

  const getStatus = (listing) => {
    const status =
      String(listing.status || "")
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

  /* =========================
     MEDIA HELPERS
  ========================= */

  const getMedia = (listing) => {
    const media =
      listing.property_images ||
      listing.images ||
      listing.media ||
      listing.gallery ||
      [];

    if (Array.isArray(media) && media.length) {
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
      if (!item || typeof item === "string") {
        return false;
      }

      const type =
        item.media_type ||
        item.type ||
        item.resource_type;

      return type === "video";
    });
  };

  /* =========================
     FILTER LISTINGS
  ========================= */

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
  }, [listings, search, statusFilter]);

  /* =========================
     STATISTICS
  ========================= */

  const totalListings = listings.length;

  const approvedListings = listings.filter(
    (item) =>
      getStatus(item) === "approved"
  ).length;

  const pendingListings = listings.filter(
    (item) =>
      getStatus(item) === "pending"
  ).length;

  const rejectedListings = listings.filter(
    (item) =>
      getStatus(item) === "rejected"
  ).length;

  /* =========================
     LOADING
  ========================= */

  if (loading) {
    return (
      <div className="my-properties-page">
        <div className="my-properties-container">
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
      </div>
    );
  }

  return (
    <div className="my-properties-page">
      <div className="my-properties-container">

        {/* ================= HEADER ================= */}

        <div className="my-properties-header">
          <div>
            <span className="my-properties-eyebrow">
              SELLER SPACE
            </span>

            <h1>
              My Properties<span>.</span>
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
            <Plus size={17} />
            List Property
          </Link>
        </div>

        {/* ================= ERROR ================= */}

        {error && (
          <div className="my-properties-error">
            {error}
          </div>
        )}

        {/* ================= STATS ================= */}

        <div className="my-properties-stats">

          <div className="property-stat">
            <div className="property-stat-icon">
              <Building2 size={19} />
            </div>

            <div>
              <strong>
                {totalListings}
              </strong>

              <span>
                Total Listings
              </span>
            </div>
          </div>

          <div className="property-stat">
            <div className="property-stat-icon approved">
              <CheckCircle2 size={19} />
            </div>

            <div>
              <strong>
                {approvedListings}
              </strong>

              <span>
                Approved
              </span>
            </div>
          </div>

          <div className="property-stat">
            <div className="property-stat-icon pending">
              <Clock3 size={19} />
            </div>

            <div>
              <strong>
                {pendingListings}
              </strong>

              <span>
                Pending Review
              </span>
            </div>
          </div>

          <div className="property-stat">
            <div className="property-stat-icon rejected">
              <XCircle size={19} />
            </div>

            <div>
              <strong>
                {rejectedListings}
              </strong>

              <span>
                Rejected
              </span>
            </div>
          </div>

        </div>

        {/* ================= EMPTY ================= */}

        {listings.length === 0 ? (
          <div className="my-properties-empty">

            <div className="empty-icon">
              <Home size={30} />
            </div>

            <h2>
              No properties listed yet
            </h2>

            <p>
              Start by adding your first
              property to Xevoprop.
            </p>

            <Link to="/list-property">
              <Plus size={15} />
              List Your First Property
            </Link>

          </div>
        ) : (
          <>
            {/* ================= TOOLBAR ================= */}

            <div className="my-properties-toolbar">

              <div className="property-search">
                <Search size={17} />

                <input
                  type="text"
                  placeholder="Search your properties..."
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                />
              </div>

              <div className="property-status-filter">
                <button
                  className={
                    statusFilter === "all"
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setStatusFilter("all")
                  }
                >
                  All
                </button>

                <button
                  className={
                    statusFilter === "approved"
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setStatusFilter("approved")
                  }
                >
                  Approved
                </button>

                <button
                  className={
                    statusFilter === "pending"
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setStatusFilter("pending")
                  }
                >
                  Pending
                </button>

                <button
                  className={
                    statusFilter === "rejected"
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setStatusFilter("rejected")
                  }
                >
                  Rejected
                </button>
              </div>

            </div>

            {/* ================= NO FILTER RESULTS ================= */}

            {filteredListings.length === 0 ? (
              <div className="no-filter-results">
                <Search size={28} />

                <h3>
                  No matching properties
                </h3>

                <p>
                  Try changing your search or
                  status filter.
                </p>
              </div>
            ) : (
              /* ================= PROPERTY LIST ================= */

              <div className="my-properties-list">

                {filteredListings.map(
                  (listing) => {

                    const status =
                      getStatus(listing);

                    const image =
                      getCoverImage(listing);

                    const mediaCount =
                      getMediaCount(listing);

                    const videoAvailable =
                      hasVideo(listing);

                    return (
                      <div
                        className="seller-property-card"
                        key={listing.id}
                      >

                        {/* IMAGE */}

                        <div className="seller-property-image">

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
                            className={`seller-status ${status}`}
                          >
                            {status ===
                              "approved" && (
                              <CheckCircle2
                                size={12}
                              />
                            )}

                            {status ===
                              "pending" && (
                              <Clock3
                                size={12}
                              />
                            )}

                            {status ===
                              "rejected" && (
                              <XCircle
                                size={12}
                              />
                            )}

                            {getStatusLabel(
                              listing
                            )}
                          </span>

                          {mediaCount > 0 && (
                            <div className="media-count">
                              <ImageIcon size={13} />
                              {mediaCount}
                            </div>
                          )}

                          {videoAvailable && (
                            <div className="video-indicator">
                              <Video size={13} />
                              Video
                            </div>
                          )}

                        </div>

                        {/* CONTENT */}

                        <div className="seller-property-content">

                          <div className="seller-property-top">

                            <div className="seller-property-heading">

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
                            <MapPin size={14} />

                            <span>
                              {listing.location ||
                                listing.city ||
                                "India"}
                            </span>
                          </div>

                          {/* DETAILS */}

                          <div className="seller-property-details">

                            <span>
                              <BedDouble size={15} />
                              {listing.bedrooms ||
                                0}{" "}
                              Beds
                            </span>

                            <span>
                              <Bath size={15} />
                              {listing.bathrooms ||
                                0}{" "}
                              Baths
                            </span>

                            <span>
                              <Maximize size={15} />
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
                              <Pencil size={14} />
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
                              <Trash2 size={14} />
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
          </>
        )}

      </div>
    </div>
  );
}

export default MyProperties;