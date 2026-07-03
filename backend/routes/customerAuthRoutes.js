import express from "express";

import {
  registerCustomer,
  loginCustomer,
  logoutCustomer,
  getCustomerProfile,
  updateCustomerProfile,
  getCustomerAreaOptions,
  getCustomerCityOptions,
  forgotCustomerPassword,
} from "../controllers/customerAuthController.js";

import { resolveCompany } from "../middleware/resolveCompany.js";
import { protectCustomer } from "../middleware/customerAuthMiddleware.js";

const router = express.Router();

/**
 * =====================================================
 * TENANT RESOLUTION MIDDLEWARE (IMPORTANT)
 * =====================================================
 * Every portal route must resolve company from slug/domain
 */
router.use(resolveCompany);

/**
 * =====================================================
 * AUTH ROUTES (PUBLIC WITHIN TENANT)
 * =====================================================
 */

/**
 * Register new customer (self signup per company)
 * POST /portal/auth/register
 */
router.post("/:slug/register", registerCustomer);
router.post("/:slug/forgot-password", forgotCustomerPassword);

/**
 * Login customer (phone + password)
 * POST /portal/auth/login
 */
router.post("/:slug/login", loginCustomer);
router.get("/:slug/cities-options", getCustomerCityOptions);
router.get("/:slug/cities/:cityId/areas-options", getCustomerAreaOptions);

/**
 * Logout customer
 * POST /portal/auth/logout
 */
router.post("/logout", logoutCustomer);

/**
 * =====================================================
 * PUBLIC LOOKUP ROUTES
 * =====================================================
 * Used by the registration page.
 */

/**
 * Get city options
 * GET /portal/auth/cities/options
 */


/**
 * Get area options (optionally filtered by city)
 * GET /portal/auth/areas/options?city=<cityId>
 */


/**
 * =====================================================
 * PROTECTED CUSTOMER ROUTES
 * =====================================================
 * Requires valid customer JWT + tenant context
 */

router
  .route("/profile")
  .get(protectCustomer, getCustomerProfile)
  .put(protectCustomer, updateCustomerProfile);

export default router;