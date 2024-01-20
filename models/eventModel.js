import mongoose, { Schema } from "mongoose";

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  // participants: [
  //   {
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: "Users",
  //   },
  // ],
});

const Event = mongoose.model("Event", eventSchema);

export default Event;
