const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Authentication token required",
      });
    }

    const parts = authHeader.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({
        success: false,
        message: "Invalid authorization format",
      });
    }

    const token = parts[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = decoded;

    next();
  } catch (error) {
    console.error("AUTH ERROR:", error);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};


// Role-based authorization
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      const userRole =
        req.user.role ||
        req.user.userRole ||
        req.user.user_role;

      if (!userRole) {
        return res.status(403).json({
          success: false,
          message: "User role not found",
        });
      }

      const normalizedUserRole =
        String(userRole).trim().toLowerCase();

      const hasPermission = allowedRoles.some(
        (role) =>
          normalizedUserRole ===
          String(role).trim().toLowerCase()
      );

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: "Access denied. Developer role required.",
        });
      }

      next();
    } catch (error) {
      console.error("ROLE AUTH ERROR:", error);

      return res.status(500).json({
        success: false,
        message: "Authorization error",
      });
    }
  };
};


module.exports = {
  authenticateToken,
  authorizeRoles,
};