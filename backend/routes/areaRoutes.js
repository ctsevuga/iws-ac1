import express from "express";

import {
  createArea,
  getAreas,
  getAreaById,
  updateArea,
  getAreaOptions,
  getCompanyCities,
  deleteArea,
  assignAreaToCity,
  getCityAreas,
} from "../controllers/areaController.js";

import {
  protect,
  authorize,
  manager,
} from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * AREA ACCESS RULES
 *
 * Admin      -> Full access
 * Manager    -> Full access
 * Dispatcher -> View only
 * Technician -> View only
 */

const viewRoles = authorize(
  "admin",
  "manager",
  "dispatcher",
  "technician"
);

/* -------------------------------------------------------------------------- */
/*                                AREA ROUTES                                 */
/* -------------------------------------------------------------------------- */

// Create & List Areas
router
  .route("/")
  .post(protect, manager, createArea)
  .get(protect, viewRoles, getAreas);

/* -------------------------------------------------------------------------- */
/*                              UTILITY ROUTES                                */
/* -------------------------------------------------------------------------- */

// Area dropdown options (area + city populated)
router.get(
  "/options",
  protect,
  manager,
  getAreaOptions
);

// Company Cities (City collection)
router.get(
  "/cities/all",
  protect,
  viewRoles,
  getCompanyCities
);

// Get all areas for a city
router.get(
  "/city/:cityId",
  protect,
  manager,
  getCityAreas
);

/* -------------------------------------------------------------------------- */
/*                                 AREA CRUD                                  */
/* -------------------------------------------------------------------------- */

router
  .route("/:id")
  .get(protect, viewRoles, getAreaById)
  .put(protect, manager, updateArea)
  .delete(protect, authorize("admin"), deleteArea);

// Assign / move area to another city
router.put(
  "/:areaId/city",
  protect,
  manager,
  assignAreaToCity
);

export default router;