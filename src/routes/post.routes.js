import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    addPost,
    updatePost,
    deletePost,
    getPostById,
    getPosts,
    getPostsByUserId,
    getPostsByTag,
    getPublishedPosts,
    togglePublishStatus,
    toggleIsCommentsEnabled,
    toggleIsApproved,
    updatePostStatus,
    uploadFilesToBucket

} from "../controllers/post.controller.js";
import { createNotification } from "../controllers/notification.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();
router.route("/uploadFile").post(upload.single("upload"), async (req, res) => {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const tempFilePath = process.env.API_BASE_URL+ '/temp/' + req.file.filename;

    res.status(200).json({ url: tempFilePath });
});

router.use(verifyJWT);

router.route("/").post(uploadFilesToBucket,addPost,createNotification).get(getPosts);
router.route("/published").get(getPublishedPosts);
router.route("/filter").get(getPostsByTag);
router.route("/user/:userId").get(getPostsByUserId);
router.route("/:postId").get(getPostById).put(uploadFilesToBucket,updatePost).delete(deletePost);
router.route("/:postId/publish").put(togglePublishStatus);
router.route("/:postId/comments").put(toggleIsCommentsEnabled);
router.route("/:postId/approval").put(toggleIsApproved);
router.route("/:postId/status").put(updatePostStatus);



export default router;