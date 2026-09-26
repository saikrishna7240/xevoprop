import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Building2,
  Save,
  Loader2,
  ImagePlus,
  Video,
  Image as ImageIcon,
  X,
  Clock3,
  CheckCircle2,
  XCircle,
  FileText,
  Upload,
  FileCheck2,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import "./EditProject.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://xevoprop.onrender.com/api";

const AGREEMENT_URL =
  "/documents/Builder_Listing_Commission_Agreementfinal.docx";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=85";

function EditProject() {
  const { id } = useParams();
  const navigate = useNavigate();

  const mediaInputRef = useRef(null);
  const agreementInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    city: "",
    state: "",
    type: "Apartment",
    units: "",
    price: "",
    project_status: "Upcoming",
    description: "",
  });

  const [projectStatus, setProjectStatus] =
    useState("pending");

  const [rejectionReason, setRejectionReason] =
    useState("");

  const [currentImage, setCurrentImage] =
    useState("");

  const [existingMedia, setExistingMedia] =
    useState([]);

  const [newMedia, setNewMedia] =
    useState([]);

  const [signedAgreement, setSignedAgreement] =
    useState(null);

  const [agreementName, setAgreementName] =
    useState("");

  const [existingAgreement, setExistingAgreement] =
    useState(null);

  const [agreementAccepted, setAgreementAccepted] =
    useState(false);

  const [informationConfirmed, setInformationConfirmed] =
    useState(false);

  const [authorizationConfirmed, setAuthorizationConfirmed] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [deletingMediaId, setDeletingMediaId] =
    useState(null);

  const [error, setError] =
    useState("");

  useEffect(() => {
    loadProject();

    return () => {
      newMedia.forEach((media) => {
        if (media.preview) {
          URL.revokeObjectURL(media.preview);
        }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ============================================================
  // LOAD PROJECT
  // ============================================================

  const loadProject = async () => {
    try {
      setLoading(true);
      setError("");

      const token =
        localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        `${API_URL}/projects/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load project."
        );
      }

      const project =
        data?.project ||
        data?.data ||
        data;

      if (!project || !project.id) {
        throw new Error(
          "Project data was not returned."
        );
      }

      // ----------------------------------------------------------
      // LOCATION
      // ----------------------------------------------------------

      const locationParts = (
        project.location || ""
      )
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      let location =
        project.location || "";

      let city =
        project.city || "";

      let state = "";

      if (!project.city) {
        if (locationParts.length >= 3) {
          location = locationParts[0];
          city = locationParts[1];
          state = locationParts
            .slice(2)
            .join(", ");
        } else if (
          locationParts.length === 2
        ) {
          location = locationParts[0];
          city = locationParts[1];
        }
      } else if (
        locationParts.length >= 3
      ) {
        location = locationParts[0];
        state = locationParts
          .slice(2)
          .join(", ");
      }

      setFormData({
        name: project.name || "",
        location,
        city,
        state,
        type:
          project.type || "Apartment",
        units:
          project.units !== null &&
          project.units !== undefined
            ? String(project.units)
            : "",
        price:
          project.price || "",
        project_status:
          project.project_status || "Upcoming",
        description:
          project.description || "",
      });

      setProjectStatus(
        String(
          project.status || "pending"
        ).toLowerCase()
      );

      setRejectionReason(
        project.rejection_reason || ""
      );

      setCurrentImage(
        project.image || ""
      );

      // ----------------------------------------------------------
      // EXISTING MEDIA
      // ----------------------------------------------------------

      const normalizedMedia =
        Array.isArray(project.project_media)
          ? project.project_media
              .map((item) => ({
                id: item.id,
                url:
                  item.media_url ||
                  item.url ||
                  "",
                type:
                  item.media_type ||
                  "image",
                sort_order:
                  item.sort_order ?? 0,
              }))
              .filter((item) => item.url)
          : [];

      setExistingMedia(
        normalizedMedia
      );

      // ----------------------------------------------------------
      // EXISTING AGREEMENT
      // ----------------------------------------------------------

      if (project.agreement) {
        setExistingAgreement(
          project.agreement
        );

        setAgreementAccepted(
          project.agreement.accepted === true
        );

        setInformationConfirmed(
          project.agreement
            .information_confirmed === true
        );

        setAuthorizationConfirmed(
          project.agreement
            .authorization_confirmed === true
        );
      }
    } catch (err) {
      console.error(
        "LOAD PROJECT ERROR:",
        err
      );

      setError(
        err.message ||
          "Unable to load project."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // FORM CHANGE
  // ============================================================

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ============================================================
  // NEW MEDIA
  // ============================================================

  const handleMediaChange = (e) => {
    const files = Array.from(
      e.target.files || []
    );

    if (!files.length) return;

    setError("");

    const availableSlots =
      10 -
      existingMedia.length -
      newMedia.length;

    if (availableSlots <= 0) {
      setError(
        "You can have a maximum of 10 media files."
      );
      return;
    }

    const selectedFiles =
      files.slice(0, availableSlots);

    const validMedia = [];

    for (const file of selectedFiles) {
      const isImage =
        file.type.startsWith("image/");

      const isVideo =
        file.type.startsWith("video/");

      if (!isImage && !isVideo) {
        setError(
          `${file.name} is not a supported media file.`
        );
        continue;
      }

      const maxSize = isVideo
        ? 100 * 1024 * 1024
        : 10 * 1024 * 1024;

      if (file.size > maxSize) {
        setError(
          `${file.name} is too large. ${
            isVideo ? "Videos" : "Images"
          } must be below ${
            isVideo ? "100MB" : "10MB"
          }.`
        );
        continue;
      }

      validMedia.push({
        id: `${file.name}-${file.lastModified}-${Math.random()}`,
        file,
        preview:
          URL.createObjectURL(file),
        type: isVideo
          ? "video"
          : "image",
      });
    }

    setNewMedia((previous) => [
      ...previous,
      ...validMedia,
    ]);

    if (mediaInputRef.current) {
      mediaInputRef.current.value = "";
    }
  };

  // ============================================================
  // REMOVE NEW MEDIA
  // ============================================================

  const removeNewMedia = (mediaId) => {
    setNewMedia((previous) => {
      const target = previous.find(
        (media) => media.id === mediaId
      );

      if (target?.preview) {
        URL.revokeObjectURL(
          target.preview
        );
      }

      return previous.filter(
        (media) => media.id !== mediaId
      );
    });
  };

  // ============================================================
  // DELETE EXISTING MEDIA
  // ============================================================

  const deleteExistingMedia = async (
    mediaId
  ) => {
    const confirmed = window.confirm(
      "Remove this project media?"
    );

    if (!confirmed) return;

    try {
      setDeletingMediaId(mediaId);
      setError("");

      const token =
        localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        `${API_URL}/upload/project/media/${mediaId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to delete media."
        );
      }

      setExistingMedia(
        (previous) =>
          previous.filter(
            (media) =>
              media.id !== mediaId
          )
      );
    } catch (err) {
      console.error(
        "DELETE MEDIA ERROR:",
        err
      );

      setError(
        err.message ||
          "Unable to delete media."
      );
    } finally {
      setDeletingMediaId(null);
    }
  };

  // ============================================================
  // SIGNED AGREEMENT
  // ============================================================

  const handleAgreementChange = (e) => {
    const file =
      e.target.files?.[0];

    if (!file) return;

    setError("");

    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    const extension =
      file.name
        .split(".")
        .pop()
        ?.toLowerCase();

    const validExtension = [
      "pdf",
      "doc",
      "docx",
    ].includes(extension);

    if (
      !validTypes.includes(file.type) &&
      !validExtension
    ) {
      setError(
        "Please upload a PDF, DOC, or DOCX signed agreement."
      );
      return;
    }

    if (
      file.size >
      15 * 1024 * 1024
    ) {
      setError(
        "Signed agreement must be below 15MB."
      );
      return;
    }

    setSignedAgreement(file);
    setAgreementName(file.name);

    if (agreementInputRef.current) {
      agreementInputRef.current.value =
        "";
    }
  };

  const removeSignedAgreement = () => {
    setSignedAgreement(null);
    setAgreementName("");

    if (agreementInputRef.current) {
      agreementInputRef.current.value =
        "";
    }
  };

  // ============================================================
  // STATUS
  // ============================================================

  const getStatusInfo = () => {
    switch (projectStatus) {
      case "approved":
        return {
          label: "Approved",
          description:
            "This project is currently approved and visible on Xevoprop.",
          className: "approved",
          icon: CheckCircle2,
        };

      case "rejected":
        return {
          label: "Rejected",
          description:
            "Update the information and save your changes to submit the project for review again.",
          className: "rejected",
          icon: XCircle,
        };

      default:
        return {
          label: "Pending Review",
          description:
            "This project is waiting for admin approval.",
          className: "pending",
          icon: Clock3,
        };
    }
  };

  // ============================================================
  // UPLOAD NEW MEDIA
  // ============================================================

  const uploadNewMedia = async (
    token
  ) => {
    for (
      let index = 0;
      index < newMedia.length;
      index++
    ) {
      const media =
        newMedia[index];

      const mediaFormData =
        new FormData();

      mediaFormData.append(
        "media",
        media.file
      );

      mediaFormData.append(
        "sort_order",
        String(
          existingMedia.length +
            index
        )
      );

      const response =
        await fetch(
          `${API_URL}/upload/project/${id}/media`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: mediaFormData,
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            `Failed to upload ${media.file.name}.`
        );
      }
    }
  };

  // ============================================================
  // UPLOAD AGREEMENT
  // ============================================================

  const uploadAgreement =
    async (token) => {
      if (!signedAgreement) {
        return;
      }

      const agreementFormData =
        new FormData();

      agreementFormData.append(
        "agreement",
        signedAgreement
      );

      agreementFormData.append(
        "accepted",
        String(agreementAccepted)
      );

      agreementFormData.append(
        "information_confirmed",
        String(
          informationConfirmed
        )
      );

      agreementFormData.append(
        "authorization_confirmed",
        String(
          authorizationConfirmed
        )
      );

      agreementFormData.append(
        "agreement_version",
        "1.0"
      );

      const response =
        await fetch(
          `${API_URL}/upload/project/${id}/agreement`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: agreementFormData,
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to upload signed agreement."
        );
      }
    };

  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!formData.name.trim()) {
      setError(
        "Project name is required."
      );
      return;
    }

    if (!formData.location.trim()) {
      setError(
        "Location is required."
      );
      return;
    }

    if (!formData.type) {
      setError(
        "Project type is required."
      );
      return;
    }

    // ----------------------------------------------------------
    // AGREEMENT VALIDATION
    // ----------------------------------------------------------

    if (
      signedAgreement &&
      (
        !agreementAccepted ||
        !informationConfirmed ||
        !authorizationConfirmed
      )
    ) {
      setError(
        "Please complete all agreement confirmations before uploading the new signed agreement."
      );
      return;
    }

    try {
      setSaving(true);

      const token =
        localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const completeLocation = [
        formData.location.trim(),
        formData.city.trim(),
        formData.state.trim(),
      ]
        .filter(Boolean)
        .join(", ");

      // ----------------------------------------------------------
      // UPDATE PROJECT
      // ----------------------------------------------------------

      const response = await fetch(
        `${API_URL}/projects/${id}`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            name:
              formData.name.trim(),

            location:
              completeLocation,

            city:
              formData.city.trim() ||
              null,

            type:
              formData.type,

           units:
  formData.units.trim() || null,

            price:
              formData.price.trim() ||
              null,
            project_status:
              formData.project_status,

            description:
              formData.description.trim() ||
              null,

            image:
              currentImage || null,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update project."
        );
      }

      // ----------------------------------------------------------
      // NEW MEDIA
      // ----------------------------------------------------------

      if (newMedia.length > 0) {
        await uploadNewMedia(
          token
        );
      }

      // ----------------------------------------------------------
      // NEW AGREEMENT
      // ----------------------------------------------------------

      if (signedAgreement) {
        await uploadAgreement(
          token
        );
      }

      // ----------------------------------------------------------
      // SUCCESS
      // ----------------------------------------------------------

      alert(
        "Project updated and submitted for admin approval."
      );

      navigate("/my-projects");
    } catch (err) {
      console.error(
        "UPDATE PROJECT ERROR:",
        err
      );

      setError(
        err.message ||
          "Unable to update project."
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="edit-project-page">
        <div className="edit-project-loading">
          <Loader2
            size={28}
            className="edit-project-loading-icon"
          />

          <p>
            Loading project...
          </p>
        </div>
      </div>
    );
  }

  const statusInfo =
    getStatusInfo();

  const StatusIcon =
    statusInfo.icon;

  const totalMedia =
    existingMedia.length +
    newMedia.length;

  return (
    <div className="edit-project-page">
      <div className="edit-project-container">

        {/* BACK */}

        <button
          type="button"
          className="edit-project-back"
          onClick={() =>
            navigate("/my-projects")
          }
        >
          <ArrowLeft size={16} />
          Back to my projects
        </button>

        {/* HEADER */}

        <div className="edit-project-header">
          <div className="edit-project-icon">
            <Building2 size={22} />
          </div>

          <div>
            <span>
              DEVELOPER SPACE
            </span>

            <h1>
              Edit Project
            </h1>

            <p>
              Update your project information
              on Xevoprop.
            </p>
          </div>
        </div>

        {/* STATUS */}

        <div
          className={`edit-project-review-status ${statusInfo.className}`}
        >
          <div className="edit-project-status-icon">
            <StatusIcon size={19} />
          </div>

          <div className="edit-project-status-content">
            <strong>
              {statusInfo.label}
            </strong>

            <p>
              {statusInfo.description}
            </p>

            {projectStatus ===
              "rejected" &&
              rejectionReason && (
                <div className="edit-project-rejection-reason">
                  <span>
                    Admin feedback:
                  </span>

                  <p>
                    {rejectionReason}
                  </p>
                </div>
              )}
          </div>
        </div>

        {/* ERROR */}

        {error && (
          <div className="edit-project-error">
            {error}
          </div>
        )}

        <form
          className="edit-project-form"
          onSubmit={handleSubmit}
        >

          {/* ==================================================
              01 BASIC INFORMATION
          ================================================== */}

          <section className="project-form-section">
            <div className="project-form-heading">
              <span>01</span>

              <div>
                <h2>
                  Basic information
                </h2>

                <p>
                  Update your project information.
                </p>
              </div>
            </div>

            <div className="project-form-grid">

              <div className="project-form-group full">
                <label>
                  Project name
                  <span>*</span>
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="project-form-group">
                <label>
                  Project type
                  <span>*</span>
                </label>

                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                >
                  <option value="Apartment">
                    Apartment
                  </option>

                  <option value="Villa">
                    Villa
                  </option>

                  <option value="Plot">
                    Plot
                  </option>

                  <option value="Commercial">
                    Commercial
                  </option>

                  <option value="House">
                    House
                  </option>
                </select>
              </div>

              <div className="project-form-group">
  <label>
    Project status
  </label>

  <select
    name="project_status"
    value={formData.project_status}
    onChange={handleChange}
  >
    <option value="Upcoming">
      Upcoming
    </option>

    <option value="Under Construction">
      Under Construction
    </option>

    <option value="Ready to Move">
      Ready to Move
    </option>

    <option value="Completed">
      Completed
    </option>
  </select>
</div>

              <div className="project-form-group">
                <label>
                  Approval status
                </label>

                <div
                  className={`edit-project-status-field ${statusInfo.className}`}
                >
                  <StatusIcon size={16} />

                  <span>
                    {statusInfo.label}
                  </span>
                </div>
              </div>

            </div>
          </section>

          {/* ==================================================
              02 LOCATION
          ================================================== */}

          <section className="project-form-section">
            <div className="project-form-heading">
              <span>02</span>

              <div>
                <h2>
                  Project location
                </h2>

                <p>
                  Update where the project is located.
                </p>
              </div>
            </div>

            <div className="project-form-grid">

              <div className="project-form-group full">
                <label>
                  Location
                  <span>*</span>
                </label>

                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="project-form-group">
                <label>
                  City
                </label>

                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="e.g. Hyderabad"
                />
              </div>

              <div className="project-form-group">
                <label>
                  State
                </label>

                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="e.g. Telangana"
                />
              </div>

            </div>
          </section>

          {/* ==================================================
              03 PROJECT DETAILS
          ================================================== */}

          <section className="project-form-section">
            <div className="project-form-heading">
              <span>03</span>

              <div>
                <h2>
                  Project details
                </h2>

                <p>
                  Update pricing, media and project information.
                </p>
              </div>
            </div>

            <div className="project-form-grid">

              {/* UNITS */}

              <div className="project-form-group">
                <label>
                  Total units
                </label>

                <input
                  type="text"
                  name="units"
                  min="0"
                  value={formData.units}
                  onChange={handleChange}
                  placeholder="e.g. 120"
                />
              </div>

              {/* PRICE */}

              <div className="project-form-group">
                <label>
                  Price
                </label>

                <input
                  type="text"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="e.g. ₹65 Lakhs onwards"
                />
              </div>

              {/* MEDIA */}

              <div className="project-form-group full">

                <div className="edit-media-heading">
                  <div>
                    <label>
                      Project media
                    </label>

                    <p>
                      {totalMedia}/10 media files
                    </p>
                  </div>

                  <button
                    type="button"
                    className="edit-media-add-button"
                    onClick={() =>
                      mediaInputRef.current?.click()
                    }
                    disabled={
                      totalMedia >= 10
                    }
                  >
                    <ImagePlus size={16} />
                    Add Media
                  </button>
                </div>

                <input
                  ref={mediaInputRef}
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={handleMediaChange}
                  hidden
                />

                {existingMedia.length === 0 &&
                newMedia.length === 0 ? (
                  <button
                    type="button"
                    className="edit-media-upload-box"
                    onClick={() =>
                      mediaInputRef.current?.click()
                    }
                  >
                    <ImagePlus size={30} />

                    <strong>
                      Add project images & videos
                    </strong>

                    <span>
                      Images up to 10MB · Videos up to
                      100MB
                    </span>
                  </button>
                ) : (
                  <div className="edit-project-media-grid">

                    {/* EXISTING MEDIA */}

                    {existingMedia.map(
                      (media) => (
                        <div
                          className="edit-project-media-item"
                          key={`existing-${media.id}`}
                        >

                          {media.type ===
                          "video" ? (
                            <video
                              src={media.url}
                              controls
                              preload="metadata"
                            />
                          ) : (
                            <img
                              src={media.url}
                              alt="Project media"
                              onError={(event) => {
                                event.currentTarget.src =
                                  FALLBACK_IMAGE;
                              }}
                            />
                          )}

                          <span className="edit-media-existing-badge">
                            Existing
                          </span>

                          <button
                            type="button"
                            className="edit-media-remove"
                            onClick={() =>
                              deleteExistingMedia(
                                media.id
                              )
                            }
                            disabled={
                              deletingMediaId ===
                              media.id
                            }
                          >
                            {deletingMediaId ===
                            media.id ? (
                              <Loader2
                                size={15}
                                className="project-loading"
                              />
                            ) : (
                              <X size={15} />
                            )}
                          </button>

                          {media.type ===
                            "video" && (
                            <span className="edit-media-type-badge">
                              <Video size={12} />
                              Video
                            </span>
                          )}
                        </div>
                      )
                    )}

                    {/* NEW MEDIA */}

                    {newMedia.map(
                      (media) => (
                        <div
                          className="edit-project-media-item new"
                          key={`new-${media.id}`}
                        >

                          {media.type ===
                          "video" ? (
                            <video
                              src={media.preview}
                              controls
                            />
                          ) : (
                            <img
                              src={media.preview}
                              alt="New project media"
                            />
                          )}

                          <span className="edit-media-new-badge">
                            New
                          </span>

                          <button
                            type="button"
                            className="edit-media-remove"
                            onClick={() =>
                              removeNewMedia(
                                media.id
                              )
                            }
                          >
                            <X size={15} />
                          </button>

                          {media.type ===
                            "video" && (
                            <span className="edit-media-type-badge">
                              <Video size={12} />
                              Video
                            </span>
                          )}
                        </div>
                      )
                    )}

                  </div>
                )}

                <div className="edit-media-guidelines">
                  <ImageIcon size={15} />

                  <span>
                    You can keep existing media and
                    add new images or videos. Maximum
                    10 total media files.
                  </span>
                </div>
              </div>

              {/* DESCRIPTION */}

              <div className="project-form-group full">
                <label>
                  Description
                </label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="6"
                  placeholder="Describe the project, amenities, connectivity and other important details..."
                />
              </div>

            </div>
          </section>

          {/* ==================================================
              04 AGREEMENT
          ================================================== */}

          <section className="project-form-section">
            <div className="project-form-heading">
              <span>04</span>

              <div>
                <h2>
                  Agreement & authorization
                </h2>

                <p>
                  Review your listing agreement and
                  authorization before submitting changes.
                </p>
              </div>
            </div>

            {/* ORIGINAL AGREEMENT */}

            <div className="edit-agreement-card">

              <div className="edit-agreement-document-icon">
                <FileText size={25} />
              </div>

              <div className="edit-agreement-info">
                <strong>
                  Builder Listing & Commission Agreement
                </strong>

                <span>
                  Review the current agreement before
                  making changes to your project.
                </span>

                <div className="edit-agreement-actions">

                  <a
                    href={AGREEMENT_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="edit-agreement-link"
                  >
                    <ExternalLink size={14} />
                    Open Agreement
                  </a>

                  <a
                    href={AGREEMENT_URL}
                    download
                    className="edit-agreement-link"
                  >
                    <FileText size={14} />
                    Download
                  </a>

                </div>
              </div>

            </div>

            {/* CURRENT SIGNED AGREEMENT */}

            {existingAgreement && (
              <div className="edit-current-agreement">

                <div className="edit-current-agreement-icon">
                  <FileCheck2 size={21} />
                </div>

                <div>
                  <strong>
                    Signed agreement on file
                  </strong>

                  <span>
                    Version{" "}
                    {existingAgreement.agreement_version ||
                      "1.0"}
                    {existingAgreement.accepted_at
                      ? ` · Accepted ${new Date(
                          existingAgreement.accepted_at
                        ).toLocaleDateString()}`
                      : ""}
                  </span>

                  {existingAgreement.signed_agreement_url && (
                    <a
                      href={
                        existingAgreement.signed_agreement_url
                      }
                      target="_blank"
                      rel="noreferrer"
                    >
                      <ExternalLink size={13} />
                      View signed agreement
                    </a>
                  )}
                </div>

              </div>
            )}

            {/* REPLACEMENT AGREEMENT */}

            <div className="edit-signed-agreement">

              <div className="edit-signed-heading">
                <div>
                  <label>
                    Replace signed agreement
                  </label>

                  <p>
                    Upload a new digitally signed PDF,
                    DOC or DOCX only if the agreement
                    has been updated.
                  </p>
                </div>

                <button
                  type="button"
                  className="edit-signed-upload-button"
                  onClick={() =>
                    agreementInputRef.current?.click()
                  }
                >
                  <Upload size={16} />
                  Choose File
                </button>
              </div>

              <input
                ref={agreementInputRef}
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleAgreementChange}
                hidden
              />

              {signedAgreement && (
                <div className="edit-signed-file">

                  <FileText size={20} />

                  <div>
                    <strong>
                      {agreementName}
                    </strong>

                    <span>
                      {(
                        signedAgreement.size /
                        (1024 * 1024)
                      ).toFixed(2)}{" "}
                      MB
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={
                      removeSignedAgreement
                    }
                  >
                    <X size={16} />
                  </button>

                </div>
              )}

            </div>

            {/* CONFIRMATIONS */}

            <div className="edit-agreement-confirmations">

              <label className="edit-agreement-checkbox">
                <input
                  type="checkbox"
                  checked={
                    agreementAccepted
                  }
                  onChange={(e) =>
                    setAgreementAccepted(
                      e.target.checked
                    )
                  }
                />

                <span className="edit-custom-checkbox">
                  {agreementAccepted && "✓"}
                </span>

                <span>
                  I have read, understood and agree to
                  the Builder Listing & Commission
                  Agreement.
                </span>
              </label>

              <label className="edit-agreement-checkbox">
                <input
                  type="checkbox"
                  checked={
                    informationConfirmed
                  }
                  onChange={(e) =>
                    setInformationConfirmed(
                      e.target.checked
                    )
                  }
                />

                <span className="edit-custom-checkbox">
                  {informationConfirmed && "✓"}
                </span>

                <span>
                  I confirm that all project information,
                  pricing and specifications submitted
                  are accurate and complete.
                </span>
              </label>

              <label className="edit-agreement-checkbox">
                <input
                  type="checkbox"
                  checked={
                    authorizationConfirmed
                  }
                  onChange={(e) =>
                    setAuthorizationConfirmed(
                      e.target.checked
                    )
                  }
                />

                <span className="edit-custom-checkbox">
                  {authorizationConfirmed && "✓"}
                </span>

                <span>
                  I confirm that I am authorized to list
                  this project on Xevoprop and submit it
                  for review.
                </span>
              </label>

            </div>

            <div className="edit-agreement-notice">
              <ShieldCheck size={17} />

              <p>
                Updated project information will be
                reviewed by Xevoprop before the listing
                becomes publicly visible again.
              </p>
            </div>

          </section>

          {/* ==================================================
              REVIEW NOTICE
          ================================================== */}

          <div className="edit-project-save-notice">
            <Clock3 size={17} />

            <p>
              Saving changes will send this project
              back to{" "}
              <strong>
                Pending Review
              </strong>
              . An administrator must approve the
              updated project before it becomes publicly
              visible.
            </p>
          </div>

          {/* ==================================================
              ACTIONS
          ================================================== */}

          <div className="edit-project-actions">

            <button
              type="button"
              className="project-cancel-btn"
              onClick={() =>
                navigate("/my-projects")
              }
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="project-update-btn"
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2
                    size={17}
                    className="project-loading"
                  />

                  Saving...
                </>
              ) : (
                <>
                  <Save size={17} />

                  Save Changes
                </>
              )}
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}

export default EditProject;