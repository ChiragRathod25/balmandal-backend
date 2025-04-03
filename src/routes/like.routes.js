import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  togglePostLike,
  getLikesByPostId,
  getUserLikedPosts,
} from "../controllers/like.controller.js";

const router = Router();
router.use(verifyJWT);
router.route("/:postId").post(togglePostLike).get(getLikesByPostId);
router.route("/user/:userId").get(getUserLikedPosts);

export default router;
