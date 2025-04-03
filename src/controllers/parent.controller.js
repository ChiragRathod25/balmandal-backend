import { ApiResponce } from "../utils/ApiResponce.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Parent } from "../models/parent.model.js";

const addParentDetails = asyncHandler(async (req, res, next) => {
  const {
    role,
    fullName,
    email,
    mobileNumber,
    occupationType,
    occupationTitle,
    occupationAddress,
  } = req.body;
  if (
    [
      role,
      email,
      fullName,
      mobileNumber,
      occupationType,
      occupationTitle,
      occupationAddress,
    ].some((field) => (field?.trim() ?? "") === "")
  ) {
    throw new ApiError(400, "Please provide all the details");
  }
  const parent = await Parent.create({
    role,
    fullName,
    email,
    mobileNumber,
    occupationType,
    occupationTitle,
    occupationAddress,
    userId: req.user._id,
  });

  if (!parent) {
    return next(new ApiError(500, "Failed to add parent details"));
  }
  res
    .status(201)
    .json(new ApiResponce(200, parent, "Parent details added successfully"));
});

const updateParentDetails = asyncHandler(async (req, res, next) => {
  const parentId = req.params.id;
  if (!parentId) {
    return next(new ApiError(400, "Please provide parent id"));
  }
  const parent = await Parent.findById(parentId);
  if (!parent) {
    return next(new ApiError(404, "Parent details not found"));
  }
  const {
    role,
    fullName,
    email,
    mobileNumber,
    occupationType,
    occupationTitle,
    occupationAddress,
  } = req.body;
  if (
    [
      role,
      email,
      fullName,
      mobileNumber,
      occupationType,
      occupationTitle,
      occupationAddress,
    ].some((field) => (field?.trim() ?? "") === "")
  ) {
    return next(new ApiError(400, "Please provide all the details"));
  }
  const updatedParent = await Parent.findByIdAndUpdate(
    parentId,
    {
      role,
      fullName,
      email,
      mobileNumber,
      occupationType,
      occupationTitle,
      occupationAddress,
    },
    { new: true }
  );
  if (!updatedParent) {
    return next(new ApiError(500, "Failed to update parent details"));
  }
  res
    .status(200)
    .json(
      new ApiResponce(200, updatedParent, "Parent details updated successfully")
    );
});

const deleteParentDetails = asyncHandler(async (req, res, next) => {
  const parentId = req.params.id;
  if (!parentId) {
    return next(new ApiError(400, "Please provide parent id"));
  }
  const deletedParent = await Parent.findByIdAndDelete(parentId);
  if (!deletedParent) {
    return next(new ApiError(500, "Failed to delete parent details"));
  }
  res
    .status(200)
    .json(new ApiResponce(200, {}, "Parent details deleted successfully"));
});

const getParentDetailsById = asyncHandler(async (req, res, next) => {
  const parentId = req.params.id;
  if (!parentId) {
    return next(new ApiError(400, "Please provide parent id"));
  }
  const parent = await Parent.findById(parentId);
  if (!parent) {
    return next(new ApiError(404, "Parent details not found"));
  }
  res
    .status(200)
    .json(new ApiResponce(200, parent, "Parent details fetched successfully"));
});

const getUserParents = asyncHandler(async (req, res, next) => {
  const parents = await Parent.find({ userId: req.user._id });
  if (!parents) {
    return next(new ApiError(404, "No parent details found"));
  }
  res
    .status(200)
    .json(new ApiResponce(200, parents, "Parent details fetched successfully"));
});

export {
  addParentDetails,
  getParentDetailsById,
  updateParentDetails,
  deleteParentDetails,
  getUserParents,
};
