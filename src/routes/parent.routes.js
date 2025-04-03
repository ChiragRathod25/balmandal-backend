import { Router } from "express";
import {
  addParentDetails,
  getParentDetailsById,
  updateParentDetails,
  deleteParentDetails,
  getUserParents,
} from "../controllers/parent.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);
router.route("/").get(getUserParents).post(addParentDetails);
router
  .route("/:id")
  .put(updateParentDetails)
  .delete(deleteParentDetails)
  .get(getParentDetailsById);

export default router;
