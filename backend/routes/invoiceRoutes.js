import express from "express";

import {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
  updateInvoiceStatus,
} from "../controllers/invoiceController.js";

import {
  protect,
  authorize,
} from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * =========================================================
 * INVOICE ACCESS POLICY
 * =========================================================
 *
 * Manager:
 *   Full invoice management
 *
 * Dispatcher:
 *   Full invoice management
 *
 * Admin:
 *   No access
 *
 * Technician:
 *   No access
 *
 * =========================================================
 */

/**
 * =========================================================
 * Base Route: /api/invoices
 * =========================================================
 */

/**
 * Create Invoice
 * Get All Invoices
 */
router
  .route("/")
  .post(
    protect,
    authorize("manager", "dispatcher"),
    createInvoice
  )
  .get(
    protect,
    authorize("manager", "dispatcher"),
    getInvoices
  );

/**
 * =========================================================
 * Invoice By ID
 * =========================================================
 */

router
  .route("/:id")

  /**
   * Get Single Invoice
   */
  .get(
    protect,
    authorize("manager", "dispatcher"),
    getInvoiceById
  )

  /**
   * Partially Update Invoice
   */
  .patch(
    protect,
    authorize("manager", "dispatcher"),
    updateInvoice
  )

  /**
   * Delete Invoice
   */
  .delete(
    protect,
    authorize("manager", "dispatcher"),
    deleteInvoice
  );

/**
 * =========================================================
 * Invoice Status Updates
 * =========================================================
 *
 * Example statuses:
 *  - draft
 *  - sent
 *  - paid
 *  - overdue
 *  - cancelled
 */

router
  .route("/:id/status")
  .patch(
    protect,
    authorize("manager", "dispatcher"),
    updateInvoiceStatus
  );

export default router;