import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import mongoose from "mongoose";
import { logger } from "../utils/logger.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    // if admin is already logged in then no need to verify the user
    if (req.admin) {
      return next();
    }

    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");
   
    if (!token) throw new ApiError(401, `Token is required`);
    const decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decodeToken?._id).select(
      "-password -refreshToken"
    );
    if (!user) throw new ApiError(401, `Invalid access token`);

    req.user = user;
    next();
  } catch (error) {
    logger.error(`verifyJWT Error`, error);
    throw new ApiError(401, `Error while validating user`, error);
  }
});

export const verifyAdmin = asyncHandler(async (req, res, next) => {
  try {
    //mongoose doc to regular object conversion is required to access the properties of the user object
    //why => because the user object is a mongoose document and we can't access properties directly from it

    req.user = req.user.toObject();

    const isAdmin=req.user?.isAdmin;
    if (!isAdmin)
      throw new ApiError(403, `Not authorized as Admin`);

    // update req.user if userId is given
    const { userId } = req.query;

    if (userId) {
      const user = await User.findById(
        new mongoose.Types.ObjectId(userId)
      ).select("-password -refreshToken");
      if (!user) throw new ApiError(404, `User not found`);

      // update req.user and req.admin if userId is given and user is found in the database
      // req.user will be the user with the given userId
      // req.admin will be the user who is currently logged in
      req.admin = req.user;
      req.user = user;
    }
    next();
  } catch (error) {
    logger.error(`verifyAdmin Error`, error);
    throw new ApiError(403, `Error while validating Admin`, error);
  }
});
