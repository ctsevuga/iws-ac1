import mongoose from "mongoose";

const { Schema } = mongoose;

const cityMasterSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    state: {
      type: String,
      required: true,
      trim: true
    },

    country: {
      type: String,
      default: "India",
      trim: true
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

cityMasterSchema.index(
  {
    name: 1,
    state: 1,
    country: 1
  },
  {
    unique: true
  }
);

const CityMaster =
  mongoose.models.CityMaster ||
  mongoose.model(
    "CityMaster",
    cityMasterSchema
  );

export default CityMaster;