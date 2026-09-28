const express = require("express");

const { pool } = require("../config/db");

const router = express.Router();

/* =========================================================
   SUBSCRIBE TO NEWSLETTER
========================================================= */

router.post("/subscribe", async (req, res) => {
  try {
    const email = String(req.body?.email || "")
      .trim()
      .toLowerCase();

    /* VALIDATE EMAIL */

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email address is required.",
      });
    }

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    /* CHECK EXISTING SUBSCRIBER */

    const existingResult = await pool.query(
      `
      SELECT id
      FROM newsletter_subscribers
      WHERE email = $1
      LIMIT 1
      `,
      [email]
    );

    if (existingResult.rows.length > 0) {
      return res.status(200).json({
        success: true,
        alreadySubscribed: true,
        message:
          "This email is already subscribed.",
      });
    }

    /* INSERT SUBSCRIBER */

    const result = await pool.query(
      `
      INSERT INTO newsletter_subscribers (
        email
      )
      VALUES ($1)
      RETURNING
        id,
        email,
        subscribed_at
      `,
      [email]
    );

    return res.status(201).json({
      success: true,
      alreadySubscribed: false,
      message:
        "You're subscribed! We'll keep you updated.",
      subscriber: result.rows[0],
    });
  } catch (error) {
    console.error(
      "Newsletter subscription error:",
      error
    );

    /* HANDLE UNIQUE EMAIL RACE CONDITION */

    if (error.code === "23505") {
      return res.status(200).json({
        success: true,
        alreadySubscribed: true,
        message:
          "This email is already subscribed.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Unable to subscribe right now. Please try again.",
    });
  }
});

module.exports = router;