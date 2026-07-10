// routes/billingDashboardRoutes.js

import express from "express";

import {
  getBillingDashboard,
  getCompanyBillingHistory,
  getMonthlyRevenue,
  getOutstandingInvoices,
} from "../controllers/billingDashboardController.js";

import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, authorize("admin"), getBillingDashboard);

router.get(
  "/company/:companyId/history",
  protect,
  authorize("admin"),
  getCompanyBillingHistory,
);

router.get("/monthly-revenue", protect, authorize("admin"), getMonthlyRevenue);

router.get(
  "/outstanding-invoices",
  protect,
  authorize("admin"),
  getOutstandingInvoices,
);

export default router;
