const express = require("express");
const router = express.Router();

const { pool } = require("../config/db");
const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");

/*
====================================================
PUBLIC PROJECT ROUTES
====================================================
*/

/*
GET /api/projects/public
Get all approved projects
*/
router.get("/public", async (req, res) => {
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
        p.created_at,
        p.updated_at
      FROM projects p
      WHERE p.status = 'approved'
      ORDER BY p.created_at DESC
      `
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Get public projects error:", error);

    res.status(500).json({
      message: "Failed to fetch projects",
    });
  }
});


/*
GET /api/projects/public/:id
Get one approved project
*/
router.get("/public/:id", async (req, res) => {
  try {
    const { id } = req.params;

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
        p.updated_at
      FROM projects p
      WHERE p.id = $1
        AND p.status = 'approved'
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Get public project error:", error);

    res.status(500).json({
      message: "Failed to fetch project",
    });
  }
});


/*
====================================================
DEVELOPER ROUTES
====================================================
*/

/*
GET /api/projects
Get projects created by logged-in developer
*/
router.get(
  "/",
  authenticateToken,
  authorizeRoles("Developer"),
  async (req, res) => {
    try {
      const developerId = req.user.id;

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
          p.reviewed_by,
          p.reviewed_at,
          p.rejection_reason
        FROM projects p
        WHERE p.developer_id = $1
        ORDER BY p.created_at DESC
        `,
        [developerId]
      );

      res.json(result.rows);
    } catch (error) {
      console.error("Get developer projects error:", error);

      res.status(500).json({
        message: "Failed to fetch projects",
      });
    }
  }
);


/*
GET /api/projects/:id
Get developer's own project
*/
router.get(
  "/:id",
  authenticateToken,
  authorizeRoles("Developer"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const developerId = req.user.id;

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
          p.reviewed_by,
          p.reviewed_at,
          p.rejection_reason
        FROM projects p
        WHERE p.id = $1
          AND p.developer_id = $2
        `,
        [id, developerId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          message: "Project not found",
        });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error("Get project error:", error);

      res.status(500).json({
        message: "Failed to fetch project",
      });
    }
  }
);


/*
POST /api/projects
Create a new project

New projects ALWAYS start as pending.
Developer cannot directly publish/approve.
*/
router.post(
  "/",
  authenticateToken,
  authorizeRoles("Developer"),
  async (req, res) => {
    try {
      const developerId = req.user.id;

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

      if (!name || !type || !location || !city) {
        return res.status(400).json({
          message: "Name, type, location and city are required",
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
        RETURNING
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
          updated_at,
          reviewed_by,
          reviewed_at,
          rejection_reason
        `,
        [
          developerId,
          name,
          type,
          location,
          city,
          units || null,
          price || null,
          image || null,
          description || null,
        ]
      );

      res.status(201).json({
        message: "Project submitted for admin approval",
        project: result.rows[0],
      });
    } catch (error) {
      console.error("Create project error:", error);

      res.status(500).json({
        message: "Failed to create project",
      });
    }
  }
);


/*
PUT /api/projects/:id
Update developer's project

Whenever developer edits a project,
it goes back to pending review.
*/
router.put(
  "/:id",
  authenticateToken,
  authorizeRoles("Developer"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const developerId = req.user.id;

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

      const existingProject = await pool.query(
        `
        SELECT id
        FROM projects
        WHERE id = $1
          AND developer_id = $2
        `,
        [id, developerId]
      );

      if (existingProject.rows.length === 0) {
        return res.status(404).json({
          message: "Project not found",
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
          image = $7,
          description = $8,
          status = 'pending',
          reviewed_by = NULL,
          reviewed_at = NULL,
          rejection_reason = NULL,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $9
          AND developer_id = $10
        RETURNING
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
          updated_at,
          reviewed_by,
          reviewed_at,
          rejection_reason
        `,
        [
          name,
          type,
          location,
          city,
          units || null,
          price || null,
          image || null,
          description || null,
          id,
          developerId,
        ]
      );

      res.json({
        message: "Project updated and submitted for admin approval",
        project: result.rows[0],
      });
    } catch (error) {
      console.error("Update project error:", error);

      res.status(500).json({
        message: "Failed to update project",
      });
    }
  }
);


/*
DELETE /api/projects/:id
Developer deletes their own project
*/
router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("Developer"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const developerId = req.user.id;

      const result = await pool.query(
        `
        DELETE FROM projects
        WHERE id = $1
          AND developer_id = $2
        RETURNING id
        `,
        [id, developerId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          message: "Project not found",
        });
      }

      res.json({
        message: "Project deleted successfully",
      });
    } catch (error) {
      console.error("Delete project error:", error);

      res.status(500).json({
        message: "Failed to delete project",
      });
    }
  }
);


module.exports = router;