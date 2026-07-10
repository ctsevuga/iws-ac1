import express from "express";
import {
  myInvoices,
  myCurrentPlan,
  myCurrentUsage,
} from "../controllers/companyBillingController.js";

import { protect, authorize } from "../middleware/authMiddleware.js";
const router = express.Router();
router.get("/invoices", protect, authorize("manager"), myInvoices);

// routes/companyBillingRoutes.js

router.get("/current-plan", protect, authorize("manager"), myCurrentPlan);

// routes/companyBillingRoutes.js

router.get("/current-usage", protect, authorize("manager"), myCurrentUsage);

export default router;
