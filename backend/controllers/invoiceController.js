import asyncHandler from "../middleware/asyncHandler.js";

import Invoice from "../models/invoiceItemsModel.js";
import Company from "../models/companyModel.js";
import Job from "../models/jobModel.js";
import Customer from "../models/customerModel.js";

import { logActivity } from "../utils/activityLogger.js";

/**
 * @desc    Create invoice
 * @route   POST /api/invoices
 */
const createInvoice = asyncHandler(async (req, res) => {
  const {
    job,
    customer,
    items,
    dueDate,
    paymentMethod,
    taxRate,
    discount,
    notes,
    currency,
  } = req.body;

  /**
   * Validate company
   */
  const company = await Company.findById(req.user.company).select(
    "settings"
  );

  if (!company) {
    res.status(404);
    throw new Error("Company not found");
  }

  /**
   * Check invoicing enabled
   */
  if (!company.settings.enableInvoicing) {
    res.status(403);
    throw new Error(
      "Invoicing is disabled for this company"
    );
  }

  /**
   * Validate job ownership
   */
  const existingJob = await Job.findOne({
    _id: job,
    company: req.user.company,
  });

  if (!existingJob) {
    res.status(404);
    throw new Error(
      "Job not found or does not belong to company"
    );
  }

  /**
   * Validate customer ownership
   */
  const existingCustomer = await Customer.findOne({
    _id: customer,
    company: req.user.company,
  });

  if (!existingCustomer) {
    res.status(404);
    throw new Error(
      "Customer not found or does not belong to company"
    );
  }

  /**
   * Create invoice
   * totalAmount auto-calculated by model
   */
  const invoice = await Invoice.create({
    company: req.user.company,
    job,
    customer,
    items,
    dueDate,
    paymentMethod,
    taxRate,
    discount,
    notes,
    currency,
  });

  await logActivity({
    company: req.user.company,
    entityType: "Invoice",
    entityId: invoice._id,
    action: "CREATE_INVOICE",
    message: `Invoice ${invoice.invoiceNumber} created`,
  });

  res.status(201).json(invoice);
});

/**
 * @desc    Get all invoices
 * @route   GET /api/invoices
 */
const getInvoices = asyncHandler(async (req, res) => {
  const {
    status,
    customer,
    search,
    page = 1,
    limit = 20,
  } = req.query;

  const query = {
    company: req.user.company,
  };

  /**
   * Filters
   */
  if (status) {
    query.status = status;
  }

  if (customer) {
    query.customer = customer;
  }

  /**
   * Search by invoice number
   */
  if (search) {
    query.invoiceNumber = {
      $regex: search,
      $options: "i",
    };
  }

  const skip =
    (Number(page) - 1) * Number(limit);

  const invoices = await Invoice.find(query)
    .populate("customer", "name phone email")
    .populate("job", "title status")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await Invoice.countDocuments(query);

  res.json({
    invoices,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    total,
  });
});

/**
 * @desc    Get invoice by ID
 * @route   GET /api/invoices/:id
 */
const getInvoiceById = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findOne({
    _id: req.params.id,
    company: req.user.company,
  })
    .populate("customer")
    .populate("job");

  if (!invoice) {
    res.status(404);
    throw new Error("Invoice not found");
  }

  res.json(invoice);
});

/**
 * @desc    Update invoice
 * @route   PUT /api/invoices/:id
 */
const updateInvoice = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findOne({
    _id: req.params.id,
    company: req.user.company,
  });

  if (!invoice) {
    res.status(404);
    throw new Error("Invoice not found");
  }

  /**
   * Prevent editing paid invoices
   */
  if (invoice.status === "paid") {
    res.status(400);
    throw new Error(
      "Paid invoices cannot be modified"
    );
  }

  const oldAmount = invoice.totalAmount;

  /**
   * Update allowed fields
   */
  if (req.body.items) {
    invoice.items = req.body.items;
  }

  if (req.body.dueDate) {
    invoice.dueDate = req.body.dueDate;
  }

  if (req.body.paymentMethod) {
    invoice.paymentMethod =
      req.body.paymentMethod;
  }

  if (req.body.taxRate !== undefined) {
    invoice.taxRate = req.body.taxRate;
  }

  if (req.body.discount !== undefined) {
    invoice.discount = req.body.discount;
  }

  if (req.body.notes !== undefined) {
    invoice.notes = req.body.notes;
  }

  if (req.body.currency) {
    invoice.currency = req.body.currency;
  }

  /**
   * Save triggers recalculation middleware
   */
  const updated = await invoice.save();

  await logActivity({
    company: req.user.company,
    entityType: "Invoice",
    entityId: updated._id,
    action: "UPDATE_INVOICE",
    message: `Invoice updated (${oldAmount} → ${updated.totalAmount})`,
  });

  res.json(updated);
});

/**
 * @desc    Update invoice status
 * @route   PATCH /api/invoices/:id/status
 */
const updateInvoiceStatus = asyncHandler(
  async (req, res) => {
    const { status } = req.body;

    const allowedStatuses = [
      "draft",
      "sent",
      "paid",
      "overdue",
      "cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      res.status(400);
      throw new Error("Invalid invoice status");
    }

    const invoice = await Invoice.findOne({
      _id: req.params.id,
      company: req.user.company,
    });

    if (!invoice) {
      res.status(404);
      throw new Error("Invoice not found");
    }

    const company = await Company.findById(
      req.user.company
    ).select("settings");

    if (!company) {
      res.status(404);
      throw new Error("Company not found");
    }

    /**
     * Block payments if disabled
     */
    if (
      status === "paid" &&
      !company.settings.enablePayments
    ) {
      res.status(403);
      throw new Error(
        "Payments are disabled for this company"
      );
    }

    const oldStatus = invoice.status;

    invoice.status = status;

    /**
     * Auto-set paid timestamp
     */
    if (status === "paid") {
      invoice.paidAt = new Date();
    }

    /**
     * Clear paid date if reverted
     */
    if (status !== "paid") {
      invoice.paidAt = null;
    }

    const updated = await invoice.save();

    await logActivity({
      company: req.user.company,
      entityType: "Invoice",
      entityId: updated._id,
      action: "UPDATE_INVOICE_STATUS",
      message: `Invoice status changed from ${oldStatus} to ${status}`,
    });

    /**
     * Additional business intelligence logs
     */
    if (status === "paid") {
      await logActivity({
        company: req.user.company,
        entityType: "Invoice",
        entityId: updated._id,
        action: "INVOICE_PAID",
        message: `Invoice ${updated.invoiceNumber} marked as paid`,
      });
    }

    if (status === "sent") {
      await logActivity({
        company: req.user.company,
        entityType: "Invoice",
        entityId: updated._id,
        action: "INVOICE_SENT",
        message: `Invoice ${updated.invoiceNumber} sent to customer`,
      });
    }

    res.json(updated);
  }
);

/**
 * @desc    Delete invoice
 * @route   DELETE /api/invoices/:id
 */
const deleteInvoice = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findOne({
    _id: req.params.id,
    company: req.user.company,
  });

  if (!invoice) {
    res.status(404);
    throw new Error("Invoice not found");
  }

  /**
   * Prevent deleting paid invoices
   */
  if (invoice.status === "paid") {
    res.status(400);
    throw new Error(
      "Paid invoices cannot be deleted"
    );
  }

  const company = await Company.findById(
    req.user.company
  ).select("settings");

  if (!company.settings.enableInvoicing) {
    res.status(403);
    throw new Error(
      "Invoicing is disabled for this company"
    );
  }

  await invoice.deleteOne();

  await logActivity({
    company: req.user.company,
    entityType: "Invoice",
    entityId: invoice._id,
    action: "DELETE_INVOICE",
    message: `Invoice ${invoice.invoiceNumber} deleted`,
  });

  res.json({
    message: "Invoice removed successfully",
  });
});

export {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
  updateInvoiceStatus,
  deleteInvoice,
};