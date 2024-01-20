import Comments from "../models/commentModel.js";
import Posts from "../models/postModel.js";
import Users from "../models/userModel.js";
import cloudinary from "cloudinary";

export const createPost = async (req, res, next) => {
  try {
    const { userId } = req.body.user;
    const { description, images } = req.body;
    // if (!description) {
    //   next("You must provide a description");
    //   return;
    // }
    const user = await Users.findById(userId);
    let imageUrls = [];

    if (images && images.length > 0) {
      // If there are images, upload each one to Cloudinary
      for (const image of images) {
        const uploadResponse = await cloudinary.v2.uploader.upload(image);
        imageUrls.push(uploadResponse.url);
      }
    }

    // Create the post with or without images based on the condition
    const post = await Posts.create({
      userId,
      description,
      images: imageUrls,
    });

    res.status(200).json({
      success: true,
      message: "Post created successfully",
      data: post,
      userName: `${user.firstName} ${user.lastName}`,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const videoUploding = async (req, res, next) => {
  const videoData = req.file;
};
export const getPosts = async (req, res, next) => {
  try {
    const data = req.body;
    const { userId } = req.body.user;
    const { search } = req.body;
    const user = await Users.findById(userId);
    const friends = user?.friends?.toString().split(",") ?? [];
    friends.push(userId);

    const searchPostQuery = {
      $or: [
        {
          description: { $regex: search, $options: "i" },
        },
      ],
    };

    const posts = await Posts.find(
      search ? searchPostQuery : { isDeleted: false }
    )
      .populate({
        path: "userId",
        select: "firstName lastName location profileUrl -password",
      })
      .sort({ _id: -1 });

    const friendsPosts = posts?.filter((post) => {
      return (
        friends.includes(post?.userId?._id.toString()) ||
        post?.userId?._id.toString() === userId
      );
    });

    res.status(200).json({
      success: true,
      message: "Successfully fetched posts",
      data: friendsPosts,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};


export const getPost = async (req, res, next) => {
  try {
    const { id } = req.params;

    const post = await Posts.find({ userId: id, isDeleted: false }).populate({
      path: "userId",
      select: "firstName lastName location profileUrl -password",
    });
    // .populate({
    //   path: "comments",
    //   populate: {
    //     path: "userId",
    //     select: "firstName lastName location profileUrl -password",
    //   },
    //   options: {
    //     sort: "-_id",
    //   },
    // })
    // .populate({
    //   path: "comments",
    //   populate: {
    //     path: "replies.userId",
    //     select: "firstName lastName location profileUrl -password",
    //   },
    // });

    res.status(200).json({
      sucess: true,
      message: "successfully",
      data: post,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const getUserPost = async (req, res, next) => {
  try {
    const { id } = req.params;

    const post = await Posts.find({ userId: id, isDeleted: false })
      .populate({
        path: "userId",
        select: "firstName lastName location profileUrl -password",
      })
      .sort({ _id: -1 });

    res.status(200).json({
      sucess: true,
      message: "successfully",
      data: post,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const getComments = async (req, res, next) => {
  try {
    const { postId } = req.params;

    const postComments = await Comments.find({ postId })
      .populate({
        path: "userId",
        select: "firstName lastName location profileUrl -password",
      })
      .populate({
        path: "replies.userId",
        select: "firstName lastName location profileUrl -password",
      })
      .sort({ _id: -1 });

    res.status(200).json({
      sucess: true,
      message: "successfully",
      data: postComments,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const likePost = async (req, res, next) => {
  
  try {
    const { userId } = req.body.user;
    const { id } = req.params;

    const post = await Posts.findById(id);

    const index = post.likes.findIndex((pid) => pid === String(userId));

    if (index === -1) {
      post.likes.push(userId);
    } else {
      post.likes = post.likes.filter((pid) => pid !== String(userId));
    }

    const newPost = await Posts.findByIdAndUpdate(id, post, {
      new: true,
    });
    // Fetch the user information for post creator (organizer)
    const postCreator = await Users.findById(post?.userId);

    // Fetch the user information for the user who liked the post
    const likedUser = await Users.findById(userId);
    res.status(200).json({
      success: true,
      message: "successfully",
      data: newPost,
      creator: postCreator.firstName,
      likedUser: likedUser.firstName,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const likePostComment = async (req, res, next) => {
  const { userId } = req.body.user;
  const { id, rid } = req.params;

  try {
    if (rid === undefined || rid === null || rid === `false`) {
      const comment = await Comments.findById(id);

      const index = comment.likes.findIndex((el) => el === String(userId));

      if (index === -1) {
        comment.likes.push(userId);
      } else {
        comment.likes = comment.likes.filter((i) => i !== String(userId));
      }

      const updated = await Comments.findByIdAndUpdate(id, comment, {
        new: true,
      });

      res.status(201).json(updated);
    } else {
      const replyComments = await Comments.findOne(
        { _id: id },
        {
          replies: {
            $elemMatch: {
              _id: rid,
            },
          },
        }
      );

      const index = replyComments?.replies[0]?.likes.findIndex(
        (i) => i === String(userId)
      );

      if (index === -1) {
        replyComments.replies[0].likes.push(userId);
      } else {
        replyComments.replies[0].likes = replyComments.replies[0]?.likes.filter(
          (i) => i !== String(userId)
        );
      }

      const query = { _id: id, "replies._id": rid };

      const updated = {
        $set: {
          "replies.$.likes": replyComments.replies[0].likes,
        },
      };

      const result = await Comments.updateOne(query, updated, { new: true });

      res.status(201).json(result);
    }
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const commentPost = async (req, res, next) => {
  try {
    const { comment, from } = req.body;
    const { userId } = req.body.user;
    const { id } = req.params;

    if (comment === null) {
      return res.status(404).json({ message: "Comment is required." });
    }

    const newComment = new Comments({ comment, from, userId, postId: id });

    await newComment.save();

    // Fetch the post details
    const post = await Posts.findById(id).populate(
      "userId",
      "description firstName"
    );

    // updating the post with the comments id
    post.comments.push(newComment._id);

    const updatedPost = await Posts.findByIdAndUpdate(id, post, {
      new: true,
    });

    // Send the response with post details
    res
      .status(201)
      .json({
        newComment:newComment.comment,
        newCommentFrom:newComment.from,
        postDescription: post.description,
        userName: post.userId.firstName,
      });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};


export const replyPostComment = async (req, res, next) => {
  const { userId } = req.body.user;
  const { comment, replyAt, from } = req.body;
  const { id } = req.params;

  if (comment === null) {
    return res.status(404).json({ message: "Comment is required." });
  }

  try {
    const commentInfo = await Comments.findById(id);

    commentInfo.replies.push({
      comment,
      replyAt,
      from,
      userId,
      created_At: Date.now(),
    });

    commentInfo.save();

    res.status(200).json(commentInfo);
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const deletePost = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Instead of physically deleting the post, update the isDeleted field
    const updatedPost = await Posts.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );

    if (!updatedPost) {
      // If the post with the given id is not found
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    res.status(200).json({
      success: true,
      message: "Soft deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
// Update an existing post
export const editPost = async (req, res, next) => {
  try {
    
    const { postId, description } = req.body;
  
    const { userId } = req.body.user;
    // const { description, image } = req.body;

    if (!description) {
      next("You must provide a description");
      return;
    }

    // Check if the post belongs to the user
    const post = await Posts.findOne({ _id: postId, userId });

    if (!post) {
      next("Post not found or you don't have permission to edit it");
      return;
    }

    // Update the post
    post.description = description;
    // post.image = image;
    await post.save();

    res.status(200).json({
      success: true,
      message: "Post updated successfully",
      data: post,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};
