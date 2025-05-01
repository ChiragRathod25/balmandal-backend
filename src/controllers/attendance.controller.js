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

const initializingAttendance =async (eventId,createdBy)=>{
  const event = await Event.findById(eventId);
  if (!event) {
    throw new ApiError(404, "Event not found");
  }

  const allUsers = await User.find({
    isActive: true,
  },{ _id: 1 });
  const attendanceList = allUsers.map((user) => {
    return {
      userId: user._id,
      eventId: eventId,
      status: "absent",
      markedBy: createdBy,
    };
  });
  await Attendance.insertMany(attendanceList);
  return attendanceList;
}

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
  // attendanceList is an array of objects, which contains userId and status of list whose status is changed
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

  //check in the db, is the userId present or not
  // if already marked then update else create new attendance

  const bulkOps = attendanceList.map((attendance) => {
    const { userId, status } = attendance;
    if (!userId) {
      throw new ApiError(400, "User Id is required");
    }
    if (!status) {
      throw new ApiError(400, "Status is required");
    }
    return {
      updateOne: {
        filter: { eventId, userId },
        update: {
          $set: {
            eventId,
            userId,
            status,
            markedBy: req.user._id,
          },
        },
        upsert: true,
      },
    };
  });
  const result = await Attendance.bulkWrite(bulkOps, { ordered: false });
 
  res
    .status(200)
    .json(new ApiResponce(200, result, "Attendance marked successfully"));
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

  // get all available users
  const allUsers = await User.find({});

  // get all attendances for the event
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
              isActive: 1,
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
        status: -1,
      },
    },    
  ]);

  // now we have all the attendances for the event which are marked by the user
  // now we need to get the users who are not marked by the user and add them to the list

  const markedUserIds = attendances.map((attendance) => attendance.userId.toString()); // Array of an marked userId
 
  const unmarkedUsers = allUsers.filter(
    (user) => !markedUserIds.includes(user._id.toString())
  );
  const unmarkedAttendances = unmarkedUsers.map((user) => {
    return {
      userId: user._id,
      eventId: new mongoose.Types.ObjectId(eventId),
      status: "absent",
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
      },

      markedBy: null,
    };
  });

  //merge the marked and unmarked attendances
  const eventAttendance = attendances
    .concat(unmarkedAttendances)
    .sort((a, b) => {
      if (a.status === "present" && b.status === "absent") {
        return -1;
      }
      if (a.status === "absent" && b.status === "present") {
        return 1;
      }
      return 0;
    })

    if(!eventAttendance) {
      throw new ApiError(404, "Attendances not found");
    }
    
  res
    .status(200)
    .json(
      new ApiResponce(200, eventAttendance, "Attendances fetched successfully")
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
      },
    },
    {
      $lookup: {
        from: "events",
        localField: "eventId",
        foreignField: "_id",
        as: "event",
      },
    },
    {
      $addFields: {
        event: {
          $first: "$event",
        },
      },
    },
    {
      $group: {
        _id: "$event.eventType",
        total: {
          $sum: 1,
        },
        present: {
          $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] },
        },
        absent: {
          $sum: { $cond: [{ $eq: ["$status", "absent"] }, 1, 0] },
        },
      },
    },
    {
      $addFields: {
        eventType: "$_id",
      },
    },
    {
      $sort: {
        eventType: 1,
      },
    },
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
  initializingAttendance
};
