import mongoose from "mongoose";

const unregisteredAttendanceSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    mobile: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["present", "absent", "pending"],
      default: "present",
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    remark: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const UnregisteredAttendance = mongoose.model(
  "UnregisteredAttendance",
  unregisteredAttendanceSchema
);
