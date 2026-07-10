import asyncHandler from "../middleware/asyncHandler.js";
import Company from "../models/companyModel.js";
import CompanySubscription from "../models/companySubscriptionModel.js";

/**
 * @desc    Create subscription for a company
 * @route   POST /api/subscriptions
 * @access  Super Admin
 */
const createSubscription = asyncHandler(async (req, res) => {
  console.log("\n=========== CREATE SUBSCRIPTION START ===========\n");

  const {
    company,
    plan = "basic",
    billingCycle = "monthly",
    status = "active",
    autoRenew = true,
    currency = "INR",
  } = req.body;

  // ============================================
  // Validate Company
  // ============================================

  if (!company) {
    res.status(400);
    throw new Error("Company is required");
  }

  const companyDoc = await Company.findById(company);

  if (!companyDoc) {
    res.status(404);
    throw new Error("Company not found");
  }

  console.log("Company :", companyDoc.name);

  // ============================================
  // Check Existing Subscription
  // ============================================

  const existingSubscription = await CompanySubscription.findOne({
    company,
  });

  if (existingSubscription) {
    res.status(400);
    throw new Error("Subscription already exists for this company");
  }

  // ============================================
  // Billing Dates
  // ============================================

  const startedAt = companyDoc.createdAt;

  const billingDay = startedAt.getDate();

  const nextBillingDate = new Date(startedAt);

  nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

  // Handle month overflow (29/30/31)
  if (nextBillingDate.getDate() !== billingDay) {
    nextBillingDate.setDate(0);
  }

  // ============================================
  // Create Subscription
  // ============================================

  const subscription = await CompanySubscription.create({
    company,
    plan,
    status,
    billingCycle,
    billingDay,
    startedAt,
    nextBillingDate,
    autoRenew,
    currency,
  });

  console.log("Subscription Created :", subscription._id);

  const populatedSubscription =
    await CompanySubscription.findById(subscription._id)
      .populate(
        "company",
        "name email slug createdAt"
      );

  console.log("\n=========== CREATE SUBSCRIPTION END ===========\n");

  res.status(201).json({
    success: true,
    message: "Subscription created successfully.",
    data: populatedSubscription,
  });
});

/**
 * @desc    Update company subscription
 * @route   PUT /api/subscriptions/:companyId
 * @access  Super Admin
 */



const updateSubscription = asyncHandler(async (req, res) => {
  console.log("\n=========== UPDATE SUBSCRIPTION START ===========\n");

  const { companyId } = req.params;

  const {
    plan,
    status,
    billingCycle,
    autoRenew,
    currency,
    nextBillingDate,
    cancelledAt,
  } = req.body;

  // =====================================================
  // Validate Company
  // =====================================================

  const company = await Company.findById(companyId);

  if (!company) {
    res.status(404);
    throw new Error("Company not found");
  }

  console.log("Company :", company.name);

  // =====================================================
  // Find Subscription
  // =====================================================

  const subscription = await CompanySubscription.findOne({
    company: companyId,
  });

  if (!subscription) {
    res.status(404);
    throw new Error("Subscription not found");
  }

  // =====================================================
  // Update Fields
  // =====================================================

  if (plan) {
    subscription.plan = plan;
  }

  if (status) {
    subscription.status = status;
  }

  if (billingCycle) {
    subscription.billingCycle = billingCycle;
  }

  if (typeof autoRenew === "boolean") {
    subscription.autoRenew = autoRenew;
  }

  if (currency) {
    subscription.currency = currency;
  }

  if (nextBillingDate) {
    subscription.nextBillingDate = new Date(nextBillingDate);
  }

  if (cancelledAt) {
    subscription.cancelledAt = new Date(cancelledAt);
  }

  // =====================================================
  // Auto Set Cancelled Date
  // =====================================================

  if (
    status === "cancelled" &&
    !subscription.cancelledAt
  ) {
    subscription.cancelledAt = new Date();
  }

  // =====================================================
  // Remove Cancelled Date when Reactivated
  // =====================================================

  if (
    status &&
    status !== "cancelled"
  ) {
    subscription.cancelledAt = undefined;
  }

  // =====================================================
  // Save
  // =====================================================

  await subscription.save();

  const updatedSubscription =
    await CompanySubscription.findById(subscription._id)
      .populate(
        "company",
        "name email slug createdAt"
      );

  console.log("Subscription Updated :", subscription._id);

  console.log("\n=========== UPDATE SUBSCRIPTION END ===========\n");

  res.status(200).json({
    success: true,
    message: "Subscription updated successfully.",
    data: updatedSubscription,
  });
});

/**
 * @desc    Get subscription by company
 * @route   GET /api/subscriptions/:companyId
 * @access  Super Admin
 */



const getSubscription = asyncHandler(async (req, res) => {
  console.log("\n=========== GET SUBSCRIPTION START ===========\n");

  const { companyId } = req.params;

  // ============================================
  // Validate Company
  // ============================================

  const company = await Company.findById(companyId);

  if (!company) {
    res.status(404);
    throw new Error("Company not found");
  }

  console.log("Company :", company.name);

  // ============================================
  // Get Subscription
  // ============================================

  const subscription = await CompanySubscription.findOne({
    company: companyId,
  }).populate(
    "company",
    "name legalName email phone slug plan subscriptionStatus createdAt"
  );

  if (!subscription) {
    res.status(404);
    throw new Error("Subscription not found");
  }

  console.log("Subscription :", subscription._id);

  // ============================================
  // Response
  // ============================================

  res.status(200).json({
    success: true,
    data: {
      _id: subscription._id,

      company: subscription.company,

      plan: subscription.plan,

      status: subscription.status,

      billingCycle: subscription.billingCycle,

      billingDay: subscription.billingDay,

      startedAt: subscription.startedAt,

      nextBillingDate: subscription.nextBillingDate,

      autoRenew: subscription.autoRenew,

      currency: subscription.currency,

      cancelledAt: subscription.cancelledAt,

      createdAt: subscription.createdAt,

      updatedAt: subscription.updatedAt,
    },
  });

  console.log("\n=========== GET SUBSCRIPTION END ===========\n");
});

export {createSubscription,
        updateSubscription,
        getSubscription };
