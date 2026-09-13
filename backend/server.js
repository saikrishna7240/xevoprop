const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { pool, initializeDatabase } = require("./config/db");

const { authenticateToken, authorizeRoles } = require("./middleware/authMiddleware");

const propertyRoutes = require("./routes/propertyRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const visitRoutes = require("./routes/visitRoutes");
const enquiryRoutes = require("./routes/enquiryRoutes");
const authRoutes = require("./routes/authRoutes");
const favoriteRoutes = require("./routes/favoriteRoutes");
const userRoutes = require("./routes/userRoutes");
const projectRoutes = require("./routes/projectRoutes");
const searchRoutes = require("./routes/searchRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();

const PORT = process.env.PORT || 5000;

// ======================================================
// CORS
// ======================================================

const allowedOrigins = [
  "http://localhost:5173",
  "https://xevoprop.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an origin
      // such as Postman/server-to-server requests
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("Blocked CORS origin:", origin);
      return callback(new Error("CORS blocked"));
    },

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],

    credentials: true,
  })
);

// ======================================================
// BODY PARSER
// ======================================================

app.use(
  express.json({
    limit: "2mb",
  })
);

// ======================================================
// BASIC ROUTES
// ======================================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Xevoprop API is running",
  });
});

app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");

    res.json({
      success: true,
      status: "healthy",
      database: "connected",
    });
  } catch (error) {
    console.error("Health check database error:", error);

    res.status(503).json({
      success: false,
      status: "unhealthy",
      database: "disconnected",
      message: error.message,
    });
  }
});

// ======================================================
// API ROUTES
// ======================================================

app.use("/api/auth", authRoutes);

app.use("/api/properties", propertyRoutes);

app.use("/api/upload", uploadRoutes);

app.use("/api/users", userRoutes);

app.use("/api/visits", visitRoutes);

app.use("/api/enquiries", enquiryRoutes);

app.use("/api/favorites", favoriteRoutes);

app.use("/api/projects", projectRoutes);

app.use("/api/search", searchRoutes);

app.use("/api/notifications", notificationRoutes);

// ======================================================
// DATABASE TEST ROUTES
// ======================================================

app.get("/api/users-table", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        column_name,
        data_type
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);

    res.json({
      success: true,
      columns: result.rows,
    });
  } catch (error) {
    console.error("Users table error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

app.get("/api/test-users", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        name,
        email,
        role
      FROM users
      ORDER BY id
    `);

    res.json({
      success: true,
      users: result.rows,
    });
  } catch (error) {
    console.error("Test users error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
});

// ======================================================
// AUTHENTICATION TEST
// ======================================================

app.get(
  "/api/protected",
  authenticateToken,
  (req, res) => {
    res.json({
      success: true,
      message: "Protected route",
      user: req.user,
    });
  }
);

app.get(
  "/api/buyer-test",
  authenticateToken,
  authorizeRoles("Buyer"),
  (req, res) => {
    res.json({
      success: true,
      message: "Buyer access granted",
      user: req.user,
    });
  }
);

// ======================================================
// ERROR HANDLER
// ======================================================

app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err);

  // CORS error
  if (err.message === "CORS blocked") {
    return res.status(403).json({
      success: false,
      message: "CORS blocked",
      origin: req.headers.origin || null,
    });
  }

  res.status(500).json({
    success: false,
    message: err.message || "Server error",
  });
});

// ======================================================
// 404 HANDLER
// ======================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
    path: req.originalUrl,
  });
});

// ======================================================
// START SERVER
// ======================================================

const startServer = async () => {
  try {
    await initializeDatabase();

    app.listen(PORT, () => {
      console.log(`Xevoprop backend running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start Xevoprop backend:", error);
    process.exit(1);
  }
};

startServer();