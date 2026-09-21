import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../lib/api";
import "./Auth.css";

function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [step, setStep] = useState("register");

  const [role, setRole] = useState("Buyer");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [otp, setOtp] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] =
    useState(false);

  const [resendLoading, setResendLoading] =
    useState(false);

  const [resendTimer, setResendTimer] =
    useState(30);

  /* ============================================================
     OTP COUNTDOWN
  ============================================================ */

  useEffect(() => {
    if (step !== "otp") {
      return;
    }

    if (resendTimer <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setResendTimer((previous) =>
        Math.max(previous - 1, 0)
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [step, resendTimer]);

  /* ============================================================
     INPUT HANDLER
  ============================================================ */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* ============================================================
     REGISTER
  ============================================================ */

  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const data = await apiFetch(
        "/auth/register",
        {
          method: "POST",
          body: JSON.stringify({
            name: formData.name.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim(),
            password: formData.password,
            role,
          }),
        }
      );

      /*
        Backend now creates the account and
        sends an OTP instead of returning JWT.
      */

      if (data.requiresOtp) {
        setStep("otp");
        setOtp("");
        setResendTimer(30);

        return;
      }

      /*
        Fallback in case backend returns a token.
      */

      if (data.token) {
        completeRegistration(data);
      }
    } catch (error) {
      setError(
        error.message ||
          "Unable to create account."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ============================================================
     VERIFY REGISTRATION OTP
  ============================================================ */

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    setError("");

    const cleanOtp = otp.trim();

    if (!/^\d{6}$/.test(cleanOtp)) {
      setError(
        "Please enter the 6-digit OTP."
      );
      return;
    }

    setLoading(true);

    try {
      const data = await apiFetch(
        "/auth/verify-otp",
        {
          method: "POST",
          body: JSON.stringify({
            phone: formData.phone.trim(),
            otp: cleanOtp,
            purpose: "REGISTER",
          }),
        }
      );

      if (!data.token) {
        throw new Error(
          "Registration verification failed"
        );
      }

      completeRegistration(data);
    } catch (error) {
      setError(
        error.message ||
          "Invalid or expired OTP."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ============================================================
     COMPLETE REGISTRATION
  ============================================================ */

  const completeRegistration = (data) => {
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
  };

  /* ============================================================
     RESEND OTP
  ============================================================ */

  const handleResendOtp = async () => {
    if (
      resendTimer > 0 ||
      resendLoading
    ) {
      return;
    }

    setError("");
    setResendLoading(true);

    try {
      await apiFetch(
        "/auth/resend-otp",
        {
          method: "POST",
          body: JSON.stringify({
            phone: formData.phone.trim(),
            purpose: "REGISTER",
          }),
        }
      );

      setOtp("");
      setResendTimer(30);
    } catch (error) {
      setError(
        error.message ||
          "Unable to resend OTP."
      );
    } finally {
      setResendLoading(false);
    }
  };

  /* ============================================================
     BACK TO REGISTER
  ============================================================ */

  const handleBack = () => {
    setStep("register");
    setOtp("");
    setError("");
    setResendTimer(30);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        {/* ======================================================
            LOGO
        ====================================================== */}

        <img
          src="/logo.png"
          alt="Xevoprop"
          className="auth-logo"
        />

        {/* ======================================================
            REGISTRATION STEP
        ====================================================== */}

        {step === "register" && (
          <>
            <span className="auth-label">
              JOIN XEVOPROP
            </span>

            <h1>
              Create your account
            </h1>

            <p className="auth-subtitle">
              Join a smarter and more direct
              real-estate ecosystem.
            </p>

            {error && (
              <div className="auth-error auth-register-error">
                {error}
              </div>
            )}

            <form
              className="auth-form"
              onSubmit={handleRegister}
            >

              {/* FULL NAME */}

              <div className="auth-field">
                <label>
                  Full name
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  autoComplete="name"
                  required
                />
              </div>

              {/* EMAIL */}

              <div className="auth-field">
                <label>
                  Email address
                </label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </div>

              {/* PHONE */}

              <div className="auth-field">
                <label>
                  Mobile number
                </label>

                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 XXXXX XXXXX"
                  autoComplete="tel"
                  required
                />
              </div>

              {/* PASSWORD */}

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
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a password"
                    autoComplete="new-password"
                    minLength="6"
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

                <span className="password-hint">
                  Minimum 6 characters
                </span>
              </div>

              {/* ROLE */}

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

              {/* SUBMIT */}

              <button
                type="submit"
                className="auth-submit"
                disabled={loading}
              >
                {loading
                  ? "Sending OTP..."
                  : "Continue"}
              </button>
            </form>

            <p className="auth-switch">
              Already have an account?{" "}
              <Link to="/login">
                Sign in
              </Link>
            </p>
          </>
        )}

        {/* ======================================================
            OTP STEP
        ====================================================== */}

        {step === "otp" && (
          <>
            <button
              type="button"
              className="otp-back-button"
              onClick={handleBack}
            >
              <ArrowLeft size={17} />
              Back
            </button>

            <div className="otp-icon">
              <ShieldCheck size={27} />
            </div>

            <span className="auth-label">
              VERIFY YOUR NUMBER
            </span>

            <h1>
              Verify your account
            </h1>

            <p className="auth-subtitle">
              We've sent a 6-digit OTP to
              <strong>
                {" "}
                {formData.phone}
              </strong>
            </p>

            {error && (
              <div className="auth-error auth-register-error">
                {error}
              </div>
            )}

            <form
              className="auth-form"
              onSubmit={handleVerifyOtp}
            >
              <div className="auth-field">
                <label>
                  Verification code
                </label>

                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => {
                    const value =
                      e.target.value.replace(
                        /\D/g,
                        ""
                      );

                    setOtp(value);
                  }}
                  placeholder="Enter 6-digit OTP"
                  className="otp-input"
                  autoFocus
                  required
                />
              </div>

              <button
                type="submit"
                className="auth-submit"
                disabled={
                  loading ||
                  otp.length !== 6
                }
              >
                {loading
                  ? "Verifying..."
                  : "Verify & Create Account"}
              </button>
            </form>

            <div className="otp-resend">
              <span>
                Didn't receive the OTP?
              </span>

              {resendTimer > 0 ? (
                <span className="otp-timer">
                  Resend in {resendTimer}s
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendLoading}
                >
                  {resendLoading
                    ? "Sending..."
                    : "Resend OTP"}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Register;