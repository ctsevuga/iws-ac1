import express from "express";

import {
  getPortalSettings,
  createPortalSettings,
  updatePortalSettings,

  getPublicPortalSettings,
  getPortalAnnouncements,
  addService,
  updateService,
  deleteService,

  addSpecialService,
  updateSpecialService,
  deleteSpecialService,

  addAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getAnnouncementById,
} from "../controllers/customerPortalSettingsController.js";

import {
  protect,
  authorize,
} from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * CUSTOMER PORTAL SETTINGS ACCESS RULES
 *
 * Manager:
 *   Full access
 *
 * Dispatcher:
 *   View portal settings only
 *
 * Technician:
 *   No access
 *
 * Admin:
 *   No access
 *
 * Customer:
 *   Public portal access only
 */

/**
 * ------------------------------------------------------------------
 * PUBLIC ROUTES
 * ------------------------------------------------------------------
 */

/**
 * Get public portal settings
 *
 * Used by:
 *   /:slug
 *   Customer landing page
 */

router.get(
  "/public/:companyId",
  getPublicPortalSettings
);

router.get("/announcements", protect, getPortalAnnouncements);
router.get("/announcements/:id", protect, getAnnouncementById);
/**
 * ------------------------------------------------------------------
 * PORTAL SETTINGS
 * Base Route: /api/customer-portal-settings
 * ------------------------------------------------------------------
 */

router
  .route("/")

  /**
   * View portal settings
   */
  .get(
    protect,
    authorize("manager", "dispatcher"),
    getPortalSettings
  )

  /**
   * Create initial settings
   */
  .post(
    protect,
    authorize("manager"),
    createPortalSettings
  )

  /**
   * Update settings
   */
  .put(
    protect,
    authorize("manager"),
    updatePortalSettings
  );

/**
 * ------------------------------------------------------------------
 * SERVICES
 * ------------------------------------------------------------------
 */

/**
 * Add service
 */

router
  .route("/services")
  .post(
    protect,
    authorize("manager"),
    addService
  );

/**
 * Update / Delete service
 */

router
  .route("/services/:serviceId")

  .put(
    protect,
    authorize("manager"),
    updateService
  )

  .delete(
    protect,
    authorize("manager"),
    deleteService
  );

/**
 * ------------------------------------------------------------------
 * SPECIAL SERVICES
 * ------------------------------------------------------------------
 */

/**
 * Add special service
 */

router
  .route("/special-services")
  .post(
    protect,
    authorize("manager"),
    addSpecialService
  );

/**
 * Update / Delete special service
 */

router
  .route("/special-services/:id")

  .put(
    protect,
    authorize("manager"),
    updateSpecialService
  )

  .delete(
    protect,
    authorize("manager"),
    deleteSpecialService
  );

/**
 * ------------------------------------------------------------------
 * ANNOUNCEMENTS
 * ------------------------------------------------------------------
 */

/**
 * Add announcement
 */

router
  .route("/announcements")
  .post(
    protect,
    authorize("manager"),
    addAnnouncement
  );

/**
 * Update / Delete announcement
 */

router
  .route("/announcements/:id")

  .put(
    protect,
    authorize("manager"),
    updateAnnouncement
  )

  .delete(
    protect,
    authorize("manager"),
    deleteAnnouncement
  );

export default router;