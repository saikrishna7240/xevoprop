const express = require("express");
const bcrypt = require("bcryptjs");

const { pool } = require("../config/db");
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();

/* =========================================================
   GET MY PROFILE
========================================================= */

router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        id,
        username,
        name,
        email,
        phone,
        role,
        created_at
       FROM users
       WHERE id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    res.json({
      success: true,
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Get profile error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load profile.",
    });
  }
});

/* =========================================================
   UPDATE MY PROFILE
========================================================= */

router.put("/profile", authenticateToken, async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Name and email are required.",
      });
    }

    const existingUser = await pool.query(
      `SELECT id
       FROM users
       WHERE LOWER(email) = LOWER($1)
       AND id <> $2`,
      [email.trim(), req.user.id]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "This email is already being used.",
      });
    }

    const result = await pool.query(
      `UPDATE users
       SET
         name = $1,
         email = $2,
         phone = $3
       WHERE id = $4
       RETURNING
         id,
         username,
         name,
         email,
         phone,
         role,
         created_at`,
      [
        name.trim(),
        email.trim().toLowerCase(),
        phone ? phone.trim() : null,
        req.user.id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    res.json({
      success: true,
      message: "Profile updated successfully.",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Update profile error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update profile.",
    });
  }
});

/* =========================================================
   UPDATE PASSWORD
   PUT /api/users/password
========================================================= */

router.put(
  "/password",
  authenticateToken,
  async (req, res) => {
    try {
      const {
        currentPassword,
        newPassword,
      } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message:
            "Current password and new password are required.",
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message:
            "New password must be at least 6 characters.",
        });
      }

      const result = await pool.query(
        `SELECT password
         FROM users
         WHERE id = $1`,
        [req.user.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "User not found.",
        });
      }

      const user = result.rows[0];

      const passwordMatches =
        await bcrypt.compare(
          currentPassword,
          user.password
        );

      if (!passwordMatches) {
        return res.status(401).json({
          success: false,
          message:
            "Current password is incorrect.",
        });
      }

      const samePassword =
        await bcrypt.compare(
          newPassword,
          user.password
        );

      if (samePassword) {
        return res.status(400).json({
          success: false,
          message:
            "New password must be different from your current password.",
        });
      }

      const hashedPassword =
        await bcrypt.hash(newPassword, 10);

      await pool.query(
        `UPDATE users
         SET password = $1
         WHERE id = $2`,
        [
          hashedPassword,
          req.user.id,
        ]
      );

      return res.json({
        success: true,
        message:
          "Password updated successfully.",
      });
    } catch (error) {
      console.error(
        "Update password error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to update password.",
      });
    }
  }
);

module.exports = router;