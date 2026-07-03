import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    sku: {
      type: String,
      trim: true,
      default: null,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "USD",
    },

    taxRate: {
      type: Number,
      default: 0, // percentage (e.g. 10 = 10%)
    },

    unit: {
      type: String,
      default: "pcs", // pcs, hour, kg, etc.
    },

    category: {
      type: String,
      default: "general",
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    isTaxable: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Prevent duplicate item names per company
 */
itemSchema.index({ company: 1, name: 1 }, { unique: true });

export default mongoose.model("Item", itemSchema);