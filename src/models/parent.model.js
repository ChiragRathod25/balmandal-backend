import mongoose from "mongoose";
const parentSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["Father", "Mother"],
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    mobileNumber: {
      type: String,
      required: true,
    },
    occupationType: {
      type: String,
      required: true,
    },
    occupationTitle: {
      type: String,
      required: true,
    },
    occupationAddress: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Parent = mongoose.model("Parent", parentSchema);
