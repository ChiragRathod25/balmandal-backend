import { ApiResponce } from "../utils/ApiResponce.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { UnregisteredAttendance } from "../models/unregistered_attendance.model.js";
import { Event } from "../models/event.model.js";

// controllers list
// 1. addUnregisteredAttendance
// 2. updateUnregisteredAttendance
// 3. deleteUnregisteredAttendance
// 4. getUnregisteredAttendanceByEventId

const addUnregisteredAttendance = asyncHandler(async (req, res, next) => {
  const { eventId } = req.params;
  if (!eventId) {
    throw new ApiError(400, "Event id is required");
  }
  const event = await Event.findById(eventId);

  if (!event) {
    throw new ApiError(404, "Event not found");
  }
  const { fullName, mobile, email, remark, status } = req.body;
  if (!fullName || !fullName.trim() || fullName.trim().length === 0) {
    throw new ApiError(400, "Full name is required");
  }
  if (!status ) {
    throw new ApiError(400, "Status is required and should be a boolean value");
  }

  const unregisteredAttendance = await UnregisteredAttendance.create({
    eventId,
    fullName,
    mobile,
    email,
    remark,
    status,
    markedBy: req.user._id,
  });
  if (!unregisteredAttendance) {
    throw new ApiError(500, "Error in creating unregistered attendance");
  }
  res
    .status(201)
    .json(
      new ApiResponce(
        "Unregistered attendance created successfully",
        unregisteredAttendance
      )
    );
});

const updateUnregisteredAttendance = asyncHandler(async (req, res, next) => {
  const { unregisteredAttendanceId } = req.params;
  if (!unregisteredAttendanceId) {
    throw new ApiError(400, "Unregistered attendance id is required");
  }
  const unregisteredAttendance = await UnregisteredAttendance.findById(
    unregisteredAttendanceId
  );
  if (!unregisteredAttendance) {
    throw new ApiError(404, "Unregistered attendance not found");
  }
  const { fullName, mobile, email, remark, status } = req.body;
  if (!fullName || !fullName.trim() || fullName.trim().length === 0) {
    throw new ApiError(400, "Full name is required");
  }
  if(!status ){
    throw new ApiError(400, "Status is required and should be a boolean value");
  }
  const updatedUnregisteredAttendance =
    await UnregisteredAttendance.findByIdAndUpdate(
      unregisteredAttendanceId,
      {
        fullName,
        mobile,
        email,
        remark,
        status,
        markedBy: req.user._id,
      },
      { new: true }
    );
  if (!updatedUnregisteredAttendance) {
    throw new ApiError(500, "Error in updating unregistered attendance");
  }
  res
    .status(200)
    .json(
      new ApiResponce(
        "Unregistered attendance updated successfully",
        updatedUnregisteredAttendance
      )
    );
});

const deleteUnregisteredAttendance = asyncHandler(async (req, res, next) => {
  const { unregisteredAttendanceId } = req.params;
  if (!unregisteredAttendanceId) {
    throw new ApiError(400, "Unregistered attendance id is required");
  }
  const unregisteredAttendance = await UnregisteredAttendance.findByIdAndDelete(
    unregisteredAttendanceId
  );
  if (!unregisteredAttendance) {
    throw new ApiError(404, "Unregistered attendance not found");
  }
  res
    .status(200)
    .json(new ApiResponce("Unregistered attendance deleted successfully", {}));
});
const getUnregisteredAttendanceById=asyncHandler(async(req,res,next)=>{
  const {unregisteredAttendanceId}=req.params;
  if(!unregisteredAttendanceId){
    throw new ApiError(400,"Unregistered attendance id is required");
  }
  const unregisteredAttendance=await UnregisteredAttendance.findById(unregisteredAttendanceId);
  if(!unregisteredAttendance){
    throw new ApiError(404,"Unregistered attendance not found");
  }
  res.status(200).json(

    new ApiResponce(300,unregisteredAttendance,"Unregistered attendance fetched successfully")
  );
});

const getUnregisteredAttendanceByEventId = asyncHandler(
  async (req, res, next) => {
    const { eventId } = req.params;
    if (!eventId) {
      throw new ApiError(400, "Event id is required");
    }
    const event = await Event.findById(eventId);
    if (!event) {
      throw new ApiError(404, "Event not found");
    }
    const unregisteredAttendances = await UnregisteredAttendance.find({
      eventId,
    });
    res
      .status(200)
      .json(
        new ApiResponce(
          "Unregistered attendances fetched successfully",
          unregisteredAttendances
        )
      );
  }
);

export {
  addUnregisteredAttendance,
  updateUnregisteredAttendance,
  deleteUnregisteredAttendance,
  getUnregisteredAttendanceById,
  getUnregisteredAttendanceByEventId,
};
