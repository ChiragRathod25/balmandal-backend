import { ApiResponce } from "../utils/ApiResponce.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import mongoose from "mongoose";
import { Post } from "../models/post.model.js";

const justCheck = asyncHandler(async (req, res, next) => {
  // get all balak
  res.status(200).json(new ApiResponce(200, null, "Working fine"));
});

const getAllActiveUsers = asyncHandler(async (req, res, next) => {
  // get all users
  // find all the users with isActive true and user's whose active status is not defined

  const users = await User.find(
    {
      $or: [
        { isActive: true }
      ],
    },
    {
      password: 0,
      refreshToken: 0,
      resetToken: 0,
      __v: 0,
    }
  ).select("-password -refreshToken");
  if (!users) throw new ApiError(404, "No user found");
  res
    .status(200)
    .json(new ApiResponce(200, users, "All users fetched successfully"));
});

const getAllUsers = asyncHandler(async (req, res, next) => {
  // get all users either active or inactive
  //sort active users first and then inactive users
  const users = await User.find(
    {},
    {
      refreshToken: 0,
      resetToken: 0,
      __v: 0,
    }
  ).select("-password -refreshToken").sort({ isActive: -1 ,createdAt: -1});
  if (!users) throw new ApiError(404, "No user found");
  res
    .status(200)
    .json(new ApiResponce(200, users, "All users fetched successfully"));
});

const getUserProfile = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;

  const userDeatils = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "achievements",
        localField: "_id",
        foreignField: "userId",
        as: "achievements",
      },
    },
    {
      $lookup: {
        from: "parents",
        localField: "_id",
        foreignField: "userId",
        as: "parents",
      },
    },
    {
      $lookup: {
        from: "talents",
        localField: "_id",
        foreignField: "userId",
        as: "talents",
      },
    },
  ]);

  if (!userDeatils) throw new ApiError(404, "User not found");

  res
    .status(200)
    .json(
      new ApiResponce(200, userDeatils[0], "User details fetched successfully")
    );
});
const getPendingPosts = asyncHandler(async (req, res, next) => {
  const posts = await Post.find({ isApproved: false });
  res
    .status(200)
    .json(new ApiResponce(200, posts, "Posts found successfully !!"));
});

const toggleActiveStatus = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  user.isActive = !user.isActive; //default to true if isActive is undefined
  await user.save();
  res
    .status(200)
    .json(new ApiResponce(200, user, "User status updated successfully"));
});

const updateUserPassword = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  const { password } = req.body;
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (!password || password?.trim() === "") {
    throw new ApiError(400, "Password is required");
  }

  user.password = password;
  await user.save();
  res
    .status(200)
    .json(new ApiResponce(200, user, "User password updated successfully"));
});

const updateUserUserName = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  const { newUserName } = req.body;
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  // check if newUserName is empty or not
  if (!newUserName || newUserName?.trim() === "") {
    throw new ApiError(400, "UserName is required");
  }
  //check if userName already exists
  const existingUser = await User.findOne({ username: newUserName });
  if (existingUser) {
    throw new ApiError(400, "UserName already exists");
  }
  user.username = newUserName;
  await user.save();
  res
    .status(200)
    .json(new ApiResponce(200, user, "User name updated successfully"));
});

export {
  justCheck,
  getAllActiveUsers,
  getUserProfile,
  getPendingPosts,
  toggleActiveStatus,
  updateUserPassword,
  updateUserUserName,
  getAllUsers
};
