import mongoose from "mongoose";

const { Schema } = mongoose;

const areaMasterSchema = new Schema(
  {
    city: {
      type: Schema.Types.ObjectId,
      ref: "CityMaster",
      required: true,
      index: true
    },

    name: {
      type: String,
      required: true,
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

areaMasterSchema.index(
  {
    city: 1,
    name: 1
  },
  {
    unique: true
  }
);

areaMasterSchema.index({
  city: 1
});
areaMasterSchema.index(
  {
    city: 1,
    name: 1,
  },
  {
    unique: true,
  }
);

const AreaMaster =
  mongoose.models.AreaMaster ||
  mongoose.model(
    "AreaMaster",
    areaMasterSchema
  );

export default AreaMaster;