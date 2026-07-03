import express from "express";

import {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem,
} from "../controllers/itemController.js";

import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * =========================================================
 * ITEM ACCESS POLICY
 * =========================================================
 *
 * Manager:
 *   Full access (CRUD)
 *
 * Dispatcher:
 *   Full access (CRUD)
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
 * Base Route: /api/items
 * =========================================================
 */

/**
 * Create Item
 * Get All Items
 */
router
  .route("/")
  .post(
    protect,
    authorize("manager", "dispatcher"),
    createItem
  )
  .get(
    protect,
    authorize("manager", "dispatcher"),
    getItems
  );

/**
 * =========================================================
 * Item By ID
 * =========================================================
 */

router
  .route("/:id")

  /**
   * Get Single Item
   */
  .get(
    protect,
    authorize("manager", "dispatcher"),
    getItemById
  )

  /**
   * Update Item
   */
  .patch(
    protect,
    authorize("manager", "dispatcher"),
    updateItem
  )

  /**
   * Delete Item
   */
  .delete(
    protect,
    authorize("manager", "dispatcher"),
    deleteItem
  );

export default router;