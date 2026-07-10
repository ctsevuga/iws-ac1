import express from "express";
import {
  generateInvoice,
  reGenerateInvoice,
  markInvoicePaid,
  cancelInvoice,
  listInvoices,
  getInvoice,
} from "../controllers/billingController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
const router = express.Router();
router.post(
  "/invoices/generate",
  protect,
  authorize("admin"),
  generateInvoice,
);

router.put(
  "/invoices/:invoiceId/regenerate",
  protect,
  authorize("admin"),
  reGenerateInvoice,
);

router.put(
  "/invoices/:invoiceId/pay",
  protect,
  authorize("admin"),
  markInvoicePaid,
);

router.put(
  "/invoices/:invoiceId/cancel",
  protect,
  authorize("admin"),
  cancelInvoice,
);

router.get("/invoices/:invoiceId", protect, authorize("admin"), getInvoice);

router.get("/invoices", protect, authorize("admin"), listInvoices);
export default router;
