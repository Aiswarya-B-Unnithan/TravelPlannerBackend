import { Router } from "express";
const msgRouter = Router();
import multer from "multer";

import {
  addImgMsg,
  addMessage,
  fetchUnreadCount,
  fetchUnreadMsgSender,
  filemsg,
  getMessages,
  markAsRead,
  videomsg,
  voicemsg,
} from "../controllers/messagesController.js";
import auth from "../middleware/host/auth.js";
const storage = multer.memoryStorage(); // Store the file in memory as a buffer
const upload = multer({ storage: storage });
msgRouter.get("/getmsg/", getMessages);
msgRouter.post("/addmsg/", addMessage);
msgRouter.post("/addImgmsg/", upload.single("image"), addImgMsg);
msgRouter.post("/filemsg/", upload.single("file"), filemsg);
msgRouter.post("/voicemsg/", upload.single("audio"), voicemsg);
msgRouter.post("/videomsg/", upload.single("video"), videomsg);
msgRouter.patch("/mark-chat-as-read/", auth, markAsRead);
msgRouter.get("/fetch-unread-count/", auth, fetchUnreadCount);
msgRouter.get("/fetch-unread-msg_sender/:userId", fetchUnreadMsgSender);

export default msgRouter;
