import mongoose from "mongoose";

const { Schema } = mongoose;

const notificationSchema = new Schema(
  {
    company: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true
    },

    // Who receives the notification
    recipientType: {
      type: String,
      enum: ["Technician", "Customer", "User"],
      required: true
    },

    recipient: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "recipientType",
      index: true
    },

    // Optional: link to service request
    serviceRequest: {
      type: Schema.Types.ObjectId,
      ref: "ServiceRequest",
      index: true
    },

    // Notification content
    title: {
      type: String,
      required: true
    },

    message: {
      type: String,
      required: true
    },
    area: {
  type: Schema.Types.ObjectId,
  ref: "Area",
  index: true
},

    // Channel (future-proofing)
    channel: {
      type: String,
      enum: ["SMS", "PUSH", "EMAIL", "IN_APP"],
      default: "IN_APP"
    },

    // Status tracking
    status: {
      type: String,
      enum: ["pending", "sent", "failed", "read"],
      default: "pending",
      index: true
    },

    // Metadata (very useful)
    metadata: {
      type: Schema.Types.Mixed
    },

    sentAt: Date,
    readAt: Date,
    failedAt: Date,

    error: String
  },
  { timestamps: true }
);

// Indexes for fast queries
notificationSchema.index({ recipient: 1, recipientType: 1, status: 1 });
notificationSchema.index({ company: 1, createdAt: -1 });
notificationSchema.index({
  recipient: 1,
  recipientType: 1,
  status: 1,
  createdAt: -1,
});
export default mongoose.model("Notification", notificationSchema);