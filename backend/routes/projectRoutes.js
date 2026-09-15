const express = require("express");
const router = express.Router();

const { pool } = require("../config/db");

const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");

// Developer authorization
const developerOnly = authorizeRoles("Developer");

/* =========================================================
   PUBLIC PROJECTS
   GET /api/projects/public
========================================================= */

router.get("/public", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        name,
        type,
        location,
        city,
        units,
        price,
        image,
        description,
        status,
        created_at
      FROM projects
      WHERE LOWER(COALESCE(status, '')) NOT IN ('draft', 'deleted')
      ORDER BY created_at DESC
    `);

    return res.json({
      success: true,
      projects: result.rows,
    });
  } catch (error) {
    console.error("PUBLIC PROJECTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load public projects.",
    });
  }
});

/* =========================================================
   GET PUBLIC SINGLE PROJECT
   GET /api/projects/public/:id
========================================================= */

router.get("/public/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT
        id,
        name,
        type,
        location,
        city,
        units,
        price,
        image,
        description,
        status,
        created_at
      FROM projects
      WHERE id = $1
      AND LOWER(COALESCE(status, '')) NOT IN ('draft', 'deleted')
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Project not found.",
      });
    }

    return res.json({
      project: result.rows[0],
    });
  } catch (error) {
    console.error("PUBLIC PROJECT DETAILS ERROR:", error);

    return res.status(500).json({
      message: "Failed to load project.",
    });
  }
});

/* =========================================================
   GET MY PROJECTS
   GET /api/projects
========================================================= */

router.get(
  "/",
  authenticateToken,
  developerOnly,
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
          created_at,
          updated_at
        FROM projects
        WHERE developer_id = $1
        ORDER BY created_at DESC
        `,
        [req.user.id]
      );

      return res.json({
        success: true,
        projects: result.rows,
      });
    } catch (error) {
      console.error("GET MY PROJECTS ERROR:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to load your projects.",
      });
    }
  }
);

/* =========================================================
   GET SINGLE PROJECT
   GET /api/projects/:id
========================================================= */

router.get(
  "/:id",
  authenticateToken,
  developerOnly,
  async (req, res) => {
    try {
      const { id } = req.params;

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
        AND developer_id = $2
        `,
        [id, req.user.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Project not found.",
        });
      }

      return res.json({
        success: true,
        project: result.rows[0],
      });
    } catch (error) {
      console.error("GET PROJECT ERROR:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to load project.",
      });
    }
  }
);

/* =========================================================
   CREATE PROJECT
   POST /api/projects
========================================================= */

router.post(
  "/",
  authenticateToken,
  developerOnly,
  async (req, res) => {
    try {
      console.log("CREATE PROJECT USER:", req.user);
      console.log("CREATE PROJECT BODY:", req.body);

      const {
        name,
        type,
        location,
        city,
        units,
        price,
        image,
        description,
        status,
      } = req.body;

      /* -----------------------------------------
         VALIDATION
      ----------------------------------------- */

      if (!name || !String(name).trim()) {
        return res.status(400).json({
          success: false,
          message: "Project name is required.",
        });
      }

      if (!location || !String(location).trim()) {
        return res.status(400).json({
          success: false,
          message: "Project location is required.",
        });
      }

      if (!type || !String(type).trim()) {
        return res.status(400).json({
          success: false,
          message: "Project type is required.",
        });
      }

      /*
        If frontend doesn't send city,
        use location as city.

        This prevents:
        null value in column "city"
      */

      const finalCity =
        city && String(city).trim()
          ? String(city).trim()
          : String(location).trim();

      const finalUnits =
        units !== undefined &&
        units !== null &&
        String(units).trim() !== ""
          ? Number(units)
          : null;

      const finalPrice =
        price !== undefined &&
        price !== null &&
        String(price).trim() !== ""
          ? String(price).trim()
          : null;

      const finalImage =
        image !== undefined &&
        image !== null &&
        String(image).trim() !== ""
          ? String(image).trim()
          : null;

      const finalDescription =
        description !== undefined &&
        description !== null &&
        String(description).trim() !== ""
          ? String(description).trim()
          : null;

      const finalStatus =
        status !== undefined &&
        status !== null &&
        String(status).trim() !== ""
          ? String(status).trim()
          : "Available";

      /* -----------------------------------------
         CREATE PROJECT
      ----------------------------------------- */

      const result = await pool.query(
        `
        INSERT INTO projects
        (
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
        VALUES
        (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          $8,
          $9,
          $10
        )
        RETURNING *
        `,
        [
          req.user.id,
          String(name).trim(),
          String(type).trim(),
          String(location).trim(),
          finalCity,
          finalUnits,
          finalPrice,
          finalImage,
          finalDescription,
          finalStatus,
        ]
      );

      console.log("PROJECT CREATED:", result.rows[0]);

      return res.status(201).json({
        success: true,
        message: "Project created successfully.",
        project: result.rows[0],
      });
    } catch (error) {
      console.error("CREATE PROJECT ERROR:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to create project.",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : undefined,
      });
    }
  }
);

/* =========================================================
   UPDATE PROJECT
   PUT /api/projects/:id
========================================================= */

router.put(
  "/:id",
  authenticateToken,
  developerOnly,
  async (req, res) => {
    try {
      const { id } = req.params;

      const {
        name,
        type,
        location,
        city,
        units,
        price,
        image,
        description,
        status,
      } = req.body;

      /* -----------------------------------------
         VALIDATION
      ----------------------------------------- */

      if (!name || !String(name).trim()) {
        return res.status(400).json({
          success: false,
          message: "Project name is required.",
        });
      }

      if (!location || !String(location).trim()) {
        return res.status(400).json({
          success: false,
          message: "Project location is required.",
        });
      }

      if (!type || !String(type).trim()) {
        return res.status(400).json({
          success: false,
          message: "Project type is required.",
        });
      }

      // Same fallback for update
      const finalCity =
        city && String(city).trim()
          ? String(city).trim()
          : String(location).trim();

      const finalUnits =
        units !== undefined &&
        units !== null &&
        String(units).trim() !== ""
          ? Number(units)
          : null;

      const finalPrice =
        price !== undefined &&
        price !== null &&
        String(price).trim() !== ""
          ? String(price).trim()
          : null;

      const finalImage =
        image !== undefined &&
        image !== null &&
        String(image).trim() !== ""
          ? String(image).trim()
          : null;

      const finalDescription =
        description !== undefined &&
        description !== null &&
        String(description).trim() !== ""
          ? String(description).trim()
          : null;

      const finalStatus =
        status !== undefined &&
        status !== null &&
        String(status).trim() !== ""
          ? String(status).trim()
          : "Available";

      /* -----------------------------------------
         UPDATE PROJECT
      ----------------------------------------- */

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
          status = $9,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $10
        AND developer_id = $11
        RETURNING *
        `,
        [
          String(name).trim(),
          String(type).trim(),
          String(location).trim(),
          finalCity,
          finalUnits,
          finalPrice,
          finalImage,
          finalDescription,
          finalStatus,
          id,
          req.user.id,
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Project not found.",
        });
      }

      return res.json({
        success: true,
        message: "Project updated successfully.",
        project: result.rows[0],
      });
    } catch (error) {
      console.error("UPDATE PROJECT ERROR:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to update project.",
      });
    }
  }
);

/* =========================================================
   DELETE PROJECT
   DELETE /api/projects/:id
========================================================= */

router.delete(
  "/:id",
  authenticateToken,
  developerOnly,
  async (req, res) => {
    try {
      const { id } = req.params;

      const result = await pool.query(
        `
        DELETE FROM projects
        WHERE id = $1
        AND developer_id = $2
        RETURNING id
        `,
        [id, req.user.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Project not found.",
        });
      }

      return res.json({
        success: true,
        message: "Project deleted successfully.",
      });
    } catch (error) {
      console.error("DELETE PROJECT ERROR:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to delete project.",
      });
    }
  }
);

module.exports = router;