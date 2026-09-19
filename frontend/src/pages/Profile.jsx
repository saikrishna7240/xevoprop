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
            data.message ||
              "Failed to load profile."
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
        console.error(
          "Load profile error:",
          err
        );

        if (!cancelled) {
          setError(
            err.message ||
              "Unable to load profile."
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
          data.message ||
            "Failed to update profile."
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

      setSuccess(
        "Profile updated successfully."
      );

      const storedUser =
        localStorage.getItem("user");

      if (storedUser) {
        try {
          const parsedUser =
            JSON.parse(storedUser);

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
      console.error(
        "Update profile error:",
        err
      );

      setError(
        err.message ||
          "Unable to update profile."
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
      setError(
        "Please enter your current password."
      );
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
          data.message ||
            "Failed to update password."
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

      setSuccess(
        "Password updated successfully."
      );
    } catch (err) {
      console.error(
        "Update password error:",
        err
      );

      setError(
        err.message ||
          "Unable to update password."
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
    if (!user?.name) {
      return "U";
    }

    return user.name
      .trim()
      .charAt(0)
      .toUpperCase();
  };

  const getRole = () => {
    if (!user?.role) {
      return "User";
    }

    return (
      user.role.charAt(0).toUpperCase() +
      user.role.slice(1)
    );
  };

  if (loading) {
    return (
      <div className="my-profile-page">
        <div className="my-profile-container">
          <div className="profile-card">
            <div className="profile-loading">
              Loading profile...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-profile-page">
      <div className="my-profile-container">

        <div className="my-profile-header">
          <button
            type="button"
            className="profile-back-button"
            onClick={() => navigate(-1)}
            title="Go back"
          >
            <ArrowLeft size={19} />
          </button>

          <div>
            <h1>My Profile</h1>
            <p>
              Manage your Xevoprop account
              information.
            </p>
          </div>
        </div>

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

        <div className="profile-card">

          <div className="profile-card-top">
            <div className="profile-avatar">
              {getInitial()}
            </div>

            <div className="profile-main-info">
              <h2>
                {user?.name || "User"}
              </h2>

              <p>
                {user?.email ||
                  "No email available"}
              </p>

              <span className="profile-role">
                <Shield size={13} />
                {getRole()}
              </span>
            </div>
          </div>

          <div className="profile-details">

            <div className="profile-section-title">
              <User size={20} />

              <h3>
                Personal Information
              </h3>
            </div>

            {!editing ? (
              <>
                <div className="profile-grid">

                  <div className="profile-info-item">
                    <div className="profile-info-label">
                      <User size={14} />
                      Full Name
                    </div>

                    <div className="profile-info-value">
                      {user?.name ||
                        "Not provided"}
                    </div>
                  </div>

                  <div className="profile-info-item">
                    <div className="profile-info-label">
                      <Mail size={14} />
                      Email
                    </div>

                    <div className="profile-info-value">
                      {user?.email ||
                        "Not provided"}
                    </div>
                  </div>

                  <div className="profile-info-item">
                    <div className="profile-info-label">
                      <Phone size={14} />
                      Phone
                    </div>

                    <div className="profile-info-value">
                      {user?.phone ||
                        "Not provided"}
                    </div>
                  </div>

                  <div className="profile-info-item">
                    <div className="profile-info-label">
                      <Shield size={14} />
                      Account Type
                    </div>

                    <div className="profile-info-value">
                      {getRole()}
                    </div>
                  </div>

                </div>

                <div className="profile-actions">
                  <button
                    type="button"
                    className="profile-edit-button"
                    onClick={() => {
                      setError("");
                      setSuccess("");
                      setEditing(true);
                    }}
                  >
                    <Edit3 size={16} />
                    Edit Profile
                  </button>

                  <button
                    type="button"
                    className="profile-password-button"
                    onClick={() => {
                      setError("");
                      setSuccess("");
                      setShowPasswordSection(
                        (previous) => !previous
                      );
                    }}
                  >
                    <KeyRound size={16} />
                    {showPasswordSection
                      ? "Close Password"
                      : "Update Password"}
                  </button>
                </div>
              </>
            ) : (
              <form
                className="profile-edit-form"
                onSubmit={handleSave}
              >
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
                    Email
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
                    Phone
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

                <div className="profile-actions">
                  <button
                    type="button"
                    className="profile-cancel-button"
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    <X size={16} />
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="profile-save-button"
                    disabled={saving}
                  >
                    <Save size={16} />

                    {saving
                      ? "Saving..."
                      : "Save Changes"}
                  </button>
                </div>
              </form>
            )}

            {showPasswordSection && (
              <form
                className="password-update-card"
                onSubmit={handleChangePassword}
              >
                <div className="password-update-header">
                  <div className="password-update-icon">
                    <LockKeyhole size={19} />
                  </div>

                  <div>
                    <h3>Update Password</h3>
                    <p>
                      Choose a new password to
                      keep your account secure.
                    </p>
                  </div>
                </div>

                <div className="password-update-fields">

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
                        onChange={
                          handlePasswordChange
                        }
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
                        value={
                          passwordData.newPassword
                        }
                        onChange={
                          handlePasswordChange
                        }
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
                        onChange={
                          handlePasswordChange
                        }
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

                <div className="password-update-actions">
                  <button
                    type="button"
                    className="profile-cancel-button"
                    onClick={() => {
                      setPasswordData({
                        currentPassword: "",
                        newPassword: "",
                        confirmPassword: "",
                      });

                      setShowPasswordSection(false);
                    }}
                    disabled={changingPassword}
                  >
                    <X size={16} />
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="profile-save-button"
                    disabled={changingPassword}
                  >
                    <LockKeyhole size={16} />

                    {changingPassword
                      ? "Updating..."
                      : "Update Password"}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;