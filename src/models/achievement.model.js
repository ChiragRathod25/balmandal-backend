import mongoose from "mongoose";
const achievementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    userId:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    media: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true }
);

export const Achievement = mongoose.model("Achievement", achievementSchema);
