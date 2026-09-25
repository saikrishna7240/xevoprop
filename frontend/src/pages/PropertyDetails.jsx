import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  Bath,
  BedDouble,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Heart,
  Home,
  Mail,
  MapPin,
  Maximize,
  Phone,
  Ruler,
  ShieldCheck,
  UserRound,
  MessageCircle,
} from "lucide-react";

import "./PropertyDetails.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://xevoprop.onrender.com/api";

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=90",
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1600&q=90",
  "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1600&q=90",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=90",
];

/* =========================================================
   HELPERS
========================================================= */

const getValue = (
  property,
  keys,
  fallback = ""
) => {
  if (!property) return fallback;

  for (const key of keys) {
    if (
      property[key] !== undefined &&
      property[key] !== null &&
      property[key] !== ""
    ) {
      return property[key];
    }
  }

  return fallback;
};


/* =========================================================
   PROPERTY MEDIA
========================================================= */

const getPropertyMedia = (property) => {
  if (!property) return [];

  const media = Array.isArray(
    property.property_images
  )
    ? property.property_images
    : [];

  const normalizedMedia = media
    .map((item) => {
      if (!item) return null;

      const url =
        item.image_url ||
        item.url ||
        item.secure_url ||
        item.image ||
        item.src ||
        item.media_url;

      if (!url) return null;

      const mediaType =
        item.media_type === "video" ||
        item.type === "video" ||
        item.resource_type === "video"
          ? "video"
          : "image";

      return {
        id: item.id,
        url,
        type: mediaType,
        sort_order: Number(
          item.sort_order || 0
        ),
      };
    })
    .filter(Boolean)
    .sort(
      (a, b) =>
        a.sort_order - b.sort_order ||
        Number(a.id || 0) -
          Number(b.id || 0)
    );

  if (normalizedMedia.length > 0) {
    return normalizedMedia;
  }

  const coverImage =
    property.image ||
    property.image_url ||
    property.cover_image ||
    property.photo ||
    property.property_image;

  if (coverImage) {
    return [
      {
        id: "cover",
        url: coverImage,
        type: "image",
        sort_order: 0,
      },
    ];
  }

  return FALLBACK_IMAGES.map(
    (url, index) => ({
      id: `fallback-${index}`,
      url,
      type: "image",
      sort_order: index,
    })
  );
};


/* =========================================================
   PRICE
========================================================= */

const formatPrice = (price) => {
  if (
    price === null ||
    price === undefined ||
    price === ""
  ) {
    return "Price on Request";
  }

  if (typeof price === "number") {
    if (price >= 10000000) {
      return `₹${(
        price / 10000000
      ).toFixed(2)} Cr`;
    }

    if (price >= 100000) {
      return `₹${(
        price / 100000
      ).toFixed(2)} Lakh`;
    }

    return `₹${price.toLocaleString(
      "en-IN"
    )}`;
  }

  return String(price).startsWith("₹")
    ? price
    : `₹${price}`;
};


/* =========================================================
   COMPONENT
========================================================= */

function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [property, setProperty] =
    useState(null);

  const [
    similarProperties,
    setSimilarProperties,
  ] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [
    similarLoading,
    setSimilarLoading,
  ] = useState(true);

  const [error, setError] =
    useState("");

  const [activeMedia, setActiveMedia] =
    useState(0);

  const [saved, setSaved] =
    useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });

  const [formStatus, setFormStatus] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);


  /* =======================================================
     FETCH PROPERTY
  ======================================================= */

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/properties/${id}`
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Property could not be loaded."
          );
        }

        const propertyData =
          data?.property ||
          data?.data ||
          data;

        setProperty(propertyData);
        setActiveMedia(0);

      } catch (err) {
        console.error(
          "Property details error:",
          err
        );

        setError(
          err.message ||
            "Unable to load property."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProperty();
    }
  }, [id]);


  /* =======================================================
     FETCH SIMILAR PROPERTIES
  ======================================================= */

  useEffect(() => {
    const fetchSimilar =
      async () => {
        try {
          setSimilarLoading(true);

          const response =
            await fetch(
              `${API_URL}/properties`
            );

          if (!response.ok) {
            setSimilarProperties([]);
            return;
          }

          const data =
            await response.json();

          const list =
            Array.isArray(data)
              ? data
              : data?.properties ||
                data?.data ||
                [];

          const filtered = list
            .filter(
              (item) =>
                String(item.id) !==
                  String(id) &&
                String(
                  item.status ||
                    "approved"
                ).toLowerCase() ===
                  "approved"
            )
            .slice(0, 4);

          setSimilarProperties(
            filtered
          );

        } catch (err) {
          console.error(
            "Similar properties error:",
            err
          );

          setSimilarProperties([]);

        } finally {
          setSimilarLoading(false);
        }
      };

    if (id) {
      fetchSimilar();
    }
  }, [id]);


  /* =======================================================
     MEDIA
  ======================================================= */

  const media = useMemo(
    () =>
      getPropertyMedia(property),
    [property]
  );

  const currentMedia =
    media[activeMedia] ||
    media[0];


  /* =======================================================
     PROPERTY VALUES
  ======================================================= */

  const title = getValue(
    property,
    [
      "title",
      "property_name",
      "name",
    ],
    "Premium Property"
  );

  const location = getValue(
    property,
    [
      "location",
      "address",
      "locality",
    ],
    "Location not specified"
  );

  const city = getValue(
    property,
    [
      "city",
      "city_name",
    ]
  );

  const propertyType = getValue(
    property,
    [
      "property_type",
      "propertyType",
      "type",
    ],
    "Residential"
  );

  const price = getValue(
    property,
    [
      "price",
      "amount",
      "expected_price",
    ]
  );

  const bedrooms = getValue(
    property,
    [
      "bedrooms",
      "bhk",
      "beds",
    ]
  );

  const bathrooms = getValue(
    property,
    [
      "bathrooms",
      "baths",
    ]
  );

  const area = getValue(
    property,
    [
      "area",
      "built_up_area",
      "carpet_area",
      "sqft",
      "square_feet",
    ]
  );

  const possession = getValue(
    property,
    [
      "possession",
      "possession_date",
    ]
  );

  const description =
    getValue(
      property,
      [
        "description",
        "property_description",
      ],
      "Detailed property information will be available soon."
    );

  const reraNumber = getValue(
    property,
    [
      "rera_number",
      "reraNumber",
      "rera_id",
    ]
  );

  const propertyId =
    getValue(
      property,
      ["id", "_id"],
      id
    );


  /* =======================================================
     OWNER DETAILS
  ======================================================= */

  const seller =
    property?.seller ||
    property?.owner ||
    {};

  const ownerName =
    seller.name ||
    seller.username ||
    property?.owner_name ||
    property?.seller_name ||
    property?.developer_name ||
    property?.listed_by ||
    "Property Owner";

  const ownerPhone =
    seller.phone ||
    property?.owner_phone ||
    property?.seller_phone ||
    property?.phone ||
    "";

  const ownerEmail =
    seller.email ||
    property?.owner_email ||
    property?.seller_email ||
    "";

  const ownerImage =
    seller.profile_image ||
    seller.profile_picture ||
    seller.avatar ||
    seller.image ||
    property?.owner_image ||
    property?.seller_image ||
    property?.owner_avatar ||
    "";


  /* =======================================================
     MEDIA NAVIGATION
  ======================================================= */

  const nextMedia = () => {
    if (media.length <= 1) return;

    setActiveMedia(
      (current) =>
        current === media.length - 1
          ? 0
          : current + 1
    );
  };

  const previousMedia = () => {
    if (media.length <= 1) return;

    setActiveMedia(
      (current) =>
        current === 0
          ? media.length - 1
          : current - 1
    );
  };


  /* =======================================================
     FORM
  ======================================================= */

  const handleFormChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setForm(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );
  };


  const handleEnquiry = async (
    event
  ) => {
    event.preventDefault();

    if (
      !form.name.trim() ||
      !form.phone.trim()
    ) {
      setFormStatus(
        "Please enter your name and phone number."
      );
      return;
    }

    try {
      setSubmitting(true);
      setFormStatus("");

      /*
       * Keep your existing enquiry API
       * integration here.
       */

      await new Promise(
        (resolve) =>
          setTimeout(resolve, 700)
      );

      setFormStatus(
        "Your enquiry has been submitted successfully."
      );

      setForm({
        name: "",
        phone: "",
        email: "",
        message: "",
      });

    } catch (err) {
      console.error(
        "Enquiry error:",
        err
      );

      setFormStatus(
        "Unable to submit your enquiry. Please try again."
      );

    } finally {
      setSubmitting(false);
    }
  };


  /* =======================================================
     SIMILAR PROPERTY HELPERS
  ======================================================= */

  const getSimilarImage = (
    item
  ) => {
    const itemMedia =
      getPropertyMedia(item);

    return (
      itemMedia[0]?.url ||
      FALLBACK_IMAGES[0]
    );
  };

  const getSimilarTitle = (
    item
  ) =>
    getValue(
      item,
      [
        "title",
        "property_name",
        "name",
      ],
      "Property"
    );

  const getSimilarLocation = (
    item
  ) =>
    getValue(
      item,
      [
        "location",
        "address",
        "locality",
      ],
      "Location"
    );

  const getSimilarPrice = (
    item
  ) =>
    formatPrice(
      getValue(
        item,
        [
          "price",
          "amount",
          "expected_price",
        ]
      )
    );


  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="property-details-page">

        <div className="property-details-loading">

          <div className="details-loading-image" />

          <div className="details-loading-content">

            <div className="loading-line large" />
            <div className="loading-line medium" />
            <div className="loading-line small" />

            <div className="loading-box" />

          </div>

        </div>

      </div>
    );
  }


  /* =======================================================
     ERROR
  ======================================================= */

  if (
    error ||
    !property
  ) {
    return (
      <div className="property-details-page">

        <div className="property-details-error">

          <div className="error-icon">
            <Home size={28} />
          </div>

          <h1>
            Property Not Available
          </h1>

          <p>
            {error ||
              "The property you are looking for could not be found."}
          </p>

          <button
            className="details-back-button"
            onClick={() =>
              navigate(
                "/properties"
              )
            }
          >
            <ArrowLeft size={17} />
            Back to Properties
          </button>

        </div>

      </div>
    );
  }


  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <div className="property-details-page">

      {/* =================================================
          TOP BAR
      ================================================= */}

      <div className="property-details-topbar">

        <div className="property-details-container">

          <button
            className="back-to-properties"
            onClick={() =>
              navigate(
                "/properties"
              )
            }
          >
            <ArrowLeft size={16} />
            Properties
          </button>

          <div className="property-details-breadcrumb">

            <span>
              Properties
            </span>

            <span>/</span>

            <span>
              {propertyType}
            </span>

            <span>/</span>

            <strong>
              {title}
            </strong>

          </div>

        </div>

      </div>


      {/* =================================================
          MAIN
      ================================================= */}

      <main className="property-details-container">


        {/* =================================================
            GALLERY
        ================================================= */}

        <section className="property-gallery-section">

          <div className="property-gallery-main">

            {currentMedia?.type ===
            "video" ? (
              <video
                className="property-main-image"
                src={
                  currentMedia.url
                }
                controls
                playsInline
                preload="metadata"
              />
            ) : (
              <img
                src={
                  currentMedia?.url ||
                  FALLBACK_IMAGES[0]
                }
                alt={title}
                className="property-main-image"
                onError={(event) => {
                  event.currentTarget.src =
                    FALLBACK_IMAGES[0];
                }}
              />
            )}


            <div className="gallery-overlay-top">

              <div className="gallery-verification">

                <ShieldCheck
                  size={14}
                />

                RERA Verified Property

              </div>

              <div className="gallery-direct-owner">
                Direct from Owner
              </div>

            </div>


            <button
              type="button"
              className={`gallery-save ${
                saved
                  ? "saved"
                  : ""
              }`}
              onClick={() =>
                setSaved(
                  (value) =>
                    !value
                )
              }
            >
              <Heart
                size={18}
                fill={
                  saved
                    ? "currentColor"
                    : "none"
                }
              />
            </button>


            {media.length > 1 && (
              <>
                <button
                  type="button"
                  className="gallery-arrow gallery-arrow-left"
                  onClick={
                    previousMedia
                  }
                >
                  <ChevronLeft
                    size={22}
                  />
                </button>

                <button
                  type="button"
                  className="gallery-arrow gallery-arrow-right"
                  onClick={
                    nextMedia
                  }
                >
                  <ChevronRight
                    size={22}
                  />
                </button>
              </>
            )}


            <div className="gallery-counter">
              {activeMedia + 1} /{" "}
              {media.length}
            </div>

          </div>


          <div className="property-gallery-thumbnails">

            {media.map(
              (
                item,
                index
              ) => (
                <button
                  key={
                    `${item.id || item.url}-${index}`
                  }
                  type="button"
                  className={`gallery-thumbnail ${
                    activeMedia ===
                    index
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    setActiveMedia(
                      index
                    )
                  }
                >

                  {item.type ===
                  "video" ? (
                    <div className="property-video-thumbnail">

                      <video
                        src={
                          item.url
                        }
                        muted
                        preload="metadata"
                      />

                      <span className="property-video-play">
                        ▶
                      </span>

                    </div>
                  ) : (
                    <img
                      src={
                        item.url
                      }
                      alt={`${title} ${
                        index + 1
                      }`}
                      onError={(
                        event
                      ) => {
                        event.currentTarget.src =
                          FALLBACK_IMAGES[0];
                      }}
                    />
                  )}

                </button>
              )
            )}

          </div>

        </section>


        {/* =================================================
            DETAILS LAYOUT
        ================================================= */}

        <section className="property-details-layout">


          {/* =================================================
              LEFT CONTENT
          ================================================= */}

          <div className="property-details-main">


            {/* TITLE */}

            <section className="property-title-section">

              <div className="property-title-meta">

                <span className="property-type-pill">
                  {propertyType}
                </span>

                <span className="verified-title">

                  <CheckCircle2
                    size={13}
                  />

                  RERA Verified

                </span>

                <span className="zero-brokerage">
                  Zero Brokerage
                </span>

              </div>


              <h1>
                {title}
              </h1>


              <div className="property-location">

                <MapPin
                  size={15}
                />

                <span>
                  {location}
                </span>

                {city && (
                  <>
                    <span className="location-dot">
                      •
                    </span>

                    <span>
                      {city}
                    </span>
                  </>
                )}

              </div>

            </section>


            {/* PRICE */}

            <section className="property-price-card">

              <div>

                <span className="price-label">
                  ALL-INCLUSIVE ASKING VALUATION
                </span>

                <strong>
                  {formatPrice(
                    price
                  )}
                </strong>

                <small>
                  Estimated pricing subject
                  to final verification.
                </small>

              </div>


              <div className="price-card-actions">

                <span className="ready-badge">
                  Ready to Move
                </span>

                <button
                  type="button"
                  className="emi-button"
                >
                  Calculate EMI
                </button>

              </div>

            </section>


            {/* SPECS */}

            <div className="property-specifications">

              {bedrooms && (
                <div className="property-spec">

                  <div className="spec-icon">
                    <BedDouble
                      size={19}
                    />
                  </div>

                  <div>

                    <strong>
                      {bedrooms}
                    </strong>

                    <span>
                      Bedrooms
                    </span>

                  </div>

                </div>
              )}


              {bathrooms && (
                <div className="property-spec">

                  <div className="spec-icon">
                    <Bath size={19} />
                  </div>

                  <div>

                    <strong>
                      {bathrooms}
                    </strong>

                    <span>
                      Bathrooms
                    </span>

                  </div>

                </div>
              )}


              {area && (
                <div className="property-spec">

                  <div className="spec-icon">
                    <Maximize
                      size={19}
                    />
                  </div>

                  <div>

                    <strong>
                      {area}
                    </strong>

                    <span>
                      Sq. Ft.
                    </span>

                  </div>

                </div>
              )}


              <div className="property-spec">

                <div className="spec-icon">
                  <Building2
                    size={19}
                  />
                </div>

                <div>

                  <strong>
                    {propertyType}
                  </strong>

                  <span>
                    Property Type
                  </span>

                </div>

              </div>

            </div>


            {/* OVERVIEW */}

            <section className="details-content-section">

              <div className="details-section-heading">

                <span>
                  PROPERTY OVERVIEW
                </span>

                <h2>
                  Property Overview &
                  Design Notes
                </h2>

              </div>


              <p className="property-description">
                {description}
              </p>


              <div className="overview-grid">

                <div className="overview-item">
                  <span>
                    Property Type
                  </span>

                  <strong>
                    {propertyType}
                  </strong>
                </div>


                <div className="overview-item">
                  <span>
                    Property ID
                  </span>

                  <strong>
                    {propertyId}
                  </strong>
                </div>


                {possession && (
                  <div className="overview-item">

                    <span>
                      Possession
                    </span>

                    <strong>
                      {possession}
                    </strong>

                  </div>
                )}


                {reraNumber && (
                  <div className="overview-item">

                    <span>
                      RERA Registration
                    </span>

                    <strong>
                      {reraNumber}
                    </strong>

                  </div>
                )}

              </div>

            </section>


            {/* VERIFICATION */}

            <section className="verification-section">

              <div className="verification-icon">

                <ShieldCheck
                  size={24}
                />

              </div>

              <div className="verification-content">

                <span className="verification-label">
                  XEVOPROP VERIFICATION
                </span>

                <h3>
                  Property information
                  reviewed for your confidence.
                </h3>

                <p>
                  Review the available property
                  information, ownership details and
                  applicable registration information
                  before proceeding with a transaction.
                </p>

              </div>

              <CheckCircle2
                className="verification-check"
                size={24}
              />

            </section>


            {/* RERA */}

            {reraNumber && (
              <section className="rera-section">

                <div className="rera-icon">

                  <ShieldCheck
                    size={22}
                  />

                </div>

                <div>

                  <span>
                    RERA INFORMATION
                  </span>

                  <h3>
                    {reraNumber}
                  </h3>

                  <p>
                    Registration information
                    provided for this property.
                  </p>

                </div>

              </section>
            )}


            {/* AMENITIES */}

            {Array.isArray(
              property.amenities
            ) &&
              property.amenities.length >
                0 && (
                <section className="details-content-section">

                  <div className="details-section-heading">

                    <span>
                      AMENITIES
                    </span>

                    <h2>
                      Designed around
                      your lifestyle
                    </h2>

                  </div>


                  <div className="amenities-grid">

                    {property.amenities.map(
                      (
                        amenity,
                        index
                      ) => (
                        <div
                          className="amenity-item"
                          key={`${amenity}-${index}`}
                        >

                          <CheckCircle2
                            size={16}
                          />

                          <span>
                            {typeof amenity ===
                            "string"
                              ? amenity
                              : amenity?.name ||
                                "Amenity"}
                          </span>

                        </div>
                      )
                    )}

                  </div>

                </section>
              )}


            {/* LOCATION */}

            <section className="details-content-section">

              <div className="details-section-heading">

                <span>
                  STRATEGIC GEOGRAPHY
                </span>

                <h2>
                  Explore the neighbourhood
                </h2>

              </div>


              <div className="property-map-placeholder">

                <MapPin size={29} />

                <strong>
                  {location}
                </strong>

                <span>
                  Map integration can be
                  connected here.
                </span>

              </div>

            </section>

          </div>


          {/* =================================================
              RIGHT ENQUIRY PANEL
          ================================================= */}

          <aside className="property-enquiry-column">

            <div className="enquiry-card">

  <div className="enquiry-card-header">
    <span className="enquiry-kicker">
      INTERESTED IN THIS PROPERTY?
    </span>

    <h2>
      Let's help you take the next step.
    </h2>

    <p>
      Share your details and our property team
      will get in touch with you.
    </p>
  </div>

  {/* OWNER DETAILS */}
  <div className="owner-card">

    <div className="owner-avatar">
      <UserRound size={22} />
    </div>

    <div className="owner-details">
      <span>DIRECT OWNER LISTING</span>

      <strong>{ownerName}</strong>

      <small>Property Owner / Seller</small>

      {ownerPhone && (
        <a
          href={`tel:${ownerPhone}`}
          className="owner-contact"
        >
          <Phone size={15} />
          {ownerPhone}
        </a>
      )}

      {ownerEmail && (
        <a
          href={`mailto:${ownerEmail}`}
          className="owner-contact"
        >
          <Mail size={15} />
          {ownerEmail}
        </a>
      )}
    </div>

    <span className="owner-active">
      Active Today
    </span>

  </div>

  {/* ENQUIRY FORM */}
  <form
    className="enquiry-form"
    onSubmit={handleEnquiry}
  >

    <label>
      Your Full Name
      <input
        type="text"
        name="name"
        placeholder="Enter your full name"
        value={form.name}
        onChange={handleFormChange}
      />
    </label>

    <label>
      Contact Number
      <input
        type="tel"
        name="phone"
        placeholder="Enter your phone number"
        value={form.phone}
        onChange={handleFormChange}
      />
    </label>

    <label>
      Email Address
      <input
        type="email"
        name="email"
        placeholder="Enter your email"
        value={form.email}
        onChange={handleFormChange}
      />
    </label>

    <label>
      Personal Message
      <textarea
        name="message"
        rows="4"
        placeholder="I am interested in this property..."
        value={form.message}
        onChange={handleFormChange}
      />
    </label>

    {formStatus && (
      <div
        className={`form-status ${
          formStatus.includes("successfully")
            ? "success"
            : "error"
        }`}
      >
        {formStatus}
      </div>
    )}

    <button
      type="submit"
      className="submit-enquiry-button"
      disabled={submitting}
    >
      {submitting ? "Submitting..." : "Send Direct Enquiry"}

      {!submitting && <ArrowRight size={17} />}
    </button>

  </form>

  {/* BELOW ENQUIRY BUTTON */}
  <div className="enquiry-actions">

    <button
      type="button"
      className="schedule-visit-button"
    >
      <CalendarDays size={17} />
      Schedule Private Site Visit
    </button>

  </div>

  <div className="enquiry-security">
    <ShieldCheck size={15} />
    <span>
      100% Privacy Protected&nbsp; • &nbsp;Encrypted & Secure
    </span>
  </div>

  <p className="enquiry-security-text">
    Your information is kept confidential and will only be
    shared with the property owner or relevant property team.
  </p>

</div>

          </aside>

        </section>


        {/* =================================================
            SIMILAR PROPERTIES
        ================================================= */}

        <section className="similar-properties-section">

          <div className="similar-heading">

            <div>

              <span>
                CURATED PROPERTIES
              </span>

              <h2>
                Similar Residences
              </h2>

            </div>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/properties"
                )
              }
            >
              View All
              <ArrowRight
                size={16}
              />
            </button>

          </div>


          {similarLoading ? (
            <div className="similar-loading">
              Loading similar properties...
            </div>

          ) : similarProperties.length ===
            0 ? (

            <div className="similar-loading">
              No similar properties available.
            </div>

          ) : (

            <div className="similar-properties-grid">

              {similarProperties.map(
                (item) => (

                  <article
                    className="similar-property-card"
                    key={item.id}
                    onClick={() =>
                      navigate(
                        `/properties/${item.id}`
                      )
                    }
                  >

                    <div className="similar-image-wrapper">

                      <img
                        src={getSimilarImage(
                          item
                        )}
                        alt={getSimilarTitle(
                          item
                        )}
                        onError={(
                          event
                        ) => {
                          event.currentTarget.src =
                            FALLBACK_IMAGES[0];
                        }}
                      />

                      <span>
                        RERA Verified
                      </span>

                    </div>


                    <div className="similar-property-body">

                      <div className="similar-price">
                        {getSimilarPrice(
                          item
                        )}
                      </div>

                      <h3>
                        {getSimilarTitle(
                          item
                        )}
                      </h3>

                      <p>

                        <MapPin
                          size={13}
                        />

                        {getSimilarLocation(
                          item
                        )}

                      </p>

                    </div>

                  </article>

                )
              )}

            </div>

          )}

        </section>

      </main>

    </div>
  );
}

export default PropertyDetails;