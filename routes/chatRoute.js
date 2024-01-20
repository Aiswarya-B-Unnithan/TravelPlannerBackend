import express from "express";
import { createChat, findChat, findUserChats } from "../controllers/chatController.js";


const chatRouter = express.Router();

chatRouter.post("/createChat",createChat );
chatRouter.get("/findUserChats/:userId",findUserChats );
chatRouter.get("/findChat/:firstId/:secondId",findChat);

export default chatRouter;
