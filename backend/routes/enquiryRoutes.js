const express = require("express");
const { pool } = require("../config/db");
const {
  authenticateToken,
} = require("../middleware/authMiddleware");

const router = express.Router();

const statuses = ["new", "contacted", "resolved"];

/* ============================================================
   PROPERTY ENQUIRY ACCESS
============================================================ */

const getEnquiryAccess = async (id, userId) => {
  const result = await pool.query(
    `
    SELECT
      e.id,
      e.property_id,
      e.buyer_id,
      p.owner_id,
      p.title AS property_title,
      p.image AS property_image,
      p.location AS property_location,
      p.city AS property_city,
      p.price AS property_price
    FROM property_enquiries e
    JOIN properties p
      ON p.id = e.property_id
    WHERE e.id = $1
    `,
    [id]
  );

  if (!result.rows.length) {
    return {
      row: null,
      allowed: false,
    };
  }

  const row = result.rows[0];

  const allowed =
    Number(row.buyer_id) === Number(userId) ||
    Number(row.owner_id) === Number(userId);

  return {
    row,
    allowed,
  };
};

/* ============================================================
   CREATE PROPERTY ENQUIRY
   POST /api/enquiries
============================================================ */

router.post("/", authenticateToken, async (req, res) => {
  try {
    const {
      property_id,
      name,
      email,
      phone,
      message,
    } = req.body;

    if (
      !property_id ||
      !name?.trim() ||
      !email?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Property, name and email are required.",
      });
    }

    const property = await pool.query(
      `
      SELECT id
      FROM properties
      WHERE id = $1
      `,
      [property_id]
    );

    if (!property.rows.length) {
      return res.status(404).json({
        success: false,
        message: "Property not found.",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO property_enquiries
      (
        property_id,
        buyer_id,
        name,
        email,
        phone,
        message
      )
      VALUES
      ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [
        property_id,
        req.user.id,
        name.trim(),
        email.trim().toLowerCase(),
        phone?.trim() || null,
        message?.trim() || null,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Enquiry sent successfully.",
      enquiry: result.rows[0],
    });
  } catch (error) {
    console.error("Create enquiry error:", error);

    return res.status(500).json({
      success: false,
      message:
        error.message || "Failed to send enquiry.",
    });
  }
});

/* ============================================================
   BUYER PROPERTY ENQUIRIES
   GET /api/enquiries/buyer
============================================================ */

router.get("/buyer", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        e.id,
        e.property_id,
        e.buyer_id,
        e.name,
        e.email,
        e.phone,
        e.message,
        e.status,
        e.created_at,

        p.title AS property_title,
        p.image AS property_image,
        p.location AS property_location,
        p.city AS property_city,
        p.price AS property_price,

        (
          SELECT em.message
          FROM enquiry_messages em
          WHERE em.enquiry_id = e.id
          ORDER BY em.created_at DESC
          LIMIT 1
        ) AS last_message

      FROM property_enquiries e

      JOIN properties p
        ON p.id = e.property_id

      WHERE e.buyer_id = $1

      ORDER BY e.created_at DESC
      `,
      [req.user.id]
    );

    return res.json({
      success: true,
      enquiries: result.rows,
    });
  } catch (error) {
    console.error(
      "Get buyer enquiries error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch your enquiries.",
    });
  }
});

/* ============================================================
   SELLER PROPERTY ENQUIRIES
   GET /api/enquiries/seller
============================================================ */

router.get("/seller", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        e.id,
        e.property_id,
        e.buyer_id,
        e.name,
        e.email,
        e.phone,
        e.message,
        e.status,
        e.created_at,

        p.title AS property_title,
        p.image AS property_image,
        p.location AS property_location,
        p.city AS property_city,
        p.price AS property_price,

        (
          SELECT em.message
          FROM enquiry_messages em
          WHERE em.enquiry_id = e.id
          ORDER BY em.created_at DESC
          LIMIT 1
        ) AS last_message

      FROM property_enquiries e

      JOIN properties p
        ON p.id = e.property_id

      WHERE p.owner_id = $1

      ORDER BY e.created_at DESC
      `,
      [req.user.id]
    );

    return res.json({
      success: true,
      enquiries: result.rows,
    });
  } catch (error) {
    console.error(
      "Get seller enquiries error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch enquiries.",
    });
  }
});

/* ============================================================
   ============================================================
   PROJECT ENQUIRIES
   ============================================================
============================================================ */

/* ============================================================
   CREATE PROJECT ENQUIRY
   POST /api/enquiries/project
============================================================ */

router.post(
  "/project",
  authenticateToken,
  async (req, res) => {
    try {
      const {
        project_id,
        name,
        email,
        phone,
        message,
      } = req.body;

      if (
        !project_id ||
        !name?.trim() ||
        !email?.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Project, name and email are required.",
        });
      }

      /*
       * Only approved projects can receive
       * public enquiries.
       */
      const projectResult = await pool.query(
        `
        SELECT
          id,
          developer_id,
          name,
          status
        FROM projects
        WHERE id = $1
          AND status = 'approved'
        `,
        [project_id]
      );

      if (!projectResult.rows.length) {
        return res.status(404).json({
          success: false,
          message:
            "Project not found or is not currently available.",
        });
      }

      const result = await pool.query(
        `
        INSERT INTO project_enquiries
        (
          project_id,
          buyer_id,
          name,
          email,
          phone,
          message
        )
        VALUES
        ($1, $2, $3, $4, $5, $6)
        RETURNING *
        `,
        [
          project_id,
          req.user.id,
          name.trim(),
          email.trim().toLowerCase(),
          phone?.trim() || null,
          message?.trim() || null,
        ]
      );

      return res.status(201).json({
        success: true,
        message:
          "Project enquiry sent successfully.",
        enquiry: result.rows[0],
      });
    } catch (error) {
      console.error(
        "Create project enquiry error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to send project enquiry.",
      });
    }
  }
);

/* ============================================================
   BUYER PROJECT ENQUIRIES
   GET /api/enquiries/project/buyer
============================================================ */

router.get(
  "/project/buyer",
  authenticateToken,
  async (req, res) => {
    try {
      const result = await pool.query(
        `
        SELECT
          e.id,
          e.project_id,
          e.buyer_id,
          e.name,
          e.email,
          e.phone,
          e.message,
          e.status,
          e.created_at,
          e.updated_at,

          p.name AS project_name,
          p.image AS project_image,
          p.location AS project_location,
          p.city AS project_city,
          p.type AS project_type,
          p.price AS project_price

        FROM project_enquiries e

        JOIN projects p
          ON p.id = e.project_id

        WHERE e.buyer_id = $1

        ORDER BY e.created_at DESC
        `,
        [req.user.id]
      );

      return res.json({
        success: true,
        enquiries: result.rows,
      });
    } catch (error) {
      console.error(
        "Get buyer project enquiries error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch project enquiries.",
      });
    }
  }
);

/* ============================================================
   DEVELOPER PROJECT ENQUIRIES
   GET /api/enquiries/project/developer
============================================================ */

router.get(
  "/project/developer",
  authenticateToken,
  async (req, res) => {
    try {
      const result = await pool.query(
        `
        SELECT
          e.id,
          e.project_id,
          e.buyer_id,
          e.name,
          e.email,
          e.phone,
          e.message,
          e.status,
          e.created_at,
          e.updated_at,

          p.name AS project_name,
          p.image AS project_image,
          p.location AS project_location,
          p.city AS project_city,
          p.type AS project_type,
          p.price AS project_price

        FROM project_enquiries e

        JOIN projects p
          ON p.id = e.project_id

        WHERE p.developer_id = $1

        ORDER BY e.created_at DESC
        `,
        [req.user.id]
      );

      return res.json({
        success: true,
        enquiries: result.rows,
      });
    } catch (error) {
      console.error(
        "Get developer project enquiries error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch project enquiries.",
      });
    }
  }
);

/* ============================================================
   UPDATE PROJECT ENQUIRY STATUS
   PUT /api/enquiries/project/:id/status
============================================================ */

router.put(
  "/project/:id/status",
  authenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!statuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid enquiry status.",
        });
      }

      const result = await pool.query(
        `
        UPDATE project_enquiries e

        SET
          status = $1,
          updated_at = CURRENT_TIMESTAMP

        FROM projects p

        WHERE
          e.id = $2
          AND e.project_id = p.id
          AND p.developer_id = $3

        RETURNING e.*
        `,
        [
          status,
          id,
          req.user.id,
        ]
      );

      if (!result.rows.length) {
        return res.status(404).json({
          success: false,
          message:
            "Project enquiry not found or access denied.",
        });
      }

      return res.json({
        success: true,
        message:
          "Project enquiry status updated.",
        enquiry: result.rows[0],
      });
    } catch (error) {
      console.error(
        "Update project enquiry status error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to update project enquiry status.",
      });
    }
  }
);

/* ============================================================
   ============================================================
   PROPERTY ENQUIRY STATUS / MESSAGES
   Dynamic routes MUST come AFTER /project routes
   ============================================================
============================================================ */

/* ============================================================
   UPDATE PROPERTY ENQUIRY STATUS
   PUT /api/enquiries/:id/status
============================================================ */

router.put(
  "/:id/status",
  authenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!statuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid enquiry status.",
        });
      }

      const result = await pool.query(
        `
        UPDATE property_enquiries e

        SET status = $1

        FROM properties p

        WHERE
          e.id = $2
          AND e.property_id = p.id
          AND p.owner_id = $3

        RETURNING e.*
        `,
        [
          status,
          id,
          req.user.id,
        ]
      );

      if (!result.rows.length) {
        return res.status(404).json({
          success: false,
          message:
            "Enquiry not found or access denied.",
        });
      }

      return res.json({
        success: true,
        message:
          "Enquiry status updated.",
        enquiry: result.rows[0],
      });
    } catch (error) {
      console.error(
        "Update enquiry status error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to update enquiry status.",
      });
    }
  }
);

/* ============================================================
   GET PROPERTY ENQUIRY MESSAGES
   GET /api/enquiries/:id/messages
============================================================ */

router.get(
  "/:id/messages",
  authenticateToken,
  async (req, res) => {
    try {
      const {
        row,
        allowed,
      } = await getEnquiryAccess(
        req.params.id,
        req.user.id
      );

      if (!row) {
        return res.status(404).json({
          success: false,
          message: "Enquiry not found.",
        });
      }

      if (!allowed) {
        return res.status(403).json({
          success: false,
          message:
            "You cannot access this enquiry.",
        });
      }

      const result = await pool.query(
        `
        SELECT
          em.id,
          em.enquiry_id,
          em.sender_id,
          em.message,
          em.created_at,
          u.name AS sender_name,
          u.role AS sender_role

        FROM enquiry_messages em

        LEFT JOIN users u
          ON u.id = em.sender_id

        WHERE em.enquiry_id = $1

        ORDER BY em.created_at ASC
        `,
        [req.params.id]
      );

      return res.json({
        success: true,
        enquiry: row,
        messages: result.rows,
      });
    } catch (error) {
      console.error(
        "Get enquiry messages error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to load messages.",
      });
    }
  }
);

/* ============================================================
   SEND PROPERTY ENQUIRY MESSAGE
   POST /api/enquiries/:id/messages
============================================================ */

router.post(
  "/:id/messages",
  authenticateToken,
  async (req, res) => {
    try {
      const message =
        req.body.message?.trim();

      if (!message) {
        return res.status(400).json({
          success: false,
          message: "Message is required.",
        });
      }

      const {
        row,
        allowed,
      } = await getEnquiryAccess(
        req.params.id,
        req.user.id
      );

      if (!row) {
        return res.status(404).json({
          success: false,
          message: "Enquiry not found.",
        });
      }

      if (!allowed) {
        return res.status(403).json({
          success: false,
          message:
            "You cannot access this enquiry.",
        });
      }

      const result = await pool.query(
        `
        INSERT INTO enquiry_messages
        (
          enquiry_id,
          sender_id,
          message
        )
        VALUES
        ($1, $2, $3)

        RETURNING
          id,
          enquiry_id,
          sender_id,
          message,
          created_at
        `,
        [
          req.params.id,
          req.user.id,
          message,
        ]
      );

      return res.status(201).json({
        success: true,
        message:
          "Message sent successfully.",
        chatMessage:
          result.rows[0],
      });
    } catch (error) {
      console.error(
        "Send enquiry message error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to send message.",
      });
    }
  }
);

module.exports = router;