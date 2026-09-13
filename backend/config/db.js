const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" || process.env.DATABASE_URL?.includes("render.com")
    ? { rejectUnauthorized: false }
    : false,
});

pool.on("connect", () => console.log("PostgreSQL connected"));
pool.on("error", (error) => console.error("PostgreSQL error:", error.message));

const initializeDatabase = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255),
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20),
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL CHECK (role IN ('Buyer','Seller','Developer')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS properties (
        id SERIAL PRIMARY KEY,
        owner_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        title VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        location VARCHAR(255) NOT NULL,
        city VARCHAR(100),
        price VARCHAR(100),
        price_value NUMERIC,
        bedrooms INTEGER,
        bathrooms INTEGER,
        area NUMERIC,
        image TEXT,
        description TEXT,
        verified BOOLEAN DEFAULT FALSE,
        ready_to_move BOOLEAN DEFAULT FALSE,
        zero_brokerage BOOLEAN DEFAULT FALSE,
        status VARCHAR(30) DEFAULT 'published',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS property_images (
        id SERIAL PRIMARY KEY,
        property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
        image_url TEXT NOT NULL,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS property_visits (
        id SERIAL PRIMARY KEY,
        property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
        buyer_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        visit_date DATE NOT NULL,
        visit_time TIME NOT NULL,
        message TEXT,
        status VARCHAR(30) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Canonical enquiry table. The older `enquiries` table is migrated below and no longer used by the API.
    await pool.query(`
      CREATE TABLE IF NOT EXISTS property_enquiries (
        id SERIAL PRIMARY KEY,
        property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
        buyer_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        name VARCHAR(150) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(30),
        message TEXT,
        status VARCHAR(30) DEFAULT 'new',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS enquiry_messages (
        id SERIAL PRIMARY KEY,
        enquiry_id INTEGER NOT NULL REFERENCES property_enquiries(id) ON DELETE CASCADE,
        sender_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS favorites (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, property_id)
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        developer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(100) NOT NULL,
        location VARCHAR(255) NOT NULL,
        city VARCHAR(100) NOT NULL,
        units INTEGER DEFAULT 0,
        price VARCHAR(100),
        image TEXT,
        description TEXT,
        status VARCHAR(30) DEFAULT 'draft',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        reference_id INTEGER,
        read_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Safe migration from the old enquiry table if it exists from an earlier version.
    await pool.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'enquiries') THEN
          INSERT INTO property_enquiries (property_id, buyer_id, name, email, phone, message, status, created_at)
          SELECT e.property_id, e.buyer_id, e.name, e.email, e.phone, e.message,
                 CASE WHEN e.status IN ('new','contacted','resolved') THEN e.status ELSE 'new' END,
                 e.created_at
          FROM enquiries e
          WHERE NOT EXISTS (
            SELECT 1 FROM property_enquiries pe
            WHERE pe.property_id = e.property_id
              AND COALESCE(pe.buyer_id, -1) = COALESCE(e.buyer_id, -1)
              AND pe.created_at = e.created_at
          );
        END IF;
      END $$;
    `);

    console.log("Database tables and migrations are ready");
  } catch (error) {
    console.error("Database initialization error:", error.message);
    throw error;
  }
};

module.exports = { pool, initializeDatabase };
