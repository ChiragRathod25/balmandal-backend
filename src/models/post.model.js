import mongoose from "mongoose";
const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    featuredImage: {
      type: String,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: [
        "Draft",
        "Published",
        "Deleted",
        "Archived",
        "Scheduled",
        "MarkedForReview",
      ],
      default: "Draft",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    views: {
      type: Number,
      default: 0,
    },
    isCommentEnable: {
      type: Boolean,
      default: true,
    },
    publishedAt: {
      type: Date,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    approvedAt: {
      type: Date,
    },
    meta: {
      title: {
        type: String,
        trim: true,
      },
      description: {
        type: String,
        trim: true,
      },
      keywords: {
        type: String,
        trim: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

export const Post = mongoose.model("Post", postSchema);
