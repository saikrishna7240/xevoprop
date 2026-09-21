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
   CONSTANTS
============================================================ */

const OTP_EXPIRY_MINUTES = 5;
const OTP_RESEND_SECONDS = 30;
const OTP_MAX_ATTEMPTS = 5;

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
   OTP HASH
============================================================ */

const hashOTP = (otp) => {
  return crypto
    .createHash("sha256")
    .update(String(otp).trim())
    .digest("hex");
};

/* ============================================================
   CREATE OTP
============================================================ */

const createOTP = async ({
  userId,
  phone,
  email,
  purpose,
}) => {
  /*
    Delete previous unverified OTPs.

    This means requesting a new OTP automatically
    invalidates the previous OTP.
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

  /* Generate 6-digit OTP */

  const otp = crypto
    .randomInt(100000, 1000000)
    .toString();

  /* Hash OTP before storing */

  const otpHash = hashOTP(otp);

  /* OTP expires after 5 minutes */

  const expiresAt = new Date(
    Date.now() +
      OTP_EXPIRY_MINUTES * 60 * 1000
  );

  /* Resend allowed after 30 seconds */

  const resendAvailableAt = new Date(
    Date.now() +
      OTP_RESEND_SECONDS * 1000
  );

  await pool.query(
    `
    INSERT INTO auth_otps
    (
      email,
      phone,
      otp_hash,
      purpose,
      expires_at,
      resend_available_at,
      verified,
      attempts,
      created_at
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
      0,
      CURRENT_TIMESTAMP
    )
    `,
    [
      email || null,
      phone,
      otpHash,
      purpose,
      expiresAt,
      resendAvailableAt,
    ]
  );

  /*
    DEVELOPMENT ONLY

    Remove this console.log when a real
    SMS provider is connected.
  */

  console.log(
    `[${purpose} OTP] ${otp} -> ${phone}`
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
    SELECT
      id,
      otp_hash,
      expires_at,
      verified,
      attempts
    FROM auth_otps
    WHERE phone = $1
      AND purpose = $2
      AND verified = FALSE
    ORDER BY created_at DESC
    LIMIT 1
    `,
    [
      phone,
      purpose,
    ]
  );

  if (!result.rows.length) {
    throw new Error(
      "OTP not found or already used."
    );
  }

  const record = result.rows[0];

  /* ========================================================
     ATTEMPT LIMIT
  ======================================================== */

  if (
    Number(record.attempts) >=
    OTP_MAX_ATTEMPTS
  ) {
    throw new Error(
      "Too many incorrect attempts. Please request a new OTP."
    );
  }

  /* ========================================================
     EXPIRY
  ======================================================== */

  if (
    !record.expires_at ||
    new Date(record.expires_at).getTime() <=
      Date.now()
  ) {
    throw new Error(
      "OTP has expired. Please request a new OTP."
    );
  }

  /* ========================================================
     HASH SUBMITTED OTP
  ======================================================== */

  const submittedOtpHash =
    hashOTP(otp);

  /* ========================================================
     COMPARE
  ======================================================== */

  if (
    submittedOtpHash !==
    record.otp_hash
  ) {
    await pool.query(
      `
      UPDATE auth_otps
      SET attempts = attempts + 1
      WHERE id = $1
      `,
      [record.id]
    );

    const currentAttempts =
      Number(record.attempts) + 1;

    const remainingAttempts =
      OTP_MAX_ATTEMPTS -
      currentAttempts;

    if (remainingAttempts <= 0) {
      throw new Error(
        "Too many incorrect attempts. Please request a new OTP."
      );
    }

    throw new Error(
      `Invalid OTP. ${remainingAttempts} attempt${
        remainingAttempts === 1
          ? ""
          : "s"
      } remaining.`
    );
  }

  /* ========================================================
     SUCCESS
  ======================================================== */

  await pool.query(
    `
    UPDATE auth_otps
    SET verified = TRUE
    WHERE id = $1
    `,
    [record.id]
  );

  return true;
};

/* ============================================================
   REGISTER
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

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message:
            "Password must be at least 6 characters.",
        });
      }

      const normalizedEmail =
        email.trim().toLowerCase();

      const normalizedPhone =
        phone.trim();

      /* ======================================================
         CHECK EMAIL
      ====================================================== */

      const emailExists =
        await pool.query(
          `
          SELECT id
          FROM users
          WHERE LOWER(email) = LOWER($1)
          LIMIT 1
          `,
          [normalizedEmail]
        );

      if (emailExists.rows.length) {
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

      if (phoneExists.rows.length) {
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

      const user = result.rows[0];

      /* ======================================================
         GENERATE REGISTER OTP
      ====================================================== */

      await createOTP({
        userId: user.id,
        phone: user.phone,
        email: user.email,
        purpose: "REGISTER",
      });

      /* ======================================================
         IMPORTANT:
         NO JWT HERE
      ====================================================== */

      return res.status(201).json({
        success: true,
        message:
          "Registration successful. OTP sent to your mobile number.",
        requiresOtp: true,
        purpose: "REGISTER",
        user,
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
   LOGIN
============================================================ */

router.post(
  "/login",
  async (req, res) => {
    try {
      const {
        phone,
        password,
      } = req.body;

      /* ======================================================
         VALIDATION
      ====================================================== */

      if (
        !phone?.trim() ||
        !password
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Mobile number and password are required.",
        });
      }

      const normalizedPhone =
        phone.trim();

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
          WHERE phone = $1
          LIMIT 1
          `,
          [normalizedPhone]
        );

      if (!result.rows.length) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid mobile number or password.",
        });
      }

      const user = result.rows[0];

      /* ======================================================
         ACTIVE CHECK
      ====================================================== */

      if (user.is_active === false) {
        return res.status(403).json({
          success: false,
          message:
            "Your account is inactive.",
        });
      }

      /* ======================================================
         PASSWORD
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
            "Invalid mobile number or password.",
        });
      }

      /* ======================================================
         UNVERIFIED USER
      ====================================================== */

      if (user.is_verified !== true) {
        await createOTP({
          userId: user.id,
          phone: user.phone,
          email: user.email,
          purpose: "REGISTER",
        });

        delete user.password;

        return res.json({
          success: true,
          message:
            "Your account is not verified. OTP sent to your mobile number.",
          requiresOtp: true,
          purpose: "REGISTER",
          user,
        });
      }

      /* ======================================================
         VERIFIED USER
      ====================================================== */

      await createOTP({
        userId: user.id,
        phone: user.phone,
        email: user.email,
        purpose: "LOGIN",
      });

      delete user.password;

      /*
        IMPORTANT:
        Do NOT return JWT yet.
      */

      return res.json({
        success: true,
        message:
          "OTP sent to your mobile number.",
        requiresOtp: true,
        purpose: "LOGIN",
        user,
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

      /* ======================================================
         VALIDATION
      ====================================================== */

      if (
        !phone?.trim() ||
        !otp?.trim() ||
        !purpose
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Mobile number, OTP and purpose are required.",
        });
      }

      if (
        !["LOGIN", "REGISTER"].includes(
          purpose
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid OTP purpose.",
        });
      }

      if (!/^\d{6}$/.test(otp.trim())) {
        return res.status(400).json({
          success: false,
          message:
            "OTP must contain exactly 6 digits.",
        });
      }

      const normalizedPhone =
        phone.trim();

      /* ======================================================
         VERIFY OTP
      ====================================================== */

      await verifyOTP({
        phone: normalizedPhone,
        otp: otp.trim(),
        purpose,
      });

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
          WHERE phone = $1
          LIMIT 1
          `,
          [normalizedPhone]
        );

      if (!userResult.rows.length) {
        return res.status(404).json({
          success: false,
          message:
            "User not found.",
        });
      }

      let user =
        userResult.rows[0];

      /* ======================================================
         ACCOUNT ACTIVE CHECK
      ====================================================== */

      if (user.is_active === false) {
        return res.status(403).json({
          success: false,
          message:
            "Your account is inactive.",
        });
      }

      /* ======================================================
         REGISTER VERIFICATION
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
              created_at,
              updated_at
            `,
            [user.id]
          );

        user =
          updateResult.rows[0];
      }

      /* ======================================================
         JWT
      ====================================================== */

      const token =
        signToken(user);

      return res.json({
        success: true,
        message:
          purpose === "REGISTER"
            ? "Account verified successfully."
            : "Login successful.",
        token,
        user,
      });
    } catch (error) {
      console.error(
        "OTP verification error:",
        error
      );

      return res.status(400).json({
        success: false,
        message:
          error.message ||
          "OTP verification failed.",
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

      /* ======================================================
         VALIDATION
      ====================================================== */

      if (
        !phone?.trim() ||
        !purpose
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Mobile number and purpose are required.",
        });
      }

      if (
        !["LOGIN", "REGISTER"].includes(
          purpose
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid OTP purpose.",
        });
      }

      const normalizedPhone =
        phone.trim();

      /* ======================================================
         FIND USER
      ====================================================== */

      const userResult =
        await pool.query(
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
          LIMIT 1
          `,
          [normalizedPhone]
        );

      if (!userResult.rows.length) {
        return res.status(404).json({
          success: false,
          message:
            "User not found.",
        });
      }

      const user =
        userResult.rows[0];

      /* ======================================================
         ACTIVE CHECK
      ====================================================== */

      if (user.is_active === false) {
        return res.status(403).json({
          success: false,
          message:
            "Your account is inactive.",
        });
      }

      /* ======================================================
         CHECK RESEND COOLDOWN
      ====================================================== */

      const latestOtp =
        await pool.query(
          `
          SELECT
            resend_available_at
          FROM auth_otps
          WHERE phone = $1
            AND purpose = $2
          ORDER BY created_at DESC
          LIMIT 1
          `,
          [
            normalizedPhone,
            purpose,
          ]
        );

      if (latestOtp.rows.length) {
        const availableAt =
          latestOtp.rows[0]
            .resend_available_at;

        if (
          availableAt &&
          new Date(
            availableAt
          ).getTime() >
            Date.now()
        ) {
          const secondsRemaining =
            Math.ceil(
              (
                new Date(
                  availableAt
                ).getTime() -
                Date.now()
              ) / 1000
            );

          return res.status(429).json({
            success: false,
            message:
              `Please wait ${secondsRemaining} seconds before requesting another OTP.`,
            retryAfter:
              secondsRemaining,
          });
        }
      }

      /* ======================================================
         CREATE NEW OTP
      ====================================================== */

      await createOTP({
        userId: user.id,
        phone: user.phone,
        email: user.email,
        purpose,
      });

      return res.json({
        success: true,
        message:
          "A new OTP has been sent.",
      });
    } catch (error) {
      console.error(
        "Resend OTP error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to resend OTP.",
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

      if (!result.rows.length) {
        return res.status(404).json({
          success: false,
          message:
            "User not found.",
        });
      }

      return res.json({
        success: true,
        user: result.rows[0],
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

      if (!name?.trim()) {
        return res.status(400).json({
          success: false,
          message:
            "Name is required.",
        });
      }

      /*
        Phone changes are intentionally not
        automatically verified here.

        If we later allow changing a mobile
        number, that change should require
        a separate OTP verification flow.
      */

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

      if (!result.rows.length) {
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
        user: result.rows[0],
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

/* ============================================================
   EXPORT
============================================================ */

module.exports = router;