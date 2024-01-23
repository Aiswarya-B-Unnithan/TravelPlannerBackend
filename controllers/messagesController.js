import Messages from "../models/messageModel.js";
import { v4 as uMessagesuidv4 } from "uuid";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";
import mime from "mime-types";
export const getMessages = async (req, res, next) => {
  try {
    const { from, to } = req.query;

    const messages = await Messages.find({
      users: {
        $all: [from, to],
      },
    }).sort({ updatedAt: 1 });

    const projectedMessages = messages.map((msg) => {
      const messageType = msg.message.type;
      const messageContent = getMessageContent(msg.message);
      const isRead = msg.isRead;
      return {
        fromSelf: msg.sender.toString() === from,
        type: messageType,
        content: messageContent,
        createdAt: msg.createdAt,
        isRead: msg.isRead,
      };
    });

    res.json(projectedMessages);
  } catch (ex) {
    next(ex);
  }
};

export const addMessage = async (req, res, next) => {
  try {
    const { from, to, message } = req.body;
    const { type, content } = message;

    let data;

    if (type === "text") {
      // For text messages
      data = await Messages.create({
        message: { type, content: { text: content } },
        users: [from, to],
        sender: from,
      });
    } else {
      // Handle invalid message types
      return res.status(400).json({ error: "Invalid message type" });
    }

    if (data) {
      res.json(data);
    } else {
      res.json({
        msg: "Failed to add message to the database",
        data: null,
      });
    }
  } catch (ex) {
    next(ex);
  }
};

// Helper function to get message content based on message type
const getMessageContent = (message) => {
  switch (message.type) {
    case "text":
      return { text: message?.content?.text };
    case "image":
      return { imageUrl: message?.content?.imageUrl };
    case "file":
      return {
        fileUrl: message?.content?.fileUrl,
      };
    case "voice":
      return {
        voiceUrl: message?.content?.voiceUrl,
      };
    case "video":
      return { videoUrl: message?.content?.videoUrl };
    default:
      return null;
  }
};
export const addImgMsg = async (req, res) => {
  const imageBuffer = req.file.buffer;
  const fromUserId = req.body.from;
  const toUserId = req.body.to;

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);


  const folderPath = path.join(__dirname, "../../client/", "public", "images");

  // Create the folder if it doesn't exist
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath);
  }

  // Use the original file extension
  const fileExtension = req.file.originalname.split(".").pop();

  // Generate a unique filename for the image
  const fileName = `image_${Date.now()}.${fileExtension}`;

  // Set the complete path for saving the image
  const imagePath = path.join(folderPath, fileName);

  // Save the image
  fs.writeFileSync(imagePath, imageBuffer);
alert("imagepath",imagePath)
  // Create a ew Message document
  const newMessage = new Messages({
    message: {
      type: "image",
      content: {
        imageUrl: imagePath,
      },
    },
    users: [fromUserId, toUserId],
    sender: fromUserId,
  });

  // Save the new Message document to the database
  const savedMessage = await newMessage.save();

  // Send response
  res.json({ success: true });
};
export const filemsg = async (req, res) => {
  try {
    const fileBuffer = req.file.buffer;
    const fromUserId = req.body.from;
    const toUserId = req.body.to;
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    // Set the path to your desired folder
    const folderPath = path.join(__dirname, "../../client/public", "files");

    // Create the folder if it doesn't exist
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath);
    }
    const mimeType = mime.lookup(req.file.originalname);
    const fileExtension = mime.extension(mimeType);
    const uniqueFilename = `${uuidv4()}.${fileExtension}`;
    const filePath = path.join(folderPath, uniqueFilename);

    // Save the file
    fs.writeFileSync(filePath, fileBuffer);

    // Create a new Message document
    const newMessage = new Messages({
      message: {
        type: "file",
        content: {
          fileUrl: `/files/${uniqueFilename}`, // URL based on the unique filename
        },
      },
      users: [fromUserId, toUserId],
      sender: fromUserId,
    });

    // Save the new Message document to the database
    await newMessage.save();

    // Send response
    res.json({ success: true });
  } catch (error) {
    console.error("Error handling file:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

export const voicemsg = async (req, res) => {
  const audioBuffer = req.file.buffer;
  const fromUserId = req.body.from;
  const toUserId = req.body.to;
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  // Set the path to your desired folder for voice recordings
  const voiceFolderPath = path.join(
    __dirname,
    "../../client/public",
    "voiceRecording"
  );

  // Create the folder if it doesn't exist
  if (!fs.existsSync(voiceFolderPath)) {
    fs.mkdirSync(voiceFolderPath);
  }

  // Generate a unique filename for the voice recording
  const fileName = `voice_${Date.now()}.wav`;

  // Set the complete path for saving the voice recording
  const voiceFilePath = path.join(voiceFolderPath, fileName);

  // Save the voice recording
  fs.writeFileSync(voiceFilePath, audioBuffer);

  // Create a new Message document
  const newMessage = new Messages({
    message: {
      type: "voice",
      content: {
        voiceUrl: voiceFilePath,
      },
    },
    users: [fromUserId, toUserId],
    sender: fromUserId,
  });

  // Save the new Message document to the database
  const savedMessage = await newMessage.save();

  res.status(200).json(savedMessage);
};

export const videomsg = async (req, res) => {
  try {
    const videoBuffer = req.file.buffer;
    const fromUserId = req.body.from;
    const toUserId = req.body.to;

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    // Set the path to your desired folder
    const folderPath = path.join(
      __dirname,
      "../../client/",
      "public",
      "videos"
    );

    // Create the folder if it doesn't exist
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath);
    }

    // Use the original file extension
    const fileExtension = req.file.originalname.split(".").pop();

    // Generate a unique filename for the video
    const fileName = `video_${Date.now()}.${fileExtension}`;

    // Set the complete path for saving the video
    const videoPath = path.join(folderPath, fileName);

    // Save the video asynchronously
    await fs.promises.writeFile(videoPath, videoBuffer);

    // Create a new Message document
    const newMessage = new Messages({
      message: {
        type: "video",
        content: {
          videoUrl: videoPath,
        },
      },
      users: [fromUserId, toUserId],
      sender: fromUserId,
    });

    const savedMessage = await newMessage.save();

    // Send response
    res.json({ success: true });
  } catch (error) {
    console.error("Error handling video:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};
export const markAsRead = async (req, res) => {
  const { chatId } = req.query;

  try {
    await Messages.updateMany(
      { users: { $all: [req.user.userId, chatId] }, isRead: false },
      { $set: { isRead: true } }
    );

    res.status(200).json({ success: true, message: "Chat marked as read" });
  } catch (error) {
    console.error("Error marking chat as read:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const fetchUnreadCount = async (req, res) => {
  try {
    const unreadCount = await Messages.countDocuments({
      users: req.user.userId,
      isRead: false,
    });

    // Send the unread count as a response
    res.json({ success: true, unreadCount });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};
export const fetchUnreadMsgSender = async (req, res) => {
 
  try {
    const unreadMessages = await Messages.find({
      users: req.params.userId,
      isRead: false,
    })
      .populate("sender", "firstName profileUrl")
      .select("message sender createdAt");
    res.status(200).json({ success: true, unreadMessages });
  } catch (error) {
    console.error("Error fetching unread messages:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
