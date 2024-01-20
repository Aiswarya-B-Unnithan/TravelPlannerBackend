import express from "express";

import { createEvent, deleteEvent, getEvents } from "../controllers/eventController.js";
import userAuth from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create",userAuth, createEvent);

// get events
router.post("/", userAuth, getEvents);

//delete post
router.delete("/:id", userAuth, deleteEvent);
export default router;
