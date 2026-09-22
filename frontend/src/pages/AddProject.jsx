import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  Plus,
  Loader2,
  ImagePlus,
  X,
  FileText,
  Upload,
  CheckCircle2,
  ShieldCheck,
  ExternalLink,
  Play,
} from "lucide-react";
import "./AddProject.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://xevoprop.onrender.com/api";

const AGREEMENT_URL =
  "/documents/Builder_Listing_Commission_Agreementfinal.docx";

const MAX_MEDIA = 10;
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_VIDEO_SIZE = 100 * 1024 * 1024;
const MAX_AGREEMENT_SIZE = 15 * 1024 * 1024;

const AddProject = () => {
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
    description: "",
  });

  const [selectedMedia, setSelectedMedia] = useState([]);

  const [signedAgreement, setSignedAgreement] = useState(null);
  const [signedAgreementName, setSignedAgreementName] = useState("");

  const [agreementAccepted, setAgreementAccepted] = useState(false);
  const [informationConfirmed, setInformationConfirmed] = useState(false);
  const [authorizationConfirmed, setAuthorizationConfirmed] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* =========================
     MEDIA
  ========================= */

  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files || []);

    if (!files.length) return;

    setError("");

    if (selectedMedia.length + files.length > MAX_MEDIA) {
      setError(`You can upload a maximum of ${MAX_MEDIA} media files.`);
      e.target.value = "";
      return;
    }

    const validMedia = [];

    for (const file of files) {
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");

      if (!isImage && !isVideo) {
        setError(
          `"${file.name}" is not a supported image or video file.`
        );
        continue;
      }

      if (isImage && file.size > MAX_IMAGE_SIZE) {
        setError(`Image "${file.name}" exceeds the 10MB limit.`);
        continue;
      }

      if (isVideo && file.size > MAX_VIDEO_SIZE) {
        setError(`Video "${file.name}" exceeds the 100MB limit.`);
        continue;
      }

      validMedia.push({
        id: `${file.name}-${file.lastModified}-${Math.random()}`,
        file,
        preview: URL.createObjectURL(file),
        type: isVideo ? "video" : "image",
      });
    }

    setSelectedMedia((prev) => [...prev, ...validMedia]);

    e.target.value = "";
  };

  const removeMedia = (id) => {
    setSelectedMedia((prev) => {
      const item = prev.find((media) => media.id === id);

      if (item?.preview) {
        URL.revokeObjectURL(item.preview);
      }

      return prev.filter((media) => media.id !== id);
    });
  };

  /* =========================
     AGREEMENT
  ========================= */

  const handleAgreementChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setError("");

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    const extension = file.name.split(".").pop()?.toLowerCase();

    const validExtension = ["pdf", "doc", "docx"].includes(extension);

    if (!allowedTypes.includes(file.type) && !validExtension) {
      setError("Please upload a PDF, DOC, or DOCX signed agreement.");
      e.target.value = "";
      return;
    }

    if (file.size > MAX_AGREEMENT_SIZE) {
      setError("Signed agreement must be smaller than 15MB.");
      e.target.value = "";
      return;
    }

    setSignedAgreement(file);
    setSignedAgreementName(file.name);

    e.target.value = "";
  };

  const removeAgreement = () => {
    setSignedAgreement(null);
    setSignedAgreementName("");
  };

  /* =========================
     VALIDATION
  ========================= */

  const validateAgreement = () => {
    if (!signedAgreement) {
      setError("Please upload the digitally signed agreement.");
      return false;
    }

    if (!agreementAccepted) {
      setError("Please accept the Builder Listing & Commission Agreement.");
      return false;
    }

    if (!informationConfirmed) {
      setError("Please confirm that the project information is accurate.");
      return false;
    }

    if (!authorizationConfirmed) {
      setError(
        "Please confirm that you are authorized to list this project."
      );
      return false;
    }

    return true;
  };

  const canCreate =
    !loading &&
    selectedMedia.length > 0 &&
    signedAgreement &&
    agreementAccepted &&
    informationConfirmed &&
    authorizationConfirmed;

  /* =========================
     SUBMIT
  ========================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!formData.name.trim()) {
      setError("Project name is required.");
      return;
    }

    if (!formData.location.trim()) {
      setError("Project location is required.");
      return;
    }

    if (!formData.city.trim()) {
      setError("City is required.");
      return;
    }

    if (!formData.price.trim()) {
      setError("Project price is required.");
      return;
    }

    if (!selectedMedia.length) {
      setError("Please upload at least one project image or video.");
      return;
    }

    if (!validateAgreement()) {
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please login as a developer to continue.");
      return;
    }

    try {
      setLoading(true);

      /* =========================
         CREATE PROJECT
      ========================= */

      const completeLocation = [
        formData.location.trim(),
        formData.city.trim(),
        formData.state.trim(),
      ]
        .filter(Boolean)
        .join(", ");

      const response = await fetch(`${API_URL}/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          location: completeLocation,
          city: formData.city.trim(),
          type: formData.type,
          units: formData.units
            ? Number(formData.units)
            : null,
          price: formData.price.trim(),
          description: formData.description.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Failed to create project."
        );
      }

      const projectId = data?.project?.id;

      if (!projectId) {
        throw new Error("Project ID was not returned by the server.");
      }

      /* =========================
         UPLOAD PROJECT MEDIA
      ========================= */

      for (let index = 0; index < selectedMedia.length; index++) {
        const media = selectedMedia[index];

        const mediaFormData = new FormData();

        mediaFormData.append("media", media.file);
        mediaFormData.append("sort_order", String(index));

        const mediaResponse = await fetch(
          `${API_URL}/upload/project/${projectId}/media`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: mediaFormData,
          }
        );

        const mediaData = await mediaResponse.json();

        if (!mediaResponse.ok) {
          throw new Error(
            mediaData?.message ||
              `Failed to upload ${media.file.name}.`
          );
        }
      }

      /* =========================
         UPLOAD SIGNED AGREEMENT
      ========================= */

      const agreementFormData = new FormData();

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
        String(informationConfirmed)
      );

      agreementFormData.append(
        "authorization_confirmed",
        String(authorizationConfirmed)
      );

      agreementFormData.append(
        "agreement_version",
        "1.0"
      );

      const agreementResponse = await fetch(
        `${API_URL}/upload/project/${projectId}/agreement`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: agreementFormData,
        }
      );

      const agreementData = await agreementResponse.json();

      if (!agreementResponse.ok) {
        throw new Error(
          agreementData?.message ||
            "Failed to upload signed agreement."
        );
      }

      alert(
        "Project submitted successfully for review."
      );

      navigate("/my-projects");
    } catch (err) {
      console.error("CREATE PROJECT ERROR:", err);

      setError(
        err.message ||
          "Something went wrong while creating the project."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-project-page">
      <div className="add-project-container">

        {/* HEADER */}
        <div className="add-project-header">
          <button
            type="button"
            className="back-button"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={18} />
            Back
          </button>

          <div>
            <div className="page-eyebrow">
              DEVELOPER PORTAL
            </div>

            <h1>
              Add New Project
            </h1>

            <p>
              Create and submit your project for
              Xevoprop verification.
            </p>
          </div>
        </div>

        {error && (
          <div className="form-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* BASIC INFORMATION */}
          <section className="project-form-section">
            <div className="section-number">
              01
            </div>

            <div className="section-content">
              <div className="section-heading">
                <Building2 size={21} />

                <div>
                  <h2>
                    Basic Information
                  </h2>

                  <p>
                    Enter the primary information
                    about your project.
                  </p>
                </div>
              </div>

              <div className="form-grid">

                <div className="form-group full-width">
                  <label>
                    Project Name *
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter project name"
                  />
                </div>

                <div className="form-group">
                  <label>
                    Project Type
                  </label>

                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
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
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    Number of Units
                  </label>

                  <input
                    type="number"
                    name="units"
                    value={formData.units}
                    onChange={handleChange}
                    placeholder="e.g. 120"
                    min="0"
                  />
                </div>

              </div>
            </div>
          </section>

          {/* LOCATION */}
          <section className="project-form-section">
            <div className="section-number">
              02
            </div>

            <div className="section-content">
              <div className="section-heading">
                <Building2 size={21} />

                <div>
                  <h2>
                    Project Location
                  </h2>

                  <p>
                    Provide the complete location
                    of the project.
                  </p>
                </div>
              </div>

              <div className="form-grid">

                <div className="form-group full-width">
                  <label>
                    Location *
                  </label>

                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Area / locality / street"
                  />
                </div>

                <div className="form-group">
                  <label>
                    City *
                  </label>

                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="City"
                  />
                </div>

                <div className="form-group">
                  <label>
                    State
                  </label>

                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="State"
                  />
                </div>

              </div>
            </div>
          </section>

          {/* PROJECT DETAILS */}
          <section className="project-form-section">
            <div className="section-number">
              03
            </div>

            <div className="section-content">
              <div className="section-heading">
                <Building2 size={21} />

                <div>
                  <h2>
                    Project Details
                  </h2>

                  <p>
                    Add pricing and project
                    information.
                  </p>
                </div>
              </div>

              <div className="form-grid">

                <div className="form-group">
                  <label>
                    Starting Price *
                  </label>

                  <input
                    type="text"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="e.g. ₹85 Lakhs"
                  />
                </div>

                <div className="form-group full-width">
                  <label>
                    Description
                  </label>

                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe the project, amenities, specifications, location advantages, etc."
                    rows="7"
                  />
                </div>

              </div>
            </div>
          </section>

          {/* MEDIA */}
          <section className="project-form-section">
            <div className="section-number">
              04
            </div>

            <div className="section-content">

              <div className="section-heading">
                <ImagePlus size={21} />

                <div>
                  <h2>
                    Project Media
                  </h2>

                  <p>
                    Upload project images and videos.
                    You can upload up to 10 files.
                  </p>
                </div>
              </div>

              <div className="media-upload-box">

                <input
                  ref={mediaInputRef}
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  hidden
                  onChange={handleMediaChange}
                />

                <button
                  type="button"
                  className="media-upload-button"
                  onClick={() =>
                    mediaInputRef.current?.click()
                  }
                >
                  <Plus size={20} />

                  <span>
                    Add Images / Videos
                  </span>
                </button>

                <div className="media-guidelines">
                  <span>
                    Images: maximum 10MB each
                  </span>

                  <span>
                    Videos: maximum 100MB each
                  </span>

                  <span>
                    Maximum {MAX_MEDIA} files
                  </span>
                </div>
              </div>

              {selectedMedia.length > 0 && (
                <div className="project-media-grid">

                  {selectedMedia.map(
                    (media, index) => (
                      <div
                        className="project-media-item"
                        key={media.id}
                      >

                        {media.type === "image" ? (
                          <img
                            src={media.preview}
                            alt={`Project media ${index + 1}`}
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
                            <span className="cover-badge">
                              COVER
                            </span>
                          )}

                        {media.type === "video" && (
                          <span className="video-badge">
                            <Play size={12} />
                            VIDEO
                          </span>
                        )}

                        <button
                          type="button"
                          className="remove-media-button"
                          onClick={() =>
                            removeMedia(media.id)
                          }
                        >
                          <X size={15} />
                        </button>

                      </div>
                    )
                  )}

                </div>
              )}

              {selectedMedia.length === 0 && (
                <div className="empty-media-state">
                  <ImagePlus size={28} />

                  <strong>
                    No project media added
                  </strong>

                  <span>
                    Add high-quality images and
                    videos of your project.
                  </span>
                </div>
              )}

            </div>
          </section>

          {/* AGREEMENT */}
          <section className="project-form-section">
            <div className="section-number">
              05
            </div>

            <div className="section-content">

              <div className="section-heading">
                <ShieldCheck size={21} />

                <div>
                  <h2>
                    Agreement & Authorization
                  </h2>

                  <p>
                    Review the agreement, digitally
                    sign it and confirm the declarations.
                  </p>
                </div>
              </div>

              <div className="agreement-card">

                <div className="agreement-document">

                  <div className="agreement-icon">
                    <FileText size={28} />
                  </div>

                  <div className="agreement-info">
                    <strong>
                      Builder Listing & Commission Agreement
                    </strong>

                    <span>
                      Review the official agreement
                      before submitting your project.
                    </span>
                  </div>

                  <div className="agreement-actions">

                    <a
                      href={AGREEMENT_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="agreement-action"
                    >
                      <ExternalLink size={16} />
                      Open
                    </a>

                    <a
                      href={AGREEMENT_URL}
                      download
                      className="agreement-action"
                    >
                      <FileText size={16} />
                      Download
                    </a>

                  </div>

                </div>

                <div className="signed-agreement-section">

                  <input
                    ref={agreementInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    hidden
                    onChange={handleAgreementChange}
                  />

                  {!signedAgreement ? (
                    <button
                      type="button"
                      className="signed-upload-button"
                      onClick={() =>
                        agreementInputRef.current?.click()
                      }
                    >
                      <Upload size={19} />

                      <div>
                        <strong>
                          Upload Digitally Signed Agreement
                        </strong>

                        <span>
                          PDF, DOC or DOCX · Maximum 15MB
                        </span>
                      </div>
                    </button>
                  ) : (
                    <div className="signed-file-card">

                      <div className="signed-file-icon">
                        <FileText size={22} />
                      </div>

                      <div className="signed-file-info">
                        <strong>
                          {signedAgreementName}
                        </strong>

                        <span>
                          Digitally signed agreement
                        </span>
                      </div>

                      <button
                        type="button"
                        className="remove-agreement"
                        onClick={removeAgreement}
                      >
                        <X size={17} />
                      </button>

                    </div>
                  )}

                </div>

                <div className="agreement-confirmations">

                  <label className="agreement-checkbox">
                    <input
                      type="checkbox"
                      checked={agreementAccepted}
                      onChange={(e) =>
                        setAgreementAccepted(
                          e.target.checked
                        )
                      }
                    />

                    <span className="custom-checkbox">
                      <CheckCircle2 size={15} />
                    </span>

                    <span>
                      I have read, understood and agree
                      to the Builder Listing & Commission
                      Agreement.
                    </span>
                  </label>

                  <label className="agreement-checkbox">
                    <input
                      type="checkbox"
                      checked={informationConfirmed}
                      onChange={(e) =>
                        setInformationConfirmed(
                          e.target.checked
                        )
                      }
                    />

                    <span className="custom-checkbox">
                      <CheckCircle2 size={15} />
                    </span>

                    <span>
                      I confirm that all project
                      information, pricing, descriptions
                      and specifications provided are
                      accurate and complete.
                    </span>
                  </label>

                  <label className="agreement-checkbox">
                    <input
                      type="checkbox"
                      checked={authorizationConfirmed}
                      onChange={(e) =>
                        setAuthorizationConfirmed(
                          e.target.checked
                        )
                      }
                    />

                    <span className="custom-checkbox">
                      <CheckCircle2 size={15} />
                    </span>

                    <span>
                      I confirm that I am authorized to
                      list this project on Xevoprop and
                      submit it for review.
                    </span>
                  </label>

                </div>

                <div className="agreement-notice">
                  <ShieldCheck size={18} />

                  <span>
                    Xevoprop may review, verify, approve,
                    reject or remove project listings
                    according to its listing policies.
                  </span>
                </div>

              </div>
            </div>
          </section>

          {/* ACTIONS */}
          <div className="project-form-actions">

            <button
              type="button"
              className="cancel-project-button"
              onClick={() => navigate(-1)}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="create-project-button"
              disabled={!canCreate}
            >
              {loading ? (
                <>
                  <Loader2
                    size={18}
                    className="spin"
                  />

                  Creating Project...
                </>
              ) : (
                <>
                  <Plus size={18} />

                  Create Project
                </>
              )}
            </button>

          </div>

          {!canCreate && !loading && (
            <p className="create-requirement-note">
              Add at least one project image/video,
              upload the signed agreement and complete
              all declarations to create the project.
            </p>
          )}

        </form>
      </div>
    </div>
  );
};

export default AddProject;