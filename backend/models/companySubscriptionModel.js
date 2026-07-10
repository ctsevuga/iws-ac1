import mongoose from "mongoose";

const companySubscriptionSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      unique: true,
      index: true,
    },

    plan: {
      type: String,
      enum: ["basic", "pro", "enterprise"],
      default: "basic",
    },

    status: {
      type: String,
      enum: ["trial", "active", "paused", "cancelled"],
      default: "active",
    },

    billingCycle: {
      type: String,
      enum: ["monthly", "yearly"],
      default: "monthly",
    },

    billingDay: {
      type: Number,
      required: true,
      min: 1,
      max: 31,
    },

    startedAt: {
      type: Date,
      required: true,
    },

    nextBillingDate: {
      type: Date,
      required: true,
      index: true,
    },

    cancelledAt: Date,

    autoRenew: {
      type: Boolean,
      default: true,
    },

    currency: {
      type: String,
      default: "INR",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "CompanySubscription",
  companySubscriptionSchema
);