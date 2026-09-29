const express = require("express");
const router = express.Router();

const { pool } = require("../config/db");
const { sendNotificationEmail } = require("../utils/sendEmail");

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

    const contact = result.rows[0];

    // =====================================================
    // SEND EMAIL TO ALL ADMINS
    // =====================================================

    const adminResult = await pool.query(
      `
      SELECT
        id,
        name,
        email
      FROM users
      WHERE LOWER(role) = 'admin'
      `
    );

    for (const admin of adminResult.rows) {
      try {
        await sendNotificationEmail({
          email: admin.email,
          name: admin.name,
          title: "New Contact Us Enquiry",
          message: `${contact.name} submitted a new ${contact.subject} enquiry.`,
          referenceId: contact.id,
          referenceType: "contact",
        });

        console.log(
          `Contact enquiry email sent to ${admin.email}`
        );
      } catch (emailError) {
        console.error(
          `Failed to send contact email to ${admin.email}:`,
          emailError.message
        );
      }
    }

    return res.status(201).json({
      success: true,
      message: "Your enquiry has been submitted successfully.",
      contact,
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