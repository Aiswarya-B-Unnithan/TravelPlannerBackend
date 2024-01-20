import bcrypt from "bcryptjs";
import Users from "../../models/userModel.js";
import jwt from "jsonwebtoken";
import tryCatch from "./utils/tryCatch.js";
import Room from "../../models/hostModels/Room.js";
import cloudinary from "cloudinary";
import RejectedHosts from "../../models/hostModels/rejectedHostModel.js";

export const updateProfile = async (req, res) => {
  const fields = req.body?.url
    ? { firstName: req.body.name, profileUrl: req.body.url }
    : { firstName: req.body.name };
  const updatedUser = await Users.findByIdAndUpdate(req.user.userId, fields, {
    new: true,
  });
  const { _id: id, firstName, lastName, profileUrl, role } = updatedUser;

  await Room.updateMany({ uid: id }, { uName: firstName, uPhoto: profileUrl });

  const token = jwt.sign(
    { id, firstName, profileUrl, role },
    process.env.JWT_SECRET,
    {
      expiresIn: "1h",
    }
  );
  res
    .status(200)
    .json({ success: true, result: { firstName, profileUrl, token } });
};

export const updateStatus = tryCatch(async (req, res) => {
  const { role, Active } = req.body;
  await Users.findByIdAndUpdate(req.params.userId, { role, Active });
  res.status(200).json({ success: true, result: { _id: req.params.userId } });
});

export const updateProfileImgae = async (req, res) => {
  const { file } = req.body;
  const uploadResponse = await cloudinary.v2.uploader.upload(file);
  res.status(200).json({
    success: true,
    message: "ProfilePicture updated successfully",
    data: uploadResponse,
  });
};

export const uploadToCloudinary = async (req, res) => {
  const { file } = req.body;
  const uploadResponse = await cloudinary.v2.uploader.upload(file);
  res.status(200).json({
    success: true,
    message: "ProfilePicture updated successfully",
    data: uploadResponse,
  });
};

export const reapply = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if the host's email is in the RejectedHosts collection
    const rejectedHost = await RejectedHosts.findOne({ hostEmail: email });

    if (rejectedHost) {
      // Check rejection count
      if (rejectedHost.rejectionCount > 3) {
        return res.status(403).json({
          success: false,
          message: "Host cannot reapply, rejection count exceeded,Contact admin for further details",
        });
      }

      // Reset adminVerification status to "pending" and update other information
      const updatedUser = await Users.findOneAndUpdate(
        { email },
        { adminVerification: "pending" /* other fields */ },
        { new: true } // Return the updated document
      );

      // // Remove the host from the RejectedHosts collection
      // await RejectedHosts.findOneAndDelete({ hostEmail: email });

      res
        .status(200)
        .json({ success: true, result: updatedUser, message: "Re-applied" });
    } else {
      res
        .status(404)
        .json({ success: false, message: "Host not found in rejected list" });
    }
  } catch (error) {
    console.error("Error during reapplication:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};


export const fetchHostLatestInfo=async(req,res)=>{
 const hostId = req.params.hostId;

 try {
   const user = await Users.findById(hostId);

   if (!user) {
     return res.status(404).json({ message: "User not found" });
   }

   res.status(200).json(user);
 } catch (error) {
   console.error("Error fetching user:", error);
   res.status(500).json({ message: "Internal Server Error" });
 }
}