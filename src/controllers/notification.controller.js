import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponce } from "../utils/ApiResponce.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Notification } from "../models/notification.model.js";
import { Subscription } from "../models/subscription.model.js";
import webpush from "web-push";
import { logger } from "../utils/logger.js";

const pushNotification = asyncHandler(
  async (notification, targetGroup, createdFor) => {
    //this fun. will send notifications to all the user
    let subscriptions = [];

    switch (targetGroup) {
      case "Individual":
        const individualUser = createdFor[0];
        subscriptions = await Subscription.find({ userId: individualUser });
        break;
      case "Custom":
        subscriptions = await Subscription.aggregate([
          {
            $match: {
              userId: {
                $in: createdFor,
              },
            },
          },
        ]);
        break;
      case "Admin":
        subscriptions = await Subscription.aggregate([
          {
            $lookup: {
              from: "users",
              localField: "userId",
              foreignField: "_id",
              as: "result",
            },
          },
          {
            $addFields: {
              isAdmin: {
                $first: "$result.isAdmin",
              },
            },
          },
          {
            $match: {
              isAdmin: true,
            },
          },
        ]);
        break;
      case "All":
        subscriptions = await Subscription.find({});
        break;
      default:
        subscriptions = [];
    }

    const options = {
      vapidDetails: {
        subject: "mailto:apcbalmandal@gmail.com",
        publicKey: process.env.VAPID_PUBLIC_KEY,
        privateKey: process.env.VAPID_PRIVATE_KEY,
      },
    };

    try {
      subscriptions.forEach(async (subscription) => {
        await webpush
          .sendNotification(
            subscription,
            JSON.stringify({
              title: notification?.title,
              message: notification?.message,
              poster:
                notification?.poster ||
                "https://upload.wikimedia.org/wikipedia/en/thumb/4/4a/Baps_logo.svg/286px-Baps_logo.svg.png?20210729212719",
              badge:
                "https://upload.wikimedia.org/wikipedia/en/thumb/4/4a/Baps_logo.svg/286px-Baps_logo.svg.png?20210729212719",
              // Fix in your pushNotification function
              link:
                notification?.link?.trim() !== "" &&
                notification?.link?.includes("http") &&
                notification?.link !== null
                  ? notification?.link
                  : process.env.VITE_BASE_URL +
                    "/notification/" +
                    notification?._id,
              _id: notification?._id,
            }),
            options
          )
          .catch((err) =>
            logger.error(
              "Error while sending notification to subscription",
              err
            )
          );
      });
    } catch (error) {
      throw new ApiError(404, `Error while sending push notifications`, error);
    }
  }
);

const createNotification = asyncHandler(async (req, res) => {
  const { createdFor, targetGroup, title, message, notificationType, link } =
    req.body;

  if ([title, message].some((field) => (field?.trim() ?? "") === "")) {
    throw new ApiError(404, "Title and message are required");
  }

  if (targetGroup === "individual" && !createdFor) {
    throw new ApiError(404, "Created for is required for individual broadcast");
  }

  let poster = null;
  if (req.file) {
    try {
      ``;
      poster = await uploadOnCloudinary(req.file);
      if (!poster)
        throw new ApiError(404, "Error while uploading image on cloudinary");
      poster = poster.secure_url;
    } catch (error) {
      throw new ApiError(404, "Error while uploading image on cloudinary");
    }
  }

  try {
    const notification = await Notification.create({
      createdBy: req.user._id,
      targetGroup,
      title,
      poster,
      message,
      link,
      notificationType,
    });

    if (!notification)
      throw new ApiError(404, "Error while creating new notification");

    //send notification to the user
    pushNotification(notification, targetGroup);
    // TODO: Set user specific notification, as of now it is only broadcast notification

    res
      .status(200)
      .json(
        new ApiResponce(
          299,
          notification,
          "New notification created successfully !!"
        )
      );
  } catch (error) {
    throw new ApiError(
      404,
      `Something went wrong while creating notification !!`,
      error
    );
  }
});

const getAllNotifications = asyncHandler(async (req, res) => {
  // it will return all broadcasted notifications
  try {
    const notifications = await Notification.find({ targetGroup: "All" });
    if (!notifications) throw new ApiError(404, `No notifications found`);

    res
      .status(200)
      .json(
        new ApiResponce(
          200,
          notifications,
          "All broadcasted notifications fetched successfully !!"
        )
      );
  } catch (error) {
    throw new ApiError(
      500,
      `Something went wrong while getting all notifications`,
      error
    );
  }
});

const getUserNotifications = asyncHandler(async (req, res) => {
  // it will return all the notificatinos of the user, including broadcasted and personal notification
  const userId = req.user._id;
  const isAdmin = req.user._doc.isAdmin; // because it is a mongoose object
  let role = "user";
  if (isAdmin) role = "Admin";

  try {
    const notifications = await Notification.find({
      $or: [
        {
          targetGroup: { $in: ["All", role] },
        },
        { createdFor: { $in: [userId] } },
      ],
    }).sort({ createdAt: -1 });

    if (!notifications) throw new ApiError(404, `No notifications found !!`);
    res
      .status(200)
      .json(
        new ApiResponce(
          200,
          notifications,
          `Users notificatinos fetched successfully !!`
        )
      );
  } catch (error) {
    throw new ApiError(
      404,
      `Something went wrong while getting user notifications`,
      error
    );
  }
});

const getNotificationsByCreaterId = asyncHandler(async (req, res) => {
  // only permitted for an admin
  const userId = req.user._id;
  try {
    const notification = await Notification.find({ createdBy: userId });
    if (!notification) throw new ApiError(404, `No notifications found`);

    res
      .status(200)
      .json(
        new ApiResponce(
          200,
          `Notification fetched successfully !!`,
          notification
        )
      );
  } catch (error) {
    throw new ApiError(
      404,
      `Error while fetching notificatino created by an admin`
    );
  }
});
const getNotificationById = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;

  if (!notificationId) throw new ApiError(404, `Notification Id is required`);
  try {
    const notifiacation = await Notification.findById(notificationId);
    if (!notifiacation) throw new ApiError(404, `Invalid notificaion request`);
    res
      .status(200)
      .json(
        new ApiResponce(
          404,
          notifiacation,
          "Notifications fetched successfully !!"
        )
      );
  } catch (error) {
    throw new ApiError(404, `Error while fetching notificaion !!`);
  }
});

const markNotificationAsRead = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;
  const userId = req.user._id;
  try {
    const notification = await Notification.findById(notificationId);
    if (!notification) throw new ApiError(404, `Notification not found`);
    const isRead = notification.isReadBy.find((user) => user.userId == userId);
    if (isRead) throw new ApiError(404, `Notification is already read`);
    notification.isReadBy.push({ userId, readAt: new Date() });
    await notification.save();
    res
      .status(200)
      .json(
        new ApiResponce(
          200,
          notification,
          `Notification marked as read successfully !!`
        )
      );
  } catch (error) {
    throw new ApiError(404, `Error while marking notification as read`, error);
  }
});

const markNotificationAsDelivered = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;
  try {
    const notification = await Notification.findById(notificationId);
    if (!notification) throw new ApiError(404, `Notification not found`);
    notification.deliveredTo.push({
      userId: req.user._id,
      deliveredAt: new Date(),
    });
    await notification.save();
    res
      .status(200)
      .json(
        new ApiResponce(
          200,
          notification,
          `Notification marked as delivered successfully !!`
        )
      );
  } catch (error) {
    throw new ApiError(
      404,
      `Error while marking notification as delivered`,
      error
    );
  }
});
export {
  createNotification,
  getAllNotifications,
  getNotificationById,
  getUserNotifications,
  getNotificationsByCreaterId,
  markNotificationAsRead,
  markNotificationAsDelivered,
};
