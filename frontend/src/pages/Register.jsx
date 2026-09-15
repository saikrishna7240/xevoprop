import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../lib/api";
import "./Auth.css";

function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [role, setRole] = useState("Buyer");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault(); setError(""); setLoading(true);
    const formData = new FormData(e.target);
    try {
      const data = await apiFetch("/auth/register", { method: "POST", body: JSON.stringify({ name: formData.get("name"), email: formData.get("email"), phone: formData.get("phone"), password: formData.get("password"), role }) });
      login(data);
      navigate("/dashboard");
    } catch (error) { setError(error.message || "Unable to create account."); } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">

      <div className="auth-card">

        <img
          src="/logo.png"
          alt="Xevoprop"
          className="auth-logo"
        />

        <span className="auth-label">
          JOIN XEVOPROP
        </span>

        <h1>Create your account</h1>

        <p className="auth-subtitle">
          Join a smarter and more direct
          real-estate ecosystem.
        </p>

        {error && (
          <div
            style={{
              marginBottom: "15px",
              padding: "10px",
              borderRadius: "7px",
              border:
                "1px solid rgba(255,107,107,0.2)",
              background:
                "rgba(255,107,107,0.05)",
              color: "#ff6b6b",
              fontSize: "10px",
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

        <form
          className="auth-form"
          onSubmit={handleRegister}
        >

          <div className="auth-field">
            <label>Full name</label>

            <input
              type="text"
              name="name"
              placeholder="Your name"
              required
            />
          </div>

          <div className="auth-field">
            <label>Email address</label>

            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="auth-field">
            <label>Phone number</label>

            <input
              type="tel"
              name="phone"
              placeholder="+91 XXXXX XXXXX"
              required
            />
          </div>

          <div className="auth-field">
            <label>Password</label>

            <input
              type="password"
              name="password"
              placeholder="Create a password"
              minLength="6"
              required
            />
          </div>

          <p className="role-title">
            I am joining as
          </p>

          <div className="role-grid">

            {[
              "Buyer",
              "Seller",
              "Developer",
            ].map((item) => (
              <button
                type="button"
                key={item}
                className={
                  role === item
                    ? "role-option active"
                    : "role-option"
                }
                onClick={() =>
                  setRole(item)
                }
              >
                {item}
              </button>
            ))}

          </div>

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading
              ? "Creating account..."
              : "Create account"}
          </button>

        </form>

        <p className="auth-switch">
          Already have an account?{" "}
          <Link to="/login">
            Sign in
          </Link>
        </p>

      </div>

    </div>
  );
}

export default Register;