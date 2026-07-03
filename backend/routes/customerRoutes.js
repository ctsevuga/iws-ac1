// routes/customerRoutes.js

import express from "express";

import {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  reactivateCustomer,
} from "../controllers/customerController.js";

import {
  protect,
  authorize,
} from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * CUSTOMER ACCESS RULES
 *
 * Manager:
 *   Full access
 *
 * Dispatcher:
 *   Create / View / Update customers
 *
 * Technician:
 *   View customer info only
 *
 * Admin:
 *   No customer management access
 */

/**
 * Base route: /api/customers
 */

router
  .route("/")

  // Create customer
  .post(
    protect,
    authorize("manager", "dispatcher"),
    createCustomer
  )

  // Get all customers
  .get(
    protect,
    authorize(
      "manager",
      "dispatcher",
      "technician"
    ),
    getCustomers
  );

/**
 * Get / Update / Delete customer by ID
 */

router
  .route("/:id")

  // View customer details
  .get(
    protect,
    authorize(
      "manager",
      "dispatcher",
      "technician"
    ),
    getCustomerById
  )

  // Update customer
  .put(
    protect,
    authorize("manager", "dispatcher"),
    updateCustomer
  )

  // Soft delete customer
  .delete(
    protect,
    authorize("manager"),
    deleteCustomer
  );

/**
 * Reactivate soft-deleted customer
 */

router
  .route("/:id/reactivate")
  .put(
    protect,
    authorize("manager"),
    reactivateCustomer
  );

export default router;