import mongoose from "mongoose";

const chatSchema = mongoose.Schema(
  {
    members: Array,
  },
  { timestamps: true }
);


  const chatModel = mongoose.model("chatModel", chatSchema);

  export default chatModel;