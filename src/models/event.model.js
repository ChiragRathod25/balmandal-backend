import mongoose from "mongoose";
// Define the event schema

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["upcoming", "ongoing", "completed","cancelled"],
      default: "upcoming",
    },
    eventType: {
      type: String,
      enum: ["Bal Sabha", "Satsang Diksha","Samuh Puja","Other"],
      required: true,
    },
    //date and time
    startAt: {
      type: Date,
      required: true,
    },
    endAt: {
      type: Date,
    },

    venue: {
      type: String,
      required:true,
    },

    media: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true }
);

export const Event = mongoose.model("Event", eventSchema);
