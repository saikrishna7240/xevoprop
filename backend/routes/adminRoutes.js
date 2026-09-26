const express = require("express");

const { pool } = require("../config/db");

const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();

/* =========================================================
   ADMIN AUTHENTICATION
========================================================= */

router.use(authenticateToken);
router.use(authorizeRoles("Admin"));

/* =========================================================
   ADMIN DASHBOARD
========================================================= */

router.get("/dashboard", async (req, res) => {
  try {
    const propertiesResult = await pool.query(`
      SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (
          WHERE status = 'pending'
        ) AS pending,
        COUNT(*) FILTER (
          WHERE status = 'approved'
        ) AS approved,
        COUNT(*) FILTER (
          WHERE status = 'rejected'
        ) AS rejected
      FROM properties
    `);

    const projectsResult = await pool.query(`
      SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (
          WHERE status = 'pending'
        ) AS pending,
        COUNT(*) FILTER (
          WHERE status = 'approved'
        ) AS approved,
        COUNT(*) FILTER (
          WHERE status = 'rejected'
        ) AS rejected
      FROM projects
    `);

    const usersResult = await pool.query(`
      SELECT COUNT(*) AS total
      FROM users
    `);

    res.json({
      success: true,
      properties: propertiesResult.rows[0],
      projects: projectsResult.rows[0],
      users: usersResult.rows[0],
    });
  } catch (error) {
    console.error(
      "ADMIN DASHBOARD ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to load admin dashboard.",
    });
  }
});

/* =========================================================
   GET ALL PROPERTIES
========================================================= */

router.get("/properties", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        p.*,

        u.id AS seller_id,
        u.username AS seller_username,
        u.name AS owner_name,
        u.email AS owner_email,
        u.phone AS owner_phone,
        u.role AS owner_role

      FROM properties p

      LEFT JOIN users u
        ON p.owner_id = u.id

      ORDER BY
        CASE
          WHEN p.status = 'pending' THEN 0
          WHEN p.status = 'approved' THEN 1
          ELSE 2
        END,

        p.id DESC
    `);

    res.json({
      success: true,
      properties: result.rows,
    });
  } catch (error) {
    console.error(
      "ADMIN PROPERTIES ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to load properties.",
    });
  }
});

/* =========================================================
   GET SINGLE PROPERTY
========================================================= */

router.get(
  "/properties/:id",
  async (req, res) => {
    try {
      const { id } = req.params;

      const result = await pool.query(
        `
        SELECT
          p.*,

          u.id AS seller_id,
          u.username AS seller_username,
          u.name AS owner_name,
          u.email AS owner_email,
          u.phone AS owner_phone,
          u.role AS owner_role

        FROM properties p

        LEFT JOIN users u
          ON p.owner_id = u.id

        WHERE p.id = $1
        `,
        [id]
      );

      if (result.rows.length === 0) {
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
      console.error(
        "ADMIN PROPERTY DETAILS ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to load property.",
      });
    }
  }
);

/* =========================================================
   APPROVE PROPERTY
========================================================= */

router.put(
  "/properties/:id/approve",
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
          rejection_reason = NULL

        WHERE id = $2

        RETURNING *
        `,
        [
          req.user.id,
          id,
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Property not found.",
        });
      }

      res.json({
        success: true,
        message:
          "Property approved successfully.",
        property: result.rows[0],
      });
    } catch (error) {
      console.error(
        "APPROVE PROPERTY ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to approve property.",
      });
    }
  }
);

/* =========================================================
   REJECT PROPERTY
========================================================= */

router.put(
  "/properties/:id/reject",
  async (req, res) => {
    try {
      const { id } = req.params;

      const {
        rejection_reason,
      } = req.body;

      const result = await pool.query(
        `
        UPDATE properties

        SET
          status = 'rejected',
          reviewed_by = $1,
          reviewed_at = CURRENT_TIMESTAMP,
          rejection_reason = $2

        WHERE id = $3

        RETURNING *
        `,
        [
          req.user.id,
          rejection_reason ||
            "Property did not meet approval requirements.",
          id,
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Property not found.",
        });
      }

      res.json({
        success: true,
        message:
          "Property rejected successfully.",
        property: result.rows[0],
      });
    } catch (error) {
      console.error(
        "REJECT PROPERTY ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to reject property.",
      });
    }
  }
);

/* =========================================================
   DELETE PROPERTY
========================================================= */

router.delete(
  "/properties/:id",
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

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Property not found.",
        });
      }

      res.json({
        success: true,
        message:
          "Property deleted successfully.",
      });
    } catch (error) {
      console.error(
        "DELETE PROPERTY ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to delete property.",
      });
    }
  }
);

/* =========================================================
   GET ALL PROJECTS
========================================================= */

router.get("/projects", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        p.*,

        u.username AS developer_username,
        u.email AS developer_email,

        COALESCE(
          (
            SELECT json_build_object(
              'id', pa.id,
              'signed_agreement_url', pa.signed_agreement_url,
              'accepted', pa.accepted,
              'information_confirmed', pa.information_confirmed,
              'authorization_confirmed', pa.authorization_confirmed,
              'accepted_at', pa.accepted_at,
              'created_at', pa.created_at
            )
            FROM project_agreements pa
            WHERE pa.project_id = p.id
            ORDER BY pa.created_at DESC
            LIMIT 1
          ),
          NULL
        ) AS agreement

      FROM projects p

      LEFT JOIN users u
        ON p.developer_id = u.id

      ORDER BY
        CASE
          WHEN p.status = 'pending' THEN 0
          WHEN p.status = 'approved' THEN 1
          ELSE 2
        END,

        p.id DESC
    `);

    res.json({
      success: true,
      projects: result.rows,
    });
  } catch (error) {
    console.error(
      "ADMIN PROJECTS ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to load projects.",
    });
  }
});

/* =========================================================
   GET SINGLE PROJECT
========================================================= */

router.get(
  "/projects/:id",
  async (req, res) => {
    try {
      const { id } = req.params;

      const result = await pool.query(
        `
        SELECT
          p.*,

          u.username AS developer_username,
          u.name AS developer_name,
          u.email AS developer_email,

          COALESCE(
            (
              SELECT json_build_object(
                'id', pa.id,
                'signed_agreement_url', pa.signed_agreement_url,
                'accepted', pa.accepted,
                'information_confirmed', pa.information_confirmed,
                'authorization_confirmed', pa.authorization_confirmed,
                'accepted_at', pa.accepted_at,
                'created_at', pa.created_at
              )
              FROM project_agreements pa
              WHERE pa.project_id = p.id
              ORDER BY pa.created_at DESC
              LIMIT 1
            ),
            NULL
          ) AS agreement

        FROM projects p

        LEFT JOIN users u
          ON p.developer_id = u.id

        WHERE p.id = $1
        `,
        [id]
      );

      if (result.rows.length === 0) {
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
      console.error(
        "ADMIN PROJECT DETAILS ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to load project.",
      });
    }
  }
);
/* =========================================================
   APPROVE PROJECT
========================================================= */

router.put(
  "/projects/:id/approve",
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
          rejection_reason = NULL

        WHERE id = $2

        RETURNING *
        `,
        [
          req.user.id,
          id,
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Project not found.",
        });
      }

      res.json({
        success: true,
        message:
          "Project approved successfully.",
        project: result.rows[0],
      });
    } catch (error) {
      console.error(
        "APPROVE PROJECT ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to approve project.",
      });
    }
  }
);

/* =========================================================
   REJECT PROJECT
========================================================= */

router.put(
  "/projects/:id/reject",
  async (req, res) => {
    try {
      const { id } = req.params;

      const {
        rejection_reason,
      } = req.body;

      const result = await pool.query(
        `
        UPDATE projects

        SET
          status = 'rejected',
          reviewed_by = $1,
          reviewed_at = CURRENT_TIMESTAMP,
          rejection_reason = $2

        WHERE id = $3

        RETURNING *
        `,
        [
          req.user.id,
          rejection_reason ||
            "Project did not meet approval requirements.",
          id,
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Project not found.",
        });
      }

      res.json({
        success: true,
        message:
          "Project rejected successfully.",
        project: result.rows[0],
      });
    } catch (error) {
      console.error(
        "REJECT PROJECT ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to reject project.",
      });
    }
  }
);

/* =========================================================
   DELETE PROJECT
========================================================= */

router.delete(
  "/projects/:id",
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

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Project not found.",
        });
      }

      res.json({
        success: true,
        message:
          "Project deleted successfully.",
      });
    } catch (error) {
      console.error(
        "DELETE PROJECT ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to delete project.",
      });
    }
  }
);

/* =========================================================
   EXPORT
========================================================= */

module.exports = router;