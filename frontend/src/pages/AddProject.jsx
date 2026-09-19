import { useRef, useState } from "react";
import {
  ArrowLeft,
  Building2,
  Plus,
  Loader2,
  ImagePlus,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./AddProject.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://xevoprop.onrender.com/api";

function AddProject() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    city: "",
    state: "",
    type: "Apartment",
    units: "",
    price: "",
    description: "",
    status: "Available",
  });

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Image size must be less than 10MB.");
      return;
    }

    setError("");

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    const preview = URL.createObjectURL(file);

    setImage(file);
    setImagePreview(preview);
  };

  const removeImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setImage(null);
    setImagePreview("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadProjectImage = async (projectId, token) => {
    if (!image) return null;

    const imageFormData = new FormData();

    imageFormData.append("image", image);

    const response = await fetch(
      `${API_URL}/upload/project/${projectId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: imageFormData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to upload project image."
      );
    }

    return data.image;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!formData.name.trim()) {
      setError("Project name is required.");
      return;
    }

    if (!formData.location.trim()) {
      setError("Location is required.");
      return;
    }

    if (!formData.type) {
      setError("Project type is required.");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

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

      /* =========================
         CREATE PROJECT
      ========================= */

      const response = await fetch(
        `${API_URL}/projects`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: formData.name.trim(),
            location: completeLocation,
            city: formData.city.trim() || null,
            type: formData.type,
            units: formData.units
              ? Number(formData.units)
              : null,
            price: formData.price.trim() || null,
            description:
              formData.description.trim() || null,
            status: formData.status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create project."
        );
      }

      const projectId = data.project?.id;

      if (!projectId) {
        throw new Error(
          "Project created but project ID was not returned."
        );
      }

      /* =========================
         UPLOAD IMAGE
      ========================= */

      if (image) {
        await uploadProjectImage(
          projectId,
          token
        );
      }

      alert("Project created successfully!");

      navigate("/my-projects");
    } catch (err) {
      console.error(
        "CREATE PROJECT ERROR:",
        err
      );

      setError(
        err.message ||
          "Unable to create project."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-project-page">
      <div className="add-project-container">

        <button
          type="button"
          className="add-project-back"
          onClick={() => navigate("/my-projects")}
        >
          <ArrowLeft size={16} />
          Back to my projects
        </button>

        <div className="add-project-header">
          <div className="add-project-icon">
            <Building2 size={22} />
          </div>

          <div>
            <span>DEVELOPER SPACE</span>

            <h1>Create Project</h1>

            <p>
              Add a new property project to
              Xevoprop.
            </p>
          </div>
        </div>

        {error && (
          <div className="add-project-error">
            {error}
          </div>
        )}

        <form
          className="add-project-form"
          onSubmit={handleSubmit}
        >

          {/* BASIC INFORMATION */}

          <section className="project-form-section">
            <div className="project-form-heading">
              <span>01</span>

              <div>
                <h2>Basic information</h2>
                <p>
                  Tell buyers about your project.
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
                  placeholder="e.g. Green Valley Residency"
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
                <label>Status</label>

                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="Available">
                    Available
                  </option>
                  <option value="Upcoming">
                    Upcoming
                  </option>
                  <option value="Sold Out">
                    Sold Out
                  </option>
                  <option value="Completed">
                    Completed
                  </option>
                  <option value="Draft">
                    Draft
                  </option>
                </select>
              </div>

            </div>
          </section>

          {/* LOCATION */}

          <section className="project-form-section">
            <div className="project-form-heading">
              <span>02</span>

              <div>
                <h2>Project location</h2>
                <p>
                  Where is the project located?
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
                  placeholder="e.g. Gachibowli"
                  required
                />
              </div>

              <div className="project-form-group">
                <label>City</label>

                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="e.g. Hyderabad"
                />
              </div>

              <div className="project-form-group">
                <label>State</label>

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

          {/* PROJECT DETAILS */}

          <section className="project-form-section">
            <div className="project-form-heading">
              <span>03</span>

              <div>
                <h2>Project details</h2>
                <p>
                  Add pricing, image and
                  availability information.
                </p>
              </div>
            </div>

            <div className="project-form-grid">

              <div className="project-form-group">
                <label>Total units</label>

                <input
                  type="number"
                  name="units"
                  min="0"
                  value={formData.units}
                  onChange={handleChange}
                  placeholder="e.g. 120"
                />
              </div>

              <div className="project-form-group">
                <label>Price</label>

                <input
                  type="text"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="e.g. ₹65 Lakhs onwards"
                />
              </div>

              {/* IMAGE UPLOAD */}

              <div className="project-form-group full">
                <label>
                  Project image
                </label>

                {!imagePreview ? (
                  <button
                    type="button"
                    className="project-image-upload"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                  >
                    <ImagePlus size={28} />

                    <strong>
                      Upload project image
                    </strong>

                    <span>
                      JPG, PNG or WEBP · Max 10MB
                    </span>

                    <em>
                      Choose Image
                    </em>
                  </button>
                ) : (
                  <div className="project-image-preview">
                    <img
                      src={imagePreview}
                      alt="Project preview"
                    />

                    <div className="project-image-overlay">
                      <button
                        type="button"
                        onClick={() =>
                          fileInputRef.current?.click()
                        }
                      >
                        Change Image
                      </button>

                      <button
                        type="button"
                        onClick={removeImage}
                        aria-label="Remove image"
                      >
                        <X size={17} />
                      </button>
                    </div>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleImageChange}
                  hidden
                />
              </div>

              {/* DESCRIPTION */}

              <div className="project-form-group full">
                <label>Description</label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the project, amenities, connectivity and other important details..."
                  rows="6"
                />
              </div>

            </div>
          </section>

          {/* ACTIONS */}

          <div className="add-project-actions">

            <button
              type="button"
              className="project-cancel-btn"
              onClick={() =>
                navigate("/my-projects")
              }
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="project-create-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2
                    size={17}
                    className="project-loading"
                  />
                  Creating...
                </>
              ) : (
                <>
                  <Plus size={17} />
                  Create Project
                </>
              )}
            </button>

          </div>
        </form>
      </div>
    </div>
  );
}

export default AddProject;