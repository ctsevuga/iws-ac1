import mongoose from "mongoose";

const { Schema } = mongoose;

const citySchema = new Schema(
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

    state: {
      type: String,
      trim: true,
    },

    country: {
      type: String,
      trim: true,
      default: "India",
    },
  },
  { timestamps: true }
);

citySchema.index(
  { company: 1, name: 1, state: 1 },
  { unique: true }
);

export default mongoose.model("City", citySchema);