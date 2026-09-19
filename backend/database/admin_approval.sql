/* =========================================================
   XEVOPROP
   ADMIN APPROVAL & MODERATION SYSTEM
========================================================= */


/* =========================================================
   1. ADD ADMIN ROLE
========================================================= */

/*
   IMPORTANT:
   If your users.role column is VARCHAR/TEXT, this is enough
   to allow Admin users.

   We will create the actual admin account separately.
*/


/* =========================================================
   2. PROPERTY APPROVAL FIELDS
========================================================= */

ALTER TABLE properties
ADD COLUMN IF NOT EXISTS status VARCHAR(20)
DEFAULT 'pending';

ALTER TABLE properties
ADD COLUMN IF NOT EXISTS reviewed_by UUID;

ALTER TABLE properties
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP;

ALTER TABLE properties
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;


/* =========================================================
   3. PROJECT APPROVAL FIELDS
========================================================= */

ALTER TABLE projects
ADD COLUMN IF NOT EXISTS status VARCHAR(20)
DEFAULT 'pending';

ALTER TABLE projects
ADD COLUMN IF NOT EXISTS reviewed_by UUID;

ALTER TABLE projects
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP;

ALTER TABLE projects
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;


/* =========================================================
   4. NORMALIZE EXISTING DATA
========================================================= */

/*
   Existing properties/projects were already published
   before the approval system existed.

   We mark them as approved so they don't suddenly
   disappear from the public website.
*/

UPDATE properties
SET status = 'approved'
WHERE status IS NULL;

UPDATE projects
SET status = 'approved'
WHERE status IS NULL;


/* =========================================================
   5. STATUS CONSTRAINTS
========================================================= */

ALTER TABLE properties
DROP CONSTRAINT IF EXISTS properties_status_check;

ALTER TABLE properties
ADD CONSTRAINT properties_status_check
CHECK (
  status IN (
    'pending',
    'approved',
    'rejected'
  )
);


ALTER TABLE projects
DROP CONSTRAINT IF EXISTS projects_status_check;

ALTER TABLE projects
ADD CONSTRAINT projects_status_check
CHECK (
  status IN (
    'pending',
    'approved',
    'rejected'
  )
);


/* =========================================================
   6. INDEXES
========================================================= */

/*
   These indexes make admin pending-approval queries faster.
*/

CREATE INDEX IF NOT EXISTS idx_properties_status
ON properties(status);

CREATE INDEX IF NOT EXISTS idx_projects_status
ON projects(status);

CREATE INDEX IF NOT EXISTS idx_properties_reviewed_by
ON properties(reviewed_by);

CREATE INDEX IF NOT EXISTS idx_projects_reviewed_by
ON projects(reviewed_by);


/* =========================================================
   7. FOREIGN KEYS
========================================================= */

/*
   reviewed_by points to the admin who reviewed the item.
*/

ALTER TABLE properties
DROP CONSTRAINT IF EXISTS properties_reviewed_by_fkey;

ALTER TABLE properties
ADD CONSTRAINT properties_reviewed_by_fkey
FOREIGN KEY (reviewed_by)
REFERENCES users(id)
ON DELETE SET NULL;


ALTER TABLE projects
DROP CONSTRAINT IF EXISTS projects_reviewed_by_fkey;

ALTER TABLE projects
ADD CONSTRAINT projects_reviewed_by_fkey
FOREIGN KEY (reviewed_by)
REFERENCES users(id)
ON DELETE SET NULL;


/* =========================================================
   8. VERIFY
========================================================= */

SELECT
  id,
  status,
  reviewed_by,
  reviewed_at,
  rejection_reason
FROM properties
LIMIT 5;


SELECT
  id,
  status,
  reviewed_by,
  reviewed_at,
  rejection_reason
FROM projects
LIMIT 5;