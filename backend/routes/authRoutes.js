const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const { pool } = require("../config/db");

const {
  authenticateToken,
} = require("../middleware/authMiddleware");

const {
  sendAuthOTP,
} = require("../utils/sendEmail");


const router = express.Router();


/* ============================================================
   ALLOWED ROLES
============================================================ */

const ALLOWED_ROLES = [
  "Buyer",
  "Seller",
  "Developer",
];


/* ============================================================
   JWT
============================================================ */

const signToken = (user) => {

  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },

    process.env.JWT_SECRET,

    {
      expiresIn: "7d",
    }
  );
};


/* ============================================================
   OTP HELPERS
============================================================ */

const generateOTP = () => {

  return crypto
    .randomInt(
      100000,
      1000000
    )
    .toString();
};


const hashOTP = (otp) => {

  return crypto
    .createHash("sha256")
    .update(otp)
    .digest("hex");
};


/* ============================================================
   REGISTER
   CREATE ACCOUNT → SEND EMAIL OTP
============================================================ */

router.post(
  "/register",
  async (req, res) => {

    try {

      const {
        name,
        email,
        phone,
        password,
        role,
      } = req.body;


      /* ======================================================
         VALIDATION
      ====================================================== */

      if (
        !name?.trim() ||
        !email?.trim() ||
        !phone?.trim() ||
        !password ||
        !role
      ) {

        return res.status(400).json({
          success: false,

          message:
            "Name, email, mobile number, password and role are required.",
        });
      }


      if (
        !ALLOWED_ROLES.includes(role)
      ) {

        return res.status(400).json({
          success: false,
          message: "Invalid role.",
        });
      }


      if (
        password.length < 6
      ) {

        return res.status(400).json({
          success: false,

          message:
            "Password must be at least 6 characters.",
        });
      }


      const normalizedEmail =
        email
          .trim()
          .toLowerCase();


      const normalizedPhone =
        phone.trim();


      /* ======================================================
         CHECK EMAIL
      ====================================================== */

      const emailExists =
        await pool.query(
          `
          SELECT
            id,
            is_verified
          FROM users
          WHERE LOWER(email) = LOWER($1)
          LIMIT 1
          `,
          [normalizedEmail]
        );


      if (
        emailExists.rows.length
      ) {

        const existingUser =
          emailExists.rows[0];


        if (
          existingUser.is_verified === false
        ) {

          return res.status(409).json({
            success: false,

            message:
              "An account with this email is awaiting verification. Please verify your existing account.",
          });
        }


        return res.status(409).json({
          success: false,

          message:
            "An account with this email already exists.",
        });
      }


      /* ======================================================
         CHECK PHONE
      ====================================================== */

      const phoneExists =
        await pool.query(
          `
          SELECT id
          FROM users
          WHERE phone = $1
          LIMIT 1
          `,
          [normalizedPhone]
        );


      if (
        phoneExists.rows.length
      ) {

        return res.status(409).json({
          success: false,

          message:
            "An account with this mobile number already exists.",
        });
      }


      /* ======================================================
         HASH PASSWORD
      ====================================================== */

      const passwordHash =
        await bcrypt.hash(
          password,
          10
        );


      /* ======================================================
         CREATE USER
      ====================================================== */

      const result =
        await pool.query(
          `
          INSERT INTO users
          (
            username,
            name,
            email,
            phone,
            password,
            role,
            is_verified,
            is_active,
            created_at,
            updated_at
          )
          VALUES
          (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            FALSE,
            TRUE,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
          )
          RETURNING
            id,
            username,
            name,
            email,
            phone,
            role,
            is_verified,
            is_active,
            created_at,
            updated_at
          `,
          [
            normalizedEmail,
            name.trim(),
            normalizedEmail,
            normalizedPhone,
            passwordHash,
            role,
          ]
        );


      const user =
        result.rows[0];


      /* ======================================================
         INVALIDATE OLD REGISTRATION OTPS
      ====================================================== */

      await pool.query(
        `
        UPDATE login_otps
        SET used = TRUE
        WHERE user_id = $1
        AND purpose = 'register'
        AND used = FALSE
        `,
        [user.id]
      );


      /* ======================================================
         GENERATE OTP
      ====================================================== */

      const otp =
        generateOTP();


      const otpHash =
        hashOTP(otp);


      const expiresAt =
        new Date(
          Date.now() +
          5 * 60 * 1000
        );


      /* ======================================================
         STORE REGISTRATION OTP
      ====================================================== */

      await pool.query(
        `
        INSERT INTO login_otps
        (
          user_id,
          otp_hash,
          expires_at,
          attempts,
          used,
          purpose
        )
        VALUES
        (
          $1,
          $2,
          $3,
          0,
          FALSE,
          'register'
        )
        `,
        [
          user.id,
          otpHash,
          expiresAt,
        ]
      );


      /* ======================================================
         SEND REGISTRATION OTP
      ====================================================== */

      try {

        await sendAuthOTP({
          email: user.email,
          name: user.name,
          otp,
          purpose: "register",
        });

      } catch (emailError) {

        console.error(
          "Registration OTP email error:",
          emailError
        );


        await pool.query(
          `
          UPDATE login_otps
          SET used = TRUE
          WHERE user_id = $1
          AND purpose = 'register'
          AND used = FALSE
          `,
          [user.id]
        );


        return res.status(500).json({
          success: false,

          message:
            "Unable to send verification code. Please try again.",
        });
      }


      /* ======================================================
         NO JWT HERE
      ====================================================== */

      return res.status(201).json({
        success: true,

        requiresOtp: true,

        purpose: "register",

        message:
          "Verification code sent to your email.",

        email: user.email,
      });

    } catch (error) {

      console.error(
        "Registration error:",
        error
      );


      return res.status(500).json({
        success: false,

        message:
          "Server error during registration.",
      });
    }
  }
);


/* ============================================================
   VERIFY REGISTRATION OTP
   OTP → VERIFY USER → JWT
============================================================ */

router.post(
  "/verify-register-otp",
  async (req, res) => {

    try {

      const {
        email,
        otp,
      } = req.body;


      /* ======================================================
         VALIDATION
      ====================================================== */

      if (
        !email?.trim() ||
        !otp?.trim()
      ) {

        return res.status(400).json({
          success: false,

          message:
            "Email and verification code are required.",
        });
      }


      const normalizedEmail =
        email
          .trim()
          .toLowerCase();


      /* ======================================================
         FIND USER
      ====================================================== */

      const userResult =
        await pool.query(
          `
          SELECT
            id,
            username,
            name,
            email,
            phone,
            role,
            is_verified,
            is_active,
            created_at,
            updated_at
          FROM users
          WHERE LOWER(email) = LOWER($1)
          LIMIT 1
          `,
          [normalizedEmail]
        );


      if (
        !userResult.rows.length
      ) {

        return res.status(404).json({
          success: false,

          message:
            "Account not found.",
        });
      }


      const user =
        userResult.rows[0];


      /* ======================================================
         ACTIVE CHECK
      ====================================================== */

      if (
        user.is_active === false
      ) {

        return res.status(403).json({
          success: false,

          message:
            "Your account is inactive.",
        });
      }


      /* ======================================================
         ALREADY VERIFIED
      ====================================================== */

      if (
        user.is_verified === true
      ) {

        return res.status(400).json({
          success: false,

          message:
            "This account is already verified.",
        });
      }


      /* ======================================================
         FIND REGISTRATION OTP
      ====================================================== */

      const otpResult =
        await pool.query(
          `
          SELECT
            id,
            otp_hash,
            expires_at,
            attempts
          FROM login_otps
          WHERE user_id = $1
          AND purpose = 'register'
          AND used = FALSE
          ORDER BY created_at DESC
          LIMIT 1
          `,
          [user.id]
        );


      if (
        !otpResult.rows.length
      ) {

        return res.status(400).json({
          success: false,

          message:
            "Verification code not found. Please register again.",
        });
      }


      const registrationOtp =
        otpResult.rows[0];


      /* ======================================================
         EXPIRY
      ====================================================== */

      if (
        new Date(
          registrationOtp.expires_at
        ).getTime() <
        Date.now()
      ) {

        await pool.query(
          `
          UPDATE login_otps
          SET used = TRUE
          WHERE id = $1
          `,
          [registrationOtp.id]
        );


        return res.status(400).json({
          success: false,

          message:
            "Verification code has expired. Please register again.",
        });
      }


      /* ======================================================
         MAX ATTEMPTS
      ====================================================== */

      if (
        registrationOtp.attempts >= 5
      ) {

        await pool.query(
          `
          UPDATE login_otps
          SET used = TRUE
          WHERE id = $1
          `,
          [registrationOtp.id]
        );


        return res.status(429).json({
          success: false,

          message:
            "Too many incorrect attempts. Please register again.",
        });
      }


      /* ======================================================
         VERIFY OTP
      ====================================================== */

      const submittedOtpHash =
        hashOTP(
          otp.trim()
        );


      if (
        submittedOtpHash !==
        registrationOtp.otp_hash
      ) {

        await pool.query(
          `
          UPDATE login_otps
          SET attempts = attempts + 1
          WHERE id = $1
          `,
          [registrationOtp.id]
        );


        return res.status(401).json({
          success: false,

          message:
            "Incorrect verification code.",
        });
      }


      /* ======================================================
         MARK OTP USED
      ====================================================== */

      await pool.query(
        `
        UPDATE login_otps
        SET used = TRUE
        WHERE id = $1
        `,
        [registrationOtp.id]
      );


      /* ======================================================
         VERIFY USER
      ====================================================== */

      const updatedUserResult =
        await pool.query(
          `
          UPDATE users
          SET
            is_verified = TRUE,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $1
          RETURNING
            id,
            username,
            name,
            email,
            phone,
            role,
            is_verified,
            is_active,
            created_at,
            updated_at
          `,
          [user.id]
        );


      const verifiedUser =
        updatedUserResult.rows[0];


      /* ======================================================
         CREATE JWT ONLY AFTER OTP
      ====================================================== */

      const token =
        signToken(
          verifiedUser
        );


      return res.json({
        success: true,

        message:
          "Account verified successfully.",

        token,

        user: verifiedUser,
      });

    } catch (error) {

      console.error(
        "Registration OTP verification error:",
        error
      );


      return res.status(500).json({
        success: false,

        message:
          "Server error during account verification.",
      });
    }
  }
);


/* ============================================================
   LOGIN
   EMAIL + PASSWORD → SEND OTP
============================================================ */

router.post(
  "/login",
  async (req, res) => {

    try {

      const {
        email,
        password,
      } = req.body;


      /* ======================================================
         VALIDATION
      ====================================================== */

      if (
        !email?.trim() ||
        !password
      ) {

        return res.status(400).json({
          success: false,

          message:
            "Email and password are required.",
        });
      }


      const normalizedEmail =
        email
          .trim()
          .toLowerCase();


      /* ======================================================
         FIND USER
      ====================================================== */

      const result =
        await pool.query(
          `
          SELECT
            id,
            username,
            name,
            email,
            phone,
            password,
            role,
            is_verified,
            is_active,
            created_at,
            updated_at
          FROM users
          WHERE LOWER(email) = LOWER($1)
          LIMIT 1
          `,
          [normalizedEmail]
        );


      if (
        !result.rows.length
      ) {

        return res.status(401).json({
          success: false,

          message:
            "Invalid email or password.",
        });
      }


      const user =
        result.rows[0];


      /* ======================================================
         ACTIVE CHECK
      ====================================================== */

      if (
        user.is_active === false
      ) {

        return res.status(403).json({
          success: false,

          message:
            "Your account is inactive.",
        });
      }


      /* ======================================================
         EMAIL VERIFICATION CHECK
      ====================================================== */

      if (
        user.is_verified !== true
      ) {

        return res.status(403).json({
          success: false,

          message:
            "Please verify your email before logging in.",
        });
      }


      /* ======================================================
         PASSWORD CHECK
      ====================================================== */

      const passwordMatches =
        await bcrypt.compare(
          password,
          user.password
        );


      if (!passwordMatches) {

        return res.status(401).json({
          success: false,

          message:
            "Invalid email or password.",
        });
      }


      /* ======================================================
         INVALIDATE OLD LOGIN OTPS
      ====================================================== */

      await pool.query(
        `
        UPDATE login_otps
        SET used = TRUE
        WHERE user_id = $1
        AND purpose = 'login'
        AND used = FALSE
        `,
        [user.id]
      );


      /* ======================================================
         GENERATE LOGIN OTP
      ====================================================== */

      const otp =
        generateOTP();


      const otpHash =
        hashOTP(otp);


      const expiresAt =
        new Date(
          Date.now() +
          5 * 60 * 1000
        );


      /* ======================================================
         STORE LOGIN OTP
      ====================================================== */

      await pool.query(
        `
        INSERT INTO login_otps
        (
          user_id,
          otp_hash,
          expires_at,
          attempts,
          used,
          purpose
        )
        VALUES
        (
          $1,
          $2,
          $3,
          0,
          FALSE,
          'login'
        )
        `,
        [
          user.id,
          otpHash,
          expiresAt,
        ]
      );


      /* ======================================================
         SEND LOGIN OTP THROUGH BREVO
      ====================================================== */

      try {

        await sendAuthOTP({
          email: user.email,
          name: user.name,
          otp,
          purpose: "login",
        });

      } catch (emailError) {

        console.error(
          "Login OTP email error:",
          emailError
        );


        await pool.query(
          `
          UPDATE login_otps
          SET used = TRUE
          WHERE user_id = $1
          AND purpose = 'login'
          AND used = FALSE
          `,
          [user.id]
        );


        return res.status(500).json({
          success: false,

          message:
            "Unable to send verification code. Please try again.",
        });
      }


      /* ======================================================
         DO NOT CREATE JWT HERE
      ====================================================== */

      return res.json({
        success: true,

        requiresOtp: true,

        purpose: "login",

        message:
          "Verification code sent to your email.",

        email: user.email,
      });

    } catch (error) {

      console.error(
        "Login error:",
        error
      );


      return res.status(500).json({
        success: false,

        message:
          "Server error during login.",
      });
    }
  }
);


/* ============================================================
   VERIFY LOGIN OTP
   OTP → JWT
============================================================ */

router.post(
  "/verify-login-otp",
  async (req, res) => {

    try {

      const {
        email,
        otp,
      } = req.body;


      /* ======================================================
         VALIDATION
      ====================================================== */

      if (
        !email?.trim() ||
        !otp?.trim()
      ) {

        return res.status(400).json({
          success: false,

          message:
            "Email and verification code are required.",
        });
      }


      const normalizedEmail =
        email
          .trim()
          .toLowerCase();


      /* ======================================================
         FIND USER
      ====================================================== */

      const userResult =
        await pool.query(
          `
          SELECT
            id,
            username,
            name,
            email,
            phone,
            role,
            is_verified,
            is_active,
            created_at,
            updated_at
          FROM users
          WHERE LOWER(email) = LOWER($1)
          LIMIT 1
          `,
          [normalizedEmail]
        );


      if (
        !userResult.rows.length
      ) {

        return res.status(401).json({
          success: false,

          message:
            "Invalid verification request.",
        });
      }


      const user =
        userResult.rows[0];


      /* ======================================================
         ACTIVE CHECK
      ====================================================== */

      if (
        user.is_active === false
      ) {

        return res.status(403).json({
          success: false,

          message:
            "Your account is inactive.",
        });
      }


      /* ======================================================
         VERIFIED CHECK
      ====================================================== */

      if (
        user.is_verified !== true
      ) {

        return res.status(403).json({
          success: false,

          message:
            "Please verify your email before logging in.",
        });
      }


      /* ======================================================
         FIND LOGIN OTP
      ====================================================== */

      const otpResult =
        await pool.query(
          `
          SELECT
            id,
            otp_hash,
            expires_at,
            attempts
          FROM login_otps
          WHERE user_id = $1
          AND purpose = 'login'
          AND used = FALSE
          ORDER BY created_at DESC
          LIMIT 1
          `,
          [user.id]
        );


      if (
        !otpResult.rows.length
      ) {

        return res.status(400).json({
          success: false,

          message:
            "Verification code not found. Please login again.",
        });
      }


      const loginOtp =
        otpResult.rows[0];


      /* ======================================================
         EXPIRY
      ====================================================== */

      if (
        new Date(
          loginOtp.expires_at
        ).getTime() <
        Date.now()
      ) {

        await pool.query(
          `
          UPDATE login_otps
          SET used = TRUE
          WHERE id = $1
          `,
          [loginOtp.id]
        );


        return res.status(400).json({
          success: false,

          message:
            "Verification code has expired. Please login again.",
        });
      }


      /* ======================================================
         MAX ATTEMPTS
      ====================================================== */

      if (
        loginOtp.attempts >= 5
      ) {

        await pool.query(
          `
          UPDATE login_otps
          SET used = TRUE
          WHERE id = $1
          `,
          [loginOtp.id]
        );


        return res.status(429).json({
          success: false,

          message:
            "Too many incorrect attempts. Please login again.",
        });
      }


      /* ======================================================
         VERIFY OTP
      ====================================================== */

      const submittedOtpHash =
        hashOTP(
          otp.trim()
        );


      if (
        submittedOtpHash !==
        loginOtp.otp_hash
      ) {

        await pool.query(
          `
          UPDATE login_otps
          SET attempts = attempts + 1
          WHERE id = $1
          `,
          [loginOtp.id]
        );


        return res.status(401).json({
          success: false,

          message:
            "Incorrect verification code.",
        });
      }


      /* ======================================================
         MARK OTP USED
      ====================================================== */

      await pool.query(
        `
        UPDATE login_otps
        SET used = TRUE
        WHERE id = $1
        `,
        [loginOtp.id]
      );


      /* ======================================================
         CREATE JWT ONLY NOW
      ====================================================== */

      const token =
        signToken(user);


      return res.json({
        success: true,

        message:
          "Login successful.",

        token,

        user,
      });

    } catch (error) {

      console.error(
        "OTP verification error:",
        error
      );


      return res.status(500).json({
        success: false,

        message:
          "Server error during OTP verification.",
      });
    }
  }
);

/* ============================================================
   RESEND OTP
============================================================ */

router.post(
  "/resend-otp",
  async (req, res) => {
    try {
      const {
        email,
        purpose,
      } = req.body;

      const normalizedEmail =
        email?.trim().toLowerCase();

      if (!normalizedEmail) {
        return res.status(400).json({
          success: false,
          message: "Email is required.",
        });
      }

      if (
        !["login", "register"].includes(
          purpose
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid OTP purpose.",
        });
      }

      const userResult =
        await pool.query(
          `
          SELECT
            id,
            name,
            email,
            is_verified,
            is_active
          FROM users
          WHERE LOWER(email) = LOWER($1)
          LIMIT 1
          `,
          [normalizedEmail]
        );

      if (!userResult.rows.length) {
        return res.status(404).json({
          success: false,
          message: "Account not found.",
        });
      }

      const user =
        userResult.rows[0];

      if (user.is_active === false) {
        return res.status(403).json({
          success: false,
          message: "Your account is inactive.",
        });
      }

      if (
        purpose === "register" &&
        user.is_verified === true
      ) {
        return res.status(400).json({
          success: false,
          message:
            "This account is already verified.",
        });
      }

      if (
        purpose === "login" &&
        user.is_verified !== true
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Please verify your email before logging in.",
        });
      }

      /* --------------------------------------------------------
         INVALIDATE PREVIOUS OTP
      -------------------------------------------------------- */

      await pool.query(
        `
        UPDATE login_otps
        SET used = TRUE
        WHERE user_id = $1
          AND purpose = $2
          AND used = FALSE
        `,
        [
          user.id,
          purpose,
        ]
      );

      /* --------------------------------------------------------
         CREATE NEW OTP
      -------------------------------------------------------- */

      const otp =
        crypto
          .randomInt(
            100000,
            1000000
          )
          .toString();

      const otpHash =
        hashOTP(otp);

      const expiresAt =
        new Date(
          Date.now() +
          5 * 60 * 1000
        );

      await pool.query(
        `
        INSERT INTO login_otps
        (
          user_id,
          otp_hash,
          expires_at,
          attempts,
          used,
          purpose
        )
        VALUES
        (
          $1,
          $2,
          $3,
          0,
          FALSE,
          $4
        )
        `,
        [
          user.id,
          otpHash,
          expiresAt,
          purpose,
        ]
      );

      /* --------------------------------------------------------
         SEND NEW OTP
      -------------------------------------------------------- */

      try {

        await sendAuthOTP({
          email: user.email,
          name: user.name,
          otp,
          purpose,
        });

      } catch (emailError) {

        console.error(
          "Resend OTP email error:",
          emailError
        );

        await pool.query(
          `
          UPDATE login_otps
          SET used = TRUE
          WHERE user_id = $1
            AND purpose = $2
            AND used = FALSE
          `,
          [
            user.id,
            purpose,
          ]
        );

        return res.status(500).json({
          success: false,
          message:
            "Unable to send verification code. Please try again.",
        });
      }

      return res.json({
        success: true,
        message:
          "Verification code sent to your email.",
        requiresOtp: true,
        purpose,
        email: user.email,
      });

    } catch (error) {

      console.error(
        "Resend OTP error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Server error while resending verification code.",
      });
    }
  }
);


/* ============================================================
   GET CURRENT USER
============================================================ */

router.get(
  "/me",
  authenticateToken,
  async (req, res) => {

    try {

      const result =
        await pool.query(
          `
          SELECT
            id,
            username,
            name,
            email,
            phone,
            role,
            is_verified,
            is_active,
            created_at,
            updated_at
          FROM users
          WHERE id = $1
          LIMIT 1
          `,
          [req.user.id]
        );


      if (
        !result.rows.length
      ) {

        return res.status(404).json({
          success: false,

          message:
            "User not found.",
        });
      }


      return res.json({
        success: true,

        user:
          result.rows[0],
      });

    } catch (error) {

      console.error(
        "Get current user error:",
        error
      );


      return res.status(500).json({
        success: false,

        message:
          "Failed to load profile.",
      });
    }
  }
);


/* ============================================================
   UPDATE CURRENT USER
============================================================ */

router.put(
  "/me",
  authenticateToken,
  async (req, res) => {

    try {

      const {
        name,
        phone,
      } = req.body;


      if (
        !name?.trim()
      ) {

        return res.status(400).json({
          success: false,

          message:
            "Name is required.",
        });
      }


      const result =
        await pool.query(
          `
          UPDATE users
          SET
            name = $1,
            phone = $2,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $3
          RETURNING
            id,
            username,
            name,
            email,
            phone,
            role,
            is_verified,
            is_active,
            created_at,
            updated_at
          `,
          [
            name.trim(),
            phone?.trim() || null,
            req.user.id,
          ]
        );


      if (
        !result.rows.length
      ) {

        return res.status(404).json({
          success: false,

          message:
            "User not found.",
        });
      }


      return res.json({
        success: true,

        message:
          "Profile updated successfully.",

        user:
          result.rows[0],
      });

    } catch (error) {

      console.error(
        "Profile update error:",
        error
      );


      return res.status(500).json({
        success: false,

        message:
          "Failed to update profile.",
      });
    }
  }
);


module.exports = router;