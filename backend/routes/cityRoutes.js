import express from "express";

import {
  createCity,
  getCities,
  getCityById,
  updateCity,
  deleteCity,
  getCityOptions,
  
} from "../controllers/cityController.js";

import {
  protect,
  authorize,
  manager,
} from "../middleware/authMiddleware.js";

const router = express.Router();

/* -------------------------------------------------------------------------- */
/*                            ROLE ACCESS POLICY                              */
/* -------------------------------------------------------------------------- */
/**
 * Admin      -> Full access
 * Manager    -> Full access
 * Dispatcher -> Read only
 * Technician -> Read only
 */

const viewRoles = authorize(
  "admin",
  "manager",
  "dispatcher",
  "technician"
);

/* -------------------------------------------------------------------------- */
/*                              CITY OPTIONS                                  */
/* -------------------------------------------------------------------------- */
/**
 * GET /api/cities/options
 * Dropdown options for UI (used in RTK Query)
 */

router.get(
  "/options",
  protect,
  viewRoles,
  getCityOptions
);

/* -------------------------------------------------------------------------- */
/*                              CITY COLLECTION                               */
/* -------------------------------------------------------------------------- */
/**
 * GET  /api/cities        -> list cities
 * POST /api/cities        -> create city
 */

router
  .route("/")
  .get(protect, viewRoles, getCities)
  .post(protect, manager, createCity);

/* -------------------------------------------------------------------------- */
/*                              CITY BY ID                                    */
/* -------------------------------------------------------------------------- */
/**
 * GET    /api/cities/:id   -> get single city
 * PUT    /api/cities/:id   -> update city
 * DELETE /api/cities/:id   -> delete city
 */

router
  .route("/:id")
  .get(protect, viewRoles, getCityById)
  .put(protect, manager, updateCity)
  .delete(protect, authorize("admin"), deleteCity);

/* -------------------------------------------------------------------------- */

export default router;