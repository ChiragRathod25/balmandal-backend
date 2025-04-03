import { ApiResponce } from "../utils/ApiResponce.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Attendance } from "../models/attendance.model.js";
import { Event } from "../models/event.model.js";
import { User } from "../models/user.model.js";
import mongoose from "mongoose";

// controllers list
// 1. addAttendance
// 2. updateAttendance
// 3. deleteAttendance
// 4. getAttendanceByEventId
// 5. getAttendanceByUserId
// 6. getAttendanceStatusByEventIdAndUserId
// 7. updateAttendanceStatus

const addAttendance = asyncHandler(async (req, res, next) => {
  const { eventId } = req.params;
  if (!eventId) {
    throw new ApiError(400, "Event Id is required");
  }
  const event = await Event.findById(eventId);
  if (!event) {
    throw new ApiError(404, "Event not found");
  }

  const { attendanceList } = req.body;
  // attendanceList is an array of objects
  // each object should have userId and status
  // status should be a boolean value
  if (!attendanceList) {
    throw new ApiError(400, "Attendance List is required");
  }
  if (!Array.isArray(attendanceList)) {
    throw new ApiError(400, "Attendance List should be an array");
  }
  if (attendanceList.length === 0) {
    throw new ApiError(400, "Attendance List should not be empty");
  }
  const userIds = attendanceList.map((attendance) => attendance.userId);
  const users = await User.find({ _id: { $in: userIds } });
  if (users.length !== userIds.length) {
    throw new ApiError(404, "User not found");
  }

  //check if attendance of the user is marked or not, if marked then update the status else create a new attendance
  const createdAttendances = [];
  for (let attendance of attendanceList) {
    const { userId, status } = attendance;
    const attendanceExist = await Attendance.findOne({ eventId, userId });
    if (attendanceExist) {
      const updatedAttendance = await Attendance.findByIdAndUpdate(
        attendanceExist._id,
        {
          status: status === true ? "present" : "absent",
          markedBy: req.user._id,
        },
        { new: true }
      );
      if (!updatedAttendance) {
        throw new ApiError(500, "Error in updating attendance");
      }
    } else {
      const newAttendance = {
        eventId,
        userId,
        status: status === true ? "present" : "absent",
        markedBy: req.user._id,
      };
      createdAttendances.push(newAttendance);
    }
  }
  let attendance = null;
  if (createdAttendances.length > 0) {
    attendance = await Attendance.insertMany(createdAttendances);
    if (!attendance) {
      throw new ApiError(500, "Error in marking attendance");
    }
  }

  res
    .status(200)
    .json(new ApiResponce(200, attendance, "Attendance marked successfully"));

});

const updateAttendance = asyncHandler(async (req, res, next) => {
  const { status } = req.body;
  const { attendanceId } = req.params;
  if ([status].some((field) => (field.trim() ?? "") === "")) {
    throw new ApiError(400, "Status is required");
  }
  const attendance = await Attendance.findByIdAndUpdate(
    attendanceId,
    { status, markedBy: req.user._id },
    { new: true }
  );
  if (!attendance) {
    throw new ApiError(404, "Attendance not found");
  }
  res
    .status(200)
    .json(new ApiResponce(200, "Attendance updated successfully", attendance));
});

const deleteAttendance = asyncHandler(async (req, res, next) => {
  const { attendanceId } = req.params;
  if (!attendanceId) {
    throw new ApiError(400, "Attendance Id is required");
  }
  const attendance = await Attendance.findByIdAndDelete(attendanceId);
  if (!attendance) {
    throw new ApiError(404, "Attendance not found");
  }
  res
    .status(200)
    .json(new ApiResponce(200, "Attendance deleted successfully", attendance));
});

const getAttendanceByEventId = asyncHandler(async (req, res, next) => {
  const { eventId } = req.params;
  if (!eventId) {
    throw new ApiError(400, "Event Id is required");
  }
  const attendances = await Attendance.aggregate([
    {
      $match: {
        eventId: new mongoose.Types.ObjectId(eventId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
        pipeline: [
          {
            $project: {
              firstName: 1,
              lastName: 1,
              username: 1,
              _id: 0,
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
        status: -1
      }
    }
  ]);
  if(!attendances){
    throw new ApiError(404, "Attendances not found");
  }

  res
    .status(200)
    .json(
      new ApiResponce(200, attendances, "Attendances fetched successfully")
    );
});

const getAttendanceByUserId = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  if (!userId) {
    throw new ApiError(400, "User Id is required");
  }

  const attendances = await Attendance.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
      }
    },
    {
      $lookup: {
        from: "events",
        localField: "eventId",
        foreignField: "_id",
        as: "event"
      }
    },
    {
      $addFields: {
        event: {
          $first: "$event"
        }
      }
    },
    {
      $group: {
        _id:   "$event.eventType",
        total: {
          $sum: 1
        },
          present: {
          $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] }
        },
        absent: {
          $sum: { $cond: [{ $eq: ["$status", "absent"] }, 1, 0] }
        }
      }
    },
    {
      $addFields: {
        eventType: "$_id"
      }
    },
    {
      $sort: {
        eventType: 1
      }
    }
  ]);
  if (!attendances) {
    throw new ApiError(404, "Attendances not found");
  }
  res
    .status(200)
    .json(
      new ApiResponce(200, attendances, "Attendances fetched successfully")
    );
});

const getAttendanceStatusByEventIdAndUserId = asyncHandler(
  async (req, res, next) => {
    const { eventId, userId } = req.params;
    if (!eventId || !userId) {
      throw new ApiError(400, "Event Id and User Id are required");
    }
    const attendance = await Attendance.findOne({ eventId, userId });
    if (!attendance) {
      throw new ApiError(404, "Attendance not found");
    }
    res.status(200).json(new ApiResponce(200, "Attendance found", attendance));
  }
);

const updateAttendanceStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;
  if (!status) {
    throw new ApiError(400, "Status is required");
  }

  const { attendanceId } = req.params;
  if (!attendanceId) {
    throw new ApiError(400, "Attendance Id is required");
  }

  const attendance = await Attendance.findByIdAndUpdate(
    attendanceId,
    { status },
    { new: true }
  );
  if (!attendance) {
    throw new ApiError(404, "Attendance not found");
  }
  res
    .status(200)
    .json(
      new ApiResponce(200, "Attendance status updated successfully", attendance)
    );
});

export {
  addAttendance,
  updateAttendance,
  deleteAttendance,
  getAttendanceByEventId,
  getAttendanceByUserId,
  getAttendanceStatusByEventIdAndUserId,
  updateAttendanceStatus,
};
