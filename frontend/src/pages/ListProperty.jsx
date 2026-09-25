import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Bath,
  BedDouble,
  Building2,
  Check,
  CheckCircle2,
  Clock3,
  FileCheck2,
  Home,
  Image as ImageIcon,
  IndianRupee,
  MapPin,
  MessageCircle,
  Pencil,
  Phone,
  Plus,
  Ruler,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UploadCloud,
  Wallet,
  X,
} from "lucide-react";

import "./ListProperty.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://xevoprop.onrender.com/api";

function ListProperty() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [step, setStep] = useState(1);
  const [selectedMedia, setSelectedMedia] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  const [form, setForm] = useState({
    title: "",
    type: "Apartment",
    location: "",
    city: "",
    price: "",
    price_value: "",
    bedrooms: "",
    bathrooms: "",
    area: "",
    description: "",
    verified: false,
    ready_to_move: false,
    zero_brokerage: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleMediaSelect = (e) => {
    const files = Array.from(e.target.files || []);

    if (!files.length) return;

    const remainingSlots = 10 - selectedMedia.length;

    if (remainingSlots <= 0) {
      setSubmitError("You can upload a maximum of 10 media files.");
      e.target.value = "";
      return;
    }

    const filesToAdd = files.slice(0, remainingSlots);

    const invalidFile = filesToAdd.find((file) => {
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");
      const maxSize = isVideo
        ? 100 * 1024 * 1024
        : 10 * 1024 * 1024;

      return (!isImage && !isVideo) || file.size > maxSize;
    });

    if (invalidFile) {
      setSubmitError(
        "Images must be under 10MB and videos under 100MB."
      );
      e.target.value = "";
      return;
    }

    const newMedia = filesToAdd.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      type: file.type.startsWith("video/") ? "video" : "image",
      id: `${file.name}-${file.lastModified}-${Math.random()}`,
    }));

    setSelectedMedia((previous) => [...previous, ...newMedia]);
    setSubmitError("");
    e.target.value = "";
  };

  const removeMedia = (id) => {
    setSelectedMedia((previous) => {
      const media = previous.find((item) => item.id === id);

      if (media) {
        URL.revokeObjectURL(media.preview);
      }

      return previous.filter((item) => item.id !== id);
    });
  };

  const validateStep = () => {
    if (step === 1) {
      if (
        !form.title.trim() ||
        !form.location.trim() ||
        !form.city.trim()
      ) {
        setSubmitError(
          "Please complete the basic property details."
        );
        return false;
      }
    }

    if (step === 2) {
      if (!form.price.trim()) {
        setSubmitError("Please enter the property price.");
        return false;
      }
    }

    if (step === 3) {
      if (!selectedMedia.length) {
        setSubmitError(
          "Please upload at least one property image or video."
        );
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    setSubmitError("");

    if (!validateStep()) return;

    if (step < 4) {
      setStep((previous) => previous + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const previousStep = () => {
    setSubmitError("");

    if (step > 1) {
      setStep((previous) => previous - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const toggleFeature = (field) => {
    setForm((previous) => ({
      ...previous,
      [field]: !previous[field],
    }));
  };

  const submitProperty = async () => {
    setSubmitError("");
    setSubmitSuccess("");

    const token = localStorage.getItem("token");

    if (!token) {
      setSubmitError(
        "Please login as a Seller or Developer first."
      );
      return;
    }

    if (!selectedMedia.length) {
      setSubmitError(
        "Please upload at least one property image or video."
      );
      setStep(3);
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(`${API_URL}/properties`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: form.title.trim(),
          type: form.type,
          location: form.location.trim(),
          city: form.city.trim(),
          price: form.price.trim(),
          price_value: form.price_value
            ? Number(form.price_value)
            : null,
          bedrooms: form.bedrooms
            ? Number(form.bedrooms)
            : null,
          bathrooms: form.bathrooms
            ? Number(form.bathrooms)
            : null,
          area: form.area ? Number(form.area) : null,
          description: form.description.trim(),
          verified: form.verified,
          ready_to_move: form.ready_to_move,
          zero_brokerage: form.zero_brokerage,
        }),
      });

      let data = {};

      try {
        data = await response.json();
      } catch {
        throw new Error(
          `Server returned an invalid response (${response.status}).`
        );
      }

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create property."
        );
      }

      if (!data.property?.id) {
        throw new Error(
          "Property was created, but no property ID was returned."
        );
      }

      const propertyId = data.property.id;

      for (const media of selectedMedia) {
        const mediaFormData = new FormData();
        mediaFormData.append("media", media.file);

        const uploadResponse = await fetch(
          `${API_URL}/upload/property/${propertyId}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: mediaFormData,
          }
        );

        const responseText = await uploadResponse.text();

        let uploadData = {};

        try {
          uploadData = JSON.parse(responseText);
        } catch {
          throw new Error(
            `Upload server returned an invalid response (${uploadResponse.status}).`
          );
        }

        if (!uploadResponse.ok) {
          throw new Error(
            uploadData.message ||
              "Failed to upload property media."
          );
        }
      }

      setSubmitSuccess(
        "Property submitted successfully for admin approval."
      );

      setTimeout(() => {
        navigate("/properties");
      }, 1200);
    } catch (error) {
      console.error("Property submission error:", error);

      if (
        error instanceof TypeError &&
        error.message === "Failed to fetch"
      ) {
        setSubmitError(
          "Unable to connect to the Xevoprop server. Please check your internet connection or try again."
        );
      } else {
        setSubmitError(
          error.message || "Unable to list property."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    {
      number: 1,
      title: "Property Category",
      description: "Property basics",
    },
    {
      number: 2,
      title: "Pricing & Specs",
      description: "Price and dimensions",
    },
    {
      number: 3,
      title: "Media & Description",
      description: "Photos, video & copy",
    },
    {
      number: 4,
      title: "Verification & Publish",
      description: "Legal details & submission",
    },
  ];

  const priceDisplay = form.price || "₹ —";
  const areaDisplay = form.area
    ? `${Number(form.area).toLocaleString("en-IN")} sq.ft`
    : "— sq.ft";

  const renderStepOne = () => (
    <section className="listing-card">
      <div className="card-heading">
        <div className="card-heading-icon">
          <Building2 size={18} />
        </div>

        <div>
          <span className="eyebrow">STEP 01</span>
          <h2>Property Category & Title</h2>
          <p>
            Start with the basic identity and location of your
            property.
          </p>
        </div>

        <button
          type="button"
          className="edit-button"
          onClick={() => setStep(1)}
        >
          <Pencil size={13} />
          Edit
        </button>
      </div>

      <div className="field-grid">
        <div className="field full">
          <label>PROPERTY TITLE</label>
          <input
            type="text"
            name="title"
            placeholder="Premium 3 BHK Apartment"
            value={form.title}
            onChange={handleChange}
          />
        </div>

        <div className="field">
          <label>PROPERTY TYPE</label>
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
          >
            <option value="Apartment">Apartment</option>
            <option value="Villa">Villa</option>
            <option value="Independent House">
              Independent House
            </option>
            <option value="Plot">Plot</option>
            <option value="Commercial">Commercial</option>
          </select>
        </div>

        <div className="field">
          <label>CITY</label>
          <div className="input-icon">
            <MapPin size={16} />
            <input
              type="text"
              name="city"
              placeholder="Bengaluru"
              value={form.city}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="field full">
          <label>MICRO-MARKET / LOCATION</label>
          <div className="input-icon">
            <MapPin size={16} />
            <input
              type="text"
              name="location"
              placeholder="Indiranagar, Bengaluru"
              value={form.location}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>
    </section>
  );

  const renderStepTwo = () => (
    <section className="listing-card">
      <div className="card-heading">
        <div className="card-heading-icon">
          <IndianRupee size={18} />
        </div>

        <div>
          <span className="eyebrow">STEP 02</span>
          <h2>Valuation & Dimension Blueprint</h2>
          <p>
            Add the pricing and specifications buyers need.
          </p>
        </div>

        <button
          type="button"
          className="edit-button"
          onClick={() => setStep(2)}
        >
          <Pencil size={13} />
          Edit
        </button>
      </div>

      <div className="field-grid">
        <div className="field">
          <label>DISPLAY PRICE</label>
          <div className="input-icon">
            <IndianRupee size={16} />
            <input
              type="text"
              name="price"
              placeholder="₹4.85 Cr"
              value={form.price}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="field">
          <label>PRICE VALUE</label>
          <input
            type="number"
            name="price_value"
            placeholder="48500000"
            value={form.price_value}
            onChange={handleChange}
          />
        </div>

        <div className="field">
          <label>BEDROOMS</label>
          <input
            type="number"
            min="0"
            name="bedrooms"
            placeholder="4"
            value={form.bedrooms}
            onChange={handleChange}
          />
        </div>

        <div className="field">
          <label>BATHROOMS</label>
          <input
            type="number"
            min="0"
            name="bathrooms"
            placeholder="4"
            value={form.bathrooms}
            onChange={handleChange}
          />
        </div>

        <div className="field">
          <label>SUPER AREA (SQ.FT)</label>
          <input
            type="number"
            min="0"
            name="area"
            placeholder="3450"
            value={form.area}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="blueprint-preview">
        <div>
          <span>LISTING SNAPSHOT</span>
          <strong>{priceDisplay}</strong>
        </div>
        <div>
          <BedDouble size={17} />
          <b>{form.bedrooms || "—"} BHK</b>
        </div>
        <div>
          <Bath size={17} />
          <b>{form.bathrooms || "—"} Baths</b>
        </div>
        <div>
          <Ruler size={17} />
          <b>{areaDisplay}</b>
        </div>
      </div>
    </section>
  );

  const renderStepThree = () => (
    <div className="design-workspace">
      <div className="workspace-main">
        <section className="listing-card media-card">
          <div className="card-heading">
            <div className="card-heading-icon">
              <ImageIcon size={18} />
            </div>

            <div>
              <span className="eyebrow">STEP 03 · ACTIVE</span>
              <h2>High-Res Photography & Walkthrough Tour</h2>
              <p>
                Upload the visual assets buyers need to understand
                the property.
              </p>
            </div>

            <span className="upload-count">
              {selectedMedia.length}/10 uploaded
            </span>
          </div>

          <div
            className="upload-zone"
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                fileInputRef.current?.click();
              }
            }}
          >
            <div className="upload-icon">
              <UploadCloud size={25} />
            </div>

            <strong>
              Drag & drop asset files here, or{" "}
              <span>browse computer</span>
            </strong>

            <p>
              Images: High-quality JPG, PNG, WEBP · Max 10MB
              <br />
              Walkthrough Video: MP4, WEBM, MOV · Max 100MB
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handleMediaSelect}
              onClick={(e) => e.stopPropagation()}
            />

            <div className="upload-rules">
              <span>✓ Drone aerial shots accepted</span>
              <span>✓ Architectural blueprints allowed</span>
              <span>✓ Automated watermark removal</span>
            </div>
          </div>

          {selectedMedia.length > 0 && (
            <div className="gallery-block">
              <div className="gallery-header">
                <span>UPLOADED GALLERY ASSETS</span>
                <small>Drag to re-order sequence</small>
                <span>Primary cover photo marked</span>
              </div>

              <div className="uploaded-media">
                {selectedMedia.map((media, index) => (
                  <div
                    className={`uploaded-media-item ${
                      index === 0 && media.type === "image"
                        ? "featured-media"
                        : ""
                    }`}
                    key={media.id}
                  >
                    {media.type === "image" ? (
                      <img
                        src={media.preview}
                        alt={`Property ${index + 1}`}
                      />
                    ) : (
                      <video
                        src={media.preview}
                        controls
                        preload="metadata"
                      />
                    )}

                    {index === 0 && media.type === "image" && (
                      <span className="media-badge">COVER</span>
                    )}

                    {media.type === "video" && (
                      <span className="media-badge video">
                        VIDEO
                      </span>
                    )}

                    <button
                      type="button"
                      aria-label="Remove media"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeMedia(media.id);
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="listing-tip">
            <Sparkles size={18} />
            <div>
              <strong>Xevoprop Intelligence Velocity Tip</strong>
              <p>
                Listings with a verified 4K walkthrough video and
                high-resolution spatial floor plan receive stronger
                discovery potential from qualified buyers.
              </p>
            </div>
          </div>

          <div className="field description-field">
            <label>CURATED PROPERTY ARCHITECTURAL NARRATIVE & DESCRIPTION</label>
            <textarea
              rows="7"
              name="description"
              placeholder="Describe the property, its location, nearby landmarks, amenities, condition and other details buyers should know..."
              value={form.description}
              onChange={handleChange}
            />
            <div className="character-count">
              {form.description.length} / 2,000 characters
            </div>
          </div>
        </section>

        <section className="listing-card">
          <div className="card-heading">
            <div className="card-heading-icon success-icon">
              <ShieldCheck size={18} />
            </div>

            <div>
              <span className="eyebrow">STEP 04 · READY</span>
              <h2>Property Features & Trust Sanctions</h2>
              <p>
                Toggle the attributes that are applicable to this
                listing.
              </p>
            </div>

            <span className="ready-label">Ready for Title Review</span>
          </div>

          <div className="trust-options">
            <button
              type="button"
              className={`trust-option ${
                form.verified ? "active" : ""
              }`}
              onClick={() => toggleFeature("verified")}
            >
              <span>
                {form.verified ? <Check size={14} /> : ""}
              </span>
              <div>
                <strong>Verified Title Deed</strong>
                <small>K-RE&A Registered</small>
              </div>
            </button>

            <button
              type="button"
              className={`trust-option ${
                form.ready_to_move ? "active" : ""
              }`}
              onClick={() => toggleFeature("ready_to_move")}
            >
              <span>
                {form.ready_to_move ? <Check size={14} /> : ""}
              </span>
              <div>
                <strong>Ready to Move</strong>
                <small>Immediate possession</small>
              </div>
            </button>

            <button
              type="button"
              className={`trust-option ${
                form.zero_brokerage ? "active" : ""
              }`}
              onClick={() => toggleFeature("zero_brokerage")}
            >
              <span>
                {form.zero_brokerage ? <Check size={14} /> : ""}
              </span>
              <div>
                <strong>Zero Brokerage</strong>
                <small>Direct Owner listing</small>
              </div>
            </button>
          </div>

          <div className="amenity-heading">
            <div>
              <span>SELECTED LUXURY SPEC AMENITIES</span>
            </div>
            <button type="button">
              <Plus size={13} />
              Add Amenity
            </button>
          </div>

          <div className="amenity-tags">
            <span>✦ Private Sky Plunge Pool</span>
            <span>⚡ 3× Dedicated EV Chargers</span>
            <span>◈ 24/7 Valet & Concierge</span>
            <span>◉ Biometric Elevator</span>
            <span>☼ 100% Vast Compliant East Entry</span>
          </div>
        </section>
      </div>

      <aside className="workspace-sidebar">
        <div className="audit-card">
          <div className="sidebar-card-head">
            <span>LISTING AUDIT ENGINE</span>
            <b>Grade A+</b>
          </div>

          <div className="audit-score">
            <div className="score-circle">
              <strong>94</strong>
              <small>OUT OF 100</small>
            </div>

            <div>
              <h3>Exceptional Score</h3>
              <p>
                Your listing qualifies for premium homepage
                features status upon title document approval.
              </p>
            </div>
          </div>

          <ul className="audit-list">
            <li>
              <CheckCircle2 size={14} />
              High-Resolution Media Uploaded
              <strong>+30 pts</strong>
            </li>
            <li>
              <CheckCircle2 size={14} />
              K-RERA & Khata Proof Uploaded
              <strong>+25 pts</strong>
            </li>
            <li>
              <CheckCircle2 size={14} />
              Precise Geotagged Coordinates
              <strong>+20 pts</strong>
            </li>
            <li>
              <CheckCircle2 size={14} />
              Curated Architectural Specs
              <strong>+19 pts</strong>
            </li>
            <li className="pending">
              <Clock3 size={14} />
              Virtual 3D Matterport Scan
              <strong>+6 pts pending</strong>
            </li>
          </ul>
        </div>

        <div className="reach-card">
          <div className="sidebar-card-head">
            <span>PROJECTED DISCOVERY REACH</span>
            <TrendingUp size={15} />
          </div>

          <div className="reach-main">
            <span>Indiranagar Active Buyers</span>
            <strong>14,820+</strong>
            <div className="reach-bar">
              <i />
            </div>
            <small>
              High search concentration in budget band{" "}
              {priceDisplay}.
            </small>
          </div>

          <div className="reach-stats">
            <div>
              <span>AVG RESPONSE TIME</span>
              <strong>3.8 Hours</strong>
              <small>92% faster than portal avg.</small>
            </div>
            <div>
              <span>INQUIRIES</span>
              <strong>41% Share</strong>
              <small>of US & Bay Area</small>
            </div>
          </div>
        </div>

        <div className="partner-card">
          <div className="partner-avatar">VK</div>
          <div className="partner-copy">
            <span>DEDICATED LISTING PARTNER</span>
            <strong>Vikramaditya Rao</strong>
            <small>Senior PropTech Advisor · Bengaluru</small>
          </div>

          <p>
            Need help pricing your apartment, requesting an
            onsite architectural photographer, or completing
            RERA filings?
          </p>

          <button type="button" className="whatsapp-button">
            <MessageCircle size={15} />
            Instant WhatsApp Concierge
          </button>

          <button type="button" className="call-button">
            <Phone size={14} />
            Schedule Call (+91 8092 8800)
          </button>
        </div>

        <div className="spam-card">
          <ShieldCheck size={18} />
          <div>
            <strong>Zero Spam Guarantee</strong>
            <p>
              Your phone number remains masked. Buyers only
              contact you through verified tokenized channels.
            </p>
          </div>
        </div>
      </aside>
    </div>
  );

  const renderStepFour = () => (
    <section className="listing-card review-card">
      <div className="card-heading">
        <div className="card-heading-icon success-icon">
          <FileCheck2 size={18} />
        </div>

        <div>
          <span className="eyebrow">STEP 04</span>
          <h2>Review & Publish</h2>
          <p>
            Review your listing before submitting it for admin
            approval.
          </p>
        </div>
      </div>

      {selectedMedia.length > 0 && (
        <div className="review-gallery">
          <div className="review-cover">
            {selectedMedia[0].type === "image" ? (
              <img
                src={selectedMedia[0].preview}
                alt="Property cover"
              />
            ) : (
              <video
                src={selectedMedia[0].preview}
                controls
              />
            )}
          </div>

          <div className="review-thumbnails">
            {selectedMedia.slice(1, 5).map((media) => (
              <div className="review-thumbnail" key={media.id}>
                {media.type === "image" ? (
                  <img src={media.preview} alt="Property" />
                ) : (
                  <video
                    src={media.preview}
                    muted
                    preload="metadata"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="review-top">
        <div>
          <span className="property-type-badge">{form.type}</span>
          <h2>{form.title || "Property Title"}</h2>
          <p>
            <MapPin size={15} />
            {form.location || "Property location"}
          </p>
        </div>

        <strong>{form.price || "Price on request"}</strong>
      </div>

      <div className="review-stats">
        <div>
          <BedDouble size={17} />
          <strong>{form.bedrooms || "—"}</strong>
          <span>Bedrooms</span>
        </div>
        <div>
          <Bath size={17} />
          <strong>{form.bathrooms || "—"}</strong>
          <span>Bathrooms</span>
        </div>
        <div>
          <Ruler size={17} />
          <strong>{form.area || "—"}</strong>
          <span>Sq. Ft.</span>
        </div>
        <div>
          <Wallet size={17} />
          <strong>{form.price_value || "—"}</strong>
          <span>Price value</span>
        </div>
      </div>

      <div className="review-description">
        <span>PROPERTY DESCRIPTION</span>
        <p>
          {form.description || "No description provided."}
        </p>
      </div>

      <div className="review-features">
        <span
          className={form.verified ? "selected" : ""}
        >
          <Check size={13} />
          Verified Property
        </span>
        <span
          className={form.ready_to_move ? "selected" : ""}
        >
          <Check size={13} />
          Ready to Move
        </span>
        <span
          className={form.zero_brokerage ? "selected" : ""}
        >
          <Check size={13} />
          Zero Brokerage
        </span>
      </div>

      {submitError && (
        <div className="listing-message error">
          <span>!</span>
          {submitError}
        </div>
      )}

      {submitSuccess && (
        <div className="listing-message success">
          <span>
            <Check size={14} />
          </span>
          {submitSuccess}
        </div>
      )}
    </section>
  );

  return (
    <div className="list-property-page">

      <div className="listing-page-shell">
        <div className="listing-breadcrumb">
          <button
            type="button"
            onClick={() => navigate("/properties")}
          >
            <ArrowLeft size={14} />
            Back to properties
          </button>

          <span>
            <i />
            SELL / LIST PROPERTY
          </span>

          <div className="trust-pills">
            <span>✓ 100% RERA Compliant</span>
            <span>✓ HNW Buyer Matching</span>
            <span>✓ Encrypted Title Submission</span>
          </div>
        </div>

        <section className="listing-intro">
          <div>
            <span className="intro-kicker">SELL WITH XEVOPROP</span>
            <h1>List your property</h1>
            <p>
              Reach verified luxury buyers, institutional investors,
              and corporate tenants without sacrificing trust,
              transparency, or validation.
            </p>
          </div>

          <div className="completion">
            <span>TARGET COMPLETION</span>
            <strong>
              Step {step} of 4
              <em>{Math.round((step / 4) * 100)}%</em>
            </strong>
          </div>
        </section>

        <div className="stepper">
          {steps.map((item) => {
            const isCompleted = item.number < step;
            const isActive = item.number === step;

            return (
              <button
                type="button"
                key={item.number}
                className={`step-item ${
                  isActive ? "active" : ""
                } ${isCompleted ? "completed" : ""}`}
                onClick={() => {
                  if (item.number <= step) {
                    setSubmitError("");
                    setStep(item.number);
                  }
                }}
              >
                <span className="step-number">
                  {isCompleted ? (
                    <Check size={13} />
                  ) : (
                    item.number
                  )}
                </span>

                <span className="step-copy">
                  <strong>
                    STEP {String(item.number).padStart(2, "0")}{" "}
                    {isActive ? "· ACTIVE" : ""}
                  </strong>
                  <b>{item.title}</b>
                  <small>{item.description}</small>
                </span>
              </button>
            );
          })}
        </div>

        {step === 1 && renderStepOne()}
        {step === 2 && renderStepTwo()}
        {step === 3 && renderStepThree()}
        {step === 4 && renderStepFour()}

        <div className="listing-navigation">
          {step > 1 ? (
            <button
              type="button"
              className="previous-button"
              onClick={previousStep}
            >
              <ArrowLeft size={15} />
              Previous Step
            </button>
          ) : (
            <button
              type="button"
              className="previous-button"
              onClick={() => navigate("/properties")}
            >
              <ArrowLeft size={15} />
              Back to Properties
            </button>
          )}

          <div className="navigation-meta">
            <ShieldCheck size={15} />
            Your information is encrypted and submitted for
            Xevoprop verification.
          </div>

          {step < 4 ? (
            <button
              type="button"
              className="continue-button"
              onClick={handleNext}
            >
              Continue to Step {step + 1}
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              className="continue-button publish-button"
              onClick={submitProperty}
              disabled={submitting}
            >
              {submitting
                ? "Submitting..."
                : "Submit Property for Review"}
              {!submitting && <Check size={16} />}
            </button>
          )}
        </div>

        <footer className="listing-footer">
          <div className="footer-brand">
            <div className="footer-brand-title">
              <div className="brand-mark">X</div>
              <strong>XEVOPROP</strong>
            </div>
            <p>
              India's high-integrity proptech platform for verified
              luxury residences, commercial portfolios, and vetted
              new property developments.
            </p>
            <span>◉ 100% Title-Verified Listings & RERA Audited</span>
          </div>

          <div>
            <strong>POPULAR LOCALITIES</strong>
            <p>Whitefield, Bengaluru</p>
            <p>Worli, Mumbai</p>
            <p>Indiranagar, Bengaluru</p>
            <p>Golf Course Road, Gurugram</p>
            <p>BKC, Mumbai</p>
          </div>

          <div>
            <strong>PROPERTY TYPES</strong>
            <p>Luxury Gated Penthouses</p>
            <p>RERA Verified Apartments</p>
            <p>Grade-A Commercial Suites</p>
            <p>Exclusive Villa Communities</p>
            <p>Pre-Launch Expressions</p>
          </div>

          <div>
            <strong>COMPANY & TRUST</strong>
            <p>Verified Protocol</p>
            <p>RERA Compliance Cell</p>
            <p>Legal Title Due Diligence</p>
            <p>About Xevoprop</p>
            <p>Institutional Advisory</p>
          </div>

          <div className="footer-bottom">
            <span>© 2025 Xevoprop Technologies Pvt. Ltd. All rights reserved.</span>
            <div>
              <span>Terms of Service</span>
              <span>Privacy Policy</span>
              <span>RERA Disclosures</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default ListProperty;
