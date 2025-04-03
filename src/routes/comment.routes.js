import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    addComment,
    updateComment,
    deleteComment,
    getCommentsByPostId,
    getCommentsByUserId,
} from "../controllers/comment.controller.js";
const router=Router();
router.use(verifyJWT);

router.route("/:postId")
.post(addComment)
.get(getCommentsByPostId);

router.route("/:commentId")
.put(updateComment)
.delete(deleteComment);

router.route("/user/:userId")
.get(getCommentsByUserId);

export default router;