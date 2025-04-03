import { ApiResponce } from "../utils/ApiResponce.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import mongoose from "mongoose";
import { Post } from "../models/post.model.js";

const justCheck=asyncHandler(async(req,res,next)=>{

        // get all balak
        
    res.status(200).json(new ApiResponce(200,null,"Working fine"));
}
)
const getAllUsers=asyncHandler(async(req,res,next)=>{
  
    // get all users
    const users=await User.find().select("-password -refreshToken");  
    if(!users)
        throw new ApiError(404,"No user found");
    res.status(200).json(new ApiResponce(200,users,"All users fetched successfully"));    
})
const getUserProfile=asyncHandler(async(req,res,next)=>{

    const {userId}=req.params;
  

    const userDeatils=await User.aggregate(
        [
            {
              $match: {
                _id: new mongoose.Types.ObjectId(userId)
              }
            },
            {
              $lookup: {
                from: "achievements",
                localField: "_id",
                foreignField: "userId",
                as: "achievements"
              }
            },
            {
              $lookup: {
                from: "parents",
                localField: "_id",
                foreignField: "userId",
                as: "parents"
              }
            },
            {
              $lookup: {
                from: "talents",
                localField: "_id",
                foreignField: "userId",
                as: "talents"
              }
            }
          ]
    )

    if(!userDeatils)
        throw new ApiError(404,"User not found");

    res.status(200).json(new ApiResponce(200,userDeatils[0],"User details fetched successfully"));
})
const getPendingPosts = asyncHandler(async (req, res, next) => {

  const posts = await Post.find({ isApproved: false });
  res.status(200).json(new ApiResponce(200,posts,"Posts found successfully !!"));

});
export {
    justCheck,
    getAllUsers,
    getUserProfile,
    getPendingPosts
}