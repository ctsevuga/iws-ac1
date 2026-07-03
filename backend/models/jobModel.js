import mongoose from "mongoose";

const { Schema } = mongoose;

const jobSchema = new Schema(
  {
    company: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true
    },

    serviceRequest: {
      type: Schema.Types.ObjectId,
      ref: "ServiceRequest",
      required: true
    },

    customer: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true
    },

    technician: {
      type: Schema.Types.ObjectId,
      ref: "Technician"
    },

    serviceType: {
      type: String,
      required: true
    },

    scheduledAt: Date,

    status: {
      type: String,
      enum: [
        "assigned",
        "new",
        "scheduled",
        "in_progress",
        "completed",
        "cancelled"
      ],
      default: "new"
    },

    notes: String,

    location: {
      address: String,
      lat: Number,
      lng: Number
    },

    estimatedCost: Number,

    actualCost: Number
  },
  { timestamps: true }
);

jobSchema.index({ company: 1, status: 1 });

export default mongoose.model("Job", jobSchema);
