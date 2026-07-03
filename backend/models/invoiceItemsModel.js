import mongoose from "mongoose";

const { Schema } = mongoose;

/**
 * Invoice Line Items
 */
const invoiceItemSchema = new Schema(
  {
    description: {
      type: String,
      required: [true, "Item description is required"],
      trim: true,
      maxlength: 500,
    },

    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be at least 1"],
    },

    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },

    /**
     * Optional line total
     * Auto-calculated before save
     */
    lineTotal: {
      type: Number,
      default: 0,
    },
  },
  { _id: false },
);

/**
 * Main Invoice Schema
 */
const invoiceSchema = new Schema(
  {
    /**
     * Multi-tenant company ownership
     */
    company: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },

    /**
     * Related HVAC job
     */
    job: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },

    /**
     * Customer being billed
     */
    customer: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },

    /**
     * Human-readable invoice number
     * Example: INV-2026-0001
     */
    invoiceNumber: {
      type: String,
      unique: true,
      index: true,
    },

    /**
     * Invoice items
     */
    items: {
      type: [invoiceItemSchema],
      validate: {
        validator: function (items) {
          return items && items.length > 0;
        },
        message: "Invoice must contain at least one item",
      },
    },

    /**
     * Sum before taxes/discounts
     */
    subtotal: {
      type: Number,
      default: 0,
      min: 0,
    },

    /**
     * Discount amount
     */
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },

    /**
     * Tax percentage
     * Example: 8.25
     */
    taxRate: {
      type: Number,
      default: 0,
      min: 0,
    },

    /**
     * Calculated tax amount
     */
    taxAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    /**
     * Final amount customer pays
     */
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    /**
     * Invoice status lifecycle
     */
    status: {
      type: String,
      enum: ["draft", "sent", "paid", "overdue", "cancelled"],
      default: "draft",
      index: true,
    },

    /**
     * Payment tracking
     */
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "bank_transfer", "online"],
      default: "cash",
    },

    dueDate: {
      type: Date,
      required: true,
    },

    paidAt: {
      type: Date,
    },

    /**
     * Optional customer/admin notes
     */
    notes: {
      type: String,
      trim: true,
      maxlength: 2000,
    },

    /**
     * Currency support
     */
    currency: {
      type: String,
      default: "USD",
      uppercase: true,
    },
  },
  {
    timestamps: true,
  },
);

/**
 * Compound indexes
 */
invoiceSchema.index({ company: 1, status: 1 });
invoiceSchema.index({ company: 1, customer: 1 });
invoiceSchema.index({ company: 1, createdAt: -1 });

/**
 * Auto-calculate totals before validation/save
 */
invoiceSchema.pre("validate", async function (next) {
  try {
    /**
     * Generate line totals
     */
    this.items.forEach((item) => {
      item.lineTotal = item.quantity * item.price;
    });

    /**
     * Calculate subtotal
     */
    this.subtotal = this.items.reduce((sum, item) => sum + item.lineTotal, 0);

    /**
     * Calculate tax
     */
    const taxableAmount = this.subtotal - this.discount;

    this.taxAmount = (taxableAmount * this.taxRate) / 100;

    /**
     * Final total
     */
    this.totalAmount = taxableAmount + this.taxAmount;

    /**
     * Prevent negative totals
     */
    if (this.totalAmount < 0) {
      this.totalAmount = 0;
    }

    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Auto-generate invoice number
 */
invoiceSchema.pre("save", async function (next) {
  try {
    if (!this.invoiceNumber) {
      const count = await mongoose.model("Invoice").countDocuments({
        company: this.company,
      });

      const year = new Date().getFullYear();

      this.invoiceNumber = `INV-${year}-${String(count + 1).padStart(4, "0")}`;
    }

    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Virtual for remaining balance
 */
invoiceSchema.virtual("isPaid").get(function () {
  return this.status === "paid";
});

/**
 * Include virtuals in JSON responses
 */
invoiceSchema.set("toJSON", {
  virtuals: true,
});

invoiceSchema.set("toObject", {
  virtuals: true,
});

export default mongoose.model("Invoice", invoiceSchema);
