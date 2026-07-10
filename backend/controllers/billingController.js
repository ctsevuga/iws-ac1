// controllers/billingController.js

import asyncHandler from "../middleware/asyncHandler.js";
import BillingInvoice from "../models/billingInvoiceModel.js";
import CompanySubscription from "../models/companySubscriptionModel.js";
import User from "../models/userModel.js";
import {
  createInvoice,
  regenerateInvoice,
} from "../services/billingService.js";
import { logActivity } from "../utils/activityLogger.js";

/**
 * @desc    Generate invoice for a company
 * @route   POST /api/billing/invoices/generate/:companyId
 * @access  Super Admin
 */
const generateInvoice = asyncHandler(async (req, res) => {
  console.log("\n========== GENERATE INVOICE CONTROLLER START ==========\n");

  const { companyId } = req.body;

  console.log("REQUEST BODY:", req.body);
  console.log("Company ID:", companyId);

  if (!companyId) {
    res.status(400);
    throw new Error("Company ID is required");
  }

  console.log("Company ID :", companyId);

  const invoice = await createInvoice(companyId);

  console.log("Invoice Generated :", invoice.invoiceNumber);

  console.log("\n========== GENERATE INVOICE CONTROLLER END ==========\n");

  res.status(201).json({
    success: true,
    message: "Invoice generated successfully.",
    data: invoice,
  });
});

/**
 * @desc    Re-generate an existing invoice
 * @route   PUT /api/billing/invoices/:invoiceId/regenerate
 * @access  Super Admin
 */

const reGenerateInvoice = asyncHandler(async (req, res) => {
  console.log("\n========== REGENERATE INVOICE CONTROLLER START ==========\n");

  const { invoiceId } = req.params;

  // =====================================================
  // Validate Invoice ID
  // =====================================================

  if (!invoiceId) {
    res.status(400);
    throw new Error("Invoice ID is required");
  }

  console.log("Invoice ID :", invoiceId);

  // =====================================================
  // Call Billing Service
  // =====================================================

  const invoice = await regenerateInvoice(invoiceId);

  console.log("Invoice Regenerated :", invoice.invoiceNumber);

  console.log("\n========== REGENERATE INVOICE CONTROLLER END ==========\n");

  // =====================================================
  // Response
  // =====================================================

  res.status(200).json({
    success: true,
    message: "Invoice regenerated successfully.",
    data: invoice,
  });
});

/**
 * @desc    Mark invoice as paid
 * @route   PUT /api/billing/invoices/:invoiceId/pay
 * @access  Super Admin
 */
const markInvoicePaid = asyncHandler(async (req, res) => {
  console.log("\n========== MARK INVOICE PAID START ==========\n");

  const { invoiceId } = req.params;

  const { paidAmount, paymentReference, paymentMethod, notes } = req.body;

  // =====================================================
  // Validate Invoice ID
  // =====================================================

  if (!invoiceId) {
    res.status(400);
    throw new Error("Invoice ID is required");
  }

  // =====================================================
  // Find Invoice
  // =====================================================

  const invoice = await BillingInvoice.findById(invoiceId);

  if (!invoice) {
    res.status(404);
    throw new Error("Invoice not found");
  }

  console.log("Invoice:", invoice.invoiceNumber);

  // =====================================================
  // Check Already Paid
  // =====================================================

  if (invoice.status === "paid") {
    res.status(400);
    throw new Error("Invoice is already paid");
  }

  // =====================================================
  // Validate Amount
  // =====================================================

  const amount = paidAmount !== undefined ? Number(paidAmount) : invoice.total;

  if (amount <= 0) {
    res.status(400);
    throw new Error("Invalid payment amount");
  }

  if (amount > invoice.total) {
    res.status(400);
    throw new Error("Paid amount cannot exceed invoice total");
  }

  // =====================================================
  // Update Payment Details
  // =====================================================

  invoice.paidAmount = amount;

  invoice.paymentReference = paymentReference || null;

  invoice.paymentMethod = paymentMethod || null;

  invoice.notes = notes || invoice.notes;

  invoice.paidAt = new Date();

  // =====================================================
  // Payment Status
  // =====================================================

  if (amount >= invoice.total) {
    invoice.status = "paid";
  } else {
    invoice.status = "pending";
  }

  await invoice.save();

  // =====================================================
  // Activity Log
  // =====================================================

  await logActivity({
    company: invoice.company,

    entityType: "BillingInvoice",

    entityId: invoice._id,

    action: "MARK_INVOICE_PAID",

    message: `Invoice ${invoice.invoiceNumber} marked as paid (${amount})`,
  });

  console.log("Invoice Payment Updated:", invoice.invoiceNumber);

  console.log("\n========== MARK INVOICE PAID END ==========\n");

  res.status(200).json({
    success: true,

    message: "Invoice marked as paid successfully.",

    data: invoice,
  });
});

/**
 * @desc    Cancel invoice
 * @route   PUT /api/billing/invoices/:invoiceId/cancel
 * @access  Super Admin
 */
const cancelInvoice = asyncHandler(async (req, res) => {
  console.log("\n========== CANCEL INVOICE START ==========\n");

  const { invoiceId } = req.params;

  const { reason } = req.body;

  // =====================================================
  // Validate Invoice ID
  // =====================================================

  if (!invoiceId) {
    res.status(400);
    throw new Error("Invoice ID is required");
  }

  // =====================================================
  // Find Invoice
  // =====================================================

  const invoice = await BillingInvoice.findById(invoiceId);

  if (!invoice) {
    res.status(404);
    throw new Error("Invoice not found");
  }

  console.log("Invoice:", invoice.invoiceNumber);

  // =====================================================
  // Check Current Status
  // =====================================================

  if (invoice.status === "cancelled") {
    res.status(400);
    throw new Error("Invoice is already cancelled");
  }

  if (invoice.status === "paid") {
    res.status(400);
    throw new Error("Paid invoice cannot be cancelled");
  }

  // =====================================================
  // Update Invoice
  // =====================================================

  invoice.status = "cancelled";

  invoice.cancelledAt = new Date();

  invoice.cancellationReason = reason || "Cancelled by admin";

  await invoice.save();

  // =====================================================
  // Activity Log
  // =====================================================

  await logActivity({
    company: invoice.company,

    entityType: "BillingInvoice",

    entityId: invoice._id,

    action: "CANCEL_INVOICE",

    message: `Invoice ${invoice.invoiceNumber} cancelled. Reason: ${invoice.cancellationReason}`,
  });

  console.log("Invoice Cancelled:", invoice.invoiceNumber);

  console.log("\n========== CANCEL INVOICE END ==========\n");

  res.status(200).json({
    success: true,

    message: "Invoice cancelled successfully.",

    data: invoice,
  });
});

/**
 * @desc    Get invoice details in printable format
 * @route   GET /api/billing/invoices/:invoiceId
 * @access  Super Admin
 */
const getInvoice = asyncHandler(async (req, res) => {
  console.log("\n========== GET INVOICE START ==========\n");

  const { invoiceId } = req.params;

  // =====================================================
  // Validate Invoice ID
  // =====================================================

  if (!invoiceId) {
    res.status(400);
    throw new Error("Invoice ID is required");
  }

  // =====================================================
  // Fetch Invoice
  // =====================================================

  const invoice = await BillingInvoice.findById(invoiceId)
    .populate(
      "company",
      `
        name
        legalName
        email
        phone
        website
      `,
    )
    .populate(
      "subscription",
      `
        plan
        status
        billingCycle
        startedAt
        nextBillingDate
      `,
    );

  if (!invoice) {
    res.status(404);
    throw new Error("Invoice not found");
  }

  console.log("Invoice Found:", invoice.invoiceNumber);

  // =====================================================
  // Format Printable Invoice
  // =====================================================

  const formattedInvoice = {
    // ---------------------------------------------------
    // Customer Snapshot (GST Invoice)
    // ---------------------------------------------------

    company: {
      id: invoice.company?._id,

      // Snapshot values (preferred)
      name: invoice.companyName,

      legalName: invoice.company?.legalName,

      email: invoice.company?.email,

      phone: invoice.company?.phone,

      website: invoice.company?.website,

      gstin: invoice.gstin,

      stateCode: invoice.stateCode,

      billingAddress: invoice.billingAddress,
    },

    // ---------------------------------------------------
    // Invoice Information
    // ---------------------------------------------------

    invoice: {
      id: invoice._id,

      invoiceNumber: invoice.invoiceNumber,

      invoiceDate: invoice.invoiceDate,

      billingPeriod: {
        from: invoice.billingPeriodStart,
        to: invoice.billingPeriodEnd,
      },

      dueDate: invoice.dueDate,

      status: invoice.status,
    },

    // ---------------------------------------------------
    // Subscription Information
    // ---------------------------------------------------

    subscription: {
      plan: invoice.subscription?.plan,

      billingCycle: invoice.subscription?.billingCycle,

      status: invoice.subscription?.status,

      startedAt: invoice.subscription?.startedAt,

      nextBillingDate: invoice.subscription?.nextBillingDate,
    },

    // ---------------------------------------------------
    // Usage Snapshot
    // ---------------------------------------------------

    usage: {
      managers: invoice.managers,

      dispatchers: invoice.dispatchers,

      technicians: invoice.technicians,

      extraManagers: invoice.extraManagers,

      extraDispatchers: invoice.extraDispatchers,

      extraTechnicians: invoice.extraTechnicians,
    },

    // ---------------------------------------------------
    // Billing Items
    // ---------------------------------------------------

    items: invoice.lineItems.map((item) => ({
      description: item.description,

      type: item.type,

      quantity: item.quantity,

      unitPrice: item.unitPrice,

      amount: item.amount,
    })),

    // ---------------------------------------------------
    // Amount Summary
    // ---------------------------------------------------

    summary: {
      subtotal: invoice.subtotal,

      gst: invoice.gst,

      totalAmountWithGST: invoice.totalAmountWithGST,

      paidAmount: invoice.paidAmount,

      balanceAmount: invoice.totalAmountWithGST - invoice.paidAmount,
    },

    // ---------------------------------------------------
    // Payment Information
    // ---------------------------------------------------

    payment: {
      status: invoice.status,

      paidAt: invoice.paidAt,
    },

    // ---------------------------------------------------
    // Cancellation Information
    // ---------------------------------------------------

    cancellation:
      invoice.status === "cancelled"
        ? {
            cancelledAt: invoice.cancelledAt,

            reason: invoice.cancellationReason,
          }
        : null,

    createdAt: invoice.createdAt,

    updatedAt: invoice.updatedAt,
  };

  console.log("\n========== GET INVOICE END ==========\n");

  res.status(200).json({
    success: true,
    data: formattedInvoice,
  });
});

/**
 * @desc    Get all invoices
 * @route   GET /api/billing/invoices
 * @access  Super Admin
 */
const listInvoices = asyncHandler(async (req, res) => {
  console.log("\n========== LIST INVOICES START ==========\n");

  const {
    search,
    status,
    company,
    month,
    year,
    page = 1,
    limit = 20,
  } = req.query;

  // =====================================================
  // Pagination
  // =====================================================

  const pageNumber = Number(page);

  const limitNumber = Number(limit);

  const skip = (pageNumber - 1) * limitNumber;

  // =====================================================
  // Build Query
  // =====================================================

  const query = {};

  if (status) {
    query.status = status;
  }

  if (company) {
    query.company = company;
  }

  if (month || year) {
    const startDate = new Date(
      year || new Date().getFullYear(),
      month ? month - 1 : 0,
      1,
    );

    const endDate = month
      ? new Date(year || new Date().getFullYear(), month, 1)
      : new Date(Number(year) + 1, 0, 1);

    query.invoiceDate = {
      $gte: startDate,
      $lt: endDate,
    };
  }

  // =====================================================
  // Search
  // =====================================================

  let invoicesQuery = BillingInvoice.find(query);

  if (search) {
    const searchRegex = new RegExp(search, "i");

    invoicesQuery = BillingInvoice.find({
      ...query,

      $or: [
        {
          invoiceNumber: searchRegex,
        },
      ],
    });
  }

  // =====================================================
  // Fetch Invoices
  // =====================================================

  const invoices = await invoicesQuery

    .populate(
      "company",
      `
        name
        email
        phone
        slug
      `,
    )

    .populate(
      "subscription",
      `
        plan
        status
        billingCycle
      `,
    )

    .sort({
      createdAt: -1,
    })

    .skip(skip)

    .limit(limitNumber);

  // =====================================================
  // Total Count
  // =====================================================

  const total = await BillingInvoice.countDocuments(
    search
      ? {
          ...query,

          $or: [
            {
              invoiceNumber: new RegExp(search, "i"),
            },
          ],
        }
      : query,
  );

  console.log("Invoices Found:", invoices.length);

  console.log("\n========== LIST INVOICES END ==========\n");

  // =====================================================
  // Response
  // =====================================================

  res.status(200).json({
    success: true,

    data: invoices.map((invoice) => ({
      _id: invoice._id,

      invoiceNumber: invoice.invoiceNumber,

      company: invoice.company,

      subscription: invoice.subscription,

      invoiceDate: invoice.invoiceDate,

      billingPeriod: {
        from: invoice.billingPeriodStart,

        to: invoice.billingPeriodEnd,
      },

      // ==============================
      // GST Billing Amount
      // ==============================

      amount: {
        subtotal: invoice.subtotal,

        gst: invoice.gst,

        total: invoice.totalAmountWithGST,

        paid: invoice.paidAmount,

        balance: invoice.totalAmountWithGST - invoice.paidAmount,
      },

      // Keep direct access also
      gst: invoice.gst,

      totalAmountWithGST: invoice.totalAmountWithGST,

      status: invoice.status,

      createdAt: invoice.createdAt,
    })),

    pagination: {
      page: pageNumber,

      limit: limitNumber,

      total,

      pages: Math.ceil(total / limitNumber),
    },
  });
});

export {
  generateInvoice,
  reGenerateInvoice,
  markInvoicePaid,
  cancelInvoice,
  getInvoice,
  listInvoices,
};
