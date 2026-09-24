import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  Eye,
  EyeOff,
  ArrowLeft,
  Mail,
  ShieldCheck,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../lib/api";

import "./Auth.css";


function Login() {

  const navigate =
    useNavigate();

  const { login } =
    useAuth();


  const [step, setStep] =
    useState("credentials");


  const [email, setEmail] =
    useState("");


  const [password, setPassword] =
    useState("");


  const [otp, setOtp] =
    useState("");


  const [error, setError] =
    useState("");


  const [loading, setLoading] =
    useState(false);


  const [showPassword, setShowPassword] =
    useState(false);


  /* ============================================================
     LOGIN
  ============================================================ */

  const handleLogin =
    async (e) => {

      e.preventDefault();

      setError("");
      setLoading(true);

      try {

        const data =
          await apiFetch(
            "/auth/login",
            {
              method: "POST",

              body: JSON.stringify({
                email:
                  email
                    .trim()
                    .toLowerCase(),

                password,
              }),
            }
          );


        if (
          !data.requiresOtp
        ) {

          throw new Error(
            "Unable to start email verification."
          );
        }


        setStep("otp");

      } catch (error) {

        setError(
          error.message ||
            "Unable to login."
        );

      } finally {

        setLoading(false);
      }
    };


  /* ============================================================
     VERIFY LOGIN OTP
  ============================================================ */

  const handleVerifyOTP =
    async (e) => {

      e.preventDefault();

      setError("");
      setLoading(true);

      try {

        const data =
          await apiFetch(
            "/auth/verify-login-otp",
            {
              method: "POST",

              body: JSON.stringify({
                email:
                  email
                    .trim()
                    .toLowerCase(),

                otp:
                  otp.trim(),
              }),
            }
          );


        if (
          !data.token
        ) {

          throw new Error(
            "OTP verified, but authentication token was not received."
          );
        }


        /* JWT ONLY AFTER OTP */

        login(data);


        localStorage.setItem(
          "username",
          data.user?.name ||
            data.user?.username ||
            ""
        );


        if (
          data.user?.role ===
          "Admin"
        ) {

          navigate("/admin");

        } else {

          navigate("/dashboard");
        }

      } catch (error) {

        setError(
          error.message ||
            "Unable to verify code."
        );

      } finally {

        setLoading(false);
      }
    };


  /* ============================================================
     BACK
  ============================================================ */

  const handleBack = () => {

    setStep("credentials");

    setOtp("");

    setError("");
  };


  return (

    <div className="auth-page">

      <div className="auth-card">

        <img
          src="/xevoprop-logo.jpeg"
          alt="Xevoprop"
          className="auth-logo"
        />


        {step === "credentials" ? (

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

              <div className="auth-field">

                <label>
                  Email address
                </label>


                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(
                      e.target.value
                    )
                  }
                  placeholder="you@gmail.com"
                  autoComplete="email"
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
                  ? "Checking..."
                  : "Continue"}

              </button>

            </form>


            <p className="auth-switch">

              Don't have an account?{" "}

              <Link to="/register">
                Create one
              </Link>

            </p>

          </>

        ) : (

          <>

            <button
              type="button"
              className="auth-back-button"
              onClick={handleBack}
            >

              <ArrowLeft size={16} />

              Back

            </button>


            <div className="auth-otp-icon">

              <ShieldCheck
                size={28}
              />

            </div>


            <span className="auth-label">
              VERIFY YOUR LOGIN
            </span>


            <h1>
              Enter verification code
            </h1>


            <p className="auth-subtitle">

              We sent a 6-digit verification
              code to

              <strong>
                {" "}
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
              onSubmit={
                handleVerifyOTP
              }
            >

              <div className="auth-field">

                <label>
                  Verification code
                </label>


                <div className="auth-otp-input-wrapper">

                  <Mail size={17} />


                  <input
                    type="text"
                    inputMode="numeric"
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
                    placeholder="000000"
                    autoComplete="one-time-code"
                    required
                  />

                </div>

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


            <p className="auth-otp-note">
              The verification code expires
              in 5 minutes.
            </p>

          </>

        )}

      </div>

    </div>
  );
}


export default Login;