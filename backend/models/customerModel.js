import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const { Schema } = mongoose;

const addressSchema = new Schema(
  {
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: {
      type: String,
      default: "USA",
    },
  },
  { _id: false }
);

const customerSchema = new Schema(
  {
    company: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
    },

    address: addressSchema,

    area: {
      type: Schema.Types.ObjectId,
      ref: "Area",
      index: true,
    },

    notes: {
      type: String,
      default: "",
    },

    // ===========================
    // Customer Portal
    // ===========================

    password: {
      type: String,
      select: false,
      default: undefined,
    },

    portalAccessEnabled: {
      type: Boolean,
      default: false,
    },

    registrationSource: {
      type: String,
      enum: ["staff", "self"],
      default: "staff",
    },

    lastLoginAt: Date,

    // ===========================
    // Status
    // ===========================

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// One customer per phone within a company
customerSchema.index(
  {
    company: 1,
    phone: 1,
  },
  {
    unique: true,
  }
);

/**
 * Hash password only if:
 * 1. password exists
 * 2. password was modified
 */
customerSchema.pre("save", async function (next) {
  if (!this.password) {
    return next();
  }

  if (!this.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  next();
});

/**
 * Compare entered password with hashed password
 */
customerSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) {
    return false;
  }

  return bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("Customer", customerSchema);