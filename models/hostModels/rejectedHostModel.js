

import mongoose from "mongoose";

const rejectedHostsSchema = mongoose.Schema({
  hostName: {
    type: String,
    required: true,
  },
  hostEmail: {
    type: String,
    required: true,
  },
  rejectionCount: {
    type: Number,
    default: 1,
    validate: {
      validator: function (value) {
        return value <= 3; 
      },
      message: "Rejection count cannot exceed 3.",
    },
  },
  rejectionReason: {
    type: String,
    required: true,
  },
  rejectionTimestamp: {
    type: Date,
    default: Date.now,
  },
});

const RejectedHosts = mongoose.model("RejectedHosts", rejectedHostsSchema);

export default RejectedHosts;
