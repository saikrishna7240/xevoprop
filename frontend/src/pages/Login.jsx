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

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [step, setStep] = useState("credentials");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [otp, setOtp] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

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
     LOGIN
     EMAIL + PASSWORD → EMAIL OTP
  ============================================================ */

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    const cleanEmail = email
      .trim()
      .toLowerCase();

    if (!cleanEmail || !password) {
      setError(
        "Email and password are required."
      );
      return;
    }

    setLoading(true);

    try {
      const data = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: cleanEmail,
          password,
        }),
      });

      /*
        Backend should return requiresOtp:true.
        JWT is NOT returned at this stage.
      */

      if (!data.requiresOtp) {
        throw new Error(
          "Unable to start email verification."
        );
      }

      setEmail(cleanEmail);
      setOtp("");
      setResendTimer(30);

      setStep("otp");
    } catch (error) {
      setError(
        error.message ||
          "Unable to sign in."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ============================================================
     VERIFY LOGIN OTP
     EMAIL OTP → JWT
  ============================================================ */

  const handleVerifyOTP = async (e) => {
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
        "/auth/verify-login-otp",
        {
          method: "POST",
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            otp: cleanOtp,
          }),
        }
      );

      if (!data.token) {
        throw new Error(
          "Verification succeeded, but authentication token was not received."
        );
      }

      /*
        JWT is stored through AuthContext
        only after successful OTP verification.
      */

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
          "Invalid or expired OTP."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ============================================================
     RESEND LOGIN OTP
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
            email: email.trim().toLowerCase(),
            purpose: "login",
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
     BACK TO LOGIN
  ============================================================ */

  const handleBack = () => {
    setStep("credentials");
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
          src="/xevoprop-logo.jpeg"
          alt="Xevoprop"
          className="auth-logo"
        />

        {/* ======================================================
            LOGIN CREDENTIALS
        ====================================================== */}

        {step === "credentials" && (
          <>
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

              {/* EMAIL */}

              <div className="auth-field">
                <label>
                  Email address
                </label>

                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="you@example.com"
                  autoComplete="email"
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

              {/* SUBMIT */}

              <button
                type="submit"
                className="auth-submit"
                disabled={loading}
              >
                {loading
                  ? "Checking..."
                  : "Continue"}
              </button>
            </form>

            <p className="auth-switch">
              Don't have an account?{" "}
              <Link to="/register">
                Create account
              </Link>
            </p>
          </>
        )}

        {/* ======================================================
            EMAIL OTP
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
              VERIFY YOUR EMAIL
            </span>

            <h1>
              Verify your sign in
            </h1>

            <p className="auth-subtitle">
              We've sent a 6-digit OTP to{" "}
              <strong>
                {email}
              </strong>
            </p>

            {error && (
              <div className="auth-error">
                {error}
              </div>
            )}

            <form
              className="auth-form"
              onSubmit={handleVerifyOTP}
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
                  : "Verify & Sign In"}
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

export default Login;