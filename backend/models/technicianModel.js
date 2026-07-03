import mongoose from "mongoose";

const { Schema } = mongoose;

const technicianSchema = new Schema(
  {
    company: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },

    /**
     * Linked system user account
     * Used for authentication & self-access
     */
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },

    skills: [
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

    areas: [
      {
        type: Schema.Types.ObjectId,
        ref: "Area",
        index: true,
      },
    ],

    isAvailable: {
      type: Boolean,
      default: true,
    },

    currentLocation: {
      lat: Number,
      lng: Number,
      updatedAt: {
        type: Date,
      },
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Indexes
 */

technicianSchema.index({
  company: 1,
});

technicianSchema.index({
  company: 1,
  user: 1,
});

technicianSchema.index({
  company: 1,
  isAvailable: 1,
});

export default mongoose.model(
  "Technician",
  technicianSchema
);