import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/auth.middleware.js";
import {
  addEvent,
  updateEvent,
  deleteEvent,
  getEvents,
  getEventById,
} from "../controllers/event.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.use(verifyJWT);
router
  .route("/")
  .get(getEvents)
  .post(verifyAdmin, upload.array("media"), addEvent);
router
  .route("/:id")
  .get(getEventById)
  .put(verifyAdmin, upload.array("media"), updateEvent)
  .delete(verifyAdmin, deleteEvent);

export default router;
