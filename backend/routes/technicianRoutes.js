// routes/technicianRoutes.js

import express from "express";

import {
  createTechnician,
  getTechnicians,
  getTechnicianById,
  updateTechnician,
  updateTechnicianAvailability,
  updateTechnicianLocation,
  deleteTechnician,
} from "../controllers/technicianController.js";

import {
  protect,
  authorize,
} from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * TECHNICIAN ACCESS RULES
 *
 * Manager:
 *   Full access
 *
 * Dispatcher:
 *   Full access
 *
 * Technician:
 *   Can update own availability/location
 */

/**
 * Base route: /api/technicians
 */

// Create technician
// Get all technicians
router
  .route("/")
  .post(
    protect,
    authorize("manager", "dispatcher"),
    createTechnician
  )
  .get(
    protect,
    authorize("manager", "dispatcher"),
    getTechnicians
  );

/**
 * Get / Update / Delete technician by ID
 */

router
  .route("/:id")

  // View technician details
  .get(
    protect,
    authorize("manager", "dispatcher"),
    getTechnicianById
  )

  // Update technician profile/details
  .put(
    protect,
    authorize("manager", "dispatcher"),
    updateTechnician
  )

  // Delete technician
  .delete(
    protect,
    authorize("manager", "dispatcher"),
    deleteTechnician
  );

/**
 * Update availability
 *
 * Technicians can update their own availability.
 * Managers & dispatchers can update any technician.
 */

router
  .route("/:id/availability")
  .patch(
    protect,
    authorize(
      "manager",
      "dispatcher",
      "technician"
    ),
    updateTechnicianAvailability
  );

/**
 * Update technician GPS/location
 *
 * Technicians can update their own location.
 * Managers & dispatchers can update any technician.
 */

router
  .route("/:id/location")
  .patch(
    protect,
    authorize(
      "manager",
      "dispatcher",
      "technician"
    ),
    updateTechnicianLocation
  );

export default router;