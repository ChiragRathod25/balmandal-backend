import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponce } from "../utils/ApiResponce.js";
import { Event } from "../models/event.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

 const addEvent = asyncHandler(async (req, res, next) => {
  const { title, description, status, startAt, endAt,venue,eventType } = req.body;

  if (!title || !eventType) {
    throw new ApiError(400, "Title and Event type is required");
  }

  if (endAt && new Date(endAt) < new Date(startAt)) {
    throw new ApiError(400, "End date should be greater than start date");
  }
  const mediaFiles = [];
  if (req.files) {
    const mediaArray = Array.isArray(req.files) ? req.files : [req.files.media];
    for (const media of mediaArray) {
      const path = media.path;
      try {
        const media = await uploadOnCloudinary(path);
        if (!media || !media.url) {
          throw new ApiError(400, "Error while uploading media");
        }
        mediaFiles.push(media.url);
      } catch (error) {
        throw new ApiError(400, `Error while uploading media`, error);
      }
    }
  }
  const event = await Event.create({
    title,
    description,
    createdBy: req.user._id,
    status,
    startAt,
    endAt,
    venue,
    eventType,
    media: mediaFiles,
  });

  res
    .status(200)
    .json(new ApiResponce(200, event, `Event added successfully !!`));
});

const updateEvent = asyncHandler(async (req, res, next) => {
  const eventId = req.params.id;
  if (!eventId) {
    throw new ApiError(400, "Please provide event id");
  }
  const event = await Event.findById(eventId);
  if (!event) {
    throw new ApiError(404, "Event not found");
  }

  const {
    title,
    description,
    createdBy,
    status,
    eventType,
    startAt,
    endAt,
    venue,
    cloudMediaFiles,
  } = req.body;
  if (!title) {
    throw new ApiError(400, "Title is required");
  }
  const newMediaFiles = [];
  if (req.files) {
    const mediaArray = Array.isArray(req.files) ? req.files : [req.files.media];
    for (const media of mediaArray) {
      const path = media.path;
      try {
        const media = await uploadOnCloudinary(path);
        if (!media || !media.url) {
          throw new ApiError(400, "Error while uploading media");
        }
        newMediaFiles.push(media.url);
      } catch (error) {

        throw new ApiError(400, `Error while uploading media`, error);
      }
    }
  }

  let cloudMediaFilesArray = JSON.parse(cloudMediaFiles);

  let files = [];
  if (cloudMediaFilesArray && cloudMediaFilesArray.length > 0) {
    files = Array.isArray(cloudMediaFilesArray)
      ? cloudMediaFilesArray
      : [cloudMediaFilesArray];
  }

  if (newMediaFiles.length > 0) {
    if (files.length > 0) {
      files = [...files, ...newMediaFiles];
    } else files = [...newMediaFiles];
  }

  const updatedEvent = await Event.findByIdAndUpdate(
    eventId,
    {
      title,
      description,
      createdBy,
      status,
      startAt,
      endAt,
      venue,
      eventType,
      media: files,
    },
    { new: true }
  );
  if (!updatedEvent) {
    throw new ApiError(404, "Error while updating event");
  }
  res
    .status(200)
    .json(new ApiResponce(200, updatedEvent, "Event updated successfully"));
});

const deleteEvent = asyncHandler(async (req, res, next) => {
  const eventId = req.params.id;
  if (!eventId) {
    throw new ApiError(400, "Please provide event id");
  }
  const event = await Event.findById(eventId);
  if (!event) {
    throw new ApiError(404, "Event not found");
  }
  const deletedEvent = await Event.findByIdAndDelete(eventId);
  if (!deletedEvent) {
    throw new ApiError(500, "Failed to delete event");
  }
  res
    .status(200)
    .json(new ApiResponce(200, deletedEvent, "Event deleted successfully"));
});

const getEvents = asyncHandler(async (req, res, next) => {
  const events = await Event.find().sort({ createdAt: -1 });
  if (!events) {
    throw new ApiError(404, "No events found");
  }
  res
    .status(200)
    .json(new ApiResponce(200, events, "Events found successfully"));
});

const getEventById = asyncHandler(async (req, res, next) => {
  const eventId = req.params.id;
  if (!eventId) {
    throw new ApiError(400, "Please provide event id");
  }
  const event = await Event.findById(eventId);
  if (!event) {
    throw new ApiError(404, "Event not found");
  }
  res.status(200).json(new ApiResponce(200, event, "Event found successfully"));
});

export { addEvent, updateEvent, deleteEvent, getEvents, getEventById };
