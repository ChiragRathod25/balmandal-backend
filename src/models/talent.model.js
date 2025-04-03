import mongoose from "mongoose";

const talentSchema = new mongoose.Schema(
  {
    heading: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    images: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Talent = mongoose.model("Talent", talentSchema);
