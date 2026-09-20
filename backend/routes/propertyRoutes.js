const express = require("express");

const { pool } = require("../config/db");

const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();


/* =========================
   GET ALL PROPERTIES
========================= */

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        owner_id,
        title,
        type,
        location,
        city,
        price,
        price_value,
        bedrooms,
        bathrooms,
        area,
        image,
        description,
        verified,
        ready_to_move,
        zero_brokerage,
        status,
        created_at
      FROM properties
      WHERE status = 'published'
      ORDER BY created_at DESC
    `);

    res.json({
      success: true,
      properties: result.rows,
    });

  } catch (error) {
    console.error(
      "Get properties error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch properties",
    });
  }
});


/* =========================
   GET MY PROPERTIES
   SELLER / DEVELOPER
========================= */

router.get(
  "/my-properties",
  authenticateToken,
  authorizeRoles("Seller", "Developer"),
  async (req, res) => {
    try {
      const result = await pool.query(
        `
        SELECT
          id,
          owner_id,
          title,
          type,
          location,
          city,
          price,
          price_value,
          bedrooms,
          bathrooms,
          area,
          image,
          description,
          verified,
          ready_to_move,
          zero_brokerage,
          status,
          created_at
        FROM properties
        WHERE owner_id = $1
        ORDER BY created_at DESC
        `,
        [req.user.id]
      );

      res.json({
        success: true,
        properties: result.rows,
      });

    } catch (error) {
      console.error(
        "Get my properties error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message: "Failed to fetch your properties",
      });
    }
  }
);


/* =========================
   GET SINGLE PROPERTY
   WITH ALL IMAGES
========================= */

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT
        p.id,
        p.owner_id,
        p.title,
        p.type,
        p.location,
        p.city,
        p.price,
        p.price_value,
        p.bedrooms,
        p.bathrooms,
        p.area,
        p.image,
        p.description,
        p.verified,
        p.ready_to_move,
        p.zero_brokerage,
        p.status,
        p.created_at,

        COALESCE(
          json_agg(
            json_build_object(
              'id', pi.id,
              'image_url', pi.image_url,
              'sort_order', pi.sort_order
            )
            ORDER BY pi.sort_order, pi.id
          ) FILTER (WHERE pi.id IS NOT NULL),
          '[]'
        ) AS images

      FROM properties p

      LEFT JOIN property_images pi
        ON pi.property_id = p.id

      WHERE p.id = $1

      GROUP BY p.id
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    res.json({
      success: true,
      property: result.rows[0],
    });

  } catch (error) {
    console.error(
      "Get property error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch property",
    });
  }
});


/* =========================
   CREATE PROPERTY
   SELLER / DEVELOPER
========================= */

router.post(
  "/",
  authenticateToken,
  authorizeRoles("Seller", "Developer"),
  async (req, res) => {
    try {
      const {
        title,
        type,
        location,
        city,
        price,
        price_value,
        bedrooms,
        bathrooms,
        area,
        image,
        description,
        verified,
        ready_to_move,
        zero_brokerage,
      } = req.body;

      if (
        !title ||
        !type ||
        !location
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Title, type and location are required",
        });
      }

      const result = await pool.query(
  `
  INSERT INTO properties (
    owner_id,
    title,
    type,
    location,
    city,
    price,
    price_value,
    bedrooms,
    bathrooms,
    area,
    image,
    description,
    verified,
    ready_to_move,
    zero_brokerage,
    status
  )
  VALUES (
    $1, $2, $3, $4, $5,
    $6, $7, $8, $9, $10,
    $11, $12, $13, $14, $15,
    $16
  )
  RETURNING *
  `,
  [
    req.user.id,
    title.trim(),
    type,
    location.trim(),
    city || null,
    price || null,
    price_value || null,
    bedrooms || null,
    bathrooms || null,
    area || null,
    image || null,
    description || null,
    verified || false,
    ready_to_move || false,
    zero_brokerage || false,

    // Admin approval
    "pending",
  ]
);

      res.status(201).json({
        success: true,
        message: "Property created successfully",
        property: result.rows[0],
      });

    } catch (error) {
      console.error(
        "Create property error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message: "Failed to create property",
      });
    }
  }
);


/* =========================
   UPDATE PROPERTY
   OWNER ONLY
========================= */

router.put(
  "/:id",
  authenticateToken,
  authorizeRoles("Seller", "Developer"),
  async (req, res) => {
    try {
      const { id } = req.params;

      const {
        title,
        type,
        location,
        city,
        price,
        price_value,
        bedrooms,
        bathrooms,
        area,
        image,
        description,
        verified,
        ready_to_move,
        zero_brokerage,
        status,
      } = req.body;

      const result = await pool.query(
        `
        UPDATE properties
        SET
          title = COALESCE($1, title),
          type = COALESCE($2, type),
          location = COALESCE($3, location),
          city = COALESCE($4, city),
          price = COALESCE($5, price),
          price_value = COALESCE($6, price_value),
          bedrooms = COALESCE($7, bedrooms),
          bathrooms = COALESCE($8, bathrooms),
          area = COALESCE($9, area),
          image = COALESCE($10, image),
          description = COALESCE($11, description),
          verified = COALESCE($12, verified),
          ready_to_move = COALESCE($13, ready_to_move),
          zero_brokerage = COALESCE($14, zero_brokerage),
          status = COALESCE($15, status)
        WHERE id = $16
          AND owner_id = $17
        RETURNING *
        `,
        [
          title || null,
          type || null,
          location || null,
          city || null,
          price || null,
          price_value || null,
          bedrooms ?? null,
          bathrooms ?? null,
          area ?? null,
          image || null,
          description || null,
          verified ?? null,
          ready_to_move ?? null,
          zero_brokerage ?? null,
          status || null,
          id,
          req.user.id,
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message:
            "Property not found or you are not the owner",
        });
      }

      res.json({
        success: true,
        message: "Property updated successfully",
        property: result.rows[0],
      });

    } catch (error) {
      console.error(
        "Update property error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message: "Failed to update property",
      });
    }
  }
);


/* =========================
   DELETE PROPERTY
   OWNER ONLY
========================= */

router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("Seller", "Developer"),
  async (req, res) => {
    try {
      const { id } = req.params;

      const result = await pool.query(
        `
        DELETE FROM properties
        WHERE id = $1
          AND owner_id = $2
        RETURNING id
        `,
        [id, req.user.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message:
            "Property not found or you are not the owner",
        });
      }

      res.json({
        success: true,
        message: "Property deleted successfully",
      });

    } catch (error) {
      console.error(
        "Delete property error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message: "Failed to delete property",
      });
    }
  }
);


module.exports = router;