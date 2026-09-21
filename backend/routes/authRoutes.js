const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const { pool } = require("../config/db");

const {
  authenticateToken,
} = require("../middleware/authMiddleware");

const router = express.Router();

/* ============================================================
   CONFIG
============================================================ */

const OTP_EXPIRY_MINUTES = 5;
const MAX_OTP_ATTEMPTS = 5;

/* ============================================================
   JWT
============================================================ */

const signToken = (user) =>
  jwt.sign(
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

/* ============================================================
   GENERATE OTP
============================================================ */

const generateOTP = () => {
  return crypto
    .randomInt(100000, 1000000)
    .toString();
};

/* ============================================================
   SAVE OTP
============================================================ */

const createOTP = async ({
  userId,
  phone,
  email,
  purpose,
}) => {
  const otp = generateOTP();

  /*
    Remove previous unused OTPs for this
    phone/purpose combination.
  */
  await pool.query(
    `
    DELETE FROM auth_otps
    WHERE phone = $1
      AND purpose = $2
      AND verified = FALSE
    `,
    [phone, purpose]
  );

  /*
    OTP expires after 5 minutes.
  */
  const expiresAt = new Date(
    Date.now() +
      OTP_EXPIRY_MINUTES * 60 * 1000
  );

  await pool.query(
    `
    INSERT INTO auth_otps (
      email,
      phone,
      otp_code,
      purpose,
      expires_at,
      verified,
      created_at
    )
    VALUES (
      $1,
      $2,
      $3,
      $4,
      $5,
      FALSE,
      CURRENT_TIMESTAMP
    )
    `,
    [
      email || null,
      phone,
      otp,
      purpose,
      expiresAt,
    ]
  );

  /*
    TEMPORARY DEVELOPMENT MODE

    Until an SMS provider is connected,
    OTP is printed in the backend console.

    Do NOT expose this OTP in production.
  */
  console.log(
    `========================================`
  );

  console.log(
    `XEVOPROP OTP`
  );

  console.log(
    `Purpose: ${purpose}`
  );

  console.log(
    `Phone: ${phone}`
  );

  console.log(
    `OTP: ${otp}`
  );

  console.log(
    `Expires in: ${OTP_EXPIRY_MINUTES} minutes`
  );

  console.log(
    `========================================`
  );

  return otp;
};

/* ============================================================
   VERIFY OTP
============================================================ */

const verifyOTP = async ({
  phone,
  otp,
  purpose,
}) => {
  const result = await pool.query(
    `
    SELECT *
    FROM auth_otps
    WHERE phone = $1
      AND purpose = $2
      AND verified = FALSE
    ORDER BY created_at DESC
    LIMIT 1
    `,
    [phone, purpose]
  );

  if (result.rows.length === 0) {
    return {
      success: false,
      message: "OTP not found or already used",
    };
  }

  const record = result.rows[0];

  /* ==========================================================
     CHECK EXPIRY
  ========================================================== */

  if (
    new Date(record.expires_at) <
    new Date()
  ) {
    return {
      success: false,
      message:
        "OTP has expired. Please request a new OTP.",
    };
  }

  /* ==========================================================
     CHECK OTP ATTEMPTS

     Your current auth_otps table does not have
     an attempts column, so attempt limiting will
     be added separately before production.
  ========================================================== */

  if (
    String(record.otp_code) !==
    String(otp).trim()
  ) {
    return {
      success: false,
      message: "Invalid OTP",
    };
  }

  /* ==========================================================
     MARK OTP VERIFIED
  ========================================================== */

  await pool.query(
    `
    UPDATE auth_otps
    SET verified = TRUE
    WHERE id = $1
    `,
    [record.id]
  );

  return {
    success: true,
    record,
  };
};

/* ============================================================
   REGISTER
   STEP 1
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

      const allowedRoles = [
        "Buyer",
        "Seller",
        "Developer",
      ];

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
            "Name, email, mobile number, password and role are required",
        });
      }

      if (!allowedRoles.includes(role)) {
        return res.status(400).json({
          success: false,
          message: "Invalid role",
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message:
            "Password must be at least 6 characters",
        });
      }

      const cleanEmail =
        email.trim().toLowerCase();

      const cleanPhone =
        phone.trim();

      /* ======================================================
         CHECK EMAIL
      ====================================================== */

      const existingEmail =
        await pool.query(
          `
          SELECT id
          FROM users
          WHERE LOWER(email) = LOWER($1)
          `,
          [cleanEmail]
        );

      if (existingEmail.rows.length) {
        return res.status(409).json({
          success: false,
          message:
            "An account with this email already exists",
        });
      }

      /* ======================================================
         CHECK PHONE
      ====================================================== */

      const existingPhone =
        await pool.query(
          `
          SELECT id
          FROM users
          WHERE phone = $1
          `,
          [cleanPhone]
        );

      if (existingPhone.rows.length) {
        return res.status(409).json({
          success: false,
          message:
            "An account with this mobile number already exists",
        });
      }

      /* ======================================================
         HASH PASSWORD
      ====================================================== */

      const hash = await bcrypt.hash(
        password,
        10
      );

      /* ======================================================
         CREATE USER AS UNVERIFIED
      ====================================================== */

      const result = await pool.query(
        `
        INSERT INTO users (
          username,
          name,
          email,
          phone,
          password,
          role,
          is_verified,
          is_active
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          FALSE,
          TRUE
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
          created_at
        `,
        [
          cleanEmail,
          name.trim(),
          cleanEmail,
          cleanPhone,
          hash,
          role,
        ]
      );

      const user = result.rows[0];

      /* ======================================================
         CREATE REGISTER OTP
      ====================================================== */

      await createOTP({
        userId: user.id,
        phone: user.phone,
        email: user.email,
        purpose: "REGISTER",
      });

      /* ======================================================
         RESPONSE
      ====================================================== */

      res.status(201).json({
        success: true,
        requiresOtp: true,
        purpose: "REGISTER",
        message:
          "Registration successful. OTP sent to your mobile number.",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
      });
    } catch (error) {
      console.error(
        "Registration error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Server error during registration",
      });
    }
  }
);

/* ============================================================
   LOGIN
   STEP 1
   MOBILE + PASSWORD
============================================================ */

router.post(
  "/login",
  async (req, res) => {
    try {
      const {
        phone,
        password,
      } = req.body;

      if (!phone || !password) {
        return res.status(400).json({
          success: false,
          message:
            "Mobile number and password are required",
        });
      }

      const cleanPhone =
        phone.trim();

      /* ======================================================
         FIND USER BY MOBILE
      ====================================================== */

      const result = await pool.query(
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
          created_at
        FROM users
        WHERE phone = $1
        `,
        [cleanPhone]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid mobile number or password",
        });
      }

      const user = result.rows[0];

      /* ======================================================
         CHECK ACCOUNT STATUS
      ====================================================== */

      if (user.is_active === false) {
        return res.status(403).json({
          success: false,
          message:
            "Your account has been deactivated",
        });
      }

      /* ======================================================
         CHECK PASSWORD
      ====================================================== */

      const passwordValid =
        await bcrypt.compare(
          password,
          user.password
        );

      if (!passwordValid) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid mobile number or password",
        });
      }

      /* ======================================================
         IF ACCOUNT IS NOT VERIFIED
      ====================================================== */

      if (user.is_verified !== true) {
        await createOTP({
          userId: user.id,
          phone: user.phone,
          email: user.email,
          purpose: "REGISTER",
        });

        return res.status(200).json({
          success: true,
          requiresOtp: true,
          purpose: "REGISTER",
          message:
            "Your account is not verified. OTP sent to your mobile number.",
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
          },
        });
      }

      /* ======================================================
         CREATE LOGIN OTP
      ====================================================== */

      await createOTP({
        userId: user.id,
        phone: user.phone,
        email: user.email,
        purpose: "LOGIN",
      });

      /* ======================================================
         REMOVE PASSWORD FROM RESPONSE
      ====================================================== */

      delete user.password;

      res.json({
        success: true,
        requiresOtp: true,
        purpose: "LOGIN",
        message:
          "OTP sent to your mobile number",
        user,
      });
    } catch (error) {
      console.error(
        "Login error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Server error during login",
      });
    }
  }
);

/* ============================================================
   VERIFY OTP
============================================================ */

router.post(
  "/verify-otp",
  async (req, res) => {
    try {
      const {
        phone,
        otp,
        purpose,
      } = req.body;

      if (!phone || !otp || !purpose) {
        return res.status(400).json({
          success: false,
          message:
            "Mobile number, OTP and purpose are required",
        });
      }

      if (
        !["LOGIN", "REGISTER"].includes(
          purpose
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid OTP purpose",
        });
      }

      const cleanPhone =
        phone.trim();

      /* ======================================================
         VERIFY OTP
      ====================================================== */

      const verification =
        await verifyOTP({
          phone: cleanPhone,
          otp,
          purpose,
        });

      if (!verification.success) {
        return res.status(400).json({
          success: false,
          message:
            verification.message,
        });
      }

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
            created_at
          FROM users
          WHERE phone = $1
          `,
          [cleanPhone]
        );

      if (userResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const user =
        userResult.rows[0];

      /* ======================================================
         ACTIVATE / VERIFY ACCOUNT
      ====================================================== */

      if (purpose === "REGISTER") {
        const updateResult =
          await pool.query(
            `
            UPDATE users
            SET
              is_verified = TRUE,
              is_active = TRUE,
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
              created_at
            `,
            [user.id]
          );

        userResult.rows[0] =
          updateResult.rows[0];
      }

      const verifiedUser =
        userResult.rows[0];

      /* ======================================================
         CREATE JWT
      ====================================================== */

      const token =
        signToken(verifiedUser);

      res.json({
        success: true,
        message:
          purpose === "REGISTER"
            ? "Registration verified successfully"
            : "Login successful",
        token,
        user: verifiedUser,
      });
    } catch (error) {
      console.error(
        "OTP verification error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Server error during OTP verification",
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
        phone,
        purpose,
      } = req.body;

      if (!phone || !purpose) {
        return res.status(400).json({
          success: false,
          message:
            "Mobile number and purpose are required",
        });
      }

      if (
        !["LOGIN", "REGISTER"].includes(
          purpose
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid OTP purpose",
        });
      }

      const cleanPhone =
        phone.trim();

      const result = await pool.query(
        `
        SELECT
          id,
          name,
          email,
          phone,
          role,
          is_verified,
          is_active
        FROM users
        WHERE phone = $1
        `,
        [cleanPhone]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message:
            "No account found with this mobile number",
        });
      }

      const user = result.rows[0];

      if (
        purpose === "REGISTER" &&
        user.is_verified === true
      ) {
        return res.status(400).json({
          success: false,
          message:
            "This account is already verified",
        });
      }

      await createOTP({
        userId: user.id,
        phone: user.phone,
        email: user.email,
        purpose,
      });

      res.json({
        success: true,
        message:
          "A new OTP has been sent to your mobile number",
      });
    } catch (error) {
      console.error(
        "Resend OTP error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to resend OTP",
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
      const result = await pool.query(
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
          created_at
        FROM users
        WHERE id = $1
        `,
        [req.user.id]
      );

      if (!result.rows.length) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.json({
        success: true,
        user: result.rows[0],
      });
    } catch (error) {
      console.error(
        "Get current user error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to load profile",
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

      if (!name?.trim()) {
        return res.status(400).json({
          success: false,
          message: "Name is required",
        });
      }

      const result = await pool.query(
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
          created_at
        `,
        [
          name.trim(),
          phone?.trim() || null,
          req.user.id,
        ]
      );

      res.json({
        success: true,
        message: "Profile updated",
        user: result.rows[0],
      });
    } catch (error) {
      console.error(
        "Profile update error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to update profile",
      });
    }
  }
);

module.exports = router;