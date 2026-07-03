import mongoose from "mongoose";

const { Schema } = mongoose;

const companySchema = new Schema(
  {
    // =========================
    // Basic Info
    // =========================
    name: {
      type: String,
      required: true,
      trim: true
    },

    legalName: {
      type: String,
      trim: true
    },

    // =========================
    // Contact Info
    // =========================
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"]
    },

    phone: {
      type: String,
      required: true,
      trim: true
    },

    website: {
      type: String,
      trim: true
    },

    // =========================
    // ⭐ TENANT ROUTING (IMPORTANT)
    // =========================

    // Internal SaaS route:
    // https://ourhvac.com/company-slug
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    // Optional future support for real domains:
    // abc.com, xyz.com
    domain: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true
    },

    // =========================
    // Address (HQ / Office)
    // =========================
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      pincode: { type: String, trim: true },
      country: { type: String, default: "USA" }
    },

    // =========================
    // Branding
    // =========================
    logoUrl: String,

    brand: {
      primaryColor: String,
      secondaryColor: String,
      faviconUrl: String
    },

    // =========================
    // Business Settings
    // =========================
    timezone: {
      type: String,
      default: "Asia/Kolkata"
    },

    currency: {
      type: String,
      default: "INR"
    },

    // =========================
    // Subscription / SaaS Control
    // =========================
    plan: {
      type: String,
      enum: ["free", "basic", "pro", "enterprise"],
      default: "free"
    },

    subscriptionStatus: {
      type: String,
      enum: ["trial", "active", "past_due", "cancelled"],
      default: "trial"
    },

    trialEndsAt: Date,

    // =========================
    // Operational Settings
    // =========================
    settings: {
      allowOnlineBooking: {
        type: Boolean,
        default: true
      },

      autoAssignTechnician: {
        type: Boolean,
        default: false
      },

      defaultJobDurationMinutes: {
        type: Number,
        default: 60
      },

      enableInvoicing: {
        type: Boolean,
        default: true
      },

      enablePayments: {
        type: Boolean,
        default: true
      }
    },

    // =========================
    // Status
    // =========================
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

// =========================
// Indexes
// =========================

// Required for SaaS routing (ourhvac.com/company-slug)
companySchema.index({ slug: 1 }, { unique: true });

// Optional custom domain support (future-proof)
companySchema.index({ domain: 1 }, { unique: true, sparse: true });

// Unique company email
companySchema.index({ email: 1 }, { unique: true });

export default mongoose.model("Company", companySchema);