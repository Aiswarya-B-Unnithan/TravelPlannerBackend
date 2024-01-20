import Users from "../../models/userModel.js";
import RejectedHosts from "../../models/hostModels/rejectedHostModel.js";
import tryCatch from "../host/utils/tryCatch.js";
import ReportedTravelers from "../../models/reportedTravelers.js"
import {
  sendApprovalEmail,
  sendRejectionEmail,
  sendEmail,
} from "../../utils/sendEmail.js";
import ReportedRoom from "../../models/reportedRooms.js";

export const getHostUsers = tryCatch(async (req, res) => {

  const hostUsers = await Users.find().sort({ _id: -1 });

  res.status(200).json({ success: true, result: hostUsers });
});
export const fetchRequests = tryCatch(async (req, res) => {
  try {
    const requests = await Users.find({
      role: "Host",
      adminVerification: "pending",
    });
    res.status(200).json({ success: true, result: requests });
  } catch (error) {
    console.error("Error fetching requests:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});
export const approveRequests = tryCatch(async (req, res) => {
  const { requestId } = req.params;

  try {
    // Find the user by ID and update the adminVerification status
    const updatedUser = await Users.findByIdAndUpdate(
      requestId,
      { adminVerification: "approved" },
      { new: true } // Return the updated document
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, error: "User not found" });
    }
    // Send approval email
    await sendApprovalEmail(updatedUser.email);
    res.status(200).json({ success: true, result: updatedUser });
  } catch (error) {
    console.error("Error while approving request:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

export const rejectRequests = tryCatch(async (req, res) => {
  const { requestId } = req.params;
  const { rejectionReason } = req.body;
  try {
    // Find the user by ID and update the adminVerification status
    const updatedUser = await Users.findByIdAndUpdate(
      requestId,
      { adminVerification: "rejected" },
      { new: true }
    );
    let updatedUserId = updatedUser._id;
    if (!updatedUser) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    // Check if the hostEmail already exists in RejectedHosts
    const existingRejectedHost = await RejectedHosts.findOne({
      hostEmail: updatedUser.email,
    });

    if (existingRejectedHost) {
      let hostId = existingRejectedHost._id;
      // If the hostEmail exists, update the rejectionCount
      await RejectedHosts.findByIdAndUpdate(
        existingRejectedHost._id,
        {
          $inc: { rejectionCount: 1 },
          rejectionReason,
        },
        { new: true }
      );
    } else {
      // If the hostEmail doesn't exist, create a new document in RejectedHosts
      await RejectedHosts.create({
        hostName: updatedUser.firstName,
        hostEmail: updatedUser.email,
        rejectionCount: 1,
        rejectionReason,
      });
    }

    await sendRejectionEmail(updatedUser.email, rejectionReason);
    res.status(200).json({ success: true, result: updatedUser });
  } catch (error) {
    console.error("Error while approving request:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});
export const reportedRooms = async (req, res) => {
  try {
    const reportedRoomsByUser = await ReportedRoom.find()
      .populate({
        path: "roomId",
        model: "Room",
        select: "title uName images description price lat lng isDelete",
      })
      .populate({
        path: "reportedUser",
        model: "Users",
        select: "firstName",
      });

    // Filter out reported rooms where associated room has isDeleted set to true
    const filteredReportedRooms = reportedRoomsByUser.filter(
      (reportedRoom) => !reportedRoom?.roomId?.isDelete
    );

    res.json(filteredReportedRooms);
  } catch (error) {
    console.log("Error getting reported rooms:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const reportedTravelers = async (req, res) => {
  try {
    const reportedTravelers = await ReportedTravelers.find()
      .populate("reportedTravelerId", "firstName lastName")
      .populate("reportingTravelerId", "firstName lastName");

    res.status(200).json({ success: true, data: reportedTravelers });
  } catch (error) {
    console.error("Error fetching reported travelers:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
export const sendMail=async(req,res)=>{
  
  const{recipientEmail,emailContent}=req.body
 await sendEmail(recipientEmail, emailContent);
   res.status(200).json({ success: true, result:"Email Send Successfully" });

}