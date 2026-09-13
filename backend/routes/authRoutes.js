const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { pool } = require("../config/db");
const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");
const router = express.Router();

const signToken = (user) => jwt.sign(
  { id: user.id, email: user.email, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: "7d" }
);

router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;
    const allowedRoles = ["Buyer", "Seller", "Developer"];

    if (!name?.trim() || !email?.trim() || !password || !role) {
      return res.status(400).json({ success: false, message: "Name, email, password and role are required" });
    }
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }

    const existing = await pool.query("SELECT id FROM users WHERE LOWER(email)=LOWER($1)", [email.trim()]);
    if (existing.rows.length) {
      return res.status(409).json({ success: false, message: "An account with this email already exists" });
    }

    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (username,name,email,phone,password,role)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING id,username,name,email,phone,role,created_at`,
      [email.trim().toLowerCase(), name.trim(), email.trim().toLowerCase(), phone?.trim() || null, hash, role]
    );

    const user = result.rows[0];
    res.status(201).json({ success: true, message: "Registration successful", token: signToken(user), user });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ success: false, message: "Server error during registration" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: "Email and password are required" });

    const result = await pool.query(
      `SELECT id,username,name,email,phone,password,role,created_at FROM users WHERE LOWER(email)=LOWER($1)`,
      [email.trim()]
    );
    if (!result.rows.length) return res.status(401).json({ success: false, message: "Invalid email or password" });

    const user = result.rows[0];
    if (!(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }
    delete user.password;
    res.json({ success: true, message: "Login successful", token: signToken(user), user });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Server error during login" });
  }
});

router.get("/me", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id,username,name,email,phone,role,created_at FROM users WHERE id=$1`,
      [req.user.id]
    );
    if (!result.rows.length) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, user: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to load profile" });
  }
});

router.put("/me", authenticateToken, async (req, res) => {
  try {
    const { name, phone } = req.body;
    if (!name?.trim()) return res.status(400).json({ success: false, message: "Name is required" });
    const result = await pool.query(
      `UPDATE users SET name=$1, phone=$2 WHERE id=$3
       RETURNING id,username,name,email,phone,role,created_at`,
      [name.trim(), phone?.trim() || null, req.user.id]
    );
    res.json({ success: true, message: "Profile updated", user: result.rows[0] });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ success: false, message: "Failed to update profile" });
  }
});

module.exports = router;
