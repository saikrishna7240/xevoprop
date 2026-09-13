import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  Save,
  Home,
  MapPin,
  IndianRupee,
  Image as ImageIcon,
  X,
  Check,
  Star,
  Trash2,
} from "lucide-react";

import "./ListProperty.css";

function EditProperty() {
  const { id } = useParams();
  const navigate = useNavigate();

  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [images, setImages] = useState([]);
  const [newImages, setNewImages] = useState([]);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
    status: "published",
  });

  /* =========================
     LOAD PROPERTY
  ========================= */

  useEffect(() => {
    loadProperty();

    return () => {
      newImages.forEach((image) => {
        if (image.preview) {
          URL.revokeObjectURL(image.preview);
        }
      });
    };
  }, [id]);

  const loadProperty = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        `https://xevoprop.onrender.com/api/properties/${id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const contentType =
        response.headers.get("content-type");

      let data = {};

      if (
        contentType &&
        contentType.includes("application/json")
      ) {
        data = await response.json();
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            `Failed to load property (${response.status})`
        );
      }

      const property = data.property;

      setForm({
        title: property.title || "",
        type: property.type || "Apartment",
        location: property.location || "",
        city: property.city || "",
        price: property.price || "",
        price_value:
          property.price_value ?? "",
        bedrooms:
          property.bedrooms ?? "",
        bathrooms:
          property.bathrooms ?? "",
        area:
          property.area ?? "",
        description:
          property.description || "",
        verified:
          property.verified || false,
        ready_to_move:
          property.ready_to_move || false,
        zero_brokerage:
          property.zero_brokerage || false,
        status:
          property.status || "published",
      });

      /* =========================
         LOAD EXISTING IMAGES
      ========================= */

      if (
        Array.isArray(property.images) &&
        property.images.length > 0
      ) {
        const sortedImages =
          [...property.images].sort(
            (a, b) =>
              (a.sort_order ?? 0) -
              (b.sort_order ?? 0)
          );

        setImages(sortedImages);
      } else if (property.image) {
        setImages([
          {
            id: "primary",
            image_url: property.image,
            sort_order: 0,
          },
        ]);
      } else {
        setImages([]);
      }
    } catch (error) {
      console.error(
        "Load property error:",
        error
      );

      setError(
        error.message ||
          "Unable to load property."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     HANDLE CHANGE
  ========================= */

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  /* =========================
     SELECT NEW IMAGES
  ========================= */

  const handleImageSelect = (event) => {
    const files = Array.from(
      event.target.files || []
    );

    if (files.length === 0) {
      return;
    }

    setError("");
    setSuccess("");

    const validFiles = [];

    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        setError(
          "Only image files are allowed."
        );
        continue;
      }

      if (
        file.size >
        10 * 1024 * 1024
      ) {
        setError(
          `${file.name} is larger than 10MB.`
        );
        continue;
      }

      validFiles.push(file);
    }

    const preparedImages =
      validFiles.map((file) => ({
        id: `${file.name}-${file.lastModified}-${Math.random()}`,
        file,
        preview:
          URL.createObjectURL(file),
      }));

    setNewImages((previous) => [
      ...previous,
      ...preparedImages,
    ]);

    event.target.value = "";
  };

  /* =========================
     REMOVE NEW IMAGE
  ========================= */

  const removeNewImage = (imageId) => {
    setNewImages((previous) => {
      const image = previous.find(
        (item) => item.id === imageId
      );

      if (image?.preview) {
        URL.revokeObjectURL(
          image.preview
        );
      }

      return previous.filter(
        (item) => item.id !== imageId
      );
    });
  };

  /* =========================
     DELETE EXISTING IMAGE
  ========================= */

  const deleteExistingImage = async (
    image
  ) => {
    const token =
      localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this image?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      /*
        The fallback "primary" ID only exists
        when the property has no property_images
        records. It cannot be deleted through
        the image API.
      */

      if (image.id === "primary") {
        setError(
          "This image cannot be deleted because it is not stored in the property images table."
        );
        return;
      }

      const response = await fetch(
        `https://xevoprop.onrender.com/api/upload/property/${id}/image/${image.id}`,
        {
          method: "DELETE",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const contentType =
        response.headers.get(
          "content-type"
        );

      let data = {};

      if (
        contentType &&
        contentType.includes(
          "application/json"
        )
      ) {
        data = await response.json();
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            `Failed to delete image (${response.status})`
        );
      }

      setImages((previous) =>
        previous.filter(
          (item) =>
            item.id !== image.id
        )
      );

      setSuccess(
        "Image deleted successfully."
      );
    } catch (error) {
      console.error(
        "Delete image error:",
        error
      );

      setError(
        error.message ||
          "Failed to delete image."
      );
    }
  };

  /* =========================
     SET PRIMARY IMAGE
  ========================= */

  const setPrimaryImage = async (
    image
  ) => {
    const token =
      localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    if (image.id === "primary") {
      return;
    }

    try {
      setError("");
      setSuccess("");

      const response = await fetch(
        `https://xevoprop.onrender.com/api/upload/property/${id}/image/${image.id}/primary`,
        {
          method: "PUT",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const contentType =
        response.headers.get(
          "content-type"
        );

      let data = {};

      if (
        contentType &&
        contentType.includes(
          "application/json"
        )
      ) {
        data = await response.json();
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            `Failed to set primary image (${response.status})`
        );
      }

      setImages((previous) => {
        const selected =
          previous.find(
            (item) =>
              item.id === image.id
          );

        if (!selected) {
          return previous;
        }

        const others =
          previous.filter(
            (item) =>
              item.id !== image.id
          );

        return [
          {
            ...selected,
            sort_order: 0,
          },
          ...others.map(
            (item, index) => ({
              ...item,
              sort_order:
                index + 1,
            })
          ),
        ];
      });

      setSuccess(
        "Primary image updated successfully."
      );
    } catch (error) {
      console.error(
        "Set primary image error:",
        error
      );

      setError(
        error.message ||
          "Failed to set primary image."
      );
    }
  };

  /* =========================
     UPLOAD NEW IMAGE
  ========================= */

  const uploadNewImage = async (
    image,
    token
  ) => {
    const imageFormData =
      new FormData();

    imageFormData.append(
      "image",
      image.file
    );

    const response = await fetch(
      `https://xevoprop.onrender.com/api/upload/property/${id}`,
      {
        method: "POST",

        /*
          IMPORTANT:
          Do NOT set Content-Type here.
          Browser automatically adds the
          multipart/form-data boundary.
        */

        headers: {
          Authorization:
            `Bearer ${token}`,
        },

        body: imageFormData,
      }
    );

    const contentType =
      response.headers.get(
        "content-type"
      );

    let data = {};

    if (
      contentType &&
      contentType.includes(
        "application/json"
      )
    ) {
      data = await response.json();
    } else {
      const text =
        await response.text();

      throw new Error(
        `Upload server returned non-JSON response (${response.status}): ${text.substring(
          0,
          200
        )}`
      );
    }

    if (!response.ok) {
      throw new Error(
        data.message ||
          `Failed to upload image (${response.status})`
      );
    }

    return data;
  };

  /* =========================
     UPDATE PROPERTY
  ========================= */

  const updateProperty = async (
    event
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const token =
      localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    if (
      !form.title.trim() ||
      !form.type ||
      !form.location.trim()
    ) {
      setError(
        "Title, type and location are required."
      );
      return;
    }

    try {
      setSaving(true);

      /* =========================
         1. UPDATE PROPERTY
      ========================= */

      const response = await fetch(
        `https://xevoprop.onrender.com/api/properties/${id}`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            title:
              form.title.trim(),

            type: form.type,

            location:
              form.location.trim(),

            city:
              form.city || null,

            price:
              form.price || null,

            price_value:
              form.price_value
                ? Number(
                    form.price_value
                  )
                : null,

            bedrooms:
              form.bedrooms !== ""
                ? Number(
                    form.bedrooms
                  )
                : null,

            bathrooms:
              form.bathrooms !== ""
                ? Number(
                    form.bathrooms
                  )
                : null,

            area:
              form.area !== ""
                ? Number(
                    form.area
                  )
                : null,

            description:
              form.description ||
              null,

            verified:
              form.verified,

            ready_to_move:
              form.ready_to_move,

            zero_brokerage:
              form.zero_brokerage,

            status:
              form.status,
          }),
        }
      );

      const contentType =
        response.headers.get(
          "content-type"
        );

      let data = {};

      if (
        contentType &&
        contentType.includes(
          "application/json"
        )
      ) {
        data = await response.json();
      } else {
        const text =
          await response.text();

        throw new Error(
          `Property server returned non-JSON response (${response.status}): ${text.substring(
            0,
            200
          )}`
        );
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            `Failed to update property (${response.status})`
        );
      }

      /* =========================
         2. UPLOAD NEW IMAGES
      ========================= */

      for (const image of newImages) {
        await uploadNewImage(
          image,
          token
        );
      }

      /* =========================
         SUCCESS
      ========================= */

      setSuccess(
        newImages.length > 0
          ? "Property and images updated successfully!"
          : "Property updated successfully!"
      );

      /* Cleanup previews */

      newImages.forEach((image) => {
        if (image.preview) {
          URL.revokeObjectURL(
            image.preview
          );
        }
      });

      setNewImages([]);

      /* Redirect */

      setTimeout(() => {
        navigate("/my-properties");
      }, 1200);

    } catch (error) {
      console.error(
        "Update property error:",
        error
      );

      setError(
        error.message ||
          "Unable to update property."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================
     LOADING UI
  ========================= */

  if (loading) {
    return (
      <div className="list-property-page">
        <div className="list-property-container">

          <div className="listing-card">

            <div className="listing-header">

              <span>
                SELLER SPACE
              </span>

              <h1>
                Loading property...
              </h1>

              <p>
                Fetching property details.
              </p>

            </div>

          </div>

        </div>
      </div>
    );
  }

  /* =========================
     MAIN UI
  ========================= */

  return (
    <div className="list-property-page">

      <div className="list-property-container">

        {/* HEADER */}

        <div className="listing-header">

          <button
            type="button"
            className="listing-back"
            onClick={() =>
              navigate(
                "/my-properties"
              )
            }
          >
            <ArrowLeft size={13} />
            Back to my properties
          </button>

          <span>
            SELLER SPACE
          </span>

          <h1>
            Edit property
          </h1>

          <p>
            Update your property information.
          </p>

        </div>

        {/* ERROR */}

        {error && (
          <div
            style={{
              marginTop: "20px",
              padding: "12px",
              border:
                "1px solid rgba(255,107,107,0.2)",
              borderRadius: "8px",
              color: "#ff6b6b",
              background:
                "rgba(255,107,107,0.04)",
              fontSize: "10px",
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

        {/* SUCCESS */}

        {success && (
          <div
            style={{
              marginTop: "20px",
              padding: "12px",
              border:
                "1px solid rgba(0,217,255,0.2)",
              borderRadius: "8px",
              color: "#00d9ff",
              background:
                "rgba(0,217,255,0.04)",
              fontSize: "10px",
              textAlign: "center",
            }}
          >
            {success}
          </div>
        )}

        {/* FORM */}

        <form
          className="listing-card"
          onSubmit={updateProperty}
        >

          {/* PROPERTY INFORMATION */}

          <div className="listing-section-heading">

            <div className="section-icon">
              <Home size={19} />
            </div>

            <div>
              <h2>
                Property Information
              </h2>

              <p>
                Update your listing details.
              </p>
            </div>

          </div>

          <div className="listing-fields">

            {/* TITLE */}

            <div className="listing-field full">

              <label>
                PROPERTY TITLE
              </label>

              <input
                type="text"
                name="title"
                value={form.title}
                onChange={
                  handleChange
                }
              />

            </div>

            {/* TYPE */}

            <div className="listing-field">

              <label>
                PROPERTY TYPE
              </label>

              <select
                name="type"
                value={form.type}
                onChange={
                  handleChange
                }
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

            {/* CITY */}

            <div className="listing-field">

              <label>
                CITY
              </label>

              <div className="input-with-icon">

                <MapPin size={15} />

                <input
                  type="text"
                  name="city"
                  value={form.city}
                  onChange={
                    handleChange
                  }
                />

              </div>

            </div>

            {/* LOCATION */}

            <div className="listing-field full">

              <label>
                LOCATION
              </label>

              <div className="input-with-icon">

                <MapPin size={15} />

                <input
                  type="text"
                  name="location"
                  value={
                    form.location
                  }
                  onChange={
                    handleChange
                  }
                />

              </div>

            </div>

            {/* PRICE */}

            <div className="listing-field">

              <label>
                DISPLAY PRICE
              </label>

              <div className="input-with-icon">

                <IndianRupee size={15} />

                <input
                  type="text"
                  name="price"
                  value={form.price}
                  onChange={
                    handleChange
                  }
                />

              </div>

            </div>

            {/* PRICE VALUE */}

            <div className="listing-field">

              <label>
                PRICE VALUE
              </label>

              <input
                type="number"
                name="price_value"
                value={
                  form.price_value
                }
                onChange={
                  handleChange
                }
              />

            </div>

            {/* BEDROOMS */}

            <div className="listing-field">

              <label>
                BEDROOMS
              </label>

              <input
                type="number"
                min="0"
                name="bedrooms"
                value={
                  form.bedrooms
                }
                onChange={
                  handleChange
                }
              />

            </div>

            {/* BATHROOMS */}

            <div className="listing-field">

              <label>
                BATHROOMS
              </label>

              <input
                type="number"
                min="0"
                name="bathrooms"
                value={
                  form.bathrooms
                }
                onChange={
                  handleChange
                }
              />

            </div>

            {/* AREA */}

            <div className="listing-field">

              <label>
                AREA (SQ.FT)
              </label>

              <input
                type="number"
                min="0"
                name="area"
                value={
                  form.area
                }
                onChange={
                  handleChange
                }
              />

            </div>

          </div>

          {/* =========================
              PROPERTY PHOTOS
          ========================= */}

          <div
            className="amenities-section"
            style={{
              marginTop: "30px",
            }}
          >

            <label>
              PROPERTY PHOTOS
            </label>

            <p
              style={{
                fontSize: "10px",
                color: "#64748b",
                marginTop: "6px",
                marginBottom: "15px",
              }}
            >
              Manage your property photos.
              The primary image appears first
              to buyers.
            </p>

            {/* EXISTING IMAGES */}

            {images.length > 0 && (
              <div className="uploaded-images">

                {images.map(
                  (image, index) => {

                    const isPrimary =
                      index === 0;

                    return (
                      <div
                        className="uploaded-image"
                        key={image.id}
                        style={{
                          position:
                            "relative",
                        }}
                      >

                        <img
                          src={
                            image.image_url
                          }
                          alt={`Property ${
                            index + 1
                          }`}
                        />

                        {/* PRIMARY */}

                        {isPrimary && (
                          <span
                            style={{
                              position:
                                "absolute",
                              left: "7px",
                              bottom: "7px",
                              display:
                                "flex",
                              alignItems:
                                "center",
                              gap: "4px",
                              padding:
                                "4px 7px",
                              borderRadius:
                                "5px",
                              background:
                                "rgba(0,217,255,0.9)",
                              color:
                                "#001018",
                              fontSize:
                                "8px",
                              fontWeight:
                                "800",
                            }}
                          >
                            <Star
                              size={9}
                              fill="currentColor"
                            />
                            PRIMARY
                          </span>
                        )}

                        {/* SET PRIMARY */}

                        {!isPrimary && (
                          <button
                            type="button"
                            title="Set as primary"
                            onClick={() =>
                              setPrimaryImage(
                                image
                              )
                            }
                            style={{
                              position:
                                "absolute",
                              left: "7px",
                              bottom: "7px",
                              border:
                                "none",
                              borderRadius:
                                "5px",
                              padding:
                                "5px 7px",
                              background:
                                "rgba(2,6,23,0.85)",
                              color:
                                "#fff",
                              cursor:
                                "pointer",
                              display:
                                "flex",
                              alignItems:
                                "center",
                              justifyContent:
                                "center",
                            }}
                          >
                            <Star
                              size={10}
                            />
                          </button>
                        )}

                        {/* DELETE */}

                        <button
                          type="button"
                          title="Delete image"
                          onClick={() =>
                            deleteExistingImage(
                              image
                            )
                          }
                          style={{
                            position:
                              "absolute",
                            top: "7px",
                            right: "7px",
                            width: "26px",
                            height: "26px",
                            border:
                              "none",
                            borderRadius:
                              "50%",
                            background:
                              "rgba(2,6,23,0.85)",
                            color:
                              "#ff6b6b",
                            display:
                              "flex",
                            alignItems:
                              "center",
                            justifyContent:
                              "center",
                            cursor:
                              "pointer",
                          }}
                        >
                          <Trash2
                            size={12}
                          />
                        </button>

                      </div>
                    );
                  }
                )}

              </div>
            )}

            {/* NEW IMAGES */}

            {newImages.length > 0 && (
              <div
                className="uploaded-images"
                style={{
                  marginTop: "15px",
                }}
              >

                {newImages.map(
                  (image) => (
                    <div
                      className="uploaded-image"
                      key={image.id}
                      style={{
                        position:
                          "relative",
                      }}
                    >

                      <img
                        src={
                          image.preview
                        }
                        alt="New property"
                      />

                      <span
                        style={{
                          position:
                            "absolute",
                          left: "7px",
                          bottom: "7px",
                          padding:
                            "4px 7px",
                          borderRadius:
                            "5px",
                          background:
                            "rgba(2,6,23,0.85)",
                          color:
                            "#00d9ff",
                          fontSize:
                            "8px",
                          fontWeight:
                            "700",
                        }}
                      >
                        NEW
                      </span>

                      <button
                        type="button"
                        title="Remove selected image"
                        onClick={() =>
                          removeNewImage(
                            image.id
                          )
                        }
                        style={{
                          position:
                            "absolute",
                          top: "7px",
                          right: "7px",
                          width: "26px",
                          height: "26px",
                          border:
                            "none",
                          borderRadius:
                            "50%",
                          background:
                            "rgba(2,6,23,0.85)",
                          color:
                            "#ff6b6b",
                          display:
                            "flex",
                          alignItems:
                            "center",
                          justifyContent:
                            "center",
                          cursor:
                            "pointer",
                        }}
                      >
                        <X size={13} />
                      </button>

                    </div>
                  )
                )}

              </div>
            )}

            {/* UPLOAD */}

            <div
              className="upload-area"
              onClick={() =>
                fileInputRef.current?.click()
              }
              style={{
                marginTop: "15px",
                minHeight: "170px",
              }}
            >

              <ImageIcon size={30} />

              <strong>
                Upload property photos
              </strong>

              <span>
                JPG, PNG or WEBP • Up to
                10MB each
              </span>

              <span>
                You can select multiple photos
              </span>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={
                  handleImageSelect
                }
                onClick={(event) =>
                  event.stopPropagation()
                }
                style={{
                  display: "none",
                }}
              />

            </div>

          </div>

          {/* DESCRIPTION */}

          <div
            className="listing-field full"
            style={{
              marginTop: "25px",
            }}
          >

            <label>
              DESCRIPTION
            </label>

            <textarea
              rows="7"
              name="description"
              value={
                form.description
              }
              onChange={
                handleChange
              }
            />

          </div>

          {/* FEATURES */}

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

          {/* STATUS */}

          <div
            className="listing-field"
            style={{
              marginTop: "25px",
            }}
          >

            <label>
              STATUS
            </label>

            <select
              name="status"
              value={form.status}
              onChange={
                handleChange
              }
            >
              <option value="published">
                Published
              </option>

              <option value="draft">
                Draft
              </option>
            </select>

          </div>

          {/* ACTIONS */}

          <div
            className="listing-navigation"
            style={{
              marginTop: "25px",
            }}
          >

            <button
              type="button"
              className="listing-prev"
              onClick={() =>
                navigate(
                  "/my-properties"
                )
              }
            >
              <ArrowLeft size={13} />
              Cancel
            </button>

            <button
              type="submit"
              className="listing-next"
              disabled={saving}
            >
              <Save size={13} />

              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default EditProperty;