import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  Home,
  MapPin,
  IndianRupee,
  Image as ImageIcon,
  X,
} from "lucide-react";

import "./ListProperty.css";

function ListProperty() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  const fileInputRef = useRef(null);

  const [selectedImages, setSelectedImages] =
    useState([]);

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

  const [submitting, setSubmitting] =
    useState(false);

  const [submitError, setSubmitError] =
    useState("");

  const [submitSuccess, setSubmitSuccess] =
    useState("");

  /* =========================
     INPUT CHANGE
  ========================= */

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

  /* =========================
     IMAGE SELECT
  ========================= */

  const handleImageSelect = (e) => {
    const files = Array.from(
      e.target.files || []
    );

    if (files.length === 0) return;

    const remainingSlots =
      10 - selectedImages.length;

    const filesToAdd =
      files.slice(0, remainingSlots);

    const invalidFile =
      filesToAdd.find(
        (file) =>
          !file.type.startsWith("image/") ||
          file.size > 10 * 1024 * 1024
      );

    if (invalidFile) {
      setSubmitError(
        "Only images up to 10MB each are allowed."
      );

      e.target.value = "";
      return;
    }

    const newImages =
      filesToAdd.map((file) => ({
        file,

        preview:
          URL.createObjectURL(file),

        id:
          `${file.name}-${file.lastModified}-${Math.random()}`,
      }));

    setSelectedImages((previous) => [
      ...previous,
      ...newImages,
    ]);

    setSubmitError("");

    e.target.value = "";
  };

  /* =========================
     REMOVE IMAGE
  ========================= */

  const removeImage = (id) => {
    setSelectedImages((previous) => {
      const image = previous.find(
        (item) => item.id === id
      );

      if (image) {
        URL.revokeObjectURL(
          image.preview
        );
      }

      return previous.filter(
        (item) => item.id !== id
      );
    });
  };

  /* =========================
     NEXT
  ========================= */

  const nextStep = () => {
    if (step < 4) {
      setStep(
        (previous) => previous + 1
      );
    }
  };

  /* =========================
     PREVIOUS
  ========================= */

  const previousStep = () => {
    if (step > 1) {
      setStep(
        (previous) => previous - 1
      );
    }
  };

  /* =========================
     VALIDATION
  ========================= */

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
      if (
        selectedImages.length === 0
      ) {
        setSubmitError(
          "Please upload at least one property image."
        );

        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    setSubmitError("");

    if (!validateStep()) {
      return;
    }

    nextStep();
  };

  /* =========================
     SUBMIT PROPERTY
  ========================= */

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

    if (
      selectedImages.length === 0
    ) {
      setSubmitError(
        "Please upload at least one property image."
      );

      setStep(3);

      return;
    }

    try {
      setSubmitting(true);

      /* =========================
         CREATE PROPERTY
      ========================= */

      const response =
        await fetch(
          "https://xevoprop.onrender.com/api/properties",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify({
              title: form.title,
              type: form.type,
              location: form.location,
              city: form.city,

              price: form.price,

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
                  ? Number(form.area)
                  : null,

              description:
                form.description,

              verified:
                form.verified,

              ready_to_move:
                form.ready_to_move,

              zero_brokerage:
                form.zero_brokerage,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to create property"
        );
      }

      const propertyId =
        data.property.id;

      /* =========================
         UPLOAD IMAGES
      ========================= */

      for (
        const image of selectedImages
      ) {
        const imageFormData =
          new FormData();

        imageFormData.append(
          "image",
          image.file
        );

        const uploadResponse =
          await fetch(
            `https://xevoprop.onrender.com/api/upload/property/${propertyId}`,
            {
              method: "POST",

              headers: {
                Authorization:
                  `Bearer ${token}`,
              },

              body:
                imageFormData,
            }
          );

        const responseText =
          await uploadResponse.text();

        console.log(
          "UPLOAD STATUS:",
          uploadResponse.status
        );

        console.log(
          "UPLOAD RESPONSE:",
          responseText
        );

        let uploadData;

        try {
          uploadData =
            JSON.parse(
              responseText
            );
        } catch {
          throw new Error(
            `Upload server returned non-JSON response (${uploadResponse.status})`
          );
        }

        if (
          !uploadResponse.ok
        ) {
          throw new Error(
            uploadData.message ||
              "Failed to upload property image"
          );
        }
      }

      /* =========================
         SUCCESS
      ========================= */

      setSubmitSuccess(
        "Property and images uploaded successfully!"
      );

      setTimeout(() => {
        navigate("/properties");
      }, 1200);

    } catch (error) {
      console.error(
        "Property submission error:",
        error
      );

      setSubmitError(
        error.message ||
          "Unable to list property."
      );

    } finally {
      setSubmitting(false);
    }
  };

  /* =========================
     STEP 1
  ========================= */

  const renderStepOne = () => (
    <div className="listing-card">

      <div className="listing-section-heading">

        <div className="section-icon">
          <Home size={19} />
        </div>

        <div>
          <h2>
            Property Information
          </h2>

          <p>
            Tell buyers about your property.
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

            <MapPin size={15} />

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

            <MapPin size={15} />

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

  /* =========================
     STEP 2
  ========================= */

  const renderStepTwo = () => (
    <div className="listing-card">

      <div className="listing-section-heading">

        <div className="section-icon">
          <IndianRupee size={19} />
        </div>

        <div>

          <h2>
            Price & Details
          </h2>

          <p>
            Add pricing and property specifications.
          </p>

        </div>

      </div>

      <div className="listing-fields">

        <div className="listing-field">

          <label>
            DISPLAY PRICE
          </label>

          <div className="input-with-icon">

            <IndianRupee size={15} />

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

  /* =========================
     STEP 3
  ========================= */

  const renderStepThree = () => (
    <div className="listing-card">

      <div className="listing-section-heading">

        <div className="section-icon">
          <ImageIcon size={19} />
        </div>

        <div>

          <h2>
            Images & Description
          </h2>

          <p>
            Give buyers a better view of your property.
          </p>

        </div>

      </div>

      <div className="listing-fields">

        <div className="listing-field full">

          <label>
            PROPERTY PHOTOS
          </label>

          <div
            className="upload-area"
            onClick={() =>
              fileInputRef.current?.click()
            }
          >

            <ImageIcon size={30} />

            <strong>
              Click to upload property photos
            </strong>

            <span>
              JPG, PNG or WEBP • Up to 10MB each
            </span>

            <span>
              Select up to 10 photos
            </span>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={
                handleImageSelect
              }
              onClick={(e) =>
                e.stopPropagation()
              }
            />

          </div>

        </div>

        {selectedImages.length >
          0 && (
          <div className="uploaded-images">

            {selectedImages.map(
              (image) => (
                <div
                  className="uploaded-image"
                  key={image.id}
                >

                  <img
                    src={image.preview}
                    alt="Property preview"
                  />

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(
                        image.id
                      );
                    }}
                  >
                    <X size={14} />
                  </button>

                </div>
              )
            )}

          </div>
        )}

        <div className="listing-field full">

          <label>
            DESCRIPTION
          </label>

          <textarea
            rows="8"
            name="description"
            placeholder="Describe the property..."
            value={form.description}
            onChange={handleChange}
          />

        </div>

      </div>

    </div>
  );

  /* =========================
     STEP 4
  ========================= */

  const renderStepFour = () => (
    <div className="listing-card preview-card">

      <div className="listing-section-heading">

        <div className="section-icon">
          <Check size={19} />
        </div>

        <div>

          <h2>
            Review & Publish
          </h2>

          <p>
            Check your property before publishing.
          </p>

        </div>

      </div>

      <div className="preview-content">

        {selectedImages.length >
          0 && (
          <div className="uploaded-images">

            {selectedImages.map(
              (image) => (
                <div
                  className="uploaded-image"
                  key={image.id}
                >

                  <img
                    src={image.preview}
                    alt="Property preview"
                  />

                </div>
              )
            )}

          </div>
        )}

        <div className="preview-top">

          <div>

            <span className="preview-type">
              {form.type}
            </span>

            <h2>
              {form.title ||
                "Property Title"}
            </h2>

            <div className="preview-location">

              <MapPin size={14} />

              {form.location ||
                "Property location"}

            </div>

          </div>

          <strong className="preview-price">
            {form.price ||
              "Price on request"}
          </strong>

        </div>

        <div className="preview-stats">

          <div>
            🛏️ {form.bedrooms || "-"} Beds
          </div>

          <div>
            🛁 {form.bathrooms || "-"} Baths
          </div>

          <div>
            📐 {form.area || "-"} sq.ft
          </div>

        </div>

        <div className="preview-description">

          <h3>
            Description
          </h3>

          <p>
            {form.description ||
              "No description provided."}
          </p>

        </div>

        <div className="amenities-section">

          <label>
            PROPERTY FEATURES
          </label>

          <div className="listing-amenities">

            <button
              type="button"
              className={
                form.verified
                  ? "amenity-option active"
                  : "amenity-option"
              }
              onClick={() =>
                setForm(
                  (previous) => ({
                    ...previous,
                    verified:
                      !previous.verified,
                  })
                )
              }
            >
              <span>
                {form.verified && (
                  <Check size={12} />
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
                setForm(
                  (previous) => ({
                    ...previous,
                    ready_to_move:
                      !previous.ready_to_move,
                  })
                )
              }
            >
              <span>
                {form.ready_to_move && (
                  <Check size={12} />
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
                setForm(
                  (previous) => ({
                    ...previous,
                    zero_brokerage:
                      !previous.zero_brokerage,
                  })
                )
              }
            >
              <span>
                {form.zero_brokerage && (
                  <Check size={12} />
                )}
              </span>

              Zero Brokerage
            </button>

          </div>

        </div>

      </div>

      {submitError && (
        <p
          style={{
            marginTop: "18px",
            color: "#ff6b6b",
            fontSize: "10px",
            textAlign: "center",
          }}
        >
          {submitError}
        </p>
      )}

      {submitSuccess && (
        <p
          style={{
            marginTop: "18px",
            color: "#00d9ff",
            fontSize: "10px",
            textAlign: "center",
          }}
        >
          {submitSuccess}
        </p>
      )}

    </div>
  );

  /* =========================
     MAIN
  ========================= */

  return (
    <div className="list-property-page">

      <div className="list-property-container">

        <div className="listing-header">

          <button
            className="listing-back"
            onClick={() =>
              navigate("/properties")
            }
          >
            <ArrowLeft size={13} />
            Back to properties
          </button>

          <span>
            SELL / LIST PROPERTY
          </span>

          <h1>
            List your property
          </h1>

          <p>
            Connect your property with
            verified buyers.
          </p>

        </div>

        <div className="listing-progress">

          {[
            "Property",
            "Details",
            "Media",
            "Publish",
          ].map((label, index) => {

            const number = index + 1;

            return (
              <div
                key={label}
                className={
                  number <= step
                    ? "progress-item active"
                    : "progress-item"
                }
              >

                <div className="progress-number">

                  {number < step ? (
                    <Check size={13} />
                  ) : (
                    number
                  )}

                </div>

                <span>
                  {label}
                </span>

              </div>
            );
          })}

        </div>

        {step === 1 &&
          renderStepOne()}

        {step === 2 &&
          renderStepTwo()}

        {step === 3 &&
          renderStepThree()}

        {step === 4 &&
          renderStepFour()}

        <div className="listing-navigation">

          {step > 1 ? (
            <button
              type="button"
              className="listing-prev"
              onClick={() => {
                setSubmitError("");
                previousStep();
              }}
            >
              <ArrowLeft size={13} />
              Previous
            </button>
          ) : (
            <span />
          )}

          {step < 4 ? (
            <button
              type="button"
              className="listing-next"
              onClick={handleNext}
            >
              Continue
              <ArrowRight size={13} />
            </button>
          ) : (
            <button
              type="button"
              className="listing-next"
              onClick={submitProperty}
              disabled={submitting}
            >
              {submitting
                ? "Publishing..."
                : "Publish Property"}

              {!submitting && (
                <Check size={13} />
              )}
            </button>
          )}

        </div>

      </div>

    </div>
  );
}

export default ListProperty;