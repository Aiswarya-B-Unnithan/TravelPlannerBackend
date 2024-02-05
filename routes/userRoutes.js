import express from "express";
import path from "path";
import {
  acceptRequest,
  changePassword,
  friendRequest,
  getFriendRequest,
  getUser,
  profileViews,
  requestPasswordReset,
  resetPassword,
  suggestedFriends,
  updateUser,
  verifyEmail,
  fetchAllUsers,
  makeUnfriend,
  profileUpdate,
  getAllContacts,
  reportRoom,
  addNotification,
  getNotification,
  markAsRead,
  reportTraveler,
} from "../controllers/userController.js";
import userAuth from "../middleware/authMiddleware.js";

const router = express.Router();
const __dirname = path.resolve(path.dirname(""));

router.get("/verify/:userId/:token", verifyEmail);
// PASSWORD RESET
router.post("/request-passwordreset", requestPasswordReset);
router.get("/reset-password/:userId/:token", resetPassword);
router.post("/reset-password", changePassword);

// user routes
router.post("/get-user/:id?", userAuth, getUser);
router.put("/update-user", updateUser);

// friend request
router.post("/friend-request", userAuth, friendRequest);
router.post("/get-friend-request", userAuth, getFriendRequest);
router.post("/checkFriendRequestStatus", userAuth, checkFriendRequestStatus);

// accept / deny friend request
router.post("/accept-request", userAuth, acceptRequest);

//unfriend
router.post("/unfriend", userAuth, makeUnfriend);

// view profile
router.post("/profile-view", userAuth, profileViews);

//suggested friends
router.post("/suggested-friends", userAuth, suggestedFriends);

router.get("/verified", (req, res) => {
  res.sendFile(path.join(__dirname, "./views/build", "index.html"));
});

router.get("/resetpassword", (req, res) => {
  res.sendFile(path.join(__dirname, "./views/build", "index.html"));
});

router.get("/all", userAuth, fetchAllUsers);

router.get("/allContacts", userAuth, getAllContacts);

//report a room
router.post("/reportedRooms/submitReport", userAuth, reportRoom);
//REPORT TRAVELER
router.post("/report", userAuth, reportTraveler);
router.post("/addNotificationToDb", userAuth, addNotification);
router.get("/getNotification/:userId", userAuth, getNotification);
router.patch("/mark-notification-as-read/:notificationId",markAsRead);
export default router;
