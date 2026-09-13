import { useState } from "react";
import { ArrowLeft, Building2, Plus, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./AddProject.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function AddProject() {
  const navigate = useNavigate();

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
    image: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
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
            type: formData.type,
            units: formData.units
              ? Number(formData.units)
              : null,
            price: formData.price.trim() || null,
            description:
              formData.description.trim() || null,
            status: formData.status,
            image: formData.image.trim() || null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create project."
        );
      }

      alert("Project created successfully!");

      navigate("/my-projects");
    } catch (err) {
      console.error("CREATE PROJECT ERROR:", err);

      setError(
        err.message || "Unable to create project."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-project-page">
      <div className="add-project-container">

        {/* BACK */}
        <button
          type="button"
          className="add-project-back"
          onClick={() => navigate("/my-projects")}
        >
          <ArrowLeft size={16} />
          Back to my projects
        </button>

        {/* HEADER */}
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

        {/* ERROR */}
        {error && (
          <div className="add-project-error">
            {error}
          </div>
        )}

        {/* FORM */}
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

              {/* NAME */}
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

              {/* TYPE */}
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

              {/* STATUS */}
              <div className="project-form-group">
                <label>
                  Status
                </label>

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
                  Add pricing and availability
                  information.
                </p>
              </div>
            </div>

            <div className="project-form-grid">

              <div className="project-form-group">
                <label>
                  Total units
                </label>

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

              <div className="project-form-group full">
                <label>
                  Project image URL
                </label>

                <input
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  placeholder="https://..."
                />
              </div>

              <div className="project-form-group full">
                <label>
                  Description
                </label>

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