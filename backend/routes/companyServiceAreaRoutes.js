import express from "express";

import {
  createCompanyServiceArea,
  getCompanyServiceAreas,
  getCompaniesByArea,
  getCompanyAreas,
  updateCompanyServiceArea,
  toggleCompanyServiceAreaStatus,
  deleteCompanyServiceArea,
} from "../controllers/companyServiceAreaController.js";

import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

/* -------------------------------------------------------------------------- */
/*                            ROLE ACCESS POLICY                              */
/* -------------------------------------------------------------------------- */
/**
 * Company Service Area Management
 *
 * Admin -> Full access
 *
 * Public -> Area based company lookup
 */

const adminOnly = authorize("admin");

/* -------------------------------------------------------------------------- */
/*                       PUBLIC AREA SEARCH                                   */
/* -------------------------------------------------------------------------- */
/**
 * GET /api/company-service-area/area/:areaId
 *
 * Returns companies servicing selected area
 *
 * Used by landing page:
 * City -> Area -> Companies
 *
 * Note:
 * No authentication required
 */

router.get("/area/:areaId", getCompaniesByArea);

/* -------------------------------------------------------------------------- */
/*                       COMPANY SERVICE AREAS                                */
/* -------------------------------------------------------------------------- */
/**
 * GET  /api/company-service-area
 *
 * List mappings
 *
 * POST /api/company-service-area
 *
 * Assign company to service area
 */

router
  .route("/")
  .get( getCompanyServiceAreas)
  .post(protect, adminOnly, createCompanyServiceArea);

/* -------------------------------------------------------------------------- */
/*                         COMPANY AREAS                                      */
/* -------------------------------------------------------------------------- */
/**
 * GET /api/company-service-area/company/:companyId
 *
 * Areas serviced by a company
 */

router.get("/company/:companyId", protect, adminOnly, getCompanyAreas);

/* -------------------------------------------------------------------------- */
/*                         SERVICE AREA BY ID                                 */
/* -------------------------------------------------------------------------- */
/**
 * GET    /api/company-service-area/:id
 *
 * PUT    /api/company-service-area/:id
 *
 * DELETE /api/company-service-area/:id
 */

router
  .route("/:id")
  .put(protect, adminOnly, updateCompanyServiceArea)
  .delete(protect, adminOnly, deleteCompanyServiceArea);

/* -------------------------------------------------------------------------- */
/*                          STATUS MANAGEMENT                                 */
/* -------------------------------------------------------------------------- */
/**
 * PATCH /api/company-service-area/:id/toggle-status
 *
 * Enable / Disable mapping
 */

router.patch(
  "/:id/toggle-status",
  protect,
  adminOnly,
  toggleCompanyServiceAreaStatus,
);

export default router;
