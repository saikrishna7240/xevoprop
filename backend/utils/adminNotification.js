const { pool } = require("../config/db");
const {
  sendNotificationEmail,
} = require("./sendEmail");

const notifyAdmin = async ({
  type,
  title,
  message,
  referenceId,
  referenceType,
}) => {
  try {
    // Get all admin users
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

    if (adminResult.rows.length === 0) {
      console.log(
        "No admin users found for notification."
      );
      return;
    }

    for (const admin of adminResult.rows) {

      /* =====================================================
         1. CREATE IN-APP NOTIFICATION
      ===================================================== */

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
          admin.id,
          type,
          title,
          message,
          referenceId,
          referenceType,
        ]
      );

      console.log(
        `In-app notification created for admin ${admin.email}`
      );

      /* =====================================================
         2. SEND EMAIL NOTIFICATION
      ===================================================== */

      try {
        await sendNotificationEmail({
          email: admin.email,
          name: admin.name,
          title,
          message,
          referenceId,
          referenceType,
        });

        console.log(
          `Admin notification email sent to ${admin.email}`
        );

      } catch (emailError) {
        console.error(
          `Failed to send admin email to ${admin.email}:`,
          emailError.message
        );
      }
    }

    console.log(
      `Admin notifications processed for ${adminResult.rows.length} admin(s).`
    );

  } catch (error) {
    console.error(
      "Admin notification error:",
      error.message
    );
  }
};

module.exports = {
  notifyAdmin,
};