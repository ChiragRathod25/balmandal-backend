import { Router } from "express";
import {
  addAchievement,
  updateAchievement,
  getUserAchievements,
  getAchievementById,
  deleteAchievement,
} from "../controllers/achievement.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.use(verifyJWT);
router
  .route("/")
  .get(getUserAchievements)
  .post(upload.array("image"), addAchievement);
router
  .route("/:id")
  .put(upload.array("image"), updateAchievement)
  .delete(deleteAchievement)
  .get(getAchievementById);

export default router;
