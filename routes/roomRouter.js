import { Router } from "express";
import {
  createRoom,
  deleteRoom,
  getRooms,
  getRoomById,
  updateRating,
  blockRoomByAdmin,
  updateRoom,
} from "../controllers/host/room.js";
import auth from "../middleware/host/auth.js";
import { addComment } from "../controllers/host/room.js";
import checkAccess from "../middleware/checkAccess.js";
import userPermissions from "../middleware/permissions/user/userPermissions.js";
import roomPermissions from "../middleware/permissions/room/roomPermissions.js";

const roomRouter = Router();

roomRouter.post("/", auth, createRoom);
roomRouter.get("/", getRooms);
roomRouter.get("/:roomId", getRoomById);
roomRouter.post("/addComment/:roomId", addComment);
roomRouter.post("/updateRating", updateRating);
roomRouter.patch("/blockRoom/:blockingRoomId", blockRoomByAdmin);
roomRouter.patch(
  "/:roomId",
  auth,
  checkAccess(roomPermissions.update),
  updateRoom
);
//RATINGS

roomRouter.delete(
  "/:roomId",
  auth,
  checkAccess(roomPermissions.delete),
  deleteRoom
);
export default roomRouter;
