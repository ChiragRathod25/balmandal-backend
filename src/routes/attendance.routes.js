import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  addAttendance,
  updateAttendance,
  deleteAttendance,
  getAttendanceByEventId,
  getAttendanceByUserId,
  getAttendanceStatusByEventIdAndUserId,
  updateAttendanceStatus,
} from "../controllers/attendance.controller.js";
const router = Router();
router.use(verifyJWT);
router.route("/:eventId").post(addAttendance);
router.route("/:attendanceId").put(updateAttendance).delete(deleteAttendance);
router.route("/event/:eventId").get(getAttendanceByEventId);
router.route("/user/:userId").get(getAttendanceByUserId);
router
  .route("/status/:eventId/:userId")
  .get(getAttendanceStatusByEventIdAndUserId)
  .put(updateAttendanceStatus);

export default router;
