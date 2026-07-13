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

    // Reference to the master area
    areaMaster: {
      type: Schema.Types.ObjectId,
      ref: "AreaMaster",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Prevent assigning the same master area twice
 * to the same company.
 */
areaSchema.index(
  {
    company: 1,
    areaMaster: 1,
  },
  {
    unique: true,
  }
);

/**
 * Area names should be unique within a city for a company.
 */
areaSchema.index(
  {
    company: 1,
    city: 1,
    name: 1,
  },
  {
    unique: true,
  }
);

/**
 * Fast lookup of areas by city.
 */
areaSchema.index({
  company: 1,
  city: 1,
});

/**
 * Fast lookup by master area.
 */
areaSchema.index({
  areaMaster: 1,
});

export default mongoose.model("Area", areaSchema);