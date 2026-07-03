import express from "express";

import { resolveCompany } from "../middleware/resolveCompany.js";
import { protectCustomer } from "../middleware/customerAuthMiddleware.js";

import {
  registerCustomer,
  loginCustomer,
  logoutCustomer,
  getCustomerProfile,
  updateCustomerProfile,
} from "../controllers/customerAuthController.js";

import {
  createCustomerServiceRequest,
  getMyServiceRequests,
  getMyServiceRequestById,
} from "../controllers/customerServiceRequestController.js";

const router = express.Router();

/**
 * =====================================================
 * TENANT RESOLUTION (MUST RUN FIRST)
 * =====================================================
 */
router.use(resolveCompany);

/**
 * =====================================================
 * AUTH ROUTES
 * =====================================================
 */

router.post("/auth/register", registerCustomer);

router.post("/auth/login", loginCustomer);

router.post("/auth/logout", logoutCustomer);

router
  .route("/auth/profile")
  .get(protectCustomer, getCustomerProfile)
  .put(protectCustomer, updateCustomerProfile);

/**
 * =====================================================
 * SERVICE REQUEST ROUTES (CUSTOMER ONLY)
 * =====================================================
 */

router.post(
  "/:companySlug/service-requests",
  protectCustomer,
  createCustomerServiceRequest
);

router.get(
  "/:companySlug/service-requests",
  protectCustomer,
  getMyServiceRequests
);

router.get(
  "/:companySlug/service-requests/:id",
  protectCustomer,
  getMyServiceRequestById
);

export default router;