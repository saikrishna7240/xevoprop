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


function Register() {
  const navigate = useNavigate();

  const { login } = useAuth();


  const [step, setStep] =
    useState("details");


  const [role, setRole] =
    useState("Buyer");


  const [formData, setFormData] =
    useState({
      name: "",
      email: "",
      phone: "",
      password: "",
    });


  const [otp, setOtp] =
    useState("");


  const [error, setError] =
    useState("");


  const [loading, setLoading] =
    useState(false);


  const [showPassword, setShowPassword] =
    useState(false);


  /* ============================================================
     FORM CHANGE
  ============================================================ */

  const handleChange = (e) => {

    const {
      name,
      value,
    } = e.target;


    setFormData(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );
  };


  /* ============================================================
     REGISTER
  ============================================================ */

  const handleRegister = async (e) => {

    e.preventDefault();

    setError("");
    setLoading(true);

    try {

      const data =
        await apiFetch(
          "/auth/register",
          {
            method: "POST",

            body: JSON.stringify({
              name:
                formData.name.trim(),

              email:
                formData.email
                  .trim()
                  .toLowerCase(),

              phone:
                formData.phone.trim(),

              password:
                formData.password,

              role,
            }),
          }
        );


      if (!data.requiresOtp) {
        throw new Error(
          "Unable to start email verification."
        );
      }


      setStep("otp");

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

  const handleVerifyOTP =
    async (e) => {

      e.preventDefault();

      setError("");
      setLoading(true);

      try {

        const data =
          await apiFetch(
            "/auth/verify-register-otp",
            {
              method: "POST",

              body: JSON.stringify({
                email:
                  formData.email
                    .trim()
                    .toLowerCase(),

                otp:
                  otp.trim(),
              }),
            }
          );


        if (!data.token) {
          throw new Error(
            "Account verified, but authentication token was not received."
          );
        }


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
            "Unable to verify account."
        );

      } finally {

        setLoading(false);
      }
    };


  /* ============================================================
     BACK TO DETAILS
  ============================================================ */

  const handleBack = () => {

    setStep("details");

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


        {step === "details" ? (

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

              {/* NAME */}

              <div className="auth-field">

                <label>
                  Full name
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={
                    handleChange
                  }
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
                  onChange={
                    handleChange
                  }
                  placeholder="you@gmail.com"
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
                  onChange={
                    handleChange
                  }
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
                    value={
                      formData.password
                    }
                    onChange={
                      handleChange
                    }
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
                ].map(
                  (item) => (
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
                  )
                )}

              </div>


              <button
                type="submit"
                className="auth-submit"
                disabled={loading}
              >
                {loading
                  ? "Creating account..."
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
              VERIFY YOUR EMAIL
            </span>


            <h1>
              Verify your account
            </h1>


            <p className="auth-subtitle">

              We sent a 6-digit verification
              code to

              <strong>
                {" "}
                {formData.email}
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
                  : "Verify & Create Account"}
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


export default Register;