import mongoose, { Schema } from "mongoose";

const reportedTravelerSchema = new mongoose.Schema({
  reportedTravelerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  reportingTravelerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  reason: {
    type: String,
    required: true,
    required:true
  },
  createdAt: { type: Date, default: Date.now },
});

const ReportedTravelers = mongoose.model("ReportedTravelers", reportedTravelerSchema);

export default ReportedTravelers;
