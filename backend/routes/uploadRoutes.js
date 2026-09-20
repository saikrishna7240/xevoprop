const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;

const { pool } = require("../config/db");

const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();

/* =========================================================
   CLOUDINARY CONFIG
========================================================= */

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/* =========================================================
   MULTER CONFIG
========================================================= */

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 10 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

/* =========================================================
   TEST UPLOAD ROUTE
========================================================= */

router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Upload routes are working",
  });
});

/* =========================================================
   UPLOAD PROPERTY IMAGE
========================================================= */

router.post(
  "/property/:propertyId",

  authenticateToken,

  authorizeRoles("Seller"),

  upload.single("image"),

  async (req, res) => {
    try {
      const { propertyId } = req.params;

      console.log("================================");
      console.log("PROPERTY IMAGE UPLOAD REQUEST");
      console.log("Property ID:", propertyId);
      console.log("User:", req.user);
      console.log(
        "File:",
        req.file ? req.file.originalname : "NO FILE"
      );
      console.log("================================");

      /* -----------------------------------------------------
         CHECK FILE
      ----------------------------------------------------- */

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Please select an image.",
        });
      }

      /* -----------------------------------------------------
         CHECK PROPERTY OWNER
      ----------------------------------------------------- */

      const propertyResult = await pool.query(
        `
        SELECT id
        FROM properties
        WHERE id = $1
        AND owner_id = $2
        `,
        [propertyId, req.user.id]
      );

      if (propertyResult.rows.length === 0) {
        return res.status(403).json({
          success: false,
          message:
            "You are not the owner of this property.",
        });
      }

      /* -----------------------------------------------------
         UPLOAD TO CLOUDINARY
      ----------------------------------------------------- */

      const uploadResult = await new Promise(
        (resolve, reject) => {
          const stream =
            cloudinary.uploader.upload_stream(
              {
                folder: "xevoprop/properties",
                resource_type: "image",
              },
              (error, result) => {
                if (error) {
                  reject(error);
                } else {
                  resolve(result);
                }
              }
            );

          stream.end(req.file.buffer);
        }
      );

      console.log(
        "Property image uploaded:",
        uploadResult.secure_url
      );

      /* -----------------------------------------------------
         SAVE IMAGE URL TO PROPERTY
      ----------------------------------------------------- */

      const result = await pool.query(
        `
        UPDATE properties
        SET
          image = $1,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        AND owner_id = $3
        RETURNING id, image
        `,
        [
          uploadResult.secure_url,
          propertyId,
          req.user.id,
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Property not found.",
        });
      }

      return res.status(201).json({
        success: true,
        message:
          "Property image uploaded successfully.",
        image: result.rows[0].image,
        property: result.rows[0],
      });
    } catch (error) {
      console.error(
        "PROPERTY IMAGE UPLOAD ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to upload property image.",
      });
    }
  }
);

/* =========================================================
   UPLOAD PROJECT IMAGE
========================================================= */

router.post(
  "/project/:projectId",

  authenticateToken,

  authorizeRoles("Developer"),

  upload.single("image"),

  async (req, res) => {
    try {
      const { projectId } = req.params;

      console.log("================================");
      console.log("PROJECT IMAGE UPLOAD REQUEST");
      console.log("Project ID:", projectId);
      console.log("User:", req.user);
      console.log(
        "File:",
        req.file ? req.file.originalname : "NO FILE"
      );
      console.log("================================");

      /* -----------------------------------------------------
         CHECK FILE
      ----------------------------------------------------- */

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Please select an image.",
        });
      }

      /* -----------------------------------------------------
         CHECK PROJECT OWNER
      ----------------------------------------------------- */

      const projectResult = await pool.query(
        `
        SELECT id
        FROM projects
        WHERE id = $1
        AND developer_id = $2
        `,
        [projectId, req.user.id]
      );

      if (projectResult.rows.length === 0) {
        return res.status(403).json({
          success: false,
          message:
            "You are not the owner of this project.",
        });
      }

      /* -----------------------------------------------------
         UPLOAD TO CLOUDINARY
      ----------------------------------------------------- */

      const uploadResult = await new Promise(
        (resolve, reject) => {
          const stream =
            cloudinary.uploader.upload_stream(
              {
                folder: "xevoprop/projects",
                resource_type: "image",
              },
              (error, result) => {
                if (error) {
                  reject(error);
                } else {
                  resolve(result);
                }
              }
            );

          stream.end(req.file.buffer);
        }
      );

      console.log(
        "Project image uploaded:",
        uploadResult.secure_url
      );

      /* -----------------------------------------------------
         SAVE IMAGE URL TO PROJECT
      ----------------------------------------------------- */

      const result = await pool.query(
        `
        UPDATE projects
        SET
          image = $1,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        AND developer_id = $3
        RETURNING id, image
        `,
        [
          uploadResult.secure_url,
          projectId,
          req.user.id,
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Project not found.",
        });
      }

      return res.status(201).json({
        success: true,
        message:
          "Project image uploaded successfully.",
        image: result.rows[0].image,
        project: result.rows[0],
      });
    } catch (error) {
      console.error(
        "PROJECT IMAGE UPLOAD ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to upload project image.",
      });
    }
  }
);

/* =========================================================
   DELETE PROPERTY IMAGE
========================================================= */

router.delete(
  "/property/:propertyId/image/:imageId",

  authenticateToken,

  authorizeRoles(
    "Seller",
    "Developer"
  ),

  async (req, res) => {
    try {
      const {
        propertyId,
        imageId,
      } = req.params;

      /* -----------------------------------------------------
         DELETE IMAGE
      ----------------------------------------------------- */

      const result = await pool.query(
        `
        DELETE FROM property_images
        WHERE id = $1
        AND property_id = $2
        AND property_id IN (
          SELECT id
          FROM properties
          WHERE id = $2
          AND owner_id = $3
        )
        RETURNING *
        `,
        [
          imageId,
          propertyId,
          req.user.id,
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message:
            "Image not found or you are not the owner",
        });
      }

      /* -----------------------------------------------------
         GET NEXT PRIMARY IMAGE
      ----------------------------------------------------- */

      const firstImage = await pool.query(
        `
        SELECT image_url
        FROM property_images
        WHERE property_id = $1
        ORDER BY sort_order ASC, id ASC
        LIMIT 1
        `,
        [propertyId]
      );

      /* -----------------------------------------------------
         UPDATE PROPERTY PRIMARY IMAGE
      ----------------------------------------------------- */

      await pool.query(
        `
        UPDATE properties
        SET image = $1
        WHERE id = $2
        `,
        [
          firstImage.rows.length > 0
            ? firstImage.rows[0].image_url
            : null,
          propertyId,
        ]
      );

      return res.json({
        success: true,
        message: "Image deleted successfully",
      });
    } catch (error) {
      console.error(
        "DELETE IMAGE ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to delete image",
      });
    }
  }
);

/* =========================================================
   SET PRIMARY PROPERTY IMAGE
========================================================= */

router.put(
  "/property/:propertyId/image/:imageId/primary",

  authenticateToken,

  authorizeRoles(
    "Seller",
    "Developer"
  ),

  async (req, res) => {
    try {
      const {
        propertyId,
        imageId,
      } = req.params;

      /* -----------------------------------------------------
         CHECK PROPERTY OWNERSHIP
      ----------------------------------------------------- */

      const ownerResult = await pool.query(
        `
        SELECT id
        FROM properties
        WHERE id = $1
        AND owner_id = $2
        `,
        [
          propertyId,
          req.user.id,
        ]
      );

      if (ownerResult.rows.length === 0) {
        return res.status(403).json({
          success: false,
          message:
            "You are not the owner of this property",
        });
      }

      /* -----------------------------------------------------
         GET SELECTED IMAGE
      ----------------------------------------------------- */

      const imageResult = await pool.query(
        `
        SELECT *
        FROM property_images
        WHERE id = $1
        AND property_id = $2
        `,
        [
          imageId,
          propertyId,
        ]
      );

      if (imageResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Image not found",
        });
      }

      const selectedImage =
        imageResult.rows[0];

      /* -----------------------------------------------------
         MOVE ALL SORT ORDERS
      ----------------------------------------------------- */

      await pool.query(
        `
        UPDATE property_images
        SET sort_order = sort_order + 1
        WHERE property_id = $1
        `,
        [propertyId]
      );

      /* -----------------------------------------------------
         MAKE SELECTED IMAGE PRIMARY
      ----------------------------------------------------- */

      await pool.query(
        `
        UPDATE property_images
        SET sort_order = 0
        WHERE id = $1
        `,
        [imageId]
      );

      /* -----------------------------------------------------
         UPDATE PROPERTY IMAGE
      ----------------------------------------------------- */

      await pool.query(
        `
        UPDATE properties
        SET image = $1
        WHERE id = $2
        `,
        [
          selectedImage.image_url,
          propertyId,
        ]
      );

      return res.json({
        success: true,
        message:
          "Primary image updated successfully",
      });
    } catch (error) {
      console.error(
        "SET PRIMARY ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to set primary image",
      });
    }
  }
);

/* =========================================================
   EXPORT ROUTER
========================================================= */

module.exports = router;