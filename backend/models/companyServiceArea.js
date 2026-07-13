import mongoose from "mongoose";

const { Schema } = mongoose;

const companyServiceAreaSchema = new Schema(
  {
    company: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true
    },

    city: {
      type: Schema.Types.ObjectId,
      ref: "CityMaster",
      required: true,
      index: true
    },

    area: {
      type: Schema.Types.ObjectId,
      ref: "AreaMaster",
      required: true,
      index: true
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

/**
 * Prevent duplicate mappings.
 */
companyServiceAreaSchema.index(
  {
    company: 1,
    area: 1
  },
  {
    unique: true
  }
);

/**
 * Find companies serving an area.
 */
companyServiceAreaSchema.index({
  city: 1,
  area: 1
});

/**
 * Find all areas served by a company.
 */
companyServiceAreaSchema.index({
  company: 1
});

export default mongoose.model(
  "CompanyServiceArea",
  companyServiceAreaSchema
);