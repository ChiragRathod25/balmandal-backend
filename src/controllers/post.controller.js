import { ApiResponce } from "../utils/ApiResponce.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Post } from "../models/post.model.js";
import { createNotification } from "./notification.controller.js";
import { logger } from "../utils/logger.js";

//controllers list
//0. UploadFilesToBucket
//1. addPost
//2. updatePost
//3. deletePost
//4. getPostById
//5. getPosts
//6. getPostsByUserId
//7. getPostsByTag
//8. getPublishedPosts
//9. togglePublishStatus
//10. toggleIsCommentsEnabled
//11. toggleIsApproved
//12. updatePostStatus
const uploadFilesToBucket = asyncHandler(async (req, res, next) => {
  let { content } = req.body;
  if (!content) {
    throw new ApiError(400, "Content is required");
  }
  // go through the content and find the image src and upload it to cloudinary and replace the src with the cloudinary url
  const regex = /<img[^>]+src="([^">]+)"/g;
  const matches = content.match(regex);
  if (matches) {
    for (const match of matches) {
      let src = match.match(/src="([^">]+)"/)[1];
      let intialSrc = src;

      //convert the server's public url to local url
      src = src.replace(process.env.API_BASE_URL, "public");
      //  //convert '/' to '\' for windows
      // src=src.replace(/\//g,"\\")

      if (!src) {
        // logger.log("No src found in the image tag", match);
        continue;
      }
      if (!src.includes("temp")) {
        // logger.log("Content: ", content);
        // logger.log("Not a temp image, skipping upload", src);
        continue;
      }
      try {
        console.log("Uploading image to cloudinary", src);

        const result = await uploadOnCloudinary(src);

        req.body.content = content.replace(intialSrc, result.secure_url);
      } catch (error) {
        logger.log("Error in uploading image to cloudinary", error);
        throw new ApiError(
          500,
          "Error in uploading image to cloudinary",
          error
        );
      }
    }
  }
  next();
});

const addPost = asyncHandler(async (req, res, next) => {
  const { title, content, slug, status, tags, isCommentEnable } = req.body;
  if ([title, content, slug].some((field) => (field.trim() ?? "") === "")) {
    throw new ApiError(400, "Title, Content and Slug are required");
  }
  let featuredImage = "";
  if (req.file) {
    try {
      const result = await uploadOnCloudinary(req.file);
      featuredImage = result.secure_url;
    } catch (error) {
      logger.error(
        "Error in uploading post featured image to cloudinary",
        error
      );
      throw new ApiError(500, "Error in uploading post featured image");
    }
  }

  const post = await Post.create({
    title,
    content,
    featuredImage,
    slug,
    status,
    tags: Array.from(tags),
    isCommentEnable,
    meta: {
      title,
      description: content.slice(0, 100),
      keywords: tags,
    },
    createdBy: req.user._id,
  });

  if (!post) {
    throw new ApiError(500, "Error in creating post");
  }

  // set data for the Approval notification for the Admin Users
  // Called after this methond form post.routes.js
  const notificationContent = `New post with title "<strong>${title}</strong>" has been created by <strong>@${req.user.username}</strong> and is waiting for approval.<br>
<a href="/post/${post._id}">
  🔗 <span style="text-decoration:underline;color:blue;">Click here</span> to view the post
</a>`;

  // without tags, just message text
  const notificationMessage = `New post with title "${title}" has been created by @${req.user.username} and is waiting for approval.`;

  req.body = {
    targetGroup: "Admin",
    title: "New Post Approval request",
    message: notificationMessage,
    notificationContent,
    notificationType: "Approval",
  };
  createNotification(req, res, next);
  res.status(201).json(new ApiResponce(200, post, "Post created successfully"));
});

const updatePost = asyncHandler(async (req, res, next) => {
  const { title, content, slug, status, tags, isCommentEnable } = req.body;

  const { postId } = req.params;
  if (!postId) {
    throw new ApiError(400, "Post Id is required");
  }
  const post = await Post.findById(postId);
  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  let featuredImage = post.featuredImage;
  if (req.file) {
    try {
      const result = await uploadOnCloudinary(req.file);
      featuredImage = result.secure_url;
    } catch (error) {
      logger.error(
        "Error in uploading post featured image to cloudinary",
        error
      );
      throw new ApiError(500, "Error in uploading post featured image");
    }
  }

  const updatedPost = await Post.findByIdAndUpdate(
    postId,
    {
      title,
      content,
      featuredImage,
      slug,
      status,
      tags,
      isCommentEnable,
      meta: {
        title,
        description: content.slice(0, 100),
        keywords: tags,
      },
    },
    { new: true }
  );

  if (!updatedPost) {
    throw new ApiError(500, "Error in updating post");
  }
  res
    .status(200)
    .json(new ApiResponce(200, updatedPost, "Post updated successfully"));
});

const deletePost = asyncHandler(async (req, res, next) => {
  const { postId } = req.params;
  if (!postId) {
    throw new ApiError(400, "Post Id is required");
  }
  const post = await Post.findById(postId);
  if (!post) {
    throw new ApiError(404, "Post not found");
  }
  const deletedPost = await Post.findByIdAndDelete(postId);
  if (!deletedPost) {
    throw new ApiError(500, "Error in deleting post");
  }

  res.status(200).json(new ApiResponce(200, {}, "Post deleted successfully"));
});

const getPostById = asyncHandler(async (req, res, next) => {
  const { postId } = req.params;
  if (!postId) {
    throw new ApiError(400, "Post Id is required");
  }
  const post = await Post.findById(postId);
  if (!post) {
    throw new ApiError(404, "Post not found");
  }
  res
    .status(200)
    .json(new ApiResponce(200, post, "Post found successfully !!"));
});

const getPosts = asyncHandler(async (req, res, next) => {
  const posts = await Post.find({ isApproved: true }).sort({
    approvedAt: -1,
    createdAt: -1,
  });
  res
    .status(200)
    .json(new ApiResponce(200, posts, "Posts found successfully !!"));
});

const getPostsByUserId = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  if (!userId) {
    throw new ApiError(400, "User Id is required");
  }
  const posts = await Post.find({ createdBy: userId });
  res
    .status(200)
    .json(new ApiResponce(200, posts, "Posts found successfully !!"));
});
const getPostsByTag = asyncHandler(async (req, res, next) => {
  const { tag } = req.query;
  if (!tag) {
    throw new ApiError(400, "Tag is required");
  }
  const posts = await Post.find(
    {
      tags: { $in: [tag] },
    },
    { title: 1, content: 0 }
  );
  res
    .status(200)
    .json(new ApiResponce(200, posts, "Posts found successfully !!"));
});

const getPublishedPosts = asyncHandler(async (req, res, next) => {
  const posts = await Post.find({ status: "published" });
  res
    .status(200)
    .json(new ApiResponce(200, posts, "Posts found successfully !!"));
});

const togglePublishStatus = asyncHandler(async (req, res, next) => {
  const { postId } = req.params;
  if (!postId) {
    throw new ApiError(400, "Post Id is required");
  }
  const post = await Post.findById(postId);
  if (!post) {
    throw new ApiError(404, "Post not found");
  }
  const updatedPost = await Post.findByIdAndUpdate(
    postId,
    {
      status: post.status === "published" ? "draft" : "published",
    },
    { new: true }
  );
  if (!updatedPost) {
    throw new ApiError(500, "Error in updating post status");
  }
  res
    .status(200)
    .json(
      new ApiResponce(200, updatedPost, "Post status updated successfully")
    );
});

const toggleIsCommentsEnabled = asyncHandler(async (req, res, next) => {
  const { postId } = req.params;
  if (!postId) {
    throw new ApiError(400, "Post Id is required");
  }
  const post = await Post.findById(postId);
  if (!post) {
    throw new ApiError(404, "Post not found");
  }
  const updatedPost = await Post.findByIdAndUpdate(
    postId,
    {
      isCommentEnable: !post.isCommentEnable,
    },
    { new: true }
  );
  if (!updatedPost) {
    throw new ApiError(500, "Error in updating post comments enabled status");
  }
  res
    .status(200)
    .json(
      new ApiResponce(
        200,
        updatedPost,
        "Post comments enabled status updated successfully"
      )
    );
});

const toggleIsApproved = asyncHandler(async (req, res, next) => {
  const { postId } = req.params;
  if (!postId) {
    throw new ApiError(400, "Post Id is required");
  }
  const post = await Post.findById(postId);
  if (!post) {
    throw new ApiError(404, "Post not found");
  }
  const updatedPost = await Post.findByIdAndUpdate(
    postId,
    {
      isApproved: !post.isApproved,
      status: post.isApproved ? "Draft" : "Published",
      approvedBy: req.user._id,
      approvedAt: new Date(),
    },
    { new: true }
  );
  if (!updatedPost) {
    throw new ApiError(500, "Error in updating post approval status");
  }
  res
    .status(200)
    .json(
      new ApiResponce(
        200,
        updatedPost,
        "Post approval status updated successfully"
      )
    );
});

const updatePostStatus = asyncHandler(async (req, res, next) => {
  const { postId } = req.params;
  const { status } = req.body;
  if (!postId) {
    throw new ApiError(400, "Post Id is required");
  }
  const post = await Post.findById(postId);
  if (!post) {
    throw new ApiError(404, "Post not found");
  }
  const updatedPost = await Post.findByIdAndUpdate(
    postId,
    {
      status,
    },
    { new: true }
  );
  if (!updatedPost) {
    throw new ApiError(500, "Error in updating post status");
  }
  res
    .status(200)
    .json(
      new ApiResponce(200, updatedPost, "Post status updated successfully")
    );
});

export {
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
  uploadFilesToBucket,
};
