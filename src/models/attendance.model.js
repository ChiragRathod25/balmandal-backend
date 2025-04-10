import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["present", "absent", "pending"],
      default: 'pending',
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  
  },
  {
    timestamps: true,
  }
);
attendanceSchema.index({ eventId: 1, userId: 1 }, { unique: true });



export const Attendance = mongoose.model("Attendance", attendanceSchema);
