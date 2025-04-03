import mongoose, { Schema } from "mongoose";
const notificationSchema = new Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdFor: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null, // null means it is a broadcast notification,
      },
    ],
   
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    notificationType: {
      type: String,
      enum: ["info", "error", "warning", "success","Approval"],
      default: "info",
    },
    targetGroup: {
      type: String,
      enum: ['All', 'Admin', 'Individual','Custom'],
      default: 'All',
    },
    poster:{
        type:String,
        default : null
    },
    isReadBy: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        readAt: {
          type: Date,
          default: null,
        },
    },
    ],
    deliveredTo: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        deliveredAt: {
          type: Date,
          default: null,
        },
      },
    ],
    link:{
      type:String,
      default:null
    },
  },
  {
    timestamps: true,
  }
);

export const Notification = mongoose.model("Notification", notificationSchema);
