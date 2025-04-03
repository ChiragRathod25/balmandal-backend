import { ApiResponce } from "../utils/ApiResponce.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Like } from "../models/like.model.js";

//controllers list
// 1. togglePostLike
// 2. getLikesByPostId
// 3. getUserLikedPosts

const togglePostLike = asyncHandler(async (req, res, next) => {
  const { postId } = req.params;
  const createdBy = req.user._id;
  if (!postId) {
    throw new ApiError(400, "PostId is required");
  }

  const like = await Like.findOne({ postId, createdBy });
  if (like) {
    const deletedLike = await Like.findByIdAndDelete(like._id);
    if (!deletedLike) {
      throw new ApiError(500, "Error in deleting like");
    }
    res.status(200).json(new ApiResponce("Like removed", {}));
  } else {
    const newLike = await Like.create({ postId, createdBy });
    if (!newLike) {
      throw new ApiError(500, "Error in adding like");
    }
    res.status(200).json(new ApiResponce("Like added", newLike));
  }
});

const getLikesByPostId = asyncHandler(async (req, res, next) => {
  const { postId } = req.params;
  if (!postId) {
    throw new ApiError(400, "PostId is required");
  }
  const likes = await Like.find({ postId });
  
  res.status(200).json(new ApiResponce("Likes found", likes));
});

const getUserLikedPosts = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  if (!userId) {
    throw new ApiError(400, "UserId is required");
  }
  const likes = await Like.find({ createdBy: userId });
  res.status(200).json(new ApiResponce("Likes found", likes));
});

export { togglePostLike, getLikesByPostId, getUserLikedPosts };
