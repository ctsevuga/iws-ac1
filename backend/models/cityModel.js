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

    // Reference to the master city
    cityMaster: {
      type: Schema.Types.ObjectId,
      ref: "CityMaster",
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
  { timestamps: true },
);

// Prevent duplicate city assignment
citySchema.index(
  {
    company: 1,
    cityMaster: 1,
  },
  {
    unique: true,
  },
);

export default mongoose.model("City", citySchema);
