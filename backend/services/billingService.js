// services/billingService.js

import Company from "../models/companyModel.js";
import CompanySubscription from "../models/companySubscriptionModel.js";
import BillingInvoice from "../models/billingInvoiceModel.js";
import User from "../models/userModel.js";

// =====================================================
// Pricing Configuration
// Later this can move to Plan collection
// =====================================================

const BILLING_CONFIG = {
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

// =====================================================
// Count Company Users
// =====================================================

const countCompanyUsers = async (companyId) => {
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

  return {
    managers,
    dispatchers,
    technicians,
  };
};

// =====================================================
// Calculate GST
// =====================================================

const calculateGST = (subtotal, company) => {
  // Default GST rate for SaaS services in India
  const gstPercentage = 18;

  const gstAmount = (subtotal * gstPercentage) / 100;

  /**
   * TODO:
   * Compare company.stateCode with your business stateCode
   * to decide:
   *
   * Same state:
   *   CGST 9%
   *   SGST 9%
   *
   * Different state:
   *   IGST 18%
   */

  const cgst = gstAmount / 2;
  const sgst = gstAmount / 2;

  return {
    percentage: gstPercentage,

    amount: gstAmount,

    type: "CGST_SGST",

    cgst,

    sgst,

    igst: 0,
  };
};

// =====================================================
// Calculate Invoice Amount
// =====================================================

const calculateBilling = (plan, userCount, company) => {
  const config = BILLING_CONFIG[plan];

  if (!config) {
    throw new Error("Billing plan configuration not found");
  }

  const extraManagers = Math.max(
    userCount.managers - config.included.manager,
    0,
  );

  const extraDispatchers = Math.max(
    userCount.dispatchers - config.included.dispatcher,
    0,
  );

  const extraTechnicians = Math.max(
    userCount.technicians - config.included.technician,
    0,
  );

  const lineItems = [
    {
      description: `${plan.toUpperCase()} Plan`,
      type: "base_plan",
      quantity: 1,
      unitPrice: config.price,
      amount: config.price,
    },
  ];

  if (extraManagers > 0) {
    lineItems.push({
      description: "Additional Managers",
      type: "extra_manager",
      quantity: extraManagers,
      unitPrice: config.extra.manager,
      amount: extraManagers * config.extra.manager,
    });
  }

  if (extraDispatchers > 0) {
    lineItems.push({
      description: "Additional Dispatchers",
      type: "extra_dispatcher",
      quantity: extraDispatchers,
      unitPrice: config.extra.dispatcher,
      amount: extraDispatchers * config.extra.dispatcher,
    });
  }

  if (extraTechnicians > 0) {
    lineItems.push({
      description: "Additional Technicians",
      type: "extra_technician",
      quantity: extraTechnicians,
      unitPrice: config.extra.technician,
      amount: extraTechnicians * config.extra.technician,
    });
  }

  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);

  const gst = calculateGST(subtotal, company);

  const totalAmountWithGST = subtotal + gst.amount;

  return {
    managers: userCount.managers,

    dispatchers: userCount.dispatchers,

    technicians: userCount.technicians,

    basePlanPrice: config.price,

    extraManagers,

    extraDispatchers,

    extraTechnicians,

    lineItems,

    subtotal,

    gst,

    totalAmountWithGST,
  };
};

// =====================================================
// Generate Invoice Number
// =====================================================

const generateInvoiceNumber = (companyName) => {
  const prefix = companyName.substring(0, 3).toUpperCase();

  return "INV-" + prefix + "-" + Date.now();
};

// =====================================================
// Get Billing Period
// =====================================================

const getBillingPeriod = (nextBillingDate) => {
  const end = new Date(nextBillingDate);

  const start = new Date(nextBillingDate);

  start.setMonth(start.getMonth() - 1);

  return {
    start,
    end,
  };
};

// =====================================================
// Prepare GST Customer Snapshot
// =====================================================

const prepareBillingSnapshot = (company) => {
  return {
    companyName: company.name,

    gstin: company.gstin || null,

    stateCode: company.stateCode || null,

    billingAddress: {
      addressLine1: company.addressLine1 || "",
      addressLine2: company.addressLine2 || "",
      city: company.city || "",
      district: company.district || "",
      state: company.state || "",
      stateCode: company.stateCode || "",
      country: company.country || "India",
      pincode: company.pincode || "",
    },
  };
};

// =====================================================
// Generate Invoice Data
// Used by generateInvoice controller
// =====================================================

const prepareInvoiceData = async (companyId) => {
  const company = await Company.findById(companyId);

  if (!company) {
    throw new Error("Company not found");
  }

  const subscription = await CompanySubscription.findOne({
    company: companyId,
    status: "active",
  });

  if (!subscription) {
    throw new Error("Active subscription not found");
  }

  const users = await countCompanyUsers(companyId);

  const billing = calculateBilling(subscription.plan, users, company);

  const period = getBillingPeriod(subscription.nextBillingDate);

  const snapshot = prepareBillingSnapshot(company);

  return {
    company,

    subscription,

    billing,

    snapshot,

    period,
  };
};

// =====================================================
// Create Invoice
// =====================================================

const createInvoice = async (companyId) => {
  const {
    company,

    subscription,

    billing,

    snapshot,

    period,
  } = await prepareInvoiceData(companyId);

  const invoice = await BillingInvoice.create({
    company: company._id,

    subscription: subscription._id,

    invoiceNumber: generateInvoiceNumber(company.name),

    invoiceDate: new Date(),

    billingPeriodStart: period.start,

    billingPeriodEnd: period.end,

    dueDate: period.end,

    // GST customer snapshot
    ...snapshot,

    // Billing calculation
    ...billing,

    status: "pending",
  });

  // Move billing date forward
  const nextBillingDate = new Date(subscription.nextBillingDate);

  nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

  subscription.nextBillingDate = nextBillingDate;

  await subscription.save();

  return invoice;
};

// =====================================================
// Regenerate Existing Invoice
// =====================================================

const regenerateInvoice = async (invoiceId) => {
  const invoice = await BillingInvoice.findById(invoiceId);

  if (!invoice) {
    throw new Error("Invoice not found");
  }

  const { company, billing, snapshot } = await prepareInvoiceData(
    invoice.company,
  );

  Object.assign(
    invoice,

    billing,

    {
      // Preserve invoice customer snapshot
      companyName: invoice.companyName || snapshot.companyName || company.name,

      gstin: invoice.gstin || snapshot.gstin || "",

      stateCode: invoice.stateCode || snapshot.stateCode || "",

      billingAddress: invoice.billingAddress || snapshot.billingAddress,

      // Preserve payment details
      paidAmount: invoice.paidAmount,

      paidAt: invoice.paidAt,
    },
  );

  await invoice.save();

  return invoice;
};

export {
  countCompanyUsers,
  calculateBilling,
  prepareInvoiceData,
  createInvoice,
  regenerateInvoice,
  prepareBillingSnapshot,
};
