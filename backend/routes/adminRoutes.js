const express = require("express");
const router = express.Router();

const pool = require("../config/db");
const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");


/* =========================================================
   ADMIN DASHBOARD SUMMARY
   GET /api/admin/dashboard
========================================================= */

router.get(
  "/dashboard",
  authenticateToken,
  authorizeRoles("Admin"),
  async (req, res) => {
    try {
      const [
        propertiesResult,
        projectsResult,
        pendingPropertiesResult,
        pendingProjectsResult,
        usersResult,
      ] = await Promise.all([
        pool.query(
          `SELECT COUNT(*)::int AS count
           FROM properties
           WHERE status = 'approved'`
        ),

        pool.query(
          `SELECT COUNT(*)::int AS count
           FROM projects
           WHERE status = 'approved'`
        ),

        pool.query(
          `SELECT COUNT(*)::int AS count
           FROM properties
           WHERE status = 'pending'`
        ),

        pool.query(
          `SELECT COUNT(*)::int AS count
           FROM projects
           WHERE status = 'pending'`
        ),

        pool.query(
          `SELECT COUNT(*)::int AS count
           FROM users`
        ),
      ]);

      res.json({
        success: true,
        stats: {
          approvedProperties: propertiesResult.rows[0].count,
          approvedProjects: projectsResult.rows[0].count,
          pendingProperties: pendingPropertiesResult.rows[0].count,
          pendingProjects: pendingProjectsResult.rows[0].count,
          totalUsers: usersResult.rows[0].count,
        },
      });
    } catch (error) {
      console.error("ADMIN DASHBOARD ERROR:", error);

      res.status(500).json({
        success: false,
        message: "Failed to load admin dashboard.",
      });
    }
  }
);


/* =========================================================
   GET ALL PROPERTIES
   GET /api/admin/properties
========================================================= */

router.get(
  "/properties",
  authenticateToken,
  authorizeRoles("Admin"),
  async (req, res) => {
    try {
      const { status } = req.query;

      let query = `
        SELECT
          p.*,
          u.username AS seller_username,
          u.email AS seller_email
        FROM properties p
        LEFT JOIN users u
          ON p.seller_id = u.id
      `;

      const values = [];

      if (status) {
        query += ` WHERE p.status = $1`;
        values.push(status);
      }

      query += ` ORDER BY p.created_at DESC`;

      const result = await pool.query(query, values);

      res.json({
        success: true,
        properties: result.rows,
      });
    } catch (error) {
      console.error("ADMIN PROPERTIES ERROR:", error);

      res.status(500).json({
        success: false,
        message: "Failed to load properties.",
      });
    }
  }
);


/* =========================================================
   GET SINGLE PROPERTY
   GET /api/admin/properties/:id
========================================================= */

router.get(
  "/properties/:id",
  authenticateToken,
  authorizeRoles("Admin"),
  async (req, res) => {
    try {
      const { id } = req.params;

      const result = await pool.query(
        `
        SELECT
          p.*,
          u.username AS seller_username,
          u.email AS seller_email
        FROM properties p
        LEFT JOIN users u
          ON p.seller_id = u.id
        WHERE p.id = $1
        `,
        [id]
      );

      if (!result.rows.length) {
        return res.status(404).json({
          success: false,
          message: "Property not found.",
        });
      }

      res.json({
        success: true,
        property: result.rows[0],
      });
    } catch (error) {
      console.error("ADMIN PROPERTY DETAILS ERROR:", error);

      res.status(500).json({
        success: false,
        message: "Failed to load property.",
      });
    }
  }
);


/* =========================================================
   APPROVE PROPERTY
   PUT /api/admin/properties/:id/approve
========================================================= */

router.put(
  "/properties/:id/approve",
  authenticateToken,
  authorizeRoles("Admin"),
  async (req, res) => {
    try {
      const { id } = req.params;

      const result = await pool.query(
        `
        UPDATE properties
        SET
          status = 'approved',
          reviewed_by = $1,
          reviewed_at = CURRENT_TIMESTAMP,
          rejection_reason = NULL,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
        `,
        [req.user.id, id]
      );

      if (!result.rows.length) {
        return res.status(404).json({
          success: false,
          message: "Property not found.",
        });
      }

      res.json({
        success: true,
        message: "Property approved successfully.",
        property: result.rows[0],
      });
    } catch (error) {
      console.error("APPROVE PROPERTY ERROR:", error);

      res.status(500).json({
        success: false,
        message: "Failed to approve property.",
      });
    }
  }
);


/* =========================================================
   REJECT PROPERTY
   PUT /api/admin/properties/:id/reject
========================================================= */

router.put(
  "/properties/:id/reject",
  authenticateToken,
  authorizeRoles("Admin"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const result = await pool.query(
        `
        UPDATE properties
        SET
          status = 'rejected',
          reviewed_by = $1,
          reviewed_at = CURRENT_TIMESTAMP,
          rejection_reason = $2,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
        RETURNING *
        `,
        [req.user.id, reason || null, id]
      );

      if (!result.rows.length) {
        return res.status(404).json({
          success: false,
          message: "Property not found.",
        });
      }

      res.json({
        success: true,
        message: "Property rejected successfully.",
        property: result.rows[0],
      });
    } catch (error) {
      console.error("REJECT PROPERTY ERROR:", error);

      res.status(500).json({
        success: false,
        message: "Failed to reject property.",
      });
    }
  }
);


/* =========================================================
   DELETE PROPERTY
   DELETE /api/admin/properties/:id
========================================================= */

router.delete(
  "/properties/:id",
  authenticateToken,
  authorizeRoles("Admin"),
  async (req, res) => {
    try {
      const { id } = req.params;

      const result = await pool.query(
        `
        DELETE FROM properties
        WHERE id = $1
        RETURNING id
        `,
        [id]
      );

      if (!result.rows.length) {
        return res.status(404).json({
          success: false,
          message: "Property not found.",
        });
      }

      res.json({
        success: true,
        message: "Property deleted successfully.",
      });
    } catch (error) {
      console.error("DELETE PROPERTY ERROR:", error);

      res.status(500).json({
        success: false,
        message: "Failed to delete property.",
      });
    }
  }
);


/* =========================================================
   GET ALL PROJECTS
   GET /api/admin/projects
========================================================= */

router.get(
  "/projects",
  authenticateToken,
  authorizeRoles("Admin"),
  async (req, res) => {
    try {
      const { status } = req.query;

      let query = `
        SELECT
          p.*,
          u.username AS developer_username,
          u.email AS developer_email
        FROM projects p
        LEFT JOIN users u
          ON p.developer_id = u.id
      `;

      const values = [];

      if (status) {
        query += ` WHERE p.status = $1`;
        values.push(status);
      }

      query += ` ORDER BY p.created_at DESC`;

      const result = await pool.query(query, values);

      res.json({
        success: true,
        projects: result.rows,
      });
    } catch (error) {
      console.error("ADMIN PROJECTS ERROR:", error);

      res.status(500).json({
        success: false,
        message: "Failed to load projects.",
      });
    }
  }
);


/* =========================================================
   GET SINGLE PROJECT
   GET /api/admin/projects/:id
========================================================= */

router.get(
  "/projects/:id",
  authenticateToken,
  authorizeRoles("Admin"),
  async (req, res) => {
    try {
      const { id } = req.params;

      const result = await pool.query(
        `
        SELECT
          p.*,
          u.username AS developer_username,
          u.email AS developer_email
        FROM projects p
        LEFT JOIN users u
          ON p.developer_id = u.id
        WHERE p.id = $1
        `,
        [id]
      );

      if (!result.rows.length) {
        return res.status(404).json({
          success: false,
          message: "Project not found.",
        });
      }

      res.json({
        success: true,
        project: result.rows[0],
      });
    } catch (error) {
      console.error("ADMIN PROJECT DETAILS ERROR:", error);

      res.status(500).json({
        success: false,
        message: "Failed to load project.",
      });
    }
  }
);


/* =========================================================
   APPROVE PROJECT
   PUT /api/admin/projects/:id/approve
========================================================= */

router.put(
  "/projects/:id/approve",
  authenticateToken,
  authorizeRoles("Admin"),
  async (req, res) => {
    try {
      const { id } = req.params;

      const result = await pool.query(
        `
        UPDATE projects
        SET
          status = 'approved',
          reviewed_by = $1,
          reviewed_at = CURRENT_TIMESTAMP,
          rejection_reason = NULL,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
        `,
        [req.user.id, id]
      );

      if (!result.rows.length) {
        return res.status(404).json({
          success: false,
          message: "Project not found.",
        });
      }

      res.json({
        success: true,
        message: "Project approved successfully.",
        project: result.rows[0],
      });
    } catch (error) {
      console.error("APPROVE PROJECT ERROR:", error);

      res.status(500).json({
        success: false,
        message: "Failed to approve project.",
      });
    }
  }
);


/* =========================================================
   REJECT PROJECT
   PUT /api/admin/projects/:id/reject
========================================================= */

router.put(
  "/projects/:id/reject",
  authenticateToken,
  authorizeRoles("Admin"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const result = await pool.query(
        `
        UPDATE projects
        SET
          status = 'rejected',
          reviewed_by = $1,
          reviewed_at = CURRENT_TIMESTAMP,
          rejection_reason = $2,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
        RETURNING *
        `,
        [req.user.id, reason || null, id]
      );

      if (!result.rows.length) {
        return res.status(404).json({
          success: false,
          message: "Project not found.",
        });
      }

      res.json({
        success: true,
        message: "Project rejected successfully.",
        project: result.rows[0],
      });
    } catch (error) {
      console.error("REJECT PROJECT ERROR:", error);

      res.status(500).json({
        success: false,
        message: "Failed to reject project.",
      });
    }
  }
);


/* =========================================================
   DELETE PROJECT
   DELETE /api/admin/projects/:id
========================================================= */

router.delete(
  "/projects/:id",
  authenticateToken,
  authorizeRoles("Admin"),
  async (req, res) => {
    try {
      const { id } = req.params;

      const result = await pool.query(
        `
        DELETE FROM projects
        WHERE id = $1
        RETURNING id
        `,
        [id]
      );

      if (!result.rows.length) {
        return res.status(404).json({
          success: false,
          message: "Project not found.",
        });
      }

      res.json({
        success: true,
        message: "Project deleted successfully.",
      });
    } catch (error) {
      console.error("DELETE PROJECT ERROR:", error);

      res.status(500).json({
        success: false,
        message: "Failed to delete project.",
      });
    }
  }
);


module.exports = router;