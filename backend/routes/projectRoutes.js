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
        p.image,
        p.description,
        p.status,
        p.created_at,
        p.updated_at,

        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'id', pm.id,
                'media_url', pm.media_url,
                'media_type', pm.media_type,
                'sort_order', pm.sort_order,
                'created_at', pm.created_at
              )
              ORDER BY pm.sort_order, pm.id
            )
            FROM project_media pm
            WHERE pm.project_id = p.id
          ),
          '[]'
        ) AS project_media

      FROM projects p

      WHERE p.status = 'approved'

      ORDER BY p.created_at DESC
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
   WITH MEDIA + AGREEMENT STATUS
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
        p.id,
        p.developer_id,
        p.name,
        p.type,
        p.location,
        p.city,
        p.units,
        p.price,
        p.image,
        p.description,
        p.status,
        p.created_at,
        p.updated_at,

        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'id', pm.id,
                'media_url', pm.media_url,
                'media_type', pm.media_type,
                'sort_order', pm.sort_order,
                'created_at', pm.created_at
              )
              ORDER BY pm.sort_order, pm.id
            )
            FROM project_media pm
            WHERE pm.project_id = p.id
          ),
          '[]'
        ) AS project_media

      FROM projects p

      WHERE p.id = $1
        AND p.status = 'approved'
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    return res.json({
      success: true,
      project: result.rows[0],
    });
  } catch (error) {
    console.error(
      "Get public project error:",
      error.message
    );

    return res.status(500).json({
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
          p.id,
          p.developer_id,
          p.name,
          p.type,
          p.location,
          p.city,
          p.units,
          p.price,
          p.image,
          p.description,
          p.status,
          p.reviewed_by,
          p.reviewed_at,
          p.rejection_reason,
          p.created_at,
          p.updated_at,

          COALESCE(
            (
              SELECT COUNT(*)
              FROM project_media pm
              WHERE pm.project_id = p.id
            ),
            0
          ) AS media_count,

          COALESCE(
            (
              SELECT COUNT(*)
              FROM project_media pm
              WHERE pm.project_id = p.id
                AND pm.media_type = 'video'
            ),
            0
          ) AS video_count,

          COALESCE(
  (
    SELECT json_agg(
      json_build_object(
        'id', pm.id,
        'media_url', pm.media_url,
        'media_type', pm.media_type,
        'sort_order', pm.sort_order,
        'created_at', pm.created_at
      )
      ORDER BY pm.sort_order, pm.id
    )
    FROM project_media pm
    WHERE pm.project_id = p.id
  ),
  '[]'
) AS project_media,

          (
            SELECT json_build_object(
              'id', pa.id,
              'agreement_version',
                pa.agreement_version,
              'accepted',
                pa.accepted,
              'information_confirmed',
                pa.information_confirmed,
              'authorization_confirmed',
                pa.authorization_confirmed,
              'accepted_at',
                pa.accepted_at
            )
            FROM project_agreements pa
            WHERE pa.project_id = p.id
            ORDER BY pa.created_at DESC
            LIMIT 1
          ) AS agreement

        FROM projects p

        WHERE p.developer_id = $1

        ORDER BY p.created_at DESC
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
          p.id,
          p.developer_id,
          p.name,
          p.type,
          p.location,
          p.city,
          p.units,
          p.price,
          p.image,
          p.description,
          p.status,
          p.reviewed_by,
          p.reviewed_at,
          p.rejection_reason,
          p.created_at,
          p.updated_at,

          COALESCE(
            (
              SELECT json_agg(
                json_build_object(
                  'id', pm.id,
                  'media_url', pm.media_url,
                  'media_type', pm.media_type,
                  'sort_order', pm.sort_order,
                  'created_at', pm.created_at
                )
                ORDER BY pm.sort_order, pm.id
              )
              FROM project_media pm
              WHERE pm.project_id = p.id
            ),
            '[]'
          ) AS project_media,

          (
            SELECT json_build_object(
              'id', pa.id,
              'agreement_version',
                pa.agreement_version,
              'signed_agreement_url',
                pa.signed_agreement_url,
              'accepted',
                pa.accepted,
              'information_confirmed',
                pa.information_confirmed,
              'authorization_confirmed',
                pa.authorization_confirmed,
              'accepted_at',
                pa.accepted_at,
              'created_at',
                pa.created_at
            )
            FROM project_agreements pa
            WHERE pa.project_id = p.id
              AND pa.developer_id = p.developer_id
            ORDER BY pa.created_at DESC
            LIMIT 1
          ) AS agreement

        FROM projects p

        WHERE p.id = $1
          AND p.developer_id = $2
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
            "Name, type and location are required",
        });
      }

      const ownerCheck = await pool.query(
        `
        SELECT id
        FROM projects
        WHERE id = $1
          AND developer_id = $2
        `,
        [
          id,
          req.user.id,
        ]
      );

      if (ownerCheck.rows.length === 0) {
        return res.status(403).json({
          success: false,
          message:
            "You are not the owner of this project.",
        });
      }

      const result = await pool.query(
        `
        UPDATE projects
        SET
          name = $1,
          type = $2,
          location = $3,
          city = $4,
          units = $5,
          price = $6,
          description = $7,
          status = 'pending',
          reviewed_by = NULL,
          reviewed_at = NULL,
          rejection_reason = NULL,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $8
          AND developer_id = $9
        RETURNING *
        `,
        [
          name.trim(),
          type.trim(),
          location.trim(),
          city || null,
          units ?? null,
          price || null,
          description || null,
          id,
          req.user.id,
        ]
      );

      res.json({
        success: true,
        message:
          "Project updated and submitted for review",
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
            "Project not found or you are not the owner.",
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