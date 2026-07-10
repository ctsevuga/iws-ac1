// controllers/companyBillingController.js

import asyncHandler from "../middleware/asyncHandler.js";
import BillingInvoice from "../models/billingInvoiceModel.js";
import Company from "../models/companyModel.js";
import CompanySubscription from "../models/companySubscriptionModel.js";
import User from "../models/userModel.js";

/**
 * @desc    Get logged-in company invoices
 * @route   GET /api/company-billing/invoices
 * @access  Company Admin
 */
const myInvoices = asyncHandler(async (req, res) => {
  console.log("\n========== MY INVOICES START ==========\n");

  // =====================================================
  // Company
  // =====================================================

  const companyId =
    req.user?.company?._id?.toString?.() ||
    req.user?.company?.toString?.() ||
    req.user?.company;

  if (!companyId) {
    res.status(403);
    throw new Error("Company not found");
  }

  const { search, status, page = 1, limit = 20 } = req.query;

  // =====================================================
  // Pagination
  // =====================================================

  const pageNumber = Number(page);
  const limitNumber = Number(limit);
  const skip = (pageNumber - 1) * limitNumber;

  // =====================================================
  // Query
  // =====================================================

  const query = {
    company: companyId,
  };

  if (status) {
    query.status = status;
  }

  if (search) {
    query.invoiceNumber = {
      $regex: search,
      $options: "i",
    };
  }

  // =====================================================
  // Fetch Invoices
  // =====================================================

  const invoices = await BillingInvoice.find(query)
    .populate(
      "subscription",
      `
      plan
      billingCycle
      status
      `,
    )
    .sort({
      invoiceDate: -1,
    })
    .skip(skip)
    .limit(limitNumber);

  // =====================================================
  // Total Count
  // =====================================================

  const total = await BillingInvoice.countDocuments(query);

  // =====================================================
  // Billing Summary
  // =====================================================

  const summaryResult = await BillingInvoice.aggregate([
    {
      $match: {
        company: invoices[0]?.company || companyId,
      },
    },
    {
      $group: {
        _id: null,

        totalInvoices: {
          $sum: 1,
        },

        totalBilled: {
          $sum: "$totalAmountWithGST",
        },

        totalPaid: {
          $sum: "$paidAmount",
        },

        outstanding: {
          $sum: {
            $subtract: ["$totalAmountWithGST", "$paidAmount"],
          },
        },
      },
    },
  ]);

  const summary = summaryResult[0] || {
    totalInvoices: 0,
    totalBilled: 0,
    totalPaid: 0,
    outstanding: 0,
  };

  // =====================================================
  // Format Response
  // =====================================================

  const formattedInvoices = invoices.map((invoice) => ({
    _id: invoice._id,

    invoiceNumber: invoice.invoiceNumber,

    invoiceDate: invoice.invoiceDate,

    billingPeriod: {
      from: invoice.billingPeriodStart,
      to: invoice.billingPeriodEnd,
    },

    amount: {
      subtotal: invoice.subtotal,

      gst: invoice.gst?.amount || 0,

      total: invoice.totalAmountWithGST,

      paid: invoice.paidAmount,

      balance: invoice.totalAmountWithGST - invoice.paidAmount,
    },

    gst: invoice.gst,

    status: invoice.status,

    dueDate: invoice.dueDate,

    subscription: invoice.subscription,

    createdAt: invoice.createdAt,
  }));

  console.log("Invoices Found:", invoices.length);

  console.log("\n========== MY INVOICES END ==========\n");

  res.status(200).json({
    success: true,

    data: {
      summary,
      invoices: formattedInvoices,
    },

    pagination: {
      page: pageNumber,
      limit: limitNumber,
      total,
      pages: Math.ceil(total / limitNumber),
    },
  });
});

/**
 * @desc    Get current company subscription plan
 * @route   GET /api/company-billing/current-plan
 * @access  Company Admin
 */
const myCurrentPlan = asyncHandler(async (req, res) => {
  console.log("\n========== MY CURRENT PLAN START ==========\n");

  // =====================================================
  // Get Company ID
  // =====================================================

  const companyId =
    req.user?.company?._id?.toString?.() ||
    req.user?.company?.toString?.() ||
    req.user?.company;

  if (!companyId) {
    res.status(403);
    throw new Error("Company not found");
  }

  // =====================================================
  // Get Active Subscription
  // =====================================================

  const subscription = await CompanySubscription.findOne({
    company: companyId,
    status: "active",
  }).sort({ createdAt: -1 });

  if (!subscription) {
    res.status(404);
    throw new Error("Active subscription not found");
  }

  // =====================================================
  // Get Company
  // =====================================================

  const company = await Company.findById(companyId);

  // =====================================================
  // Count Current Users
  // =====================================================

  const [managers, dispatchers, technicians] = await Promise.all([
    User.countDocuments({
      company: companyId,
      role: "manager",
      isActive: true,
    }),

    User.countDocuments({
      company: companyId,
      role: "dispatcher",
      isActive: true,
    }),

    User.countDocuments({
      company: companyId,
      role: "technician",
      isActive: true,
    }),
  ]);

  // =====================================================
  // Plan Configuration
  // =====================================================

  const PLAN_CONFIG = {
    basic: {
      price: 1000,

      included: {
        manager: 1,
        dispatcher: 1,
        technician: 3,
      },

      extra: {
        manager: 500,
        dispatcher: 400,
        technician: 300,
      },
    },
  };

  const config = PLAN_CONFIG[subscription.plan];

  if (!config) {
    res.status(400);
    throw new Error("Invalid subscription plan");
  }

  // =====================================================
  // Additional Users
  // =====================================================

  const extraManagers = Math.max(managers - config.included.manager, 0);

  const extraDispatchers = Math.max(
    dispatchers - config.included.dispatcher,
    0,
  );

  const extraTechnicians = Math.max(
    technicians - config.included.technician,
    0,
  );

  // =====================================================
  // Subtotal
  // =====================================================

  const subtotal =
    config.price +
    extraManagers * config.extra.manager +
    extraDispatchers * config.extra.dispatcher +
    extraTechnicians * config.extra.technician;

  // =====================================================
  // GST Calculation
  // =====================================================

  const gstPercentage = 18;

  const gstAmount = (subtotal * gstPercentage) / 100;

  const gst = {
    percentage: gstPercentage,
    amount: gstAmount,
    type: "CGST_SGST",
    cgst: gstAmount / 2,
    sgst: gstAmount / 2,
    igst: 0,
  };

  // =====================================================
  // Total
  // =====================================================

  const totalAmountWithGST = subtotal + gst.amount;

  // =====================================================
  // Response
  // =====================================================

  const response = {
    company: {
      name: company?.name,
      gstin: company?.gstin || null,
      stateCode: company?.stateCode || null,
    },

    plan: {
      name: subscription.plan,
      status: subscription.status,
      billingCycle: subscription.billingCycle,
      startedAt: subscription.startedAt,
      nextBillingDate: subscription.nextBillingDate,
    },

    limits: {
      included: {
        managers: config.included.manager,
        dispatchers: config.included.dispatcher,
        technicians: config.included.technician,
      },

      pricing: {
        basePlan: config.price,
        extraManager: config.extra.manager,
        extraDispatcher: config.extra.dispatcher,
        extraTechnician: config.extra.technician,
      },
    },

    usage: {
      managers,
      dispatchers,
      technicians,
    },

    additionalUsers: {
      managers: extraManagers,
      dispatchers: extraDispatchers,
      technicians: extraTechnicians,
    },

    billing: {
      subtotal,
      gst,
      totalAmountWithGST,
    },
  };

  console.log("Current Plan:", subscription.plan);

  console.log("\n========== MY CURRENT PLAN END ==========\n");

  res.status(200).json({
    success: true,
    data: response,
  });
});

/**
 * @desc    Get current company usage
 * @route   GET /api/company-billing/current-usage
 * @access  Company Admin
 */
const myCurrentUsage = asyncHandler(async (req, res) => {
  console.log("\n========== MY CURRENT USAGE START ==========\n");

  // =====================================================
  // Get Company ID
  // =====================================================

  const companyId =
    req.user?.company?._id?.toString?.() ||
    req.user?.company?.toString?.() ||
    req.user?.company;

  if (!companyId) {
    res.status(403);

    throw new Error("Company not found");
  }

  // =====================================================
  // Get Active Subscription
  // =====================================================

  const subscription = await CompanySubscription.findOne({
    company: companyId,

    status: "active",
  })

    .sort({
      createdAt: -1,
    });

  if (!subscription) {
    res.status(404);

    throw new Error("Active subscription not found");
  }

  // =====================================================
  // Count Current Usage
  // =====================================================

  const [managers, dispatchers, technicians] = await Promise.all([
    User.countDocuments({
      company: companyId,

      role: "manager",

      isActive: true,
    }),

    User.countDocuments({
      company: companyId,

      role: "dispatcher",

      isActive: true,
    }),

    User.countDocuments({
      company: companyId,

      role: "technician",

      isActive: true,
    }),
  ]);

  // =====================================================
  // Plan Limits
  // =====================================================

  const PLAN_LIMITS = {
    basic: {
      managers: 1,

      dispatchers: 1,

      technicians: 3,
    },

    pro: {
      managers: 3,

      dispatchers: 3,

      technicians: 10,
    },

    enterprise: {
      managers: 10,

      dispatchers: 10,

      technicians: 50,
    },
  };

  const limits = PLAN_LIMITS[subscription.plan] || PLAN_LIMITS.basic;

  // =====================================================
  // Calculate Extra Usage
  // =====================================================

  const usage = {
    managers,

    dispatchers,

    technicians,
  };

  const extra = {
    managers: Math.max(managers - limits.managers, 0),

    dispatchers: Math.max(dispatchers - limits.dispatchers, 0),

    technicians: Math.max(technicians - limits.technicians, 0),
  };

  // =====================================================
  // Usage Percentage
  // =====================================================

  const percentage = {
    managers:
      limits.managers > 0 ? Math.round((managers / limits.managers) * 100) : 0,

    dispatchers:
      limits.dispatchers > 0
        ? Math.round((dispatchers / limits.dispatchers) * 100)
        : 0,

    technicians:
      limits.technicians > 0
        ? Math.round((technicians / limits.technicians) * 100)
        : 0,
  };

  // =====================================================
  // Additional Charges Estimate
  // =====================================================

  const EXTRA_PRICES = {
    managers: 500,

    dispatchers: 400,

    technicians: 300,
  };

  const additionalMonthlyCost =
    extra.managers * EXTRA_PRICES.managers +
    extra.dispatchers * EXTRA_PRICES.dispatchers +
    extra.technicians * EXTRA_PRICES.technicians;

  // =====================================================
  // Response
  // =====================================================

  res.status(200).json({
    success: true,

    data: {
      plan: {
        name: subscription.plan,

        status: subscription.status,
      },

      usage,

      limits,

      extraUsage: extra,

      usagePercentage: percentage,

      additionalMonthlyCost,
    },
  });

  console.log("\n========== MY CURRENT USAGE END ==========\n");
});

export { myInvoices, myCurrentPlan, myCurrentUsage };
