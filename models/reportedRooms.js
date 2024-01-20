import mongoose, { Schema } from "mongoose";
import Room from "./hostModels/Room.js"
const reportedRoomSchema = new mongoose.Schema({
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Room",
    required: true,
  },
  reportedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const ReportedRoom = mongoose.model("ReportedRoom", reportedRoomSchema);

export default ReportedRoom;
