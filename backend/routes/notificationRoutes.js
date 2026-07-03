import express from "express";

import {
  getNotifications,
  getNotificationById,
  markNotificationAsRead,
  getUnreadNotificationCount
} from "../controllers/notificationController.js";

import {
  protect,
  } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * GET all notifications
 * Technician -> own notifications
 * Manager/Dispatcher -> all technician notifications
 */
router.get(
  "/",
  protect,
  getNotifications
);
router.get("/unread-count", protect, getUnreadNotificationCount);
/**
 * GET single notification
 */
router.get(
  "/:id",
  protect,
  getNotificationById
);

/**
 * Technician marks own notification as read
 */
router.patch(
  "/:id/read",
  protect,
  markNotificationAsRead
);

export default router;