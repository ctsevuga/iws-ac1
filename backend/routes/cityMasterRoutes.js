import express from "express";

import {
  createCityMaster,
  getCityMasters,
  getCityMasterOptions,
  getCityMasterById,
  updateCityMaster,
  deleteCityMaster,
  toggleCityStatus,
} from "../controllers/cityMasterController.js";

import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

/* -------------------------------------------------------------------------- */
/*                            ROLE ACCESS POLICY                              */
/* -------------------------------------------------------------------------- */
/**
 * City Master Management
 *
 * Admin -> Full access
 *
 * Master location data is centrally maintained.
 */

const adminOnly = authorize("admin");

/* -------------------------------------------------------------------------- */
/*                            CITY OPTIONS                                    */
/* -------------------------------------------------------------------------- */
/**
 * GET /api/city-master/options
 *
 * Active cities for dropdowns
 */

router.get("/options",  getCityMasterOptions);

/* -------------------------------------------------------------------------- */
/*                            CITY COLLECTION                                 */
/* -------------------------------------------------------------------------- */
/**
 * GET  /api/city-master
 *      List all cities
 *
 * POST /api/city-master
 *      Create city
 */

router
  .route("/")
  .get(protect, adminOnly, getCityMasters)
  .post(protect, adminOnly, createCityMaster);

/* -------------------------------------------------------------------------- */
/*                            CITY BY ID                                      */
/* -------------------------------------------------------------------------- */
/**
 * GET    /api/city-master/:id
 *        Get city details
 *
 * PUT    /api/city-master/:id
 *        Update city
 *
 * DELETE /api/city-master/:id
 *        Delete city
 */

router
  .route("/:id")
  .get(protect, adminOnly, getCityMasterById)
  .put(protect, adminOnly, updateCityMaster)
  .delete(protect, adminOnly, deleteCityMaster);

/* -------------------------------------------------------------------------- */
/*                          STATUS MANAGEMENT                                 */
/* -------------------------------------------------------------------------- */
/**
 * PATCH /api/city-master/:id/toggle-status
 *
 * Enable / disable city
 */

router.patch("/:id/toggle-status", protect, adminOnly, toggleCityStatus);

export default router;
