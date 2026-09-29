const express = require("express");
const router = express.Router();

const { pool } = require("../config/db");


// =====================================================
// SUBMIT CONTACT FORM
// =====================================================

router.post("/", async (req, res) => {
  try {
    const {
      name,
      email,
      subject,
      message,
    } = req.body;

    // Validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO contacts (
        name,
        email,
        subject,
        message
      )
      VALUES ($1, $2, $3, $4)
      RETURNING
        id,
        name,
        email,
        subject,
        message,
        status,
        created_at
      `,
      [
        name.trim(),
        email.trim(),
        subject,
        message.trim(),
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Your enquiry has been submitted successfully.",
      contact: result.rows[0],
    });

  } catch (error) {
    console.error(
      "Contact submission error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to submit your enquiry.",
    });
  }
});


module.exports = router;