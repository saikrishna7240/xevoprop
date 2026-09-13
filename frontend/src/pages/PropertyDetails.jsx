import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

import {
  ArrowLeft,
  Heart,
  Share2,
  MapPin,
  BedDouble,
  Bath,
  Maximize,
  Building2,
  CalendarDays,
  Phone,
  MessageCircle,
  Check,
  ChevronLeft,
  ChevronRight,
  X,
  Send,
} from "lucide-react";

import "./PropertyDetails.css";
import { apiFetch } from "../lib/api";
import { useAuth } from "../context/AuthContext";

function PropertyDetails() {
  const { id } = useParams();
  const { user } = useAuth();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentImage, setCurrentImage] =
    useState(0);

  const [liked, setLiked] = useState(false);

  const [showEnquiry, setShowEnquiry] =
    useState(false);
    const [showVisit, setShowVisit] = useState(false);

const [visit, setVisit] = useState({
  name: "",
  email: "",
  phone: "",
  visit_date: "",
  visit_time: "",
  message: "",
});

  const [enquiry, setEnquiry] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  /* =========================
     FETCH PROPERTY
  ========================= */

  useEffect(() => {
    if (user) apiFetch("/favorites").then(data => setLiked((data.favorites||[]).some(p => Number(p.id) === Number(id)))).catch(()=>{});
  }, [id, user]);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `https://xevoprop.onrender.com/api/properties/${id}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to load property"
          );
        }

        setProperty(data.property);

      } catch (err) {
        console.error(
          "Property details error:",
          err
        );

        setError(
          "Unable to load property details"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  /* =========================
     UPDATE ENQUIRY
  ========================= */

  const updateEnquiry = (
    field,
    value
  ) => {
    setEnquiry((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  /* =========================
     LOADING
  ========================= */

  if (loading) {
    return (
      <div className="property-not-found">
        <h1>Loading property...</h1>
      </div>
    );
  }

  /* =========================
     ERROR
  ========================= */

  if (error || !property) {
    return (
      <div className="property-not-found">
        <h1>Property not found</h1>

        <p>
          {error ||
            "The property you're looking for doesn't exist."}
        </p>

        <Link to="/properties">
          Back to properties
        </Link>
      </div>
    );
  }

  /* =========================
     PROPERTY IMAGES
  ========================= */

  const images =
  Array.isArray(property.images) &&
  property.images.length > 0
    ? [...property.images]
        .sort(
          (a, b) =>
            (a.sort_order ?? 0) -
            (b.sort_order ?? 0)
        )
        .map((image) => image.image_url)
        .filter(Boolean)
    : property.image
    ? [property.image]
    : [];

  /* =========================
     GALLERY
  ========================= */

  const nextImage = () => {
  if (images.length <= 1) return;

  setCurrentImage(
    (currentImage + 1) % images.length
  );
};

 const previousImage = () => {
  if (images.length <= 1) return;

  setCurrentImage(
    (currentImage - 1 + images.length) %
      images.length
  );
};

const submitEnquiry = async () => {
  setError("");

  const token = localStorage.getItem("token");

  if (!token) {
    alert("Please login to send an enquiry.");
    return;
  }

  if (!enquiry.name.trim()) {
    setError("Please enter your name.");
    return;
  }

  if (!enquiry.email.trim()) {
    setError("Please enter your email.");
    return;
  }

  try {
    const response = await fetch(
      "https://xevoprop.onrender.com/api/enquiries",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          property_id: property.id,
          name: enquiry.name,
          email: enquiry.email,
          phone: enquiry.phone,
          message: enquiry.message,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to send enquiry."
      );
    }

    alert("Enquiry sent successfully!");

    setEnquiry({
      name: "",
      email: "",
      phone: "",
      message: "",
    });

    setShowEnquiry(false);

  } catch (error) {
    console.error(
      "Send enquiry error:",
      error
    );

    alert(
      error.message ||
        "Unable to send enquiry."
    );
  }
};

const updateVisit = (field, value) => {
  setVisit((previous) => ({
    ...previous,
    [field]: value,
  }));
};

const submitVisit = async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Please login to book a visit.");
    return;
  }

  if (
    !visit.name.trim() ||
    !visit.email.trim() ||
    !visit.visit_date ||
    !visit.visit_time
  ) {
    alert(
      "Please enter your name, email, date and time."
    );
    return;
  }

  try {
    const response = await fetch(
      "https://xevoprop.onrender.com/api/visits",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          property_id: property.id,
          name: visit.name,
          email: visit.email,
          phone: visit.phone,
          visit_date: visit.visit_date,
          visit_time: visit.visit_time,
          message: visit.message,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Failed to book visit."
      );
    }

    alert(
      "Visit request submitted successfully!"
    );

    setVisit({
      name: "",
      email: "",
      phone: "",
      visit_date: "",
      visit_time: "",
      message: "",
    });

    setShowVisit(false);

  } catch (error) {
    console.error(
      "Book visit error:",
      error
    );

    alert(
      error.message ||
        "Unable to book visit."
    );
  }
};



  /* =========================
     RETURN
  ========================= */

  return (
    <div className="details-page">

      <div className="details-container">

        {/* TOP BAR */}

        <div className="details-topbar">

          <Link
            to="/properties"
            className="back-link"
          >
            <ArrowLeft size={17} />
            Back to properties
          </Link>

          <div className="details-actions">

            <button
              className={
                liked
                  ? "action-btn liked"
                  : "action-btn"
              }
              onClick={async () => {
                if (!user) { alert("Please login to save properties."); return; }
                try {
                  if (liked) { await apiFetch(`/favorites/${id}`, { method: "DELETE" }); setLiked(false); }
                  else { await apiFetch(`/favorites/${id}`, { method: "POST" }); setLiked(true); }
                } catch (error) { alert(error.message); }
              }}
            >
              <Heart
                size={17}
                fill={
                  liked
                    ? "currentColor"
                    : "none"
                }
              />
            </button>

            <button
              className="action-btn"
            >
              <Share2 size={17} />
            </button>

          </div>

        </div>

        {/* GALLERY */}

        <div className="property-gallery">

          <div className="gallery-main">

            <img
              src={
                images[currentImage]
              }
              alt={property.title}
            />

            {property.verified && (
              <span className="gallery-verified">
                ✓ Verified Property
              </span>
            )}

            {images.length > 1 && (
              <>
                <button
                  className="gallery-arrow gallery-left"
                  onClick={
                    previousImage
                  }
                >
                  <ChevronLeft
                    size={20}
                  />
                </button>

                <button
                  className="gallery-arrow gallery-right"
                  onClick={
                    nextImage
                  }
                >
                  <ChevronRight
                    size={20}
                  />
                </button>
              </>
            )}

            <div className="gallery-counter">
              {currentImage + 1} /{" "}
              {images.length}
            </div>

          </div>

          <div className="gallery-thumbnails">

            {images.map(
              (image, index) => (
                <button
                  key={`${image}-${index}`}
                  className={
                    index ===
                    currentImage
                      ? "thumbnail active"
                      : "thumbnail"
                  }
                  onClick={() =>
                    setCurrentImage(
                      index
                    )
                  }
                >
                  <img
                    src={image}
                    alt=""
                  />
                </button>
              )
            )}

          </div>

        </div>

        {/* DETAILS */}

        <div className="details-layout">

          {/* MAIN */}

          <main className="details-main">

            <div className="property-heading">

              <div>

                <span className="property-type">
                  {property.type}
                </span>

                <h1>
                  {property.title}
                </h1>

                <div className="details-location">
                  <MapPin size={16} />
                  {property.location}
                </div>

              </div>

              <div className="details-price">

                <strong>
                  {property.price ||
                    "Price on request"}
                </strong>

                <span>
                  Starting price
                </span>

              </div>

            </div>

            {/* KEY DETAILS */}

            <div className="key-details">

              <div>
                <BedDouble size={19} />

                <span>
                  {property.bedrooms ??
                    "-"}{" "}
                  Bedrooms
                </span>
              </div>

              <div>
                <Bath size={19} />

                <span>
                  {property.bathrooms ??
                    "-"}{" "}
                  Bathrooms
                </span>
              </div>

              <div>
                <Maximize size={19} />

                <span>
                  {property.area ??
                    "-"}{" "}
                  sq.ft
                </span>
              </div>

              <div>
                <Building2 size={19} />

                <span>
                  {property.ready_to_move
                    ? "Ready to Move"
                    : "Upcoming"}
                </span>
              </div>

            </div>

            {/* ABOUT */}

            <section className="details-section">

              <h2>
                About this property
              </h2>

              <p>
                {property.description ||
                  `${property.title} is a ${property.type?.toLowerCase()} located in ${property.location}. This property offers a thoughtfully designed living experience with modern spaces and convenient access to important locations.`}
              </p>

            </section>

            {/* AMENITIES */}

            <section className="details-section">

              <h2>
                Features & Amenities
              </h2>

              <div className="amenities-grid">

                {[
                  "Swimming Pool",
                  "Gymnasium",
                  "Clubhouse",
                  "Children's Play Area",
                  "24/7 Security",
                  "Covered Parking",
                ].map(
                  (amenity) => (
                    <div
                      key={amenity}
                    >
                      <Check
                        size={15}
                      />
                      {amenity}
                    </div>
                  )
                )}

              </div>

            </section>

            {/* DEVELOPER */}

            <section className="developer-profile">

              <div className="developer-avatar">
                XP
              </div>

              <div className="developer-info">

                <span>
                  LISTED ON XEVOPROP
                </span>

                <h3>
                  Verified Property Partner
                </h3>

                <p>
                  Direct property connection
                </p>

              </div>

              <button>
                View profile
              </button>

            </section>

          </main>

          {/* CONTACT */}

          <aside className="contact-card">

            <span className="contact-label">
              INTERESTED IN THIS PROPERTY?
            </span>

            <h2>
              Take the next step.
            </h2>

            <p>
              Connect directly with the
              property representative and
              get the information you need.
            </p>

            <button
  className="visit-btn"
  onClick={() => setShowVisit(true)}
>
              <CalendarDays
                size={17}
              />
              Book a Visit
            </button>

            <button
              className="enquiry-btn"
              onClick={() =>
                setShowEnquiry(true)
              }
            >
              <MessageCircle
                size={17}
              />
              Send Enquiry
            </button>

            <button
              className="call-btn"
              onClick={() =>
                alert(
                  "Call request will be connected to the backend soon."
                )
              }
            >
              <Phone size={16} />
              Request a Call
            </button>

            <div className="direct-note">
              <Check size={14} />
              Direct connection
            </div>

            {property.zero_brokerage && (
              <div className="direct-note">
                <Check size={14} />
                Zero brokerage
              </div>
            )}

          </aside>

        </div>

      </div>

      {/* VISIT MODAL */}
      {showVisit && (
  <div className="enquiry-overlay">

    <div className="enquiry-modal">

      <button
        className="enquiry-close"
        onClick={() =>
          setShowVisit(false)
        }
      >
        <X size={20} />
      </button>

      <h2>Book a Visit</h2>

      <p>
        Choose a convenient date and time
        to visit this property.
      </p>

      <input
        type="text"
        placeholder="Your name"
        value={visit.name}
        onChange={(e) =>
          updateVisit(
            "name",
            e.target.value
          )
        }
      />

      <input
        type="email"
        placeholder="Email address"
        value={visit.email}
        onChange={(e) =>
          updateVisit(
            "email",
            e.target.value
          )
        }
      />

      <input
        type="tel"
        placeholder="Phone number"
        value={visit.phone}
        onChange={(e) =>
          updateVisit(
            "phone",
            e.target.value
          )
        }
      />

      <label className="visit-input-label">
        Visit date
      </label>

      <input
        type="date"
        value={visit.visit_date}
        min={
          new Date()
            .toISOString()
            .split("T")[0]
        }
        onChange={(e) =>
          updateVisit(
            "visit_date",
            e.target.value
          )
        }
      />

      <label className="visit-input-label">
        Visit time
      </label>

      <input
        type="time"
        value={visit.visit_time}
        onChange={(e) =>
          updateVisit(
            "visit_time",
            e.target.value
          )
        }
      />

      <textarea
        placeholder="Message (optional)"
        value={visit.message}
        onChange={(e) =>
          updateVisit(
            "message",
            e.target.value
          )
        }
      />

      <button
        className="send-enquiry-btn"
        onClick={submitVisit}
      >
        <CalendarDays size={16} />
        Request Visit
      </button>

    </div>

  </div>
)}

      {/* ENQUIRY MODAL */}

      {showEnquiry && (
        <div className="enquiry-overlay">

          <div className="enquiry-modal">

            <button
              className="enquiry-close"
              onClick={() =>
                setShowEnquiry(false)
              }
            >
              <X size={20} />
            </button>

            <h2>
              Send an Enquiry
            </h2>

            <p>
              Get more information about
              this property.
            </p>

            <input
              type="text"
              placeholder="Your name"
              value={enquiry.name}
              onChange={(e) =>
                updateEnquiry(
                  "name",
                  e.target.value
                )
              }
            />

            <input
              type="email"
              placeholder="Email address"
              value={enquiry.email}
              onChange={(e) =>
                updateEnquiry(
                  "email",
                  e.target.value
                )
              }
            />

            <input
              type="tel"
              placeholder="Phone number"
              value={enquiry.phone}
              onChange={(e) =>
                updateEnquiry(
                  "phone",
                  e.target.value
                )
              }
            />

            <textarea
              placeholder="Your message"
              value={enquiry.message}
              onChange={(e) =>
                updateEnquiry(
                  "message",
                  e.target.value
                )
              }
            />

            <button
              className="send-enquiry-btn"
              onClick={submitEnquiry}
            >
              <Send size={16} />
              Send Enquiry
            </button>

          </div>

        </div>
      )}

    </div>
  );
}

export default PropertyDetails;