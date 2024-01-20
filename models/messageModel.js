import mongoose from "mongoose";

const MessageSchema = mongoose.Schema(
  {
    chatId:{
      type:String
    },
    message: {
      type: {
        type: String, 
        required: true,
      },
      content: {
        text: { type: String },
        imageUrl: { type: String },
        voiceUrl: { type: String },
        fileUrl: { type: String },
        videoUrl: { type: String },
      },
    },
    users: Array,
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Messages = mongoose.model("Messages", MessageSchema);

export default Messages;
