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
   PROJECT IMAGE UPLOAD
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
   PROPERTY MEDIA UPLOAD
   IMAGE + VIDEO
========================================================= */

const propertyMediaUpload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 100 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    if (
      file.mimetype.startsWith("image/") ||
      file.mimetype.startsWith("video/")
    ) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Only image and video files are allowed"
        )
      );
    }
  },
});

/* =========================================================
   PROJECT MEDIA UPLOAD
   IMAGE + VIDEO
========================================================= */

const projectMediaUpload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 100 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    if (
      file.mimetype.startsWith("image/") ||
      file.mimetype.startsWith("video/")
    ) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Only image and video files are allowed for project media."
        )
      );
    }
  },
});

/* =========================================================
   AGREEMENT UPLOAD
   PDF + DOC + DOCX
========================================================= */

const agreementUpload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 15 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Only PDF, DOC, and DOCX agreement files are allowed."
        )
      );
    }
  },
});

/* =========================================================
   UPLOAD SIGNED PROJECT AGREEMENT
========================================================= */

router.post(
  "/project/:projectId/agreement",
  authenticateToken,
  authorizeRoles("Developer"),
  agreementUpload.single("agreement"),

  async (req, res) => {
    try {
      const { projectId } = req.params;

      console.log("================================");
      console.log("SIGNED AGREEMENT UPLOAD");
      console.log("Project ID:", projectId);
      console.log("Developer ID:", req.user.id);
      console.log(
        "File:",
        req.file
          ? req.file.originalname
          : "NO FILE"
      );
      console.log("================================");

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message:
            "Please upload the digitally signed agreement.",
        });
      }

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

      const accepted =
        String(req.body.accepted) === "true";

      const informationConfirmed =
        String(
          req.body.information_confirmed
        ) === "true";

      const authorizationConfirmed =
        String(
          req.body.authorization_confirmed
        ) === "true";

      const agreementVersion =
        req.body.agreement_version || "1.0";

      if (
        !accepted ||
        !informationConfirmed ||
        !authorizationConfirmed
      ) {
        return res.status(400).json({
          success: false,
          message:
            "All agreement confirmations are required.",
        });
      }

      const uploadResult = await new Promise(
        (resolve, reject) => {
          const stream =
            cloudinary.uploader.upload_stream(
              {
                folder:
                  "xevoprop/project-agreements",

                resource_type: "raw",
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
        "Signed agreement uploaded:",
        uploadResult.secure_url
      );

      const agreementResult =
        await pool.query(
          `
          INSERT INTO project_agreements
          (
            project_id,
            developer_id,
            agreement_version,
            signed_agreement_url,
            accepted,
            information_confirmed,
            authorization_confirmed,
            accepted_at,
            ip_address
          )
          VALUES
          (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7,
            CURRENT_TIMESTAMP,
            $8
          )
          RETURNING *
          `,
          [
            projectId,
            req.user.id,
            agreementVersion,
            uploadResult.secure_url,
            accepted,
            informationConfirmed,
            authorizationConfirmed,
            req.ip,
          ]
        );

      return res.status(201).json({
        success: true,

        message:
          "Signed agreement uploaded successfully.",

        agreement: {
          id: agreementResult.rows[0].id,

          project_id:
            agreementResult.rows[0].project_id,

          agreement_version:
            agreementResult.rows[0].agreement_version,

          signed_agreement_url:
            agreementResult.rows[0]
              .signed_agreement_url,

          accepted:
            agreementResult.rows[0].accepted,

          information_confirmed:
            agreementResult.rows[0]
              .information_confirmed,

          authorization_confirmed:
            agreementResult.rows[0]
              .authorization_confirmed,

          accepted_at:
            agreementResult.rows[0].accepted_at,
        },
      });
    } catch (error) {
      console.error(
        "SIGNED AGREEMENT UPLOAD ERROR:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          error.message ||
          "Failed to upload signed agreement.",
      });
    }
  }
);

/* =========================================================
   DELETE PROJECT MEDIA
========================================================= */

router.delete(
  "/project/media/:mediaId",

  authenticateToken,

  authorizeRoles("Developer"),

  async (req, res) => {
    try {
      const { mediaId } = req.params;
      const developerId = req.user.id;

      if (!/^\d+$/.test(mediaId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid media ID",
        });
      }

      const mediaResult = await pool.query(
        `
        SELECT
          pm.id,
          pm.project_id,
          pm.media_url,
          pm.media_type
        FROM project_media pm
        INNER JOIN projects p
          ON p.id = pm.project_id
        WHERE pm.id = $1
          AND p.developer_id = $2
        `,
        [mediaId, developerId]
      );

      if (mediaResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message:
            "Media not found or you do not have permission to delete it.",
        });
      }

      const media = mediaResult.rows[0];

      await pool.query(
        `
        DELETE FROM project_media
        WHERE id = $1
        `,
        [mediaId]
      );

      return res.status(200).json({
        success: true,

        message:
          "Project media deleted successfully.",

        media: {
          id: media.id,
          project_id: media.project_id,
          media_url: media.media_url,
          media_type: media.media_type,
        },
      });
    } catch (error) {
      console.error(
        "DELETE PROJECT MEDIA ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to delete project media.",
        error: error.message,
      });
    }
  }
);

/* =========================================================
   TEST ROUTE
========================================================= */

router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Upload routes are working",
  });
});

/* =========================================================
   UPLOAD PROPERTY MEDIA
   IMAGE + VIDEO
========================================================= */

router.post(
  "/property/:propertyId",

  authenticateToken,

  authorizeRoles("Seller"),

  propertyMediaUpload.single("media"),

  async (req, res) => {
    try {
      const { propertyId } = req.params;

      console.log("================================");
      console.log(
        "PROPERTY MEDIA UPLOAD REQUEST"
      );
      console.log("Property ID:", propertyId);
      console.log("User:", req.user);

      console.log(
        "File:",
        req.file
          ? req.file.originalname
          : "NO FILE"
      );

      console.log(
        "MIME:",
        req.file
          ? req.file.mimetype
          : "NO FILE"
      );

      console.log("================================");

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message:
            "Please select an image or video.",
        });
      }

      const propertyResult =
        await pool.query(
          `
          SELECT id, image
          FROM properties
          WHERE id = $1
            AND owner_id = $2
          `,
          [
            propertyId,
            req.user.id,
          ]
        );

      if (
        propertyResult.rows.length === 0
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You are not the owner of this property.",
        });
      }

      const isVideo =
        req.file.mimetype.startsWith(
          "video/"
        );

      const mediaType = isVideo
        ? "video"
        : "image";

      const uploadResult =
        await new Promise(
          (resolve, reject) => {
            const stream =
              cloudinary.uploader.upload_stream(
                {
                  folder:
                    "xevoprop/properties",

                  resource_type: "auto",
                },

                (error, result) => {
                  if (error) {
                    reject(error);
                  } else {
                    resolve(result);
                  }
                }
              );

            stream.end(
              req.file.buffer
            );
          }
        );

      console.log(
        "Cloudinary upload successful:",
        uploadResult.secure_url
      );

      const sortResult =
        await pool.query(
          `
          SELECT
            COALESCE(
              MAX(sort_order),
              -1
            ) + 1 AS next_sort_order
          FROM property_images
          WHERE property_id = $1
          `,
          [propertyId]
        );

      const sortOrder = Number(
        sortResult.rows[0]
          .next_sort_order
      );

      const mediaResult =
        await pool.query(
          `
          INSERT INTO property_images
          (
            property_id,
            image_url,
            sort_order,
            media_type
          )
          VALUES
          ($1, $2, $3, $4)
          RETURNING *
          `,
          [
            propertyId,
            uploadResult.secure_url,
            sortOrder,
            mediaType,
          ]
        );

      console.log(
        "PROPERTY MEDIA SAVED:",
        mediaResult.rows[0]
      );

      if (
        mediaType === "image" &&
        !propertyResult.rows[0].image
      ) {
        await pool.query(
          `
          UPDATE properties
          SET image = $1
          WHERE id = $2
            AND owner_id = $3
          `,
          [
            uploadResult.secure_url,
            propertyId,
            req.user.id,
          ]
        );
      }

      return res.status(201).json({
        success: true,

        message:
          mediaType === "video"
            ? "Property video uploaded successfully."
            : "Property image uploaded successfully.",

        media: {
          id: mediaResult.rows[0].id,

          url:
            uploadResult.secure_url,

          type: mediaType,

          sort_order: sortOrder,
        },

        property: {
          id: propertyId,
        },
      });
    } catch (error) {
      console.error(
        "PROPERTY MEDIA UPLOAD ERROR:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          error.message ||
          "Failed to upload property media.",
      });
    }
  }
);

/* =========================================================
   OLD PROJECT IMAGE UPLOAD
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
      console.log(
        "PROJECT IMAGE UPLOAD REQUEST"
      );
      console.log(
        "Project ID:",
        projectId
      );
      console.log("User:", req.user);

      console.log(
        "File:",
        req.file
          ? req.file.originalname
          : "NO FILE"
      );

      console.log("================================");

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message:
            "Please select an image.",
        });
      }

      const projectResult =
        await pool.query(
          `
          SELECT id
          FROM projects
          WHERE id = $1
            AND developer_id = $2
          `,
          [
            projectId,
            req.user.id,
          ]
        );

      if (
        projectResult.rows.length === 0
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You are not the owner of this project.",
        });
      }

      const uploadResult =
        await new Promise(
          (resolve, reject) => {
            const stream =
              cloudinary.uploader.upload_stream(
                {
                  folder:
                    "xevoprop/projects",

                  resource_type:
                    "image",
                },

                (error, result) => {
                  if (error) {
                    reject(error);
                  } else {
                    resolve(result);
                  }
                }
              );

            stream.end(
              req.file.buffer
            );
          }
        );

      console.log(
        "Project image uploaded:",
        uploadResult.secure_url
      );

      const result =
        await pool.query(
          `
          UPDATE projects
          SET
            image = $1,
            updated_at =
              CURRENT_TIMESTAMP
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

      if (
        result.rows.length === 0
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Project not found.",
        });
      }

      return res.status(201).json({
        success: true,

        message:
          "Project image uploaded successfully.",

        image:
          result.rows[0].image,

        project:
          result.rows[0],
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
   UPLOAD PROJECT MEDIA
   IMAGE + VIDEO

   IMPORTANT:
   AddProject.jsx uses:
   /upload/project/:projectId/media

   field name:
   media
========================================================= */

router.post(
  "/project/:projectId/media",

  authenticateToken,

  authorizeRoles("Developer"),

  projectMediaUpload.single("media"),

  async (req, res) => {
    try {
      const { projectId } = req.params;

      console.log("================================");
      console.log(
        "PROJECT MEDIA UPLOAD REQUEST"
      );
      console.log(
        "Project ID:",
        projectId
      );
      console.log(
        "Developer ID:",
        req.user.id
      );

      console.log(
        "File:",
        req.file
          ? req.file.originalname
          : "NO FILE"
      );

      console.log(
        "MIME:",
        req.file
          ? req.file.mimetype
          : "NO FILE"
      );

      console.log("================================");

      /* -----------------------------------------------------
         CHECK FILE
      ----------------------------------------------------- */

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message:
            "Please select an image or video.",
        });
      }

      /* -----------------------------------------------------
         CHECK PROJECT OWNERSHIP
      ----------------------------------------------------- */

      const projectResult =
        await pool.query(
          `
          SELECT
            id,
            image
          FROM projects
          WHERE id = $1
            AND developer_id = $2
          `,
          [
            projectId,
            req.user.id,
          ]
        );

      if (
        projectResult.rows.length === 0
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You are not the owner of this project.",
        });
      }

      /* -----------------------------------------------------
         DETERMINE MEDIA TYPE
      ----------------------------------------------------- */

      const mediaType =
        req.file.mimetype.startsWith(
          "video/"
        )
          ? "video"
          : "image";

      /* -----------------------------------------------------
         CLOUDINARY UPLOAD
      ----------------------------------------------------- */

      const uploadResult =
        await new Promise(
          (resolve, reject) => {
            const stream =
              cloudinary.uploader.upload_stream(
                {
                  folder:
                    "xevoprop/projects",

                  resource_type:
                    "auto",
                },

                (error, result) => {
                  if (error) {
                    reject(error);
                  } else {
                    resolve(result);
                  }
                }
              );

            stream.end(
              req.file.buffer
            );
          }
        );

      console.log(
        "Project media uploaded:",
        uploadResult.secure_url
      );

      /* -----------------------------------------------------
         SORT ORDER
      ----------------------------------------------------- */

      const requestedSortOrder =
        Number(
          req.body.sort_order
        );

      let sortOrder;

      if (
        Number.isFinite(
          requestedSortOrder
        )
      ) {
        sortOrder =
          requestedSortOrder;
      } else {
        const sortResult =
          await pool.query(
            `
            SELECT
              COALESCE(
                MAX(sort_order),
                -1
              ) + 1 AS next_sort_order
            FROM project_media
            WHERE project_id = $1
            `,
            [projectId]
          );

        sortOrder =
          Number(
            sortResult.rows[0]
              .next_sort_order
          );
      }

      /* -----------------------------------------------------
         SAVE PROJECT MEDIA
      ----------------------------------------------------- */

      const mediaResult =
        await pool.query(
          `
          INSERT INTO project_media
          (
            project_id,
            media_url,
            media_type,
            sort_order
          )
          VALUES
          (
            $1,
            $2,
            $3,
            $4
          )
          RETURNING
            id,
            project_id,
            media_url,
            media_type,
            sort_order,
            created_at
          `,
          [
            projectId,
            uploadResult.secure_url,
            mediaType,
            sortOrder,
          ]
        );

      /* -----------------------------------------------------
         FIRST IMAGE BECOMES PROJECT COVER
         VIDEO NEVER BECOMES COVER
      ----------------------------------------------------- */

      if (
        mediaType === "image" &&
        !projectResult.rows[0].image
      ) {
        await pool.query(
          `
          UPDATE projects
          SET
            image = $1,
            updated_at =
              CURRENT_TIMESTAMP
          WHERE id = $2
            AND developer_id = $3
          `,
          [
            uploadResult.secure_url,
            projectId,
            req.user.id,
          ]
        );
      }

      /* -----------------------------------------------------
         RESPONSE
      ----------------------------------------------------- */

      return res.status(201).json({
        success: true,

        message:
          mediaType === "video"
            ? "Project video uploaded successfully."
            : "Project image uploaded successfully.",

        media: {
          id:
            mediaResult.rows[0].id,

          url:
            mediaResult.rows[0]
              .media_url,

          type:
            mediaResult.rows[0]
              .media_type,

          sort_order:
            mediaResult.rows[0]
              .sort_order,
        },
      });
    } catch (error) {
      console.error(
        "PROJECT MEDIA UPLOAD ERROR:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          error.message ||
          "Failed to upload project media.",
      });
    }
  }
);

/* =========================================================
   DELETE PROPERTY MEDIA
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

      const result =
        await pool.query(
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

      if (
        result.rows.length === 0
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Media not found or you are not the owner.",
        });
      }

      const firstImage =
        await pool.query(
          `
          SELECT image_url
          FROM property_images
          WHERE property_id = $1
            AND media_type = 'image'
          ORDER BY
            sort_order ASC,
            id ASC
          LIMIT 1
          `,
          [propertyId]
        );

      await pool.query(
        `
        UPDATE properties
        SET image = $1
        WHERE id = $2
        `,
        [
          firstImage.rows.length > 0
            ? firstImage.rows[0]
                .image_url
            : null,

          propertyId,
        ]
      );

      return res.json({
        success: true,

        message:
          "Property media deleted successfully.",
      });
    } catch (error) {
      console.error(
        "DELETE MEDIA ERROR:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          error.message ||
          "Failed to delete property media.",
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

      const ownerResult =
        await pool.query(
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

      if (
        ownerResult.rows.length === 0
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You are not the owner of this property.",
        });
      }

      /* -----------------------------------------------------
         GET SELECTED MEDIA
      ----------------------------------------------------- */

      const imageResult =
        await pool.query(
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

      if (
        imageResult.rows.length === 0
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Media not found.",
        });
      }

      const selectedMedia =
        imageResult.rows[0];

      /* -----------------------------------------------------
         PRIMARY MUST BE IMAGE
      ----------------------------------------------------- */

      if (
        selectedMedia.media_type ===
        "video"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "A video cannot be set as the primary property image.",
        });
      }

      /* -----------------------------------------------------
         MOVE ALL SORT ORDERS
      ----------------------------------------------------- */

      await pool.query(
        `
        UPDATE property_images
        SET sort_order =
          sort_order + 1
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
          AND property_id = $2
        `,
        [
          imageId,
          propertyId,
        ]
      );

      /* -----------------------------------------------------
         UPDATE PROPERTY COVER
      ----------------------------------------------------- */

      await pool.query(
        `
        UPDATE properties
        SET image = $1
        WHERE id = $2
        `,
        [
          selectedMedia.image_url,
          propertyId,
        ]
      );

      return res.json({
        success: true,

        message:
          "Primary image updated successfully.",
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
          "Failed to set primary image.",
      });
    }
  }
);

/* =========================================================
   EXPORT
========================================================= */

module.exports = router;