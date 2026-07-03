import mongoose from "mongoose";

const { Schema } = mongoose;

/**
 * =========================================================
 * SUB SCHEMAS
 * =========================================================
 */

/**
 * Customer / service address snapshot
 * Keeps historical data even if customer updates profile later
 */

const addressSchema = new Schema(
  {
    street: {
      type: String,
      trim: true,
    },

    city: {
      type: String,
      trim: true,
    },

    state: {
      type: String,
      trim: true,
    },

    pincode: {
      type: String,
      trim: true,
    },

    country: {
      type: String,
      default: "India",
      trim: true,
    },

    landmark: {
      type: String,
      trim: true,
    },

    location: {
      lat: Number,
      lng: Number,
    },
  },
  {
    _id: false,
  }
);

/**
 * =========================================================
 * ATTACHMENTS
 * =========================================================
 * Customer photos
 * Technician photos
 * Documents
 */

const attachmentSchema = new Schema(
  {
    url: {
      type: String,
      required: true,
    },

    fileName: {
      type: String,
    },

    mimeType: {
      type: String,
    },

    uploadedBy: {
      type: String,
      enum: ["customer", "admin", "manager", "technician", "dispatcher"],
      required: true,
    },

    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: false,
  }
);

/**
 * =========================================================
 * STATUS TIMELINE
 * =========================================================
 * Helps customer track progress
 */

const timelineSchema = new Schema(
  {
    status: {
      type: String,
      required: true,
    },

    message: {
      type: String,
    },

    updatedBy: {
      type: String,
      enum: ["customer", "admin", "manager", "technician", "dispatcher"],
      default: "system",
    },

    technician: {
      type: Schema.Types.ObjectId,
      ref: "Technician",
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: false,
  }
);

/**
 * =========================================================
 * CUSTOMER COMMUNICATION THREAD
 * =========================================================
 */

const messageSchema = new Schema(
  {
    senderType: {
      type: String,
      enum: ["customer","admin", "manager", "technician", "dispatcher"],
      required: true,
    },

    senderName: {
      type: String,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    attachments: [attachmentSchema],

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: false,
  }
);

/**
 * =========================================================
 * SERVICE REQUEST SCHEMA
 * =========================================================
 */

const serviceRequestSchema = new Schema(
  {
    /**
     * =====================================================
     * MULTI TENANT
     * =====================================================
     */

    company: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },

    /**
     * =====================================================
     * CUSTOMER
     * =====================================================
     */

    customer: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },

    /**
     * Guest request support
     */

    guestRequest: {
      type: Boolean,
      default: false,
    },

    /**
     * =====================================================
     * REQUEST IDENTIFICATION
     * =====================================================
     */

    requestNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    /**
     * =====================================================
     * AREA / DISPATCH
     * =====================================================
     */

    area: {
      type: Schema.Types.ObjectId,
      ref: "Area",
      required: true,
      index: true,
    },

    city: {
    type: Schema.Types.ObjectId,
    ref: "City",
    required: true,
    index: true,
},

    /**
     * =====================================================
     * CUSTOMER SNAPSHOT
     * =====================================================
     * Historical immutable copy
     */

    customerSnapshot: {
      name: String,

      phone: String,

      email: String,

      address: addressSchema,
    },

    /**
     * =====================================================
     * SERVICE ADDRESS
     * =====================================================
     * Can differ from customer profile address
     */

    serviceAddress: addressSchema,

    /**
     * =====================================================
     * REQUEST DETAILS
     * =====================================================
     */

    title: {
      type: String,
      required: true,
      trim: true,
    },

    issueType: {
      type: String,
      enum: [
        "AC Repair",
        "AC Not Working",
        "Water Leakage",
        "AC Installation",
        "Installation",
        "Electrical Problem",
        "Noise Issue",
        "AC Not Cooling",
        "Routine Maintenance",
        "Compressor Issue",
        "Heating Issue",
        "Maintenance",
        "Inspection",
        "Gas Refill",
        "Electrical",
        "Other",
      ],
      required: true,
      index: true,
    },

    requiredSkills: [
      {
        type: String,
        enum: [
          "AC Repair",
          "AC Installation",
          "Heating",
          "Electrical",
          "Maintenance",
        ],
      },
    ],

    description: {
      type: String,
      required: true,
      trim: true,
    },

    /**
     * =====================================================
     * PRIORITY
     * =====================================================
     */

    priority: {
      type: String,
      enum: [
        "low",
        "medium",
        "high",
        "urgent",
      ],
      default: "medium",
      index: true,
    },

    /**
     * =====================================================
     * STATUS
     * =====================================================
     */

    status: {
      type: String,
      enum: [
        "new",
        "pending",
        "assigned",
        "confirmed",
        "in_progress",
        "on_hold",
        "completed",
        "cancelled",
        "closed",
      ],
      default: "new",
      index: true,
    },

    /**
     * =====================================================
     * REQUEST SOURCE
     * =====================================================
     */

    source: {
      type: String,
      enum: [
        "call",
        "admin",
        "WEB",
        "customer_portal",
        "mobile_app",
        "website",
        "phone_call",
        "walk_in",
        "api",
      ],
      default: "customer_portal",
      index: true,
    },

    /**
     * =====================================================
     * CUSTOMER PREFERENCES
     * =====================================================
     */

    preferredDate: {
      type: Date,
      index: true,
    },

    preferredTimeSlot: {
      type: String,
      enum: [
        "morning",
        "afternoon",
        "evening",
        "anytime",
      ],
      default: "anytime",
    },

    /**
     * =====================================================
     * TECHNICIAN ASSIGNMENT
     * =====================================================
     */

    assignedTechnician: {
      type: Schema.Types.ObjectId,
      ref: "Technician",
      default: null,
      index: true,
    },

    assignmentStatus: {
      type: String,
      enum: [
        "pending",
        "assigned",
        "accepted",
        "rejected",
      ],
      default: "pending",
    },

    assignedAt: {
      type: Date,
    },

    /**
     * =====================================================
     * CUSTOMER TRACKING
     * =====================================================
     */

    customerVisible: {
      type: Boolean,
      default: true,
    },

    customerClosed: {
      type: Boolean,
      default: false,
    },

    customerSatisfied: {
      type: Boolean,
    },

    customerFeedback: {
      type: String,
      trim: true,
    },

    customerRating: {
      type: Number,
      min: 1,
      max: 5,
    },

    /**
     * =====================================================
     * MEDIA / ATTACHMENTS
     * =====================================================
     */

    attachments: [attachmentSchema],

    /**
     * =====================================================
     * INTERNAL NOTES
     * =====================================================
     * Hidden from customer
     */

    internalNotes: {
      type: String,
      default: "",
    },

    /**
     * =====================================================
     * CUSTOMER NOTES
     * =====================================================
     * Visible to customer
     */

    customerNotes: {
      type: String,
      default: "",
    },

    /**
     * =====================================================
     * TIMELINE
     * =====================================================
     */

    timeline: [timelineSchema],

    /**
     * =====================================================
     * MESSAGES / CHAT
     * =====================================================
     */

    messages: [messageSchema],

    /**
     * =====================================================
     * SLA / RESPONSE TRACKING
     * =====================================================
     */

    firstResponseAt: {
      type: Date,
    },

    resolvedAt: {
      type: Date,
    },

    closedAt: {
      type: Date,
    },

    /**
     * =====================================================
     * SOFT DELETE
     * =====================================================
     */

    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * =========================================================
 * INDEXES
 * =========================================================
 */

serviceRequestSchema.index({
  company: 1,
  status: 1,
  area: 1,
});

serviceRequestSchema.index({
  company: 1,
  customer: 1,
  createdAt: -1,
});

serviceRequestSchema.index({
  company: 1,
  assignedTechnician: 1,
  status: 1,
});

serviceRequestSchema.index({
  company: 1,
  preferredDate: 1,
});

serviceRequestSchema.index({
  company: 1,
  issueType: 1,
});

serviceRequestSchema.index({
  company: 1,
  requestNumber: 1,
});

/**
 * =========================================================
 * AUTO GENERATE REQUEST NUMBER
 * =========================================================
 */

serviceRequestSchema.pre(
  "validate",
  async function (next) {
    if (this.requestNumber) {
      return next();
    }

    const timestamp = Date.now()
      .toString()
      .slice(-6);

    this.requestNumber = `SR-${timestamp}`;

    next();
  }
);

/**
 * =========================================================
 * EXPORT MODEL
 * =========================================================
 */

const ServiceRequest = mongoose.model(
  "ServiceRequest",
  serviceRequestSchema
);

export default ServiceRequest;