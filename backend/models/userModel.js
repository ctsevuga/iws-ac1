import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    // Multi-tenant link (VERY important)
    company: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },

    // Basic identity
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },

    phone: {
  type: String,
  required: true,
  trim: true,
},

    password: {
      type: String,
      required: true,
    },
    mustChangePassword: {
  type: Boolean,
  default: false,
},

    // Role-based access control (RBAC)
    role: {
      type: String,
      enum: ["admin", "manager", "dispatcher", "technician"],
      default: "technician",
    },

    // Link to technician profile (important separation)
    technicianProfile: {
      type: Schema.Types.ObjectId,
      ref: "Technician",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    lastLogin: Date,
  },
  { timestamps: true }
);

// One user per company per email
userSchema.index({ company: 1, email: 1 }, { unique: true });
userSchema.index(
  { phone: 1 },
  { unique: true }
);

/**
 * Match user entered password to hashed password in database
 */
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

/**
 * Encrypt password using bcrypt before saving
 */
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next(); // IMPORTANT: return to prevent double execution
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

const User = mongoose.model("User", userSchema);

export default User;