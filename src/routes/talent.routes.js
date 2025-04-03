import { Router } from "express";
import {
  addTalent,
  updateTalent,
  deleteTalent,
  getUserTalents,
  getTalentById,
} from "../controllers/talent.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.use(verifyJWT);
router.route("/").get(getUserTalents).post(upload.array("image"), addTalent);
router
  .route("/:id")
  .put(upload.array("image"), updateTalent)
  .delete(deleteTalent)
  .get(getTalentById);

export default router;
