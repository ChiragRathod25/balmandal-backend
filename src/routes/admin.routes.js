import { Router } from "express";
import { verifyJWT, verifyAdmin } from "../middlewares/auth.middleware.js";
import {
  justCheck,
  getAllActiveUsers,
  getUserProfile,
  getPendingPosts,
  toggleActiveStatus,
  updateUserPassword,
  updateUserUserName,
  getAllUsers
} from "../controllers/admin.controller.js";

import userRoutes from "./user.routes.js";
import parentRoutes from "./parent.routes.js";
import talentRoutes from "./talent.routes.js";
import achievementRoutes from "./achievement.routes.js";
import notificationRoutes from "./notification.routes.js";
import postRoutes from "./post.routes.js";

//admin routes
const router = Router();

router.use(verifyJWT, verifyAdmin);
router.route("/").get(justCheck);
router.use("/user", userRoutes);
router.use("/parent", parentRoutes);
router.use("/talent", talentRoutes);
router.use("/achievement", achievementRoutes);
router.use("/notification", notificationRoutes);

router.route("/user-profile/:userId").get(getUserProfile);
router.route("/pending-post").get(getPendingPosts);

// dashboard routes
router.route("/all-users").get(getAllUsers);
router.route("/all-active-users").get(getAllActiveUsers);
router.route("/toggle-active-status/:userId").put(toggleActiveStatus);
router.route("/update-user-password/:userId").put(updateUserPassword);
router.route("/update-user-username/:userId").put(updateUserUserName);


export default router;
