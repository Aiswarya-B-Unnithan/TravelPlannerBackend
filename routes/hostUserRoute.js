import express from "express";
import auth from "../middleware/host/auth.js";
import {
 
  fetchHostLatestInfo,
  reapply,
  updateProfile,
  updateProfileImgae,
  updateStatus,
  uploadToCloudinary,
} from "../controllers/host/host.js";
import checkAccess from "../middleware/checkAccess.js";
import userPermissions from "../middleware/permissions/user/userPermissions.js";
const hostRouter = express.Router();

//hostuser profile update
hostRouter.post("/updateProfile", auth, updateProfile);

hostRouter.post("/updateProfileImage", updateProfileImgae);
hostRouter.post("/upload-to-cloudinary", uploadToCloudinary);
hostRouter.patch(
  "/updateStatus/:userId",
  auth,
  checkAccess(userPermissions.listUsers),
  updateStatus
);
hostRouter.patch("/reapply",auth, reapply);
hostRouter.get("/hostUsers/:hostId",fetchHostLatestInfo);
export default hostRouter;
