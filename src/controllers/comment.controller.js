import { ApiResponce } from "../utils/ApiResponce.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Comment } from "../models/comment.model.js";
import mongoose from "mongoose";

//controllers list
//1. addComment
//2. updateComment
//3. deleteComment
//4. getCommentsByPostId
//5. getCommentsByUserId

const addComment = asyncHandler(async (req, res, next) => {
  const { postId } = req.params;
  if (!postId) {
    throw new ApiError(400, "Post id is required");
  }
  const { content } = req.body;
  if (!content) {
    throw new ApiError(400, "Content is required");
  }
  const comment = await Comment.create({
    content,
    postId,
    createdBy: req.user._id,
  });
  if (!comment) {
    throw new ApiError(500, "Error in creating comment");
  }
  res
    .status(201)
    .json(new ApiResponce("Comment created successfully", comment));
});

const updateComment = asyncHandler(async (req, res, next) => {
  const { commentId } = req.params;
  if (!commentId) {
    throw new ApiError(400, "Comment id is required");
  }
  const { content } = req.body;
  if (!content) {
    throw new ApiError(400, "Content is required");
  }
  const comment = await Comment.findByIdAndUpdate(
    commentId,
    {
      content,
    },
    { new: true }
  );
  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }
  res
    .status(200)
    .json(new ApiResponce("Comment updated successfully", comment));
});

const deleteComment = asyncHandler(async (req, res, next) => {
  const { commentId } = req.params;
  if (!commentId) {
    throw new ApiError(400, "Comment id is required");
  }
  const comment = await Comment.findByIdAndDelete(commentId);
  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }
  res
    .status(200)
    .json(new ApiResponce("Comment deleted successfully", comment));
});

const getCommentsByPostId = asyncHandler(async (req, res, next) => {
  const { postId } = req.params;
  if (!postId) {
    throw new ApiError(400, "Post id is required");
  }

  const comments = await Comment.aggregate([
    {
      $match: {
        postId: new mongoose.Types.ObjectId(postId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "createdBy",
        foreignField: "_id",
        as: "user",
        pipeline: [
          {
            $project: {
              _id: 1,
              username: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        user: {
          $first: "$user",
        },
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
  ]);
  res
    .status(200)
    .json(new ApiResponce("Post comments fetched successfully", comments));
});

const getCommentsByUserId = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  if (!userId) {
    throw new ApiError(400, "User id is required");
  }
  const comments = await Comment.find({ createdBy: userId });
  res
    .status(200)
    .json(new ApiResponce("Comments fetched successfully", comments));
});

export {
  addComment,
  updateComment,
  deleteComment,
  getCommentsByPostId,
  getCommentsByUserId,
};
