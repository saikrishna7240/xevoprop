const { pool } = require("../config/db");

const notifyAdmin = async ({
  type,
  title,
  message,
  referenceId,
  referenceType,
}) => {
  try {
    const adminResult = await pool.query(
      `
      SELECT id
      FROM users
      WHERE LOWER(role) = 'admin'
      `,
    );

    if (adminResult.rows.length === 0) {
      console.log("No admin users found for notification.");
      return;
    }

    for (const admin of adminResult.rows) {
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
    }

    console.log(
      `Admin notification created for ${adminResult.rows.length} admin(s).`
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