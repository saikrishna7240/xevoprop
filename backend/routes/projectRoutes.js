const express = require("express");

const { pool } = require("../config/db");

const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();

/* ============================================================
   PUBLIC PROJECTS
   APPROVED ONLY
============================================================ */

router.get("/public", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        developer_id,
        name,
        type,
        location,
        city,
        units,
        price,
        image,
        description,
        status,
        created_at,
        updated_at
      FROM projects
      WHERE status = 'approved'
      ORDER BY created_at DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error(
      "Get public projects error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch projects",
    });
  }
});

/* ============================================================
   PUBLIC SINGLE PROJECT
   APPROVED ONLY
============================================================ */

router.get("/public/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^\d+$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID",
      });
    }

    const result = await pool.query(
      `
      SELECT
        id,
        developer_id,
        name,
        type,
        location,
        city,
        units,
        price,
        image,
        description,
        status,
        created_at,
        updated_at
      FROM projects
      WHERE id = $1
        AND status = 'approved'
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(
      "Get public project error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch project",
    });
  }
});

/* ============================================================
   GET MY PROJECTS
   DEVELOPER ONLY
   ALL STATUSES
============================================================ */

router.get(
  "/",
  authenticateToken,
  authorizeRoles("Developer"),
  async (req, res) => {
    try {
      const result = await pool.query(
        `
        SELECT
          id,
          developer_id,
          name,
          type,
          location,
          city,
          units,
          price,
          image,
          description,
          status,
          reviewed_by,
          reviewed_at,
          rejection_reason,
          created_at,
          updated_at
        FROM projects
        WHERE developer_id = $1
        ORDER BY created_at DESC
        `,
        [req.user.id]
      );

      res.json(result.rows);
    } catch (error) {
      console.error(
        "Get developer projects error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message: "Failed to fetch your projects",
      });
    }
  }
);

/* ============================================================
   GET SINGLE OWN PROJECT
   DEVELOPER ONLY
============================================================ */

router.get(
  "/:id",
  authenticateToken,
  authorizeRoles("Developer"),
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!/^\d+$/.test(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid project ID",
        });
      }

      const result = await pool.query(
        `
        SELECT
          id,
          developer_id,
          name,
          type,
          location,
          city,
          units,
          price,
          image,
          description,
          status,
          reviewed_by,
          reviewed_at,
          rejection_reason,
          created_at,
          updated_at
        FROM projects
        WHERE id = $1
          AND developer_id = $2
        `,
        [
          id,
          req.user.id,
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message:
            "Project not found or you are not the owner",
        });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error(
        "Get project error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message: "Failed to fetch project",
      });
    }
  }
);

/* ============================================================
   CREATE PROJECT
   DEVELOPER ONLY

   SECURITY:
   developer_id comes from JWT
   status is always pending
============================================================ */

router.post(
  "/",
  authenticateToken,
  authorizeRoles("Developer"),
  async (req, res) => {
    try {
      const {
        name,
        type,
        location,
        city,
        units,
        price,
        image,
        description,
      } = req.body;

      if (
        !name ||
        !name.trim() ||
        !type ||
        !type.trim() ||
        !location ||
        !location.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Title, type and location are required",
        });
      }

      const result = await pool.query(
        `
        INSERT INTO projects (
          developer_id,
          name,
          type,
          location,
          city,
          units,
          price,
          image,
          description,
          status
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          $8,
          $9,
          'pending'
        )
        RETURNING *
        `,
        [
          // NEVER trust req.body.developer_id
          req.user.id,

          name.trim(),
          type.trim(),
          location.trim(),
          city || null,
          units ?? null,
          price || null,
          image || null,
          description || null,
        ]
      );

      res.status(201).json({
        success: true,
        message:
          "Project submitted successfully for admin approval",
        project: result.rows[0],
      });
    } catch (error) {
      console.error(
        "Create project error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message: "Failed to create project",
      });
    }
  }
);

/* ============================================================
   UPDATE PROJECT
   DEVELOPER OWNER ONLY

   SECURITY:
   - developer_id cannot change
   - status cannot change
   - review fields cannot change
   - every edit returns to pending
============================================================ */

router.put(
  "/:id",
  authenticateToken,
  authorizeRoles("Developer"),
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!/^\d+$/.test(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid project ID",
        });
      }

      const {
        name,
        type,
        location,
        city,
        units,
        price,
        image,
        description,
      } = req.body;

      const result = await pool.query(
        `
        UPDATE projects
        SET
          name = COALESCE($1, name),

          type = COALESCE($2, type),

          location = COALESCE($3, location),

          city = COALESCE($4, city),

          units = COALESCE($5, units),

          price = COALESCE($6, price),

          image = COALESCE($7, image),

          description = COALESCE($8, description),

          /*
            Every developer edit requires
            fresh admin approval.
          */
          status = 'pending',

          /*
            Clear previous review.
          */
          reviewed_by = NULL,

          reviewed_at = NULL,

          rejection_reason = NULL,

          updated_at = CURRENT_TIMESTAMP

        WHERE id = $9
          AND developer_id = $10

        RETURNING *
        `,
        [
          name?.trim() || null,
          type?.trim() || null,
          location?.trim() || null,
          city || null,
          units ?? null,
          price || null,
          image || null,
          description || null,

          id,

          // NEVER trust req.body.developer_id
          req.user.id,
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message:
            "Project not found or you are not the owner",
        });
      }

      res.json({
        success: true,
        message:
          "Project updated and submitted for admin approval",
        project: result.rows[0],
      });
    } catch (error) {
      console.error(
        "Update project error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message: "Failed to update project",
      });
    }
  }
);

/* ============================================================
   DELETE PROJECT
   DEVELOPER OWNER ONLY
============================================================ */

router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("Developer"),
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!/^\d+$/.test(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid project ID",
        });
      }

      const result = await pool.query(
        `
        DELETE FROM projects
        WHERE id = $1
          AND developer_id = $2
        RETURNING id
        `,
        [
          id,
          req.user.id,
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message:
            "Project not found or you are not the owner",
        });
      }

      res.json({
        success: true,
        message: "Project deleted successfully",
      });
    } catch (error) {
      console.error(
        "Delete project error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message: "Failed to delete project",
      });
    }
  }
);

module.exports = router;