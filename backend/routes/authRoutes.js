const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { pool } = require("../config/db");

const {
  authenticateToken,
} = require("../middleware/authMiddleware");

const router = express.Router();

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

      /* VALIDATION */

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

      if (!ALLOWED_ROLES.includes(role)) {
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

      /* CHECK EMAIL */

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

      /* CHECK PHONE */

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

      /* HASH PASSWORD */

      const passwordHash =
        await bcrypt.hash(
          password,
          10
        );

      /* CREATE USER */

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
            TRUE,
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

      /* CREATE JWT DIRECTLY */

      const token = signToken(user);

      return res.status(201).json({
        success: true,
        message:
          "Registration successful.",
        token,
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

      /* VALIDATION */

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

      /* FIND USER */

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

      /* ACTIVE CHECK */

      if (user.is_active === false) {
        return res.status(403).json({
          success: false,
          message:
            "Your account is inactive.",
        });
      }

      /* PASSWORD */

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

      /* REMOVE PASSWORD FROM RESPONSE */

      delete user.password;

      /* JWT */

      const token = signToken(user);

      return res.json({
        success: true,
        message:
          "Login successful.",
        token,
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

module.exports = router;