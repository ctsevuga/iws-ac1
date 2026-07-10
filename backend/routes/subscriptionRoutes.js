import express from "express";

import {
  createSubscription,
  updateSubscription,
  getSubscription,
} from "../controllers/subscriptionController.js";
const router = express.Router();

import { protect, authorize } from "../middleware/authMiddleware.js";

router.post("/", protect, authorize("admin"), createSubscription);

router.put("/:companyId", protect, authorize("admin"), updateSubscription);

router.get("/:companyId", protect, authorize("admin"), getSubscription);

export default router;
