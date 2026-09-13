const express = require("express");

const { pool } = require("../config/db");

const {
  authenticateToken,
} = require("../middleware/authMiddleware");
const router = express.Router();

/* =========================
   BOOK PROPERTY VISIT
========================= */

router.post(
  "/",
  authenticateToken,
  async (req, res) => {
    try {
      const {
        property_id,
        name,
        email,
        phone,
        visit_date,
        visit_time,
        message,
      } = req.body;

      if (
        !property_id ||
        !name?.trim() ||
        !email?.trim() ||
        !visit_date ||
        !visit_time
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Property, name, email, date and time are required.",
        });
      }

      const propertyResult =
        await pool.query(
          `
          SELECT id, owner_id, title
          FROM properties
          WHERE id = $1
          `,
          [property_id]
        );

      if (
        propertyResult.rows.length === 0
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Property not found.",
        });
      }

      const result =
        await pool.query(
          `
          INSERT INTO property_visits
          (
            property_id,
            buyer_id,
            name,
            email,
            phone,
            visit_date,
            visit_time,
            message
          )
          VALUES
          ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING *
          `,
          [
            property_id,
            req.user.id,
            name.trim(),
            email.trim(),
            phone?.trim() || null,
            visit_date,
            visit_time,
            message?.trim() || null,
          ]
        );

      res.status(201).json({
        success: true,
        message:
          "Visit request submitted successfully.",
        visit: result.rows[0],
      });

    } catch (error) {
      console.error(
        "Book visit error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to book visit.",
      });
    }
  }
);

/* =========================
   GET SELLER VISITS
========================= */

router.get(
  "/seller",
  authenticateToken,
  async (req, res) => {
    try {
      const result = await pool.query(
        `
        SELECT
          v.id,
          v.property_id,
          v.buyer_id,
          v.name,
          v.email,
          v.phone,
          v.visit_date,
          v.visit_time,
          v.message,
          v.status,
          v.created_at,

          p.title AS property_title,
          p.image AS property_image

        FROM property_visits v

        INNER JOIN properties p
          ON p.id = v.property_id

        WHERE p.owner_id = $1

        ORDER BY
          v.visit_date ASC,
          v.visit_time ASC
        `,
        [req.user.id]
      );

      res.json({
        success: true,
        visits: result.rows,
      });

    } catch (error) {
      console.error(
        "Get seller visits error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to fetch visits.",
      });
    }
  }
);

/* =========================
   UPDATE VISIT STATUS
========================= */

router.put(
  "/:id/status",
  authenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const allowedStatuses = [
        "pending",
        "accepted",
        "rejected",
        "completed",
      ];

      if (
        !allowedStatuses.includes(status)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid visit status.",
        });
      }

      const result = await pool.query(
        `
        UPDATE property_visits v

        SET status = $1

        FROM properties p

        WHERE v.id = $2
          AND v.property_id = p.id
          AND p.owner_id = $3

        RETURNING v.*
        `,
        [
          status,
          id,
          req.user.id,
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message:
            "Visit not found or you are not authorized.",
        });
      }

      res.json({
        success: true,
        message:
          "Visit status updated successfully.",
        visit: result.rows[0],
      });

    } catch (error) {
      console.error(
        "Update visit status error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to update visit status.",
      });
    }
  }
);

/* =========================
   RESCHEDULE VISIT
========================= */

router.put(
  "/:id/reschedule",
  authenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;

      const {
        visit_date,
        visit_time,
      } = req.body;

      if (
        !visit_date ||
        !visit_time
      ) {
        return res.status(400).json({
          success: false,
          message:
            "New date and time are required.",
        });
      }

      const result = await pool.query(
        `
        UPDATE property_visits v

        SET
          visit_date = $1,
          visit_time = $2,
          status = 'pending'

        FROM properties p

        WHERE v.id = $3
          AND v.property_id = p.id
          AND p.owner_id = $4

        RETURNING v.*
        `,
        [
          visit_date,
          visit_time,
          id,
          req.user.id,
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message:
            "Visit not found or unauthorized.",
        });
      }

      res.json({
        success: true,
        message:
          "Visit rescheduled successfully.",
        visit: result.rows[0],
      });

    } catch (error) {
      console.error(
        "Reschedule visit error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to reschedule visit.",
      });
    }
  }
);

/* =========================
   GET BUYER VISITS
========================= */

router.get(
  "/buyer",
  authenticateToken,
  async (req, res) => {
    try {
      const result = await pool.query(
        `
        SELECT
          v.id,
          v.property_id,
          v.name,
          v.email,
          v.phone,
          v.visit_date,
          v.visit_time,
          v.message,
          v.status,
          v.created_at,

          p.title AS property_title,
          p.location AS property_location,
          p.image AS property_image

        FROM property_visits v

        INNER JOIN properties p
          ON p.id = v.property_id

        WHERE v.buyer_id = $1

        ORDER BY
          v.visit_date ASC,
          v.visit_time ASC
        `,
        [req.user.id]
      );

      res.json({
        success: true,
        visits: result.rows,
      });

    } catch (error) {
      console.error(
        "Get buyer visits error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to fetch your visits.",
      });
    }
  }
);

module.exports = router;