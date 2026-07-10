// controllers/billingDashboardController.js

import asyncHandler from "../middleware/asyncHandler.js";
import Company from "../models/companyModel.js";
import User from "../models/userModel.js";
import BillingInvoice from "../models/billingInvoiceModel.js";

/**
 * @desc    Get Super Admin Billing Dashboard
 * @route   GET /api/billing/dashboard
 * @access  Super Admin
 */
const getBillingDashboard = asyncHandler(async (req, res) => {
  console.log("\n========== BILLING DASHBOARD START ==========\n");

  // =====================================================
  // Company Statistics
  // =====================================================

  const totalCompanies = await Company.countDocuments();

  const activeCompanies = await Company.countDocuments({
    isActive: true,
  });

  const trialCompanies = await Company.countDocuments({
    subscriptionStatus: "trial",
  });

  const paidCompanies = await Company.countDocuments({
    subscriptionStatus: "active",
  });

  // =====================================================
  // Invoice Statistics
  // =====================================================

  const invoiceStats = await BillingInvoice.aggregate([
    {
      $group: {
        _id: "$status",

        count: {
          $sum: 1,
        },

        amount: {
          $sum: "$total",
        },
      },
    },
  ]);

  let invoiceSummary = {
    pending: {
      count: 0,
      amount: 0,
    },

    paid: {
      count: 0,
      amount: 0,
    },

    cancelled: {
      count: 0,
      amount: 0,
    },
  };

  invoiceStats.forEach((item) => {
    if (invoiceSummary[item._id]) {
      invoiceSummary[item._id] = {
        count: item.count,

        amount: item.amount,
      };
    }
  });

  // =====================================================
  // Revenue Calculation
  // =====================================================

  const revenueResult = await BillingInvoice.aggregate([
    {
      $match: {
        status: "paid",
      },
    },

    {
      $group: {
        _id: null,

        totalRevenue: {
          $sum: "$total",
        },
      },
    },
  ]);

  const totalRevenue = revenueResult[0]?.totalRevenue || 0;

  // =====================================================
  // Current Month Revenue
  // =====================================================

  const now = new Date();

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const monthRevenue = await BillingInvoice.aggregate([
    {
      $match: {
        status: "paid",

        paidAt: {
          $gte: monthStart,
        },
      },
    },

    {
      $group: {
        _id: null,

        amount: {
          $sum: "$total",
        },
      },
    },
  ]);

  const currentMonthRevenue = monthRevenue[0]?.amount || 0;

  // =====================================================
  // MRR Calculation
  // Active monthly invoices
  // =====================================================

  const mrrResult = await BillingInvoice.aggregate([
    {
      $match: {
        status: {
          $in: ["paid", "pending"],
        },

        billingPeriodStart: {
          $lte: now,
        },

        billingPeriodEnd: {
          $gte: now,
        },
      },
    },

    {
      $group: {
        _id: null,

        mrr: {
          $sum: "$total",
        },
      },
    },
  ]);

  const monthlyRecurringRevenue = mrrResult[0]?.mrr || 0;

  // =====================================================
  // User Usage Summary
  // =====================================================

  const userSummary = await User.aggregate([
    {
      $match: {
        isActive: true,
      },
    },

    {
      $group: {
        _id: "$role",

        count: {
          $sum: 1,
        },
      },
    },
  ]);

  const users = {
    managers: 0,

    dispatchers: 0,

    technicians: 0,
  };

  userSummary.forEach((item) => {
    if (users[item._id] !== undefined) {
      users[item._id] = item.count;
    }
  });

  // =====================================================
  // Recent Invoices
  // =====================================================

  const recentInvoices = await BillingInvoice.find()

    .populate("company", "name email")

    .sort({
      createdAt: -1,
    })

    .limit(10)

    .select(
      `
        invoiceNumber
        total
        status
        invoiceDate
        company
        `,
    );

  console.log("\n========== BILLING DASHBOARD END ==========\n");

  // =====================================================
  // Response
  // =====================================================

  res.status(200).json({
    success: true,

    data: {
      companies: {
        total: totalCompanies,

        active: activeCompanies,

        trial: trialCompanies,

        paid: paidCompanies,
      },

      revenue: {
        total: totalRevenue,

        currentMonth: currentMonthRevenue,

        mrr: monthlyRecurringRevenue,
      },

      invoices: invoiceSummary,

      users,

      recentInvoices,
    },
  });
});

/**
 * @desc    Get company billing history
 * @route   GET /api/billing/company/:companyId/history
 * @access  Super Admin
 */
const getCompanyBillingHistory = asyncHandler(async (req, res) => {
  console.log("\n========== COMPANY BILLING HISTORY START ==========\n");

  const { companyId } = req.params;

  // =====================================================
  // Validate Company ID
  // =====================================================

  if (!companyId) {
    res.status(400);

    throw new Error("Company ID is required");
  }

  // =====================================================
  // Fetch Company
  // =====================================================

  const company = await Company.findById(companyId).select(
    `
        name
        legalName
        email
        phone
        plan
        subscriptionStatus
        createdAt
        currency
        `,
  );

  if (!company) {
    res.status(404);

    throw new Error("Company not found");
  }

  // =====================================================
  // Fetch Subscription
  // =====================================================

  const subscription = await CompanySubscription.findOne({
    company: companyId,
  }).sort({
    createdAt: -1,
  });

  // =====================================================
  // Invoice History
  // =====================================================

  const invoices = await BillingInvoice.find({
    company: companyId,
  })

    .sort({
      invoiceDate: -1,
    })

    .select(
      `
        invoiceNumber
        invoiceDate
        billingPeriodStart
        billingPeriodEnd
        total
        subtotal
        tax
        paidAmount
        status
        paidAt
        paymentMethod
        createdAt
        `,
    );

  // =====================================================
  // Billing Summary
  // =====================================================

  const billingSummary = await BillingInvoice.aggregate([
    {
      $match: {
        company: company._id,
      },
    },

    {
      $group: {
        _id: null,

        totalInvoices: {
          $sum: 1,
        },

        totalBilled: {
          $sum: "$total",
        },

        totalPaid: {
          $sum: "$paidAmount",
        },

        outstanding: {
          $sum: {
            $subtract: ["$total", "$paidAmount"],
          },
        },
      },
    },
  ]);

  const summary = billingSummary[0] || {
    totalInvoices: 0,

    totalBilled: 0,

    totalPaid: 0,

    outstanding: 0,
  };

  // =====================================================
  // Monthly Billing Trend
  // =====================================================

  const monthlyTrend = await BillingInvoice.aggregate([
    {
      $match: {
        company: company._id,
      },
    },

    {
      $group: {
        _id: {
          year: {
            $year: "$invoiceDate",
          },

          month: {
            $month: "$invoiceDate",
          },
        },

        amount: {
          $sum: "$total",
        },

        count: {
          $sum: 1,
        },
      },
    },

    {
      $sort: {
        "_id.year": 1,

        "_id.month": 1,
      },
    },
  ]);

  console.log("Invoices:", invoices.length);

  console.log("\n========== COMPANY BILLING HISTORY END ==========\n");

  // =====================================================
  // Response
  // =====================================================

  res.status(200).json({
    success: true,

    data: {
      company,

      subscription,

      summary: {
        totalInvoices: summary.totalInvoices,

        totalBilled: summary.totalBilled,

        totalPaid: summary.totalPaid,

        outstanding: summary.outstanding,
      },

      invoices,

      monthlyTrend,
    },
  });
});

/**
 * @desc    Get monthly revenue report
 * @route   GET /api/billing/dashboard/monthly-revenue
 * @access  Super Admin
 */
const getMonthlyRevenue = asyncHandler(async (req, res) => {
  console.log("\n========== MONTHLY REVENUE START ==========\n");

  const { year } = req.query;

  // =====================================================
  // Default Current Year
  // =====================================================

  const selectedYear = Number(year) || new Date().getFullYear();

  console.log("Revenue Year:", selectedYear);

  // =====================================================
  // Date Range
  // =====================================================

  const startDate = new Date(selectedYear, 0, 1);

  const endDate = new Date(selectedYear + 1, 0, 1);

  // =====================================================
  // Aggregate Revenue
  // =====================================================

  const revenue = await BillingInvoice.aggregate([
    {
      $match: {
        status: "paid",

        paidAt: {
          $gte: startDate,

          $lt: endDate,
        },
      },
    },

    {
      $group: {
        _id: {
          month: {
            $month: "$paidAt",
          },
        },

        revenue: {
          $sum: "$total",
        },

        invoices: {
          $sum: 1,
        },
      },
    },

    {
      $sort: {
        "_id.month": 1,
      },
    },
  ]);

  // =====================================================
  // Fill Empty Months
  // =====================================================

  const monthlyRevenue = [];

  for (let month = 1; month <= 12; month++) {
    const found = revenue.find((item) => item._id.month === month);

    monthlyRevenue.push({
      month,

      monthName: new Date(selectedYear, month - 1, 1).toLocaleString("en-US", {
        month: "short",
      }),

      revenue: found ? found.revenue : 0,

      invoices: found ? found.invoices : 0,
    });
  }

  // =====================================================
  // Total Year Revenue
  // =====================================================

  const totalRevenue = monthlyRevenue.reduce(
    (sum, item) => sum + item.revenue,

    0,
  );

  console.log("Total Revenue:", totalRevenue);

  console.log("\n========== MONTHLY REVENUE END ==========\n");

  // =====================================================
  // Response
  // =====================================================

  res.status(200).json({
    success: true,

    data: {
      year: selectedYear,

      totalRevenue,

      monthlyRevenue,
    },
  });
});

/**
 * @desc    Get outstanding invoices
 * @route   GET /api/billing/dashboard/outstanding-invoices
 * @access  Super Admin
 */
const getOutstandingInvoices = asyncHandler(async (req, res) => {
  console.log("\n========== OUTSTANDING INVOICES START ==========\n");

  const { search, company, page = 1, limit = 20 } = req.query;

  // =====================================================
  // Pagination
  // =====================================================

  const pageNumber = Number(page);

  const limitNumber = Number(limit);

  const skip = (pageNumber - 1) * limitNumber;

  // =====================================================
  // Build Query
  // =====================================================

  const query = {
    // Pending invoices
    // Partially paid invoices

    status: {
      $in: ["pending"],
    },
  };

  if (company) {
    query.company = company;
  }

  // =====================================================
  // Search
  // =====================================================

  let finalQuery = query;

  if (search) {
    finalQuery = {
      ...query,

      $or: [
        {
          invoiceNumber: {
            $regex: search,
            $options: "i",
          },
        },
      ],
    };
  }

  // =====================================================
  // Fetch Outstanding Invoices
  // =====================================================

  const invoices = await BillingInvoice.find(finalQuery)

    .populate(
      "company",
      `
        name
        email
        phone
        slug
        `,
    )

    .sort({
      dueDate: 1,
    })

    .skip(skip)

    .limit(limitNumber);

  // =====================================================
  // Calculate Outstanding Amount
  // =====================================================

  const outstandingSummary = await BillingInvoice.aggregate([
    {
      $match: finalQuery,
    },

    {
      $group: {
        _id: null,

        totalInvoices: {
          $sum: 1,
        },

        totalAmount: {
          $sum: "$total",
        },

        totalPaid: {
          $sum: "$paidAmount",
        },

        outstandingAmount: {
          $sum: {
            $subtract: ["$total", "$paidAmount"],
          },
        },
      },
    },
  ]);

  const summary = outstandingSummary[0] || {
    totalInvoices: 0,

    totalAmount: 0,

    totalPaid: 0,

    outstandingAmount: 0,
  };

  // =====================================================
  // Add Overdue Flag
  // =====================================================

  const today = new Date();

  const formattedInvoices = invoices.map((invoice) => ({
    _id: invoice._id,

    invoiceNumber: invoice.invoiceNumber,

    company: invoice.company,

    invoiceDate: invoice.invoiceDate,

    dueDate: invoice.dueDate,

    amount: {
      total: invoice.total,

      paid: invoice.paidAmount,

      balance: invoice.total - invoice.paidAmount,
    },

    status: invoice.status,

    isOverdue: invoice.dueDate && new Date(invoice.dueDate) < today,

    createdAt: invoice.createdAt,
  }));

  // =====================================================
  // Total Count
  // =====================================================

  const total = await BillingInvoice.countDocuments(finalQuery);

  console.log("Outstanding invoices:", invoices.length);

  console.log("\n========== OUTSTANDING INVOICES END ==========\n");

  // =====================================================
  // Response
  // =====================================================

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

export {
  getBillingDashboard,
  getCompanyBillingHistory,
  getMonthlyRevenue,
  getOutstandingInvoices,
};
