import mongoose, { Schema } from "mongoose";

//schema
const postSchema = new mongoose.Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "Users" },
    description: { type: String, required: true },
    isDeleted:{type:Boolean,default:false},
    images: [{ type: String }],
    video:{type:String},
    likes: [{ type: String }],
    comments: [{ type: Schema.Types.ObjectId, ref: "Comments" }],
  },
  { timestamps: true }
);

const Posts = mongoose.model("Posts", postSchema);

export default Posts;
