import express from "express";
import authRoute from "./authRoutes.js";
import userRoute from "./userRoutes.js";
import postRoute from "./postRoutes.js";
import eventRoutes from "./eventsRoutes.js";
import roomRouter from "./roomRouter.js";
import hostRouter from "./hostUserRoute.js";
import adminRouter from "./adminRoutes.js";
import msgRouter from "./messageRoute.js";

const router = express.Router();

router.use(`/auth`, authRoute); //auth/register
router.use(`/users`, userRoute);
router.use(`/posts`, postRoute);
router.use(`/events`, eventRoutes);
router.use(`/room`, roomRouter);
router.use(`/host`, hostRouter);
router.use(`/admin`, adminRouter);
router.use(`/chat`, msgRouter);

//working new
// router.use(`/chat`, chatRouter);
// router.use(`/message`, msgChatRouter);
export default router;
