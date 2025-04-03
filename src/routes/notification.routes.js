import { Router } from "express";
import { verifyJWT, verifyAdmin } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

import {
  createNotification,
  getAllNotifications,
  getNotificationById,
  getUserNotifications,
  getNotificationsByCreaterId,
  markNotificationAsRead,
  markNotificationAsDelivered
} from "../controllers/notification.controller.js";

const router = Router();
router.use(verifyJWT);

router
  .route("/")
  .get(getAllNotifications)
  .post(verifyAdmin,upload.single('poster'),createNotification);

router.route("/user").get(getUserNotifications);

router.route("/creater").get(verifyAdmin, getNotificationsByCreaterId);

router.route("/:notificationId").get(getNotificationById);

router.route("/markAsRead/:notificationId").put(markNotificationAsRead);
router.route("/markAsDelivered/:notificationId").put(markNotificationAsDelivered);

export default router;