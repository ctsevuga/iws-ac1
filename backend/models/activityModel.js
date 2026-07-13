import mongoose from "mongoose";

const { Schema } = mongoose;

const activitySchema = new Schema(
  {
    company: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true
    },

    entityType: {
      type: String,
      enum: ["User","Job", "Customer", "Technician", "Invoice", "ServiceRequest"],
      required: true
    },

    entityId: {
      type: Schema.Types.ObjectId,
      required: true
    },

    action: {
      type: String,
      required: true
    },

    message: String
  },
  { timestamps: true }
);

activitySchema.index({ company: 1, entityType: 1 });

export default mongoose.model("Activity", activitySchema);
