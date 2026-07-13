import express from "express";

import {
  createAreaMaster,
  getAreaMasters,
  getAreaMasterOptions,
  getCityAreaMasters,
  getAreaMasterById,
  updateAreaMaster,
  toggleAreaMasterStatus,
  deleteAreaMaster,
} from "../controllers/areaMasterController.js";

import {
  protect,
  authorize,
} from "../middleware/authMiddleware.js";


const router = express.Router();


/* -------------------------------------------------------------------------- */
/*                            ROLE ACCESS POLICY                              */
/* -------------------------------------------------------------------------- */
/**
 * Area Master Management
 *
 * Admin -> Full access
 *
 * AreaMaster is global master data and should not
 * be modified by company users.
 */

const adminOnly = authorize("admin");



/* -------------------------------------------------------------------------- */
/*                              AREA OPTIONS                                  */
/* -------------------------------------------------------------------------- */
/**
 * GET /api/area-master/options
 *
 * Active areas for dropdowns
 */
router.get(
  "/options",
  
  getAreaMasterOptions
);



/* -------------------------------------------------------------------------- */
/*                         AREAS BY CITY                                      */
/* -------------------------------------------------------------------------- */
/**
 * GET /api/area-master/city/:cityId
 *
 * Get active areas belonging to a city
 *
 * Used when:
 * City selected -> Load area dropdown
 */
router.get(
  "/city/:cityId",
  
  getCityAreaMasters
);



/* -------------------------------------------------------------------------- */
/*                           AREA COLLECTION                                  */
/* -------------------------------------------------------------------------- */
/**
 * GET  /api/area-master
 *      Get all areas
 *
 * POST /api/area-master
 *      Create area
 */

router
  .route("/")
  .get(
    protect,
    adminOnly,
    getAreaMasters
  )
  .post(
    protect,
    adminOnly,
    createAreaMaster
  );



/* -------------------------------------------------------------------------- */
/*                              AREA BY ID                                    */
/* -------------------------------------------------------------------------- */
/**
 * GET    /api/area-master/:id
 *        Get area details
 *
 * PUT    /api/area-master/:id
 *        Update area
 *
 * DELETE /api/area-master/:id
 *        Delete area
 */

router
  .route("/:id")
  .get(
    protect,
    adminOnly,
    getAreaMasterById
  )
  .put(
    protect,
    adminOnly,
    updateAreaMaster
  )
  .delete(
    protect,
    adminOnly,
    deleteAreaMaster
  );



/* -------------------------------------------------------------------------- */
/*                         STATUS MANAGEMENT                                  */
/* -------------------------------------------------------------------------- */
/**
 * PATCH /api/area-master/:id/toggle-status
 *
 * Enable / Disable area
 */

router.patch(
  "/:id/toggle-status",
  protect,
  adminOnly,
  toggleAreaMasterStatus
);



export default router;