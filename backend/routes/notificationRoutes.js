const express = require("express");
const { pool } = require("../config/db");
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();

/* ============================================================
   GET ALL NOTIFICATIONS
============================================================ */

router.get(
  "/",
  authenticateToken,
  async (req, res) => {
    try {
      const explicit = await pool.query(
        `
        SELECT
          id,
          type,
          title,
          message,
          reference_id,
          reference_type,
          is_read,
          created_at
        FROM notifications
        WHERE user_id = $1
        ORDER BY created_at DESC
        `,
        [req.user.id]
      );

      res.json({
        success: true,
        notifications: explicit.rows,
      });
    } catch (error) {
      console.error(
        "Get notifications error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message: "Failed to load notifications",
      });
    }
  }
);

/* ============================================================
   GET UNREAD COUNT
============================================================ */

router.get(
  "/unread-count",
  authenticateToken,
  async (req, res) => {
    try {
      const result = await pool.query(
        `
        SELECT COUNT(*) AS count
        FROM notifications
        WHERE user_id = $1
          AND is_read = FALSE
        `,
        [req.user.id]
      );

      res.json({
        success: true,
        count: Number(result.rows[0].count),
      });
    } catch (error) {
      console.error(
        "Unread count error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message: "Failed to load unread count",
      });
    }
  }
);

/* ============================================================
   CREATE NOTIFICATION
   USER CAN ONLY CREATE FOR THEMSELVES
============================================================ */

router.post(
  "/",
  authenticateToken,
  async (req, res) => {
    try {
      const {
        user_id,
        type,
        title,
        message,
        reference_id,
        reference_type,
      } = req.body;

      if (
        Number(user_id) !== Number(req.user.id)
      ) {
        return res.status(403).json({
          success: false,
          message: "Forbidden",
        });
      }

      if (!type || !title) {
        return res.status(400).json({
          success: false,
          message:
            "Notification type and title are required",
        });
      }

      const result = await pool.query(
        `
        INSERT INTO notifications (
          user_id,
          type,
          title,
          message,
          reference_id,
          reference_type
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
        `,
        [
          req.user.id,
          type,
          title,
          message || null,
          reference_id || null,
          reference_type || null,
        ]
      );

      res.status(201).json({
        success: true,
        notification: result.rows[0],
      });
    } catch (error) {
      console.error(
        "Create notification error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message: "Failed to create notification",
      });
    }
  }
);

/* ============================================================
   MARK SINGLE NOTIFICATION AS READ
============================================================ */

router.put(
  "/:id/read",
  authenticateToken,
  async (req, res) => {
    try {
      const result = await pool.query(
        `
        UPDATE notifications
        SET is_read = TRUE
        WHERE id = $1
          AND user_id = $2
        RETURNING *
        `,
        [req.params.id, req.user.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Notification not found",
        });
      }

      res.json({
        success: true,
        notification: result.rows[0],
      });
    } catch (error) {
      console.error(
        "Mark notification read error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message: "Failed to update notification",
      });
    }
  }
);

/* ============================================================
   MARK ALL NOTIFICATIONS AS READ
============================================================ */

router.put(
  "/read-all",
  authenticateToken,
  async (req, res) => {
    try {
      const result = await pool.query(
        `
        UPDATE notifications
        SET is_read = TRUE
        WHERE user_id = $1
          AND is_read = FALSE
        RETURNING id
        `,
        [req.user.id]
      );

      res.json({
        success: true,
        message: "All notifications marked as read",
        updated: result.rows.length,
      });
    } catch (error) {
      console.error(
        "Mark all notifications read error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to update notifications",
      });
    }
  }
);

module.exports = router;