import mongoose from "mongoose";

const invoiceLineSchema = new mongoose.Schema(
  {
    description: String,

    type: {
      type: String,
      enum: [
        "base_plan",
        "extra_manager",
        "extra_dispatcher",
        "extra_technician",
      ],
    },

    quantity: Number,

    unitPrice: Number,

    amount: Number,
  },
  {
    _id: false,
  },
);

// =====================================================
// Billing Address Snapshot
// =====================================================

const billingAddressSchema = new mongoose.Schema(
  {
    addressLine1: String,

    addressLine2: String,

    city: String,

    district: String,

    state: String,

    stateCode: String,

    country: {
      type: String,
      default: "India",
    },

    pincode: String,
  },
  {
    _id: false,
  },
);

const billingInvoiceSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },

    subscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CompanySubscription",
    },

    invoiceNumber: {
      type: String,
      unique: true,
    },

    invoiceDate: Date,

    billingPeriodStart: Date,

    billingPeriodEnd: Date,

    dueDate: Date,

    status: {
      type: String,
      enum: ["pending", "paid", "overdue", "cancelled"],
      default: "pending",
    },

    // =====================================================
    // Customer GST Snapshot
    // Captured at invoice generation time
    // =====================================================

    companyName: {
      type: String,
      required: true,
    },

    gstin: {
      type: String,
      uppercase: true,
      trim: true,
    },

    stateCode: {
      type: String,
      trim: true,
    },

    billingAddress: billingAddressSchema,

    // =====================================================
    // Snapshot of users at billing time
    // =====================================================

    managers: Number,

    dispatchers: Number,

    technicians: Number,

    basePlanPrice: Number,

    extraManagers: Number,

    extraDispatchers: Number,

    extraTechnicians: Number,

    lineItems: [invoiceLineSchema],

    // =====================================================
    // Amount before GST
    // =====================================================

    subtotal: {
      type: Number,
      default: 0,
    },

    // =====================================================
    // GST Details (India)
    // =====================================================

    gst: {
      percentage: {
        type: Number,
        default: 18,
      },

      amount: {
        type: Number,
        default: 0,
      },

      type: {
        type: String,
        enum: ["CGST_SGST", "IGST"],
        default: "CGST_SGST",
      },

      cgst: {
        type: Number,
        default: 0,
      },

      sgst: {
        type: Number,
        default: 0,
      },

      igst: {
        type: Number,
        default: 0,
      },
    },

    // =====================================================
    // Final payable amount including GST
    // =====================================================

    totalAmountWithGST: {
      type: Number,
      default: 0,
    },

    paidAmount: {
      type: Number,
      default: 0,
    },

    paidAt: Date,

    notes: String,
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("BillingInvoice", billingInvoiceSchema);
