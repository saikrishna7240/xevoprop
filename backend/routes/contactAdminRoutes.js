const express = require("express");
const router = express.Router();

const { pool } = require("../config/db");
const {
  authenticateToken,
} = require("../middleware/authMiddleware");
// =====================================================
// ADMIN - GET ALL CONTACT ENQUIRIES
// =====================================================

router.get("/", authenticateToken, async (req, res) => {
  try {
    // Only admins can access contact enquiries
    const role = String(
      req.user?.role ||
      req.user?.userRole ||
      req.user?.user_role ||
      ""
    ).toLowerCase();

    if (role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required.",
      });
    }

    const result = await pool.query(`
      SELECT
        id,
        name,
        email,
        subject,
        message,
        status,
        created_at
      FROM contacts
      ORDER BY created_at DESC
    `);

    return res.json({
      success: true,
      contacts: result.rows,
    });

  } catch (error) {
    console.error(
      "Admin contact enquiries error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch contact enquiries.",
    });
  }
});

// =====================================================
// ADMIN - UPDATE CONTACT ENQUIRY STATUS
// =====================================================

router.put("/:id/status", authenticateToken, async (req, res) => {
  try {
    const role = String(
      req.user?.role ||
        req.user?.userRole ||
        req.user?.user_role ||
        ""
    ).toLowerCase();

    if (role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required.",
      });
    }

    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "new",
      "read",
      "resolved",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid contact status.",
      });
    }

    const result = await pool.query(
      `
      UPDATE contacts
      SET status = $1
      WHERE id = $2
      RETURNING
        id,
        name,
        email,
        subject,
        message,
        status,
        created_at
      `,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Contact enquiry not found.",
      });
    }

    return res.json({
      success: true,
      message: "Contact enquiry status updated.",
      contact: result.rows[0],
    });

  } catch (error) {
    console.error(
      "Update contact status error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update contact status.",
    });
  }
});

module.exports = router;