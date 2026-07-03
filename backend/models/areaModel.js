import mongoose from "mongoose";

const { Schema } = mongoose;

const areaSchema = new Schema(
  {
    company: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },

    city: {
      type: Schema.Types.ObjectId,
      ref: "City",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

/**
 * Each area name should be unique within a city + company
 */
areaSchema.index(
  { company: 1, city: 1, name: 1 },
  { unique: true }
);

/**
 * Fast lookup of areas by city
 */
areaSchema.index({
  company: 1,
  city: 1,
});

export default mongoose.model("Area", areaSchema);