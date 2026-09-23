import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../lib/api";
import "./Auth.css";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] =
    useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const data = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          phone: phone.trim(),
          password,
        }),
      });

      if (!data.token) {
        throw new Error(
          "Login completed, but authentication token was not received."
        );
      }

      login(data);

      localStorage.setItem(
        "username",
        data.user?.name ||
          data.user?.username ||
          ""
      );

      if (data.user?.role === "Admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      setError(
        error.message ||
          "Unable to login."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        <img
          src="/xevoprop-logo.jpeg"
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

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        <form
          className="auth-form"
          onSubmit={handleLogin}
        >
          <div className="auth-field">
            <label>
              Mobile number
            </label>

            <input
              type="tel"
              name="phone"
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value)
              }
              placeholder="+91 XXXXX XXXXX"
              autoComplete="tel"
              required
            />
          </div>

          <div className="auth-field">
            <label>
              Password
            </label>

            <div className="password-input-wrapper">
              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                name="password"
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword(
                    (previous) =>
                      !previous
                  )
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showPassword ? (
                  <EyeOff size={17} />
                ) : (
                  <Eye size={17} />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading
              ? "Signing in..."
              : "Sign In"}
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