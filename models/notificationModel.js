import mongoose, { Schema } from "mongoose";

const notificationSchema = Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "Users" },
    userName: { type: String, required: true },
    receiverId: { type: Schema.Types.ObjectId, ref: "Users" }, // Optional, if there's a receiver
    message: { type: String, required: true },
    isRead:{type:Boolean,default:false},
    timestamp: { type: String },
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
