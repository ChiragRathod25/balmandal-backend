import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  addUnregisteredAttendance,
  updateUnregisteredAttendance,
  deleteUnregisteredAttendance,
  getUnregisteredAttendanceByEventId,
  getUnregisteredAttendanceById,
} from "../controllers/unregistered_attendance.controller.js";

const router = Router();
router.use(verifyJWT);

router
  .route("/event/:eventId")
  .post(addUnregisteredAttendance)
  .get(getUnregisteredAttendanceByEventId);
router
  .route("/:unregisteredAttendanceId")
  .get(getUnregisteredAttendanceById)
  .put(updateUnregisteredAttendance)
  .delete(deleteUnregisteredAttendance);

export default router;
