import Messages from "../models/messageModel.js";
import { v4 as uMessagesuidv4 } from "uuid";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";
import mime from "mime-types";
import cloudinary from "cloudinary";
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

  // Upload the image to Cloudinary
  const uploadResponse = await cloudinary.v2.uploader
    .upload_stream(
      {
        resource_type: "image",
        public_id: `image_${Date.now()}`,
        format: "jpg",
      },
      async (error, result) => {
        if (error) {
          console.error("Error uploading image to Cloudinary:", error);
          res
            .status(500)
            .json({
              success: false,
              error: "Error uploading image to Cloudinary",
            });
        } else {
          const imageUrl = result.url;

          // Create a new Message document
          const newMessage = new Messages({
            message: {
              type: "image",
              content: {
                imageUrl: imageUrl,
              },
            },
            users: [fromUserId, toUserId],
            sender: fromUserId,
          });

          // Save the new Message document to the database
          try {
            const savedMessage = await newMessage.save();
            console.log("savedmsg", savedMessage);

            // Send response
            res.json({ success: true });
          } catch (error) {
            console.error("Error saving message to MongoDB:", error);
            res
              .status(500)
              .json({
                success: false,
                error: "Error saving message to MongoDB",
              });
          }
        }
      }
    )
    .end(imageBuffer);
};
export const filemsg = async (req, res) => {
  try {
    const fileBuffer = req.file.buffer;
    const fromUserId = req.body.from;
    const toUserId = req.body.to;

    // Upload the file to Cloudinary
    const uploadResponse = await cloudinary.v2.uploader
      .upload_stream(
        {
          resource_type: "raw",
          public_id: `file_${uuidv4()}`,
        },
        async (error, result) => {
          if (error) {
            console.error("Error uploading file to Cloudinary:", error);
            res
              .status(500)
              .json({
                success: false,
                error: "Error uploading file to Cloudinary",
              });
          } else {
            const fileUrl = result.url;

            // Create a new Message document
            const newMessage = new Messages({
              message: {
                type: "file",
                content: {
                  fileUrl: fileUrl,
                },
              },
              users: [fromUserId, toUserId],
              sender: fromUserId,
            });

            // Save the new Message document to the database
            try {
              await newMessage.save();

              // Send response
              res.json({ success: true });
            } catch (error) {
              console.error("Error saving message to MongoDB:", error);
              res
                .status(500)
                .json({
                  success: false,
                  error: "Error saving message to MongoDB",
                });
            }
          }
        }
      )
      .end(fileBuffer);
  } catch (error) {
    console.error("Error handling file:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

export const voicemsg = async (req, res) => {
  try {
    const audioBuffer = req.file.buffer;
    const fromUserId = req.body.from;
    const toUserId = req.body.to;

    // Upload the audio file to Cloudinary
    const uploadResponse = await cloudinary.v2.uploader
      .upload_stream(
        {
          resource_type: "auto",
          public_id: `voice_${Date.now()}`,
        },
        async (error, result) => {
          if (error) {
            console.error("Error uploading audio to Cloudinary:", error);
            res
              .status(500)
              .json({
                success: false,
                error: "Error uploading audio to Cloudinary",
              });
          } else {
            const voiceUrl = result.url;

            // Create a new Message document
            const newMessage = new Messages({
              message: {
                type: "voice",
                content: {
                  voiceUrl: voiceUrl,
                },
              },
              users: [fromUserId, toUserId],
              sender: fromUserId,
            });

            // Save the new Message document to the database
            try {
              const savedMessage = await newMessage.save();

              // Send response
              res.json(savedMessage);
            } catch (error) {
              console.error("Error saving message to MongoDB:", error);
              res
                .status(500)
                .json({
                  success: false,
                  error: "Error saving message to MongoDB",
                });
            }
          }
        }
      )
      .end(audioBuffer);
  } catch (error) {
    console.error("Error handling audio:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};



export const videomsg = async (req, res) => {
  try {
    const videoBuffer = req.file.buffer;
    const fromUserId = req.body.from;
    const toUserId = req.body.to;

    // Upload the video file to Cloudinary
    cloudinary.v2.uploader
      .upload_stream(
        {
          resource_type: "video",
          public_id: `video_${Date.now()}`,
        },
        async (error, result) => {
          if (error) {
            console.error("Error uploading video to Cloudinary:", error);
            return res
              .status(500)
              .json({
                success: false,
                error: "Error uploading video to Cloudinary",
              });
          }

          const videoUrl = result.secure_url; // Use secure_url instead of url

          // Create a new Message document
          const newMessage = new Messages({
            message: {
              type: "video",
              content: {
                videoUrl: videoUrl,
              },
            },
            users: [fromUserId, toUserId],
            sender: fromUserId,
          });

          // Save the new Message document to the database
          try {
            const savedMessage = await newMessage.save();

            // Send response
            res.json({ success: true });
          } catch (error) {
            console.error("Error saving message to MongoDB:", error);
            res
              .status(500)
              .json({
                success: false,
                error: "Error saving message to MongoDB",
              });
          }
        }
      )
      .end(videoBuffer);
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
