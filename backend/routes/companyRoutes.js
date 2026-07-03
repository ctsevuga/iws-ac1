import express from "express";

import {
  createCompany,
  getMyCompany,
  updateCompany,       // Admin-only update (full control)
  updateMyCompany,     // Manager self-update (restricted control)
  getCompanies,
  getCompanyById,
  deleteCompany,
} from "../controllers/companyController.js";

import {
  protect,
  authorize,
} from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * =========================================================
 * BASE ROUTE: /api/companies
 * =========================================================
 */

// Create Company (Public onboarding)
router.route("/")
  .post(createCompany)

// Get all companies (Admin only)
  .get(
    protect,
    authorize("admin"),
    getCompanies
  );

/**
 * =========================================================
 * CURRENT USER COMPANY (TENANT SAFE)
 * =========================================================
 *
 * Used by:
 * - Manager dashboard
 * - Admin "my company" view
 *
 * Routes:
 *   GET  /api/companies/me
 *   PUT  /api/companies/me
 * =========================================================
 */

router.route("/me")

// Get logged-in user's company
  .get(
    protect,
    authorize("admin", "manager"),
    getMyCompany
  )

// Manager/Admin update own company (restricted fields)
  .put(
    protect,
    authorize("manager", "admin"),
    updateMyCompany
  );

/**
 * =========================================================
 * ADMIN COMPANY MANAGEMENT (FULL ACCESS)
 * =========================================================
 *
 * Routes:
 *   GET    /api/companies/:id
 *   PUT    /api/companies/:id
 *   DELETE /api/companies/:id
 * =========================================================
 */

router.route("/:id")

// Get any company (Admin only)
  .get(
    protect,
    authorize("admin"),
    getCompanyById
  )

// Full update (Admin only - includes branding, portalSettings, settings)
  .put(
    protect,
    authorize("admin"),
    updateCompany
  )

// Soft delete (deactivate company)
  .delete(
    protect,
    authorize("admin"),
    deleteCompany
  );

export default router;