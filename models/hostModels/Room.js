import mongoose, { Schema } from "mongoose";
const roomSchema = new mongoose.Schema(
  {
    lng: { type: Number, required: true },
    lat: { type: Number, required: true },
    price: { type: Number, min: 0, max: 50, default: 0 },
    title: { type: String, required: true, minLength: 5, maxLength: 150 },
    description: {
      type: String,
      required: true,
      minLength: 10,
      maxLength: 1000,
    },
    isDelete: {
      type: Boolean,
      default: false,
    },
    isBlock: {
      type: Boolean,
      default: false,
    },
    rId: {
      type: String,
      default: "R000",
      unique: true,
    },
    images: {
      type: [String],
      validate: (v) => Array.isArray(v) && v.length > 0,
    },
    ratings: [
      {
        type: Number,
        min: 1,
        max: 5,
      },
    ],
    averageRating: { type: Number, default: 0 },
    comments: [
      {
        userName: {
          type: String,
          required: true,
        },
        text: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    uid: { type: String, required: true },
    uName: { type: String, required: true },
    uPhoto: { type: String, default: "" },
  },

  { timestamps: true }
);

const Room = mongoose.model("Room", roomSchema);

export default Room;
