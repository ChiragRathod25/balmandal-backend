import { Router } from "express";
import { verifyJWT, verifyAdmin } from "../middlewares/auth.middleware.js";
import { justCheck, getAllUsers,getUserProfile,getPendingPosts } from "../controllers/admin.controller.js";

import userRoutes from "./user.routes.js";
import parentRoutes from "./parent.routes.js";
import talentRoutes from "./talent.routes.js";
import achievementRoutes from "./achievement.routes.js";
import notificationRoutes from "./notification.routes.js";
import postRoutes from "./post.routes.js"

//admin routes
const router = Router();

router.use(verifyJWT, verifyAdmin);
router.route("/").get(justCheck);
router.use("/user", userRoutes);
router.use("/parent", parentRoutes);
router.use("/talent", talentRoutes);
router.use("/achievement", achievementRoutes);
router.use('/notification', notificationRoutes);

router.route("/all-users").get(getAllUsers);
router.route("/user-profile/:userId").get(getUserProfile);
router.route('/pending-post').get(getPendingPosts)
export default router;
