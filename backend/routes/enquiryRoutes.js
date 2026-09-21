const express = require("express");

const { pool } = require("../config/db");

const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();

/* ============================================================
   NOTIFICATION HELPER
============================================================ */

const createNotification = async ({
  userId,
  type,
  title,
  message,
  referenceId = null,
  referenceType = null,
}) => {
  try {
    await pool.query(
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
      `,
      [
        userId,
        type,
        title,
        message,
        referenceId,
        referenceType,
      ]
    );
  } catch (error) {
    /*
      Notification failure should never break
      the main enquiry/chat operation.
    */
    console.error(
      "Create notification error:",
      error.message
    );
  }
};

/* ============================================================
   PROPERTY ENQUIRY ACCESS HELPER
============================================================ */

const getPropertyEnquiryAccess = async (
  enquiryId,
  userId
) => {
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
      e.updated_at,

      p.owner_id,
      p.title AS property_title

    FROM property_enquiries e

    JOIN properties p
      ON p.id = e.property_id

    WHERE e.id = $1
    `,
    [enquiryId]
  );

  if (result.rows.length === 0) {
    return {
      enquiry: null,
      allowed: false,
    };
  }

  const enquiry = result.rows[0];

  const allowed =
    Number(enquiry.buyer_id) === Number(userId) ||
    Number(enquiry.owner_id) === Number(userId);

  return {
    enquiry,
    allowed,
  };
};

/* ============================================================
   PROJECT ENQUIRY ACCESS HELPER
============================================================ */

const getProjectEnquiryAccess = async (
  enquiryId,
  userId
) => {
  const result = await pool.query(
    `
    SELECT
      pe.id,
      pe.project_id,
      pe.buyer_id,
      pe.name,
      pe.email,
      pe.phone,
      pe.message,
      pe.status,
      pe.created_at,
      pe.updated_at,

      p.developer_id,
      p.name AS project_name

    FROM project_enquiries pe

    JOIN projects p
      ON p.id = pe.project_id

    WHERE pe.id = $1
    `,
    [enquiryId]
  );

  if (result.rows.length === 0) {
    return {
      enquiry: null,
      allowed: false,
    };
  }

  const enquiry = result.rows[0];

  const allowed =
    Number(enquiry.buyer_id) === Number(userId) ||
    Number(enquiry.developer_id) === Number(userId);

  return {
    enquiry,
    allowed,
  };
};

/* ============================================================
   CREATE PROPERTY ENQUIRY
   BUYER ONLY
============================================================ */

router.post(
  "/",
  authenticateToken,
  authorizeRoles("Buyer"),
  async (req, res) => {
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
        !name ||
        !email ||
        !message
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Property, name, email and message are required",
        });
      }

      const propertyResult =
        await pool.query(
          `
          SELECT
            id,
            owner_id,
            title
          FROM properties
          WHERE id = $1
            AND status = 'approved'
          `,
          [property_id]
        );

      if (propertyResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Property not found",
        });
      }

      const property =
        propertyResult.rows[0];

      const result = await pool.query(
        `
        INSERT INTO property_enquiries (
          property_id,
          buyer_id,
          name,
          email,
          phone,
          message
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
        `,
        [
          property_id,
          req.user.id,
          name.trim(),
          email.trim(),
          phone?.trim() || null,
          message.trim(),
        ]
      );

      const enquiry = result.rows[0];

      /* ======================================================
         NOTIFY PROPERTY OWNER
      ====================================================== */

      await createNotification({
        userId: property.owner_id,
        type: "property_enquiry",
        title: "New Property Enquiry",
        message: `${name.trim()} sent an enquiry about ${property.title}.`,
        referenceId: enquiry.id,
        referenceType: "property_enquiry",
      });

      res.status(201).json({
        success: true,
        message:
          "Enquiry submitted successfully",
        enquiry,
      });
    } catch (error) {
      console.error(
        "Create property enquiry error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to create property enquiry",
      });
    }
  }
);

/* ============================================================
   GET BUYER PROPERTY ENQUIRIES
============================================================ */

router.get(
  "/buyer",
  authenticateToken,
  authorizeRoles("Buyer"),
  async (req, res) => {
    try {
      const result = await pool.query(
        `
        SELECT
          e.*,
          p.title AS property_title,
          p.image AS property_image,
          p.location AS property_location

        FROM property_enquiries e

        JOIN properties p
          ON p.id = e.property_id

        WHERE e.buyer_id = $1

        ORDER BY e.created_at DESC
        `,
        [req.user.id]
      );

      res.json({
        success: true,
        enquiries: result.rows,
      });
    } catch (error) {
      console.error(
        "Get buyer property enquiries error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to fetch your enquiries",
      });
    }
  }
);

/* ============================================================
   GET SELLER PROPERTY ENQUIRIES
============================================================ */

router.get(
  "/seller",
  authenticateToken,
  authorizeRoles("Seller", "Developer"),
  async (req, res) => {
    try {
      const result = await pool.query(
        `
        SELECT
          e.*,
          p.title AS property_title,
          p.image AS property_image,
          p.location AS property_location

        FROM property_enquiries e

        JOIN properties p
          ON p.id = e.property_id

        WHERE p.owner_id = $1

        ORDER BY e.created_at DESC
        `,
        [req.user.id]
      );

      res.json({
        success: true,
        enquiries: result.rows,
      });
    } catch (error) {
      console.error(
        "Get seller property enquiries error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to fetch property enquiries",
      });
    }
  }
);

/* ============================================================
   GET SINGLE PROPERTY ENQUIRY
============================================================ */

router.get(
  "/:id",
  authenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;

      const access =
        await getPropertyEnquiryAccess(
          id,
          req.user.id
        );

      if (!access.enquiry) {
        return res.status(404).json({
          success: false,
          message: "Enquiry not found",
        });
      }

      if (!access.allowed) {
        return res.status(403).json({
          success: false,
          message: "Forbidden",
        });
      }

      res.json({
        success: true,
        enquiry: access.enquiry,
      });
    } catch (error) {
      console.error(
        "Get property enquiry error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to fetch enquiry",
      });
    }
  }
);

/* ============================================================
   PROPERTY ENQUIRY STATUS
   SELLER / DEVELOPER OWNER ONLY
============================================================ */

router.put(
  "/:id/status",
  authenticateToken,
  authorizeRoles("Seller", "Developer"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (
        !["new", "contacted", "resolved"].includes(
          status
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid enquiry status",
        });
      }

      const access =
        await getPropertyEnquiryAccess(
          id,
          req.user.id
        );

      if (!access.enquiry) {
        return res.status(404).json({
          success: false,
          message: "Enquiry not found",
        });
      }

      if (
        Number(access.enquiry.owner_id) !==
        Number(req.user.id)
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You are not authorized to update this enquiry",
        });
      }

      const result = await pool.query(
        `
        UPDATE property_enquiries
        SET
          status = $1,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
        `,
        [status, id]
      );

      const updatedEnquiry =
        result.rows[0];

      /* ======================================================
         NOTIFY BUYER
      ====================================================== */

      await createNotification({
        userId: updatedEnquiry.buyer_id,
        type: "property_enquiry_status",
        title: "Enquiry Status Updated",
        message: `Your enquiry about ${access.enquiry.property_title} is now ${status}.`,
        referenceId: id,
        referenceType: "property_enquiry",
      });

      res.json({
        success: true,
        message:
          "Enquiry status updated",
        enquiry: updatedEnquiry,
      });
    } catch (error) {
      console.error(
        "Update property enquiry status error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to update enquiry status",
      });
    }
  }
);

/* ============================================================
   GET PROPERTY ENQUIRY MESSAGES
============================================================ */

router.get(
  "/:id/messages",
  authenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;

      const access =
        await getPropertyEnquiryAccess(
          id,
          req.user.id
        );

      if (!access.enquiry) {
        return res.status(404).json({
          success: false,
          message: "Enquiry not found",
        });
      }

      if (!access.allowed) {
        return res.status(403).json({
          success: false,
          message:
            "You are not authorized to view these messages",
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

        JOIN users u
          ON u.id = em.sender_id

        WHERE em.enquiry_id = $1

        ORDER BY em.created_at ASC
        `,
        [id]
      );

      res.json({
        success: true,
        messages: result.rows,
      });
    } catch (error) {
      console.error(
        "Get property enquiry messages error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to fetch enquiry messages",
      });
    }
  }
);

/* ============================================================
   SEND PROPERTY ENQUIRY MESSAGE
============================================================ */

router.post(
  "/:id/messages",
  authenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { message } = req.body;

      if (!message || !message.trim()) {
        return res.status(400).json({
          success: false,
          message: "Message is required",
        });
      }

      const access =
        await getPropertyEnquiryAccess(
          id,
          req.user.id
        );

      if (!access.enquiry) {
        return res.status(404).json({
          success: false,
          message: "Enquiry not found",
        });
      }

      if (!access.allowed) {
        return res.status(403).json({
          success: false,
          message:
            "You are not authorized to send messages",
        });
      }

      const messageResult =
        await pool.query(
          `
          INSERT INTO enquiry_messages (
            enquiry_id,
            sender_id,
            message
          )
          VALUES ($1, $2, $3)
          RETURNING *
          `,
          [
            id,
            req.user.id,
            message.trim(),
          ]
        );

      const newMessage =
        messageResult.rows[0];

      /* ======================================================
         FIND OTHER PARTICIPANT
      ====================================================== */

      const recipientId =
        Number(access.enquiry.buyer_id) ===
        Number(req.user.id)
          ? access.enquiry.owner_id
          : access.enquiry.buyer_id;

      /* ======================================================
         NOTIFY OTHER PARTICIPANT
      ====================================================== */

      await createNotification({
        userId: recipientId,
        type: "property_chat",
        title: "New Enquiry Message",
        message: `You received a new message about ${access.enquiry.property_title}.`,
        referenceId: id,
        referenceType: "property_enquiry",
      });

      res.status(201).json({
        success: true,
        message: newMessage,
      });
    } catch (error) {
      console.error(
        "Send property enquiry message error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to send enquiry message",
      });
    }
  }
);

/* ============================================================
   CREATE PROJECT ENQUIRY
   BUYER ONLY
============================================================ */

router.post(
  "/project",
  authenticateToken,
  authorizeRoles("Buyer"),
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
        !name ||
        !email ||
        !message
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Project, name, email and message are required",
        });
      }

      const projectResult =
        await pool.query(
          `
          SELECT
            id,
            developer_id,
            name
          FROM projects
          WHERE id = $1
            AND status = 'approved'
          `,
          [project_id]
        );

      if (projectResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Project not found",
        });
      }

      const project =
        projectResult.rows[0];

      const result = await pool.query(
        `
        INSERT INTO project_enquiries (
          project_id,
          buyer_id,
          name,
          email,
          phone,
          message
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
        `,
        [
          project_id,
          req.user.id,
          name.trim(),
          email.trim(),
          phone?.trim() || null,
          message.trim(),
        ]
      );

      const enquiry = result.rows[0];

      /* ======================================================
         NOTIFY DEVELOPER
      ====================================================== */

      await createNotification({
        userId: project.developer_id,
        type: "project_enquiry",
        title: "New Project Enquiry",
        message: `${name.trim()} sent an enquiry about ${project.name}.`,
        referenceId: enquiry.id,
        referenceType: "project_enquiry",
      });

      res.status(201).json({
        success: true,
        message:
          "Project enquiry submitted successfully",
        enquiry,
      });
    } catch (error) {
      console.error(
        "Create project enquiry error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to create project enquiry",
      });
    }
  }
);

/* ============================================================
   GET BUYER PROJECT ENQUIRIES
============================================================ */

router.get(
  "/project/buyer",
  authenticateToken,
  authorizeRoles("Buyer"),
  async (req, res) => {
    try {
      const result = await pool.query(
        `
        SELECT
          pe.*,

          p.name AS project_name,
          p.image AS project_image,
          p.location AS project_location,
          p.city AS project_city

        FROM project_enquiries pe

        JOIN projects p
          ON p.id = pe.project_id

        WHERE pe.buyer_id = $1

        ORDER BY pe.created_at DESC
        `,
        [req.user.id]
      );

      res.json({
        success: true,
        enquiries: result.rows,
      });
    } catch (error) {
      console.error(
        "Get buyer project enquiries error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to fetch project enquiries",
      });
    }
  }
);

/* ============================================================
   GET DEVELOPER PROJECT ENQUIRIES
============================================================ */

router.get(
  "/project/developer",
  authenticateToken,
  authorizeRoles("Developer"),
  async (req, res) => {
    try {
      const result = await pool.query(
        `
        SELECT
          pe.*,

          p.name AS project_name,
          p.image AS project_image,
          p.location AS project_location,
          p.city AS project_city

        FROM project_enquiries pe

        JOIN projects p
          ON p.id = pe.project_id

        WHERE p.developer_id = $1

        ORDER BY pe.created_at DESC
        `,
        [req.user.id]
      );

      res.json({
        success: true,
        enquiries: result.rows,
      });
    } catch (error) {
      console.error(
        "Get developer project enquiries error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to fetch project enquiries",
      });
    }
  }
);

/* ============================================================
   GET PROJECT ENQUIRY MESSAGES
============================================================ */

router.get(
  "/project/:id/messages",
  authenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;

      const access =
        await getProjectEnquiryAccess(
          id,
          req.user.id
        );

      if (!access.enquiry) {
        return res.status(404).json({
          success: false,
          message: "Project enquiry not found",
        });
      }

      if (!access.allowed) {
        return res.status(403).json({
          success: false,
          message:
            "You are not authorized to view these messages",
        });
      }

      const result = await pool.query(
        `
        SELECT
          pem.id,
          pem.enquiry_id,
          pem.sender_id,
          pem.message,
          pem.created_at,

          u.name AS sender_name,
          u.role AS sender_role

        FROM project_enquiry_messages pem

        JOIN users u
          ON u.id = pem.sender_id

        WHERE pem.enquiry_id = $1

        ORDER BY pem.created_at ASC
        `,
        [id]
      );

      res.json({
        success: true,
        messages: result.rows,
      });
    } catch (error) {
      console.error(
        "Get project enquiry messages error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to fetch project enquiry messages",
      });
    }
  }
);

/* ============================================================
   SEND PROJECT ENQUIRY MESSAGE
============================================================ */

router.post(
  "/project/:id/messages",
  authenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { message } = req.body;

      if (!message || !message.trim()) {
        return res.status(400).json({
          success: false,
          message: "Message is required",
        });
      }

      const access =
        await getProjectEnquiryAccess(
          id,
          req.user.id
        );

      if (!access.enquiry) {
        return res.status(404).json({
          success: false,
          message: "Project enquiry not found",
        });
      }

      if (!access.allowed) {
        return res.status(403).json({
          success: false,
          message:
            "You are not authorized to send messages",
        });
      }

      const messageResult =
        await pool.query(
          `
          INSERT INTO project_enquiry_messages (
            enquiry_id,
            sender_id,
            message
          )
          VALUES ($1, $2, $3)
          RETURNING *
          `,
          [
            id,
            req.user.id,
            message.trim(),
          ]
        );

      const newMessage =
        messageResult.rows[0];

      /* ======================================================
         FIND OTHER PARTICIPANT
      ====================================================== */

      const recipientId =
        Number(access.enquiry.buyer_id) ===
        Number(req.user.id)
          ? access.enquiry.developer_id
          : access.enquiry.buyer_id;

      /* ======================================================
         NOTIFY OTHER PARTICIPANT
      ====================================================== */

      await createNotification({
        userId: recipientId,
        type: "project_chat",
        title: "New Project Message",
        message: `You received a new message about ${access.enquiry.project_name}.`,
        referenceId: id,
        referenceType: "project_enquiry",
      });

      res.status(201).json({
        success: true,
        message: newMessage,
      });
    } catch (error) {
      console.error(
        "Send project enquiry message error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to send project enquiry message",
      });
    }
  }
);

/* ============================================================
   UPDATE PROJECT ENQUIRY STATUS
   DEVELOPER ONLY
============================================================ */

router.put(
  "/project/:id/status",
  authenticateToken,
  authorizeRoles("Developer"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (
        !["new", "contacted", "resolved"].includes(
          status
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid enquiry status",
        });
      }

      const access =
        await getProjectEnquiryAccess(
          id,
          req.user.id
        );

      if (!access.enquiry) {
        return res.status(404).json({
          success: false,
          message: "Project enquiry not found",
        });
      }

      if (
        Number(access.enquiry.developer_id) !==
        Number(req.user.id)
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You are not authorized to update this enquiry",
        });
      }

      const result = await pool.query(
        `
        UPDATE project_enquiries
        SET
          status = $1,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
        `,
        [status, id]
      );

      const updatedEnquiry =
        result.rows[0];

      /* ======================================================
         NOTIFY BUYER
      ====================================================== */

      await createNotification({
        userId: updatedEnquiry.buyer_id,
        type: "project_enquiry_status",
        title: "Project Enquiry Status Updated",
        message: `Your enquiry about ${access.enquiry.project_name} is now ${status}.`,
        referenceId: id,
        referenceType: "project_enquiry",
      });

      res.json({
        success: true,
        message:
          "Project enquiry status updated",
        enquiry: updatedEnquiry,
      });
    } catch (error) {
      console.error(
        "Update project enquiry status error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to update project enquiry status",
      });
    }
  }
);

module.exports = router;