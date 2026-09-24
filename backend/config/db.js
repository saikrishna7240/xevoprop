const { Pool } = require("pg");

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not configured.");
}

const isRenderDatabase =
  databaseUrl.includes("render.com");

const pool = new Pool({
  connectionString: databaseUrl,

  ssl:
    process.env.NODE_ENV === "production" ||
    isRenderDatabase
      ? { rejectUnauthorized: false }
      : false,

  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  query_timeout: 15000,
});

pool.on("connect", () => {
  console.log("PostgreSQL connected");
});

pool.on("error", (error) => {
  console.error(
    "PostgreSQL pool error:",
    error.message
  );
});

/* ============================================================
   DATABASE INITIALIZATION
============================================================ */

const initializeDatabase = async () => {
  try {
    /* ========================================================
       TEST DATABASE CONNECTION
    ======================================================== */

    await pool.query("SELECT 1");

    /* ========================================================
       USERS
    ======================================================== */

    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255),
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(30),
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL
          CHECK (role IN ('Buyer', 'Seller', 'Developer')),
        is_verified BOOLEAN NOT NULL DEFAULT FALSE,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    /* ========================================================
       USERS MIGRATIONS
    ======================================================== */

    await pool.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS username VARCHAR(255);
    `);

    await pool.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS is_verified BOOLEAN
      NOT NULL DEFAULT FALSE;
    `);

    await pool.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS is_active BOOLEAN
      NOT NULL DEFAULT TRUE;
    `);

    await pool.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP
      DEFAULT CURRENT_TIMESTAMP;
    `);

    /* ========================================================
       LOGIN OTP TABLE
    ======================================================== */

    await pool.query(`
      CREATE TABLE IF NOT EXISTS login_otps (
        id SERIAL PRIMARY KEY,

        user_id INTEGER NOT NULL
          REFERENCES users(id)
          ON DELETE CASCADE,

        otp_hash VARCHAR(255) NOT NULL,

        expires_at TIMESTAMP NOT NULL,

        attempts INTEGER NOT NULL DEFAULT 0,

        used BOOLEAN NOT NULL DEFAULT FALSE,

        purpose VARCHAR(30) NOT NULL DEFAULT 'login'
          CHECK (purpose IN ('login', 'register')),

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    /* ========================================================
       OTP MIGRATIONS
    ======================================================== */

    await pool.query(`
      ALTER TABLE login_otps
      ADD COLUMN IF NOT EXISTS purpose VARCHAR(30)
      DEFAULT 'login';
    `);

    await pool.query(`
      ALTER TABLE login_otps
      ADD COLUMN IF NOT EXISTS attempts INTEGER
      NOT NULL DEFAULT 0;
    `);

    await pool.query(`
      ALTER TABLE login_otps
      ADD COLUMN IF NOT EXISTS used BOOLEAN
      NOT NULL DEFAULT FALSE;
    `);

    await pool.query(`
      ALTER TABLE login_otps
      ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP;
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_login_otps_user_purpose
      ON login_otps(user_id, purpose);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_login_otps_created_at
      ON login_otps(created_at);
    `);

    /* ========================================================
       PROPERTIES
    ======================================================== */

    await pool.query(`
      CREATE TABLE IF NOT EXISTS properties (
        id SERIAL PRIMARY KEY,
        owner_id INTEGER
          REFERENCES users(id)
          ON DELETE SET NULL,

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

        status VARCHAR(30) DEFAULT 'pending',

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    /* ========================================================
       PROPERTY IMAGES
    ======================================================== */

    await pool.query(`
      CREATE TABLE IF NOT EXISTS property_images (
        id SERIAL PRIMARY KEY,

        property_id INTEGER NOT NULL
          REFERENCES properties(id)
          ON DELETE CASCADE,

        image_url TEXT NOT NULL,

        media_type VARCHAR(20)
          NOT NULL DEFAULT 'image',

        sort_order INTEGER DEFAULT 0,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      ALTER TABLE property_images
      ADD COLUMN IF NOT EXISTS media_type VARCHAR(20)
      DEFAULT 'image';
    `);

    /* ========================================================
       PROPERTY VISITS
    ======================================================== */

    await pool.query(`
      CREATE TABLE IF NOT EXISTS property_visits (
        id SERIAL PRIMARY KEY,

        property_id INTEGER NOT NULL
          REFERENCES properties(id)
          ON DELETE CASCADE,

        buyer_id INTEGER
          REFERENCES users(id)
          ON DELETE SET NULL,

        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(30),

        visit_date DATE NOT NULL,
        visit_time TIME NOT NULL,

        message TEXT,

        status VARCHAR(30)
          DEFAULT 'pending',

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    /* ========================================================
       PROPERTY ENQUIRIES
    ======================================================== */

    await pool.query(`
      CREATE TABLE IF NOT EXISTS property_enquiries (
        id SERIAL PRIMARY KEY,

        property_id INTEGER NOT NULL
          REFERENCES properties(id)
          ON DELETE CASCADE,

        buyer_id INTEGER
          REFERENCES users(id)
          ON DELETE SET NULL,

        name VARCHAR(150) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(30),

        message TEXT,

        status VARCHAR(30)
          DEFAULT 'new',

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        updated_at TIMESTAMP
          DEFAULT CURRENT_TIMESTAMP
      );
    `);

    /* ========================================================
       ENQUIRY MESSAGES
    ======================================================== */

    await pool.query(`
      CREATE TABLE IF NOT EXISTS enquiry_messages (
        id SERIAL PRIMARY KEY,

        enquiry_id INTEGER NOT NULL
          REFERENCES property_enquiries(id)
          ON DELETE CASCADE,

        sender_id INTEGER
          REFERENCES users(id)
          ON DELETE SET NULL,

        message TEXT NOT NULL,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    /* ========================================================
       FAVORITES
    ======================================================== */

    await pool.query(`
      CREATE TABLE IF NOT EXISTS favorites (
        id SERIAL PRIMARY KEY,

        user_id INTEGER NOT NULL
          REFERENCES users(id)
          ON DELETE CASCADE,

        property_id INTEGER NOT NULL
          REFERENCES properties(id)
          ON DELETE CASCADE,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        UNIQUE(user_id, property_id)
      );
    `);

    /* ========================================================
       PROJECTS
    ======================================================== */

    await pool.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,

        developer_id INTEGER NOT NULL
          REFERENCES users(id)
          ON DELETE CASCADE,

        name VARCHAR(255) NOT NULL,
        type VARCHAR(100) NOT NULL,
        location VARCHAR(255) NOT NULL,
        city VARCHAR(100) NOT NULL,

        state VARCHAR(100),

        units INTEGER DEFAULT 0,
        price VARCHAR(100),

        image TEXT,
        description TEXT,

        status VARCHAR(30)
          DEFAULT 'draft',

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    /* ========================================================
       PROJECT MEDIA
    ======================================================== */

    await pool.query(`
      CREATE TABLE IF NOT EXISTS project_media (
        id SERIAL PRIMARY KEY,

        project_id INTEGER NOT NULL
          REFERENCES projects(id)
          ON DELETE CASCADE,

        media_url TEXT NOT NULL,

        media_type VARCHAR(20)
          NOT NULL DEFAULT 'image',

        sort_order INTEGER NOT NULL DEFAULT 0,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    /* ========================================================
       PROJECT AGREEMENTS
    ======================================================== */

    await pool.query(`
      CREATE TABLE IF NOT EXISTS project_agreements (
        id SERIAL PRIMARY KEY,

        project_id INTEGER NOT NULL
          REFERENCES projects(id)
          ON DELETE CASCADE,

        developer_id INTEGER NOT NULL
          REFERENCES users(id)
          ON DELETE CASCADE,

        agreement_version VARCHAR(50)
          NOT NULL DEFAULT '1.0',

        signed_agreement_url TEXT NOT NULL,

        accepted BOOLEAN NOT NULL DEFAULT FALSE,

        information_confirmed BOOLEAN
          NOT NULL DEFAULT FALSE,

        authorization_confirmed BOOLEAN
          NOT NULL DEFAULT FALSE,

        accepted_at TIMESTAMP
          NOT NULL DEFAULT CURRENT_TIMESTAMP,

        ip_address TEXT,

        created_at TIMESTAMP
          DEFAULT CURRENT_TIMESTAMP
      );
    `);

    /* ========================================================
       PROJECT ENQUIRIES
    ======================================================== */

    await pool.query(`
      CREATE TABLE IF NOT EXISTS project_enquiries (
        id SERIAL PRIMARY KEY,

        project_id INTEGER NOT NULL
          REFERENCES projects(id)
          ON DELETE CASCADE,

        buyer_id INTEGER
          REFERENCES users(id)
          ON DELETE SET NULL,

        name VARCHAR(150) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(30),

        message TEXT,

        status VARCHAR(30)
          DEFAULT 'new',

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        updated_at TIMESTAMP
          DEFAULT CURRENT_TIMESTAMP
      );
    `);

    /* ========================================================
       PROJECT ENQUIRY MESSAGES
    ======================================================== */

    await pool.query(`
      CREATE TABLE IF NOT EXISTS project_enquiry_messages (
        id SERIAL PRIMARY KEY,

        enquiry_id INTEGER NOT NULL
          REFERENCES project_enquiries(id)
          ON DELETE CASCADE,

        sender_id INTEGER
          REFERENCES users(id)
          ON DELETE SET NULL,

        message TEXT NOT NULL,

        created_at TIMESTAMP
          DEFAULT CURRENT_TIMESTAMP
      );
    `);

    /* ========================================================
       NOTIFICATIONS
    ======================================================== */

    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,

        user_id INTEGER NOT NULL
          REFERENCES users(id)
          ON DELETE CASCADE,

        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,

        reference_id INTEGER,
        reference_type VARCHAR(50),

        is_read BOOLEAN NOT NULL DEFAULT FALSE,

        read_at TIMESTAMP,

        created_at TIMESTAMP
          DEFAULT CURRENT_TIMESTAMP
      );
    `);

    /* ========================================================
       NOTIFICATION MIGRATIONS
    ======================================================== */

    await pool.query(`
      ALTER TABLE notifications
      ADD COLUMN IF NOT EXISTS reference_type VARCHAR(50);
    `);

    await pool.query(`
      ALTER TABLE notifications
      ADD COLUMN IF NOT EXISTS is_read BOOLEAN
      NOT NULL DEFAULT FALSE;
    `);

    /* ========================================================
       PROPERTY ENQUIRY MIGRATION
    ======================================================== */

    await pool.query(`
      DO $$
      BEGIN

        IF EXISTS (
          SELECT 1
          FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_name = 'enquiries'
        ) THEN

          INSERT INTO property_enquiries
          (
            property_id,
            buyer_id,
            name,
            email,
            phone,
            message,
            status,
            created_at
          )

          SELECT
            e.property_id,
            e.buyer_id,
            e.name,
            e.email,
            e.phone,
            e.message,

            CASE
              WHEN e.status IN
                ('new', 'contacted', 'resolved')
              THEN e.status
              ELSE 'new'
            END,

            e.created_at

          FROM enquiries e

          WHERE NOT EXISTS (
            SELECT 1
            FROM property_enquiries pe
            WHERE pe.property_id = e.property_id
              AND COALESCE(pe.buyer_id, -1)
                  = COALESCE(e.buyer_id, -1)
              AND pe.created_at = e.created_at
          );

        END IF;

      END
      $$;
    `);

    console.log(
      "Database tables and migrations are ready"
    );

  } catch (error) {
    console.error(
      "Database initialization error:",
      error
    );

    throw error;
  }
};

module.exports = {
  pool,
  initializeDatabase,
};