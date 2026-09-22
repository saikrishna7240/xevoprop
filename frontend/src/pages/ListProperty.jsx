import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  Home,
  Image as ImageIcon,
  IndianRupee,
  MapPin,
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

  /* =========================================================
     INPUT CHANGE
     ========================================================= */

  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  /* =========================================================
     MEDIA SELECT
     ========================================================= */

  const handleMediaSelect = (e) => {
    const files = Array.from(
      e.target.files || []
    );

    if (!files.length) {
      return;
    }

    const remainingSlots =
      10 - selectedMedia.length;

    if (remainingSlots <= 0) {
      setSubmitError(
        "You can upload a maximum of 10 media files."
      );

      e.target.value = "";
      return;
    }

    const filesToAdd = files.slice(
      0,
      remainingSlots
    );

    const invalidFile = filesToAdd.find(
      (file) => {
        const isImage =
          file.type.startsWith("image/");

        const isVideo =
          file.type.startsWith("video/");

        const maxSize = isVideo
          ? 100 * 1024 * 1024
          : 10 * 1024 * 1024;

        return (
          (!isImage && !isVideo) ||
          file.size > maxSize
        );
      }
    );

    if (invalidFile) {
      setSubmitError(
        "Images must be under 10MB and videos under 100MB."
      );

      e.target.value = "";
      return;
    }

    const newMedia =
      filesToAdd.map((file) => ({
        file,

        preview:
          URL.createObjectURL(file),

        type:
          file.type.startsWith("video/")
            ? "video"
            : "image",

        id: `${file.name}-${file.lastModified}-${Math.random()}`,
      }));

    setSelectedMedia((previous) => [
      ...previous,
      ...newMedia,
    ]);

    setSubmitError("");

    e.target.value = "";
  };

  /* =========================================================
     REMOVE MEDIA
     ========================================================= */

  const removeMedia = (id) => {
    setSelectedMedia((previous) => {
      const media = previous.find(
        (item) => item.id === id
      );

      if (media) {
        URL.revokeObjectURL(
          media.preview
        );
      }

      return previous.filter(
        (item) => item.id !== id
      );
    });
  };

  /* =========================================================
     STEP VALIDATION
     ========================================================= */

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
        setSubmitError(
          "Please enter the property price."
        );

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

  /* =========================================================
     NEXT STEP
     ========================================================= */

  const handleNext = () => {
    setSubmitError("");

    if (!validateStep()) {
      return;
    }

    if (step < 4) {
      setStep(
        (previous) => previous + 1
      );
    }
  };

  /* =========================================================
     PREVIOUS STEP
     ========================================================= */

  const previousStep = () => {
    setSubmitError("");

    if (step > 1) {
      setStep(
        (previous) => previous - 1
      );
    }
  };

  /* =========================================================
     TOGGLE FEATURE
     ========================================================= */

  const toggleFeature = (field) => {
    setForm((previous) => ({
      ...previous,
      [field]: !previous[field],
    }));
  };

  /* =========================================================
     SUBMIT PROPERTY
     ========================================================= */

  const submitProperty = async () => {
    setSubmitError("");
    setSubmitSuccess("");

    const token =
      localStorage.getItem("token");

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

      /* =====================================================
         CREATE PROPERTY
      ===================================================== */

      const response = await fetch(
        `${API_URL}/properties`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            title:
              form.title.trim(),

            type:
              form.type,

            location:
              form.location.trim(),

            city:
              form.city.trim(),

            price:
              form.price.trim(),

            price_value:
              form.price_value
                ? Number(
                    form.price_value
                  )
                : null,

            bedrooms:
              form.bedrooms
                ? Number(
                    form.bedrooms
                  )
                : null,

            bathrooms:
              form.bathrooms
                ? Number(
                    form.bathrooms
                  )
                : null,

            area:
              form.area
                ? Number(
                    form.area
                  )
                : null,

            description:
              form.description.trim(),

            verified:
              form.verified,

            ready_to_move:
              form.ready_to_move,

            zero_brokerage:
              form.zero_brokerage,
          }),
        }
      );

      let data = {};

      try {
        data =
          await response.json();
      } catch {
        throw new Error(
          `Server returned an invalid response (${response.status}).`
        );
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to create property."
        );
      }

      if (!data.property?.id) {
        throw new Error(
          "Property was created, but no property ID was returned."
        );
      }

      const propertyId =
        data.property.id;

      console.log(
        "PROPERTY CREATED:",
        propertyId
      );

      /* =====================================================
         UPLOAD IMAGES / VIDEOS
      ===================================================== */

      for (
        const media of selectedMedia
      ) {
        const mediaFormData =
          new FormData();

        mediaFormData.append(
          "media",
          media.file
        );

        const uploadResponse =
          await fetch(
            `${API_URL}/upload/property/${propertyId}`,
            {
              method: "POST",

              headers: {
                Authorization:
                  `Bearer ${token}`,
              },

              body:
                mediaFormData,
            }
          );

        const responseText =
          await uploadResponse.text();

        console.log(
          "MEDIA UPLOAD STATUS:",
          uploadResponse.status
        );

        console.log(
          "MEDIA UPLOAD RESPONSE:",
          responseText
        );

        let uploadData = {};

        try {
          uploadData =
            JSON.parse(
              responseText
            );
        } catch {
          throw new Error(
            `Upload server returned an invalid response (${uploadResponse.status}).`
          );
        }

        if (
          !uploadResponse.ok
        ) {
          throw new Error(
            uploadData.message ||
              "Failed to upload property media."
          );
        }
      }

      /* =====================================================
         SUCCESS
      ===================================================== */

      setSubmitSuccess(
        "Property submitted successfully for admin approval."
      );

      setTimeout(() => {
        navigate("/properties");
      }, 1200);

    } catch (error) {
      console.error(
        "Property submission error:",
        error
      );

      if (
        error instanceof TypeError &&
        error.message ===
          "Failed to fetch"
      ) {
        setSubmitError(
          "Unable to connect to the Xevoprop server. Please check your internet connection or try again."
        );
      } else {
        setSubmitError(
          error.message ||
            "Unable to list property."
        );
      }

    } finally {
      setSubmitting(false);
    }
  };

  /* =========================================================
     STEP 1
     ========================================================= */

  const renderStepOne = () => (
    <div className="listing-card">

      <div className="listing-section-heading">

        <div className="section-icon">
          <Home size={20} />
        </div>

        <div>
          <span className="section-eyebrow">
            STEP 01
          </span>

          <h2>
            Property Information
          </h2>

          <p>
            Start with the essential information about
            your property.
          </p>
        </div>

      </div>

      <div className="listing-fields">

        <div className="listing-field full">

          <label>
            PROPERTY TITLE
          </label>

          <input
            type="text"
            name="title"
            placeholder="Premium 3 BHK Apartment"
            value={form.title}
            onChange={handleChange}
          />

        </div>

        <div className="listing-field">

          <label>
            PROPERTY TYPE
          </label>

          <select
            name="type"
            value={form.type}
            onChange={handleChange}
          >
            <option value="Apartment">
              Apartment
            </option>

            <option value="Villa">
              Villa
            </option>

            <option value="Independent House">
              Independent House
            </option>

            <option value="Plot">
              Plot
            </option>

            <option value="Commercial">
              Commercial
            </option>
          </select>

        </div>

        <div className="listing-field">

          <label>
            CITY
          </label>

          <div className="input-with-icon">

            <MapPin size={17} />

            <input
              type="text"
              name="city"
              placeholder="Hyderabad"
              value={form.city}
              onChange={handleChange}
            />

          </div>

        </div>

        <div className="listing-field full">

          <label>
            LOCATION
          </label>

          <div className="input-with-icon">

            <MapPin size={17} />

            <input
              type="text"
              name="location"
              placeholder="Gachibowli, Hyderabad"
              value={form.location}
              onChange={handleChange}
            />

          </div>

        </div>

      </div>

    </div>
  );

  /* =========================================================
     STEP 2
     ========================================================= */

  const renderStepTwo = () => (
    <div className="listing-card">

      <div className="listing-section-heading">

        <div className="section-icon">
          <IndianRupee size={20} />
        </div>

        <div>
          <span className="section-eyebrow">
            STEP 02
          </span>

          <h2>
            Price & Property Details
          </h2>

          <p>
            Add pricing and specifications buyers need.
          </p>
        </div>

      </div>

      <div className="listing-fields">

        <div className="listing-field">

          <label>
            DISPLAY PRICE
          </label>

          <div className="input-with-icon">

            <IndianRupee size={17} />

            <input
              type="text"
              name="price"
              placeholder="₹1.25 Cr"
              value={form.price}
              onChange={handleChange}
            />

          </div>

        </div>

        <div className="listing-field">

          <label>
            PRICE VALUE
          </label>

          <input
            type="number"
            name="price_value"
            placeholder="12500000"
            value={form.price_value}
            onChange={handleChange}
          />

        </div>

        <div className="listing-field">

          <label>
            BEDROOMS
          </label>

          <input
            type="number"
            min="0"
            name="bedrooms"
            placeholder="3"
            value={form.bedrooms}
            onChange={handleChange}
          />

        </div>

        <div className="listing-field">

          <label>
            BATHROOMS
          </label>

          <input
            type="number"
            min="0"
            name="bathrooms"
            placeholder="3"
            value={form.bathrooms}
            onChange={handleChange}
          />

        </div>

        <div className="listing-field">

          <label>
            AREA (SQ.FT)
          </label>

          <input
            type="number"
            min="0"
            name="area"
            placeholder="1850"
            value={form.area}
            onChange={handleChange}
          />

        </div>

      </div>

    </div>
  );

  /* =========================================================
     STEP 3
     ========================================================= */

  const renderStepThree = () => (
    <div className="listing-card">

      <div className="listing-section-heading">

        <div className="section-icon">
          <ImageIcon size={20} />
        </div>

        <div>
          <span className="section-eyebrow">
            STEP 03
          </span>

          <h2>
            Property Media
          </h2>

          <p>
            Showcase your property with photos and videos.
          </p>
        </div>

      </div>

      <div className="listing-fields">

        <div className="listing-field full">

          <div className="upload-heading">

            <label>
              PHOTOS & VIDEOS
            </label>

            <span>
              {selectedMedia.length}/10 selected
            </span>

          </div>

          <div
            className="upload-area"
            onClick={() =>
              fileInputRef.current?.click()
            }
          >

            <div className="upload-icon">
              <ImageIcon size={27} />
            </div>

            <strong>
              Add property photos & videos
            </strong>

            <span>
              Click to browse your device
            </span>

            <small>
              Images: JPG, PNG, WEBP · Max 10MB
              <br />
              Videos: MP4, WEBM, MOV · Max 100MB
            </small>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handleMediaSelect}
              onClick={(e) =>
                e.stopPropagation()
              }
            />

          </div>

        </div>

        {selectedMedia.length > 0 && (
          <div className="uploaded-media">

            {selectedMedia.map(
              (media, index) => (
                <div
                  className={`uploaded-media-item ${
                    index === 0 &&
                    media.type === "image"
                      ? "featured-media"
                      : ""
                  }`}
                  key={media.id}
                >

                  {media.type === "image" ? (
                    <img
                      src={media.preview}
                      alt={`Property ${
                        index + 1
                      }`}
                    />
                  ) : (
                    <video
                      src={media.preview}
                      controls
                      preload="metadata"
                    />
                  )}

                  {index === 0 &&
                    media.type === "image" && (
                      <span className="featured-label">
                        COVER
                      </span>
                    )}

                  {media.type === "video" && (
                    <span className="media-type-label">
                      VIDEO
                    </span>
                  )}

                  <button
                    type="button"
                    aria-label="Remove media"
                    onClick={(e) => {
                      e.stopPropagation();

                      removeMedia(
                        media.id
                      );
                    }}
                  >
                    <X size={15} />
                  </button>

                </div>
              )
            )}

          </div>
        )}

        <div className="media-guidelines">

          <div>
            <strong>
              💡 Listing tip
            </strong>

            <p>
              Add clear exterior, interior and amenity
              photos. A short property walkthrough video
              can help buyers understand the space better.
            </p>
          </div>

        </div>

        <div className="listing-field full">

          <label>
            PROPERTY DESCRIPTION
          </label>

          <textarea
            rows="8"
            name="description"
            placeholder="Describe the property, its location, nearby landmarks, amenities, condition and other details buyers should know..."
            value={form.description}
            onChange={handleChange}
          />

          <div className="field-helper">
            A detailed description helps buyers understand
            the property better.
          </div>

        </div>

      </div>

    </div>
  );

  /* =========================================================
     STEP 4
     ========================================================= */

  const renderStepFour = () => (
    <div className="listing-card preview-card">

      <div className="listing-section-heading">

        <div className="section-icon">
          <Check size={20} />
        </div>

        <div>
          <span className="section-eyebrow">
            STEP 04
          </span>

          <h2>
            Review & Publish
          </h2>

          <p>
            Review your listing before submitting it for
            approval.
          </p>
        </div>

      </div>

      <div className="preview-content">

        {selectedMedia.length > 0 && (
          <div className="preview-gallery">

            <div className="preview-cover">

              {selectedMedia[0].type ===
              "image" ? (
                <img
                  src={
                    selectedMedia[0].preview
                  }
                  alt="Property cover"
                />
              ) : (
                <video
                  src={
                    selectedMedia[0].preview
                  }
                  controls
                />
              )}

            </div>

            <div className="preview-thumbnails">

              {selectedMedia
                .slice(1, 5)
                .map((media) => (
                  <div
                    className="preview-thumbnail"
                    key={media.id}
                  >

                    {media.type ===
                    "image" ? (
                      <img
                        src={media.preview}
                        alt="Property"
                      />
                    ) : (
                      <video
                        src={media.preview}
                        muted
                        preload="metadata"
                      />
                    )}

                  </div>
                ))}

              {selectedMedia.length > 5 && (
                <div className="preview-more">
                  +{selectedMedia.length - 5}
                </div>
              )}

            </div>

          </div>
        )}

        <div className="preview-top">

          <div className="preview-main-info">

            <span className="preview-type">
              {form.type}
            </span>

            <h2>
              {form.title ||
                "Property Title"}
            </h2>

            <div className="preview-location">

              <MapPin size={16} />

              <span>
                {form.location ||
                  "Property location"}
              </span>

            </div>

          </div>

          <div className="preview-price">
            {form.price ||
              "Price on request"}
          </div>

        </div>

        <div className="preview-stats">

          <div className="preview-stat">
            <strong>
              {form.bedrooms || "—"}
            </strong>

            <span>
              Bedrooms
            </span>
          </div>

          <div className="preview-stat">
            <strong>
              {form.bathrooms || "—"}
            </strong>

            <span>
              Bathrooms
            </span>
          </div>

          <div className="preview-stat">
            <strong>
              {form.area || "—"}
            </strong>

            <span>
              Sq. Ft.
            </span>
          </div>

        </div>

        <div className="preview-description">

          <h3>
            About this property
          </h3>

          <p>
            {form.description ||
              "No description provided."}
          </p>

        </div>

        <div className="amenities-section">

          <div className="feature-heading">

            <div>
              <label>
                PROPERTY FEATURES
              </label>

              <p>
                Highlight the important selling points.
              </p>
            </div>

          </div>

          <div className="listing-amenities">

            <button
              type="button"
              className={
                form.verified
                  ? "amenity-option active"
                  : "amenity-option"
              }
              onClick={() =>
                toggleFeature(
                  "verified"
                )
              }
            >

              <span>
                {form.verified && (
                  <Check size={13} />
                )}
              </span>

              Verified Property

            </button>

            <button
              type="button"
              className={
                form.ready_to_move
                  ? "amenity-option active"
                  : "amenity-option"
              }
              onClick={() =>
                toggleFeature(
                  "ready_to_move"
                )
              }
            >

              <span>
                {form.ready_to_move && (
                  <Check size={13} />
                )}
              </span>

              Ready to Move

            </button>

            <button
              type="button"
              className={
                form.zero_brokerage
                  ? "amenity-option active"
                  : "amenity-option"
              }
              onClick={() =>
                toggleFeature(
                  "zero_brokerage"
                )
              }
            >

              <span>
                {form.zero_brokerage && (
                  <Check size={13} />
                )}
              </span>

              Zero Brokerage

            </button>

          </div>

        </div>

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

    </div>
  );

  /* =========================================================
     MAIN
     ========================================================= */

  const steps = [
    "Property",
    "Details",
    "Media",
    "Publish",
  ];

  return (
    <div className="list-property-page">

      <div className="list-property-container">

        {/* HEADER */}

        <header className="listing-header">

          <button
            className="listing-back"
            type="button"
            onClick={() =>
              navigate("/properties")
            }
          >
            <ArrowLeft size={16} />
            Back to properties
          </button>

          <div className="listing-kicker">
            <span />
            SELL / LIST PROPERTY
          </div>

          <h1>
            List your property
          </h1>

          <p>
            Reach verified buyers and showcase your
            property on Xevoprop.
          </p>

        </header>

        {/* PROGRESS */}

        <div className="listing-progress">

          {steps.map(
            (label, index) => {
              const number =
                index + 1;

              const isCompleted =
                number < step;

              const isActive =
                number === step;

              return (
                <div
                  key={label}
                  className={`progress-item ${
                    isActive
                      ? "active"
                      : ""
                  } ${
                    isCompleted
                      ? "completed"
                      : ""
                  }`}
                >

                  <div className="progress-number">

                    {isCompleted ? (
                      <Check size={14} />
                    ) : (
                      number
                    )}

                  </div>

                  <div className="progress-copy">

                    <span>
                      {label}
                    </span>

                    <small>
                      {isCompleted
                        ? "Completed"
                        : isActive
                        ? "Current step"
                        : `Step ${number}`}
                    </small>

                  </div>

                </div>
              );
            }
          )}

        </div>

        {/* CURRENT STEP */}

        {step === 1 &&
          renderStepOne()}

        {step === 2 &&
          renderStepTwo()}

        {step === 3 &&
          renderStepThree()}

        {step === 4 &&
          renderStepFour()}

        {/* NAVIGATION */}

        <div className="listing-navigation">

          {step > 1 ? (
            <button
              type="button"
              className="listing-prev"
              onClick={
                previousStep
              }
            >
              <ArrowLeft size={16} />

              Previous
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              className="listing-next"
              onClick={handleNext}
            >
              Continue

              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              className="listing-next"
              onClick={
                submitProperty
              }
              disabled={submitting}
            >
              {submitting
                ? "Submitting..."
                : "Submit Property"}

              {!submitting && (
                <Check size={16} />
              )}
            </button>
          )}

        </div>

        <div className="listing-footer-note">
          <span>🔒</span>

          Your property information is securely
          submitted for Xevoprop admin verification.
        </div>

      </div>

    </div>
  );
}

export default ListProperty;