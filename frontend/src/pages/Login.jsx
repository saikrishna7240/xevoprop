import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../lib/api";
import "./Auth.css";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const data = await apiFetch("/auth/login", { method: "POST", body: JSON.stringify({ email: e.target.email.value.trim(), password: e.target.password.value }) });
      login(data);
      localStorage.setItem("username", data.user.name || data.user.username || "");
      navigate("/dashboard");
    } catch (error) { setError(error.message || "Unable to login"); } finally { setLoading(false); }
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
          WELCOME BACK
        </span>

        <h1>
          Sign in to Xevoprop
        </h1>

        <p className="auth-subtitle">
          Continue your property discovery
          journey.
        </p>

        <form
          className="auth-form"
          onSubmit={handleLogin}
        >

          <div className="auth-field">

            <label>
              Email address
            </label>

            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              required
            />

          </div>

          <div className="auth-field">

            <label>
              Password
            </label>

            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              required
            />

          </div>

          {error && (
            <div
              style={{
                color: "#ff6b6b",
                fontSize: "11px",
                marginTop: "5px",
                textAlign: "center",
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading
              ? "Signing in..."
              : "Sign in"}
          </button>

        </form>

        <p className="auth-switch">

          Don't have an account?{" "}

          <Link to="/register">
            Create one
          </Link>

        </p>

      </div>

    </div>
  );
}

export default Login;