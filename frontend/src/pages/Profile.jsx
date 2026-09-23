import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Shield,
  Edit3,
  Save,
  X,
  LockKeyhole,
  Eye,
  EyeOff,
  KeyRound,
} from "lucide-react";

import "./Profile.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://xevoprop.onrender.com/api";

function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [editing, setEditing] = useState(false);
  const [showPasswordSection, setShowPasswordSection] =
    useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login");
          return;
        }

        const response = await fetch(
          `${API_URL}/users/profile`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load profile."
          );
        }

        const profile = data.user || data;

        if (!cancelled) {
          setUser(profile);

          setFormData({
            name: profile.name || "",
            email: profile.email || "",
            phone: profile.phone || "",
          });
        }
      } catch (err) {
        console.error("Load profile error:", err);

        if (!cancelled) {
          setError(
            err.message || "Unable to load profile."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;

    setPasswordData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const togglePassword = (field) => {
    setShowPasswords((previous) => ({
      ...previous,
      [field]: !previous[field],
    }));
  };

  const handleSave = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        `${API_URL}/users/profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update profile."
        );
      }

      const updatedUser = data.user || data;

      setUser(updatedUser);

      setFormData({
        name: updatedUser.name || "",
        email: updatedUser.email || "",
        phone: updatedUser.phone || "",
      });

      setEditing(false);

      setSuccess("Profile updated successfully.");

      const storedUser =
        localStorage.getItem("user");

      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);

          localStorage.setItem(
            "user",
            JSON.stringify({
              ...parsedUser,
              ...updatedUser,
            })
          );
        } catch {
          // Ignore invalid local user data.
        }
      }
    } catch (err) {
      console.error("Update profile error:", err);

      setError(
        err.message || "Unable to update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const {
      currentPassword,
      newPassword,
      confirmPassword,
    } = passwordData;

    if (!currentPassword) {
      setError("Please enter your current password.");
      return;
    }

    if (newPassword.length < 6) {
      setError(
        "New password must be at least 6 characters."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(
        "New password and confirmation do not match."
      );
      return;
    }

    if (currentPassword === newPassword) {
      setError(
        "New password must be different from your current password."
      );
      return;
    }

    try {
      setChangingPassword(true);

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        `${API_URL}/users/password`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update password."
        );
      }

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setShowPasswords({
        current: false,
        new: false,
        confirm: false,
      });

      setShowPasswordSection(false);

      setSuccess("Password updated successfully.");
    } catch (err) {
      console.error("Update password error:", err);

      setError(
        err.message || "Unable to update password."
      );
    } finally {
      setChangingPassword(false);
    }
  };

  const handleCancel = () => {
    setError("");
    setSuccess("");

    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
    });

    setEditing(false);
  };

  const getInitial = () => {
    if (!user?.name) return "U";

    return user.name
      .trim()
      .charAt(0)
      .toUpperCase();
  };

  const getRole = () => {
    if (!user?.role) return "User";

    return (
      user.role.charAt(0).toUpperCase() +
      user.role.slice(1)
    );
  };

  if (loading) {
    return (
      <div className="my-profile-page">
        <div className="my-profile-container">
          <div className="profile-loading-card">
            <div className="profile-loading-spinner" />
            <span>Loading profile...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-profile-page">
      <div className="my-profile-container">

        {/* HEADER */}

        <header className="my-profile-header">
          <button
            type="button"
            className="profile-back-button"
            onClick={() => navigate(-1)}
            title="Go back"
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <span className="profile-eyebrow">
              ACCOUNT
            </span>

            <h1>My Profile</h1>

            <p>
              Manage your Xevoprop account information
              and security.
            </p>
          </div>
        </header>

        {/* ALERTS */}

        {error && (
          <div className="profile-alert profile-error">
            {error}
          </div>
        )}

        {success && (
          <div className="profile-alert profile-success">
            {success}
          </div>
        )}

        {/* ACCOUNT SUMMARY */}

        <section className="profile-account-card">
          <div className="profile-avatar">
            {getInitial()}
          </div>

          <div className="profile-account-info">
            <h2>{user?.name || "User"}</h2>

            <p>
              {user?.email || "No email available"}
            </p>

            <span className="profile-role">
              <Shield size={13} />
              {getRole()}
            </span>
          </div>

          <div className="profile-account-meta">
            <span>ACCOUNT TYPE</span>
            <strong>{getRole()}</strong>
          </div>
        </section>

        {/* PERSONAL INFORMATION */}

        <section className="profile-section">
          <div className="profile-section-header">
            <div>
              <span className="profile-section-label">
                PERSONAL DETAILS
              </span>

              <h2>Personal Information</h2>

              <p>
                Your basic account information used
                across Xevoprop.
              </p>
            </div>

            {!editing && (
              <button
                type="button"
                className="profile-edit-button"
                onClick={() => {
                  setError("");
                  setSuccess("");
                  setEditing(true);
                }}
              >
                <Edit3 size={15} />
                Edit Profile
              </button>
            )}
          </div>

          {!editing ? (
            <div className="profile-info-grid">

              <div className="profile-info-item">
                <div className="profile-info-icon">
                  <User size={16} />
                </div>

                <div>
                  <span>Full Name</span>
                  <strong>
                    {user?.name || "Not provided"}
                  </strong>
                </div>
              </div>

              <div className="profile-info-item">
                <div className="profile-info-icon">
                  <Mail size={16} />
                </div>

                <div>
                  <span>Email Address</span>
                  <strong>
                    {user?.email || "Not provided"}
                  </strong>
                </div>
              </div>

              <div className="profile-info-item">
                <div className="profile-info-icon">
                  <Phone size={16} />
                </div>

                <div>
                  <span>Phone Number</span>
                  <strong>
                    {user?.phone || "Not provided"}
                  </strong>
                </div>
              </div>

              <div className="profile-info-item">
                <div className="profile-info-icon">
                  <Shield size={16} />
                </div>

                <div>
                  <span>Account Type</span>
                  <strong>{getRole()}</strong>
                </div>
              </div>

            </div>
          ) : (
            <form
              className="profile-edit-form"
              onSubmit={handleSave}
            >
              <div className="profile-form-grid">

                <div className="profile-form-group">
                  <label htmlFor="name">
                    Full Name
                  </label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    required
                  />
                </div>

                <div className="profile-form-group">
                  <label htmlFor="email">
                    Email Address
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div className="profile-form-group">
                  <label htmlFor="phone">
                    Phone Number
                  </label>

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                  />
                </div>

              </div>

              <div className="profile-form-actions">
                <button
                  type="button"
                  className="profile-cancel-button"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  <X size={15} />
                  Cancel
                </button>

                <button
                  type="submit"
                  className="profile-save-button"
                  disabled={saving}
                >
                  <Save size={15} />
                  {saving
                    ? "Saving..."
                    : "Save Changes"}
                </button>
              </div>
            </form>
          )}
        </section>

        {/* SECURITY */}

        <section className="profile-section security-section">
          <div className="profile-section-header">
            <div>
              <span className="profile-section-label">
                ACCOUNT SECURITY
              </span>

              <h2>Password & Security</h2>

              <p>
                Keep your account protected with a
                strong password.
              </p>
            </div>

            {!showPasswordSection && (
              <button
                type="button"
                className="profile-password-button"
                onClick={() => {
                  setError("");
                  setSuccess("");
                  setShowPasswordSection(true);
                }}
              >
                <KeyRound size={15} />
                Update Password
              </button>
            )}
          </div>

          {!showPasswordSection ? (
            <div className="security-summary">
              <div className="security-summary-icon">
                <LockKeyhole size={19} />
              </div>

              <div>
                <strong>Password protected</strong>

                <span>
                  Your account password is securely
                  managed.
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setError("");
                  setSuccess("");
                  setShowPasswordSection(true);
                }}
              >
                Change password
              </button>
            </div>
          ) : (
            <form
              className="password-update-form"
              onSubmit={handleChangePassword}
            >
              <div className="password-update-heading">
                <div className="password-update-icon">
                  <LockKeyhole size={18} />
                </div>

                <div>
                  <h3>Update Password</h3>
                  <p>
                    Enter your current password and
                    choose a new one.
                  </p>
                </div>
              </div>

              <div className="password-fields">

                <div className="profile-form-group">
                  <label htmlFor="currentPassword">
                    Current Password
                  </label>

                  <div className="profile-password-input">
                    <input
                      id="currentPassword"
                      name="currentPassword"
                      type={
                        showPasswords.current
                          ? "text"
                          : "password"
                      }
                      value={
                        passwordData.currentPassword
                      }
                      onChange={handlePasswordChange}
                      placeholder="Enter current password"
                      required
                    />

                    <button
                      type="button"
                      onClick={() =>
                        togglePassword("current")
                      }
                      aria-label={
                        showPasswords.current
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showPasswords.current ? (
                        <EyeOff size={17} />
                      ) : (
                        <Eye size={17} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="profile-form-group">
                  <label htmlFor="newPassword">
                    New Password
                  </label>

                  <div className="profile-password-input">
                    <input
                      id="newPassword"
                      name="newPassword"
                      type={
                        showPasswords.new
                          ? "text"
                          : "password"
                      }
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter new password"
                      minLength="6"
                      required
                    />

                    <button
                      type="button"
                      onClick={() =>
                        togglePassword("new")
                      }
                      aria-label={
                        showPasswords.new
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showPasswords.new ? (
                        <EyeOff size={17} />
                      ) : (
                        <Eye size={17} />
                      )}
                    </button>
                  </div>

                  <span className="profile-password-hint">
                    Minimum 6 characters
                  </span>
                </div>

                <div className="profile-form-group">
                  <label htmlFor="confirmPassword">
                    Confirm New Password
                  </label>

                  <div className="profile-password-input">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={
                        showPasswords.confirm
                          ? "text"
                          : "password"
                      }
                      value={
                        passwordData.confirmPassword
                      }
                      onChange={handlePasswordChange}
                      placeholder="Confirm new password"
                      minLength="6"
                      required
                    />

                    <button
                      type="button"
                      onClick={() =>
                        togglePassword("confirm")
                      }
                      aria-label={
                        showPasswords.confirm
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showPasswords.confirm ? (
                        <EyeOff size={17} />
                      ) : (
                        <Eye size={17} />
                      )}
                    </button>
                  </div>
                </div>

              </div>

              <div className="profile-form-actions">
                <button
                  type="button"
                  className="profile-cancel-button"
                  onClick={() => {
                    setPasswordData({
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: "",
                    });

                    setShowPasswords({
                      current: false,
                      new: false,
                      confirm: false,
                    });

                    setShowPasswordSection(false);
                  }}
                  disabled={changingPassword}
                >
                  <X size={15} />
                  Cancel
                </button>

                <button
                  type="submit"
                  className="profile-save-button"
                  disabled={changingPassword}
                >
                  <LockKeyhole size={15} />
                  {changingPassword
                    ? "Updating..."
                    : "Update Password"}
                </button>
              </div>
            </form>
          )}
        </section>

      </div>
    </div>
  );
}

export default Profile;