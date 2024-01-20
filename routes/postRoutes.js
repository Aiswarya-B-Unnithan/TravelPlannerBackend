import express from "express";
import userAuth from "../middleware/authMiddleware.js";
import {
  commentPost,
  createPost,
  deletePost,
  editPost,
  getComments,
  getPost,
  getPosts,
  getUserPost,
  likePost,
  likePostComment,
  replyPostComment,
  videoUploding,
} from "../controllers/postController.js";
import { upload } from "../middleware/multer.js";

const router = express.Router();
router.post("/edit", userAuth, editPost);

// crete post

router.post("/create-post", userAuth, createPost);
// get posts
router.post("/", userAuth, getPosts);
router.post("/:id", userAuth, getPost);
//EDIT POST

router.post("/get-user-post/:id", userAuth, getUserPost);

//videopost

router.post("/upload-video", upload.single("video"), videoUploding);
// get comments
router.get("/comments/:postId", getComments);

//like and comment on posts
router.post("/like/:id", userAuth, likePost);
router.post("/like-comment/:id/:rid?", userAuth, likePostComment);
router.post("/comment/:id", userAuth, commentPost);
router.post("/reply-comment/:id", userAuth, replyPostComment);

//delete post
router.delete("/:id", userAuth, deletePost);

export default router;
