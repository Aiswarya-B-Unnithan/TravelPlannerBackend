import express from "express";
import {
  approveRequests,
  fetchRequests,
  getHostUsers,
  rejectRequests,
  reportedRooms,
  reportedTravelers,
  sendMail,
} from "../controllers/admin/adminController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import checkAccess from "../middleware/checkAccess.js";
import userPermissions from "../middleware/permissions/user/userPermissions.js";
import auth from "../middleware/host/auth.js";

const adminRouter = express.Router();
adminRouter.get(
  "/",
  auth,
  checkAccess(userPermissions.listUsers),
  getHostUsers
);
adminRouter.get("/requests", auth, fetchRequests);
adminRouter.put("/approve/:requestId", auth, approveRequests);
adminRouter.put("/reject/:requestId", auth, rejectRequests);
adminRouter.get("/reportedRooms", auth, reportedRooms);
adminRouter.get("/reportedUsers", auth, reportedTravelers);
adminRouter.post("/sendMail",auth,sendMail)
export default adminRouter;
