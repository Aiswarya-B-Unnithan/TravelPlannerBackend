import mongoose from "mongoose";
import Verification from "../models/emailVerification.js";
import Users from "../models/userModel.js";
import { compareString, createJWT, hashString } from "../utils/index.js";
import PasswordReset from "../models/PasswordReset.js";
import { resetPasswordLink } from "../utils/sendEmail.js";
import FriendRequest from "../models/friendRequest.js";
import cloudinary from "cloudinary";
import ReportedRooms from "../models/reportedRooms.js";
import Notification from "../models/notificationModel.js";
import ReportedTravelers from "../models/reportedTravelers.js";

export const verifyEmail = async (req, res) => {
  const { userId, token } = req.params;

  try {
    const result = await Verification.findOne({ userId });

    if (result) {
      const { expiresAt, token: hashedToken } = result;

      // token has expires
      if (expiresAt < Date.now()) {
        Verification.findOneAndDelete({ userId })
          .then(() => {
            Users.findOneAndDelete({ _id: userId })
              .then(() => {
                const message = "Verification token has expired.";
                res.redirect(`/users/verified?status=error&message=${message}`);
              })
              .catch((err) => {
                res.redirect(`/users/verified?status=error&message=`);
              });
          })
          .catch((error) => {
            console.log(error);
            res.redirect(`/users/verified?message=`);
          });
      } else {
        //token valid
        compareString(token, hashedToken)
          .then((isMatch) => {
            if (isMatch) {
              Users.findOneAndUpdate({ _id: userId }, { verified: true })
                .then(() => {
                  Verification.findOneAndDelete({ userId }).then(() => {
                    const message = "Email verified successfully";
                    res.redirect(
                      `/users/verified?status=success&message=${message}`
                    );
                  });
                })
                .catch((err) => {
                  console.log(err);
                  const message = "Verification failed or link is invalid";
                  res.redirect(
                    `/users/verified?status=error&message=${message}`
                  );
                });
            } else {
              // invalid token
              const message = "Verification failed or link is invalid";
              res.redirect(`/users/verified?status=error&message=${message}`);
            }
          })
          .catch((err) => {
            console.log(err);
            res.redirect(`/users/verified?message=`);
          });
      }
    } else {
      const message = "Invalid verification link. Try again later.";
      res.redirect(`/users/verified?status=error&message=${message}`);
    }
  } catch (error) {
    console.log(err);
    res.redirect(`/users/verified?message=`);
  }
};

export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await Users.findOne({ email });

    if (!user) {
      return res.status(404).json({
        status: "FAILED",
        message: "Email address not found.",
      });
    }

    const existingRequest = await PasswordReset.findOne({ email });
    if (existingRequest) {
      if (existingRequest.expiresAt > Date.now()) {
        return res.status(201).json({
          status: "PENDING",
          message: "Reset password link has already been sent tp your email.",
        });
      }
      await PasswordReset.findOneAndDelete({ email });
    }
    await resetPasswordLink(user, res);
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  const { userId, token } = req.params;

  try {
    // find record
    const user = await Users.findById(userId);

    if (!user) {
      const message = "Invalid password reset link. Try again";
      res.redirect(`/users/resetpassword?status=error&message=${message}`);
    }

    const resetPassword = await PasswordReset.findOne({ userId });

    if (!resetPassword) {
      const message = "Invalid password reset link. Try again";
      return res.redirect(
        `/users/resetpassword?status=error&message=${message}`
      );
    }

    const { expiresAt, token: resetToken } = resetPassword;

    if (expiresAt < Date.now()) {
      const message = "Reset Password link has expired. Please try again";
      res.redirect(`/users/resetpassword?status=error&message=${message}`);
    } else {
      const isMatch = await compareString(token, resetToken);

      if (!isMatch) {
        const message = "Invalid reset password link. Please try again";
        res.redirect(`/users/resetpassword?status=error&message=${message}`);
      } else {
        res.redirect(`/users/resetpassword?type=reset&id=${userId}`);
      }
    }
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { userId, password } = req.body;

    const hashedpassword = await hashString(password);

    const user = await Users.findByIdAndUpdate(
      { _id: userId },
      { password: hashedpassword }
    );

    if (user) {
      await PasswordReset.findOneAndDelete({ userId });

      res.status(200).json({
        ok: true,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const getUser = async (req, res, next) => {
  try {
    const { userId } = req.body.user;
    const { id } = req.params;
    

    const user = await Users.findById(id ?? userId).populate({
      path: "friends",
      select: "-password",
    });

    if (!user) {
      return res.status(200).send({
        message: "User Not Found",
        success: false,
      });
    }

    user.password = undefined;

    res.status(200).json({
      success: true,
      user: user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "auth error",
      success: false,
      error: error.message,
    });
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      location,
      profileUrl,
      profession,
      travelPreference,
    } = req.body;

    if (
      !(
        firstName ||
        lastName ||
        contact ||
        profession ||
        location ||
        travelPreference
      )
    ) {
      next("Please provide all required fields");
      return;
    }

    const { userId } = req.body;
    

    // Create the updateUser object without profileUrl
    const updateUser = {
      firstName,
      lastName,
      location,
      profession,
      travelPreference,
      _id: userId,
    };

    if (profileUrl) {
      const uploadResponse = await cloudinary.v2.uploader.upload(profileUrl);
      updateUser.profileUrl = uploadResponse.url;
    }

    const user = await Users.findByIdAndUpdate(userId, updateUser, {
      new: true,
    });
  

    await user.populate({ path: "friends", select: "-password" });
    const token = createJWT(user?._id);

    user.password = undefined;

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user,
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const friendRequest = async (req, res, next) => {
  try {
    const { userId } = req.body.user;
    const { requestTo } = req.body;

    // Fetch sender and receiver usernames
    const [sender, receiver] = await Promise.all([
      Users.findById(userId).select("firstName"), // Fetch sender's username
      Users.findById(requestTo).select("firstName"), // Fetch receiver's username
    ]);
    const requestExist = await FriendRequest.findOne({
      requestFrom: userId,
      requestTo,
    });

    if (requestExist) {
      next("Friend Request already sent.");
      return;
    }

    const accountExist = await FriendRequest.findOne({
      requestFrom: requestTo,
      requestTo: userId,
    });

    if (accountExist) {
      next("Friend Request already sent.");
      return;
    }

    const newRes = await FriendRequest.create({
      requestTo,
      requestFrom: userId,
    });

    res.status(201).json({
      success: true,
      data: {
        sender: sender.firstName,
        senderId: userId,
        receiverId: requestTo,
        receiver: receiver.firstName,
        friendRequest: newRes,
      },
      message: "Friend Request sent successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "auth error",
      success: false,
      error: error.message,
    });
  }
};

export const getFriendRequest = async (req, res) => {
  try {
    const { userId } = req.body.user;

    const request = await FriendRequest.find({
      requestTo: userId,
      requestStatus: "Pending",
    })
      .populate({
        path: "requestFrom",
        select: "firstName lastName profileUrl profession -password",
      })
      .limit(10)
      .sort({
        _id: -1,
      });

    res.status(200).json({
      success: true,
      data: request,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "auth error",
      success: false,
      error: error.message,
    });
  }
};

export const acceptRequest = async (req, res, next) => {
  try {
    const id = req.body.user.userId;

    const { rid, status } = req.body;

    const requestExist = await FriendRequest.findById(rid);

    if (!requestExist) {
      next("No Friend Request Found.");
      return;
    }

    const newRes = await FriendRequest.findByIdAndUpdate(
      { _id: rid },
      { requestStatus: status }
    );

    if (status === "Accepted") {
      const user = await Users.findById(id);

      user.friends.push(newRes?.requestFrom);

      await user.save();

      const friend = await Users.findById(newRes?.requestFrom);

      friend.friends.push(newRes?.requestTo);

      await friend.save();
    }

    res.status(201).json({
      success: true,
      message: "Friend Request " + status,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "auth error",
      success: false,
      error: error.message,
    });
  }
};

export const profileViews = async (req, res, next) => {
  try {
    const { userId } = req.body.user;
    const { id } = req.body;
    
    const user = await Users.findById(id);

    user.views.push(userId);

    await user.save();

    res.status(201).json({
      success: true,
      message: "Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "auth error",
      success: false,
      error: error.message,
    });
  }
};

export const suggestedFriends = async (req, res) => {
  try {
    const { userId } = req.body.user;

    // Get the user's travel preference
    const user = await Users.findById(userId).select("travelPreference");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userTravelPreference = user.travelPreference;

    // Query for suggested friends with the same travel preference
    const suggestedFriends = await Users.find({
      _id: { $ne: userId },
      friends: { $nin: userId },
      travelPreference: userTravelPreference, // Add this line to filter by travel preference
    })
      .limit(15)
      .select("firstName lastName profileUrl profession -password");

    res.status(200).json({
      success: true,
      data: suggestedFriends,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const fetchAllUsers = async (req, res) => {
  try {
    // Assuming you have a User model
    const users = await Users.find({ role: "Traveler" }).select("-password");

    res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

export const makeUnfriend = async (req, res, next) => {

  try {
    const userId = req.body.user.userId;
    const friendId = req.body.friendId;
    const user = await Users.findById(userId);
    const friend = await Users.findById(friendId);

    if (!user || !friend) {
      next("User or friend not found.");
      return;
    }

    // Remove friend from user's friends list
    user.friends = user.friends.filter(
      (userFriend) => userFriend._id.toString() !== friendId
    );
    await user.save();

    // Remove user from friend's friends list
    friend.friends = friend.friends.filter(
      (friendFriend) => friendFriend._id.toString() !== userId
    );
    await friend.save();

    // Delete the friend request record where the current user sent a request to the friend
    await FriendRequest.findOneAndDelete({
      requestTo: userId,
      requestFrom: friendId,
      requestStatus: "Accepted",
    });

    // Delete the friend request record where the friend sent a request to the current user
    await FriendRequest.findOneAndDelete({
      requestTo: friendId,
      requestFrom: userId,
      requestStatus: "Accepted",
    });

    return res.status(200).json({
      success: true,
      message: "Unfriended successfully.",
    });
  } catch (error) {
    console.log("err", error);
    res.status(500).json({
      message: "Error unfriending user",
      success: false,
      error: error.message,
    });
  }
};

export const profileUpdate = async (req, res) => {
  console.log("update host profile");
};

export const getAllContacts = async (req, res) => {
  const { userId } = req.body.user;
  try {
    const user = await Users.findById(userId).populate("friends");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Extract friends from the user document
    const friends = user.friends;

    res.status(200).json({ friends });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
export const reportRoom = async (req, res) => {
  const { roomId, userId, reportReason } = req.body;
  try {
    // Save the report information to the database
    const report = new ReportedRooms({
      roomId,
      reportedUser: userId,
      reason: reportReason,
      timestamp: Date.now(),
    });

    await report.save();

    // Respond with success status
    res.status(200).json({ message: "Report submitted successfully" });
  } catch (err) {
    console.log(err);
  }
};
export const reportTraveler = async (req, res) => {
  const { reportedUser, reason } = req.body;
  console.log("reporting", reportedUser, reason);
  const reportingUser = req.body.user.userId;



  try {
    // Check if a report already exists for the same pair of users
    const existingReport = await ReportedTravelers.findOne({
      reportedTravelerId: reportedUser,
      reportingTravelerId: reportingUser,
    });

    if (existingReport) {
      // Report already exists, send a response indicating that the user cannot report the same person twice
      return res.status(400).json({
        success: false,
        message: "You have already reported this person.",
      });
    }

    // If no existing report, create a new report
    const newReportedTraveler = new ReportedTravelers({
      reportedTravelerId: reportedUser,
      reportingTravelerId: reportingUser,
      reason,
    });

    const savedReportedTraveler = await newReportedTraveler.save();

    res.status(200).json({ success: true, data: savedReportedTraveler });
  } catch (error) {
    console.error("Error saving reported traveler:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const addNotification = async (req, res) => {
  try {
    const { userId, userName, message, timestamp, receiverId } = req.body;
    const notification = new Notification({
      userId,
      userName,
      message,
      timestamp,
    });
    await notification.save();
    res.status(201).json({
      success: true,
      message: "Notification saved.",
      data: notification,
    });
  } catch (error) {
    console.log("Error saving notification:", error);
    res.status(500).json({ success: false, message: "Internal Server Error." });
  }
};

export const getNotification = async (req, res) => {
  try {
    const userId = req.params.userId;

    const notifications = await Notification.find({
      userId: userId,
    })
      .sort({ createdAt: -1 })
      .limit(3);

    res.status(200).json({ notifications });
  } catch (error) {
    console.error("Error in getNotification:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const markAsRead = async (req, res) => {
  const { notificationId } = req.params;

  try {
    // Find the notification by ID and update the isRead property
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    // Send the updated notification as a response
    res.status(200).json({ notification });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
