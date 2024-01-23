import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import bodyParser from "body-parser";
import path from "path";
// Security packages
import helmet from "helmet";
import dbConnection from "./dbConfig/index.js";
import errorMiddleware from "./middleware/errorMiddleware.js";
import router from "./routes/index.js";
import cloudinary from "cloudinary";
import { Server } from "socket.io";

const __dirname = path.resolve(path.dirname(""));

dotenv.config();

const app = express();

app.use(express.static(path.join(__dirname, "views/build")));

const PORT = process.env.PORT || 3000;

dbConnection();

app.use(helmet());
app.use(cors());

app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));
app.use("/public", express.static(path.join(__dirname, "public")));

app.use(morgan("dev"));
app.use(router);
cloudinary.v2.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Define onlineUsers map
const onlineUsers = new Map();

// error middleware
// app.use(errorMiddleware);

const server = app.listen(PORT);

const io = new Server(server, {
  cors: {
    origin: "https://travelplanneronline.netlify.app",
    credentials: true,
  },
});

io.on("connection", (socket) => {
  socket.on("add-user", (userId, chatId) => {
      alert("newuser is added to socket: " + userId);
    socket.join(chatId);
    const soketId = socket?.id;
    onlineUsers.set(userId, soketId);

    const onlineUsersArray = Array.from(onlineUsers.keys());
    io.emit("update-online-status", onlineUsersArray);
    io.emit("getOnlineUsers", onlineUsersArray);
    io.emit("socket-setup", socket.id);
    alert("onlineusersfrom serrver: " + onlineUsersArray);

    //--------------------------------------------------->
    socket.on("send-msg", (data) => {
      const sendUserSocket = onlineUsers.get(data.to);
 alert("sendUserSocket serrver: " + sendUserSocket);
      if (sendUserSocket) {
        io.to(sendUserSocket).emit("msg-recieve", data.msg, data.to);
      }
    });
    //--------------------------------------------------->
    socket.on("mark-as-read", ({ senderId, userId }) => {
      // Emit an event to inform other clients that the message is read
      io.emit("new-message", { senderId });
    });
    //--------------------------------------------------->
  });
  socket.on("post-like", (likeDetails) => {
    // Broadcast the event to all connected clients
    socket.broadcast.emit("new-like-event", likeDetails);
  });
  socket.on("event-created", (eventDetails) => {
    // Broadcast the event to all connected clients
    socket.broadcast.emit("new-event", eventDetails);
  });
  socket.on("commentadded", (commentData) => {
    // Additional processing or emitting can be done here
    socket.broadcast.emit("newComment", commentData);
  });

  socket.on("post-created", (postDetails) => {
    socket.broadcast.emit("new-post", postDetails); // emitting "new-post" event
  });

  socket.on("disconnect", () => {
    const userId = getUserIdBySocketId(socket.id);
    onlineUsers.delete(userId);
    const onlineUsersArray = Array.from(onlineUsers.keys());
    io.emit("update-online-status", onlineUsersArray);
    console.log("user is disconnected");
    console.log(`Socket ${socket.id} disconnected`);
  });
});

const getUserIdBySocketId = (socketId) => {
  for (const [userId, socket] of onlineUsers) {
    if (socket === socketId) {
      return userId;
    }
  }
  return null;
};
